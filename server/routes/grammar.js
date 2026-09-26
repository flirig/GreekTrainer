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

export default router;
