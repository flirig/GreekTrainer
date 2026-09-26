import express from 'express';
import db from '../db/database.js';

const router = express.Router();

// GET all conjugations
router.get('/', async (req, res) => {
  try {
    const database = await db.get();
    const conjugations = await database.all(
      `SELECT id, infinitive_el, infinitive_ru, person, form_el, form_ru, tense
       FROM verb_conjugations
       ORDER BY infinitive_el, tense, CASE person
         WHEN 'Εγώ' THEN 1
         WHEN 'Εσύ' THEN 2
         WHEN 'Αυτός/Αυτή/Αυτό' THEN 3
         WHEN 'Εμείς' THEN 4
         WHEN 'Εσείς' THEN 5
         WHEN 'Αυτοί/Αυτές/Αυτά' THEN 6
         ELSE 7
       END`
    );
    res.json(conjugations);
  } catch (error) {
    console.error('❌ Error fetching conjugations:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET conjugations by infinitive
router.get('/verb/:infinitive', async (req, res) => {
  try {
    const database = await db.get();
    const conjugations = await database.all(
      `SELECT id, infinitive_el, infinitive_ru, person, form_el, form_ru, tense
       FROM verb_conjugations
       WHERE infinitive_el = ? OR infinitive_ru = ?
       ORDER BY tense, CASE person
         WHEN 'Εγώ' THEN 1
         WHEN 'Εσύ' THEN 2
         WHEN 'Αυτός/Αυτή/Αυτό' THEN 3
         WHEN 'Εμείς' THEN 4
         WHEN 'Εσείς' THEN 5
         WHEN 'Αυτοί/Αυτές/Αυτά' THEN 6
         ELSE 7
       END`,
      [req.params.infinitive, req.params.infinitive]
    );
    res.json(conjugations);
  } catch (error) {
    console.error('❌ Error fetching verb conjugations:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET random conjugation for quiz
router.get('/random/quiz', async (req, res) => {
  try {
    const database = await db.get();
    const conjugation = await database.get(
      `SELECT id, infinitive_el, infinitive_ru, person, form_el, form_ru, tense
       FROM verb_conjugations
       ORDER BY RANDOM() LIMIT 1`
    );

    if (!conjugation) {
      return res.status(404).json({ error: 'No conjugations found' });
    }

    res.json(conjugation);
  } catch (error) {
    console.error('❌ Error fetching random conjugation:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
