-- Migration to support AI Virtual Try-On Studio

-- =========================================================================
-- 1. CATALOG TABLES
-- =========================================================================

-- Suit Styles Catalog
CREATE TABLE suit_styles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(100) NOT NULL UNIQUE,
  name_th VARCHAR(255) NOT NULL,
  name_en VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL, -- Suit-2P, Suit-3P, Tuxedo, Blazer, Shirt
  fit_type VARCHAR(100) NOT NULL, -- Slim Fit, Tailored Fit, Classic Fit, Comfort Fit
  button_style VARCHAR(100) NOT NULL, -- Single-1, Single-2, Double-4, Double-6
  lapel_style VARCHAR(100) NOT NULL, -- Notch, Peak, Shawl, Slim, Wide
  pocket_style VARCHAR(100) NOT NULL, -- Flap, Jetted, Patch, Ticket
  vent_style VARCHAR(100) NOT NULL, -- None, Center, Double
  vest_style VARCHAR(100) DEFAULT 'None', -- None, Single-Breasted, Double-Breasted
  front_image_path TEXT,
  prompt_template TEXT NOT NULL,
  negative_prompt_template TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Suit Color/Pattern Catalog
CREATE TABLE suit_color_patterns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(100) NOT NULL UNIQUE,
  name_th VARCHAR(255) NOT NULL,
  name_en VARCHAR(255) NOT NULL,
  primary_hex VARCHAR(7) NOT NULL,
  secondary_hex VARCHAR(7),
  pattern_type VARCHAR(100) NOT NULL, -- Solid, Pinstripe, Windowpane, Herringbone, Birdseye, Check
  pattern_scale VARCHAR(50) DEFAULT 'medium', -- small, medium, large
  pattern_description TEXT,
  recommended_shirt VARCHAR(255),
  recommended_tie VARCHAR(255),
  swatch_image_path TEXT,
  fabric_id UUID REFERENCES fabrics(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- =========================================================================
-- 2. SESSIONS & RESULTS
-- =========================================================================

-- Try-On Sessions
CREATE TABLE ai_tryon_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  quotation_id UUID REFERENCES quotations(id) ON DELETE SET NULL,
  source_image_id UUID REFERENCES media_files(id) ON DELETE RESTRICT,
  suit_style_id UUID REFERENCES suit_styles(id),
  color_pattern_id UUID REFERENCES suit_color_patterns(id),
  provider VARCHAR(50) NOT NULL, -- Fal, Fashn, Replicate, Mock
  model_name VARCHAR(100) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'Draft', -- Draft, Validating, Queued, Processing, Completed, Failed, Cancelled
  generation_count INT DEFAULT 1,
  estimated_cost DECIMAL(10, 4) DEFAULT 0.0000,
  actual_cost DECIMAL(10, 4) DEFAULT 0.0000,
  preserve_face VARCHAR(20) DEFAULT 'medium', -- low, medium, high
  preserve_hair BOOLEAN DEFAULT TRUE,
  preserve_body BOOLEAN DEFAULT TRUE,
  preserve_pose BOOLEAN DEFAULT TRUE,
  preserve_background BOOLEAN DEFAULT FALSE,
  background_mode VARCHAR(50) DEFAULT 'studio', -- original, studio
  requested_by UUID REFERENCES profiles(id),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  failed_at TIMESTAMP WITH TIME ZONE,
  error_code VARCHAR(100),
  error_message TEXT,
  idempotency_key VARCHAR(255) UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Try-On Output Previews
CREATE TABLE ai_tryon_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES ai_tryon_sessions(id) ON DELETE CASCADE,
  output_image_path TEXT NOT NULL,
  thumbnail_path TEXT,
  provider_result_id VARCHAR(255),
  version_number INT DEFAULT 1,
  identity_score DECIMAL(5, 2),
  quality_score DECIMAL(5, 2),
  is_favorite BOOLEAN DEFAULT FALSE,
  is_selected BOOLEAN DEFAULT FALSE,
  is_approved BOOLEAN DEFAULT FALSE,
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- AI Processing Consents
CREATE TABLE customer_ai_consents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  consent_version VARCHAR(50) NOT NULL DEFAULT 'v1.0',
  consented BOOLEAN NOT NULL DEFAULT FALSE,
  consented_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  consented_by UUID REFERENCES profiles(id),
  revoked_at TIMESTAMP WITH TIME ZONE,
  signature_path TEXT,
  device_info JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================================
-- 3. ADMINISTRATIVE CONTROL & AUDIT LOGS
-- =========================================================================

-- AI Provider System Configs
CREATE TABLE ai_provider_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider VARCHAR(50) NOT NULL UNIQUE, -- Fal, Fashn, Replicate, Mock
  model_name VARCHAR(100) NOT NULL,
  endpoint_url TEXT,
  is_enabled BOOLEAN DEFAULT TRUE,
  priority INT DEFAULT 1,
  cost_per_generation DECIMAL(10, 4) NOT NULL DEFAULT 0.0000,
  timeout_seconds INT DEFAULT 120,
  max_retries INT DEFAULT 3,
  configuration JSONB, -- Encrypted keys
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Detailed Usage Records
CREATE TABLE ai_usage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES ai_tryon_sessions(id) ON DELETE SET NULL,
  user_id UUID REFERENCES profiles(id),
  provider VARCHAR(50) NOT NULL,
  model_name VARCHAR(100) NOT NULL,
  images_generated INT DEFAULT 1,
  processing_time_ms INT,
  cost DECIMAL(10, 4) DEFAULT 0.0000,
  status VARCHAR(50) NOT NULL,
  error_code VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================================
-- 4. AUTOMATION & TRIGGERS
-- =========================================================================

-- updated_at triggers
CREATE TRIGGER update_suit_styles_modtime BEFORE UPDATE ON suit_styles FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_suit_color_patterns_modtime BEFORE UPDATE ON suit_color_patterns FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_ai_provider_settings_modtime BEFORE UPDATE ON ai_provider_settings FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

-- =========================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================

ALTER TABLE suit_styles ENABLE ROW LEVEL SECURITY;
ALTER TABLE suit_color_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_tryon_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_tryon_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_ai_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_provider_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage_logs ENABLE ROW LEVEL SECURITY;

-- 1) Catalog Policies (Everyone active can read catalog items, managers/owners can edit)
CREATE POLICY suit_styles_read ON suit_styles FOR SELECT TO authenticated USING (deleted_at IS NULL AND is_active = TRUE);
CREATE POLICY suit_styles_write ON suit_styles FOR ALL TO authenticated USING (current_user_has_permission('inventory:manage'));

