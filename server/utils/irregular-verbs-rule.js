/**
 * Verb Conjugation Rule: Irregular Verbs in Present Tense
 * πάω (go), λέω (say), ακούω (listen), τρώω (eat), κλαίω (cry)
 */
export const IRREGULAR_VERBS_RULE = {
  ruleId: 'present_tense_irregular',
  name: 'Аномальные глаголы настоящего времени',
  description: 'Некоторые глаголы не следуют обычному спряжению. Эти аномальные глаголы требуют практики.',
  grammar: 'Глагол',
  level: 'A1-A2',

  verbs: {
    'πάω': {
      ru: 'идти/ходить',
      conjugations: [
        { person: 'Εγώ', pronoun: 'я', form: 'πάω', example: 'Εγώ πάω στο σχολείο' },
        { person: 'Εσύ', pronoun: 'ты', form: 'πας', example: 'Εσύ πας στο πάρκο' },
        { person: 'Αυτός/Αυτή', pronoun: 'он/она', form: 'πάει', example: 'Αυτός πάει στη δουλειά' },
        { person: 'Εμείς', pronoun: 'мы', form: 'πάμε', example: 'Εμείς πάμε στο σινεμά' },
        { person: 'Εσείς', pronoun: 'вы', form: 'πάτε', example: 'Εσείς πάτε στην παραλία' },
        { person: 'Αυτοί/Αυτές', pronoun: 'они', form: 'πάνε', example: 'Αυτοί πάνε στην εκκλησία' }
      ]
    },
    'λέω': {
      ru: 'говорить/сказать',
      conjugations: [
        { person: 'Εγώ', pronoun: 'я', form: 'λέω', example: 'Εγώ λέω την αλήθεια' },
        { person: 'Εσύ', pronoun: 'ты', form: 'λες', example: 'Εσύ λες ψέματα' },
        { person: 'Αυτός/Αυτή', pronoun: 'он/она', form: 'λέει', example: 'Αυτή λέει καλά ελληνικά' },
        { person: 'Εμείς', pronoun: 'мы', form: 'λέμε', example: 'Εμείς λέμε το όνομά μας' },
        { person: 'Εσείς', pronoun: 'вы', form: 'λέτε', example: 'Εσείς λέτε κάτι ενδιαφέρον' },
        { person: 'Αυτοί/Αυτές', pronoun: 'они', form: 'λένε', example: 'Αυτοί λένε ότι είναι πολύ ωραίο' }
      ]
    },
    'ακούω': {
      ru: 'слушать/слышать',
      conjugations: [
        { person: 'Εγώ', pronoun: 'я', form: 'ακούω', example: 'Εγώ ακούω μουσική' },
        { person: 'Εσύ', pronoun: 'ты', form: 'ακούς', example: 'Εσύ ακούς τη φωνή του' },
        { person: 'Αυτός/Αυτή', pronoun: 'он/она', form: 'ακούει', example: 'Αυτός ακούει καλά' },
        { person: 'Εμείς', pronoun: 'мы', form: 'ακούμε', example: 'Εμείς ακούμε τα πουλιά' },
        { person: 'Εσείς', pronoun: 'вы', form: 'ακούτε', example: 'Εσείς ακούτε τη θόρυβο' },
        { person: 'Αυτοί/Αυτές', pronoun: 'они', form: 'ακούνε', example: 'Αυτοί ακούνε το κουδούνι' }
      ]
    },
    'τρώω': {
      ru: 'есть/кушать',
      conjugations: [
        { person: 'Εγώ', pronoun: 'я', form: 'τρώω', example: 'Εγώ τρώω ψάρι' },
        { person: 'Εσύ', pronoun: 'ты', form: 'τρως', example: 'Εσύ τρως φρούτα' },
        { person: 'Αυτός/Αυτή', pronoun: 'он/она', form: 'τρώει', example: 'Αυτή τρώει κρέας' },
        { person: 'Εμείς', pronoun: 'мы', form: 'τρώμε', example: 'Εμείς τρώμε ψωμί' },
        { person: 'Εσείς', pronoun: 'вы', form: 'τρώτε', example: 'Εσείς τρώτε ντομάτες' },
        { person: 'Αυτοί/Αυτές', pronoun: 'они', form: 'τρώνε', example: 'Αυτοί τρώνε κοτόπουλο' }
      ]
    },
    'κλαίω': {
      ru: 'плакать/рыдать',
      conjugations: [
        { person: 'Εγώ', pronoun: 'я', form: 'κλαίω', example: 'Εγώ κλαίω από χαρά' },
        { person: 'Εσύ', pronoun: 'ты', form: 'κλαις', example: 'Εσύ κλαις κάποιες φορές' },
        { person: 'Αυτός/Αυτή', pronoun: 'он/она', form: 'κλαίει', example: 'Το μωρό κλαίει πολύ' },
        { person: 'Εμείς', pronoun: 'мы', form: 'κλαίμε', example: 'Εμείς κλαίμε στις λυπηρές ταινίες' },
        { person: 'Εσείς', pronoun: 'вы', form: 'κλαίτε', example: 'Εσείς κλαίτε καμιά φορά' },
        { person: 'Αυτοί/Αυτές', pronoun: 'они', form: 'κλαίνε', example: 'Αυτοί κλαίνε για τον φίλο τους' }
      ]
    }
  }
};
