require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cron = require('node-cron');

const app = express();
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

app.use(cors());
app.use(express.json());

// JWT middleware
function authenticateToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Auth endpoints
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const hash = await bcrypt.hash(password, 8);
    const result = await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1,$2,$3) RETURNING id, name, email',
      [name, email, hash]
    );
    res.json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'Email already registered' });
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const q = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
  const user = q.rows[0];
  if (!user) return res.status(400).json({ error: 'User not found' });
  if (!user.password) return res.status(400).json({ error: 'No password set (Google login expected)' });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ error: 'Invalid password' });
  const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET);
  res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
});

// Profile endpoints
app.get('/api/profile', authenticateToken, async (req, res) => {
  const { id } = req.user;
  const result = await pool.query("SELECT name, email, courses, available_slots FROM users WHERE id=$1", [id]);
  res.json(result.rows[0]);
});

app.post('/api/profile', authenticateToken, async (req, res) => {
  const { courses, available_slots } = req.body;
  const { id } = req.user;
  try {
    await pool.query("UPDATE users SET courses=$1, available_slots=$2 WHERE id=$3", [courses, available_slots, id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Groups: create, discover, join, my-groups
app.post('/api/groups/create', authenticateToken, async (req, res) => {
  const { name, subject, description, time_slot, capacity, join_link } = req.body;
  const createdBy = req.user.id;
  try {
    const existingGroup = await pool.query(
      "SELECT * FROM groups WHERE subject=$1 AND time_slot=$2 AND member_count >= capacity",
      [subject, time_slot]
    );
    if (existingGroup.rows.length > 0) return res.status(400).json({ error: "Group already full at this slot & subject." });
    const result = await pool.query(
      `INSERT INTO groups (name, subject, description, time_slot, capacity, member_count, created_by, join_link)
       VALUES ($1,$2,$3,$4,$5,0,$6,$7) RETURNING *`,
      [name, subject, description, time_slot, capacity, createdBy, join_link]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/groups/discover', authenticateToken, async (req, res) => {
  try {
    const { id } = req.user;
    const user = await pool.query("SELECT courses, available_slots FROM users WHERE id=$1", [id]);
    if (!user.rows.length) return res.status(404).json({ error: "User not found" });

    const courses = user.rows[0].courses || [];
    const slots = user.rows[0].available_slots || [];

    const groups = await pool.query(`
      SELECT * FROM groups
      WHERE subject = ANY($1)
        AND time_slot = ANY($2)
        AND member_count < capacity
      ORDER BY time_slot ASC`,
      [courses, slots]
    );

    res.json(groups.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/groups/join', authenticateToken, async (req, res) => {
  try {
    const { groupId } = req.body;
    const userId = req.user.id;

    const group = await pool.query("SELECT * FROM groups WHERE id=$1", [groupId]);
    if (!group.rows.length) return res.status(404).json({ error: "Group not found" });
    if (group.rows[0].member_count >= group.rows[0].capacity) return res.status(400).json({ error: "Group full" });

    const alreadyMember = await pool.query("SELECT * FROM group_memberships WHERE user_id=$1 AND group_id=$2", [userId, groupId]);
    if (alreadyMember.rows.length) return res.status(400).json({ error: "Already joined" });

    await pool.query("INSERT INTO group_memberships (user_id, group_id) VALUES ($1,$2)", [userId, groupId]);
    await pool.query("UPDATE groups SET member_count = member_count + 1 WHERE id=$1", [groupId]);
    return res.json({ success: true, message: "Joined group" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/groups/my', authenticateToken, async (req, res) => {
  const { id } = req.user;
  const q = await pool.query(
    `SELECT g.* FROM groups g
     JOIN group_memberships m ON g.id = m.group_id
     WHERE m.user_id=$1`,
    [id]
  );
  res.json(q.rows);
});

// Optional: Admin stats endpoint
app.get('/api/admin/analytics', authenticateToken, async (req, res) => {
  // Example: count users, popular subjects, active slots, flagged reports, etc.
  const usersResult = await pool.query("SELECT COUNT(*) FROM users");
  const groupsResult = await pool.query("SELECT COUNT(*) FROM groups");
  const popularSubjects = await pool.query("SELECT subject, COUNT(*) FROM groups GROUP BY subject ORDER BY count DESC LIMIT 5");
  res.json({
    users: usersResult.rows[0].count,
    groups: groupsResult.rows[0].count,
    popularSubjects: popularSubjects.rows
  });
});

// Daily slot and group cleanup (runs at midnight)
cron.schedule('0 0 * * *', async () => {
  const now = new Date();
  try {
    await pool.query("DELETE FROM group_memberships WHERE group_id IN (SELECT id FROM groups WHERE time_slot < $1)", [now]);
    await pool.query("DELETE FROM groups WHERE time_slot < $1", [now]);
    await pool.query(`
      UPDATE users SET available_slots = 
      (SELECT ARRAY_AGG(slot) FROM UNNEST(available_slots) AS slot WHERE slot >= $1)
    `, [now]);
    console.log("Daily slot reset completed");
  } catch (err) {
    console.error("Slot reset error:", err.message);
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(Server listening on port ${PORT}));