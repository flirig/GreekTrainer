import sqlite3 from 'sqlite3';
import pg from 'pg';
const { Client } = pg;
import { SQLITE_SCHEMA, POSTGRES_SCHEMA, INITIAL_DATA } from './schema.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DB_DIR = join(__dirname, '../../data');
const DB_PATH = join(DB_DIR, 'trainer.db');

const usePostgres = !!process.env.DATABASE_URL;

async function initPostgres() {
  console.log('🔌 Connecting to PostgreSQL...');
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  console.log('✅ Connected to PostgreSQL');

  try {
    console.log('📝 Creating schema...');
    const statements = POSTGRES_SCHEMA
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const statement of statements) {
      await client.query(statement);
    }
    console.log('✅ Schema created');

    console.log('🔄 Loading initial data...');
    for (const phrase of INITIAL_DATA) {
      const result = await client.query(
        'INSERT INTO phrases (el, ru) VALUES ($1, $2) ON CONFLICT (el) DO NOTHING RETURNING id',
        [phrase.el, phrase.ru]
      );

      if (result.rows.length > 0) {
        const phraseId = result.rows[0].id;

        // Add accent variants
        for (const variant of phrase.accents) {
          await client.query(
            'INSERT INTO accent_variants (phrase_id, variant) VALUES ($1, $2)',
            [phraseId, variant]
          );
        }

        // Add mistakes
        for (const mistake of phrase.mistakes) {
          await client.query(
            'INSERT INTO mistakes (phrase_id, variant) VALUES ($1, $2)',
            [phraseId, mistake]
          );
        }
      }
    }

    console.log('✅ Database initialized successfully!');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  } finally {
    await client.end();
    console.log('📁 Database connection closed');
  }
}

async function initSqlite() {
  console.log('🔌 Using SQLite for development');

  try {
    await fs.mkdir(DB_DIR, { recursive: true });
  } catch (err) {
    if (err.code !== 'EEXIST') throw err;
  }

  return new Promise((resolve, reject) => {
    const sqlite = new sqlite3.Database(DB_PATH, async (err) => {
      if (err) {
        console.error('❌ Database connection error:', err);
        reject(err);
        return;
      }

      console.log('✅ Connected to SQLite at', DB_PATH);

      try {
        // Enable foreign keys
        await new Promise((res, rej) => {
          sqlite.run('PRAGMA foreign_keys = ON', (err) => {
            if (err) rej(err);
            else res();
          });
        });

        // Create schema
        console.log('📝 Creating schema...');
        const schemaStatements = SQLITE_SCHEMA
          .split(';')
          .map(s => s.trim())
          .filter(s => s.length > 0);

        for (const statement of schemaStatements) {
          await new Promise((res, rej) => {
            sqlite.exec(statement, (err) => {
              if (err) rej(err);
              else res();
            });
          });
        }
        console.log('✅ Schema created');

        // Insert initial data
        console.log('🔄 Loading initial data...');
        for (const phrase of INITIAL_DATA) {
          const phraseResult = await new Promise((res, rej) => {
            sqlite.run(
              'INSERT OR IGNORE INTO phrases (el, ru) VALUES (?, ?)',
              [phrase.el, phrase.ru],
              function(err) {
                if (err) rej(err);
                else res({ id: this.lastID, changes: this.changes });
              }
            );
          });

          if (phraseResult.changes > 0) {
            const phraseId = phraseResult.id;

            // Add accent variants
            for (const variant of phrase.accents) {
              await new Promise((res, rej) => {
                sqlite.run(
                  'INSERT INTO accent_variants (phrase_id, variant) VALUES (?, ?)',
                  [phraseId, variant],
                  (err) => {
                    if (err) rej(err);
                    else res();
                  }
                );
              });
            }

            // Add mistakes
            for (const mistake of phrase.mistakes) {
              await new Promise((res, rej) => {
                sqlite.run(
                  'INSERT INTO mistakes (phrase_id, variant) VALUES (?, ?)',
                  [phraseId, mistake],
                  (err) => {
                    if (err) rej(err);
                    else res();
                  }
                );
              });
            }
          }
        }

        console.log('✅ Database initialized successfully!');
        sqlite.close();
        resolve();
      } catch (error) {
        console.error('❌ Error initializing database:', error);
        sqlite.close();
        reject(error);
      }
    });
  });
}

async function initDatabase() {
  try {
    if (usePostgres) {
      await initPostgres();
    } else {
      await initSqlite();
    }
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

initDatabase();
