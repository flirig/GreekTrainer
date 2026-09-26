#!/usr/bin/env node

/**
 * Triantafyllides Scraper - Ethical & Human-like
 *
 * Features:
 * - Human-like delays (2-5 seconds between requests)
 * - Caching (never request same word twice)
 * - Honest User-Agent identification
 * - Connection: close (polite disconnection)
 * - Structured error handling
 */

import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as cheerio from 'cheerio';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class GreekLexiconScraper {
  constructor() {
    this.baseUrl = 'https://www.greek-language.gr/greekLang/modern_greek/tools/lexica/triantafyllides';
    this.cacheFile = path.join(__dirname, '../data/greek-lexicon-cache.json');
    this.resultsFile = path.join(__dirname, '../data/greek-lexicon-parsed.json');

    // Human-like settings
    this.minDelayMs = 2000;  // 2 seconds minimum
    this.maxDelayMs = 5000;  // 5 seconds maximum
    this.userAgent = 'GreekTrainer-Educational/1.0 (+https://github.com/YOUR_REPO/issues) Mozilla/5.0';

    // Ensure data directory exists
    this.ensureDir();
  }

  ensureDir() {
    const dir = path.dirname(this.cacheFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  // Random delay to appear human-like
  randomDelay() {
    const delay = this.minDelayMs + Math.random() * (this.maxDelayMs - this.minDelayMs);
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  // Load cache from disk
  loadCache() {
    try {
      if (fs.existsSync(this.cacheFile)) {
        const data = fs.readFileSync(this.cacheFile, 'utf8');
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('⚠️ Cache load error:', e.message);
    }
    return {};
  }

  // Save cache to disk
  saveCache(cache) {
    try {
      fs.writeFileSync(this.cacheFile, JSON.stringify(cache, null, 2));
      console.log('💾 Cache saved');
    } catch (e) {
      console.error('❌ Cache save error:', e.message);
    }
  }

  // Parse HTML response for paradigm and forms
  parseHtml(html, word) {
    try {
      const $ = cheerio.load(html);

      // Find the lemma entry
      const $entry = $('dl[id]').first();

      if (!$entry.length) {
        return null;
      }

      const $dt = $entry.find('dt').first();

      // Extract lemma
      const lemma = $dt.find('b').first().text().trim();

      // Extract paradigm code (e.g., "Ρ10.1")
      let paradigmCode = null;
      const paradigmMatch = $dt.text().match(/[ΡΔΑ]\d+\.\d+/);
      if (paradigmMatch) {
        paradigmCode = paradigmMatch[0];
      }

      // Extract pronunciation
      let pronunciation = null;
      const pronounceMatch = $dt.text().match(/\[([^\]]+)\]/);
      if (pronounceMatch) {
        pronunciation = pronounceMatch[1];
      }

      // Extract flexible forms (e.g., "-άω, -ιέμαι")
      let flexibleForms = [];
      const flexMatch = $dt.text().match(/&\s*<b>([^<]+)<\/b>/);
      if (flexMatch) {
        flexibleForms = flexMatch[1].split(',').map(f => f.trim());
      }

      // Extract Russian translation (if available in context)
      // This is tricky as it's in the definitions; we'll try to get first definition
      let definition = null;
      const $dd = $entry.find('dd').first();
      if ($dd.length) {
        definition = $dd.text().substring(0, 200); // First 200 chars
      }

      return {
        word,
        lemma,
        paradigmCode,
        pronunciation,
        flexibleForms,
        definition: definition || 'N/A',
        timestamp: new Date().toISOString()
      };
    } catch (e) {
      console.error(`❌ Parse error for ${word}:`, e.message);
      return null;
    }
  }

  // Fetch single word from Triantafyllides
  async fetchWord(word) {
    const cache = this.loadCache();

    // Check cache first
    if (cache[word]) {
      console.log(`✅ Cache hit: ${word}`);
      return cache[word];
    }

    // Wait before fetching (human-like behavior)
    await this.randomDelay();

    try {
      const url = `${this.baseUrl}/search.html?lq=${encodeURIComponent(word)}`;

      console.log(`⏳ Fetching: ${word} (${Object.keys(cache).length + 1}/50)`);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': this.userAgent,
          'Accept-Language': 'el,en;q=0.9',
          'Accept': 'text/html,application/xhtml+xml',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'close', // Polite: close connection after use
          'Referer': 'https://www.greek-language.gr/'
        },
        timeout: 10000
      });

      // Check for rate limiting
      if (response.status === 429) {
        console.warn('⚠️ Rate limited (429)! Waiting 30 seconds...');
        await new Promise(r => setTimeout(r, 30000));
        return await this.fetchWord(word); // Retry
      }

      if (!response.ok) {
        console.warn(`⚠️ HTTP ${response.status} for ${word}`);
        return null;
      }

      const html = await response.text();
      const parsed = this.parseHtml(html, word);

      // Save to cache even if parse failed (to avoid re-requesting)
      cache[word] = parsed;
      this.saveCache(cache);

      if (parsed) {
        console.log(`✓ ${word} → paradigm: ${parsed.paradigmCode}`);
      }

      return parsed;
    } catch (error) {
      console.error(`❌ Error fetching ${word}:`, error.message);
      return null;
    }
  }

  // Scrape multiple words
  async scrapeWords(words) {
    console.log(`\n🚀 Starting scraper for ${words.length} words`);
    console.log(`📝 Delay: ${this.minDelayMs}-${this.maxDelayMs}ms between requests`);
    console.log(`🔒 User-Agent: ${this.userAgent}\n`);

    const results = {};
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const parsed = await this.fetchWord(word);

      results[word] = parsed;

      if (parsed) {
        successCount++;
      } else {
        failCount++;
      }

      // Progress
      const progress = Math.round((i + 1) / words.length * 100);
      console.log(`[${progress}%] ${i + 1}/${words.length}\n`);
    }

    console.log(`\n✅ Scraping complete!`);
    console.log(`   Success: ${successCount}/${words.length}`);
    console.log(`   Failed: ${failCount}/${words.length}`);
    console.log(`   Total time: ~${Math.round((words.length * 3.5) / 60)} minutes\n`);

    return results;
  }

  // Save results to JSON
  saveResults(results) {
    try {
      fs.writeFileSync(this.resultsFile, JSON.stringify(results, null, 2));
      console.log(`📊 Results saved to: ${this.resultsFile}`);

      // Print summary
      const paradigms = new Set(
        Object.values(results)
          .filter(r => r && r.paradigmCode)
          .map(r => r.paradigmCode)
      );

      console.log(`\n📈 Summary:`);
      console.log(`   Total words: ${Object.keys(results).length}`);
      console.log(`   Unique paradigms found: ${paradigms.size}`);
      console.log(`   Paradigms: ${[...paradigms].sort().join(', ')}`);

      return true;
    } catch (e) {
      console.error('❌ Save error:', e.message);
      return false;
    }
  }
}

