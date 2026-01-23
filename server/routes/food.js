const express = require('express');
const pool = require('../db');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM food_entries WHERE user_id = ? ORDER BY entry_date DESC, id DESC', [req.user.id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching food entries' });
  }
});

router.post('/', async (req, res) => {
  const { food_name, calories } = req.body;
  const entry_date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  try {
    const [result] = await pool.query(
      'INSERT INTO food_entries (user_id, food_name, calories, entry_date) VALUES (?, ?, ?, ?)',
      [req.user.id, food_name, calories, entry_date]
    );
    res.json({ id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: 'Error adding food' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM food_entries WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting food' });
  }
});

module.exports = router;