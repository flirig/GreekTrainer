/**
 * Migration 003: Add Paradigm Support
 *
 * Creates tables for storing Greek language paradigms:
 * - paradigms: Grammar classes (Ρ10.1, Δ2.1, etc.)
 * - paradigm_rules: Conjugation/declension rules per paradigm
 * - word_paradigm: Links words to their paradigm class
 *
 * Data source: Triantafyllides scraper (50 words, 4 paradigms)
 */

// Paradigm definitions (from scraped data)
const PARADIGMS = [
  {
    code: 'Ρ10.1',
    name: 'Verb Class 10 Variant 1',
    type: 'verb',
    description: 'Present active verbs ending in -ώ (e.g., αγαπώ)',
    examples: ['αγαπώ']
  },
  {
    code: 'Ρ10.10',
    name: 'Verb Class 10 Variant 10',
    type: 'verb',
    description: 'Present active verbs ending in -ώ with stressed stem',
    examples: ['μπορώ']
  },
  {
    code: 'Ρ2.1',
    name: 'Verb Class 2 Variant 1',
    type: 'verb',
    description: 'Present active verbs with stem change pattern',
    examples: ['διαβάζω']
  },
  {
    code: 'Ρ5.2',
    name: 'Verb Class 5 Variant 2',
    type: 'verb',
    description: 'Present active verbs with regular conjugation',
    examples: ['δουλεύω']
  }
];

// Conjugation rules per paradigm
const PARADIGM_RULES = [
  // Ρ10.1: αγαπώ pattern
  // Present tense conjugation
  { paradigm_code: 'Ρ10.1', tense: 'present', person: '1st', number: 'singular', ending: 'ώ', rule: 'stem + ώ', example: 'αγαπώ' },
  { paradigm_code: 'Ρ10.1', tense: 'present', person: '2nd', number: 'singular', ending: 'άς', rule: 'stem + άς', example: 'αγαπάς' },
  { paradigm_code: 'Ρ10.1', tense: 'present', person: '3rd', number: 'singular', ending: 'ά', rule: 'stem + ά', example: 'αγαπά' },
  { paradigm_code: 'Ρ10.1', tense: 'present', person: '1st', number: 'plural', ending: 'ούμε', rule: 'stem + ούμε', example: 'αγαπούμε' },
  { paradigm_code: 'Ρ10.1', tense: 'present', person: '2nd', number: 'plural', ending: 'άτε', rule: 'stem + άτε', example: 'αγαπάτε' },
  { paradigm_code: 'Ρ10.1', tense: 'present', person: '3rd', number: 'plural', ending: 'ούν', rule: 'stem + ούν', example: 'αγαπούν' },

  // Ρ10.10: μπορώ pattern (similar but different stress)
  { paradigm_code: 'Ρ10.10', tense: 'present', person: '1st', number: 'singular', ending: 'ώ', rule: 'stem + ώ', example: 'μπορώ' },
  { paradigm_code: 'Ρ10.10', tense: 'present', person: '2nd', number: 'singular', ending: 'είς', rule: 'stem + είς', example: 'μπορείς' },
  { paradigm_code: 'Ρ10.10', tense: 'present', person: '3rd', number: 'singular', ending: 'εί', rule: 'stem + εί', example: 'μπορεί' },
  { paradigm_code: 'Ρ10.10', tense: 'present', person: '1st', number: 'plural', ending: 'ούμε', rule: 'stem + ούμε', example: 'μπορούμε' },
  { paradigm_code: 'Ρ10.10', tense: 'present', person: '2nd', number: 'plural', ending: 'είτε', rule: 'stem + είτε', example: 'μπορείτε' },
  { paradigm_code: 'Ρ10.10', tense: 'present', person: '3rd', number: 'plural', ending: 'ούν', rule: 'stem + ούν', example: 'μπορούν' },

  // Ρ2.1: διαβάζω pattern
  { paradigm_code: 'Ρ2.1', tense: 'present', person: '1st', number: 'singular', ending: 'ω', rule: 'stem + ω', example: 'διαβάζω' },
  { paradigm_code: 'Ρ2.1', tense: 'present', person: '2nd', number: 'singular', ending: 'εις', rule: 'stem + εις', example: 'διαβάζεις' },
  { paradigm_code: 'Ρ2.1', tense: 'present', person: '3rd', number: 'singular', ending: 'ει', rule: 'stem + ει', example: 'διαβάζει' },
  { paradigm_code: 'Ρ2.1', tense: 'present', person: '1st', number: 'plural', ending: 'ουμε', rule: 'stem + ουμε', example: 'διαβάζουμε' },
  { paradigm_code: 'Ρ2.1', tense: 'present', person: '2nd', number: 'plural', ending: 'ετε', rule: 'stem + ετε', example: 'διαβάζετε' },
  { paradigm_code: 'Ρ2.1', tense: 'present', person: '3rd', number: 'plural', ending: 'ουν', rule: 'stem + ουν', example: 'διαβάζουν' },

  // Ρ5.2: δουλεύω pattern
  { paradigm_code: 'Ρ5.2', tense: 'present', person: '1st', number: 'singular', ending: 'ω', rule: 'stem + ω', example: 'δουλεύω' },
  { paradigm_code: 'Ρ5.2', tense: 'present', person: '2nd', number: 'singular', ending: 'εις', rule: 'stem + εις', example: 'δουλεύεις' },
  { paradigm_code: 'Ρ5.2', tense: 'present', person: '3rd', number: 'singular', ending: 'ει', rule: 'stem + ει', example: 'δουλεύει' },
  { paradigm_code: 'Ρ5.2', tense: 'present', person: '1st', number: 'plural', ending: 'ουμε', rule: 'stem + ουμε', example: 'δουλεύουμε' },
  { paradigm_code: 'Ρ5.2', tense: 'present', person: '2nd', number: 'plural', ending: 'ετε', rule: 'stem + ετε', example: 'δουλεύετε' },
  { paradigm_code: 'Ρ5.2', tense: 'present', person: '3rd', number: 'plural', ending: 'ουν', rule: 'stem + ουν', example: 'δουλεύουν' }
];

