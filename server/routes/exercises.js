import express from 'express';
import db from '../db/database.js';

const router = express.Router();

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// GET random phrase for any exercise type
router.get('/random', async (req, res) => {
  try {
    const database = await db.get();

    const phrase = await database.get(
      'SELECT id, el, ru FROM phrases ORDER BY RANDOM() LIMIT 1'
    );

    if (!phrase) {
      return res.status(404).json({ error: 'No phrases available' });
    }

    const accents = await database.all(
      'SELECT variant FROM accent_variants WHERE phrase_id = ?',
      [phrase.id]
    );

    const mistakes = await database.all(
      'SELECT variant FROM mistakes WHERE phrase_id = ?',
      [phrase.id]
    );

    res.json({
      ...phrase,
      wAccents: accents.map(a => a.variant),
      mistakes: mistakes.map(m => m.variant)
    });
  } catch (error) {
    console.error('❌ Error fetching random phrase:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST exercise result
router.post('/result', async (req, res) => {
  try {
    const { userId = 'anonymous', phraseId, exerciseType, isCorrect } = req.body;

    if (!phraseId || !exerciseType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const database = await db.get();

    await database.run(
      'INSERT INTO user_progress (user_id, phrase_id, exercise_type, is_correct) VALUES (?, ?, ?, ?)',
      [userId, phraseId, exerciseType, isCorrect ? 1 : 0]
    );

    // Get user stats
    const stats = await database.get(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct
      FROM user_progress
      WHERE user_id = ?
    `, [userId]);

    res.json({
      message: 'Result recorded',
      stats: {
        total: stats?.total || 0,
        correct: stats?.correct || 0,
        accuracy: (stats?.total || 0) > 0 ? Math.round((stats.correct / stats.total) * 100) : 0
      }
    });
  } catch (error) {
    console.error('❌ Error recording result:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET user statistics
router.get('/stats/:userId', async (req, res) => {
  try {
    const database = await db.get();

    const stats = await database.get(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct,
        COUNT(DISTINCT exercise_type) as exerciseTypes
      FROM user_progress
      WHERE user_id = ?
    `, [req.params.userId]);

    const byType = await database.all(`
      SELECT
        exercise_type,
        COUNT(*) as total,
        SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct
      FROM user_progress
      WHERE user_id = ?
      GROUP BY exercise_type
    `, [req.params.userId]);

    res.json({
      overall: {
        total: stats?.total || 0,
        correct: stats?.correct || 0,
        accuracy: (stats?.total || 0) > 0 ? Math.round((stats.correct / stats.total) * 100) : 0
      },
      byType: (byType || []).map(row => ({
        type: row.exercise_type,
        total: row.total,
        correct: row.correct,
        accuracy: Math.round((row.correct / row.total) * 100)
      }))
    });
  } catch (error) {
    console.error('❌ Error fetching stats:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
