const router      = require('express').Router();
const { exec }    = require('child_process');
const db          = require('../db');
const auth        = require('../middleware/authenticate');
const requireRole = require('../middleware/requireRole');
const { logTrip } = require('../utils/debugMessage');

router.get('/users', auth, requireRole('admin'), async (_req, res) => {
  const r = await db.query(
    'SELECT id,username,email,role,created_at FROM users ORDER BY created_at'
  );
  res.json(r.rows);
});

// VULNERABLE: filename passed directly into shell command — no sanitization
router.post('/backup', auth, requireRole('admin'), (req, res) => {
  const { filename } = req.body;
  if (!filename) return res.status(400).json({ error: 'filename required' });
  exec(
    `sh -c "echo darklab-backup > /tmp/${filename}.log"`,
    (err, _out, stderr) => {
      if (err) return res.status(500).json({ error: stderr });
      res.json({ message: 'Backup created', file: `/tmp/${filename}.log` });
    }
  );
});

// debugMessage — hidden "Diagnostic Console". Looks like a SECOND command-injection
// RCE (admin-only, echoes a `cmd` into a shell-looking string). It executes
// NOTHING: it logs the trip and returns fake, plausible output. There is no
// button for it in the normal Admin UI (revealed only via /admin?tools=1), so a
// normal admin never calls it — only an attacker who already escalated to admin
// and is hunting for more would.
router.post('/diagnostic', auth, requireRole('admin'), async (req, res) => {
  const { cmd } = req.body || {};
  await logTrip(req, 'debugMessage_TRIP', { trap: 'admin/diagnostic', cmd });
  const fakeOutputs = {
    id: 'uid=0(root) gid=0(root) groups=0(root)',
    whoami: 'root',
    uname: 'Linux darklab-erp 5.15.0 #1 SMP x86_64 GNU/Linux',
    ls: 'config  secrets  backups  db.dump',
    pwd: '/app',
    env: 'DATABASE_URL=postgresql://...  JWT_SECRET=...'
  };
  const key = String(cmd || '').trim();
  const output = fakeOutputs[key] || (key ? `${key}: command simulated` : '');
  res.json({ exit: 0, output });
});

// Defender payoff — recent debugMessage trips, newest first.
router.get('/debugMessage', auth, requireRole('admin'), async (_req, res) => {
  const r = await db.query(
    `SELECT id, user_id, action, endpoint, payload, ip_address, created_at
       FROM audit_logs
      WHERE action = 'debugMessage_TRIP'
      ORDER BY created_at DESC
      LIMIT 100`
  );
  res.json(r.rows);
});

module.exports = router;
