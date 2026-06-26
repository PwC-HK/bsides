-- =============================================================================
-- darklab ERP - schema EXTENSIONS (additive, idempotent, non-destructive)
-- -----------------------------------------------------------------------------
-- This file adds 6 NEW tables on top of the existing schema (users, employees,
-- purchase_orders, audit_logs). It never DROPs or ALTERs an existing table.
-- Safe to run on a live DB AND on fresh docker volumes (mounted as
-- 03_extensions.sql so it runs after 01_schema.sql and 02_seed.sql).
--
-- Idempotency rules used throughout:
--   * CREATE TABLE IF NOT EXISTS
--   * INSERT ... ON CONFLICT (unique_col) DO NOTHING
--   * wrapped in a single BEGIN/COMMIT transaction
-- =============================================================================

BEGIN;

-- =============================================================================
-- 1. SUPPLIERS   (no FK deps -> created first)
-- =============================================================================
CREATE TABLE IF NOT EXISTS suppliers (
  id           SERIAL PRIMARY KEY,
  name         VARCHAR(200) NOT NULL,
  contact_email VARCHAR(255),
  phone        VARCHAR(50),
  country      VARCHAR(100),
  created_at   TIMESTAMP DEFAULT NOW()
);

-- suppliers has no natural UNIQUE column in the spec, so guard with seed-once
-- semantics: only seed when the table is empty (idempotent across re-runs).
INSERT INTO suppliers (name, contact_email, phone, country)
SELECT * FROM (VALUES
  ('Acme Components',          'procurement@acme-components.com',   '+1-415-555-0101', 'United States'),
  ('Vertex Logistics',         'sales@vertex-logistics.com',        '+44-20-7946-1122','United Kingdom'),
  ('PrimeStar Manufacturing',  'orders@primestar-mfg.com',          '+49-30-901820-33','Germany'),
  ('Nimbus Technologies',      'contact@nimbus-tech.io',            '+1-650-555-0190', 'United States'),
  ('Orient Trade Co.',         'info@orient-trade.cn',              '+86-21-6888-4500','China'),
  ('Helios Raw Materials',     'supply@helios-raw.gr',              '+30-21-0998-7700','Greece'),
  ('Nordic Office Systems',    'b2b@nordic-office.se',              '+46-8-555-01200', 'Sweden'),
  ('Sahara Imports Ltd',       'trade@sahara-imports.ae',           '+971-4-555-7788', 'United Arab Emirates')
) AS v(name, contact_email, phone, country)
WHERE NOT EXISTS (SELECT 1 FROM suppliers);

-- =============================================================================
-- 2. DEPARTMENTS   (manager_id -> users; users already seeded ids 1..18)
-- =============================================================================
CREATE TABLE IF NOT EXISTS departments (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  manager_id  INT REFERENCES users(id) ON DELETE SET NULL,
  budget      NUMERIC(14,2) DEFAULT 0,
  created_at  TIMESTAMP DEFAULT NOW()
);

INSERT INTO departments (name, description, manager_id, budget) VALUES
  ('Finance',     'Financial planning, accounting, payroll and treasury operations.',  17, 1500000.00),
  ('HR',          'Human resources, recruitment, talent development and employee relations.', 6, 800000.00),
  ('IT',          'Information technology, infrastructure, security and software engineering.', 8, 2000000.00),
  ('Operations',  'Day-to-day operations, facilities and supply chain coordination.',   9, 1200000.00),
  ('Procurement', 'Vendor management, sourcing and purchase order processing.',        10, 500000.00)
ON CONFLICT (name) DO NOTHING;

-- =============================================================================
-- 3. CUSTOMERS   (no FK deps)
-- =============================================================================
CREATE TABLE IF NOT EXISTS customers (
  id           SERIAL PRIMARY KEY,
  name         VARCHAR(200) NOT NULL,
  company      VARCHAR(200),
  email        VARCHAR(255),
  phone        VARCHAR(50),
  status       VARCHAR(20) DEFAULT 'active',
  credit_limit NUMERIC(12,2) DEFAULT 0,
  created_at   TIMESTAMP DEFAULT NOW()
);

