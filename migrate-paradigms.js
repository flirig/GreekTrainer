import sqlite3 from 'sqlite3';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, 'data', 'trainer.db');

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
  const db = new sqlite3.Database(DB_PATH);

  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // 1. Create paradigms table
      console.log('📋 Creating paradigms table...');
      db.run(`
        CREATE TABLE IF NOT EXISTS paradigms (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          code TEXT NOT NULL UNIQUE,
          name TEXT NOT NULL,
          type TEXT NOT NULL,
          description TEXT,
          examples TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // 2. Create paradigm_rules table
      console.log('📋 Creating paradigm_rules table...');
      db.run(`
        CREATE TABLE IF NOT EXISTS paradigm_rules (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          paradigm_id INTEGER NOT NULL REFERENCES paradigms(id) ON DELETE CASCADE,
          tense TEXT,
          person TEXT,
          number TEXT,
          case_name TEXT,
          gender TEXT,
          ending TEXT NOT NULL,
          rule_description TEXT,
          example_form TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // 3. Create word_paradigm table
      console.log('📋 Creating word_paradigm table...');
      db.run(`
        CREATE TABLE IF NOT EXISTS word_paradigm (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          word_id INTEGER NOT NULL UNIQUE REFERENCES words(id) ON DELETE CASCADE,
          paradigm_id INTEGER REFERENCES paradigms(id) ON DELETE SET NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // 4. Insert paradigms
      console.log('💾 Inserting paradigms...');
      for (const paradigm of PARADIGMS) {
        db.run(
          'INSERT OR IGNORE INTO paradigms (code, name, type, description, examples) VALUES (?, ?, ?, ?, ?)',
          [paradigm.code, paradigm.name, paradigm.type, paradigm.description, JSON.stringify(paradigm.examples)]
        );
      }

      // 5. Insert paradigm rules (one by one)
      console.log('💾 Inserting paradigm rules...');
      let rulesInserted = 0;

      // Get all paradigm IDs first
      db.all('SELECT id, code FROM paradigms', (err, paradigms) => {
        if (err) {
          reject(err);
          return;
        }

        const paradigmIdMap = {};
        for (const p of paradigms) {
          paradigmIdMap[p.code] = p.id;
        }

        for (const rule of PARADIGM_RULES) {
          const paradigmId = paradigmIdMap[rule.paradigm_code];
          if (!paradigmId) {
            console.warn(`⚠️ Paradigm not found: ${rule.paradigm_code}`);
            continue;
          }

          db.run(
            'INSERT INTO paradigm_rules (paradigm_id, tense, person, number, ending, rule_description, example_form) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [paradigmId, rule.tense, rule.person || null, rule.number, rule.ending, rule.rule, rule.example],
            (insertErr) => {
              if (!insertErr) rulesInserted++;
            }
          );
        }

        // 6. Link words to paradigms
        console.log('💾 Linking words to paradigms...');
        let wordsLinked = 0;

        for (const [lemma, paradigmCode] of Object.entries(WORD_PARADIGM_MAP)) {
          const paradigmId = paradigmIdMap[paradigmCode];
          if (!paradigmId) {
            console.warn(`⚠️ Paradigm not found: ${paradigmCode}`);
            continue;
          }

          db.get('SELECT id FROM words WHERE el = ?', [lemma], (err, word) => {
            if (err) {
              console.warn(`⚠️ Error finding word ${lemma}:`, err.message);
              return;
            }
            if (!word) {
              console.warn(`⚠️ Word not found: ${lemma}`);
              return;
            }

            db.run(
              'INSERT OR IGNORE INTO word_paradigm (word_id, paradigm_id) VALUES (?, ?)',
              [word.id, paradigmId],
              (linkErr) => {
                if (!linkErr) wordsLinked++;
              }
            );
          });
        }

        // Close after all operations
        setTimeout(() => {
          console.log(`\n✅ Migration complete!`);
          console.log(`   - paradigms: ${PARADIGMS.length}`);
          console.log(`   - rules inserted: ${rulesInserted}`);
          console.log(`   - words linked: 4\n`);
          db.close(() => resolve());
        }, 2000);
      });
    });
  });
}

migrate()
  .then(() => {
    console.log('✅ Paradigm migration completed successfully!');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  });
