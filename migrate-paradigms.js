#!/usr/bin/env node

/**
 * Paradigm Migration Script
 * Creates paradigm tables and loads data
 * Works with both SQLite (dev) and PostgreSQL (production)
 */

import db from './server/db/database.js';

const PARADIGMS = [
  { code: 'Ρ10.1', name: 'Verb Class 10 Variant 1', type: 'verb', description: 'Present active verbs ending in -ώ (e.g., αγαπώ)', examples: ['αγαπώ'] },
  { code: 'Ρ10.10', name: 'Verb Class 10 Variant 10', type: 'verb', description: 'Present active verbs ending in -ώ with stressed stem', examples: ['μπορώ'] },
  { code: 'Ρ2.1', name: 'Verb Class 2 Variant 1', type: 'verb', description: 'Present active verbs with stem change pattern', examples: ['διαβάζω'] },
  { code: 'Ρ5.2', name: 'Verb Class 5 Variant 2', type: 'verb', description: 'Present active verbs with regular conjugation', examples: ['δουλεύω'] }
];

const PARADIGM_RULES = [
  { paradigm_code: 'Ρ10.1', tense: 'present', person: '1st', number: 'singular', ending: 'ώ', rule: 'stem + ώ', example: 'αγαπώ' },
  { paradigm_code: 'Ρ10.1', tense: 'present', person: '2nd', number: 'singular', ending: 'άς', rule: 'stem + άς', example: 'αγαπάς' },
  { paradigm_code: 'Ρ10.1', tense: 'present', person: '3rd', number: 'singular', ending: 'ά', rule: 'stem + ά', example: 'αγαπά' },
  { paradigm_code: 'Ρ10.1', tense: 'present', person: '1st', number: 'plural', ending: 'ούμε', rule: 'stem + ούμε', example: 'αγαπούμε' },
  { paradigm_code: 'Ρ10.1', tense: 'present', person: '2nd', number: 'plural', ending: 'άτε', rule: 'stem + άτε', example: 'αγαπάτε' },
  { paradigm_code: 'Ρ10.1', tense: 'present', person: '3rd', number: 'plural', ending: 'ούν', rule: 'stem + ούν', example: 'αγαπούν' },

  { paradigm_code: 'Ρ10.10', tense: 'present', person: '1st', number: 'singular', ending: 'ώ', rule: 'stem + ώ', example: 'μπορώ' },
  { paradigm_code: 'Ρ10.10', tense: 'present', person: '2nd', number: 'singular', ending: 'είς', rule: 'stem + είς', example: 'μπορείς' },
  { paradigm_code: 'Ρ10.10', tense: 'present', person: '3rd', number: 'singular', ending: 'εί', rule: 'stem + εί', example: 'μπορεί' },
  { paradigm_code: 'Ρ10.10', tense: 'present', person: '1st', number: 'plural', ending: 'ούμε', rule: 'stem + ούμε', example: 'μπορούμε' },
  { paradigm_code: 'Ρ10.10', tense: 'present', person: '2nd', number: 'plural', ending: 'είτε', rule: 'stem + είτε', example: 'μπορείτε' },
  { paradigm_code: 'Ρ10.10', tense: 'present', person: '3rd', number: 'plural', ending: 'ούν', rule: 'stem + ούν', example: 'μπορούν' },

  { paradigm_code: 'Ρ2.1', tense: 'present', person: '1st', number: 'singular', ending: 'ω', rule: 'stem + ω', example: 'διαβάζω' },
  { paradigm_code: 'Ρ2.1', tense: 'present', person: '2nd', number: 'singular', ending: 'εις', rule: 'stem + εις', example: 'διαβάζεις' },
  { paradigm_code: 'Ρ2.1', tense: 'present', person: '3rd', number: 'singular', ending: 'ει', rule: 'stem + ει', example: 'διαβάζει' },
  { paradigm_code: 'Ρ2.1', tense: 'present', person: '1st', number: 'plural', ending: 'ουμε', rule: 'stem + ουμε', example: 'διαβάζουμε' },
  { paradigm_code: 'Ρ2.1', tense: 'present', person: '2nd', number: 'plural', ending: 'ετε', rule: 'stem + ετε', example: 'διαβάζετε' },
  { paradigm_code: 'Ρ2.1', tense: 'present', person: '3rd', number: 'plural', ending: 'ουν', rule: 'stem + ουν', example: 'διαβάζουν' },

  { paradigm_code: 'Ρ5.2', tense: 'present', person: '1st', number: 'singular', ending: 'ω', rule: 'stem + ω', example: 'δουλεύω' },
  { paradigm_code: 'Ρ5.2', tense: 'present', person: '2nd', number: 'singular', ending: 'εις', rule: 'stem + εις', example: 'δουλεύεις' },
  { paradigm_code: 'Ρ5.2', tense: 'present', person: '3rd', number: 'singular', ending: 'ει', rule: 'stem + ει', example: 'δουλεύει' },
  { paradigm_code: 'Ρ5.2', tense: 'present', person: '1st', number: 'plural', ending: 'ουμε', rule: 'stem + ουμε', example: 'δουλεύουμε' },
  { paradigm_code: 'Ρ5.2', tense: 'present', person: '2nd', number: 'plural', ending: 'ετε', rule: 'stem + ετε', example: 'δουλεύετε' },
  { paradigm_code: 'Ρ5.2', tense: 'present', person: '3rd', number: 'plural', ending: 'ουν', rule: 'stem + ουν', example: 'δουλεύουν' }
];

