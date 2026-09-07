import express from 'express';
import bcrypt from 'bcrypt';
import db from '../db/database.js';
import { createToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const database = await db.get();

    // Check if user exists
    const existing = await database.get('SELECT id FROM users WHERE email = ?', [email]);
    if (existing) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Create user
    await database.run(
      'INSERT INTO users (email, password_hash) VALUES (?, ?)',
      [email, password_hash]
    );

    // Get user to return token
    const user = await database.get('SELECT id, email, is_admin FROM users WHERE email = ?', [email]);

    res.status(201).json({
      message: 'User created',
      token: createToken(user),
      user: { id: user.id, email: user.email, is_admin: user.is_admin }
    });
  } catch (error) {
    console.error('❌ Register error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const database = await db.get();

    // Find user
    const user = await database.get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.json({
      message: 'Login successful',
      token: createToken(user),
      user: { id: user.id, email: user.email, is_admin: user.is_admin }
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token' });
    }

    // If we got here, token was verified by middleware
    // Just return user info from token
    res.json({ user: req.user });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;
