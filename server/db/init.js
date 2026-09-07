import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { promisify } from 'util';
import fs from 'fs/promises';
import { SCHEMA, INITIAL_DATA } from './schema.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_DIR = join(__dirname, '../../data');
const DB_PATH = join(DB_DIR, 'trainer.db');

async function initDatabase() {
  // Ensure data directory exists
  try {
    await fs.mkdir(DB_DIR, { recursive: true });
    console.log('📁 Data directory:', DB_DIR);
  } catch (err) {
    console.error('❌ Error creating data directory:', err);
  }

  console.log('🔌 Opening database at:', DB_PATH);
  const db = new sqlite3.Database(DB_PATH);
  const run = promisify(db.run.bind(db));
  const all = promisify(db.all.bind(db));

  try {
    console.log('📝 Creating schema...');

    // Execute schema statements one by one
    const statements = SCHEMA.split(';').filter(s => s.trim());
    for (const statement of statements) {
      if (statement.trim()) {
        await run(statement);
      }
    }

    console.log('🔄 Loading initial data...');

    for (const phrase of INITIAL_DATA) {
      const result = await new Promise((resolve, reject) => {
        db.run(
          'INSERT OR IGNORE INTO phrases (el, ru) VALUES (?, ?)',
          [phrase.el, phrase.ru],
          function(err) {
            if (err) reject(err);
            resolve({ lastID: this.lastID });
          }
        );
      });

      if (result.lastID) {
        const phraseId = result.lastID;

        // Add accent variants
        for (const variant of phrase.accents) {
          await run(
            'INSERT INTO accent_variants (phrase_id, variant) VALUES (?, ?)',
            [phraseId, variant]
          );
        }

        // Add mistakes
        for (const mistake of phrase.mistakes) {
          await run(
            'INSERT INTO mistakes (phrase_id, variant) VALUES (?, ?)',
            [phraseId, mistake]
          );
        }
      }
    }

    console.log('✅ Database initialized successfully!');
    console.log(`📊 Database file: ${DB_PATH}`);
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  } finally {
    db.close();
  }
}

// Export for use in start script
export default initDatabase;
