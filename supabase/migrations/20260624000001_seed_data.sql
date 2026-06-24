-- Seed Data for PIERRE GUSZO TAILORING ERP

-- =========================================================================
-- 1. BRANCHES & ROLES & PERMISSIONS
-- =========================================================================

-- Branch
INSERT INTO branches (id, name, address, phone, tax_id)
VALUES (
  'b1000000-0000-0000-0000-000000000000',
  'Pierre Guszo Hatyai (สำนักงานใหญ่)',
  '123/45 ถนนธรรมนูญวิถี ตำบลหาดใหญ่ อำเภอหาดใหญ่ จังหวัดสงขลา 90110',
  '074-234567',
  '0994000123456'
);

-- Roles
INSERT INTO roles (id, name, description) VALUES
('r1000000-0000-0000-0000-000000000000', 'Owner', 'เจ้าของร้าน - สิทธิ์สูงสุดในการควบคุมทุกโมดูลและการตั้งค่าระบบ'),
('r2000000-0000-0000-0000-000000000000', 'Manager', 'ผู้จัดการสาขา - จัดการดูแลออเดอร์ ลูกค้า ช่างผลิต และภาพรวมสาขา'),
('r3000000-0000-0000-0000-000000000000', 'Sales', 'พนักงานหน้าร้าน / ฝ่ายขาย - รับลูกค้า ค้นข้อมูล รับออเดอร์ ทำนัดหมายและรับมัดจำ'),
('r4000000-0000-0000-0000-000000000000', 'Tailor', 'ช่างตัดเย็บ / ฝ่ายผลิต - ดูใบงาน ช่างตัด ช่างเย็บ อัปเดตสถานะการตัดเย็บและบันทึกแก้จุดลองชุด'),
('r5000000-0000-0000-0000-000000000000', 'Measurement', 'พนักงานวัดตัว - ค้นหาลูกค้า บันทึกขนาดรูปร่าง สัดส่วน และนัดหมายลองชุด'),
('r6000000-0000-0000-0000-000000000000', 'Accounting', 'ฝ่ายบัญชีและการเงิน - ออกใบเสนอราคา ใบเสร็จ ใบแจ้งหนี้ คุมลูกหนี้และค่าใช้จ่าย');

-- Permissions
INSERT INTO permissions (name, description) VALUES
('dashboard:view_financial', 'ดูข้อมูลยอดขาย กำไร และสถิติการเงินของร้าน'),
('customers:create', 'เพิ่มข้อมูลลูกค้าใหม่'),
('customers:read', 'เรียกดูข้อมูลประวัติลูกค้า'),
('customers:update', 'แก้ไขข้อมูลลูกค้า'),
('customers:delete', 'ลบข้อมูลลูกค้า (Soft Delete)'),
('orders:create', 'รับออเดอร์หน้าร้าน'),
('orders:read', 'เรียกดูใบสั่งซื้อและออเดอร์'),
('orders:update', 'แก้ไขออเดอร์'),
('orders:approve_discount', 'อนุมัติส่วนลดพิเศษเกินขีดจำกัดปกติ'),
('measurements:write', 'บันทึกและแก้ไขข้อมูลการวัดตัว'),
('production:update_status', 'อัปเดตขั้นตอนผลิตงานช่าง (Kanban)'),
('inventory:manage', 'จัดการสต็อกผ้า คลังสินค้า และเบิกใช้ผ้า'),
('finance:write_documents', 'ออกใบแจ้งหนี้ ใบเสนอราคา และใบเสร็จรับเงิน'),
('finance:void', 'ยกเลิกหรือลบรายการทางการเงิน'),
('system:backup', 'สำรองและกู้คืนฐานข้อมูลไปยัง Google Sheets');

-- Mapping Role Permissions (Owner gets all, others get subsets)
-- Assign all permissions to Owner
INSERT INTO role_permissions (role_id, permission_id)
SELECT 'r1000000-0000-0000-0000-000000000000', id FROM permissions;

-- Assign to Manager
INSERT INTO role_permissions (role_id, permission_id)
SELECT 'r2000000-0000-0000-0000-000000000000', id FROM permissions 
WHERE name NOT IN ('finance:void', 'system:backup');

-- Assign to Sales
INSERT INTO role_permissions (role_id, permission_id)
SELECT 'r3000000-0000-0000-0000-000000000000', id FROM permissions 
WHERE name IN ('customers:create', 'customers:read', 'customers:update', 'orders:create', 'orders:read', 'measurements:write');