// Word-to-paradigm mappings (from scraped data + manual verification)
const WORD_PARADIGM_MAP = {
  'είμαι': null,        // Irregular - handle later
  'έχω': null,          // Irregular - handle later
  'κάνω': null,         // Irregular - handle later
  'πηγαίνω': null,      // Irregular - handle later
  'λέω': null,          // Irregular - handle later
  'δίνω': null,         // Irregular - handle later
  'βρίσκω': null,       // Irregular - handle later
  'ξέρω': null,         // Irregular - handle later
  'θέλω': null,         // Irregular - handle later
  'μπορώ': 'Ρ10.10',    // ✓ Confirmed
  'μένω': null,         // Irregular - handle later
  'έρχομαι': null,      // Irregular - handle later
  'δουλεύω': 'Ρ5.2',    // ✓ Confirmed
  'αγαπώ': 'Ρ10.1',     // ✓ Confirmed
  'ακούω': null,        // Irregular - handle later
  'βλέπω': null,        // Irregular - handle later
  'γράφω': null,        // Irregular - handle later
  'διαβάζω': 'Ρ2.1',    // ✓ Confirmed
  'τρώω': null,         // Irregular - handle later
  'πίνω': null          // Irregular - handle later
  // Nouns don't have paradigm codes yet - use null
};

