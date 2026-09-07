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

export default router;
