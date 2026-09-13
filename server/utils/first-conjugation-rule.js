/**
 * First Conjugation Verbs Rule: Verbs ending in -ω
 * δουλεύω (work), παίζω (play), μιλώ (speak), γράφω (write), διαβάζω (read)
 */
export const FIRST_CONJUGATION_RULE = {
  ruleId: 'first_conjugation_omega',
  name: 'Ρήματα Α\' συζυγίας - Κατάληξη -ω',
  description: 'Глаголы 1-го спряжения с окончанием -ω следуют регулярному спряжению в настоящем времени.',
  grammar: 'Глагол',
  level: 'A1-A2',

  verbs: {
    'δουλεύω': {
      ru: 'работать',
      conjugations: [
        { person: 'Εγώ', pronoun: 'я', form: 'δουλεύω', example: 'Εγώ δουλεύω καθημερινά' },
        { person: 'Εσύ', pronoun: 'ты', form: 'δουλεύεις', example: 'Εσύ δουλεύεις πολύ' },
        { person: 'Αυτός/Αυτή', pronoun: 'он/она', form: 'δουλεύει', example: 'Αυτή δουλεύει στο γραφείο' },
        { person: 'Εμείς', pronoun: 'мы', form: 'δουλεύουμε', example: 'Εμείς δουλεύουμε μαζί' },
        { person: 'Εσείς', pronoun: 'вы', form: 'δουλεύετε', example: 'Εσείς δουλεύετε σκληρά' },
        { person: 'Αυτοί/Αυτές', pronoun: 'они', form: 'δουλεύουν', example: 'Αυτοί δουλεύουν τη νύχτα' }
      ]
    },
    'παίζω': {
      ru: 'играть',
      conjugations: [
        { person: 'Εγώ', pronoun: 'я', form: 'παίζω', example: 'Εγώ παίζω κιθάρα' },
        { person: 'Εσύ', pronoun: 'ты', form: 'παίζεις', example: 'Εσύ παίζεις ποδόσφαιρο' },
        { person: 'Αυτός/Αυτή', pronoun: 'он/она', form: 'παίζει', example: 'Αυτός παίζει πιάνο' },
        { person: 'Εμείς', pronoun: 'мы', form: 'παίζουμε', example: 'Εμείς παίζουμε παιχνίδια' },
        { person: 'Εσείς', pronoun: 'вы', form: 'παίζετε', example: 'Εσείς παίζετε στο πάρκο' },
        { person: 'Αυτοί/Αυτές', pronoun: 'они', form: 'παίζουν', example: 'Αυτοί παίζουν βιντεοπαιχνίδια' }
      ]
    },
    'μιλώ': {
      ru: 'говорить',
      conjugations: [
        { person: 'Εγώ', pronoun: 'я', form: 'μιλώ', example: 'Εγώ μιλώ ελληνικά' },
        { person: 'Εσύ', pronoun: 'ты', form: 'μιλάς', example: 'Εσύ μιλάς αργά' },
        { person: 'Αυτός/Αυτή', pronoun: 'он/она', form: 'μιλάει', example: 'Αυτή μιλάει φώναξε' },
        { person: 'Εμείς', pronoun: 'мы', form: 'μιλάμε', example: 'Εμείς μιλάμε για το σχολείο' },
        { person: 'Εσείς', pronoun: 'вы', form: 'μιλάτε', example: 'Εσείς μιλάτε ενδιαφέροντα' },
        { person: 'Αυτοί/Αυτές', pronoun: 'они', form: 'μιλάνε', example: 'Αυτοί μιλάνε χαμηλά' }
      ]
    },
    'γράφω': {
      ru: 'писать',
      conjugations: [
        { person: 'Εγώ', pronoun: 'я', form: 'γράφω', example: 'Εγώ γράφω ένα γράμμα' },
        { person: 'Εσύ', pronoun: 'ты', form: 'γράφεις', example: 'Εσύ γράφεις καλά' },
        { person: 'Αυτός/Αυτή', pronoun: 'он/она', form: 'γράφει', example: 'Αυτός γράφει ποιήματα' },
        { person: 'Εμείς', pronoun: 'мы', form: 'γράφουμε', example: 'Εμείς γράφουμε τα μαθήματα' },
        { person: 'Εσείς', pronoun: 'вы', form: 'γράφετε', example: 'Εσείς γράφετε σωστά' },
        { person: 'Αυτοί/Αυτές', pronoun: 'они', form: 'γράφουν', example: 'Αυτοί γράφουν ιστορίες' }
      ]
    },
    'διαβάζω': {
      ru: 'читать',
      conjugations: [
        { person: 'Εγώ', pronoun: 'я', form: 'διαβάζω', example: 'Εγώ διαβάζω βιβλία' },
        { person: 'Εσύ', pronoun: 'ты', form: 'διαβάζεις', example: 'Εσύ διαβάζεις εφημερίδες' },
        { person: 'Αυτός/Αυτή', pronoun: 'он/она', form: 'διαβάζει', example: 'Αυτή διαβάζει ρομάν' },
        { person: 'Εμείς', pronoun: 'мы', form: 'διαβάζουμε', example: 'Εμείς διαβάζουμε τα άρθρα' },
        { person: 'Εσείς', pronoun: 'вы', form: 'διαβάζετε', example: 'Εσείς διαβάζετε κάθε μέρα' },
        { person: 'Αυτοί/Αυτές', pronoun: 'они', form: 'διαβάζουν', example: 'Αυτοί διαβάζουν αγάπη τα βιβλία' }
      ]
    }
  }
};