// MVP: 50 most common Modern Greek words
const MVP_WORDS = [
  // Most common verbs (20)
  'είμαι', 'έχω', 'κάνω', 'πηγαίνω', 'λέω', 'δίνω', 'βρίσκω', 'ξέρω', 'θέλω', 'μπορώ',
  'μένω', 'έρχομαι', 'δουλεύω', 'αγαπώ', 'ακούω', 'βλέπω', 'γράφω', 'διαβάζω', 'τρώω', 'πίνω',

  // Most common nouns (20)
  'άνθρωπος', 'γυναίκα', 'άντρας', 'παιδί', 'μάνα', 'πατέρας', 'αδελφός', 'αδελφή', 'φίλος', 'δάσκαλος',
  'σπίτι', 'δρόμος', 'πόλη', 'χώρα', 'ημέρα', 'νύχτα', 'ώρα', 'χρόνος', 'έτος', 'κόσμος',

  // Most common adjectives (10)
  'καλός', 'μεγάλος', 'μικρός', 'νέος', 'παλιός', 'όμορφος', 'άσχημος', 'κόκκινος', 'μαύρος', 'λευκός'
];

// Main
async function main() {
  const scraper = new GreekLexiconScraper();

  console.log('\n╔════════════════════════════════════════╗');
  console.log('║  Triantafyllides Lexicon Scraper      ║');
  console.log('║  Educational Project - MVP Data      ║');
  console.log('╚════════════════════════════════════════╝\n');

  // Scrape words
  const results = await scraper.scrapeWords(MVP_WORDS);

  // Save results
  scraper.saveResults(results);

  console.log(`\n✅ MVP data ready for: Task #7 (Database Migration)`);
  console.log(`📂 Next: Load data into paradigms tables\n`);
}

main().catch(console.error);
