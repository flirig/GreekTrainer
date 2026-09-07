# 🇬🇷 Греческий тренажер: PRO MAX

Интерактивный веб-приложение для обучения греческому языку с системой отслеживания прогресса и расширяемой базой данных.

## 🚀 Возможности

- **9 режимов упражнений**: Словарь, подстановка слов, перевод, аудио, ударения, ошибки, карточки
- **🔥 МИКС режим**: случайные упражнения с системой достижений
- **📊 Отслеживание прогресса**: сохранение результатов пользователя
- **🛠️ Админ-панель**: добавление новых фраз и упражнений
- **🗣️ Синтез речи**: автоматическое произношение греческого текста
- **📱 Адаптивный дизайн**: работает на ПК, планшетах и телефонах

## 📋 Структура проекта

```
GreekTrainer/
├── server/
│   ├── index.js              # Express сервер
│   ├── routes/
│   │   ├── phrases.js        # API для фраз
│   │   └── exercises.js      # API для упражнений
│   └── db/
│       ├── database.js       # Конфигурация БД
│       ├── schema.js         # Схема БД
│       └── init.js           # Инициализация данных
├── public/
│   └── index.html            # Фронтенд
├── data/
│   └── trainer.db            # SQLite БД (создается автоматически)
├── package.json
└── README.md
```

## 🛠️ Установка

### Локально

1. **Клонируйте проект:**
   ```bash
   cd /Users/evgeniinesterov/Projects/GreekTrainer
   ```

2. **Установите зависимости:**
   ```bash
   npm install
   ```

3. **Инициализируйте БД:**
   ```bash
   npm run db:init
   ```

4. **Запустите сервер:**
   ```bash
   npm run dev
   ```

5. **Откройте браузер:**
   ```
   http://localhost:3000
   ```

## 🚀 Развёртывание на Railway

### 1. Подготовка к развёртыванию

```bash
# Убедитесь, что изменения коммитированы
git add -A
git commit -m "Add database and Express backend"
```

### 2. Создание Railway проекта

```bash
# Установите Railway CLI (если не установлен)
brew install railway

# Авторизуйтесь
railway login

# Инициализируйте проект
railway init
```

### 3. Создание PostgreSQL БД (опционально)

На Railway лучше использовать PostgreSQL вместо SQLite для production:

```bash
railway add postgres
```

Затем обновите `server/db/database.js`:

```javascript
import pg from 'pg';
const { Client } = pg;

async function initDb() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });
  await client.connect();
  return client;
}
```

И обновите `package.json`:
```json
{
  "dependencies": {
    "pg": "^8.10.0",
    ...
  }
}
```

### 4. Развёртывание

```bash
# Вариант 1: Через Railway CLI
railway up

# Вариант 2: Подключить к GitHub и развернуть через Railway Dashboard
# 1. Толкните код на GitHub
# 2. Откройте railway.app
# 3. Создайте новый проект
# 4. Подключите GitHub репозиторий
# 5. Railway автоматически развернёт приложение
```

### 5. Настройка переменных окружения

На Railway Dashboard:
- Перейдите в Variables
- Добавьте: `PORT=3000`
- Добавьте: `NODE_ENV=production`

## 📚 API Endpoints

### Фразы
- `GET /api/phrases` - получить все фразы
- `GET /api/phrases/:id` - получить одну фразу с вариантами
- `POST /api/phrases` - добавить новую фразу
- `DELETE /api/phrases/:id` - удалить фразу

### Упражнения
- `GET /api/exercises/random` - случайная фраза для упражнения
- `POST /api/exercises/result` - сохранить результат
- `GET /api/exercises/stats/:userId` - получить статистику пользователя

## 📝 Добавление новых фраз

### Через API (cURL)

```bash
curl -X POST http://localhost:3000/api/phrases \
  -H "Content-Type: application/json" \
  -d '{
    "el": "καλησπέρα σας",
    "ru": "добрый вечер",
    "wAccents": ["καλησπερα σας", "καλησπέρας"],
    "mistakes": ["καλησπερα σας", "καλησπέρα σαν"]
  }'
```

### Через SQL

```sql
INSERT INTO phrases (el, ru) VALUES ('καλησπέρα σας', 'добрый вечер');
INSERT INTO accent_variants (phrase_id, variant) VALUES (7, 'καλησπερα σας');
INSERT INTO mistakes (phrase_id, variant) VALUES (7, 'καλησπερα σας');
```

## 🎯 Следующие шаги

- [ ] Добавить админ-панель для управления фразами
- [ ] Интеграция с PostgreSQL для production
- [ ] Система пользователей и аутентификация
- [ ] Экспорт/импорт фраз из CSV
- [ ] Дополнительные упражнения (сборка, письменные)
- [ ] Мобильное приложение (React Native)
- [ ] Поддержка других языков

## 📄 Лицензия

MIT

## 👨‍💻 Автор

Evgenii Nesterov
