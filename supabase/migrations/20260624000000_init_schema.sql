-- Supabase Migration Script for PIERRE GUSZO TAILORING ERP

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================================================================
-- ENUMS & LOOKUPS
-- =========================================================================

-- Job (Production) Status
CREATE TYPE job_status AS ENUM (
  'Draft',
  'Confirmed',
  'Waiting Measurement',
  'Measured',
  'Waiting Fabric',
  'Pattern Preparation',
  'Cutting',
  'Sewing',
  'First Fitting',
  'Alteration',
  'Second Fitting',
  'Quality Check',
  'Ready for Pickup',
  'Delivered',
  'On Hold',
  'Cancelled'
);

-- Appointment Types
CREATE TYPE appointment_type AS ENUM (
  'Measurement',
  'Fitting 1',
  'Fitting 2',
  'Alteration Check',
  'Pickup',
  'Payment Collection',
  'Off-site Consultation',
  'Corporate Fitting',
  'Follow-up',
  'Other'
);

-- Stock Movement Types
CREATE TYPE stock_movement_type AS ENUM (
  'Receive',    -- Import/Purchase Fabric
  'Issue',      -- Deduct for customer suit
  'Adjust',     -- Stock adjustment (loss/finding)
  'Return',     -- Customer return or leftover return
  'Transfer',   -- Move between branches
  'Reserve',    -- Lock fabric for pending order
  'Release'     -- Release reserved fabric
);

-- Document Types
CREATE TYPE document_type AS ENUM (
  'Quotation',
  'SalesOrder',
  'DepositReceipt',
  'Invoice',
  'TaxInvoice',
  'Receipt',
  'CreditNote',
  'Refund',
  'Expense'
);

-- Fit Preferences
CREATE TYPE fit_preference AS ENUM (
  'Slim Fit',
  'Classic Fit',
  'Comfort Fit',
  'Custom Fit'
);

-- =========================================================================
-- BASE TABLES
-- =========================================================================

-- 1. Branches Table
CREATE TABLE branches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL UNIQUE,
  address TEXT,
  phone VARCHAR(50),
  tax_id VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- 2. Profiles (Staff details linked to auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY, -- Maps directly to auth.users.id
  branch_id UUID REFERENCES branches(id),
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  nickname VARCHAR(100),
  phone VARCHAR(50),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- 3. Roles Table
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Permissions Table
CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Role Permissions (Mapping)
CREATE TABLE role_permissions (
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

-- 6. User Roles (Mapping)
CREATE TABLE user_roles (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, role_id)
);

-- =========================================================================
-- DOCUMENT SEQUENCE TRACKER
-- =========================================================================
CREATE TABLE document_number_sequences (
  sequence_name VARCHAR(100) NOT NULL,
  period VARCHAR(6) NOT NULL, -- YYMM format, e.g. "2606"
  current_value INT NOT NULL DEFAULT 0,
  PRIMARY KEY (sequence_name, period)
);

-- =========================================================================
-- CRM TABLES
-- =========================================================================

-- 7. Organizations (Corporate Clients)
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  english_name VARCHAR(255),
  tax_id VARCHAR(50),
  branch_code VARCHAR(50) DEFAULT '00000', -- Head office or branch
  billing_address TEXT,
  shipping_address TEXT,
  contact_person VARCHAR(255),
  phone VARCHAR(50),
  email VARCHAR(255),
  line_id VARCHAR(100),
  credit_term_days INT DEFAULT 0,
  credit_limit DECIMAL(15, 2) DEFAULT 0.00,
  standard_discount_pct DECIMAL(5, 2) DEFAULT 0.00,
  notes TEXT,
  status VARCHAR(50) DEFAULT 'Active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES profiles(id),
  updated_by UUID REFERENCES profiles(id)
);

-- 8. Customers (Individual Clients)
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_pic_url TEXT,
  title VARCHAR(50), -- คุณ, นาย, นาง, นางสาว, Dr., etc.
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  nickname VARCHAR(100),
  gender VARCHAR(50),
  dob DATE,
  phone VARCHAR(50) NOT NULL,
  phone_backup VARCHAR(50),
  email VARCHAR(255),
  line_id VARCHAR(100),
  occupation VARCHAR(255),
  organization_id UUID REFERENCES organizations(id),
  position VARCHAR(255),
  source_channel VARCHAR(255), -- Facebook, Walk-in, Google, Friend
  sales_rep_id UUID REFERENCES profiles(id),
  customer_tier VARCHAR(50) DEFAULT 'Regular', -- VIP, Regular, Silver, Gold
  loyalty_points INT DEFAULT 0,
  preferred_style TEXT,
  preferred_colors TEXT,
  preferred_fabrics TEXT,
  preferred_fit fit_preference DEFAULT 'Classic Fit',
  notes TEXT,
  status VARCHAR(50) DEFAULT 'Active', -- Active, Inactive, Blacklisted
  pdpa_consent BOOLEAN DEFAULT FALSE,
  pdpa_consent_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES profiles(id),
  updated_by UUID REFERENCES profiles(id)
);

