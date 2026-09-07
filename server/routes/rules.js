import express from 'express';
import db from '../db/database.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET all grammar rules
router.get('/', async (req, res) => {
  try {
    const database = await db.get();
    const rules = await database.all('SELECT id, name, description FROM grammar_rules ORDER BY name');
    res.json(rules);
  } catch (error) {
    console.error('❌ Error fetching rules:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET rule with words
router.get('/:id', async (req, res) => {
  try {
    const database = await db.get();
    const rule = await database.get(
      'SELECT id, name, description FROM grammar_rules WHERE id = ?',
      [req.params.id]
    );

    if (!rule) {
      return res.status(404).json({ error: 'Rule not found' });
    }

    const words = await database.all(
      'SELECT id, el, ru FROM words WHERE rule_id = ? ORDER BY el',
      [req.params.id]
    );

    res.json({
      ...rule,
      words
    });
  } catch (error) {
    console.error('❌ Error fetching rule:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST new rule (admin only)
router.post('/', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const database = await db.get();
    const result = await database.run(
      'INSERT INTO grammar_rules (name, description) VALUES (?, ?)',
      [name, description || null]
    );

    const ruleId = result.lastID || (await database.get(
      'SELECT id FROM grammar_rules WHERE name = ?',
      [name]
    ))?.id;

    res.status(201).json({
      id: ruleId,
      name,
      description,
      words: []
    });
  } catch (error) {
    console.error('❌ Error creating rule:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE rule (admin only)
router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const database = await db.get();
    const result = await database.run(
      'DELETE FROM grammar_rules WHERE id = ?',
      [req.params.id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Rule not found' });
    }

    res.json({ message: 'Rule deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting rule:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
