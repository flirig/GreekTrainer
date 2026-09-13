import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import db from '../db/database.js';

const router = express.Router();

// Get all system categories
router.get('/system', async (req, res) => {
  try {
    const database = await db.get();
    const categories = await database.all(
      'SELECT id, name, icon FROM word_categories WHERE is_system = ? ORDER BY name',
      [1]
    );
    res.json(categories);
  } catch (error) {
    console.error('❌ Error fetching system categories:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get user's custom categories
router.get('/user', verifyToken, async (req, res) => {
  try {
    const database = await db.get();
    const categories = await database.all(
      'SELECT id, name, icon FROM user_word_categories WHERE user_id = ? ORDER BY name',
      [req.userId]
    );
    res.json(categories);
  } catch (error) {
    console.error('❌ Error fetching user categories:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create custom category
router.post('/user', verifyToken, async (req, res) => {
  const { name, icon } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Category name is required' });
  }

  try {
    const database = await db.get();
    const result = await database.run(
      'INSERT INTO user_word_categories (user_id, name, icon) VALUES (?, ?, ?)',
      [req.userId, name, icon || '📚']
    );

    const category = await database.get(
      'SELECT id, name, icon FROM user_word_categories WHERE id = ?',
      [result.lastID]
    );

    res.status(201).json(category);
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'Category with this name already exists' });
    }
    console.error('❌ Error creating category:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete custom category
router.delete('/user/:id', verifyToken, async (req, res) => {
  try {
    const database = await db.get();

    // Verify ownership
    const category = await database.get(
      'SELECT user_id FROM user_word_categories WHERE id = ?',
      [req.params.id]
    );

    if (!category || category.user_id !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await database.run(
      'DELETE FROM user_word_categories WHERE id = ?',
      [req.params.id]
    );

    res.json({ message: 'Category deleted' });
  } catch (error) {
    console.error('❌ Error deleting category:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get words by category
router.get('/:categoryId/words', async (req, res) => {
  try {
    const database = await db.get();
    const words = await database.all(
      'SELECT id, el, ru FROM words WHERE category_id = ? ORDER BY el',
      [req.params.categoryId]
    );
    res.json(words);
  } catch (error) {
    console.error('❌ Error fetching words by category:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