-- 9. Customer Addresses
CREATE TABLE customer_addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  address_type VARCHAR(50) DEFAULT 'Home', -- Home, Office, Shipping, Billing
  address_line1 TEXT NOT NULL,
  subdistrict VARCHAR(100),
  district VARCHAR(100),
  province VARCHAR(100),
  postal_code VARCHAR(20),
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Customer Tags
CREATE TABLE customer_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE customer_tag_links (
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES customer_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (customer_id, tag_id)
);

-- =========================================================================
-- MEASUREMENT TABLES
-- =========================================================================

-- 11. Measurement Templates (Definitions of key fields)
CREATE TABLE measurement_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category VARCHAR(100) NOT NULL, -- Suit, Shirt, Pants, Vest
  fields JSONB NOT NULL, -- List of fields with label, key, default units, and body location mapping
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. Measurements (Historical Record Headers)
CREATE TABLE measurements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  template_id UUID REFERENCES measurement_templates(id),
  measured_by UUID REFERENCES profiles(id),
  measured_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  version INT DEFAULT 1,
  fit_preference fit_preference DEFAULT 'Classic Fit',
  shoulder_type VARCHAR(100), -- straight, sloped, low_left, low_right
  back_type VARCHAR(100), -- straight, hunched, normal
  chest_type VARCHAR(100), -- flat, prominent, normal
  abdomen_type VARCHAR(100), -- flat, prominent, normal
  posture_type VARCHAR(100), -- erect, leaning forward, normal
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. Measurement Values (Detail Key-Values in Centimeters)
CREATE TABLE measurement_values (
  measurement_id UUID REFERENCES measurements(id) ON DELETE CASCADE,
  key VARCHAR(100) NOT NULL, -- e.g. "chest_circumference"
  value DECIMAL(6, 2) NOT NULL, -- Stored strictly in cm
  PRIMARY KEY (measurement_id, key)
);

-- =========================================================================
-- PRODUCT & INVENTORY TABLES
-- =========================================================================

-- 14. Suppliers
CREATE TABLE suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  contact_person VARCHAR(255),
  phone VARCHAR(50),
  email VARCHAR(255),
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- 15. Products (Standard Items, e.g. accessories, ready-made clothing)
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL, -- Suit, Shirt, Pants, Tie, Shoes
  description TEXT,
  retail_price DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  cost_price DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  unit VARCHAR(50) DEFAULT 'Pcs',
  vat_pct DECIMAL(5, 2) DEFAULT 7.00,
  image_url TEXT,
  status VARCHAR(50) DEFAULT 'Active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- 16. Fabric Catalog
CREATE TABLE fabrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(100) NOT NULL UNIQUE,
  brand VARCHAR(100),
  collection VARCHAR(100),
  country_of_origin VARCHAR(100),
  name VARCHAR(255) NOT NULL,
  color VARCHAR(100),
  pattern VARCHAR(100), -- Plain, Stripe, Plaid, Houndstooth
  composition VARCHAR(255), -- e.g. 100% Wool, Wool-Blend
  weight_gsm INT,
  width_inches INT,
  season VARCHAR(50),
  price_tier VARCHAR(50), -- Standard, Premium, Luxury
  retail_price_per_yard DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  cost_price_per_yard DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  stock_qty_yards DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  min_stock_alert DECIMAL(10, 2) DEFAULT 5.00,
  shelf_location VARCHAR(100),
  supplier_id UUID REFERENCES suppliers(id),
  lot_number VARCHAR(100),
  image_url TEXT,
  swatch_url TEXT,
  status VARCHAR(50) DEFAULT 'Active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- 17. Packages (Bundle Suit deals)