export async function up(db) {
  console.log('📚 Migration 003: Adding paradigm support...\n');

  // 1. Create paradigms table
  console.log('📋 Creating paradigms table...');
  const paradigmsSchema = `
    CREATE TABLE IF NOT EXISTS paradigms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      description TEXT,
      examples TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  if (db.constructor.name === 'Client') {
    // PostgreSQL
    await db.query(paradigmsSchema.replace('AUTOINCREMENT', 'SERIAL'));
  } else {
    // SQLite
    await db.run(paradigmsSchema);
  }

  // 2. Create paradigm_rules table
  console.log('📋 Creating paradigm_rules table...');
  const rulesSchema = `
    CREATE TABLE IF NOT EXISTS paradigm_rules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      paradigm_id INTEGER NOT NULL REFERENCES paradigms(id) ON DELETE CASCADE,
      tense TEXT,
      person TEXT,
      number TEXT,
      case_name TEXT,
      gender TEXT,
      ending TEXT NOT NULL,
      rule_description TEXT,
      example_form TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  if (db.constructor.name === 'Client') {
    // PostgreSQL
    await db.query(rulesSchema.replace('AUTOINCREMENT', 'SERIAL'));
  } else {
    // SQLite
    await db.run(rulesSchema);
  }

  // 3. Create word_paradigm table (linking words to paradigms)
  console.log('📋 Creating word_paradigm table...');
  const wordParadigmSchema = `
    CREATE TABLE IF NOT EXISTS word_paradigm (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      word_id INTEGER NOT NULL UNIQUE REFERENCES words(id) ON DELETE CASCADE,
      paradigm_id INTEGER REFERENCES paradigms(id) ON DELETE SET NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  if (db.constructor.name === 'Client') {
    // PostgreSQL
    await db.query(wordParadigmSchema.replace('AUTOINCREMENT', 'SERIAL'));
  } else {
    // SQLite
    await db.run(wordParadigmSchema);
  }

  // 4. Insert paradigms
  console.log('💾 Inserting paradigms...');
  for (const paradigm of PARADIGMS) {
    const sql = `
      INSERT OR IGNORE INTO paradigms (code, name, type, description, examples)
      VALUES (?, ?, ?, ?, ?)
    `;
    const params = [
      paradigm.code,
      paradigm.name,
      paradigm.type,
      paradigm.description,
      JSON.stringify(paradigm.examples)
    ];

    if (db.constructor.name === 'Client') {
      // PostgreSQL
      await db.query(
        'INSERT INTO paradigms (code, name, type, description, examples) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (code) DO NOTHING',
        params
      );
    } else {
      // SQLite
      await db.run(sql, params);
    }
  }
  console.log(`   ✅ ${PARADIGMS.length} paradigms inserted\n`);

  // 5. Insert paradigm rules
  console.log('💾 Inserting paradigm rules...');
  let rulesInserted = 0;

  for (const rule of PARADIGM_RULES) {
    // Get paradigm_id
    let paradigmId;
    const paradigmQuery = 'SELECT id FROM paradigms WHERE code = ?';
    const paradigmResult = db.constructor.name === 'Client'
      ? await db.query('SELECT id FROM paradigms WHERE code = $1', [rule.paradigm_code])
      : await new Promise((resolve, reject) => {
          db.get(paradigmQuery, [rule.paradigm_code], (err, row) => {
            if (err) reject(err);
            resolve(row);
          });
        });

    paradigmId = db.constructor.name === 'Client'
      ? paradigmResult.rows[0]?.id
      : paradigmResult?.id;

    if (!paradigmId) {
      console.warn(`⚠️ Paradigm not found: ${rule.paradigm_code}`);
      continue;
    }

    const sql = `
      INSERT INTO paradigm_rules
      (paradigm_id, tense, person, number, ending, rule_description, example_form)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      paradigmId,
      rule.tense,
      rule.person || null,
      rule.number,
      rule.ending,
      rule.rule,
      rule.example
    ];

    if (db.constructor.name === 'Client') {
      // PostgreSQL
      await db.query(
        `INSERT INTO paradigm_rules
         (paradigm_id, tense, person, number, ending, rule_description, example_form)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        params
      );
    } else {
      // SQLite
      await db.run(sql, params);
    }

    rulesInserted++;
  }
  console.log(`   ✅ ${rulesInserted} rules inserted\n`);

  // 6. Link words to paradigms
  console.log('💾 Linking words to paradigms...');
  let wordsLinked = 0;

  for (const [lemma, paradigmCode] of Object.entries(WORD_PARADIGM_MAP)) {
    if (!paradigmCode) continue; // Skip unmapped words

    // Get word_id
    let wordId;
    const wordQuery = 'SELECT id FROM words WHERE el = ?';
    const wordResult = db.constructor.name === 'Client'
      ? await db.query('SELECT id FROM words WHERE el = $1', [lemma])
      : await new Promise((resolve, reject) => {
          db.get(wordQuery, [lemma], (err, row) => {
            if (err) reject(err);
            resolve(row);
          });
        });

    wordId = db.constructor.name === 'Client'
      ? wordResult.rows[0]?.id
      : wordResult?.id;

    if (!wordId) {
      console.warn(`⚠️ Word not found: ${lemma}`);
      continue;
    }

    // Get paradigm_id
    let paradigmId;
    const paradigmQuery2 = 'SELECT id FROM paradigms WHERE code = ?';
    const paradigmResult2 = db.constructor.name === 'Client'
      ? await db.query('SELECT id FROM paradigms WHERE code = $1', [paradigmCode])
      : await new Promise((resolve, reject) => {
          db.get(paradigmQuery2, [paradigmCode], (err, row) => {
            if (err) reject(err);
            resolve(row);
          });
        });

    paradigmId = db.constructor.name === 'Client'
      ? paradigmResult2.rows[0]?.id
      : paradigmResult2?.id;

    if (!paradigmId) {
      console.warn(`⚠️ Paradigm not found: ${paradigmCode}`);
      continue;
    }

    const sql = 'INSERT OR IGNORE INTO word_paradigm (word_id, paradigm_id) VALUES (?, ?)';

    if (db.constructor.name === 'Client') {
      // PostgreSQL
      await db.query(
        'INSERT INTO word_paradigm (word_id, paradigm_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [wordId, paradigmId]
      );
    } else {
      // SQLite
      await db.run(sql, [wordId, paradigmId]);
    }

    wordsLinked++;
  }
  console.log(`   ✅ ${wordsLinked} words linked to paradigms\n`);

  console.log('✅ Migration 003 complete!');
  console.log('   - paradigms: 4 rows');
  console.log('   - paradigm_rules: 24 rows');
  console.log(`   - word_paradigm: ${wordsLinked} rows\n`);
}

export async function down(db) {
  console.log('🔄 Rolling back migration 003...');

  const tables = ['word_paradigm', 'paradigm_rules', 'paradigms'];

  for (const table of tables) {
    const sql = `DROP TABLE IF EXISTS ${table}`;

    if (db.constructor.name === 'Client') {
      // PostgreSQL
      await db.query(sql);
    } else {
      // SQLite
      await db.run(sql);
    }
  }

  console.log('✅ Rollback complete');
}
