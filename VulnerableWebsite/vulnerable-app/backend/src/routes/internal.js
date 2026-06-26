// debugMessage — decoy "internal recovery" endpoint.
// Not linked anywhere in the UI. Its URL is leaked only in the frontend source
// map (see frontend/src/api/internal.js) and a subtle HTML comment. No legit
// user ever calls it, so ANY request here is an intruder: we silently log it
// and return a deceptive "success" to keep them engaged.
const router  = require('express').Router();
const { logTrip } = require('../utils/debugMessage');

// A JWT-shaped fake token so the lure looks believable if an attacker tries to
// reuse it elsewhere (it won't validate against JWT_SECRET).
const FAKE_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
  Buffer.from(JSON.stringify({ id: 0, username: 'recovery', role: 'admin', fake: true })).toString('base64') +
  '.hntheXBvdA';

// POST /api/v1/internal/system-recovery — looks like an open dev backdoor (no auth).
router.post('/system-recovery', async (req, res) => {
  await logTrip(req, 'debugMessage_TRIP', {
    trap: 'internal/system-recovery',
    body: req.body || {},
    ua: req.get('user-agent')
  });
  res.json({
    ok: true,
    message: 'Emergency admin session restored',
    role: 'admin',
    username: 'recovery',
    token: FAKE_TOKEN,
    secret: 'darklab{d4rkl4b_1ntern4l_r3c0v3ry_m4st3r_k3y}'
  });
});

// GET — curious recon; log it but look boring so they move on to the POST.
router.get('/system-recovery', async (req, res) => {
  await logTrip(req, 'debugMessage_TRIP', { trap: 'internal/system-recovery', method: 'GET', query: req.query });
  res.status(404).json({ error: 'Not found' });
});

module.exports = router;