CREATE TABLE packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  base_price DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  fabric_tier VARCHAR(50), -- Standard, Premium
  image_url TEXT,
  status VARCHAR(50) DEFAULT 'Active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE package_items (
  package_id UUID REFERENCES packages(id) ON DELETE CASCADE,
  product_category VARCHAR(100) NOT NULL, -- e.g. "Suit" (1), "Pants" (1), "Shirt" (1)
  qty INT DEFAULT 1,
  PRIMARY KEY (package_id, product_category)
);

-- 18. Stock Movements (Historical Log)
CREATE TABLE stock_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fabric_id UUID REFERENCES fabrics(id) ON DELETE CASCADE,
  movement_type stock_movement_type NOT NULL,
  qty_changed DECIMAL(10, 2) NOT NULL, -- positive for received/returned, negative for issue/reserve
  qty_before DECIMAL(10, 2) NOT NULL,
  qty_after DECIMAL(10, 2) NOT NULL,
  unit_cost DECIMAL(12, 2),
  reference_no VARCHAR(100), -- order_id or purchase_order_id
  notes TEXT,
  performed_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================================
-- ORDER & PRODUCTION TABLES
-- =========================================================================

-- 19. Orders (Headers)
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_no VARCHAR(100) NOT NULL UNIQUE, -- e.g. ORD-24060001
  branch_id UUID REFERENCES branches(id) NOT NULL,
  customer_id UUID REFERENCES customers(id) NOT NULL,
  organization_id UUID REFERENCES organizations(id), -- Null if B2C
  sales_rep_id UUID REFERENCES profiles(id) NOT NULL,
  order_date DATE NOT NULL DEFAULT CURRENT_DATE,
  estimated_delivery_date DATE,
  urgency_level VARCHAR(50) DEFAULT 'Normal', -- Normal, Urgent, Express
  subtotal DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  discount_amount DECIMAL(15, 2) DEFAULT 0.00,
  vat_amount DECIMAL(15, 2) DEFAULT 0.00,
  total_amount DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  deposit_paid DECIMAL(15, 2) DEFAULT 0.00,
  balance_due DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  payment_status VARCHAR(50) DEFAULT 'Unpaid', -- Unpaid, Partial, Paid, Refunded
  status VARCHAR(50) DEFAULT 'Draft', -- Draft, Confirmed, InProduction, Completed, Cancelled
  cancellation_reason TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES profiles(id),
  updated_by UUID REFERENCES profiles(id)
);

-- 20. Order People (Individual specifications in a B2B group order)
CREATE TABLE order_people (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) NOT NULL,
  custom_package_id UUID REFERENCES packages(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 21. Order Items (Specific garments ordered)
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  order_person_id UUID REFERENCES order_people(id) ON DELETE SET NULL, -- Maps to a person in B2B
  product_id UUID REFERENCES products(id), -- If standard item
  fabric_id UUID REFERENCES fabrics(id), -- If custom tailoring item
  lining_code VARCHAR(100),
  button_code VARCHAR(100),
  addon_details TEXT, -- customized buttons, embroidery details
  item_type VARCHAR(100) NOT NULL, -- CustomSuit, CustomShirt, CustomPants, ReadyMade
  qty INT NOT NULL DEFAULT 1,
  unit_price DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  discount_amount DECIMAL(12, 2) DEFAULT 0.00,
  total_price DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 22. Jobs (Tailoring Production Work Orders)
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_no VARCHAR(100) NOT NULL UNIQUE, -- e.g. JB-24060001
  order_item_id UUID REFERENCES order_items(id) ON DELETE CASCADE,
  measurement_id UUID REFERENCES measurements(id) ON DELETE RESTRICT,
  branch_id UUID REFERENCES branches(id) NOT NULL,
  assignee_id UUID REFERENCES profiles(id), -- Main tailor responsible
  status job_status NOT NULL DEFAULT 'Draft',
  started_at TIMESTAMP WITH TIME ZONE,
  due_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- 23. Job Tasks (Sub-workflows for tailoring, e.g. Cutting, Pattern, Sewing)
CREATE TABLE job_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  task_name VARCHAR(100) NOT NULL, -- Pattern, Cutting, Sewing, QualityCheck
  assignee_id UUID REFERENCES profiles(id), -- specific tailor for this step
  status VARCHAR(50) DEFAULT 'Pending', -- Pending, InProgress, Completed
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT
);

-- 24. Job Status History (Workflow logs)
CREATE TABLE job_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  from_status job_status NOT NULL,
  to_status job_status NOT NULL,
  changed_by UUID REFERENCES profiles(id) NOT NULL,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  reason TEXT,
  duration_seconds INT -- Time spent in from_status
);

