import express from 'express';
import db from '../db/database.js';

const router = express.Router();

// Check if vocabulary tables exist and have data
async function checkVocabularyTables() {
  try {
    const database = await db.get();
    const result = await database.get('SELECT COUNT(*) as count FROM lemmas').catch(() => null);
    return result !== null;
  } catch (error) {
    return false;
  }
}

// Get all vocabulary (verbs and nouns)
router.get('/', async (req, res) => {
  try {
    const database = await db.get();

    // Try to get counts, handle missing tables gracefully
    let articlesCount = 0, verbsCount = 0, nounsCount = 0;

    try {
      const result = await database.get('SELECT COUNT(*) as count FROM articles');
      articlesCount = result?.count || 0;
    } catch (e) {
      console.warn('Articles table not found');
    }

    try {
      const result = await database.get('SELECT COUNT(*) as count FROM lemmas WHERE pos = ?', ['verb']);
      verbsCount = result?.count || 0;
    } catch (e) {
      console.warn('Lemmas table not found');
    }

    try {
      const result = await database.get('SELECT COUNT(*) as count FROM lemmas WHERE pos = ?', ['noun']);
      nounsCount = result?.count || 0;
    } catch (e) {
      console.warn('Lemmas table not found');
    }

    res.json({
      status: 'loaded',
      articles: articlesCount,
      verbs: verbsCount,
      nouns: nounsCount,
      total: articlesCount + verbsCount + nounsCount,
      message: (verbsCount === 0 && nounsCount === 0) ? 'Please run migrations: npm run migrate' : null
    });
  } catch (error) {
    console.error('Error fetching vocabulary stats:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all verbs
router.get('/verbs', async (req, res) => {
  try {
    const database = await db.get();
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    let verbs = [];
    try {
      verbs = await database.all(
        `SELECT l.id, l.word, l.english_translation, l.conjugation_type
         FROM lemmas l
         WHERE l.pos = ?
         ORDER BY l.word
         LIMIT ? OFFSET ?`,
        ['verb', limit, offset]
      );
    } catch (dbError) {
      console.error('Database error fetching verbs:', dbError.message);
      return res.status(500).json({
        error: 'Vocabulary tables not initialized. Please run: npm run migrate',
        verbs: []
      });
    }

    res.json({ verbs: verbs || [], total: (verbs || []).length });
  } catch (error) {
    console.error('Error fetching verbs:', error);
    res.status(500).json({ error: error.message, verbs: [] });
  }
});

// Get all nouns
router.get('/nouns', async (req, res) => {
  try {
    const database = await db.get();
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    let nouns = [];
    try {
      nouns = await database.all(
        `SELECT l.id, l.word, l.english_translation, l.gender, l.declension_class
         FROM lemmas l
         WHERE l.pos = ?
         ORDER BY l.word
         LIMIT ? OFFSET ?`,
        ['noun', limit, offset]
      );
    } catch (dbError) {
      console.error('Database error fetching nouns:', dbError.message);
      return res.status(500).json({
        error: 'Vocabulary tables not initialized. Please run: npm run migrate',
        nouns: []
      });
    }

    res.json({ nouns: nouns || [], total: (nouns || []).length });
  } catch (error) {
    console.error('Error fetching nouns:', error);
    res.status(500).json({ error: error.message, nouns: [] });
  }
});

// Get all articles
router.get('/articles', async (req, res) => {
  try {
    const database = await db.get();

    const articles = await database.all(
      `SELECT id, article, is_definite, gender, number, article_case
       FROM articles
       ORDER BY is_definite DESC, gender, number, article_case`
    );

    const definite = articles.filter(a => a.is_definite);
    const indefinite = articles.filter(a => !a.is_definite);

    res.json({
      definite,
      indefinite,
      total: articles.length
    });
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get word details with all forms
router.get('/word/:word', async (req, res) => {
  try {
    const database = await db.get();
    const { word } = req.params;

    const lemma = await database.get(
      `SELECT * FROM lemmas WHERE word = ?`,
      [word]
    );

    if (!lemma) {
      return res.status(404).json({ error: 'Word not found' });
    }

    const forms = await database.all(
      `SELECT f.form, f.morphology, a.article
       FROM forms f
       LEFT JOIN articles a ON f.article_id = a.id
       WHERE f.lemma_id = ?
       ORDER BY f.form`,
      [lemma.id]
    );

    res.json({
      lemma,
      forms,
      totalForms: forms.length
    });
  } catch (error) {
    console.error('Error fetching word details:', error);
    res.status(500).json({ error: error.message });
  }
});

// Search vocabulary
router.get('/search/:query', async (req, res) => {
  try {
    const database = await db.get();
    const { query } = req.params;
    const searchPattern = `%${query}%`;

    const results = await database.all(
      `SELECT id, word, pos, english_translation, gender, conjugation_type, declension_class
       FROM lemmas
       WHERE word LIKE ? OR english_translation LIKE ?
       ORDER BY word
       LIMIT 20`,
      [searchPattern, searchPattern]
    );

    res.json({ results, total: results.length });
  } catch (error) {
    console.error('Error searching vocabulary:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
