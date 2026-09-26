import sqlite3 from 'sqlite3';
import pg from 'pg';
const { Client } = pg;
import bcrypt from 'bcrypt';
import { SQLITE_SCHEMA, POSTGRES_SCHEMA, INITIAL_DATA, CONJUGATION_DATA, GRAMMAR_TOPICS, NOUN_ARTICLES_DATA, ARTICLE_DECLENSIONS_DATA } from './schema.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';
import dotenv from 'dotenv';

// Load .env file
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DB_DIR = join(__dirname, '../../data');
const DB_PATH = join(DB_DIR, 'trainer.db');

const usePostgres = !!process.env.DATABASE_URL;
const DEFAULT_ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@greektrainer.local';
const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

console.log('📋 Environment check:');
console.log('  DATABASE_URL:', process.env.DATABASE_URL ? '✓ SET' : '✗ NOT SET');
console.log('  usePostgres:', usePostgres);

const SYSTEM_CATEGORIES = [
  { name: 'Существительные', icon: '📦' },
  { name: 'Глаголы', icon: '⚡' },
  { name: 'Местоимения', icon: '👤' },
  { name: 'Прилагательные', icon: '🎨' },
  { name: 'Наречия', icon: '⏩' },
  { name: 'Предлоги', icon: '🔗' }
];

async function ensureAdminUser(queryFn) {
  try {
    console.log('🔐 Checking for admin user...');
    const existing = await queryFn('SELECT id FROM users WHERE is_admin = ?', [1], true);

    if (existing) {
      console.log('✅ Admin user already exists');
      return;
    }

    console.log('📝 Creating default admin user...');
    const password_hash = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 10);
    await queryFn(
      'INSERT INTO users (email, password_hash, is_admin) VALUES (?, ?, ?)',
      [DEFAULT_ADMIN_EMAIL, password_hash, 1],
      false
    );

    console.log(`✅ Admin user created: ${DEFAULT_ADMIN_EMAIL}`);
    console.log(`⚠️  Default password: ${DEFAULT_ADMIN_PASSWORD}`);
    console.log(`⚠️  PLEASE CHANGE THE PASSWORD IN PRODUCTION!`);
  } catch (error) {
    console.error('⚠️  Could not create admin user:', error.message);
  }
}