-- 25. Fitting Sessions (Try-on appointments & modifications log)
CREATE TABLE fitting_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  fitting_round INT DEFAULT 1, -- Fitting 1, Fitting 2, etc.
  session_date TIMESTAMP WITH TIME ZONE NOT NULL,
  fitter_id UUID REFERENCES profiles(id),
  feedback TEXT,
  is_approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE fitting_adjustments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fitting_session_id UUID REFERENCES fitting_sessions(id) ON DELETE CASCADE,
  measurement_key VARCHAR(100) NOT NULL, -- e.g. "waist"
  adjustment_value DECIMAL(6, 2) NOT NULL, -- e.g. -1.50 (decrease waist by 1.5 cm)
  notes TEXT
);

-- =========================================================================
-- APPOINTMENT CALENDAR
-- =========================================================================

-- 26. Appointments Table
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch_id UUID REFERENCES branches(id) NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id),
  order_id UUID REFERENCES orders(id),
  job_id UUID REFERENCES jobs(id),
  type appointment_type NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  google_maps_url TEXT,
  status VARCHAR(50) DEFAULT 'Scheduled', -- Scheduled, Confirmed, Completed, Cancelled, Noshow
  cancellation_reason TEXT,
  checked_in_at TIMESTAMP WITH TIME ZONE,
  checked_out_at TIMESTAMP WITH TIME ZONE,
  gps_latitude DECIMAL(10, 8),
  gps_longitude DECIMAL(11, 8),
  assigned_staff_id UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES profiles(id)
);

-- =========================================================================
-- BILLING, PAYMENTS, & ACCOUNTING
-- =========================================================================

-- 27. Quotations
CREATE TABLE quotations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quotation_no VARCHAR(100) NOT NULL UNIQUE,
  branch_id UUID REFERENCES branches(id) NOT NULL,
  customer_id UUID REFERENCES customers(id) NOT NULL,
  organization_id UUID REFERENCES organizations(id),
  subtotal DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  discount_amount DECIMAL(15, 2) DEFAULT 0.00,
  vat_amount DECIMAL(15, 2) DEFAULT 0.00,
  total_amount DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  valid_until DATE,
  status VARCHAR(50) DEFAULT 'Draft', -- Draft, Sent, Accepted, Declined, Expired
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES profiles(id)
);

CREATE TABLE quotation_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quotation_id UUID REFERENCES quotations(id) ON DELETE CASCADE,
  item_type VARCHAR(100) NOT NULL,
  product_id UUID REFERENCES products(id),
  fabric_id UUID REFERENCES fabrics(id),
  qty INT NOT NULL DEFAULT 1,
  unit_price DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  total_price DECIMAL(12, 2) NOT NULL DEFAULT 0.00
);

-- 28. Invoices
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_no VARCHAR(100) NOT NULL UNIQUE,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES branches(id) NOT NULL,
  customer_id UUID REFERENCES customers(id) NOT NULL,
  organization_id UUID REFERENCES organizations(id),
  invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  subtotal DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  discount_amount DECIMAL(15, 2) DEFAULT 0.00,
  vat_amount DECIMAL(15, 2) DEFAULT 0.00,
  total_amount DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  amount_paid DECIMAL(15, 2) DEFAULT 0.00,
  balance_due DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  status VARCHAR(50) DEFAULT 'Unpaid', -- Unpaid, PartiallyPaid, Paid, Overdue, Void
  void_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES profiles(id)
);

-- 29. Payments
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_no VARCHAR(100) NOT NULL UNIQUE, -- e.g. PAY-24060001
  invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  branch_id UUID REFERENCES branches(id) NOT NULL,
  payment_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  amount DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  payment_method VARCHAR(50) NOT NULL, -- Cash, BankTransfer, CreditCard, PromptPay
  ref_number VARCHAR(100), -- Transfer txn ID or Card terminal auth ID
  slip_image_url TEXT,
  slip_verified BOOLEAN DEFAULT FALSE,
  notes TEXT,
  status VARCHAR(50) DEFAULT 'Completed', -- Completed, Cancelled
  cancellation_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES profiles(id)
);

-- 30. Expenses
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  voucher_no VARCHAR(100) NOT NULL UNIQUE,
  branch_id UUID REFERENCES branches(id) NOT NULL,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  category VARCHAR(100) NOT NULL, -- Rent, Utilities, Wages, Materials, Other
  amount DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  vat_amount DECIMAL(15, 2) DEFAULT 0.00,
  total_amount DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  paid_to VARCHAR(255),
  receipt_image_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES profiles(id)
);

