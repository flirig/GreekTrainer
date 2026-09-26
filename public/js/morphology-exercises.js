/**
 * Morphological Exercises
 *
 * Three new exercise types using API endpoints:
 * 1. Synthesis - Generate Greek word forms
 * 2. Analysis - Identify morphological parameters
 * 3. Agreement - Check grammatical agreement
 */

const MorphologyExercises = {
  /**
   * Exercise 1: Synthesis
   * Generate Greek word form from lemma + parameters
   */
  synthesis: {
    name: 'Synthesis (Σύνθεση)',
    icon: '🔧',
    description: 'Generate correct Greek word form',

    async generateQuestion() {
      // Available words with paradigms
      const words = [
        { lemma: 'αγαπώ', meaning: 'to love' },
        { lemma: 'μπορώ', meaning: 'can' },
        { lemma: 'δουλεύω', meaning: 'to work' },
        { lemma: 'διαβάζω', meaning: 'to read' }
      ];

      const persons = [
        { label: '1st singular (εγώ)', value: '1st', number: 'singular' },
        { label: '2nd singular (εσύ)', value: '2nd', number: 'singular' },
        { label: '3rd singular (αυτός)', value: '3rd', number: 'singular' },
        { label: '1st plural (εμείς)', value: '1st', number: 'plural' },
        { label: '2nd plural (εσείς)', value: '2nd', number: 'plural' },
        { label: '3rd plural (αυτοί)', value: '3rd', number: 'plural' }
      ];

      const word = words[Math.floor(Math.random() * words.length)];
      const person = persons[Math.floor(Math.random() * persons.length)];

      return {
        lemma: word.lemma,
        meaning: word.meaning,
        person: person.label,
        person_value: person.value,
        number: person.number,
        tense: 'present'
      };
    },

    async renderQuestion(question, containerId) {
      const container = document.getElementById(containerId);
      if (!container) return;

      container.innerHTML = `
        <div style="padding: 20px; background: #f5f5f5; border-radius: 8px;">
          <h3>Generate the correct form</h3>
          <p style="font-size: 18px; margin: 15px 0;">
            <strong>Lemma:</strong> ${question.lemma}
            <br/>
            <strong>Meaning:</strong> ${question.meaning}
            <br/>
            <strong>Form:</strong> ${question.person} (present tense)
          </p>
          <input
            type="text"
            id="synthesis-input"
            placeholder="Type the Greek form here..."
            style="width: 100%; padding: 10px; font-size: 16px; border: 2px solid #ccc; border-radius: 4px;"
            autocomplete="off"
          />
          <button
            id="synthesis-submit"
            style="margin-top: 10px; padding: 10px 20px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px;"
          >
            Check Answer
          </button>
        </div>
      `;

      // Handle submit
      return new Promise(resolve => {
        document.getElementById('synthesis-submit').onclick = async () => {
          const userAnswer = document.getElementById('synthesis-input').value.trim();

          if (!userAnswer) {
            alert('Please enter a word');
            return;
          }

          try {
            const response = await fetch('/api/words/synthesize', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                lemma: question.lemma,
                tense: question.tense,
                person: question.person_value,
                number: question.number
              })
            });

            const result = await response.json();

            if (result.success) {
              const correct = result.form === userAnswer;
              resolve({
                isCorrect: correct,
                userAnswer,
                correctAnswer: result.form,
                explanation: correct
                  ? '✅ Correct!'
                  : `❌ Wrong. Correct answer: ${result.form}`
              });
            } else {
              alert('Error: ' + result.error);
            }
          } catch (error) {
            console.error('Synthesis error:', error);
            alert('API error: ' + error.message);
          }
        };

        // Allow Enter key
        document.getElementById('synthesis-input').onkeypress = (e) => {
          if (e.key === 'Enter') {
            document.getElementById('synthesis-submit').click();
          }
        };
      });
    }
  },

  /**
   * Exercise 2: Analysis
   * Identify morphological parameters of a Greek word form
   */
  analysis: {
    name: 'Analysis (Ανάλυση)',
    icon: '🔍',
    description: 'Identify word morphology',

    async generateQuestion() {
      // Pre-generated forms to analyze
      const forms = [
        { form: 'αγαπώ', lemma: 'αγαπώ', person: '1st', number: 'singular' },
        { form: 'αγαπάς', lemma: 'αγαπώ', person: '2nd', number: 'singular' },
        { form: 'αγαπά', lemma: 'αγαπώ', person: '3rd', number: 'singular' },
        { form: 'αγαπούμε', lemma: 'αγαπώ', person: '1st', number: 'plural' },
        { form: 'αγαπάτε', lemma: 'αγαπώ', person: '2nd', number: 'plural' },
        { form: 'αγαπούν', lemma: 'αγαπώ', person: '3rd', number: 'plural' },
        { form: 'μπορώ', lemma: 'μπορώ', person: '1st', number: 'singular' },
        { form: 'μπορεί', lemma: 'μπορώ', person: '3rd', number: 'singular' }
      ];

      return forms[Math.floor(Math.random() * forms.length)];
    },

    async renderQuestion(question, containerId) {
      const container = document.getElementById(containerId);
      if (!container) return;

      container.innerHTML = `
        <div style="padding: 20px; background: #f5f5f5; border-radius: 8px;">
          <h3>What is the lemma and person?</h3>
          <p style="font-size: 24px; text-align: center; margin: 15px 0; color: #2196F3; font-weight: bold;">
            ${question.form}
          </p>

          <div style="margin: 15px 0;">
            <label>Lemma:</label><br/>
            <input type="text" id="analysis-lemma" placeholder="e.g., αγαπώ" style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ccc; border-radius: 4px;" />
          </div>

          <div style="margin: 15px 0;">
            <label>Person:</label><br/>
            <select id="analysis-person" style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ccc; border-radius: 4px;">
              <option value="">-- Select --</option>
              <option value="1st">1st (εγώ / εμείς)</option>
              <option value="2nd">2nd (εσύ / εσείς)</option>
              <option value="3rd">3rd (αυτός / αυτοί)</option>
            </select>
          </div>

          <div style="margin: 15px 0;">
            <label>Number:</label><br/>
            <select id="analysis-number" style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ccc; border-radius: 4px;">
              <option value="">-- Select --</option>
              <option value="singular">Singular</option>
              <option value="plural">Plural</option>
            </select>
          </div>

          <button
            id="analysis-submit"
            style="margin-top: 15px; padding: 10px 20px; background: #2196F3; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; width: 100%;"
          >
            Check Answer
          </button>
        </div>
      `;

      return new Promise(resolve => {
        document.getElementById('analysis-submit').onclick = async () => {
          const lemma = document.getElementById('analysis-lemma').value.trim();
          const person = document.getElementById('analysis-person').value;
          const number = document.getElementById('analysis-number').value;

          if (!lemma || !person || !number) {
            alert('Please fill all fields');
            return;
          }

          const isCorrect = lemma === question.lemma && person === question.person && number === question.number;

          resolve({
            isCorrect,
            userAnswer: `${lemma} (${person} ${number})`,
            correctAnswer: `${question.lemma} (${question.person} ${question.number})`,
            explanation: isCorrect
              ? '✅ Correct!'
              : `❌ Wrong. Correct: ${question.lemma} (${question.person} ${question.number})`
          });
        };
      });
    }
  },

  /**
   * Exercise 3: Agreement
   * Check grammatical agreement in phrases
   */
  agreement: {
    name: 'Agreement (Συμφωνία)',
    icon: '⚖️',
    description: 'Check grammatical agreement',

    async generateQuestion() {
      const phrases = [
        {
          phrase: ['ο', 'καλός', 'άνθρωπος'],
          meaning: 'the good man',
          isCorrect: true
        },
        {
          phrase: ['η', 'καλή', 'γυναίκα'],
          meaning: 'the good woman',
          isCorrect: true
        },
        {
          phrase: ['ο', 'καλή', 'άντρας'],
          meaning: 'the good man (WRONG gender)',
          isCorrect: false,
          correction: ['ο', 'καλός', 'άντρας']
        }
      ];

      return phrases[Math.floor(Math.random() * phrases.length)];
    },

    async renderQuestion(question, containerId) {
      const container = document.getElementById(containerId);
      if (!container) return;

      container.innerHTML = `
        <div style="padding: 20px; background: #f5f5f5; border-radius: 8px;">
          <h3>Is this phrase grammatically correct?</h3>
          <p style="font-size: 18px; margin: 15px 0;">
            <strong>Phrase:</strong> ${question.phrase.join(' ')}
            <br/>
            <strong>Meaning:</strong> ${question.meaning}
          </p>

          <div style="margin: 15px 0;">
            <button
              id="agreement-yes"
              style="padding: 10px 20px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; margin-right: 10px;"
            >
              ✅ Correct
            </button>
            <button
              id="agreement-no"
              style="padding: 10px 20px; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px;"
            >
              ❌ Incorrect
            </button>
          </div>
        </div>
      `;

      return new Promise(resolve => {
        const handleAnswer = (userSaysCorrect) => {
          const isCorrect = userSaysCorrect === question.isCorrect;

          resolve({
            isCorrect,
            userAnswer: userSaysCorrect ? 'Correct' : 'Incorrect',
            correctAnswer: question.isCorrect ? 'Correct' : 'Incorrect',
            explanation: isCorrect
              ? '✅ Correct!'
              : `❌ Wrong. This phrase is ${question.isCorrect ? 'correct' : 'incorrect'}.`
          });
        };

        document.getElementById('agreement-yes').onclick = () => handleAnswer(true);
        document.getElementById('agreement-no').onclick = () => handleAnswer(false);
      });
    }
  }
};

export default MorphologyExercises;
