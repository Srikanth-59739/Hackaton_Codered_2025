const express = require('express');
const router = express.Router();
const pool = require('../models/db');

// Save/update profile
router.post('/update', async (req, res) => {
  const { userId, department, semester, courses, topics, timeSlots } = req.body;
  await pool.query(
    "UPDATE users SET department=$1, semester=$2, courses=$3, topics=$4, available_times=$5 WHERE id=$6",
    [department, semester, courses, topics, timeSlots, userId]
  );
  res.json({ success: true });
});

// Get user profile
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const resp = await pool.query("SELECT * FROM users WHERE id=$1", [id]);
  res.json(resp.rows[0]);
});

module.exports = router;