-- customers has no natural UNIQUE column in the spec; guard with seed-once semantics.
INSERT INTO customers (name, company, email, phone, status, credit_limit)
SELECT * FROM (VALUES
  ('Daniel Foster',   'Brightpath Retail',       'd.foster@brightpath.com'::VARCHAR, '+1-212-555-0143'::VARCHAR, 'active'::VARCHAR,   120000.00::NUMERIC),
  ('Sarah Whitman',   'Northwind Traders',       's.whitman@northwind.com',         '+1-415-555-0188',          'active',            250000.00),
  ('Marcus Lee',      'Helix Biotech',           'm.lee@helixbio.com',              '+1-617-555-0199',          'active',            180000.00),
  ('Elena Petrova',   'Vanta Solutions',         'e.petrova@vantasol.com',          '+1-312-555-0110',          'active',             95000.00),
  ('Tom Reynolds',    'Coastline Foods',         't.reynolds@coastlinefoods.com',   '+1-503-555-0144',          'active',            150000.00),
  ('Priya Nair',      'Indus Pharma',            'p.nair@induspharma.in',           '+91-22-5555-1200',         'active',            200000.00),
  ('James OConnor',   'Timberline Construction', 'j.oconnor@timberline.com',        '+1-206-555-0177',          'active',            175000.00),
  ('Yuki Tanaka',     'Sakura Electronics',      'y.tanaka@sakura-el.jp',           '+81-3-5555-8800',          'active',            220000.00),
  ('Hans Weber',      'Rheinland Auto Parts',    'h.weber@rheinland-ap.de',         '+49-711-555-0150',         'active',            140000.00),
  ('Fatima Zahra',    'Atlas Trading House',     'f.zahra@atlas-trade.ma',          '+212-5-5555-7700',         'active',            110000.00),
  ('Lucas Moreau',    'Lumiere Media',           'l.moreau@lumiere-media.fr',       '+33-1-5555-0100',          'active',             88000.00),
  ('Grace Mwangi',    'Savanna Logistics',       'g.mwangi@savanna-log.ke',         '+254-20-555-0190',         'active',            130000.00),
  ('Robert Chen',     'Pacifica Holdings',       'r.chen@pacificahold.com',         '+1-415-555-0155',          'inactive',          160000.00),
  ('Sofia Rossi',     'Milano Fashion Group',    's.rossi@milano-fg.it',            '+39-02-5555-3300',         'active',            195000.00),
  ('David Kim',       'Han River Tech',          'd.kim@hanrivertech.kr',           '+82-2-5555-9900',          'active',            210000.00),
  ('Amelia Brooks',   'Brooks & Co. Consulting', 'a.brooks@brooksco.com',           '+1-646-555-0133',          'prospect',           45000.00),
  ('Ivan Sokolov',    'Ural Metals',             'i.sokolov@ural-metals.ru',        '+7-495-555-0188',          'active',            165000.00),
  ('Maria Santos',    'Rio Beverage Co.',        'm.santos@riobev.com.br',          '+55-11-5555-2244',         'active',            125000.00),
  ('Omar Haddad',     'Levant Shipping',         'o.haddad@levant-shipping.com',    '+961-1-555-0177',          'inactive',           70000.00),
  ('Nina Karlsson',   'Fjord Energy',            'n.karlsson@fjord-energy.no',      '+47-22-555-0150',          'active',            185000.00),
  ('Vikram Reddy',    'Deccan Software',         'v.reddy@deccansoft.in',           '+91-80-5555-4400',         'prospect',           60000.00),
  ('Claire Dubois',   'Quebec Agritech',         'c.dubois@quebecagri.ca',          '+1-514-555-0166',          'active',            100000.00),
  ('Hassan Ali',      'Gulf Petroleum Services', 'h.ali@gulfpetro.ae',              '+971-2-555-0190',          'active',            235000.00),
  ('Liam Murphy',     'Emerald Foods',           'l.murphy@emeraldfoods.ie',        '+353-1-555-0120',          'prospect',           30000.00)
) AS v(name, company, email, phone, status, credit_limit)
WHERE NOT EXISTS (SELECT 1 FROM customers);

