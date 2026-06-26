const router  = require('express').Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const db      = require('../db');
const auth    = require('../middleware/authenticate');

// Normal login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: 'Missing credentials' });
  try {
    const r    = await db.query('SELECT * FROM users WHERE username = $1', [username]);
    const user = r.rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash)))
      return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
    res.json({ token, role: user.role, username: user.username });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// VULNERABLE: hidden dev endpoint — no authentication required
router.post('/bootstrap-register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password)
      return res.status(400).json({ error: 'Missing fields' });
    const hash   = await bcrypt.hash(password, 10);
    const result = await db.query(
      'INSERT INTO users (username,email,password_hash,role) VALUES ($1,$2,$3,$4) RETURNING id,username,role',
      [username, email, hash, 'employee']
    );
    res.status(201).json({ message: 'Account created', user: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Already exists' });
    res.status(500).json({ error: err.message });
  }
});

// Change own password (authenticated)
router.post('/change-password', auth, async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password)
      return res.status(400).json({ error: 'current_password and new_password are required' });

    const r    = await db.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    const user = r.rows[0];
    if (!user) return res.status(404).json({ error: 'User not found' });

    const ok = await bcrypt.compare(current_password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Current password is incorrect' });

    const hash = await bcrypt.hash(new_password, 10);
    await db.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, req.user.id]);
    res.json({ message: 'Password updated' });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
