const express = require('express');
const pool = require('../db');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM user_profiles WHERE user_id = ?', [req.user.id]);
    res.json(rows[0] || null);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching profile' });
  }
});

router.post('/', async (req, res) => {
  const { goal, weight, height, age, gender } = req.body;
  let bmr;
  if (gender === 'male') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }
  let dailyCal = bmr * 1.2; // Sedentary
  if (goal === 'lose') dailyCal -= 500;
  if (goal === 'gain') dailyCal += 500;
  dailyCal = Math.round(dailyCal);

  try {
    await pool.query(
      'REPLACE INTO user_profiles (user_id, goal, weight, height, age, gender, daily_calories) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [req.user.id, goal, weight, height, age, gender, dailyCal]
    );
    res.json({ daily_calories: dailyCal });
  } catch (err) {
    res.status(500).json({ error: 'Error saving profile' });
  }
});

module.exports = router;