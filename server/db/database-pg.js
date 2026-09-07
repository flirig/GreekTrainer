import pg from 'pg';
const { Client } = pg;

let dbInstance = null;

class Database {
  constructor(client) {
    this.client = client;
  }

  async query(sql, params = []) {
    return this.client.query(sql, params);
  }

  async get(sql, params = []) {
    const result = await this.query(sql, params);
    return result.rows[0] || null;
  }

  async all(sql, params = []) {
    const result = await this.query(sql, params);
    return result.rows || [];
  }

  async run(sql, params = []) {
    const result = await this.query(sql, params);
    return { changes: result.rowCount || 0 };
  }

  async close() {
    await this.client.end();
  }
}

async function initDb() {
  if (dbInstance) return dbInstance;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set');
  }

  console.log('🔌 Connecting to PostgreSQL...');
  const client = new Client({ connectionString });
  await client.connect();
  console.log('✅ Connected to PostgreSQL');

  const database = new Database(client);
  dbInstance = database;
  return database;
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
