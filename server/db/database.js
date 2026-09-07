import sqlite3 from 'sqlite3';
import pg from 'pg';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_DIR = join(__dirname, '../../data');
const DB_PATH = join(DB_DIR, 'trainer.db');

let dbInstance = null;
const usePostgres = process.env.DATABASE_URL && process.env.NODE_ENV === 'production';

// SQLite Database Wrapper
class SQLiteDatabase {
  constructor(db) {
    this.db = db;
  }

  async query(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve({ rows: rows || [] });
      });
    });
  }

  async get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row || null);
      });
    });
  }

  async all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }

  async run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  }

  async close() {
    return new Promise((resolve) => {
      this.db.close(() => resolve());
    });
  }
}

// PostgreSQL Database Wrapper
class PostgresDatabase {
  constructor(client) {
    this.client = client;
  }

  async query(sql, params = []) {
    return this.client.query(sql, params);
  }

  async get(sql, params = []) {
    const result = await this.client.query(sql, params);
    return result.rows[0] || null;
  }

  async all(sql, params = []) {
    const result = await this.client.query(sql, params);
    return result.rows || [];
  }

  async run(sql, params = []) {
    const result = await this.client.query(sql, params);
    return { changes: result.rowCount || 0 };
  }

  async close() {
    await this.client.end();
  }
}

async function ensureDataDir() {
  try {
    await fs.mkdir(DB_DIR, { recursive: true });
  } catch (err) {
    if (err.code !== 'EEXIST') {
      throw err;
    }
  }
}

async function initDb() {
  if (dbInstance) return dbInstance;

  if (usePostgres) {
    console.log('🔌 Using PostgreSQL (production)');
    const { Client } = pg;
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    console.log('✅ Connected to PostgreSQL');
    dbInstance = new PostgresDatabase(client);
  } else {
    console.log('🔌 Using SQLite (development)');
    await ensureDataDir();

    return new Promise((resolve, reject) => {
      console.log('📁 Database path:', DB_PATH);
      const sqlite = new sqlite3.Database(DB_PATH, async (err) => {
        if (err) {
          console.error('❌ Database connection error:', err);
          reject(new Error(`Database connection error: ${err.message}`));
          return;
        }

        console.log('✅ Connected to SQLite');
        const database = new SQLiteDatabase(sqlite);
        try {
          await database.query('PRAGMA foreign_keys = ON');
          console.log('✅ Pragmas set');
          dbInstance = database;
          resolve(database);
        } catch (error) {
          console.error('❌ Database setup error:', error);
          reject(error);
        }
      });
    });
  }

  return dbInstance;
}

async function getDb() {
  if (!dbInstance) {
    await initDb();
  }
  return dbInstance;
}

export default {
  init: initDb,
  get: getDb
};
