/**
 * Verb Conjugation Rule: είμαι (to be)
 * The most important Greek verb - present tense
 */
export const CONJUGATION_RULE = {
  ruleId: 'present_tense_eimi',
  name: 'Настоящее время глагола "είμαι" (быть)',
  description: 'Спряжение основного греческого глагола είμαι в настоящем времени. Один из самых часто используемых глаголов.',
  grammar: 'Глагол',
  level: 'A1 - Beginner',

  conjugations: [
    {
      person: 'Εγώ',
      pronoun: 'я',
      form: 'είμαι',
      translation: 'я есть / я являюсь',
      example: 'Εγώ είμαι Ελληνας',
      exampleTranslation: 'Я грек'
    },
    {
      person: 'Εσύ',
      pronoun: 'ты',
      form: 'είσαι',
      translation: 'ты есть / ты являешься',
      example: 'Εσύ είσαι καθηγητής',
      exampleTranslation: 'Ты учитель'
    },
    {
      person: 'Αυτός / Αυτή / Αυτό',
      pronoun: 'он / она / оно',
      form: 'είναι',
      translation: 'он/она/оно есть',
      example: 'Αυτός είναι γιατρός',
      exampleTranslation: 'Он врач'
    },
    {
      person: 'Εμείς',
      pronoun: 'мы',
      form: 'είμαστε',
      translation: 'мы есть / мы являемся',
      example: 'Εμείς είμαστε φίλοι',
      exampleTranslation: 'Мы друзья'
    },
    {
      person: 'Εσείς',
      pronoun: 'вы',
      form: 'είστε',
      translation: 'вы есть / вы являетесь',
      example: 'Εσείς είστε έξυπνοι',
      exampleTranslation: 'Вы умные'
    },
    {
      person: 'Αυτοί / Αυτές / Αυτά',
      pronoun: 'они',
      form: 'είναι',
      translation: 'они есть / они являются',
      example: 'Αυτοί είναι αδελφοί',
      exampleTranslation: 'Они братья'
    }
  ],

  patterns: [
    {
      pattern: 'Pronoun + είμαι/είσαι/είναι/είμαστε/είστε + Adjective/Noun',
      example: 'Είμαι ευτυχής = Я счастлив',
      note: 'Используется для описания статуса, профессии, состояния'
    },
    {
      pattern: 'είμαι + Τοποθεσία',
      example: 'Είμαι στο σπίτι = Я дома',
      note: 'Используется для указания местоположения'
    }
  ],

  practiceExamples: [
    { el: 'Εγώ είμαι', ru: 'я', type: 'pronoun_form' },
    { el: 'Εσύ είσαι', ru: 'ты', type: 'pronoun_form' },
    { el: 'Αυτός είναι', ru: 'он', type: 'pronoun_form' },
    { el: 'Εμείς είμαστε', ru: 'мы', type: 'pronoun_form' },
    { el: 'Εσείς είστε', ru: 'вы', type: 'pronoun_form' },
    { el: 'Αυτοί είναι', ru: 'они', type: 'pronoun_form' },

    { el: 'Είμαι καλά', ru: 'Я хорошо / Со мной всё хорошо', type: 'full_sentence' },
    { el: 'Είσαι ωραία', ru: 'Ты красивая', type: 'full_sentence' },
    { el: 'Είναι ήρεμη', ru: 'Она спокойная', type: 'full_sentence' },
    { el: 'Είμαστε κουρασμένοι', ru: 'Мы устали', type: 'full_sentence' },
    { el: 'Είστε έτοιμοι;', ru: 'Вы готовы?', type: 'full_sentence' },
    { el: 'Είναι αρκετά καλά', ru: 'Они довольно хорошо', type: 'full_sentence' },
  ]
};

export const CONJUGATION_WORDS = [
  { el: 'είμαι', ru: 'быть (я)', category: 'verb' },
  { el: 'είσαι', ru: 'быть (ты)', category: 'verb' },
  { el: 'είναι', ru: 'быть (он/она/оно/они)', category: 'verb' },
  { el: 'είμαστε', ru: 'быть (мы)', category: 'verb' },
  { el: 'είστε', ru: 'быть (вы)', category: 'verb' },

  // Common adjectives used with είμαι
  { el: 'καλά', ru: 'хорошо', category: 'adjective' },
  { el: 'άσχημα', ru: 'плохо', category: 'adjective' },
  { el: 'ευτυχής', ru: 'счастливый', category: 'adjective' },
  { el: 'λυπημένος', ru: 'грустный', category: 'adjective' },
  { el: 'κουρασμένος', ru: 'усталый', category: 'adjective' },
  { el: 'έξυπνος', ru: 'умный', category: 'adjective' },
  { el: 'όμορφος', ru: 'красивый', category: 'adjective' },
  { el: 'νέος', ru: 'молодой', category: 'adjective' },
  { el: 'παλιός', ru: 'старый', category: 'adjective' },

  // Common nouns used with είμαι
  { el: 'γιατρός', ru: 'врач', category: 'noun' },
  { el: 'δάσκαλος', ru: 'учитель', category: 'noun' },
  { el: 'μηχανικός', ru: 'инженер', category: 'noun' },
  { el: 'αδελφός', ru: 'брат', category: 'noun' },
  { el: 'αδελφή', ru: 'сестра', category: 'noun' },
  { el: 'φίλος', ru: 'друг', category: 'noun' },
  { el: 'Έλληνας', ru: 'грек', category: 'noun' },
];