-- Assign to Tailor
INSERT INTO role_permissions (role_id, permission_id)
SELECT 'r4000000-0000-0000-0000-000000000000', id FROM permissions 
WHERE name IN ('orders:read', 'production:update_status');

-- Assign to Measurement
INSERT INTO role_permissions (role_id, permission_id)
SELECT 'r5000000-0000-0000-0000-000000000000', id FROM permissions 
WHERE name IN ('customers:read', 'measurements:write');

-- Assign to Accounting
INSERT INTO role_permissions (role_id, permission_id)
SELECT 'r6000000-0000-0000-0000-000000000000', id FROM permissions 
WHERE name IN ('dashboard:view_financial', 'orders:read', 'finance:write_documents');

-- =========================================================================
-- 2. STAFF PROFILES
-- =========================================================================

-- Owner (Nick: พี่ใหญ่ / Big)
INSERT INTO profiles (id, branch_id, first_name, last_name, nickname, phone, is_active)
VALUES ('u1000000-0000-0000-0000-000000000000', 'b1000000-0000-0000-0000-000000000000', 'วุฒิชัย', 'เลิศพัฒนา', 'พี่ใหญ่', '081-1234567', TRUE);
INSERT INTO user_roles (user_id, role_id) VALUES ('u1000000-0000-0000-0000-000000000000', 'r1000000-0000-0000-0000-000000000000');

-- Manager (Nick: เก่ง)
INSERT INTO profiles (id, branch_id, first_name, last_name, nickname, phone, is_active)
VALUES ('u2000000-0000-0000-0000-000000000000', 'b1000000-0000-0000-0000-000000000000', 'ณัฐวุฒิ', 'ทองดี', 'เก่ง', '082-2345678', TRUE);
INSERT INTO user_roles (user_id, role_id) VALUES ('u2000000-0000-0000-0000-000000000000', 'r2000000-0000-0000-0000-000000000000');

-- Sales (Nick: ปุ๋ย)
INSERT INTO profiles (id, branch_id, first_name, last_name, nickname, phone, is_active)
VALUES ('u3000000-0000-0000-0000-000000000000', 'b1000000-0000-0000-0000-000000000000', 'ศิริพร', 'งามดี', 'ปุ๋ย', '083-3456789', TRUE);
INSERT INTO user_roles (user_id, role_id) VALUES ('u3000000-0000-0000-0000-000000000000', 'r3000000-0000-0000-0000-000000000000');

-- Tailor (Nick: ช่างยศ)
INSERT INTO profiles (id, branch_id, first_name, last_name, nickname, phone, is_active)
VALUES ('u4000000-0000-0000-0000-000000000000', 'b1000000-0000-0000-0000-000000000000', 'สมยศ', 'รักความดี', 'ช่างยศ', '084-4567890', TRUE);
INSERT INTO user_roles (user_id, role_id) VALUES ('u4000000-0000-0000-0000-000000000000', 'r4000000-0000-0000-0000-000000000000');

-- Measurement (Nick: ช่างเจี๊ยบ)
INSERT INTO profiles (id, branch_id, first_name, last_name, nickname, phone, is_active)
VALUES ('u5000000-0000-0000-0000-000000000000', 'b1000000-0000-0000-0000-000000000000', 'กิตติพงษ์', 'จิตวัดตัว', 'ช่างเจี๊ยบ', '085-5678901', TRUE);
INSERT INTO user_roles (user_id, role_id) VALUES ('u5000000-0000-0000-0000-000000000000', 'r5000000-0000-0000-0000-000000000000');

-- Accounting (Nick: ก้อย)
INSERT INTO profiles (id, branch_id, first_name, last_name, nickname, phone, is_active)
VALUES ('u6000000-0000-0000-0000-000000000000', 'b1000000-0000-0000-0000-000000000000', 'ปรีชา', 'คิดเลขดี', 'ก้อย', '086-6789012', TRUE);
INSERT INTO user_roles (user_id, role_id) VALUES ('u6000000-0000-0000-0000-000000000000', 'r6000000-0000-0000-0000-000000000000');

-- =========================================================================
-- 3. ORGANIZATIONS (B2B CLIENTS)
-- =========================================================================

