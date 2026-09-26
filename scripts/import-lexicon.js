#!/usr/bin/env node

/**
 * Import Lexicon Data
 *
 * Loads data from greek-lexicon-parsed.json into the database
 * Updates word_paradigm mappings based on scraped paradigm codes
 * Works with both SQLite (dev) and PostgreSQL (production)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db from '../server/db/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LEXICON_PATH = path.join(__dirname, '../data/greek-lexicon-parsed.json');

class LexiconImporter {
  constructor() {
    this.database = null;
    this.imported = 0;
    this.skipped = 0;
    this.errors = 0;
  }

  async connect() {
    this.database = await db.get();
  }

  async run(sql, params = []) {
    return await this.database.run(sql, params);
  }

  async get(sql, params = []) {
    return await this.database.get(sql, params);
  }

  loadLexicon() {
    try {
      const data = fs.readFileSync(LEXICON_PATH, 'utf8');
      return JSON.parse(data);
    } catch (e) {
      console.error('❌ Failed to load lexicon:', e.message);
      throw e;
    }
  }

  async importWord(lemma, wordData) {
    try {
      // Check if word already exists
      const existing = await this.get(
        'SELECT id FROM words WHERE el = ?',
        [lemma]
      );

      if (existing) {
        this.skipped++;
        return existing.id;
      }

      // Insert word
      const result = await this.run(
        'INSERT INTO words (el, ru) VALUES (?, ?)',
        [lemma, wordData.lemma] // Use lemma field from scraped data
      );

      this.imported++;
      return result.lastID;
    } catch (e) {
      console.error(`❌ Error importing ${lemma}:`, e.message);
      this.errors++;
      return null;
    }
  }

  async linkParadigm(wordId, paradigmCode) {
    try {
      if (!paradigmCode) return; // Skip if no paradigm code

      // Get paradigm ID
      const paradigm = await this.get(
        'SELECT id FROM paradigms WHERE code = ?',
        [paradigmCode]
      );

      if (!paradigm) {
        console.warn(`⚠️ Paradigm not found: ${paradigmCode}`);
        return;
      }

      // Link word to paradigm
      await this.run(
        'INSERT OR IGNORE INTO word_paradigm (word_id, paradigm_id) VALUES (?, ?)',
        [wordId, paradigm.id]
      );
    } catch (e) {
      console.error(`❌ Error linking paradigm:`, e.message);
    }
  }

  async import() {
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║  Greek Lexicon Importer               ║');
    console.log('║  Loading scraped data into DB         ║');
    console.log('╚════════════════════════════════════════╝\n');

    try {
      // Connect to database
      await this.connect();
      console.log('✅ Connected to database\n');

      // Load lexicon
      console.log('📖 Loading lexicon data...');
      const lexicon = this.loadLexicon();
      const wordCount = Object.keys(lexicon).length;
      console.log(`   Loaded ${wordCount} words\n`);

      // Import words
      console.log('💾 Importing words and paradigms...');
      let processed = 0;

      for (const [lemma, wordData] of Object.entries(lexicon)) {
        const wordId = await this.importWord(lemma, wordData);

        if (wordId && wordData.paradigmCode) {
          await this.linkParadigm(wordId, wordData.paradigmCode);
        }

        processed++;
        const progress = Math.round((processed / wordCount) * 100);
        if (processed % 10 === 0 || progress === 100) {
          console.log(`   [${progress}%] ${processed}/${wordCount}`);
        }
      }

      console.log(`\n✅ Import complete!`);
      console.log(`   Imported: ${this.imported}`);
      console.log(`   Skipped (existing): ${this.skipped}`);
      console.log(`   Errors: ${this.errors}\n`);

      // Show summary
      const totalWords = await this.get('SELECT COUNT(*) as count FROM words');
      const totalWithParadigm = await this.get(`
        SELECT COUNT(DISTINCT word_id) as count
        FROM word_paradigm
      `);

      console.log('📊 Database Summary:');
      console.log(`   Total words: ${totalWords.count}`);
      console.log(`   Words with paradigm: ${totalWithParadigm.count}`);

      // Close database
      this.db.close();

      return true;
    } catch (e) {
      console.error('❌ Import failed:', e.message);
      if (this.db) this.db.close();
      return false;
    }
  }
}

// Run
const importer = new LexiconImporter();
const success = await importer.import();
process.exit(success ? 0 : 1);
