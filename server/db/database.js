import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { promisify } from 'util';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_DIR = join(__dirname, '../../data');
const DB_PATH = join(DB_DIR, 'trainer.db');

let dbInstance = null;

class Database {
  constructor(db) {
    this.db = db;
    this.run = promisify(db.run.bind(db));
    this.get = promisify(db.get.bind(db));
    this.all = promisify(db.all.bind(db));
  }

  async exec(sql) {
    return new Promise((resolve, reject) => {
      this.db.exec(sql, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  close() {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
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

  console.log('📁 Database path:', DB_PATH);
  await ensureDataDir();

  return new Promise((resolve, reject) => {
    console.log('🔌 Connecting to SQLite...');
    const sqlite = new sqlite3.Database(DB_PATH, async (err) => {
      if (err) {
        console.error('❌ Database connection error:', err);
        reject(new Error(`Database connection error: ${err.message}`));
        return;
      }

      console.log('✅ Connected to SQLite');
      const database = new Database(sqlite);
      try {
        await database.exec('PRAGMA foreign_keys = ON');
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
