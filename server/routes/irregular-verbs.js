import express from 'express';
import db from '../db/database.js';
import jwt from 'jsonwebtoken';
import { IRREGULAR_VERBS_RULE } from '../utils/irregular-verbs-rule.js';

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

// GET rule info
router.get('/rule', (req, res) => {
  res.json(IRREGULAR_VERBS_RULE);
});

// GET random verb exercise
router.get('/random', (req, res) => {
  const verbs = Object.keys(IRREGULAR_VERBS_RULE.verbs);
  const randomVerb = verbs[Math.floor(Math.random() * verbs.length)];
  const verbData = IRREGULAR_VERBS_RULE.verbs[randomVerb];
  const randomConj = verbData.conjugations[Math.floor(Math.random() * verbData.conjugations.length)];

  res.json({
    verb: randomVerb,
    verbRu: verbData.ru,
    person: randomConj.person,
    pronoun: randomConj.pronoun,
    correctForm: randomConj.form,
    example: randomConj.example
  });
});

// GET exercise for specific verb/person
router.get('/exercise/:verb/:person', (req, res) => {
  const verbData = IRREGULAR_VERBS_RULE.verbs[req.params.verb];
  if (!verbData) {
    return res.status(404).json({ error: 'Verb not found' });
  }

  const conj = verbData.conjugations.find(c => c.person === req.params.person);
  if (!conj) {
    return res.status(404).json({ error: 'Conjugation not found' });
  }

  // Get all forms for this verb
  const allForms = shuffle([
    conj.form,
    ...verbData.conjugations
      .filter(c => c.person !== req.params.person)
      .map(c => c.form)
      .slice(0, 3)
  ]);

  res.json({
    verb: req.params.verb,
    verbRu: verbData.ru,
    person: conj.person,
    pronoun: conj.pronoun,
    correctForm: conj.form,
    example: conj.example,
    options: allForms
  });
});

// POST result
router.post('/result', async (req, res) => {
  try {
    const { verb, person, isCorrect } = req.body;
    const token = req.headers.authorization?.split(' ')[1];

    let userId = 'anonymous';
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        userId = String(decoded.id);
      } catch (e) {
        // Ignore
      }
    }

    const database = await db.get();
    await database.run(
      'INSERT INTO user_progress (user_id, phrase_id, exercise_type, is_correct) VALUES (?, ?, ?, ?)',
      [userId, 1, `irregular_${verb}_${person}`, isCorrect ? 1 : 0]
    );

    const stats = await database.get(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct
      FROM user_progress
      WHERE user_id = ? AND exercise_type LIKE 'irregular_%'
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
    console.error('❌ Error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