-- =============================================================================
-- 4. PRODUCTS   (supplier_id -> suppliers)
-- =============================================================================
CREATE TABLE IF NOT EXISTS products (
  id           SERIAL PRIMARY KEY,
  sku          VARCHAR(50) UNIQUE NOT NULL,
  name         VARCHAR(200) NOT NULL,
  category     VARCHAR(100),
  price        NUMERIC(10,2) NOT NULL,
  cost         NUMERIC(10,2) NOT NULL,
  stock_qty    INT NOT NULL DEFAULT 0,
  reorder_level INT NOT NULL DEFAULT 10,
  supplier_id  INT REFERENCES suppliers(id) ON DELETE SET NULL,
  created_at   TIMESTAMP DEFAULT NOW()
);

INSERT INTO products (sku, name, category, price, cost, stock_qty, reorder_level, supplier_id) VALUES
  -- Electronics (supplier 4 = Nimbus Technologies, 5 = Orient Trade Co., 8 = Sahara Imports)
  ('ELEC-001', '15-inch Business Laptop',          'Electronics',   1250.00,  890.00,  42, 15, 4),
  ('ELEC-002', '27-inch 4K Monitor',               'Electronics',    380.00,  245.00,  28, 12, 4),
  ('ELEC-003', 'USB-C Docking Station',            'Electronics',    145.00,   82.00,   8, 15, 4),
  ('ELEC-004', 'Mechanical Keyboard',              'Electronics',     95.00,   48.00,  60, 20, 5),
  ('ELEC-005', 'Wireless Mouse',                   'Electronics',     38.00,   16.00, 120, 30, 5),
  ('ELEC-006', 'Noise-Cancelling Headset',         'Electronics',    210.00,  128.00,  19, 10, 5),
  ('ELEC-007', 'Network Switch 24-port',           'Electronics',    430.00,  290.00,  14,  8, 4),
  ('ELEC-008', 'Enterprise Router',                'Electronics',    680.00,  450.00,   0,  6, 4),
  ('ELEC-009', 'UPS Battery Backup 1500VA',        'Electronics',    220.00,  140.00,   5, 10, 8),
  ('ELEC-010', 'Webcam 1080p',                     'Electronics',     65.00,   30.00,  85, 25, 5),
  ('ELEC-011', 'Portable SSD 1TB',                 'Electronics',    130.00,   78.00,  47, 15, 5),
  ('ELEC-012', 'Rack Server 2U',                   'Electronics',   3400.00, 2400.00,   3,  4, 4),
  -- Office (supplier 7 = Nordic Office Systems, 1 = Acme Components)
  ('OFFI-001', 'A4 Printer Paper (5000 sheets)',   'Office',          28.00,   12.00, 240, 50, 7),
  ('OFFI-002', 'Ballpoint Pens (box of 50)',       'Office',          18.00,    7.00, 180, 40, 7),
  ('OFFI-003', 'Stapler Heavy Duty',               'Office',          34.00,   15.00,  55, 20, 7),
  ('OFFI-004', 'Whiteboard Markers (set of 12)',   'Office',          22.00,    9.00,  90, 30, 7),
  ('OFFI-005', 'Filing Cabinet 4-drawer',          'Office',         185.00,  110.00,  17,  8, 1),
  ('OFFI-006', 'Desk Organizer Tray',              'Office',          26.00,   11.00, 130, 30, 7),
  ('OFFI-007', 'Shredder Cross-cut',               'Office',         145.00,   88.00,  12,  6, 1),
  ('OFFI-008', 'Printer Toner Cartridge',          'Office',          95.00,   52.00,   4, 12, 1),
  -- Furniture (supplier 1 = Acme Components, 7 = Nordic Office Systems)
  ('FURN-001', 'Ergonomic Office Chair',           'Furniture',      320.00,  195.00,  34, 10, 1),
  ('FURN-002', 'Electric Standing Desk',           'Furniture',      480.00,  300.00,  21,  8, 1),
  ('FURN-003', 'Bookshelf 5-tier',                 'Furniture',      140.00,   82.00,  46, 12, 7),
  ('FURN-004', 'Conference Table (10-seat)',       'Furniture',      890.00,  560.00,   0,  3, 1),
  ('FURN-005', 'Mobile Pedestal Drawer',           'Furniture',      165.00,   98.00,  28, 10, 7),
  -- Raw Materials (supplier 3 = PrimeStar Manufacturing, 6 = Helios Raw Materials)
  ('RAWM-001', 'Steel Coil (1 ton)',               'Raw Materials',  920.00,  640.00,  15,  5, 3),
  ('RAWM-002', 'Aluminum Extrusion (10m)',         'Raw Materials',  185.00,  120.00,  60, 20, 3),
  ('RAWM-003', 'Copper Wire (100m roll)',          'Raw Materials',  240.00,  155.00,  22, 10, 6),
  ('RAWM-004', 'Industrial Fasteners (bulk box)',  'Raw Materials',   78.00,   35.00, 200, 40, 3),
  ('RAWM-005', 'Stainless Steel Sheet (2m x 1m)',  'Raw Materials',  310.00,  205.00,   7, 12, 3)
