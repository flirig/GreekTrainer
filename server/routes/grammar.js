import express from 'express';
import db from '../db/database.js';

const router = express.Router();

// GET all grammar topics
router.get('/topics', async (req, res) => {
  try {
    const database = await db.get();
    const topics = await database.all('SELECT id, name, name_ru, icon, description FROM grammar_topics ORDER BY id');
    res.json(topics);
  } catch (error) {
    console.error('❌ Error fetching topics:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET articles by topic
router.get('/articles', async (req, res) => {
  try {
    const database = await db.get();
    const articles = await database.all(`
      SELECT id, noun_el, noun_ru, gender, article_el, example_el, example_ru
      FROM noun_articles
      ORDER BY gender, noun_el
    `);

    // Group by gender
    const grouped = {
      'Αρσενικό': [],
      'Θηλυκό': [],
      'Ουδέτερο': []
    };

    articles.forEach(a => {
      if (grouped[a.gender]) {
        grouped[a.gender].push(a);
      }
    });

    res.json(grouped);
  } catch (error) {
    console.error('❌ Error fetching articles:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET random noun for quiz
router.get('/quiz/noun', async (req, res) => {
  try {
    const database = await db.get();
    const noun = await database.get(`
      SELECT id, noun_el, noun_ru, gender, article_el
      FROM noun_articles
      ORDER BY RANDOM() LIMIT 1
    `);

    if (!noun) {
      return res.status(404).json({ error: 'No nouns found' });
    }

    res.json(noun);
  } catch (error) {
    console.error('❌ Error fetching noun:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET all nouns with articles
router.get('/nouns', async (req, res) => {
  try {
    const database = await db.get();
    const nouns = await database.all(`
      SELECT id, noun_el, noun_ru, gender, article_el, example_el, example_ru
      FROM noun_articles
      ORDER BY noun_el
    `);
    res.json(nouns);
  } catch (error) {
    console.error('❌ Error fetching nouns:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET article declensions
router.get('/declensions', async (req, res) => {
  try {
    const database = await db.get();
    const declensions = await database.all(`
      SELECT id, number, case_name, gender, article_el, example_el, example_ru
      FROM article_declensions
      ORDER BY
        CASE WHEN number = 'Ενικός' THEN 1 ELSE 2 END,
        CASE WHEN case_name = 'Ονομαστική' THEN 1 WHEN case_name = 'Γενική' THEN 2 ELSE 3 END,
        CASE WHEN gender = 'Αρσενικό' THEN 1 WHEN gender = 'Θηλυκό' THEN 2 ELSE 3 END
    `);
    res.json(declensions);
  } catch (error) {
    console.error('❌ Error fetching declensions:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET random declension for quiz
router.get('/quiz/declension', async (req, res) => {
  try {
    const database = await db.get();
    const decl = await database.get(`
      SELECT id, number, case_name, gender, article_el, example_el, example_ru
      FROM article_declensions
      WHERE case_name IN ('Γενική', 'Αιτιατική')
      ORDER BY RANDOM() LIMIT 1
    `);

    if (!decl) {
      return res.status(404).json({ error: 'No declensions found' });
    }

    res.json(decl);
  } catch (error) {
    console.error('❌ Error fetching declension:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
