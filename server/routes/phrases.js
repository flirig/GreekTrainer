import express from 'express';
import db from '../db/database.js';

const router = express.Router();

// GET all phrases
router.get('/', async (req, res) => {
  try {
    const database = await db.get();
    console.log('📚 Fetching phrases from database...');

    const phrases = await database.all('SELECT id, el, ru FROM phrases ORDER BY id');

    console.log(`✅ Found ${phrases.length} phrases`);
    res.json(phrases);
  } catch (error) {
    console.error('❌ Error fetching phrases:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET phrase with variants and mistakes
router.get('/:id', async (req, res) => {
  try {
    const database = await db.get();

    const phrase = await database.get(
      'SELECT id, el, ru FROM phrases WHERE id = ?',
      [req.params.id]
    );

    if (!phrase) {
      return res.status(404).json({ error: 'Phrase not found' });
    }

    const accents = await database.all(
      'SELECT variant FROM accent_variants WHERE phrase_id = ?',
      [req.params.id]
    );

    const mistakes = await database.all(
      'SELECT variant FROM mistakes WHERE phrase_id = ?',
      [req.params.id]
    );

    res.json({
      ...phrase,
      wAccents: accents.map(a => a.variant),
      mistakes: mistakes.map(m => m.variant)
    });
  } catch (error) {
    console.error('❌ Error fetching phrase:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST new phrase
router.post('/', async (req, res) => {
  try {
    const { el, ru, wAccents = [], mistakes = [] } = req.body;

    if (!el || !ru) {
      return res.status(400).json({ error: 'Missing required fields: el, ru' });
    }

    const database = await db.get();

    const result = await database.run(
      'INSERT INTO phrases (el, ru) VALUES (?, ?)',
      [el, ru]
    );

    const phraseId = result.lastID || (await database.get(
      'SELECT id FROM phrases WHERE el = ?',
      [el]
    ))?.id;

    if (!phraseId) {
      throw new Error('Failed to create phrase');
    }

    // Insert accent variants
    for (const variant of wAccents) {
      await database.run(
        'INSERT INTO accent_variants (phrase_id, variant) VALUES (?, ?)',
        [phraseId, variant]
      );
    }

    // Insert mistakes
    for (const mistake of mistakes) {
      await database.run(
        'INSERT INTO mistakes (phrase_id, variant) VALUES (?, ?)',
        [phraseId, mistake]
      );
    }

    res.status(201).json({
      id: phraseId,
      el,
      ru,
      wAccents,
      mistakes
    });
  } catch (error) {
    console.error('❌ Error creating phrase:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE phrase
router.delete('/:id', async (req, res) => {
  try {
    const database = await db.get();

    const result = await database.run(
      'DELETE FROM phrases WHERE id = ?',
      [req.params.id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Phrase not found' });
    }

    res.json({ message: 'Phrase deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting phrase:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
