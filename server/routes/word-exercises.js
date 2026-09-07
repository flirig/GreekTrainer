import express from 'express';
import jwt from 'jsonwebtoken';
import db from '../db/database.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// GET random word for exercises
router.get('/random', async (req, res) => {
  try {
    const database = await db.get();

    const word = await database.get(
      'SELECT id, el, ru, rule_id FROM words WHERE ru NOT LIKE ? ORDER BY RANDOM() LIMIT 1',
      ['[translate:%']
    );

    if (!word) {
      return res.status(404).json({ error: 'No words available' });
    }

    const phrases = await database.all(
      'SELECT p.id, p.el, p.ru FROM phrases p JOIN word_phrases wp ON p.id = wp.phrase_id WHERE wp.word_id = ? LIMIT 3',
      [word.id]
    );

    const rule = word.rule_id ? await database.get(
      'SELECT id, name FROM grammar_rules WHERE id = ?',
      [word.rule_id]
    ) : null;

    res.json({
      id: word.id,
      el: word.el,
      ru: word.ru,
      rule,
      phrases
    });
  } catch (error) {
    console.error('❌ Error fetching random word:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET word translation options (for multiple choice)
router.get('/options/:id', async (req, res) => {
  try {
    const database = await db.get();

    const word = await database.get(
      'SELECT id, ru FROM words WHERE id = ? AND ru NOT LIKE ?',
      [req.params.id, '[translate:%']
    );

    if (!word) {
      return res.status(404).json({ error: 'Word not found' });
    }

    // Get other translations for wrong options
    const otherWords = await database.all(
      'SELECT DISTINCT ru FROM words WHERE id != ? AND ru NOT LIKE ? ORDER BY RANDOM() LIMIT 3',
      [req.params.id, '[translate:%']
    );

    const options = shuffle([
      word.ru,
      ...otherWords.map(w => w.ru)
    ]);

    res.json({
      correct: word.ru,
      options
    });
  } catch (error) {
    console.error('❌ Error fetching options:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST word exercise result
router.post('/result', async (req, res) => {
  try {
    const { wordId, isCorrect } = req.body;
    const token = req.headers.authorization?.split(' ')[1];

    let userId = 'anonymous';
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        userId = String(decoded.id);
      } catch (e) {
        // Ignore token errors
      }
    }

    if (!wordId) {
      return res.status(400).json({ error: 'wordId required' });
    }

    const database = await db.get();

    await database.run(
      'INSERT INTO user_progress (user_id, phrase_id, exercise_type, is_correct) VALUES (?, ?, ?, ?)',
      [userId, wordId, 'word_translation', isCorrect ? 1 : 0]
    );

    // Get stats
    const stats = await database.get(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct
      FROM user_progress
      WHERE user_id = ? AND exercise_type = 'word_translation'
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

// GET words by grammar rule
router.get('/by-rule/:ruleId', async (req, res) => {
  try {
    const database = await db.get();

    const words = await database.all(
      'SELECT id, el, ru FROM words WHERE rule_id = ? AND ru NOT LIKE ? ORDER BY el',
      [req.params.ruleId, '[translate:%']
    );

    res.json(words);
  } catch (error) {
    console.error('❌ Error fetching words:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
