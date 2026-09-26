# Greek Trainer: Development Guide

**Full-Stack Greek Language Learning Platform**  
Express + PostgreSQL/SQLite + Vanilla JS Frontend

---

## 📦 Project Setup

### Quick Start
```bash
cd /Users/evgeniinesterov/Projects/GreekTrainer
npm install
npm run dev
# Open http://localhost:3000
```

### Environment
Create `.env` in project root (see `.env.example`):
```
DATABASE_URL=postgresql://user:password@localhost:5432/greek_db
NODE_ENV=development
PORT=3000
JWT_SECRET=your-secret-key-here
```

### Local Database
- **Default:** SQLite (auto-created in `data/trainer.db`)
- **Production:** PostgreSQL on Railway
- **Fallback:** Automatically detects and switches between them

---

## 🏗️ Architecture

```
GreekTrainer/
├── server/
│   ├── index.js                    # Express app
│   ├── routes/
│   │   ├── phrases.js              # GET/POST/DELETE /api/phrases
│   │   ├── exercises.js            # GET/POST /api/exercises/*
│   │   └── admin.js                # (TODO) Admin endpoints
│   ├── middleware/
│   │   └── auth.js                 # (TODO) JWT verification
│   └── db/
│       ├── database.js             # SQLite + PostgreSQL wrapper
│       ├── database-pg.js          # PostgreSQL-only fallback
│       ├── schema.js               # Schema definitions + seed data
│       └── init.js                 # DB initialization & migrations
├── public/
│   └── index.html                  # SPA frontend (7 exercise types)
├── migrations/                      # (active) DB migration files
├── data/                           # SQLite DB file (local only)
├── .claude/
│   ├── agents.md                   # Agent definitions
│   └── settings.json               # Claude Code settings (optional)
├── package.json
├── railway.toml                    # Railway deployment config
├── CLAUDE.md                       # This file
└── README.md                       # User-facing documentation
```

---

## 🎮 Frontend: 7 Exercise Types

All implemented in `public/index.html`:

1. **Словарь (Dictionary)** — Match Greek ↔ Russian
2. **Слово (Fill-word)** — Complete Greek sentence
3. **Перевод (Translation)** — Translate Russian → Greek
4. **На слух (Listening)** — Listen and select correct phrase
5. **Ударения (Accents)** — Choose correct accent position
6. **Ошибки (Errors)** — Find mistake in phrase variant
7. **Карточки (Flashcards)** — Swipe through cards

### 🔥 МИКС Mode
- Randomizes all exercise types
- Tracks streak (сгорает at 0)
- Awards badges: 🔥, 🥉, 🥈, 🥇, 👑
- Animations & sound effects

---

## 🔌 API Endpoints

### Phrases
```
GET    /api/phrases                    # All phrases
GET    /api/phrases/:id                # Single phrase + variants
POST   /api/phrases                    # Add phrase (body: {el, ru, wAccents[], mistakes[]})
DELETE /api/phrases/:id                # Remove phrase
```

### Exercises
```
GET    /api/exercises/random           # Random phrase for any exercise
POST   /api/exercises/result           # Record attempt (body: {userId, phraseId, exerciseType, isCorrect})
GET    /api/exercises/stats/:userId    # User stats by exercise type
```

### Health
```
GET    /api/health                     # Sanity check
```

---

## 🗄️ Database Schema

### Tables
- **phrases** — Greek phrases + Russian translation
- **accent_variants** — Variants without accents
- **mistakes** — Common errors for "Ошибки" exercise
- **stories** — Multi-sentence stories (reserved for future)
- **story_sentences** — Story sentences (reserved)
- **user_progress** — Exercise results (userId, phraseId, exerciseType, isCorrect, timestamp)
- **users** — (TODO) User accounts (email, password_hash, is_admin)

### Example Seed Data
```sql
INSERT INTO phrases (el, ru) VALUES 
  ('καλημέρα', 'доброе утро'),
  ('καλησπέρα σας', 'добрый вечер'),
  ('πώς είστε;', 'как дела?');
```

---

## ✅ Current Implementation Status

### ✓ Completed
- [x] Backend Express server with SQLite + PostgreSQL support
- [x] 7 exercise types (frontend)
- [x] МИКС mode with achievements
- [x] User progress tracking (anonymous)
- [x] API CRUD for phrases
- [x] Railway deployment ready
- [x] Seed data (6 phrases)
- [x] CORS enabled for frontend

### 📋 To-Do (Next Sprints)

#### Sprint 1: Authentication 🔐
- [ ] User registration endpoint (POST /api/auth/register)
- [ ] User login endpoint (POST /api/auth/login)
- [ ] JWT token generation & validation
- [ ] Auth middleware (protect routes)
- [ ] User table with password_hash, is_admin
- [ ] Frontend login/logout UI
- [ ] Link user_progress to user_id (not anonymous)

