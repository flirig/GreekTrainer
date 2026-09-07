import db from '../db/database.js';

/**
 * Extract words from Greek phrases and add them to database
 * Groups words by part of speech and assigns grammar rules
 * Returns statistics about extraction
 */
export async function extractWordsFromPhrases(database) {
  const database = await db.get();

  try {
    console.log('📚 Fetching all phrases...');
    const phrases = await database.all('SELECT id, el FROM phrases');

    const wordMap = new Map(); // Track unique words

    // Extract words from each phrase
    for (const phrase of phrases) {
      const words = phrase.el.split(/\s+/).filter(w => w.length > 0);

      for (const word of words) {
        // Remove punctuation and normalize
        const normalized = word.replace(/[.,;:!?'"'()[\]]/g, '').toLowerCase();

        if (normalized.length > 1) {
          if (!wordMap.has(normalized)) {
            wordMap.set(normalized, new Set());
          }
          wordMap.get(normalized).add(phrase.id);
        }
      }
    }

    console.log(`✅ Found ${wordMap.size} unique words`);
    console.log('📝 Adding words to database...');

    // Common Greek articles and small words to skip
    const skipWords = new Set([
      'ο', 'η', 'το', 'και', 'τα', 'του', 'της', 'την', 'τον', 'για', 'με', 'στο', 'στη', 'στην', 'στον', 'στις', 'στους', 'απο', 'σε', 'μετα', 'αν', 'να', 'που', 'ως', 'εως', 'οταν', 'επει', 'ωστε'
    ]);

    let added = 0;
    let skipped = 0;

    for (const [word, phraseIds] of wordMap.entries()) {
      if (skipWords.has(word)) {
        skipped++;
        continue;
      }

      try {
        // Check if word already exists
        const existing = await database.get(
          'SELECT id FROM words WHERE el = ?',
          [word]
        );

        if (existing) {
          // Link to phrases if not already linked
          for (const phraseId of phraseIds) {
            await database.run(
              'INSERT OR IGNORE INTO word_phrases (word_id, phrase_id) VALUES (?, ?)',
              [existing.id, phraseId]
            );
          }
          continue;
        }

        // Add new word - we'll need translation data
        const result = await database.run(
          'INSERT INTO words (el, ru) VALUES (?, ?)',
          [word, `[translate: ${word}]`] // Placeholder for translation
        );

        const wordId = result.lastID || (await database.get(
          'SELECT id FROM words WHERE el = ?',
          [word]
        ))?.id;

        // Link to phrases
        for (const phraseId of phraseIds) {
          await database.run(
            'INSERT OR IGNORE INTO word_phrases (word_id, phrase_id) VALUES (?, ?)',
            [wordId, phraseId]
          );
        }

        added++;
      } catch (error) {
        console.error(`⚠️  Error adding word "${word}":`, error.message);
      }
    }

    const result = {
      success: true,
      added,
      skipped,
      total: wordMap.size,
      message: `Extraction complete: Added ${added} words, Skipped ${skipped} common words`
    };

    console.log(`\n✅ Extraction complete!`);
    console.log(`   Added: ${added} words`);
    console.log(`   Skipped: ${skipped} common words`);
    console.log(`   Total unique: ${wordMap.size}`);

    return result;
  } catch (error) {
    console.error('❌ Error extracting words:', error);
    throw error;
  }
}

// If run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const dbModule = await import('../db/database.js');
  const db = dbModule.default;
  const database = await db.get();
  try {
    await extractWordsFromPhrases(database);
    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
}
