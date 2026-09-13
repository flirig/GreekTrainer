#!/usr/bin/env node

const pg = require('pg');
const fs = require('fs');
const path = require('path');

const migrationDir = path.join(__dirname, 'migrations');

async function runMigrations() {
  const client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('✓ Connected to database');

    // Create migrations table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Migrations table ready');

    // Get list of migration files
    const files = fs.readdirSync(migrationDir)
      .filter(f => f.startsWith('00') && (f.endsWith('.sql') || f.endsWith('.js')))
      .sort();

    if (files.length === 0) {
      console.log('No migrations found');
      return;
    }

    // Check which migrations have already run
    const result = await client.query('SELECT name FROM migrations ORDER BY executed_at;');
    const executedMigrations = new Set(result.rows.map(r => r.name));

    // Run pending migrations
    let migrationCount = 0;
    for (const file of files) {
      const migrationName = file.replace(/\.(sql|js)$/, '');

      if (executedMigrations.has(migrationName)) {
        console.log(`⊘ ${migrationName} (already executed)`);
        continue;
      }

      console.log(`→ Running ${migrationName}...`);

      try {
        if (file.endsWith('.sql')) {
          // Execute SQL migration
          const sqlContent = fs.readFileSync(path.join(migrationDir, file), 'utf8');
          await client.query(sqlContent);
        } else if (file.endsWith('.js')) {
          // Execute JavaScript migration
          const migration = require(path.join(migrationDir, file));
          if (typeof migration === 'function') {
            await migration(client);
          } else if (migration.up) {
            await migration.up(client);
          } else {
            // Just load data from the module
            const { articles, verbs, nouns } = migration;

            if (articles) {
              for (const article of articles) {
                await client.query(
                  `INSERT INTO articles (article, is_definite, gender, number, article_case)
                   VALUES ($1, $2, $3, $4, $5)
                   ON CONFLICT DO NOTHING`,
                  [article.article, article.is_definite, article.gender, article.number, article.case]
                );
              }
              console.log(`  → Loaded ${articles.length} articles`);
            }

            if (verbs) {
              for (const verb of verbs) {
                const verbResult = await client.query(
                  `INSERT INTO lemmas (word, pos, conjugation_type, english_translation)
                   VALUES ($1, $2, $3, $4)
                   ON CONFLICT DO NOTHING
                   RETURNING id`,
                  [verb.word, 'verb', verb.type, verb.english]
                );

                if (verbResult.rows.length > 0) {
                  const lemmaId = verbResult.rows[0].id;
                  // Add present tense forms
                  const forms = [
                    { form: verb.word, person: 1, number: 'singular' },
                    { form: verb.word.replace(/ω$/, 'εις'), person: 2, number: 'singular' },
                    { form: verb.word.replace(/ω$/, 'ει'), person: 3, number: 'singular' },
                    { form: verb.word.replace(/ω$/, 'ουμε'), person: 1, number: 'plural' },
                    { form: verb.word.replace(/ω$/, 'ετε'), person: 2, number: 'plural' },
                    { form: verb.word.replace(/ω$/, 'ουν'), person: 3, number: 'plural' },
                  ];

                  for (const form of forms) {
                    await client.query(
                      `INSERT INTO forms (lemma_id, form, morphology)
                       VALUES ($1, $2, $3)
                       ON CONFLICT DO NOTHING`,
                      [lemmaId, form.form, JSON.stringify({
                        tense: 'present',
                        person: form.person,
                        number: form.number
                      })]
                    );
                  }
                }
              }
              console.log(`  → Loaded ${verbs.length} verbs with conjugations`);
            }

            if (nouns) {
              for (const noun of nouns) {
                const nounResult = await client.query(
                  `INSERT INTO lemmas (word, pos, gender, declension_class, english_translation)
                   VALUES ($1, $2, $3, $4, $5)
                   ON CONFLICT DO NOTHING
                   RETURNING id`,
                  [noun.word, 'noun', noun.gender, noun.declension, noun.english]
                );

                if (nounResult.rows.length > 0) {
                  const lemmaId = nounResult.rows[0].id;
                  // Add basic declensions
                  const forms = [
                    { form: noun.word, case: 'nominative', number: 'singular' },
                    { form: noun.word.replace(/α$/, 'ας'), case: 'genitive', number: 'singular' },
                    { form: noun.word, case: 'accusative', number: 'singular' },
                  ];

                  for (const form of forms) {
                    await client.query(
                      `INSERT INTO forms (lemma_id, form, morphology)
                       VALUES ($1, $2, $3)
                       ON CONFLICT DO NOTHING`,
                      [lemmaId, form.form, JSON.stringify({
                        case: form.case,
                        number: form.number,
                        gender: noun.gender
                      })]
                    );
                  }
                }
              }
              console.log(`  → Loaded ${nouns.length} nouns with declensions`);
            }

            // Mark migration as executed
            await client.query(
              `INSERT INTO migrations (name) VALUES ($1)`,
              [migrationName]
            );
          }
        }

        console.log(`✓ ${migrationName} completed`);
        migrationCount++;
      } catch (err) {
        console.error(`✗ ${migrationName} failed:`, err.message);
        throw err;
      }
    }

    console.log(`\n✓ All migrations completed! (${migrationCount} new migrations)`);

    // Show summary
    const summary = await client.query(`
      SELECT COUNT(*) as article_count FROM articles;
    `);
    const verbSummary = await client.query(`
      SELECT COUNT(*) as verb_count FROM lemmas WHERE pos='verb';
    `);
    const nounSummary = await client.query(`
      SELECT COUNT(*) as noun_count FROM lemmas WHERE pos='noun';
    `);

    console.log('\nDatabase Summary:');
    console.log(`  Articles: ${summary.rows[0].article_count}`);
    console.log(`  Verbs: ${verbSummary.rows[0].verb_count}`);
    console.log(`  Nouns: ${nounSummary.rows[0].noun_count}`);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run migrations
runMigrations();
