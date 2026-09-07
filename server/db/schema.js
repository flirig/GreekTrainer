export const SQLITE_SCHEMA = `
CREATE TABLE IF NOT EXISTS grammar_rules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS word_lists (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS words (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  el TEXT NOT NULL UNIQUE,
  ru TEXT NOT NULL,
  rule_id INTEGER REFERENCES grammar_rules(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS word_phrases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  word_id INTEGER NOT NULL REFERENCES words(id) ON DELETE CASCADE,
  phrase_id INTEGER NOT NULL REFERENCES phrases(id) ON DELETE CASCADE,
  UNIQUE(word_id, phrase_id)
);
CREATE TABLE IF NOT EXISTS word_variants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  word_id INTEGER NOT NULL REFERENCES words(id) ON DELETE CASCADE,
  variant TEXT NOT NULL,
  type TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS list_phrases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  list_id INTEGER NOT NULL REFERENCES word_lists(id) ON DELETE CASCADE,
  phrase_id INTEGER NOT NULL REFERENCES phrases(id) ON DELETE CASCADE,
  order_index INTEGER DEFAULT 0,
  UNIQUE(list_id, phrase_id)
);
CREATE TABLE IF NOT EXISTS list_words (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  list_id INTEGER NOT NULL REFERENCES word_lists(id) ON DELETE CASCADE,
  word_id INTEGER NOT NULL REFERENCES words(id) ON DELETE CASCADE,
  order_index INTEGER DEFAULT 0,
  UNIQUE(list_id, word_id)
);
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS phrases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  el TEXT NOT NULL UNIQUE,
  ru TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS accent_variants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  phrase_id INTEGER NOT NULL REFERENCES phrases(id) ON DELETE CASCADE,
  variant TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS mistakes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  phrase_id INTEGER NOT NULL REFERENCES phrases(id) ON DELETE CASCADE,
  variant TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS stories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS story_sentences (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  story_id INTEGER NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  el TEXT NOT NULL,
  ru TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS user_progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  phrase_id INTEGER REFERENCES phrases(id) ON DELETE CASCADE,
  exercise_type TEXT,
  is_correct BOOLEAN,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_accent_variants_phrase_id ON accent_variants(phrase_id);
CREATE INDEX IF NOT EXISTS idx_mistakes_phrase_id ON mistakes(phrase_id);
CREATE INDEX IF NOT EXISTS idx_story_sentences_story_id ON story_sentences(story_id);
`;

export const POSTGRES_SCHEMA = `
CREATE TABLE IF NOT EXISTS grammar_rules (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS word_lists (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS words (
  id SERIAL PRIMARY KEY,
  el TEXT NOT NULL UNIQUE,
  ru TEXT NOT NULL,
  rule_id INTEGER REFERENCES grammar_rules(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS word_phrases (
  id SERIAL PRIMARY KEY,
  word_id INTEGER NOT NULL REFERENCES words(id) ON DELETE CASCADE,
  phrase_id INTEGER NOT NULL REFERENCES phrases(id) ON DELETE CASCADE,
  UNIQUE(word_id, phrase_id)
);
CREATE TABLE IF NOT EXISTS word_variants (
  id SERIAL PRIMARY KEY,
  word_id INTEGER NOT NULL REFERENCES words(id) ON DELETE CASCADE,
  variant TEXT NOT NULL,
  type TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS list_phrases (
  id SERIAL PRIMARY KEY,
  list_id INTEGER NOT NULL REFERENCES word_lists(id) ON DELETE CASCADE,
  phrase_id INTEGER NOT NULL REFERENCES phrases(id) ON DELETE CASCADE,
  order_index INTEGER DEFAULT 0,
  UNIQUE(list_id, phrase_id)
);
CREATE TABLE IF NOT EXISTS list_words (
  id SERIAL PRIMARY KEY,
  list_id INTEGER NOT NULL REFERENCES word_lists(id) ON DELETE CASCADE,
  word_id INTEGER NOT NULL REFERENCES words(id) ON DELETE CASCADE,
  order_index INTEGER DEFAULT 0,
  UNIQUE(list_id, word_id)
);
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS phrases (
  id SERIAL PRIMARY KEY,
  el TEXT NOT NULL UNIQUE,
  ru TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS accent_variants (
  id SERIAL PRIMARY KEY,
  phrase_id INTEGER NOT NULL REFERENCES phrases(id) ON DELETE CASCADE,
  variant TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS mistakes (
  id SERIAL PRIMARY KEY,
  phrase_id INTEGER NOT NULL REFERENCES phrases(id) ON DELETE CASCADE,
  variant TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS stories (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS story_sentences (
  id SERIAL PRIMARY KEY,
  story_id INTEGER NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  el TEXT NOT NULL,
  ru TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS user_progress (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  phrase_id INTEGER REFERENCES phrases(id) ON DELETE CASCADE,
  exercise_type TEXT,
  is_correct BOOLEAN,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_accent_variants_phrase_id ON accent_variants(phrase_id);
CREATE INDEX IF NOT EXISTS idx_mistakes_phrase_id ON mistakes(phrase_id);
CREATE INDEX IF NOT EXISTS idx_story_sentences_story_id ON story_sentences(story_id);
`;

