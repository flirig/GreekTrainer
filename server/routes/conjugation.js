import express from 'express';
import db from '../db/database.js';
import jwt from 'jsonwebtoken';
import { CONJUGATION_RULE, CONJUGATION_WORDS } from '../utils/conjugation-rule.js';

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

// GET conjugation rule info
router.get('/rule', async (req, res) => {
  try {
    res.json(CONJUGATION_RULE);
  } catch (error) {
    console.error('❌ Error fetching rule:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET random conjugation exercise
router.get('/random', async (req, res) => {
  try {
    const conjugations = CONJUGATION_RULE.conjugations;
    const random = conjugations[Math.floor(Math.random() * conjugations.length)];

    res.json({
      id: random.person,
      person: random.person,
      pronoun: random.pronoun,
      translation: random.translation,
      example: random.example,
      exampleTranslation: random.exampleTranslation,
      correctForm: random.form
    });
  } catch (error) {
    console.error('❌ Error fetching random:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET conjugation form (fill in the blank)
router.get('/exercise/:person', async (req, res) => {
  try {
    const person = req.params.person;
    const conjugation = CONJUGATION_RULE.conjugations.find(c => c.person === person);

    if (!conjugation) {
      return res.status(404).json({ error: 'Conjugation not found' });
    }

    // Get other forms for wrong options
    const wrongOptions = shuffle(
      CONJUGATION_RULE.conjugations
        .filter(c => c.person !== person)
        .map(c => c.form)
        .slice(0, 3)
    );

    const options = shuffle([
      conjugation.form,
      ...wrongOptions
    ]);

    res.json({
      person: conjugation.person,
      pronoun: conjugation.pronoun,
      translation: conjugation.translation,
      example: conjugation.example,
      exampleTranslation: conjugation.exampleTranslation,
      correctForm: conjugation.form,
      options
    });
  } catch (error) {
    console.error('❌ Error fetching exercise:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST conjugation result
router.post('/result', async (req, res) => {
  try {
    const { person, isCorrect } = req.body;
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

    if (!person) {
      return res.status(400).json({ error: 'person required' });
    }

    const database = await db.get();

    await database.run(
      'INSERT INTO user_progress (user_id, phrase_id, exercise_type, is_correct) VALUES (?, ?, ?, ?)',
      [userId, 1, `conjugation_${person}`, isCorrect ? 1 : 0]
    );

    // Get stats for this conjugation type
    const stats = await database.get(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct
      FROM user_progress
      WHERE user_id = ? AND exercise_type LIKE 'conjugation_%'
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

// GET all conjugations (for reference)
router.get('/all', async (req, res) => {
  try {
    res.json(CONJUGATION_RULE.conjugations);
  } catch (error) {
    console.error('❌ Error fetching all:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET practice examples
router.get('/examples', async (req, res) => {
  try {
    res.json(CONJUGATION_RULE.practiceExamples);
  } catch (error) {
    console.error('❌ Error fetching examples:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
