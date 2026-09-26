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
CREATE TABLE IF NOT EXISTS word_categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  icon TEXT,
  is_system BOOLEAN DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS words (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  el TEXT NOT NULL UNIQUE,
  ru TEXT NOT NULL,
  rule_id INTEGER REFERENCES grammar_rules(id) ON DELETE SET NULL,
  category_id INTEGER REFERENCES word_categories(id) ON DELETE SET NULL,
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
CREATE TABLE IF NOT EXISTS user_word_categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, name)
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
CREATE TABLE IF NOT EXISTS grammar_topics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  name_ru TEXT NOT NULL,
  icon TEXT,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS verb_conjugations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  infinitive_el TEXT NOT NULL,
  infinitive_ru TEXT NOT NULL,
  person TEXT NOT NULL,
  form_el TEXT NOT NULL,
  form_ru TEXT NOT NULL,
  tense TEXT DEFAULT 'present',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(infinitive_el, person, tense)
);
CREATE TABLE IF NOT EXISTS noun_articles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  noun_el TEXT NOT NULL,
  noun_ru TEXT NOT NULL,
  gender TEXT NOT NULL,
  article_el TEXT NOT NULL,
  example_el TEXT,
  example_ru TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(noun_el, gender)
);
CREATE TABLE IF NOT EXISTS article_declensions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  number TEXT NOT NULL,
  case_name TEXT NOT NULL,
  gender TEXT NOT NULL,
  article_el TEXT NOT NULL,
  example_el TEXT,
  example_ru TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(number, case_name, gender)
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
CREATE TABLE IF NOT EXISTS word_categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  icon TEXT,
  is_system BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS stories (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
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
CREATE TABLE IF NOT EXISTS words (
  id SERIAL PRIMARY KEY,
  el TEXT NOT NULL UNIQUE,
  ru TEXT NOT NULL,
  rule_id INTEGER REFERENCES grammar_rules(id) ON DELETE SET NULL,
  category_id INTEGER REFERENCES word_categories(id) ON DELETE SET NULL,
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
CREATE TABLE IF NOT EXISTS user_word_categories (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, name)
);
CREATE TABLE IF NOT EXISTS story_sentences (
  id SERIAL PRIMARY KEY,
  story_id INTEGER NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  el TEXT NOT NULL,
  ru TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
CREATE TABLE IF NOT EXISTS user_progress (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  phrase_id INTEGER REFERENCES phrases(id) ON DELETE CASCADE,
  exercise_type TEXT,
  is_correct BOOLEAN,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS grammar_topics (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  name_ru TEXT NOT NULL,
  icon TEXT,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS verb_conjugations (
  id SERIAL PRIMARY KEY,
  infinitive_el TEXT NOT NULL,
  infinitive_ru TEXT NOT NULL,
  person TEXT NOT NULL,
  form_el TEXT NOT NULL,
  form_ru TEXT NOT NULL,
  tense TEXT DEFAULT 'present',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(infinitive_el, person, tense)
);
CREATE TABLE IF NOT EXISTS noun_articles (
  id SERIAL PRIMARY KEY,
  noun_el TEXT NOT NULL,
  noun_ru TEXT NOT NULL,
  gender TEXT NOT NULL,
  article_el TEXT NOT NULL,
  example_el TEXT,
  example_ru TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(noun_el, gender)
);
CREATE TABLE IF NOT EXISTS article_declensions (
  id SERIAL PRIMARY KEY,
  number TEXT NOT NULL,
  case_name TEXT NOT NULL,
  gender TEXT NOT NULL,
  article_el TEXT NOT NULL,
  example_el TEXT,
  example_ru TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(number, case_name, gender)
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

export const GRAMMAR_TOPICS = [
  {
    name: 'verb-be',
    name_ru: 'Глагол "быть" (είμαι)',
    icon: '⚡',
    description: 'Спряжение глагола είμαι в настоящем времени'
  },
  {
    name: 'definite-article',
    name_ru: 'Определённые артикли (ο, η, το)',
    icon: '📄',
    description: 'Определённые артикли греческого языка по родам'
  }
];

export const NOUN_ARTICLES_DATA = [
  { noun_el: 'πατέρας', noun_ru: 'отец', gender: 'Αρσενικό', article_el: 'ο', example_el: 'ο πατέρας', example_ru: 'отец' },
  { noun_el: 'αδελφός', noun_ru: 'брат', gender: 'Αρσενικό', article_el: 'ο', example_el: 'ο αδελφός', example_ru: 'брат' },
  { noun_el: 'κύριος', noun_ru: 'господин', gender: 'Αρσενικό', article_el: 'ο', example_el: 'ο κύριος', example_ru: 'господин' },
  { noun_el: 'δάσκαλος', noun_ru: 'учитель', gender: 'Αρσενικό', article_el: 'ο', example_el: 'ο δάσκαλος', example_ru: 'учитель' },
  { noun_el: 'μητέρα', noun_ru: 'мать', gender: 'Θηλυκό', article_el: 'η', example_el: 'η μητέρα', example_ru: 'мать' },
  { noun_el: 'αδελφή', noun_ru: 'сестра', gender: 'Θηλυκό', article_el: 'η', example_el: 'η αδελφή', example_ru: 'сестра' },
  { noun_el: 'κυρία', noun_ru: 'госпожа', gender: 'Θηλυκό', article_el: 'η', example_el: 'η κυρία', example_ru: 'госпожа' },
  { noun_el: 'δασκάλα', noun_ru: 'учительница', gender: 'Θηλυκό', article_el: 'η', example_el: 'η δασκάλα', example_ru: 'учительница' },
  { noun_el: 'παιδί', noun_ru: 'ребёнок', gender: 'Ουδέτερο', article_el: 'το', example_el: 'το παιδί', example_ru: 'ребёнок' },
  { noun_el: 'σπίτι', noun_ru: 'дом', gender: 'Ουδέτερο', article_el: 'το', example_el: 'το σπίτι', example_ru: 'дом' },
  { noun_el: 'δέντρο', noun_ru: 'дерево', gender: 'Ουδέτερο', article_el: 'το', example_el: 'το δέντρο', example_ru: 'дерево' },
  { noun_el: 'βιβλίο', noun_ru: 'книга', gender: 'Ουδέτερο', article_el: 'το', example_el: 'το βιβλίο', example_ru: 'книга' }
];

export const ARTICLE_DECLENSIONS_DATA = [
  // Ενικός (Singular) - Ονομαστική (Nominative)
  { number: 'Ενικός', case_name: 'Ονομαστική', gender: 'Αρσενικό', article_el: 'ο', example_el: 'ο πατέρας', example_ru: 'отец (им.п.)' },
  { number: 'Ενικός', case_name: 'Ονομαστική', gender: 'Θηλυκό', article_el: 'η', example_el: 'η μητέρα', example_ru: 'мать (им.п.)' },
  { number: 'Ενικός', case_name: 'Ονομαστική', gender: 'Ουδέτερο', article_el: 'το', example_el: 'το παιδί', example_ru: 'ребёнок (им.п.)' },
  // Ενικός (Singular) - Γενική (Genitive)
  { number: 'Ενικός', case_name: 'Γενική', gender: 'Αρσενικό', article_el: 'του', example_el: 'του πατέρα', example_ru: 'отца (род.п.)' },
  { number: 'Ενικός', case_name: 'Γενική', gender: 'Θηλυκό', article_el: 'της', example_el: 'της μητέρας', example_ru: 'матери (род.п.)' },
  { number: 'Ενικός', case_name: 'Γενική', gender: 'Ουδέτερο', article_el: 'του', example_el: 'του παιδιού', example_ru: 'ребёнка (род.п.)' },
  // Ενικός (Singular) - Αιτιατική (Accusative)
  { number: 'Ενικός', case_name: 'Αιτιατική', gender: 'Αρσενικό', article_el: 'τον', example_el: 'τον πατέρα', example_ru: 'отца (вин.п.)' },
  { number: 'Ενικός', case_name: 'Αιτιατική', gender: 'Θηλυκό', article_el: 'την', example_el: 'την μητέρα', example_ru: 'мать (вин.п.)' },
  { number: 'Ενικός', case_name: 'Αιτιατική', gender: 'Ουδέτερο', article_el: 'το', example_el: 'το παιδί', example_ru: 'ребёнка (вин.п.)' },
  // Πληθυντικός (Plural) - Ονομαστική (Nominative)
  { number: 'Πληθυντικός', case_name: 'Ονομαστική', gender: 'Αρσενικό', article_el: 'οι', example_el: 'οι πατέρες', example_ru: 'отцы (им.п.)' },
  { number: 'Πληθυντικός', case_name: 'Ονομαστική', gender: 'Θηλυκό', article_el: 'οι', example_el: 'οι μητέρες', example_ru: 'матери (им.п.)' },
  { number: 'Πληθυντικός', case_name: 'Ονομαστική', gender: 'Ουδέτερο', article_el: 'τα', example_el: 'τα παιδιά', example_ru: 'дети (им.п.)' },
  // Πληθυντικός (Plural) - Γενική (Genitive)
  { number: 'Πληθυντικός', case_name: 'Γενική', gender: 'Αρσενικό', article_el: 'των', example_el: 'των πατέρων', example_ru: 'отцов (род.п.)' },
  { number: 'Πληθυντικός', case_name: 'Γενική', gender: 'Θηλυκό', article_el: 'των', example_el: 'των μητέρων', example_ru: 'матерей (род.п.)' },
  { number: 'Πληθυντικός', case_name: 'Γενική', gender: 'Ουδέτερο', article_el: 'των', example_el: 'των παιδιών', example_ru: 'детей (род.п.)' },
  // Πληθυντικός (Plural) - Αιτιατική (Accusative)
  { number: 'Πληθυντικός', case_name: 'Αιτιατική', gender: 'Αρσενικό', article_el: 'τους', example_el: 'τους πατέρες', example_ru: 'отцов (вин.п.)' },
  { number: 'Πληθυντικός', case_name: 'Αιτιατική', gender: 'Θηλυκό', article_el: 'τις', example_el: 'τις μητέρες', example_ru: 'матерей (вин.п.)' },
  { number: 'Πληθυντικός', case_name: 'Αιτιατική', gender: 'Ουδέτερο', article_el: 'τα', example_el: 'τα παιδιά', example_ru: 'детей (вин.п.)' }
];

export const CONJUGATION_DATA = [
  // Глагол "быть" - είμαι (présent tense)
  {
    infinitive_el: "είμαι",
    infinitive_ru: "быть",
    person: "Εγώ",
    form_el: "είμαι",
    form_ru: "я есть",
    tense: "present"
  },
  {
    infinitive_el: "είμαι",
    infinitive_ru: "быть",
    person: "Εσύ",
    form_el: "είσαι",
    form_ru: "ты есть",
    tense: "present"
  },
  {
    infinitive_el: "είμαι",
    infinitive_ru: "быть",
    person: "Αυτός/Αυτή/Αυτό",
    form_el: "είναι",
    form_ru: "он/она/оно есть",
    tense: "present"
  },
  {
    infinitive_el: "είμαι",
    infinitive_ru: "быть",
    person: "Εμείς",
    form_el: "είμαστε",
    form_ru: "мы есть",
    tense: "present"
  },
  {
    infinitive_el: "είμαι",
    infinitive_ru: "быть",
    person: "Εσείς",
    form_el: "είστε",
    form_ru: "вы есть",
    tense: "present"
  },
  {
    infinitive_el: "είμαι",
    infinitive_ru: "быть",
    person: "Αυτοί/Αυτές/Αυτά",
    form_el: "είναι",
    form_ru: "они есть",
    tense: "present"
  }
];
