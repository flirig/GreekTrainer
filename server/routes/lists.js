import express from 'express';
import db from '../db/database.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET all lists
router.get('/', async (req, res) => {
  try {
    const database = await db.get();
    const lists = await database.all('SELECT id, title, description FROM word_lists ORDER BY id');
    res.json(lists);
  } catch (error) {
    console.error('❌ Error fetching lists:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET list with phrases and words
router.get('/:id', async (req, res) => {
  try {
    const database = await db.get();
    const list = await database.get(
      'SELECT id, title, description FROM word_lists WHERE id = ?',
      [req.params.id]
    );

    if (!list) {
      return res.status(404).json({ error: 'List not found' });
    }

    const phrases = await database.all(`
      SELECT p.id, p.el, p.ru FROM phrases p
      JOIN list_phrases lp ON p.id = lp.phrase_id
      WHERE lp.list_id = ?
      ORDER BY lp.order_index
    `, [req.params.id]);

    const words = await database.all(`
      SELECT w.id, w.el, w.ru FROM words w
      JOIN list_words lw ON w.id = lw.word_id
      WHERE lw.list_id = ?
      ORDER BY lw.order_index
    `, [req.params.id]);

    res.json({
      ...list,
      phrases,
      words
    });
  } catch (error) {
    console.error('❌ Error fetching list:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST new list (admin only)
router.post('/', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const database = await db.get();
    const result = await database.run(
      'INSERT INTO word_lists (title, description) VALUES (?, ?)',
      [title, description || null]
    );

    const listId = result.lastID || (await database.get(
      'SELECT id FROM word_lists WHERE title = ?',
      [title]
    ))?.id;

    res.status(201).json({
      id: listId,
      title,
      description,
      phrases: [],
      words: []
    });
  } catch (error) {
    console.error('❌ Error creating list:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT add phrase to list (admin only)
router.put('/:id/phrases/:phraseId', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id, phraseId } = req.params;
    const database = await db.get();

    // Check if list exists
    const list = await database.get('SELECT id FROM word_lists WHERE id = ?', [id]);
    if (!list) {
      return res.status(404).json({ error: 'List not found' });
    }

    // Check if phrase exists
    const phrase = await database.get('SELECT id FROM phrases WHERE id = ?', [phraseId]);
    if (!phrase) {
      return res.status(404).json({ error: 'Phrase not found' });
    }

    // Add phrase to list
    await database.run(
      'INSERT OR IGNORE INTO list_phrases (list_id, phrase_id) VALUES (?, ?)',
      [id, phraseId]
    );

    res.json({ message: 'Phrase added to list' });
  } catch (error) {
    console.error('❌ Error adding phrase to list:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT add word to list (admin only)
router.put('/:id/words/:wordId', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id, wordId } = req.params;
    const database = await db.get();

    // Check if list exists
    const list = await database.get('SELECT id FROM word_lists WHERE id = ?', [id]);
    if (!list) {
      return res.status(404).json({ error: 'List not found' });
    }

    // Check if word exists
    const word = await database.get('SELECT id FROM words WHERE id = ?', [wordId]);
    if (!word) {
      return res.status(404).json({ error: 'Word not found' });
    }

    // Add word to list
    await database.run(
      'INSERT OR IGNORE INTO list_words (list_id, word_id) VALUES (?, ?)',
      [id, wordId]
    );

    res.json({ message: 'Word added to list' });
  } catch (error) {
    console.error('❌ Error adding word to list:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE phrase from list (admin only)
router.delete('/:id/phrases/:phraseId', verifyToken, requireAdmin, async (req, res) => {
  try {
    const database = await db.get();
    await database.run(
      'DELETE FROM list_phrases WHERE list_id = ? AND phrase_id = ?',
      [req.params.id, req.params.phraseId]
    );

    res.json({ message: 'Phrase removed from list' });
  } catch (error) {
    console.error('❌ Error removing phrase from list:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE word from list (admin only)
router.delete('/:id/words/:wordId', verifyToken, requireAdmin, async (req, res) => {
  try {
    const database = await db.get();
    await database.run(
      'DELETE FROM list_words WHERE list_id = ? AND word_id = ?',
      [req.params.id, req.params.wordId]
    );

    res.json({ message: 'Word removed from list' });
  } catch (error) {
    console.error('❌ Error removing word from list:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE list (admin only)
router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const database = await db.get();
    const result = await database.run(
      'DELETE FROM word_lists WHERE id = ?',
      [req.params.id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'List not found' });
    }

    res.json({ message: 'List deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting list:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