async function initPostgres() {
  console.log('🔌 Connecting to PostgreSQL...');
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  console.log('✅ Connected to PostgreSQL');

  try {
    console.log('📝 Creating schema...');
    // Drop old verb_conjugations table if exists (to recreate with UNIQUE constraint)
    await client.query('DROP TABLE IF EXISTS verb_conjugations CASCADE');

    const statements = POSTGRES_SCHEMA
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const statement of statements) {
      await client.query(statement);
    }
    console.log('✅ Schema created');

    console.log('📚 Creating system categories...');
    for (const cat of SYSTEM_CATEGORIES) {
      await client.query(
        'INSERT INTO word_categories (name, icon, is_system) VALUES ($1, $2, $3) ON CONFLICT (name) DO NOTHING',
        [cat.name, cat.icon, true]
      );
    }
    console.log('✅ System categories created');

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
    console.log('✅ Initial phrases loaded');

    console.log('🔤 Loading verb conjugations...');
    // Clear old data first
    await client.query('DELETE FROM verb_conjugations');
    for (const conjugation of CONJUGATION_DATA) {
      await client.query(
        'INSERT INTO verb_conjugations (infinitive_el, infinitive_ru, person, form_el, form_ru, tense) VALUES ($1, $2, $3, $4, $5, $6)',
        [conjugation.infinitive_el, conjugation.infinitive_ru, conjugation.person, conjugation.form_el, conjugation.form_ru, conjugation.tense]
      );
    }
    console.log('✅ Verb conjugations loaded');

    console.log('📚 Loading grammar topics...');
    await client.query('DELETE FROM grammar_topics');
    for (const topic of GRAMMAR_TOPICS) {
      await client.query(
        'INSERT INTO grammar_topics (name, name_ru, icon, description) VALUES ($1, $2, $3, $4)',
        [topic.name, topic.name_ru, topic.icon, topic.description]
      );
    }
    console.log('✅ Grammar topics loaded');

    console.log('📄 Loading noun articles...');
    await client.query('DELETE FROM noun_articles');
    for (const article of NOUN_ARTICLES_DATA) {
      await client.query(
        'INSERT INTO noun_articles (noun_el, noun_ru, gender, article_el, example_el, example_ru) VALUES ($1, $2, $3, $4, $5, $6)',
        [article.noun_el, article.noun_ru, article.gender, article.article_el, article.example_el, article.example_ru]
      );
    }
    console.log('✅ Noun articles loaded');

    console.log('📋 Loading article declensions...');
    await client.query('DELETE FROM article_declensions');
    for (const decl of ARTICLE_DECLENSIONS_DATA) {
      await client.query(
        'INSERT INTO article_declensions (number, case_name, gender, article_el, example_el, example_ru) VALUES ($1, $2, $3, $4, $5, $6)',
        [decl.number, decl.case_name, decl.gender, decl.article_el, decl.example_el, decl.example_ru]
      );
    }
    console.log('✅ Article declensions loaded');

    // Create default admin user
    const convertSqlToPostgres = (sql, params) => {
      let paramIndex = 1;
      const convertedSql = sql.replace(/\?/g, () => `$${paramIndex++}`);
      return { sql: convertedSql, params };
    };

    await ensureAdminUser(async (sql, params, isGet) => {
      const { sql: convertedSql, params: convertedParams } = convertSqlToPostgres(sql, params);
      if (isGet) {
        const result = await client.query(convertedSql, convertedParams);
        return result.rows[0] || null;
      } else {
        return await client.query(convertedSql, convertedParams);
      }
    });

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

        // Create system categories
        console.log('📚 Creating system categories...');
        for (const cat of SYSTEM_CATEGORIES) {
          await new Promise((res, rej) => {
            sqlite.run(
              'INSERT OR IGNORE INTO word_categories (name, icon, is_system) VALUES (?, ?, ?)',
              [cat.name, cat.icon, 1],
              (err) => {
                if (err) rej(err);
                else res();
              }
            );
          });
        }
        console.log('✅ System categories created');

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
        console.log('✅ Initial phrases loaded');

        // Load verb conjugations
        console.log('🔤 Loading verb conjugations...');
        await new Promise((res, rej) => {
          sqlite.run('DELETE FROM verb_conjugations', (err) => {
            if (err) rej(err);
            else res();
          });
        });
        for (const conjugation of CONJUGATION_DATA) {
          await new Promise((res, rej) => {
            sqlite.run(
              'INSERT INTO verb_conjugations (infinitive_el, infinitive_ru, person, form_el, form_ru, tense) VALUES (?, ?, ?, ?, ?, ?)',
              [conjugation.infinitive_el, conjugation.infinitive_ru, conjugation.person, conjugation.form_el, conjugation.form_ru, conjugation.tense],
              (err) => {
                if (err) rej(err);
                else res();
              }
            );
          });
        }
        console.log('✅ Verb conjugations loaded');

        // Load grammar topics
        console.log('📚 Loading grammar topics...');
        await new Promise((res, rej) => {
          sqlite.run('DELETE FROM grammar_topics', (err) => {
            if (err) rej(err);
            else res();
          });
        });
        for (const topic of GRAMMAR_TOPICS) {
          await new Promise((res, rej) => {
            sqlite.run(
              'INSERT INTO grammar_topics (name, name_ru, icon, description) VALUES (?, ?, ?, ?)',
              [topic.name, topic.name_ru, topic.icon, topic.description],
              (err) => {
                if (err) rej(err);
                else res();
              }
            );
          });
        }
        console.log('✅ Grammar topics loaded');

        // Load noun articles
        console.log('📄 Loading noun articles...');
        await new Promise((res, rej) => {
          sqlite.run('DELETE FROM noun_articles', (err) => {
            if (err) rej(err);
            else res();
          });
        });
        for (const article of NOUN_ARTICLES_DATA) {
          await new Promise((res, rej) => {
            sqlite.run(
              'INSERT INTO noun_articles (noun_el, noun_ru, gender, article_el, example_el, example_ru) VALUES (?, ?, ?, ?, ?, ?)',
              [article.noun_el, article.noun_ru, article.gender, article.article_el, article.example_el, article.example_ru],
              (err) => {
                if (err) rej(err);
                else res();
              }
            );
          });
        }
        console.log('✅ Noun articles loaded');

        // Load article declensions
        console.log('📋 Loading article declensions...');
        await new Promise((res, rej) => {
          sqlite.run('DELETE FROM article_declensions', (err) => {
            if (err) rej(err);
            else res();
          });
        });
        for (const decl of ARTICLE_DECLENSIONS_DATA) {
          await new Promise((res, rej) => {
            sqlite.run(
              'INSERT INTO article_declensions (number, case_name, gender, article_el, example_el, example_ru) VALUES (?, ?, ?, ?, ?, ?)',
              [decl.number, decl.case_name, decl.gender, decl.article_el, decl.example_el, decl.example_ru],
              (err) => {
                if (err) rej(err);
                else res();
              }
            );
          });
        }
        console.log('✅ Article declensions loaded');

        // Create default admin user
        await ensureAdminUser(async (sql, params, isGet) => {
          return new Promise((res, rej) => {
            if (isGet) {
              sqlite.get(sql, params, (err, row) => {
                if (err) rej(err);
                else res(row || null);
              });
            } else {
              sqlite.run(sql, params, (err) => {
                if (err) rej(err);
                else res();
              });
            }
          });
        });

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