#### Sprint 2: Admin Dashboard 📊
- [ ] Admin panel UI (restricted to is_admin=true)
- [ ] Manage phrases: add/edit/delete via UI
- [ ] Manage users: view/block/delete
- [ ] Statistics dashboard
- [ ] CSV import/export phrases
- [ ] Audit logs

#### Sprint 3: Polish & Features
- [ ] Dark mode
- [ ] User profiles (name, avatar, achievements)
- [ ] Leaderboard
- [ ] PWA (offline mode, installable)
- [ ] Mobile app (React Native?) — future

---

## 🚀 Deployment

### Local Testing
```bash
npm run dev
# http://localhost:3000
```

### Railway Deployment
```bash
# Requires railway CLI installed
railway login
railway link                    # Link to existing Railway project
git push                        # or railway up
```

**Environment Variables on Railway:**
- `DATABASE_URL` — PostgreSQL connection (auto-set by Railway)
- `NODE_ENV` — set to "production"
- `PORT` — 3000 (auto-configured)
- `JWT_SECRET` — Set manually in Railway dashboard

**Check Status:**
```bash
railway logs
railway variables
```

---

## 🔧 Development Tips

### Add New Exercise Type
1. Create handler function in `public/index.html` (e.g., `playNewExercise()`)
2. Add UI button in HTML
3. POST to `/api/exercises/result` when done
4. Test in МИКС mode

### Add Phrases via cURL
```bash
curl -X POST http://localhost:3000/api/phrases \
  -H "Content-Type: application/json" \
  -d '{
    "el": "καλημέρα σας",
    "ru": "доброе утро (вам)",
    "wAccents": ["καλημερα σας"],
    "mistakes": ["καλησπερα σας", "καλημερας"]
  }'
```

### Database Inspection
```bash
# SQLite (local)
sqlite3 data/trainer.db ".tables"
sqlite3 data/trainer.db "SELECT COUNT(*) FROM phrases;"

# PostgreSQL (Railway)
psql $DATABASE_URL -c "SELECT * FROM phrases;"
```

### Migrate SQLite → PostgreSQL
```bash
DATABASE_URL=postgresql://... npm run migrate
```

---

## 🧪 Testing

No tests yet — use manual testing:
1. **Smoke test:** Open http://localhost:3000, try each exercise
2. **API test:** Use cURL or Postman
3. **Mobile test:** Open on phone via ngrok or local network

### Run on Mobile (Local Network)
```bash
# Get local IP
ipconfig getifaddr en0
# Open http://<IP>:3000 on phone
```

---

## 📖 Code Style & Conventions

- **No build process** — Vanilla JS, direct imports where possible
- **ES Modules** — `import`/`export` syntax
- **Comments** — Only for non-obvious logic (why, not what)
- **Error handling** — Try/catch for DB operations, 500 errors to client
- **SQL** — Parameterized queries only (prevent injection)

### Naming
- Routes: lowercase with `/` (e.g., `/api/phrases/random`)
- Functions: camelCase
- CSS classes: kebab-case (e.g., `.exercise-card`)
- Tables: singular (e.g., `phrase`, not `phrases`)

---

## 🐛 Debugging

### Server Logs
```bash
npm run dev
# See Express logs + SQL queries (if enabled)
```

### Frontend Console
```javascript
// Open DevTools (F12 → Console)
// Fetch with logging:
fetch('/api/phrases')
  .then(r => r.json())
  .then(d => { console.log('Phrases:', d); return d; })
```

### Database Queries
```bash
# Enable SQL logging (modify server/db/database.js)
console.log('Query:', sql, 'Params:', params);
```

---

## 🤝 Git Workflow

```bash
# Feature branch
git checkout -b feature/auth-system
# ... make changes ...
git add -A
git commit -m "Add JWT authentication"

# Before merge
npm run db:init              # Test migrations
npm run dev                  # Manual smoke test

# Push & PR
git push -u origin feature/auth-system
```

---

## 🎯 Next Priority

**🔐 Sprint 1: Authentication System**

Start with `auth-system` agent:
```
/ask @auth-system
What's the first step to add JWT authentication?
```

Or use specialized agent:
```bash
# (when agent framework supports it)
claude-code --agent auth-system
```

See `.claude/agents.md` for all available agents.

---

## 📞 Support & Resources

- **Railway Dashboard:** https://railway.app
- **Express Docs:** https://expressjs.com
- **PostgreSQL Docs:** https://www.postgresql.org/docs
- **Project Memory:** `.claude/memory/` (Claude Code auto-tracking)

---

**Last Updated:** 2026-09-26  
**Maintainer:** claude-code  
**License:** MIT
