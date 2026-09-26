/**
 * Quiz Modules System
 * Reusable quiz module architecture for Greek Trainer
 * Each module returns a DOM Element (not HTML string)
 */

window.QuizModules = {
  accentChoice: {
    name: 'Выбор ударения',
    icon: '📍',
    id: 'accent-choice',
    render(question, onAnswer) {
      if (!question.variants || question.variants.length < 2) {
        const div = document.createElement('div');
        div.textContent = '⚠️ Недостаточно вариантов';
        return div;
      }
      let options = question.variants.slice(0, 4);
      if (!options.includes(question.correct)) {
        options[Math.floor(Math.random() * options.length)] = question.correct;
      }
      shuffle(options);
      const container = document.createElement('div');
      const header = document.createElement('div');
      header.style.cssText = 'background: #f5f5f5; padding: 15px; border-radius: 8px; margin-bottom: 15px;';
      header.innerHTML = `<p style="color: #999; margin: 0 0 10px 0;">Выберите правильное ударение:</p><p style="font-size: 18px; font-weight: bold; margin: 0;">${question.text}</p>`;
      container.appendChild(header);
      const optionsDiv = document.createElement('div');
      optionsDiv.style.cssText = 'display: flex; flex-direction: column; gap: 10px;';
      options.forEach(opt => {
        const btn = document.createElement('button');
        btn.style.cssText = 'padding: 12px; background: #f0f0f0; border: 2px solid #ddd; border-radius: 8px; cursor: pointer; font-weight: 600; text-align: left;';
        btn.textContent = opt;
        btn.onclick = () => {
          optionsDiv.querySelectorAll('button').forEach(b => b.style.pointerEvents = 'none');
          const isCorrect = opt === question.correct;
          btn.style.background = isCorrect ? '#2ecc71' : '#ef4444';
          btn.style.color = 'white';
          btn.style.borderColor = isCorrect ? '#27ae60' : '#dc2626';
          if (onAnswer) onAnswer(isCorrect, opt);
        };
        optionsDiv.appendChild(btn);
      });
      container.appendChild(optionsDiv);
      return container;
    }
  },

  pronounChoice: {
    name: 'Выбор местоимения',
    icon: '👤',
    id: 'pronoun-choice',
    render(question, onAnswer) {
      const pronouns = ['Εγώ', 'Εσύ', 'Αυτός', 'Αυτή', 'Αυτό', 'Εμείς', 'Εσείς', 'Αυτοί', 'Αυτές'];
      const options = [question.correct, ...pronouns.filter(p => p !== question.correct).slice(0, 3)];
      shuffle(options);
      const container = document.createElement('div');
      const header = document.createElement('div');
      header.style.cssText = 'background: #f5f5f5; padding: 15px; border-radius: 8px; margin-bottom: 15px;';
      header.innerHTML = `<p style="color: #999; margin: 0 0 10px 0;">Выберите правильное местоимение:</p><p style="font-size: 18px; font-weight: bold; margin: 0;">"${question.text}"</p>`;
      container.appendChild(header);
      const optionsDiv = document.createElement('div');
      optionsDiv.style.cssText = 'display: flex; flex-direction: column; gap: 10px;';
      options.forEach(opt => {
        const btn = document.createElement('button');
        btn.style.cssText = 'padding: 12px; background: #f0f0f0; border: 2px solid #ddd; border-radius: 8px; cursor: pointer; font-weight: 600;';
        btn.textContent = opt;
        btn.onclick = () => {
          optionsDiv.querySelectorAll('button').forEach(b => b.style.pointerEvents = 'none');
          const isCorrect = opt === question.correct;
          btn.style.background = isCorrect ? '#2ecc71' : '#ef4444';
          btn.style.color = 'white';
          btn.style.borderColor = isCorrect ? '#27ae60' : '#dc2626';
          if (onAnswer) onAnswer(isCorrect, opt);
        };
        optionsDiv.appendChild(btn);
      });
      container.appendChild(optionsDiv);
      return container;
    }
  },

  translateGreekToRussian: {
    name: 'Перевод: Греч→Русс',
    icon: '🌐',
    id: 'translate-gr-ru',
    render(question, onAnswer) {
      let wrongOptions = question.wrongOptions || [];
      let options = [question.correct, ...wrongOptions.slice(0, 3)];
      shuffle(options);
      const container = document.createElement('div');
      const header = document.createElement('div');
      header.style.cssText = 'background: #f5f5f5; padding: 15px; border-radius: 8px; margin-bottom: 15px;';
      header.innerHTML = `<p style="color: #999; margin: 0 0 10px 0;">Переведите на русский:</p><p style="font-size: 18px; font-weight: bold; margin: 0;">${question.text}</p>`;
      container.appendChild(header);
      const optionsDiv = document.createElement('div');
      optionsDiv.style.cssText = 'display: flex; flex-direction: column; gap: 10px;';
      options.forEach(opt => {
        const btn = document.createElement('button');
        btn.style.cssText = 'padding: 12px; background: #f0f0f0; border: 2px solid #ddd; border-radius: 8px; cursor: pointer; font-weight: 600; text-align: left;';
        btn.textContent = opt;
        btn.onclick = () => {
          optionsDiv.querySelectorAll('button').forEach(b => b.style.pointerEvents = 'none');
          const isCorrect = opt === question.correct;
          btn.style.background = isCorrect ? '#2ecc71' : '#ef4444';
          btn.style.color = 'white';
          btn.style.borderColor = isCorrect ? '#27ae60' : '#dc2626';
          if (onAnswer) onAnswer(isCorrect, opt);
        };
        optionsDiv.appendChild(btn);
      });
      container.appendChild(optionsDiv);
      return container;
    }
  },

  translateRussianToGreek: {
    name: 'Перевод: Русс→Греч',
    icon: '🇬🇷',
    id: 'translate-ru-gr',
    render(question, onAnswer) {
      let wrongOptions = question.wrongOptions || [];
      let options = [question.correct, ...wrongOptions.slice(0, 3)];
      shuffle(options);
      const container = document.createElement('div');
      const header = document.createElement('div');
      header.style.cssText = 'background: #f5f5f5; padding: 15px; border-radius: 8px; margin-bottom: 15px;';
      header.innerHTML = `<p style="color: #999; margin: 0 0 10px 0;">Переведите на греческий:</p><p style="font-size: 18px; font-weight: bold; margin: 0;">${question.text}</p>`;
      container.appendChild(header);
      const optionsDiv = document.createElement('div');
      optionsDiv.style.cssText = 'display: flex; flex-direction: column; gap: 10px;';
      options.forEach(opt => {
        const btn = document.createElement('button');
        btn.style.cssText = 'padding: 12px; background: #f0f0f0; border: 2px solid #ddd; border-radius: 8px; cursor: pointer; font-weight: 600; text-align: left;';
        btn.textContent = opt;
        btn.onclick = () => {
          optionsDiv.querySelectorAll('button').forEach(b => b.style.pointerEvents = 'none');
          const isCorrect = opt === question.correct;
          btn.style.background = isCorrect ? '#2ecc71' : '#ef4444';
          btn.style.color = 'white';
          btn.style.borderColor = isCorrect ? '#27ae60' : '#dc2626';
          if (onAnswer) onAnswer(isCorrect, opt);
        };
        optionsDiv.appendChild(btn);
      });
      container.appendChild(optionsDiv);
      return container;
    }
  },

  listenAndSelect: {
    name: 'Выбрать на слух',
    icon: '🔊',
    id: 'listen-select',
    render(question, onAnswer) {
      let options = [question.correct, ...(question.wrongOptions || []).slice(0, 3)];
      shuffle(options);
      const container = document.createElement('div');
      const header = document.createElement('div');
      header.style.cssText = 'background: #f5f5f5; padding: 15px; border-radius: 8px; margin-bottom: 15px;';
      const speakBtn = document.createElement('button');
      speakBtn.style.cssText = 'background: #667eea; color: white; border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 16px;';
      speakBtn.textContent = '🔊 Воспроизвести';
      speakBtn.onclick = () => speak(question.text);
      header.innerHTML = '<p style="color: #999; margin: 0 0 15px 0;">Послушайте и выберите правильное слово:</p>';
      header.appendChild(speakBtn);
      container.appendChild(header);
      const optionsDiv = document.createElement('div');
      optionsDiv.style.cssText = 'display: flex; flex-direction: column; gap: 10px;';
      options.forEach(opt => {
        const btn = document.createElement('button');
        btn.style.cssText = 'padding: 12px; background: #f0f0f0; border: 2px solid #ddd; border-radius: 8px; cursor: pointer; font-weight: 600; text-align: left;';
        btn.textContent = opt;
        btn.onclick = () => {
          optionsDiv.querySelectorAll('button').forEach(b => b.style.pointerEvents = 'none');
          const isCorrect = opt === question.correct;
          btn.style.background = isCorrect ? '#2ecc71' : '#ef4444';
          btn.style.color = 'white';
          btn.style.borderColor = isCorrect ? '#27ae60' : '#dc2626';
          if (onAnswer) onAnswer(isCorrect, opt);
        };
        optionsDiv.appendChild(btn);
      });
      container.appendChild(optionsDiv);
      return container;
    }
  },

  fillInBlank: {
    name: 'Подставить',
    icon: '✏️',
    id: 'fill-blank',
    render(question, onAnswer) {
      let options = [question.correct, ...(question.wrongOptions || []).slice(0, 3)];
      shuffle(options);
      const container = document.createElement('div');
      const header = document.createElement('div');
      header.style.cssText = 'background: #f5f5f5; padding: 15px; border-radius: 8px; margin-bottom: 15px;';
      header.innerHTML = `<p style="color: #999; margin: 0 0 10px 0;">Подставьте правильную форму:</p><p style="font-size: 16px; margin: 0;">${question.sentence}</p>`;
      container.appendChild(header);
      const optionsDiv = document.createElement('div');
      optionsDiv.style.cssText = 'display: flex; flex-direction: column; gap: 10px;';
      options.forEach(opt => {
        const btn = document.createElement('button');
        btn.style.cssText = 'padding: 12px; background: #f0f0f0; border: 2px solid #ddd; border-radius: 8px; cursor: pointer; font-weight: 600; text-align: left;';
        btn.textContent = opt;
        btn.onclick = () => {
          optionsDiv.querySelectorAll('button').forEach(b => b.style.pointerEvents = 'none');
          const isCorrect = opt === question.correct;
          btn.style.background = isCorrect ? '#2ecc71' : '#ef4444';
          btn.style.color = 'white';
          btn.style.borderColor = isCorrect ? '#27ae60' : '#dc2626';
          if (onAnswer) onAnswer(isCorrect, opt);
        };
        optionsDiv.appendChild(btn);
      });
      container.appendChild(optionsDiv);
      return container;
    }
  },

  chooseArticle: {
    name: 'Выбрать артикль',
    icon: '📄',
    id: 'choose-article',
    render(question, onAnswer) {
      const articles = ['ο', 'η', 'το'];
      const container = document.createElement('div');
      const header = document.createElement('div');
      header.style.cssText = 'background: #f5f5f5; padding: 15px; border-radius: 8px; margin-bottom: 15px;';
      header.innerHTML = `<p style="color: #999; margin: 0 0 10px 0;">Выберите правильный артикль:</p><p style="font-size: 20px; font-weight: bold; margin: 0; color: #667eea;">___ ${question.noun_el}</p><p style="color: #999; font-size: 13px; margin: 8px 0 0 0;">(${question.noun_ru})</p>`;
      container.appendChild(header);
      const optionsDiv = document.createElement('div');
      optionsDiv.style.cssText = 'display: flex; gap: 10px;';
      articles.forEach(article => {
        const btn = document.createElement('button');
        btn.style.cssText = 'flex: 1; padding: 16px; background: #f0f0f0; border: 2px solid #ddd; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 18px;';
        btn.textContent = article;
        btn.onclick = () => {
          optionsDiv.querySelectorAll('button').forEach(b => b.style.pointerEvents = 'none');
          const isCorrect = article === question.article_el;
          btn.style.background = isCorrect ? '#2ecc71' : '#ef4444';
          btn.style.color = 'white';
          btn.style.borderColor = isCorrect ? '#27ae60' : '#dc2626';
          if (onAnswer) onAnswer(isCorrect, article);
        };
        optionsDiv.appendChild(btn);
      });
      container.appendChild(optionsDiv);
      return container;
    }
  },

  chooseArticleWithCase: {
    name: 'Выбрать артикль (со склонением)',
    icon: '📋',
    id: 'choose-article-case',
    render(question, onAnswer) {
      const getUniqueArticles = (articles) => [...new Set(articles)].sort();
      const allArticles = ['ο', 'η', 'το', 'του', 'της', 'την', 'τον', 'τις', 'τους', 'οι', 'τα', 'των'];
      const container = document.createElement('div');
      const header = document.createElement('div');
      header.style.cssText = 'background: #f5f5f5; padding: 15px; border-radius: 8px; margin-bottom: 15px;';
      header.innerHTML = `<p style="color: #999; margin: 0 0 10px 0;">Выберите правильный артикль (${question.case_name}):</p><p style="font-size: 18px; font-weight: bold; margin: 0; color: #667eea;">___ ${question.example_el.split(' ').slice(1).join(' ')}</p><p style="color: #999; font-size: 13px; margin: 8px 0 0 0;">${question.number} | ${question.example_ru}</p>`;
      container.appendChild(header);
      const optionsDiv = document.createElement('div');
      optionsDiv.style.cssText = 'display: flex; flex-wrap: wrap; gap: 8px;';
      const options = [question.article_el, ...allArticles.filter(a => a !== question.article_el).slice(0, 5)];
      shuffle(options);
      options.forEach(article => {
        const btn = document.createElement('button');
        btn.style.cssText = 'flex: 0 1 calc(50% - 4px); padding: 12px; background: #f0f0f0; border: 2px solid #ddd; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 16px;';
        btn.textContent = article;
        btn.onclick = () => {
          optionsDiv.querySelectorAll('button').forEach(b => b.style.pointerEvents = 'none');
          const isCorrect = article === question.article_el;
          btn.style.background = isCorrect ? '#2ecc71' : '#ef4444';
          btn.style.color = 'white';
          btn.style.borderColor = isCorrect ? '#27ae60' : '#dc2626';
          if (onAnswer) onAnswer(isCorrect, article);
        };
        optionsDiv.appendChild(btn);
      });
      container.appendChild(optionsDiv);
      return container;
    }
  }
};

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

window.getAvailableModules = function() {
  return Object.values(window.QuizModules).map(m => ({
    id: m.id,
    name: m.name,
    icon: m.icon
  }));
};

window.getModule = function(moduleId) {
  return Object.values(window.QuizModules).find(m => m.id === moduleId);
};
