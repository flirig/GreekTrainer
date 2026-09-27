import express from 'express';
import db from '../db/database.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET all words
router.get('/', async (req, res) => {
  try {
    const database = await db.get();
    const words = await database.all('SELECT id, el, ru FROM words ORDER BY id');
    res.json(words);
  } catch (error) {
    console.error('❌ Error fetching words:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET word with variants and phrases
router.get('/:id', async (req, res) => {
  try {
    const database = await db.get();
    const word = await database.get(
      'SELECT id, el, ru, rule_id FROM words WHERE id = ?',
      [req.params.id]
    );

    if (!word) {
      return res.status(404).json({ error: 'Word not found' });
    }

    const variants = await database.all(
      'SELECT variant, type FROM word_variants WHERE word_id = ?',
      [req.params.id]
    );

    const phrases = await database.all(
      'SELECT p.id, p.el, p.ru FROM phrases p JOIN word_phrases wp ON p.id = wp.phrase_id WHERE wp.word_id = ?',
      [req.params.id]
    );

    const rule = word.rule_id ? await database.get(
      'SELECT id, name, description FROM grammar_rules WHERE id = ?',
      [word.rule_id]
    ) : null;

    res.json({
      id: word.id,
      el: word.el,
      ru: word.ru,
      rule,
      accents: variants.filter(v => v.type === 'accent').map(v => v.variant),
      mistakes: variants.filter(v => v.type === 'mistake').map(v => v.variant),
      phrases
    });
  } catch (error) {
    console.error('❌ Error fetching word:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST new word (admin only)
router.post('/', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { el, ru, ruleId, phraseIds = [], accents = [], mistakes = [] } = req.body;

    if (!el || !ru) {
      return res.status(400).json({ error: 'Missing required fields: el, ru' });
    }

    const database = await db.get();
    const result = await database.run(
      'INSERT INTO words (el, ru, rule_id) VALUES (?, ?, ?)',
      [el, ru, ruleId || null]
    );

    const wordId = result.lastID || (await database.get(
      'SELECT id FROM words WHERE el = ?',
      [el]
    ))?.id;

    // Insert variants
    for (const variant of accents) {
      await database.run(
        'INSERT INTO word_variants (word_id, variant, type) VALUES (?, ?, ?)',
        [wordId, variant, 'accent']
      );
    }

    for (const mistake of mistakes) {
      await database.run(
        'INSERT INTO word_variants (word_id, variant, type) VALUES (?, ?, ?)',
        [wordId, mistake, 'mistake']
      );
    }

    // Link to phrases
    for (const phraseId of phraseIds) {
      await database.run(
        'INSERT OR IGNORE INTO word_phrases (word_id, phrase_id) VALUES (?, ?)',
        [wordId, phraseId]
      );
    }

    res.status(201).json({
      id: wordId,
      el,
      ru,
      ruleId,
      accents,
      mistakes,
      phrases: phraseIds
    });
  } catch (error) {
    console.error('❌ Error creating word:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE word (admin only)
router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const database = await db.get();
    const result = await database.run(
      'DELETE FROM words WHERE id = ?',
      [req.params.id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Word not found' });
    }

    res.json({ message: 'Word deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting word:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// MORPHOLOGICAL API (NEW)
// ============================================

// Cache for paradigm rules (load once at startup)
let PARADIGM_CACHE = {};
let CACHE_LOADED = false;

async function loadParadigmCache() {
  if (CACHE_LOADED) return;

  try {
    const database = await db.get();

    // Load all paradigm rules
    const rulesQuery = `
      SELECT
        pr.id,
        p.code as paradigm_code,
        pr.tense,
        pr.person,
        pr.number,
        pr.ending,
        pr.example_form
      FROM paradigm_rules pr
      JOIN paradigms p ON pr.paradigm_id = p.id
      ORDER BY p.code
    `;

    const rules = await database.all(rulesQuery);

    // Index by paradigm code
    const paradigmCodesQuery = 'SELECT DISTINCT code FROM paradigms ORDER BY code';
    const paradigmCodes = await database.all(paradigmCodesQuery);

    paradigmCodes.forEach(p => {
      PARADIGM_CACHE[p.code] = [];
    });

    rules.forEach(r => {
      if (!PARADIGM_CACHE[r.paradigm_code]) {
        PARADIGM_CACHE[r.paradigm_code] = [];
      }
      PARADIGM_CACHE[r.paradigm_code].push(r);
    });

    CACHE_LOADED = true;
    console.log('✅ Paradigm cache loaded:', Object.keys(PARADIGM_CACHE).length, 'paradigms');
  } catch (e) {
    console.error('❌ Failed to load paradigm cache:', e.message);
  }
}

function extractStem(lemma, ending) {
  if (!ending) return lemma;
  if (lemma.endsWith(ending)) {
    return lemma.slice(0, -ending.length);
  }
  return lemma.slice(0, -2);
}

// POST /api/words/synthesize
// Generate Greek word form from lemma + morphological parameters
router.post('/synthesize', async (req, res) => {
  try {
    await loadParadigmCache();

    const { lemma, tense, person, number } = req.body;

    if (!lemma || !tense || !person || !number) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: lemma, tense, person, number'
      });
    }

    const database = await db.get();

    // 1. Find word
    const word = await database.get('SELECT id FROM words WHERE el = ?', [lemma]);

    if (!word) {
      return res.status(404).json({
        success: false,
        error: 'Word not found in lexicon',
        lemma
      });
    }

    // 2. Get word's paradigm
    const wordParadigm = await database.get(`
      SELECT p.code
      FROM word_paradigm wp
      JOIN paradigms p ON wp.paradigm_id = p.id
      WHERE wp.word_id = ?
    `, [word.id]);

    if (!wordParadigm) {
      return res.status(400).json({
        success: false,
        error: 'Word has no paradigm assigned',
        lemma
      });
    }

    const paradigmCode = wordParadigm.code;
    const paradigmRules = PARADIGM_CACHE[paradigmCode];

    if (!paradigmRules) {
      return res.status(500).json({
        success: false,
        error: 'Paradigm not found in cache',
        paradigmCode
      });
    }

    // 3. Find matching rule
    const rule = paradigmRules.find(r =>
      r.tense === tense &&
      r.person === person &&
      r.number === number
    );

    if (!rule) {
      return res.status(400).json({
        success: false,
        error: 'Rule not found for these parameters',
        paradigm: paradigmCode,
        tense,
        person,
        number
      });
    }

    // 4. Generate form
    const stem = extractStem(lemma, rule.ending);
    const form = stem + rule.ending;

    res.json({
      success: true,
      lemma,
      form,
      paradigm: paradigmCode,
      tense,
      person,
      number,
      confidence: 0.9,
      rule_applied: `stem (${stem}) + ending (${rule.ending})`
    });
  } catch (error) {
    console.error('❌ Synthesize error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/words/analyze
// Decompose a Greek word form into lemma + morphology
router.post('/analyze', async (req, res) => {
  try {
    await loadParadigmCache();

    const { form } = req.body;

    if (!form) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameter: form'
      });
    }

    const database = await db.get();

    // 1. Check if it's a lemma (word in database)
    const word = await database.get('SELECT id, el as lemma FROM words WHERE el = ?', [form]);

    if (word) {
      const paradigm = await database.get(`
        SELECT p.code
        FROM word_paradigm wp
        JOIN paradigms p ON wp.paradigm_id = p.id
        WHERE wp.word_id = ?
      `, [word.id]);

      return res.json({
        success: true,
        form,
        lemma: word.lemma,
        paradigm: paradigm?.code || null,
        morphology: { type: 'lemma' },
        confidence: 1.0
      });
    }

    // 2. Search in paradigm rules (generated forms)
    let bestMatch = null;

    for (const [paradigmCode, rules] of Object.entries(PARADIGM_CACHE)) {
      const rule = rules.find(r => r.example_form === form);
      if (rule) {
        bestMatch = { paradigmCode, rule };
        break;
      }
    }

    if (bestMatch) {
      // Try to find a lemma with this paradigm
      const lemmaRecord = await database.get(`
        SELECT w.el as lemma
        FROM word_paradigm wp
        JOIN paradigms p ON wp.paradigm_id = p.id
        JOIN words w ON wp.word_id = w.id
        WHERE p.code = ?
        LIMIT 1
      `, [bestMatch.paradigmCode]);

      return res.json({
        success: true,
        form,
        lemma: lemmaRecord?.lemma || 'unknown',
        paradigm: bestMatch.paradigmCode,
        morphology: {
          tense: bestMatch.rule.tense,
          person: bestMatch.rule.person,
          number: bestMatch.rule.number
        },
        confidence: 0.85
      });
    }

    // Not found
    res.status(404).json({
      success: false,
      error: 'Form not recognized in database',
      form,
      suggestions: ['Check spelling', 'Try with accents']
    });
  } catch (error) {
    console.error('❌ Analyze error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/admin/setup-paradigms
// Create paradigm tables and link words
router.post('/admin/setup-paradigms', async (req, res) => {
  try {
    const database = await db.get();

    const PARADIGMS = [
      { code: 'Ρ10.1', name: 'Verb Class 10 Variant 1', type: 'verb' },
      { code: 'Ρ10.10', name: 'Verb Class 10 Variant 10', type: 'verb' },
      { code: 'Ρ2.1', name: 'Verb Class 2 Variant 1', type: 'verb' },
      { code: 'Ρ5.2', name: 'Verb Class 5 Variant 2', type: 'verb' }
    ];

    // Create tables
    await database.run(`CREATE TABLE IF NOT EXISTS paradigms (id INTEGER PRIMARY KEY, code TEXT UNIQUE, name TEXT, type TEXT)`);
    await database.run(`CREATE TABLE IF NOT EXISTS paradigm_rules (id INTEGER PRIMARY KEY, paradigm_id INTEGER, tense TEXT, person TEXT, number TEXT, ending TEXT, example_form TEXT)`);
    await database.run(`CREATE TABLE IF NOT EXISTS word_paradigm (id INTEGER PRIMARY KEY, word_id INTEGER UNIQUE, paradigm_id INTEGER)`);

    // Insert paradigms
    for (const p of PARADIGMS) {
      await database.run('INSERT INTO paradigms (code, name, type) VALUES (?, ?, ?) ON CONFLICT (code) DO NOTHING', [p.code, p.name, p.type]);
    }

    // Insert rules
    const rules = [
      ['Ρ10.1', 'present', '1st', 'singular', 'ώ', 'αγαπώ'],
      ['Ρ10.1', 'present', '2nd', 'singular', 'άς', 'αγαπάς'],
      ['Ρ10.1', 'present', '3rd', 'singular', 'ά', 'αγαπά'],
      ['Ρ10.1', 'present', '1st', 'plural', 'ούμε', 'αγαπούμε'],
      ['Ρ10.1', 'present', '2nd', 'plural', 'άτε', 'αγαπάτε'],
      ['Ρ10.1', 'present', '3rd', 'plural', 'ούν', 'αγαπούν'],
      ['Ρ10.10', 'present', '1st', 'singular', 'ώ', 'μπορώ'],
      ['Ρ10.10', 'present', '2nd', 'singular', 'είς', 'μπορείς'],
      ['Ρ10.10', 'present', '3rd', 'singular', 'εί', 'μπορεί'],
      ['Ρ10.10', 'present', '1st', 'plural', 'ούμε', 'μπορούμε'],
      ['Ρ10.10', 'present', '2nd', 'plural', 'είτε', 'μπορείτε'],
      ['Ρ10.10', 'present', '3rd', 'plural', 'ούν', 'μπορούν'],
      ['Ρ2.1', 'present', '1st', 'singular', 'ω', 'διαβάζω'],
      ['Ρ2.1', 'present', '2nd', 'singular', 'εις', 'διαβάζεις'],
      ['Ρ2.1', 'present', '3rd', 'singular', 'ει', 'διαβάζει'],
      ['Ρ2.1', 'present', '1st', 'plural', 'ουμε', 'διαβάζουμε'],
      ['Ρ2.1', 'present', '2nd', 'plural', 'ετε', 'διαβάζετε'],
      ['Ρ2.1', 'present', '3rd', 'plural', 'ουν', 'διαβάζουν'],
      ['Ρ5.2', 'present', '1st', 'singular', 'ω', 'δουλεύω'],
      ['Ρ5.2', 'present', '2nd', 'singular', 'εις', 'δουλεύεις'],
      ['Ρ5.2', 'present', '3rd', 'singular', 'ει', 'δουλεύει'],
      ['Ρ5.2', 'present', '1st', 'plural', 'ουμε', 'δουλεύουμε'],
      ['Ρ5.2', 'present', '2nd', 'plural', 'ετε', 'δουλεύετε'],
      ['Ρ5.2', 'present', '3rd', 'plural', 'ουν', 'δουλεύουν']
    ];

    for (const [pcode, tense, person, number, ending, example] of rules) {
      const p = await database.get('SELECT id FROM paradigms WHERE code = ?', [pcode]);
      if (p) {
        await database.run('INSERT INTO paradigm_rules (paradigm_id, tense, person, number, ending, example_form) VALUES (?, ?, ?, ?, ?, ?)',
          [p.id, tense, person, number, ending, example]);
      }
    }

    // Link words to paradigms
    const links = [['αγαπώ', 'Ρ10.1'], ['μπορώ', 'Ρ10.10'], ['δουλεύω', 'Ρ5.2'], ['διαβάζω', 'Ρ2.1']];
    for (const [lemma, pcode] of links) {
      const word = await database.get('SELECT id FROM words WHERE el = ?', [lemma]);
      const p = await database.get('SELECT id FROM paradigms WHERE code = ?', [pcode]);
      if (word && p) {
        await database.run('INSERT INTO word_paradigm (word_id, paradigm_id) VALUES (?, ?) ON CONFLICT (word_id) DO NOTHING', [word.id, p.id]);
      }
    }

    res.json({ success: true, message: 'Paradigms setup complete' });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// POST /api/admin/import-lexicon
// Temporary endpoint to import 50 words
router.post('/admin/import-lexicon', async (req, res) => {
  try {
    const WORDS = [
      {el:'αγαπώ',ru:'to love'},{el:'μπορώ',ru:'can'},{el:'δουλεύω',ru:'to work'},{el:'διαβάζω',ru:'to read'},
      {el:'γράφω',ru:'to write'},{el:'ακούω',ru:'to listen'},{el:'βλέπω',ru:'to see'},{el:'έρχομαι',ru:'to come'},
      {el:'πηγαίνω',ru:'to go'},{el:'θέλω',ru:'to want'},{el:'κάνω',ru:'to do/make'},{el:'δίνω',ru:'to give'},
      {el:'παίρνω',ru:'to take'},{el:'βρίσκω',ru:'to find'},{el:'ξέρω',ru:'to know'},{el:'λέω',ru:'to say'},
      {el:'έχω',ru:'to have'},{el:'είμαι',ru:'to be'},{el:'τρώω',ru:'to eat'},{el:'πίνω',ru:'to drink'},
      {el:'κοιμάμαι',ru:'to sleep'},{el:'τρέχω',ru:'to run'},{el:'περπατώ',ru:'to walk'},{el:'βαδίζω',ru:'to walk'},
      {el:'πηδώ',ru:'to jump'},{el:'χορεύω',ru:'to dance'},{el:'τραγουδώ',ru:'to sing'},{el:'μουσικός',ru:'musician'},
      {el:'χρώμα',ru:'color'},{el:'μάτι',ru:'eye'},{el:'αυτί',ru:'ear'},{el:'στόμα',ru:'mouth'},
      {el:'δόντι',ru:'tooth'},{el:'μαλλί',ru:'hair'},{el:'χέρι',ru:'hand'},{el:'πόδι',ru:'foot'},
      {el:'κεφάλι',ru:'head'},{el:'καρδιά',ru:'heart'},{el:'άσπρο',ru:'white'},{el:'μαύρο',ru:'black'},
      {el:'κόκκινο',ru:'red'},{el:'μπλε',ru:'blue'},{el:'πράσινο',ru:'green'},{el:'κίτρινο',ru:'yellow'},
      {el:'πορτοκαλί',ru:'orange'},{el:'ιώδες',ru:'purple'},{el:'ροζ',ru:'pink'},{el:'γκρι',ru:'gray'},
      {el:'καφέ',ru:'brown'},{el:'ήλιος',ru:'sun'},{el:'φεγγάρι',ru:'moon'}
    ];

    const database = await db.get();
    let imported = 0;

    for (const word of WORDS) {
      try {
        await database.run(
          'INSERT INTO words (el, ru) VALUES (?, ?) ON CONFLICT DO NOTHING',
          [word.el, word.ru]
        );
        imported++;
      } catch(e) {}
    }

    res.json({
      success: true,
      imported,
      message: `Imported ${imported} words`
    });
  } catch (error) {
    console.error('❌ Import error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/words/validate
// Check grammatical agreement in a phrase
router.post('/validate', async (req, res) => {
  try {
    const { phrase } = req.body;

    if (!Array.isArray(phrase)) {
      return res.status(400).json({
        success: false,
        error: 'Phrase must be an array of words'
      });
    }

    if (phrase.length === 0) {
      return res.json({
        success: true,
        phrase,
        valid: true,
        errors: []
      });
    }

    // TODO: Implement full agreement checking
    // For now: basic validation
    res.json({
      success: true,
      phrase,
      valid: true,
      agreement: {
        note: 'Agreement validation coming soon'
      },
      errors: []
    });
  } catch (error) {
    console.error('❌ Validate error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
