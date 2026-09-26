/**
 * Quiz Modules System
 * Reusable quiz module architecture for Greek Trainer
 */

window.QuizModules = {
  /**
   * Module: Select word with correct accent
   * Used in: Grammar Rules, Accents exercise
   */
  accentChoice: {
    name: 'Выбор ударения',
    icon: '📍',
    id: 'accent-choice',

    render(question, onAnswer) {
      if (!question.variants || question.variants.length < 2) {
        return '<p>⚠️ Недостаточно вариантов</p>';
      }

      let options = question.variants.slice(0, 4);
      if (!options.includes(question.correct)) {
        options[Math.floor(Math.random() * options.length)] = question.correct;
      }
      shuffle(options);

      let html = `
        <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
          <p style="color: #999; margin: 0 0 10px 0;">Выберите правильное ударение:</p>
          <p style="font-size: 18px; font-weight: bold; margin: 0;">${question.text}</p>
        </div>
        <div id="options" style="display: flex; flex-direction: column; gap: 10px;"></div>`;

      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;

      const optionsDiv = tempDiv.querySelector('#options');
      options.forEach(opt => {
        const btn = document.createElement('button');
        btn.style.cssText = 'padding: 12px; background: #f0f0f0; border: 2px solid #ddd; border-radius: 8px; cursor: pointer; font-weight: 600; text-align: left;';
        btn.textContent = opt;
        btn.onclick = () => {
          optionsDiv.querySelectorAll('button').forEach(b => b.disabled = true);
          const isCorrect = opt === question.correct;
          btn.style.background = isCorrect ? '#2ecc71' : '#ef4444';
          btn.style.color = 'white';
          btn.style.borderColor = isCorrect ? '#27ae60' : '#dc2626';
          if (onAnswer) onAnswer(isCorrect, opt);
        };
        optionsDiv.appendChild(btn);
      });

      return tempDiv.innerHTML;
    }
  },

  /**
   * Module: Select phrase with correct pronoun
   * Used in: Grammar Rules, Pronouns exercise
   */
  pronounChoice: {
    name: 'Выбор местоимения',
    icon: '👤',
    id: 'pronoun-choice',

    render(question, onAnswer) {
      const pronouns = ['Εγώ', 'Εσύ', 'Αυτός', 'Αυτή', 'Αυτό', 'Εμείς', 'Εσείς', 'Αυτοί', 'Αυτές'];
      const options = [question.correct, ...pronouns.filter(p => p !== question.correct).slice(0, 3)];
      shuffle(options);

      let html = `
        <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
          <p style="color: #999; margin: 0 0 10px 0;">Выберите правильное местоимение:</p>
          <p style="font-size: 18px; font-weight: bold; margin: 0;">"${question.text}"</p>
        </div>
        <div id="options" style="display: flex; flex-direction: column; gap: 10px;"></div>`;

      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;

      const optionsDiv = tempDiv.querySelector('#options');
      options.forEach(opt => {
        const btn = document.createElement('button');
        btn.style.cssText = 'padding: 12px; background: #f0f0f0; border: 2px solid #ddd; border-radius: 8px; cursor: pointer; font-weight: 600;';
        btn.textContent = opt;
        btn.onclick = () => {
          optionsDiv.querySelectorAll('button').forEach(b => b.disabled = true);
          const isCorrect = opt === question.correct;
          btn.style.background = isCorrect ? '#2ecc71' : '#ef4444';
          btn.style.color = 'white';
          btn.style.borderColor = isCorrect ? '#27ae60' : '#dc2626';
          if (onAnswer) onAnswer(isCorrect, opt);
        };
        optionsDiv.appendChild(btn);
      });

      return tempDiv.innerHTML;
    }
  },

  /**
   * Module: Translate Greek to Russian
   * Used in: Grammar Rules, Translation exercise
   */
  translateGreekToRussian: {
    name: 'Перевод: Греческий → Русский',
    icon: '🌐',
    id: 'translate-gr-ru',

    render(question, onAnswer) {
      let wrongOptions = question.wrongOptions || [];
      let options = [question.correct, ...wrongOptions.slice(0, 3)];
      shuffle(options);

      let html = `
        <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
          <p style="color: #999; margin: 0 0 10px 0;">Переведите на русский:</p>
          <p style="font-size: 18px; font-weight: bold; margin: 0;">${question.text}</p>
        </div>
        <div id="options" style="display: flex; flex-direction: column; gap: 10px;"></div>`;

      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;

      const optionsDiv = tempDiv.querySelector('#options');
      options.forEach(opt => {
        const btn = document.createElement('button');
        btn.style.cssText = 'padding: 12px; background: #f0f0f0; border: 2px solid #ddd; border-radius: 8px; cursor: pointer; font-weight: 600; text-align: left;';
        btn.textContent = opt;
        btn.onclick = () => {
          optionsDiv.querySelectorAll('button').forEach(b => b.disabled = true);
          const isCorrect = opt === question.correct;
          btn.style.background = isCorrect ? '#2ecc71' : '#ef4444';
          btn.style.color = 'white';
          btn.style.borderColor = isCorrect ? '#27ae60' : '#dc2626';
          if (onAnswer) onAnswer(isCorrect, opt);
        };
        optionsDiv.appendChild(btn);
      });

      return tempDiv.innerHTML;
    }
  },

  /**
   * Module: Translate Russian to Greek
   * Used in: Grammar Rules, Translation exercise
   */
  translateRussianToGreek: {
    name: 'Перевод: Русский → Греческий',
    icon: '🇬🇷',
    id: 'translate-ru-gr',

    render(question, onAnswer) {
      let wrongOptions = question.wrongOptions || [];
      let options = [question.correct, ...wrongOptions.slice(0, 3)];
      shuffle(options);

      let html = `
        <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
          <p style="color: #999; margin: 0 0 10px 0;">Переведите на греческий:</p>
          <p style="font-size: 18px; font-weight: bold; margin: 0;">${question.text}</p>
        </div>
        <div id="options" style="display: flex; flex-direction: column; gap: 10px;"></div>`;

      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;

      const optionsDiv = tempDiv.querySelector('#options');
      options.forEach(opt => {
        const btn = document.createElement('button');
        btn.style.cssText = 'padding: 12px; background: #f0f0f0; border: 2px solid #ddd; border-radius: 8px; cursor: pointer; font-weight: 600; text-align: left;';
        btn.textContent = opt;
        btn.onclick = () => {
          optionsDiv.querySelectorAll('button').forEach(b => b.disabled = true);
          const isCorrect = opt === question.correct;
          btn.style.background = isCorrect ? '#2ecc71' : '#ef4444';
          btn.style.color = 'white';
          btn.style.borderColor = isCorrect ? '#27ae60' : '#dc2626';
          if (onAnswer) onAnswer(isCorrect, opt);
        };
        optionsDiv.appendChild(btn);
      });

      return tempDiv.innerHTML;
    }
  },

  /**
   * Module: Select word by listening
   * Used in: Grammar Rules, Audio exercise
   */
  listenAndSelect: {
    name: 'Выбрать на слух',
    icon: '🔊',
    id: 'listen-select',

    render(question, onAnswer) {
      let options = [question.correct, ...(question.wrongOptions || []).slice(0, 3)];
      shuffle(options);

      let html = `
        <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
          <p style="color: #999; margin: 0 0 10px 0;">Послушайте и выберите правильное слово:</p>
          <button onclick="speak('${question.text}')" style="background: #667eea; color: white; border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 16px;">🔊 Воспроизвести</button>
        </div>
        <div id="options" style="display: flex; flex-direction: column; gap: 10px; margin-top: 15px;"></div>`;

      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;

      const optionsDiv = tempDiv.querySelector('#options');
      options.forEach(opt => {
        const btn = document.createElement('button');
        btn.style.cssText = 'padding: 12px; background: #f0f0f0; border: 2px solid #ddd; border-radius: 8px; cursor: pointer; font-weight: 600; text-align: left;';
        btn.textContent = opt;
        btn.onclick = () => {
          optionsDiv.querySelectorAll('button').forEach(b => b.disabled = true);
          const isCorrect = opt === question.correct;
          btn.style.background = isCorrect ? '#2ecc71' : '#ef4444';
          btn.style.color = 'white';
          btn.style.borderColor = isCorrect ? '#27ae60' : '#dc2626';
          if (onAnswer) onAnswer(isCorrect, opt);
        };
        optionsDiv.appendChild(btn);
      });

      return tempDiv.innerHTML;
    }
  },

  /**
   * Module: Fill in the blank with correct form
   * Used in: Grammar Rules, Fill-word exercise
   */
  fillInBlank: {
    name: 'Подставить в предложение',
    icon: '✏️',
    id: 'fill-blank',

    render(question, onAnswer) {
      let options = [question.correct, ...(question.wrongOptions || []).slice(0, 3)];
      shuffle(options);

      let html = `
        <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
          <p style="color: #999; margin: 0 0 10px 0;">Подставьте правильную форму:</p>
          <p style="font-size: 16px; margin: 10px 0 0 0;">${question.sentence}</p>
        </div>
        <div id="options" style="display: flex; flex-direction: column; gap: 10px; margin-top: 15px;"></div>`;

      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;

      const optionsDiv = tempDiv.querySelector('#options');
      options.forEach(opt => {
        const btn = document.createElement('button');
        btn.style.cssText = 'padding: 12px; background: #f0f0f0; border: 2px solid #ddd; border-radius: 8px; cursor: pointer; font-weight: 600; text-align: left;';
        btn.textContent = opt;
        btn.onclick = () => {
          optionsDiv.querySelectorAll('button').forEach(b => b.disabled = true);
          const isCorrect = opt === question.correct;
          btn.style.background = isCorrect ? '#2ecc71' : '#ef4444';
          btn.style.color = 'white';
          btn.style.borderColor = isCorrect ? '#27ae60' : '#dc2626';
          if (onAnswer) onAnswer(isCorrect, opt);
        };
        optionsDiv.appendChild(btn);
      });

      return tempDiv.innerHTML;
    }
  }
};

// Helper functions
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Get all modules list
window.getAvailableModules = function() {
  return Object.values(window.QuizModules).map(m => ({
    id: m.id,
    name: m.name,
    icon: m.icon
  }));
};

// Get module by ID
window.getModule = function(moduleId) {
  return Object.values(window.QuizModules).find(m => m.id === moduleId);
};