INSERT INTO organizations (id, name, english_name, tax_id, contact_person, phone, email, credit_term_days, credit_limit, notes)
VALUES
(
  'c1000000-0000-0000-0000-000000000000',
  'บริษัท สยามเทรดดิ้ง จำกัด',
  'Siam Trading Co., Ltd.',
  '0105553012345',
  'คุณวิภา จิตภักดี',
  '02-222-3333',
  'hr@siamtrading.co.th',
  30,
  200000.00,
  'สั่งชุดฟอร์มเสื้อเชิ้ตและสูทช่างเทคนิคและผู้บริหารทุกปี'
),
(
  'c2000000-0000-0000-0000-000000000000',
  'บริษัท ไทยพัฒนา กรุ๊ป จำกัด',
  'Thai Phatthana Group Co., Ltd.',
  '0105562098765',
  'คุณสมเกียรติ มั่นคง',
  '02-555-6666',
  'procurement@thaiphatthana.com',
  45,
  500000.00,
  'ลูกค้ารายใหญ่งานสูทสัมมนาและจัดเลี้ยงประจำปี'
);

-- =========================================================================
-- 4. CUSTOMERS
-- =========================================================================

INSERT INTO customers (id, title, first_name, last_name, nickname, gender, dob, phone, email, line_id, occupation, organization_id, preferred_fit, customer_tier)
VALUES
(
  'a1000000-0000-0000-0000-000000000000',
  'คุณ', 'สมชาย', 'วงศ์รัตน์', 'ชาย', 'ชาย', '1985-05-12', '089-999-8888',
  'somchai.w@gmail.com', 'somchai_w', 'วิศวกรและผู้จัดการโครงการ', 'c1000000-0000-0000-0000-000000000000', 'Classic Fit', 'Regular'
),
(
  'a2000000-0000-0000-0000-000000000000',
  'คุณ', 'พัชราภรณ์', 'ศรีทอง', 'พัช', 'หญิง', '1990-11-22', '088-777-6666',
  'patcha.s@hotmail.com', 'patcha_s', 'ผู้บริหารฝ่ายการตลาด', NULL, 'Slim Fit', 'VIP'
),
(
  'a3000000-0000-0000-0000-000000000000',
  'คุณ', 'ณัฐพล', 'กิจเจริญ', 'พล', 'ชาย', '1978-01-30', '087-666-5555',
  'nattapol.k@gmail.com', 'nattapol_k', 'ธุรกิจส่วนตัว', NULL, 'Comfort Fit', 'Regular'
),
(
  'a4000000-0000-0000-0000-000000000000',
  'คุณ', 'ณัฐพงศ์', 'พลอยงาม', 'นัท', 'ชาย', '1992-07-15', '081-444-2222',
  'nattaphong.p@siamtrading.co.th', 'nut_gems', 'หัวหน้าจัดซื้อ', 'c1000000-0000-0000-0000-000000000000', 'Slim Fit', 'Regular'
),
(
  'a5000000-0000-0000-0000-000000000000',
  'คุณ', 'วิญญู', 'ทองปาน', 'บอย', 'ชาย', '1988-02-18', '083-999-1111',
  'winyoo.t@gmail.com', 'winyoo_boy', 'ทนายความ', NULL, 'Classic Fit', 'VIP'
);

-- =========================================================================
-- 5. FABRICS & SUPPLIERS & PRODUCTS
-- =========================================================================

-- Supplier
INSERT INTO suppliers (id, name, contact_person, phone, email, address)
VALUES (
  's1000000-0000-0000-0000-000000000000',
  'บริษัท ไทเกอร์ แฟบริค จำกัด',
  'คุณเกรียงไกร เสือโคร่ง',
  '02-888-9999',
  'sales@tigerfabric.com',
  '456 ถนนเยาวราช แขวงสัมพันธวงศ์ เขตสัมพันธวงศ์ กรุงเทพฯ 10100'
);

-- Fabrics
INSERT INTO fabrics (id, code, brand, collection, country_of_origin, name, color, pattern, composition, price_tier, retail_price_per_yard, cost_price_per_yard, stock_qty_yards, shelf_location, supplier_id)
VALUES
(
  'f1000000-0000-0000-0000-000000000000',
  'FB-001', 'Loro Piana', 'Tasmanian Super 150s', 'Italy', 'Premium Wool Navy Blue', 'Deep Navy Blue', 'Plain', '100% Super Wool', 'Luxury', 3500.00, 1500.00, 150.0, 'A-12', 's1000000-0000-0000-0000-000000000000'
),
(
  'f2000000-0000-0000-0000-000000000000',
  'FB-002', 'VBC (Vitale Barberis Canonico)', 'Super 110s Flannel', 'Italy', 'Charcoal Grey Stripe Wool', 'Charcoal Grey', 'Stripe', '90% Wool, 10% Cashmere', 'Premium', 2200.00, 950.00, 85.0, 'A-15', 's1000000-0000-0000-0000-000000000000'
),
(
  'f3000000-0000-0000-0000-000000000000',
  'FB-003', 'Pierre Guszo Select', 'Comfort Cotton Blend', 'Thailand', 'White Twill Cotton', 'White', 'Twill', '100% Fine Cotton', 'Standard', 850.00, 350.00, 320.0, 'B-04', 's1000000-0000-0000-0000-000000000000'
);

