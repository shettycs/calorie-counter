const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');

const router = express.Router();

router.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;

  // Basic server-side validation
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email, and password are required' });
  }

  try {
    const hashedPw = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPw]
    );
    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    console.error('Signup error details:', {
      message: err.message,
      code: err.code,
      sqlMessage: err.sqlMessage || 'No SQL message',
      sql: err.sql || 'No SQL query'
    });

    if (err.code === 'ER_DUP_ENTRY') {
      // This is the most common: duplicate email or username
      res.status(409).json({ error: 'Email or username already exists. Please use a different one.' });
    } else if (err.code === 'ER_BAD_FIELD_ERROR') {
      res.status(500).json({ error: 'Database field mismatch. Contact developer.' });
    } else {
      res.status(500).json({ error: 'Error creating user: ' + (err.message || 'Unknown error') });
    }
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) return res.status(400).json({ error: 'Invalid credentials' });
    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: 'Error logging in' });
  }
});

module.exports = router;