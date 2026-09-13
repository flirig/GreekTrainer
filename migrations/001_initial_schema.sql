-- Migration: 001_initial_schema
-- Created: 2026-09-13
-- Description: Create initial schema for Greek language database

-- Track migrations
CREATE TABLE IF NOT EXISTS migrations (
  id SERIAL PRIMARY KEY,
  name VARCHAR NOT NULL UNIQUE,
  executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Articles table
CREATE TABLE IF NOT EXISTS articles (
  id SERIAL PRIMARY KEY,
  article VARCHAR NOT NULL,
  is_definite BOOLEAN NOT NULL,
  gender VARCHAR NOT NULL,
  number VARCHAR NOT NULL,
  article_case VARCHAR NOT NULL,
  UNIQUE(article, is_definite, gender, number, article_case)
);

-- Lemmas (base words)
CREATE TABLE IF NOT EXISTS lemmas (
  id SERIAL PRIMARY KEY,
  word VARCHAR NOT NULL,
  pos VARCHAR NOT NULL,
  gender VARCHAR,
  conjugation_type VARCHAR,
  declension_class INT,
  english_translation VARCHAR,
  UNIQUE(word, pos)
);

-- Forms (inflected words)
CREATE TABLE IF NOT EXISTS forms (
  id SERIAL PRIMARY KEY,
  lemma_id INT NOT NULL REFERENCES lemmas(id) ON DELETE CASCADE,
  form VARCHAR NOT NULL,
  morphology JSONB NOT NULL,
  article_id INT REFERENCES articles(id),
  UNIQUE(lemma_id, form, morphology)
);

-- Transformation rules
CREATE TABLE IF NOT EXISTS transformation_rules (
  id SERIAL PRIMARY KEY,
  pos VARCHAR NOT NULL,
  declension_class INT,
  pattern VARCHAR NOT NULL,
  suffix_map JSONB NOT NULL,
  description VARCHAR
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_forms_lemma_id ON forms(lemma_id);
CREATE INDEX IF NOT EXISTS idx_forms_form ON forms(form);
CREATE INDEX IF NOT EXISTS idx_lemmas_word ON lemmas(word);
CREATE INDEX IF NOT EXISTS idx_lemmas_pos ON lemmas(pos);
CREATE INDEX IF NOT EXISTS idx_articles_article ON articles(article);

-- Mark migration as executed
INSERT INTO migrations (name) VALUES ('001_initial_schema') ON CONFLICT DO NOTHING;