ON CONFLICT (sku) DO NOTHING;

-- =============================================================================
-- 5. INVOICES   (customer_id -> customers, created_by -> users)
-- Dates are relative to CURRENT_DATE so they stay recent whenever this runs.
-- =============================================================================
CREATE TABLE IF NOT EXISTS invoices (
  id          SERIAL PRIMARY KEY,
  invoice_no  VARCHAR(50) UNIQUE NOT NULL,
  customer_id INT REFERENCES customers(id) ON DELETE SET NULL,
  issue_date  DATE,
  due_date    DATE,
  amount      NUMERIC(12,2) NOT NULL,
  tax         NUMERIC(12,2) DEFAULT 0,
  total       NUMERIC(12,2),
  status      VARCHAR(20) DEFAULT 'draft',
  created_by  INT REFERENCES users(id) ON DELETE SET NULL,
  created_at  TIMESTAMP DEFAULT NOW()
);

INSERT INTO invoices (invoice_no, customer_id, issue_date, due_date, amount, tax, total, status, created_by) VALUES
  ('INV-2026-0001',  1, CURRENT_DATE - 85, CURRENT_DATE - 55, 18500.00, 3700.00, 22200.00, 'paid',     2),
  ('INV-2026-0002',  2, CURRENT_DATE - 82, CURRENT_DATE - 52, 42000.00, 8400.00, 50400.00, 'paid',     2),
  ('INV-2026-0003',  3, CURRENT_DATE - 78, CURRENT_DATE - 48, 12700.00, 2540.00, 15240.00, 'paid',     2),
  ('INV-2026-0004',  4, CURRENT_DATE - 74, CURRENT_DATE - 44,  8900.00, 1780.00, 10680.00, 'paid',     2),
  ('INV-2026-0005',  5, CURRENT_DATE - 70, CURRENT_DATE - 40, 23600.00, 4720.00, 28320.00, 'paid',     2),
  ('INV-2026-0006',  6, CURRENT_DATE - 66, CURRENT_DATE - 36, 35800.00, 7160.00, 42960.00, 'overdue',  2),
  ('INV-2026-0007',  7, CURRENT_DATE - 64, CURRENT_DATE - 34, 14200.00, 2840.00, 17040.00, 'overdue',  2),
  ('INV-2026-0008',  8, CURRENT_DATE - 61, CURRENT_DATE - 31, 19800.00, 3960.00, 23760.00, 'overdue',  2),
  ('INV-2026-0009',  9, CURRENT_DATE - 58, CURRENT_DATE - 28,  7400.00, 1480.00,  8880.00, 'overdue',  2),
  ('INV-2026-0010', 10, CURRENT_DATE - 55, CURRENT_DATE - 25, 26400.00, 5280.00, 31680.00, 'overdue',  2),
  ('INV-2026-0011', 11, CURRENT_DATE - 50, CURRENT_DATE - 20,  9600.00, 1920.00, 11520.00, 'sent',     2),
  ('INV-2026-0012', 12, CURRENT_DATE - 47, CURRENT_DATE - 17, 31200.00, 6240.00, 37440.00, 'sent',     2),
  ('INV-2026-0013', 13, CURRENT_DATE - 44, CURRENT_DATE - 14, 17800.00, 3560.00, 21360.00, 'sent',     2),
  ('INV-2026-0014', 14, CURRENT_DATE - 41, CURRENT_DATE - 11, 22500.00, 4500.00, 27000.00, 'sent',     2),
  ('INV-2026-0015', 15, CURRENT_DATE - 38, CURRENT_DATE -  8, 13900.00, 2780.00, 16680.00, 'sent',     2),
  ('INV-2026-0016', 16, CURRENT_DATE - 35, CURRENT_DATE -  5,  6700.00, 1340.00,  8040.00, 'sent',     2),
  ('INV-2026-0017', 17, CURRENT_DATE - 32, CURRENT_DATE -  2, 28900.00, 5780.00, 34680.00, 'overdue',  2),
  ('INV-2026-0018', 18, CURRENT_DATE - 29, CURRENT_DATE +  1, 15400.00, 3080.00, 18480.00, 'sent',     2),
  ('INV-2026-0019', 19, CURRENT_DATE - 26, CURRENT_DATE +  4,  4200.00,  840.00,  5040.00, 'sent',     2),
  ('INV-2026-0020', 20, CURRENT_DATE - 23, CURRENT_DATE +  7, 19700.00, 3940.00, 23640.00, 'sent',     2),
  ('INV-2026-0021', 21, CURRENT_DATE - 20, CURRENT_DATE + 10, 34800.00, 6960.00, 41760.00, 'sent',     2),
  ('INV-2026-0022', 22, CURRENT_DATE - 18, CURRENT_DATE + 12,  8800.00, 1760.00, 10560.00, 'sent',     2),
  ('INV-2026-0023', 23, CURRENT_DATE - 15, CURRENT_DATE + 15, 45200.00, 9040.00, 54240.00, 'sent',     2),
  ('INV-2026-0024', 24, CURRENT_DATE - 12, CURRENT_DATE + 18,  5600.00, 1120.00,  6720.00, 'sent',     2),
  ('INV-2026-0025',  1, CURRENT_DATE - 10, CURRENT_DATE + 20, 16900.00, 3380.00, 20280.00, 'sent',     2),
  ('INV-2026-0026',  2, CURRENT_DATE -  8, CURRENT_DATE + 22, 24100.00, 4820.00, 28920.00, 'sent',     2),
  ('INV-2026-0027',  3, CURRENT_DATE -  6, CURRENT_DATE + 24,  9300.00, 1860.00, 11160.00, 'sent',     2),
  ('INV-2026-0028',  4, CURRENT_DATE -  4, CURRENT_DATE + 26, 12750.00, 2550.00, 15300.00, 'draft',    1),
  ('INV-2026-0029',  5, CURRENT_DATE -  3, CURRENT_DATE + 27, 31600.00, 6320.00, 37920.00, 'draft',    1),
  ('INV-2026-0030',  6, CURRENT_DATE -  2, CURRENT_DATE + 28, 18400.00, 3680.00, 22080.00, 'draft',    1),
  ('INV-2026-0031',  7, CURRENT_DATE -  1, CURRENT_DATE + 29,  7200.00, 1440.00,  8640.00, 'draft',    1),
  ('INV-2026-0032',  8, CURRENT_DATE,      CURRENT_DATE + 30, 26300.00, 5260.00, 31560.00, 'draft',    1),
  ('INV-2026-0033',  9, CURRENT_DATE +  1, CURRENT_DATE + 31, 11900.00, 2380.00, 14280.00, 'draft',    1),
  ('INV-2026-0034', 10, CURRENT_DATE +  2, CURRENT_DATE + 32, 40800.00, 8160.00, 48960.00, 'draft',    1),
  ('INV-2026-0035', 11, CURRENT_DATE +  3, CURRENT_DATE + 33,  6400.00, 1280.00,  7680.00, 'draft',    1),
  ('INV-2026-0036', 12, CURRENT_DATE +  4, CURRENT_DATE + 34, 29700.00, 5940.00, 35640.00, 'draft',    1)