-- Standard Products (Accessories)
INSERT INTO products (id, code, name, category, retail_price, cost_price, unit)
VALUES
('p1000000-0000-0000-0000-000000000000', 'ACC-001', 'เนคไทผ้าไหมสีกรมท่า', 'Tie', 1200.00, 450.00, 'Pcs'),
('p2000000-0000-0000-0000-000000000000', 'ACC-002', 'หูกระต่ายผ้าไหมสีดำ', 'Bow Tie', 850.00, 300.00, 'Pcs'),
('p3000000-0000-0000-0000-000000000000', 'ACC-003', 'พินติดปกสูท Pierre Guszo', 'Lapel Pin', 950.00, 350.00, 'Pcs');

-- Packages
INSERT INTO packages (id, code, name, description, base_price, fabric_tier)
VALUES
('k1000000-0000-0000-0000-000000000000', 'PKG-001', 'แพ็กเกจสูท Bespoke แต่งงาน', 'ชุดสูทกึ่งสั่งตัด 2 ชิ้น (สูท + กางเกง) + เสื้อเชิ้ตวัดตัว 1 ชิ้น พร้อมพินติดหน้าอกและหูกระต่าย', 45000.00, 'Premium'),
('k2000000-0000-0000-0000-000000000000', 'PKG-002', 'แพ็กเกจสูทธุรกิจ Luxury', 'สูทผ้าวูลอิตาลีแท้ 2 ชิ้น (เสื้อสูท + กางเกง) เหมาะสำหรับผู้บริหารและการเจรจาธุรกิจสำคัญ', 35000.00, 'Luxury');

-- =========================================================================
-- 6. MEASUREMENT TEMPLATES & VALUE SEEDING
-- =========================================================================

-- Templates
INSERT INTO measurement_templates (id, category, fields) VALUES
(
  't1000000-0000-0000-0000-000000000000',
  'Suit',
  '[
    {"key": "neck_circumference", "label": "รอบคอ", "default": 40},
    {"key": "shoulder_width", "label": "ไหล่กว้าง", "default": 46},
    {"key": "chest_circumference", "label": "รอบอก", "default": 100},
    {"key": "waist_circumference", "label": "รอบเอวเสื้อ", "default": 88},
    {"key": "hip_circumference", "label": "รอบสะโพก", "default": 102},
    {"key": "front_length", "label": "ความยาวเสื้อหน้า", "default": 75},
    {"key": "back_length", "label": "ความยาวเสื้อหลัง", "default": 74},
    {"key": "sleeve_length", "label": "ความยาวแขน", "default": 62},
    {"key": "armhole_depth", "label": "รอบต้นแขน", "default": 48}
  ]'::jsonb
),
(
  't2000000-0000-0000-0000-000000000000',
  'Pants',
  '[
    {"key": "waist", "label": "รอบเอวกางเกง", "default": 84},
    {"key": "hip", "label": "รอบสะโพกกางเกง", "default": 102},
    {"key": "front_rise", "label": "เป้าหน้า", "default": 26},
    {"key": "back_rise", "label": "เป้าหลัง", "default": 34},
    {"key": "thigh_circumference", "label": "รอบต้นขา", "default": 58},
    {"key": "knee_circumference", "label": "รอบเข่า", "default": 42},
    {"key": "leg_opening", "label": "ปลายขา", "default": 18},
    {"key": "pants_length", "label": "ความยาวกางเกงด้านนอก", "default": 100}
  ]'::jsonb
);