-- =========================================================================
-- FILE MANAGER & MEDIA
-- =========================================================================
CREATE TABLE media_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  file_name VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL, -- Storage Path in Bucket
  mime_type VARCHAR(100),
  file_size INT,
  category VARCHAR(100), -- CustomerPhoto, MeasurementRef, Slip, FabricSwatch, Document
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  uploaded_by UUID REFERENCES profiles(id)
);

CREATE TABLE entity_media_links (
  media_file_id UUID REFERENCES media_files(id) ON DELETE CASCADE,
  entity_type VARCHAR(100) NOT NULL, -- Customer, OrderItem, Job, FittingSession, Payment, Expense
  entity_id UUID NOT NULL,
  PRIMARY KEY (media_file_id, entity_type, entity_id)
);

-- =========================================================================
-- AUDIT & BACKUP LOGS
-- =========================================================================

-- 31. Audit Logs
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  user_name_snapshot VARCHAR(255),
  role VARCHAR(100),
  action VARCHAR(100) NOT NULL, -- LOGIN, CREATE, UPDATE, DELETE, VOID, DISCOUNT, EXPORT
  entity_type VARCHAR(100), -- Customer, Order, Measurement, Payment, Invoice
  entity_id UUID,
  before_data JSONB,
  after_data JSONB,
  ip_address VARCHAR(50),
  user_agent TEXT,
  reason TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 32. Backup Logs
CREATE TABLE backup_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  backup_type VARCHAR(50) DEFAULT 'GoogleSheets', -- GoogleSheets, CSV, JSON
  status VARCHAR(50) NOT NULL, -- Pending, Processing, Success, Failed
  entities_synced INT DEFAULT 0,
  error_message TEXT,
  checksum VARCHAR(255),
  triggered_by VARCHAR(100) DEFAULT 'System', -- System, OwnerNickName
  started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- =========================================================================
-- TRIGGERS & AUTOMATION HELPER FUNCTIONS
-- =========================================================================

-- Auto updated_at Trigger Function
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at Triggers
CREATE TRIGGER update_branches_modtime BEFORE UPDATE ON branches FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_profiles_modtime BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_organizations_modtime BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_customers_modtime BEFORE UPDATE ON customers FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_measurements_modtime BEFORE UPDATE ON measurements FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_products_modtime BEFORE UPDATE ON products FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_fabrics_modtime BEFORE UPDATE ON fabrics FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_packages_modtime BEFORE UPDATE ON packages FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_orders_modtime BEFORE UPDATE ON orders FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_jobs_modtime BEFORE UPDATE ON jobs FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_appointments_modtime BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_quotations_modtime BEFORE UPDATE ON quotations FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_invoices_modtime BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

-- Document Number Sequence Generator
CREATE OR REPLACE FUNCTION generate_document_number(seq_name TEXT, prefix TEXT)
RETURNS TEXT AS $$
DECLARE
  seq_val INT;
  year_month TEXT;
  doc_num TEXT;
BEGIN
  -- Get current YYMM in local Thai timezone (e.g. 2606)
  year_month := to_char(current_date, 'YYMM');
  
  -- Upsert sequence tracker
  INSERT INTO document_number_sequences (sequence_name, period, current_value)
  VALUES (seq_name, year_month, 1)
  ON CONFLICT (sequence_name, period) 
  DO UPDATE SET current_value = document_number_sequences.current_value + 1
  RETURNING current_value INTO seq_val;
  
  -- E.g. ORD-26060001 (prefix ORD, 4 digit sequence)
  doc_num := prefix || '-' || year_month || lpad(seq_val::text, 4, '0');
  RETURN doc_num;
END;
$$ LANGUAGE plpgsql;

-- Helper function to check if active user has permission (to be used in RLS policies)
CREATE OR REPLACE FUNCTION current_user_has_permission(req_perm TEXT)
RETURNS BOOLEAN SECURITY DEFINER AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN role_permissions rp ON ur.role_id = rp.role_id
    JOIN permissions p ON rp.permission_id = p.id
    WHERE ur.user_id = auth.uid() AND p.name = req_perm
  );
END;
$$ LANGUAGE plpgsql;

-- Enable RLS on core tables
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE measurement_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE fabrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE backup_logs ENABLE ROW LEVEL SECURITY;
