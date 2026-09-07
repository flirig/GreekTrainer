import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import phrasesRouter from './routes/phrases.js';
import exercisesRouter from './routes/exercises.js';
import db from './db/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files
app.use(express.static(join(__dirname, '../public')));

// API Routes
app.use('/api/phrases', phrasesRouter);
app.use('/api/exercises', exercisesRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Initialize database and start server
db.init().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('❌ Database initialization failed:', err);
  process.exit(1);
});
