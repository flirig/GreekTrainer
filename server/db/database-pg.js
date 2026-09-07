import pg from 'pg';
const { Client } = pg;

let dbInstance = null;

class Database {
  constructor(client) {
    this.client = client;
  }

  _convertSql(sql, params) {
    // Convert SQLite ? placeholders to PostgreSQL $1, $2, etc.
    let paramIndex = 1;
    const convertedSql = sql.replace(/\?/g, () => `$${paramIndex++}`);
    return { sql: convertedSql, params };
  }

  async query(sql, params = []) {
    const { sql: convertedSql, params: convertedParams } = this._convertSql(sql, params);
    return this.client.query(convertedSql, convertedParams);
  }

  async get(sql, params = []) {
    const { sql: convertedSql, params: convertedParams } = this._convertSql(sql, params);
    const result = await this.query(convertedSql, convertedParams);
    return result.rows[0] || null;
  }

  async all(sql, params = []) {
    const { sql: convertedSql, params: convertedParams } = this._convertSql(sql, params);
    const result = await this.query(convertedSql, convertedParams);
    return result.rows || [];
  }

  async run(sql, params = []) {
    const { sql: convertedSql, params: convertedParams } = this._convertSql(sql, params);
    const result = await this.query(convertedSql, convertedParams);
    return { changes: result.rowCount || 0, lastID: result.rows?.[0]?.id };
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
