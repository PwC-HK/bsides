-- darklab ERP seed data
-- Users: 17 total (2 privileged + 15 employees)
-- Employees: 15 (one per employee-role user)
-- Purchase orders: 50

BEGIN;

-- =========================================================================
-- USERS  (ids 1-17)
--   1  erp_admin  (admin)
--   2  jsmith     (manager)
--   3-17 employee-role users
-- =========================================================================
INSERT INTO users (username, email, password_hash, role) VALUES
  ('erp_admin', 'admin@darklab.local',  crypt('Admin@1234',   gen_salt('bf')), 'admin'),
  ('jsmith',    'j.smith@darklab.local', crypt('Manager@1234', gen_salt('bf')), 'manager'),
  -- employee-role users (15)
  ('mwilson',    'm.wilson@darklab.local',    crypt('Password123', gen_salt('bf')), 'employee'),
  ('lchen',      'l.chen@darklab.local',      crypt('Password123', gen_salt('bf')), 'employee'),
  ('dpatel',     'd.patel@darklab.local',     crypt('Password123', gen_salt('bf')), 'employee'),
  ('arodriguez', 'a.rodriguez@darklab.local', crypt('Password123', gen_salt('bf')), 'employee'),
  ('kjohansson', 'k.johansson@darklab.local', crypt('Password123', gen_salt('bf')), 'employee'),
  ('tnguyen',    't.nguyen@darklab.local',    crypt('Password123', gen_salt('bf')), 'employee'),
  ('rkowalski',  'r.kowalski@darklab.local',  crypt('Password123', gen_salt('bf')), 'employee'),
  ('sokafor',    's.okafor@darklab.local',    crypt('Password123', gen_salt('bf')), 'employee'),
  ('bmüller',    'b.muller@darklab.local',    crypt('Password123', gen_salt('bf')), 'employee'),
  ('hgarcia',    'h.garcia@darklab.local',    crypt('Password123', gen_salt('bf')), 'employee'),
  ('pkim',       'p.kim@darklab.local',       crypt('Password123', gen_salt('bf')), 'employee'),
  ('emanderson', 'e.anderson@darklab.local',  crypt('Password123', gen_salt('bf')), 'employee'),
  ('jsilva',     'j.silva@darklab.local',     crypt('Password123', gen_salt('bf')), 'employee'),
  ('nahmed',     'n.ahmed@darklab.local',     crypt('Password123', gen_salt('bf')), 'employee'),
  ('cthompson',  'c.thompson@darklab.local',  crypt('Password123', gen_salt('bf')), 'employee'),
  ('ovolkova',   'o.volkova@darklab.local',   crypt('Password123', gen_salt('bf')), 'employee');

-- =========================================================================
-- EMPLOYEES  (15 records, one per employee-role user, ids 3-17)
-- Departments: Finance, HR, IT, Operations, Procurement
-- Positions:   Analyst, Coordinator, Engineer, Manager, Director
-- =========================================================================
INSERT INTO employees (full_name, department, position, salary, user_id) VALUES
  ('Matthew Wilson',     'Finance',     'Analyst',     62500.00,  3),
  ('Linda Chen',         'IT',          'Engineer',    98000.00,  4),
  ('Dev Patel',          'Procurement', 'Coordinator', 54000.00,  5),
  ('Ana Rodriguez',      'HR',          'Manager',     89500.00,  6),
  ('Karin Johansson',    'Finance',     'Analyst',     67000.00,  7),
  ('Thanh Nguyen',       'IT',          'Engineer',    102000.00, 8),
  ('Rafal Kowalski',     'Operations',  'Coordinator', 49000.00,  9),
  ('Samuel Okafor',      'Procurement', 'Manager',     87000.00,  10),
  ('Bernd Muller',       'IT',          'Analyst',     64000.00,  11),
  ('Hugo Garcia',        'Finance',     'Director',    128000.00, 12),
  ('Park Kim',           'IT',          'Engineer',    95000.00,  13),
  ('Emily Anderson',     'HR',          'Coordinator', 51500.00,  14),
  ('Julia Silva',        'Operations',  'Analyst',     58500.00,  15),
  ('Nadia Ahmed',        'Procurement', 'Coordinator', 53000.00,  16),
  ('Olivia Volkova',     'Finance',     'Manager',     91000.00,  17);