CREATE POLICY suit_color_patterns_read ON suit_color_patterns FOR SELECT TO authenticated USING (deleted_at IS NULL AND is_active = TRUE);
CREATE POLICY suit_color_patterns_write ON suit_color_patterns FOR ALL TO authenticated USING (current_user_has_permission('inventory:manage'));

-- 2) Consents (Everyone authenticated can read/write, only authorized can modify)
CREATE POLICY consent_select ON customer_ai_consents FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY consent_insert ON customer_ai_consents FOR INSERT TO authenticated WITH CHECK (TRUE);
CREATE POLICY consent_update ON customer_ai_consents FOR UPDATE TO authenticated USING (current_user_has_permission('customers:update'));

-- 3) Sessions & Results (Staff users can manage sessions)
CREATE POLICY sessions_select ON ai_tryon_sessions FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY sessions_insert ON ai_tryon_sessions FOR INSERT TO authenticated WITH CHECK (TRUE);
CREATE POLICY sessions_update ON ai_tryon_sessions FOR UPDATE TO authenticated USING (TRUE);

CREATE POLICY results_select ON ai_tryon_results FOR SELECT TO authenticated USING (deleted_at IS NULL);
CREATE POLICY results_insert ON ai_tryon_results FOR INSERT TO authenticated WITH CHECK (TRUE);
CREATE POLICY results_update ON ai_tryon_results FOR UPDATE TO authenticated USING (deleted_at IS NULL);

-- 4) Provider settings & usage logging (Owner only)
CREATE POLICY provider_settings_select ON ai_provider_settings FOR SELECT TO authenticated USING (is_enabled = TRUE);
CREATE POLICY provider_settings_write ON ai_provider_settings FOR ALL TO authenticated USING (current_user_has_permission('system:backup')); -- Owner permission proxy

CREATE POLICY usage_logs_select ON ai_usage_logs FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY usage_logs_insert ON ai_usage_logs FOR INSERT TO authenticated WITH CHECK (TRUE);
