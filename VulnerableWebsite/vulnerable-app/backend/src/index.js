require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const morgan  = require('morgan');
const fs      = require('fs');
const path    = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.set('trust proxy', true); // behind nginx — so req.ip is the real client for debugMessage logging

const logDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

const logStream = fs.createWriteStream(
  path.join(logDir, 'access.log'), { flags: 'a' }
);
morgan.token('body', (req) => JSON.stringify(req.body || {}));
app.use(morgan(
  '{"time":":date[iso]","method":":method","url":":url","status"::status,"ip":":remote-addr","body"::body}',
  { stream: logStream }
));
app.use(morgan('dev'));

app.use('/api/v1/auth',            require('./routes/auth'));
app.use('/api/v1/employees',       require('./routes/employees'));
app.use('/api/v1/purchase-orders', require('./routes/purchaseOrders'));
app.use('/api/v1/admin',           require('./routes/admin'));
app.use('/api/v1/departments',     require('./routes/departments'));
app.use('/api/v1/suppliers',       require('./routes/suppliers'));
app.use('/api/v1/customers',       require('./routes/customers'));
app.use('/api/v1/products',        require('./routes/products'));
app.use('/api/v1/invoices',        require('./routes/invoices'));
app.use('/api/v1/leave',           require('./routes/leave'));
app.use('/api/v1/dashboard',       require('./routes/dashboard'));
app.use('/api/v1/internal',       require('./routes/internal'));
app.get('/api/v1/health', (_req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`darklab ERP listening on ${PORT}`));
