# MVP Deployment Checklist

**Date:** 2026-09-26  
**Target:** Railway.app  
**Status:** Ready for deployment

---

## ✅ Pre-deployment

### Local Testing (Run these first)

```bash
# 1. Start dev server
cd /Users/evgeniinesterov/Projects/GreekTrainer
npm run dev

# 2. Run migrations (creates paradigms, paradigm_rules, word_paradigm tables)
npm run db:init

# 3. Import lexicon data (50 words + paradigm links)
node scripts/import-lexicon.js

# 4. Test API endpoints (in another terminal)
curl -X POST http://localhost:3000/api/words/synthesize \
  -H "Content-Type: application/json" \
  -d '{"lemma":"αγαπώ","tense":"present","person":"3rd","number":"singular"}'

# Expected response:
# {"success":true,"form":"αγαπά","paradigm":"Ρ10.1",...}
```

### Smoke Tests

```bash
# Test all 3 endpoints
curl -X POST http://localhost:3000/api/words/analyze \
  -H "Content-Type: application/json" \
  -d '{"form":"αγαπά"}'

curl -X POST http://localhost:3000/api/words/validate \
  -H "Content-Type: application/json" \
  -d '{"phrase":["ο","καλός","άνθρωπος"]}'

# Test existing exercises still work
curl http://localhost:3000/api/phrases
curl http://localhost:3000/api/exercises/random
```

---

## 🚀 Railway Deployment

### Step 1: Connect to Railway

```bash
# Login to Railway CLI
railway login

# Link to existing project
railway link

# Or create new project
railway init
```

### Step 2: Set Environment Variables

On Railway Dashboard:
```
DATABASE_URL = (auto-set by Railway)
NODE_ENV = production
PORT = 3000
JWT_SECRET = (generate a random string)
```

### Step 3: Push Code

```bash
# Option A: Through Railway CLI
railway up

# Option B: Through Git
git push origin main
# Railway will auto-deploy when linked
```

### Step 4: Run Migrations on Production

```bash
# SSH into Railway container
railway shell

# Run migrations
npm run db:init

# Run import
node scripts/import-lexicon.js

# Verify
curl http://localhost:3000/api/health
```

### Step 5: Smoke Test on Production

```bash
# Get Railway URL from dashboard (e.g., https://greek-trainer-prod.railway.app)
export PROD_URL="https://greek-trainer-prod.railway.app"

curl $PROD_URL/api/health
curl -X POST $PROD_URL/api/words/synthesize \
  -H "Content-Type: application/json" \
  -d '{"lemma":"αγαπώ","tense":"present","person":"3rd","number":"singular"}'
```

---

## ✅ Post-deployment

### Verification Checklist

- [ ] Health check returns 200 (`/api/health`)
- [ ] /api/words/synthesize works
- [ ] /api/words/analyze works
- [ ] /api/words/validate works
- [ ] /api/phrases returns data (existing exercise)
- [ ] /api/exercises/random works (existing exercise)
- [ ] Dashboard loads without errors
- [ ] 12 existing exercises still work
- [ ] No 500 errors in logs

### Rollback Plan

If something breaks:

```bash
# 1. Stop the Railway deployment
railway stop

# 2. Rollback to previous commit
git revert HEAD

# 3. Push rollback
git push

# 4. Redeploy
railway up
```

---

## 📊 Deployed Resources

After deployment, you will have:

### Database (PostgreSQL on Railway)
- `paradigms` (4 rows)
- `paradigm_rules` (24 rows)
- `word_paradigm` (50 rows)
- `words` (updated with paradigm links)
- All existing tables (phrases, users, etc.)

### API Endpoints (live on Railway)
```
https://greek-trainer-prod.railway.app/api/words/synthesize
https://greek-trainer-prod.railway.app/api/words/analyze
https://greek-trainer-prod.railway.app/api/words/validate
```

### Frontend
- All 12 existing exercises: ✅ Working
- 3 new morphology exercises: ⏳ Ready to integrate
- Dashboard: ✅ Live

---

## 🎯 Next Steps (Post-MVP)

After successful deployment:

1. **Task #13:** Plan Post-MVP features
   - Full dictionary integration (5000+ words)
   - Admin UI for paradigm management
   - Mobile app
   - Community features

2. **Integration Tasks:**
   - Add morphology exercises to dashboard
   - Wire up agreement validator
   - Performance optimization

3. **Monitoring:**
   - Set up error tracking (Sentry)
   - Monitor API response times
   - Track user progress

---

## 🆘 Troubleshooting

### API returns 404

```
❌ Problem: Endpoint not found
✅ Solution: Verify routes/words.js is in server/routes/
```

### Database migration fails

```
❌ Problem: paradigms table already exists
✅ Solution: Check if migration ran twice; safe to re-run (uses CREATE TABLE IF NOT EXISTS)
```

### Synthesize returns "paradigm not found"

```
❌ Problem: Word not linked to paradigm
✅ Solution: Run import-lexicon.js again
```

### No data after deploy

```
❌ Problem: Migrations didn't run or data not imported
✅ Solution: SSH into Railway and run:
   npm run db:init
   node scripts/import-lexicon.js
```

---

**Deployment Ready:** ✅  
**Last Updated:** 2026-09-26  
**Estimated Time:** 15-20 minutes
