const express = require('express');
const router = express.Router();
const pool = require('../models/db');

// Create group
router.post('/create', async (req, res) => {
  const { name, subject, description, timeSlots, capacity, createdBy, link } = req.body;
  const resp = await pool.query(
    "INSERT INTO groups (name, subject, description, time_slots, capacity, created_by, join_link) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *",
    [name, subject, description, timeSlots, capacity, createdBy, link]
  );
  res.json(resp.rows[0]);
});

// List and filter groups (+ basic matching logic)
router.get('/discover/:userId', async (req, res) => {
  const userId = req.params.userId;
  const userQ = await pool.query("SELECT courses, available_times FROM users WHERE id=$1", [userId]);
  const user = userQ.rows[0];
  const groupQ = await pool.query("SELECT * FROM groups");
  // Naive matching: subject overlap OR time slot overlap
  const matches = groupQ.rows.filter(g =>
    user.courses.some(c => g.subject?.includes(c)) ||
    user.available_times.some(t => g.time_slots?.includes(t))
  );
  res.json(matches);
});

// Join group
router.post('/join', async (req, res) => {
  const { userId, groupId } = req.body;
  await pool.query(
    "INSERT INTO group_memberships (user_id, group_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
    [userId, groupId]
  );
  res.json({ success: true });
});

// Get user's groups
router.get('/my/:userId', async (req, res) => {
  const q = await pool.query(`
    SELECT g.* FROM groups g
    JOIN group_memberships m ON g.id = m.group_id
    WHERE m.user_id=$1
  `, [req.params.userId]);
  res.json(q.rows);
});

module.exports = router;