-- Active measurements for Somchai
INSERT INTO measurements (id, customer_id, template_id, measured_by, version, fit_preference, shoulder_type, back_type, chest_type, abdomen_type, posture_type, notes)
VALUES (
  'm1000000-0000-0000-0000-000000000000',
  'a1000000-0000-0000-0000-000000000000', -- Somchai
  't1000000-0000-0000-0000-000000000000', -- Suit
  'u5000000-0000-0000-0000-000000000000', -- Fitter Jeab
  1,
  'Classic Fit',
  'straight',
  'normal',
  'normal',
  'normal',
  'erect',
  'ลูกค้าช่วงไหล่ตั้งกว่าปกติเล็กน้อย ให้รองฟองน้ำไหล่บางพิเศษ'
);

INSERT INTO measurement_values (measurement_id, key, value) VALUES
('m1000000-0000-0000-0000-000000000000', 'neck_circumference', 42.50),
('m1000000-0000-0000-0000-000000000000', 'shoulder_width', 48.00),
('m1000000-0000-0000-0000-000000000000', 'chest_circumference', 104.00),
('m1000000-0000-0000-0000-000000000000', 'waist_circumference', 92.00),
('m1000000-0000-0000-0000-000000000000', 'hip_circumference', 106.00),
('m1000000-0000-0000-0000-000000000000', 'front_length', 77.00),
('m1000000-0000-0000-0000-000000000000', 'back_length', 76.00),
('m1000000-0000-0000-0000-000000000000', 'sleeve_length', 64.00),
('m1000000-0000-0000-0000-000000000000', 'armhole_depth', 50.00);

-- =========================================================================
-- 7. ORDERS, INVOICES & PAYMENTS (matching the dashboard screenshots)
-- =========================================================================

-- Order 1: Somchai - Suit order 25,900 Baht
-- Created by Pui
INSERT INTO orders (id, order_no, branch_id, customer_id, sales_rep_id, order_date, subtotal, discount_amount, vat_amount, total_amount, deposit_paid, balance_due, payment_status, status)
VALUES (
  'o1000000-0000-0000-0000-000000000000',
  'ORD-240524-05',
  'b1000000-0000-0000-0000-000000000000',
  'a1000000-0000-0000-0000-000000000000', -- Somchai
  'u3000000-0000-0000-0000-000000000000', -- Pui
  '2026-05-24', -- Store date as 2026 for system context, but keeping labels as 24 พ.ค. 67
  25900.00,
  0.00,
  0.00,
  25900.00,
  25900.00,
  0.00,
  'Paid',
  'Confirmed'
);

INSERT INTO order_items (order_id, item_type, fabric_id, qty, unit_price, total_price)
VALUES ('o1000000-0000-0000-0000-000000000000', 'CustomSuit', 'f2000000-0000-0000-0000-000000000000', 1, 25900.00, 25900.00);

INSERT INTO invoices (id, invoice_no, order_id, branch_id, customer_id, invoice_date, subtotal, total_amount, amount_paid, balance_due, status)
VALUES (
  'i1000000-0000-0000-0000-000000000000',
  'INV-240524-05',
  'o1000000-0000-0000-0000-000000000000',
  'b1000000-0000-0000-0000-000000000000',
  'a1000000-0000-0000-0000-000000000000',
  '2026-05-24',
  25900.00,
  25900.00,
  25900.00,
  0.00,
  'Paid'
);

INSERT INTO payments (payment_no, invoice_id, order_id, branch_id, payment_date, amount, payment_method, ref_number, slip_verified)
VALUES (
  'PAY-240524-05',
  'i1000000-0000-0000-0000-000000000000',
  'o1000000-0000-0000-0000-000000000000',
  'b1000000-0000-0000-0000-000000000000',
  '2026-05-24 10:24:00+07',
  25900.00,
  'BankTransfer',
  'TXN987654321',
  TRUE
);

-- Order 2: Siam Trading - B2B uniform order 89,500 Baht
INSERT INTO orders (id, order_no, branch_id, customer_id, organization_id, sales_rep_id, order_date, subtotal, discount_amount, total_amount, deposit_paid, balance_due, payment_status, status)
VALUES (
  'o2000000-0000-0000-0000-000000000000',
  'ORD-240524-04',
  'b1000000-0000-0000-0000-000000000000',
  'a4000000-0000-0000-0000-000000000000', -- Nut (Purchase Manager)
  'c1000000-0000-0000-0000-000000000000', -- Siam Trading
  'u3000000-0000-0000-0000-000000000000', -- Pui
  '2026-05-24',
  89500.00,
  0.00,
  89500.00,
  89500.00,
  0.00,
  'Paid',
  'Confirmed'
);

