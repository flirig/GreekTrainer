import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import phrasesRouter from './routes/phrases.js';
import exercisesRouter from './routes/exercises.js';
import authRouter from './routes/auth.js';
import wordsRouter from './routes/words.js';
import listsRouter from './routes/lists.js';
import { verifyToken } from './middleware/auth.js';
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

// Admin panel
app.get('/admin', (req, res) => {
  res.sendFile(join(__dirname, '../public/admin.html'));
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/phrases', phrasesRouter);
app.use('/api/words', wordsRouter);
app.use('/api/lists', listsRouter);
app.use('/api/exercises', exercisesRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
const startServer = async () => {
  try {
    console.log('🔧 Initializing database...');
    // Ensure database is initialized
    const database = await db.init();
    console.log('✅ Database initialized');

    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`🌐 Open http://localhost:${PORT}`);
      console.log('📊 API: http://localhost:${PORT}/api/phrases');
    });
  } catch (err) {
    console.error('❌ Server startup failed:', err);
    console.error('Stack:', err.stack);
    process.exit(1);
  }
};

startServer();