-- =========================================================================
-- PURCHASE ORDERS  (50 rows)
-- created_by references valid user ids 1-17
-- =========================================================================
INSERT INTO purchase_orders (po_number, vendor, description, amount, status, created_by) VALUES
  ('PO-2026-0001', 'Acme Office Supplies',      'Office equipment - ergonomic chairs and standing desks',       4200.00,  'approved', 5),
  ('PO-2026-0002', 'TechPro Solutions',         'Software licences - 25 seats CRM enterprise edition',          18600.00, 'approved', 4),
  ('PO-2026-0003', 'Global Logistics Ltd',     'Logistics services - quarterly freight contract',               32500.00, 'approved', 9),
  ('PO-2026-0004', 'PrimeStar Manufacturing',   'Raw materials - industrial steel coils',                        47200.00, 'pending',  10),
  ('PO-2026-0005', 'CoreSystems Inc',           'IT hardware - rack servers and UPS units',                      38900.00, 'approved', 8),
  ('PO-2026-0006', 'Vertex Consulting',         'Professional services - ERP migration consulting',              27500.00, 'approved', 12),
  ('PO-2026-0007', 'Acme Office Supplies',      'Office equipment - filing cabinets and bookshelves',            1850.00,  'approved', 5),
  ('PO-2026-0008', 'TechPro Solutions',         'Software licences - design suite annual renewal',               9400.00,  'pending',  13),
  ('PO-2026-0009', 'Global Logistics Ltd',     'Logistics services - last mile delivery for Q3',                15600.00, 'pending',  9),
  ('PO-2026-0010', 'PrimeStar Manufacturing',   'Raw materials - aluminum extrusion profiles',                   22800.00, 'approved', 10),
  ('PO-2026-0011', 'CoreSystems Inc',           'IT hardware - networking switches and access points',           19450.00, 'rejected', 4),
  ('PO-2026-0012', 'Vertex Consulting',         'Professional services - cybersecurity audit engagement',        34000.00, 'approved', 12),
  ('PO-2026-0013', 'Acme Office Supplies',      'Office equipment - printer consumables and paper',              920.00,   'approved', 14),
  ('PO-2026-0014', 'TechPro Solutions',         'Software licences - antivirus endpoint protection',             6700.00,  'approved', 4),
  ('PO-2026-0015', 'Global Logistics Ltd',     'Logistics services - international shipping to EMEA',            21400.00, 'pending',  15),
  ('PO-2026-0016', 'PrimeStar Manufacturing',   'Raw materials - copper wiring harnesses',                       16800.00, 'approved', 10),
  ('PO-2026-0017', 'CoreSystems Inc',           'IT hardware - laptops for new hires',                           28600.00, 'approved', 8),
  ('PO-2026-0018', 'Vertex Consulting',         'Professional services - change management workshop',            8900.00,  'pending',  6),
  ('PO-2026-0019', 'Acme Office Supplies',      'Office equipment - conference room AV setup',                   7300.00,  'approved', 5),
  ('PO-2026-0020', 'TechPro Solutions',         'Software licences - project management platform seats',         5400.00,  'approved', 7),
  ('PO-2026-0021', 'Global Logistics Ltd',     'Logistics services - cold chain transport',                     26300.00, 'rejected', 15),
  ('PO-2026-0022', 'PrimeStar Manufacturing',   'Raw materials - precision machined components',                 41000.00, 'approved', 10),
  ('PO-2026-0023', 'CoreSystems Inc',           'IT hardware - backup tape library',                             15400.00, 'pending',  13),
  ('PO-2026-0024', 'Vertex Consulting',         'Professional services - data governance advisory',              18700.00, 'approved', 12),
  ('PO-2026-0025', 'Acme Office Supplies',      'Office equipment - whiteboards and workstation accessories',     680.00,  'approved', 14),
  ('PO-2026-0026', 'TechPro Solutions',         'Software licences - database server licenses',                  21200.00, 'approved', 4),
  ('PO-2026-0027', 'Global Logistics Ltd',     'Logistics services - warehousing and fulfilment Q4',             29800.00, 'pending',  9),
  ('PO-2026-0028', 'PrimeStar Manufacturing',   'Raw materials - injection molded plastics',                     13900.00, 'approved', 10),
  ('PO-2026-0029', 'CoreSystems Inc',           'IT hardware - enterprise storage array expansion',              44800.00, 'approved', 8),
  ('PO-2026-0030', 'Vertex Consulting',         'Professional services - leadership coaching program',            7200.00,  'pending',  6),
  ('PO-2026-0031', 'Acme Office Supplies',      'Office equipment - reception furniture',                        3400.00,  'approved', 5),
  ('PO-2026-0032', 'TechPro Solutions',         'Software licences - communication platform annual',             12800.00, 'rejected', 7),
  ('PO-2026-0033', 'Global Logistics Ltd',     'Logistics services - expedited freight for product launch',      9600.00,  'approved', 15),
  ('PO-2026-0034', 'PrimeStar Manufacturing',   'Raw materials - industrial fasteners and fittings',             4350.00,  'approved', 10),
  ('PO-2026-0035', 'CoreSystems Inc',           'IT hardware - monitors and docking stations',                   11700.00, 'pending',  13),
  ('PO-2026-0036', 'Vertex Consulting',         'Professional services - regulatory compliance review',          22500.00, 'approved', 12),
  ('PO-2026-0037', 'Acme Office Supplies',      'Office equipment - kitchen and breakroom supplies',             510.00,   'approved', 14),
  ('PO-2026-0038', 'TechPro Solutions',         'Software licences - identity management add-on',                8800.00,  'approved', 4),
  ('PO-2026-0039', 'Global Logistics Ltd',     'Logistics services - reverse logistics and returns',             17200.00, 'pending',  9),
  ('PO-2026-0040', 'PrimeStar Manufacturing',   'Raw materials - stainless steel sheet stock',                   25600.00, 'approved', 10),
  ('PO-2026-0041', 'CoreSystems Inc',           'IT hardware - firewall appliances',                             20300.00, 'approved', 8),
  ('PO-2026-0042', 'Vertex Consulting',         'Professional services - business process mapping',              6400.00,  'rejected', 6),
  ('PO-2026-0043', 'Acme Office Supplies',      'Office equipment - desk lamps and ergonomic accessories',       1240.00,  'pending',  5),
  ('PO-2026-0044', 'TechPro Solutions',         'Software licences - analytics and reporting module',            14600.00, 'approved', 7),
  ('PO-2026-0045', 'Global Logistics Ltd',     'Logistics services - cross-docking operations',                  13100.00, 'approved', 15),
  ('PO-2026-0046', 'PrimeStar Manufacturing',   'Raw materials - rubber gaskets and seals',                      2950.00,  'approved', 10),
  ('PO-2026-0047', 'CoreSystems Inc',           'IT hardware - peripheral refresh batch',                        4100.00,  'pending',  13),
  ('PO-2026-0048', 'Vertex Consulting',         'Professional services - market entry strategy study',           31200.00, 'approved', 12),
  ('PO-2026-0049', 'Acme Office Supplies',      'Office equipment - signage and wayfinding',                     760.00,   'rejected', 14),
  ('PO-2026-0050', 'TechPro Solutions',         'Software licences - development tooling suite',                 16900.00, 'approved', 4);

COMMIT;
