# Triantafyllides Scraper - Ethical Data Extraction

🚀 **Human-like scraper for Modern Greek lexicon data**

## Features

✅ **Ethical scraping:**
- Random delays (2-5 seconds between requests)
- Honest User-Agent identification
- Caching (never request same word twice)
- Polite connection handling

✅ **Data extraction:**
- Lemma (dictionary form)
- Paradigm codes (Ρ10.1, Δ2.1, etc.)
- Pronunciation
- Flexible forms (variants)
- Definition snippets

## Installation

```bash
cd scraper
npm install
```

## Usage

### Quick Start: Scrape MVP (50 words)

```bash
npm start
# or
node scraper.js
```

**Time estimate:** ~3 minutes (50 words × 3.5 seconds = 175 seconds)

### Output

Creates two files:

```
../data/greek-lexicon-cache.json      # Raw cache (for resume)
../data/greek-lexicon-parsed.json     # Parsed results (for import)
```

### Example Output

```json
{
  "αγαπώ": {
    "word": "αγαπώ",
    "lemma": "αγαπώ",
    "paradigmCode": "Ρ10.1",
    "pronunciation": "[aγapó]",
    "flexibleForms": ["-άω", "-ιέμαι"],
    "definition": "αισθάνομαι για κπ. ή για κτ. αγάπη...",
    "timestamp": "2026-09-26T10:30:00.000Z"
  },
  ...
}
```

## How It Works

### 1. Human-like Behavior

```javascript
// Random delays to appear natural
randomDelay() {
  delay = 2000-5000ms (random)
}

// Honest User-Agent
User-Agent: GreekTrainer-Educational/1.0 (+https://github.com/YOUR_REPO)

// Polite headers
Connection: close
Accept-Language: el,en;q=0.9
Referer: https://www.greek-language.gr/
```

### 2. Caching

```javascript
// Check cache before requesting
if (cache[word]) return cache[word];

// Save to cache even if failed
cache[word] = parsed;
saveCache(cache);
```

### 3. Resume-able

If scraper stops (network error, etc.):
- Cache already saved
- Just run again - it resumes from where it left off
- No duplicate requests

### 4. Rate Limit Handling

```javascript
if (response.status === 429) {
  console.warn('Rate limited! Waiting 30 seconds...');
  // Retry after delay
}
```

## Data Structure

Each entry contains:

| Field | Example | Purpose |
|-------|---------|---------|
| `word` | "αγαπώ" | Original search term |
| `lemma` | "αγαπώ" | Dictionary form |
| `paradigmCode` | "Ρ10.1" | Grammatical class |
| `pronunciation` | "[aγapó]" | How to pronounce |
| `flexibleForms` | ["-άω", "-ιέμαι"] | Verb variants |
| `definition` | "αισθάνομαι..." | Meaning snippet |

## MVP Words (50)

### Verbs (20)
είμαι, έχω, κάνω, πηγαίνω, λέω, δίνω, βρίσκω, ξέρω, θέλω, μπορώ, μένω, έρχομαι, δουλεύω, αγαπώ, ακούω, βλέπω, γράφω, διαβάζω, τρώω, πίνω

### Nouns (20)
άνθρωπος, γυναίκα, άντρας, παιδί, μάνα, πατέρας, αδελφός, αδελφή, φίλος, δάσκαλος, σπίτι, δρόμος, πόλη, χώρα, ημέρα, νύχτα, ώρα, χρόνος, έτος, κόσμος

### Adjectives (10)
καλός, μεγάλος, μικρός, νέος, παλιός, όμορφος, άσχημος, κόκκινος, μαύρος, λευκός

## Troubleshooting

### Network error / Timeout
- Scraper automatically retries after timeout
- Check internet connection
- Run again - it resumes from cache

### Rate limited (429)
- Scraper waits 30 seconds automatically
- Slow down interval if persistent:
  ```javascript
  this.minDelayMs = 3000;  // 3 seconds
  this.maxDelayMs = 7000;  // 7 seconds
  ```

### Parse errors
- Some words might not be found (not in lexicon)
- Check if word exists on triantafyllides.gr manually
- Fix typos in MVP_WORDS list

## Performance

```
Time per request: 2-5 seconds (human-like delay)
Parallel requests: 1 (sequential, polite)
Total time for 50 words: ~3 minutes
Requests per hour: 720 (very modest)
```

## Ethics

This scraper follows ethical guidelines:
- ✅ No commercial use (educational only)
- ✅ Respects rate limits (human-like delays)
- ✅ Honest identification (User-Agent)
- ✅ Minimal load (sequential requests)
- ✅ Cacheable (never asks twice)

For commercial or large-scale use, please contact the Centre for the Greek Language: info@greeklanguage.gr

## Next Steps

After scraping:
1. Review `greek-lexicon-parsed.json`
2. Use data in Task #7 (Database Migration)
3. Map paradigm codes to database tables

## License

MIT - Educational use only