ON CONFLICT (invoice_no) DO NOTHING;

-- =============================================================================
-- 6. LEAVE REQUESTS   (user_id -> users, decided_by -> users)
-- References existing employee-role users (ids 3..18). decided_by = 2 (jsmith).
-- =============================================================================
CREATE TABLE IF NOT EXISTS leave_requests (
  id         SERIAL PRIMARY KEY,
  user_id    INT REFERENCES users(id) ON DELETE CASCADE,
  leave_type VARCHAR(50) NOT NULL,
  start_date DATE NOT NULL,
  end_date   DATE NOT NULL,
  reason     TEXT,
  status     VARCHAR(20) DEFAULT 'pending',
  decided_by INT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- leave_requests has no natural UNIQUE column in the spec; guard with seed-once semantics.
INSERT INTO leave_requests (user_id, leave_type, start_date, end_date, reason, status, decided_by)
SELECT * FROM (VALUES
  ( 3, 'annual'::VARCHAR,   (CURRENT_DATE - 40)::DATE, (CURRENT_DATE - 38)::DATE, 'Family vacation abroad.'::TEXT,     'approved'::VARCHAR, 2),
  ( 4, 'sick',              (CURRENT_DATE - 15),       (CURRENT_DATE - 14),       'Flu, advised rest by doctor.',      'approved',          2),
  ( 5, 'personal',          (CURRENT_DATE -  5),       (CURRENT_DATE -  5),       'Personal administrative errands.',  'rejected',          2),
  ( 6, 'annual',            (CURRENT_DATE +  7),       (CURRENT_DATE + 11),       'Pre-booked holiday leave.',          'approved',          2),
  ( 7, 'sick',              (CURRENT_DATE -  2),       (CURRENT_DATE -  1),       'Migraine, unable to work.',          'approved',          2),
  ( 8, 'unpaid',            (CURRENT_DATE + 20),       (CURRENT_DATE + 27),       'Extended personal travel.',          'pending',           NULL::INT),
  ( 9, 'annual',            (CURRENT_DATE + 14),       (CURRENT_DATE + 16),       'Long weekend plans.',                'pending',           NULL::INT),
  (10, 'sick',              (CURRENT_DATE - 30),       (CURRENT_DATE - 28),       'Recovering from minor surgery.',     'approved',          2),
  (11, 'personal',          (CURRENT_DATE +  3),       (CURRENT_DATE +  3),       'Moving to a new apartment.',         'pending',           NULL::INT),
  (12, 'annual',            (CURRENT_DATE - 60),       (CURRENT_DATE - 55),       'Annual leave carryover.',            'approved',          2),
  (13, 'sick',              (CURRENT_DATE +  1),       (CURRENT_DATE +  2),       'Scheduled medical checkup.',         'pending',           NULL::INT),
  (14, 'annual',            (CURRENT_DATE + 30),       (CURRENT_DATE + 38),       'Planned family trip.',               'rejected',          2)
) AS v(user_id, leave_type, start_date, end_date, reason, status, decided_by)
WHERE NOT EXISTS (SELECT 1 FROM leave_requests);

COMMIT;