const WORD_PARADIGM_MAP = {
  'αγαπώ': 'Ρ10.1',
  'μπορώ': 'Ρ10.10',
  'δουλεύω': 'Ρ5.2',
  'διαβάζω': 'Ρ2.1'
};

async function migrate() {
  console.log('📚 Paradigm Migration\n');

  const database = await db.get();

  try {
    // 1. Create tables
    console.log('📋 Creating tables...');
    await database.run(`
      CREATE TABLE IF NOT EXISTS paradigms (
        id INTEGER PRIMARY KEY,
        code TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        description TEXT,
        examples TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await database.run(`
      CREATE TABLE IF NOT EXISTS paradigm_rules (
        id INTEGER PRIMARY KEY,
        paradigm_id INTEGER NOT NULL REFERENCES paradigms(id) ON DELETE CASCADE,
        tense TEXT,
        person TEXT,
        number TEXT,
        ending TEXT NOT NULL,
        rule_description TEXT,
        example_form TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await database.run(`
      CREATE TABLE IF NOT EXISTS word_paradigm (
        id INTEGER PRIMARY KEY,
        word_id INTEGER NOT NULL UNIQUE REFERENCES words(id) ON DELETE CASCADE,
        paradigm_id INTEGER REFERENCES paradigms(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Tables created\n');

    // 2. Insert paradigms
    console.log('💾 Inserting paradigms...');
    for (const p of PARADIGMS) {
      await database.run(
        'INSERT OR IGNORE INTO paradigms (code, name, type, description, examples) VALUES (?, ?, ?, ?, ?)',
        [p.code, p.name, p.type, p.description, JSON.stringify(p.examples)]
      );
    }
    console.log(`✅ ${PARADIGMS.length} paradigms\n`);

    // 3. Get paradigm IDs and insert rules
    console.log('💾 Inserting paradigm rules...');
    const paradigmRows = await database.all('SELECT id, code FROM paradigms');
    const paradigmIdMap = {};
    for (const row of paradigmRows) {
      paradigmIdMap[row.code] = row.id;
    }

    for (const rule of PARADIGM_RULES) {
      const paradigmId = paradigmIdMap[rule.paradigm_code];
      if (!paradigmId) continue;

      await database.run(
        'INSERT INTO paradigm_rules (paradigm_id, tense, person, number, ending, rule_description, example_form) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [paradigmId, rule.tense, rule.person, rule.number, rule.ending, rule.rule, rule.example]
      );
    }
    console.log(`✅ ${PARADIGM_RULES.length} rules\n`);

    // 4. Link words to paradigms
    console.log('💾 Linking words...');
    let linked = 0;
    for (const [lemma, paradigmCode] of Object.entries(WORD_PARADIGM_MAP)) {
      const paradigmId = paradigmIdMap[paradigmCode];
      if (!paradigmId) continue;

      const word = await database.get('SELECT id FROM words WHERE el = ?', [lemma]);
      if (!word) continue;

      await database.run(
        'INSERT OR IGNORE INTO word_paradigm (word_id, paradigm_id) VALUES (?, ?)',
        [word.id, paradigmId]
      );
      linked++;
    }
    console.log(`✅ ${linked} words linked\n`);
    console.log('✅ Paradigm migration complete!');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrate()
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

export default migrate;