export const INITIAL_DATA = [
  {
    el: "δίπλα στην πλατεία",
    ru: "рядом с площадью",
    accents: ["διπλά στην πλατεία", "δίπλα στήν πλατεία", "δίπλα στην πλατεια"],
    mistakes: ["δίπλα στο πλατεία", "δίπλα στην πλατία", "δείπλα στην πλατεία"]
  },
  {
    el: "περνάω από την πλατεία",
    ru: "прохожу через / мимо площади",
    accents: ["περναώ από την πλατεία", "περνάω απο τήν πλατεία", "περνάω άπο την πλατεία"],
    mistakes: ["περνάω από τον πλατεία", "περνάω απο την πλατία", "περναω από την πλατεία"]
  },
  {
    el: "μερικές φορές πάω στο μουσείο",
    ru: "иногда я хожу в музей",
    accents: ["μερικες φόρες πάω στο μουσείο", "μερικές φορές παώ στο μουσείο", "μερικές φορές πάω στό μουσείο"],
    mistakes: ["μερικές φορές πάω στη μουσείο", "μερικές φωρές πάω στο μουσείο", "μερικές φορές πάω στο μουσίο"]
  },
  {
    el: "στέλνω γράμματα στο ταχυδρομείο",
    ru: "отправляю письма на почте",
    accents: ["στελνώ γράμματα στο ταχυδρομείο", "στέλνω γραμμάτα στο ταχυδρομείο", "στέλνω γράμματα στό ταχυδρομείο"],
    mistakes: ["στέλνω γράματα στο ταχυδρομείο", "στέλνω γράμματα στη ταχυδρομείο", "σταίλνω γράμματα στο ταχυδρομείο"]
  },
  {
    el: "ζητώ κατεύθυνση για το νοσοκομείο",
    ru: "спрашиваю дорогу к больнице",
    accents: ["ζήτω κατεύθυνση για το νοσοκομείο", "ζητώ κατευθύνση για το νοσοκομείο", "ζητώ κατεύθυνση γιά το νοσοκομείο"],
    mistakes: ["ζητώ κατεύθηνση για το νοσοκομείο", "ζητώ κατεύθυνση για τη νοσοκομείο", "ζιτώ κατεύθυνση για το νοσοκομείο"]
  },
  {
    el: "είμαι απογοητευμένος από τη δουλειά",
    ru: "я разочарован в работе",
    accents: ["ειμαί απογοητευμένος από τη δουλειά", "είμαι απογοητευμενος άπο τη δουλειά", "είμαι απογοητευμένος από τή δουλειά"],
    mistakes: ["είμαι απογοητευμένος από το δουλειά", "είμε απογοητευμένος από τη δουλειά", "είμαι απογοητευμένος από τη δουλειάς"]
  }
];