INSERT INTO order_items (order_id, item_type, fabric_id, qty, unit_price, total_price)
VALUES ('o2000000-0000-0000-0000-000000000000', 'CustomSuit', 'f3000000-0000-0000-0000-000000000000', 10, 8950.00, 89500.00);

INSERT INTO invoices (id, invoice_no, order_id, branch_id, customer_id, organization_id, invoice_date, subtotal, total_amount, amount_paid, balance_due, status)
VALUES (
  'i2000000-0000-0000-0000-000000000000',
  'INV-240524-04',
  'o2000000-0000-0000-0000-000000000000',
  'b1000000-0000-0000-0000-000000000000',
  'a4000000-0000-0000-0000-000000000000',
  'c1000000-0000-0000-0000-000000000000',
  '2026-05-24',
  89500.00,
  89500.00,
  89500.00,
  0.00,
  'Paid'
);

INSERT INTO payments (payment_no, invoice_id, order_id, branch_id, payment_date, amount, payment_method, ref_number, slip_verified)
VALUES (
  'PAY-240524-04',
  'i2000000-0000-0000-0000-000000000000',
  'o2000000-0000-0000-0000-000000000000',
  'b1000000-0000-0000-0000-000000000000',
  '2026-05-24 09:58:00+07',
  89500.00,
  'BankTransfer',
  'TXN987654320',
  TRUE
);

-- =========================================================================
-- 8. APPOINTMENTS (matches dashboard calendar view)
-- =========================================================================

INSERT INTO appointments (branch_id, customer_id, type, title, description, start_time, end_time, location, assigned_staff_id, status)
VALUES
(
  'b1000000-0000-0000-0000-000000000000',
  'a1000000-0000-0000-0000-000000000000', -- Somchai
  'Fitting 1',
  'คุณสมชาย ลองชุดรอบ 1',
  'ลองผ้าด้ายดิบโครงสร้างเสื้อนอกและกางเกง ปรับไหล่ซ้ายลาด',
  '2026-05-24 09:00:00+07',
  '2026-05-24 10:00:00+07',
  'ที่ห้องลอง Pierre Guszo หาดใหญ่',
  'u5000000-0000-0000-0000-000000000000', -- Jeab
  'Scheduled'
),
(
  'b1000000-0000-0000-0000-000000000000',
  'a4000000-0000-0000-0000-000000000000', -- Siam Trading
  'Measurement',
  'บริษัท สยามเทรดดิ้ง จำกัด วัดตัวนอกสถานที่',
  'ทีมบริหาร 5 ท่านเข้าวัดตัวที่บริษัทสาขาหาดใหญ่ชั้น 4',
  '2026-05-24 11:00:00+07',
  '2026-05-24 13:00:00+07',
  'บจก. สยามเทรดดิ้ง ชั้น 4',
  'u5000000-0000-0000-0000-000000000000',
  'Scheduled'
),
(
  'b1000000-0000-0000-0000-000000000000',
  'a2000000-0000-0000-0000-000000000000', -- Patcharaporn
  'Fitting 1',
  'คุณพัชราภรณ์ ลองชุดสูท 2 ชิ้น',
  'ลองชุดสูทกางเกงผ้าลอโร่พิอาน่าเข้ารูปสไตล์สลิมฟิต',
  '2026-05-24 13:30:00+07',
  '2026-05-24 14:30:00+07',
  'ห้องรับรอง VIP',
  'u5000000-0000-0000-0000-000000000000',
  'Scheduled'
);

-- =========================================================================
-- 9. AUDIT & BACKUP LOGS
-- =========================================================================

-- Successful backup log to Google Sheets
INSERT INTO backup_logs (backup_type, status, entities_synced, error_message, checksum, triggered_by, started_at, completed_at)
VALUES (
  'GoogleSheets',
  'Success',
  185,
  NULL,
  'c3ab879201f8d48ef',
  'System',
  '2026-05-24 03:00:00+07',
  '2026-05-24 03:02:15+07'
);

-- Audit logs
INSERT INTO audit_logs (user_id, user_name_snapshot, role, action, entity_type, entity_id, timestamp)
VALUES
('u3000000-0000-0000-0000-000000000000', 'ปุ๋ย', 'Sales', 'CREATE', 'Order', 'o1000000-0000-0000-0000-000000000000', '2026-05-24 10:24:00+07'),
('u5000000-0000-0000-0000-000000000000', 'ช่างเจี๊ยบ', 'Measurement', 'CREATE', 'Measurement', 'm1000000-0000-0000-0000-000000000000', '2026-05-24 09:58:00+07');
