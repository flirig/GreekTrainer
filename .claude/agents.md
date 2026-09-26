# Greek Trainer: Custom Agents

Специализированные агенты для разработки тренажера греческого языка.

---

## 🔌 backend-api
**Роль:** Разработка и поддержка Express API
**Модель:** claude-opus-5
**Инструменты:** Bash, Read, Edit, Write, все остальные

**Возможности:**
- Создание новых API endpoints для упражнений и фраз
- Оптимизация запросов к БД (PostgreSQL/SQLite)
- Работа с миграциями и схемой БД
- Интеграция с JWT токенами (auth)
- Обработка ошибок и валидация данных

**Файлы:** `server/routes/*.js`, `server/db/*.js`, `server/index.js`

---

## 🎨 frontend-ui
**Роль:** Фронтенд разработка и UX улучшения
**Модель:** claude-opus-5
**Инструменты:** Bash, Read, Edit, Write, все остальные

**Возможности:**
- Реализация интерфейса упражнений (7 типов)
- МИКС режим со счётчиком стрика и достижениями
- Адаптивный дизайн для мобилей
- Интеграция с API (fetch, обработка ошибок)
- Улучшение UX элементов

**Файлы:** `public/index.html`, `public/css/*`, `public/js/*`

---

## 🔐 auth-system
**Роль:** Система аутентификации и авторизации (⭐ Next Priority)
**Модель:** claude-opus-5
**Инструменты:** Bash, Read, Edit, Write, все остальные

**Возможности:**
- JWT-based аутентификация
- User registration/login endpoints
- Password hashing (bcrypt)
- User таблица в БД
- Auth middleware для защиты routes
- Привязка user_progress к user_id

**Файлы:** `server/routes/auth.js`, `server/middleware/auth.js`, `server/db/schema.js`

**Статус:** 📋 Planning (есть зависимости: bcrypt, jsonwebtoken в package.json)

---

## 🛠️ database-migrations
**Роль:** Миграции, управление схемой БД, развёртывание на Railway
**Модель:** claude-opus-5
**Инструменты:** Bash, Read, Edit, Write, все остальные

**Возможности:**
- Создание и запуск миграций (up/down)
- Синхронизация схемы БД между SQLite и PostgreSQL
- Инициализация данных (seed)
- Работа с Railway PostgreSQL
- Бэкапы и восстановление БД

**Файлы:** `migrations/*.js`, `migrate.js`, `server/db/init.js`, `railway.toml`

---

## 📊 admin-dashboard
**Роль:** Админ-панель для управления контентом
**Модель:** claude-opus-5
**Инструменты:** Bash, Read, Edit, Write, все остальные

**Возможности:**
- CRUD фраз через UI вместо API/SQL
- Управление пользователями (блокировка, очистка прогресса)
- Просмотр статистики (popular phrases, user achievements)
- Импорт/экспорт фраз (CSV)
- Управление ошибками и вариантами ударений

**Файлы:** `public/admin.html`, `server/routes/admin.js`

**Требует:** auth-system ✓

---

## 🚀 devops-deployment
**Роль:** Развёртывание, CI/CD, мониторинг
**Модель:** claude-opus-5
**Инструменты:** Bash, Read, Edit, Write, все остальные

**Возможности:**
- Railway deployment configuration
- Environment variables (.env, railway.toml)
- Автоматическое тестирование (pre-push)
- Мониторинг логов на Railway
- Откат версий

**Файлы:** `railway.toml`, `.env*`, `.github/workflows/*` (если добавим)

---

## 📚 content-manager
**Роль:** Управление учебным контентом (фразы, варианты, ошибки)
**Модель:** claude-haiku-4-5
**Инструменты:** Bash, Read, Edit, Write

**Возможности:**
- Проверка корректности греческого текста
- Добавление новых фраз в БД
- Организация фраз по темам (опционально)
- Управление вариантами ударений и ошибками
- Статистика по использованию фраз

**Файлы:** `data/*`, `server/db/schema.js` (INITIAL_DATA)

---

## 🧪 test-qa
**Роль:** Тестирование и QA
**Модель:** claude-haiku-4-5
**Инструменты:** Bash, Read, Edit

**Возможности:**
- Написание unit-тестов для API
- E2E тестирование упражнений
- Проверка на mobile responsiveness
- Баг трекинг и отчёты
- Регрессионное тестирование перед deploy

**Файлы:** `tests/*`, `public/test/*.html`

---

## 📖 Technical Docs
**Роль:** Документирование архитектуры и процессов
**Модель:** claude-haiku-4-5
**Инструменты:** Bash, Read

**Возможности:**
- Актуализация README
- Документирование API (OpenAPI/Swagger)
- Архитектурные диаграммы
- Troubleshooting гайды

---

# 🎯 Current Stack

**Frontend:** Vanilla HTML/CSS/JS (no framework)
**Backend:** Node.js + Express 4.18.2
**Database:** PostgreSQL (Railway) + SQLite (local fallback)
**Auth:** JWT (jsonwebtoken 9.0.2) + bcrypt 5.1.0
**Deployment:** Railway.app
**HTTP:** CORS enabled for API

---

# 📋 Next Sprints

### Sprint 1: Authentication (🔐 auth-system)
- [ ] User model + table (email, password_hash, is_admin)
- [ ] POST /api/auth/register, /api/auth/login endpoints
- [ ] JWT token generation + validation
- [ ] Auth middleware for protected routes
- [ ] Frontend: login/signup form
- [ ] User sessions в БД или Redis

### Sprint 2: Admin Dashboard (📊 admin-dashboard)
- [ ] Admin panel UI (restricted to is_admin users)
- [ ] Manage phrases (add/edit/delete)
- [ ] Manage users (view/block/delete)
- [ ] View statistics (exercise stats, popular phrases)
- [ ] CSV import/export

### Sprint 3: Features & Polish
- [ ] User profile + progress tracking
- [ ] Achievements/badges UI improvements
- [ ] Dark mode
- [ ] Offline mode (IndexedDB)
- [ ] PWA support

---

# 🔗 Links & Resources

**Live:** https://greek-trainer.up.railway.app (Railway deployment)
**GitHub:** (add link when available)
**Database:** Railway PostgreSQL
**Monitoring:** Railway dashboard

---

**Created:** 2026-09-26
**Last Updated:** 2026-09-26
**Maintained By:** claude-code
