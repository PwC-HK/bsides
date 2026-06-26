CREATE EXTENSION IF NOT EXISTS pgcrypto;

DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS purchase_orders CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
  id            SERIAL PRIMARY KEY,
  username      VARCHAR(100) UNIQUE NOT NULL,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role          VARCHAR(50)  NOT NULL DEFAULT 'employee',
  created_at    TIMESTAMP DEFAULT NOW()
);

CREATE TABLE employees (
  id          SERIAL PRIMARY KEY,
  full_name   VARCHAR(200) NOT NULL,
  department  VARCHAR(100) NOT NULL,
  position    VARCHAR(100) NOT NULL,
  salary      NUMERIC(10,2) NOT NULL,
  user_id     INT REFERENCES users(id) ON DELETE SET NULL,
  created_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE purchase_orders (
  id          SERIAL PRIMARY KEY,
  po_number   VARCHAR(50) UNIQUE NOT NULL,
  vendor      VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  amount      NUMERIC(12,2) NOT NULL,
  status      VARCHAR(50) DEFAULT 'pending',
  created_by  INT REFERENCES users(id) ON DELETE SET NULL,
  created_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE audit_logs (
  id          SERIAL PRIMARY KEY,
  user_id     INT,
  action      VARCHAR(100) NOT NULL,
  endpoint    VARCHAR(255) NOT NULL,
  payload     JSONB,
  ip_address  VARCHAR(50),
  created_at  TIMESTAMP DEFAULT NOW()
);
