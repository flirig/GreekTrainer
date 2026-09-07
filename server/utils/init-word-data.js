import db from '../db/database.js';
import { WORD_TRANSLATIONS, GRAMMAR_RULES } from './word-translations.js';

/**
 * Initialize grammar rules and update word translations
 */
export async function initializeWordData(database) {
  try {
    console.log('📚 Initializing grammar rules and word data...');

    // Add grammar rules
    console.log('📝 Creating grammar rules...');
    const ruleMap = new Map();

    for (const rule of GRAMMAR_RULES) {
      try {
        const existing = await database.get(
          'SELECT id FROM grammar_rules WHERE name = ?',
          [rule.name]
        );

        if (existing) {
          ruleMap.set(rule.name, existing.id);
          continue;
        }

        const result = await database.run(
          'INSERT INTO grammar_rules (name, description) VALUES (?, ?)',
          [rule.name, rule.description]
        );

        const ruleId = result.lastID || (await database.get(
          'SELECT id FROM grammar_rules WHERE name = ?',
          [rule.name]
        ))?.id;

        ruleMap.set(rule.name, ruleId);
        console.log(`   ✅ ${rule.name}`);
      } catch (error) {
        console.error(`   ⚠️  Error creating rule ${rule.name}:`, error.message);
      }
    }

    console.log(`✅ ${ruleMap.size} grammar rules ready`);

    // Update word translations and link to rules
    console.log('🔄 Updating word translations and linking to rules...');
    let updated = 0;
    let errors = 0;

    for (const [el, data] of Object.entries(WORD_TRANSLATIONS)) {
      try {
        const word = await database.get(
          'SELECT id FROM words WHERE el = ?',
          [el]
        );

        if (!word) {
          // Add new word if not exists
          const result = await database.run(
            'INSERT INTO words (el, ru, rule_id) VALUES (?, ?, ?)',
            [el, data.ru, ruleMap.get(data.rule) || null]
          );

          const wordId = result.lastID || (await database.get(
            'SELECT id FROM words WHERE el = ?',
            [el]
          ))?.id;

          updated++;
          continue;
        }

        // Update existing word
        const ruleId = ruleMap.get(data.rule);
        await database.run(
          'UPDATE words SET ru = ?, rule_id = ? WHERE id = ?',
          [data.ru, ruleId || null, word.id]
        );

        updated++;
      } catch (error) {
        console.error(`⚠️  Error updating word "${el}":`, error.message);
        errors++;
      }
    }

    console.log(`✅ ${updated} words updated`);
    if (errors > 0) {
      console.log(`⚠️  ${errors} errors encountered`);
    }

    return {
      success: true,
      rulesCreated: ruleMap.size,
      wordsUpdated: updated,
      errors,
      message: `Initialized ${ruleMap.size} grammar rules and updated ${updated} words`
    };
  } catch (error) {
    console.error('❌ Error initializing word data:', error);
    throw error;
  }
}

// If run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const dbModule = await import('../db/database.js');
  const dbInstance = dbModule.default;
  const database = await dbInstance.get();
  try {
    const result = await initializeWordData(database);
    console.log('\n' + result.message);
    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
}

export default initializeWordData;
