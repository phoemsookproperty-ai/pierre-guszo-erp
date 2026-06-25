-- Seed Catalog Data for AI Virtual Try-On Studio

-- =========================================================================
-- 1. SEED SUIT STYLES
-- =========================================================================

INSERT INTO suit_styles (code, name_th, name_en, category, fit_type, button_style, lapel_style, pocket_style, vent_style, vest_style, prompt_template, negative_prompt_template)
VALUES
(
  'STYLE-SLIM-2P-NOTCH',
  'สูทกระดุมแถวเดียว 2 เม็ด ปก Notch (Slim Fit)',
  'Slim Fit Single-Breasted 2-Button Notch Lapel Suit',
  'Suit-2P', 'Slim Fit', 'Single-2', 'Notch', 'Flap', 'Double', 'None',
  'slim fit single-breasted jacket with two buttons, classic notch lapels, flap pockets, matching slim trousers, double rear vents',
  'baggy suit, loose trousers, double breasted, peak lapel'
),
(
  'STYLE-CLASSIC-2P-PEAK',
  'สูทกระดุมแถวเดียว 2 เม็ด ปก Peak (Classic Fit)',
  'Classic Fit Single-Breasted 2-Button Peak Lapel Suit',
  'Suit-2P', 'Classic Fit', 'Single-2', 'Peak', 'Flap', 'Double', 'None',
  'classic fit single-breasted jacket with two buttons, elegant peak lapels, flap pockets, matching classic trousers, double rear vents',
  'slim fit, tight suit, single breasted notch lapel, double breasted'
),
(
  'STYLE-DB-TUX-SHAWL',
  'ทักซิโด้กระดุมสองแถว 6 เม็ด ปก Shawl (Tailored Fit)',
  'Tailored Fit Double-Breasted 6-Button Shawl Tuxedo',
  'Tuxedo', 'Tailored Fit', 'Double-6', 'Shawl', 'Jetted', 'None', 'None',
  'tailored fit double-breasted tuxedo jacket with six satin-faced buttons, luxurious shawl collar, satin jetted pockets, matching trousers with satin side stripes, no rear vents',
  'notch lapel, flap pockets, casual suit, colorful suit, pinstripe'
),
(
  'STYLE-3P-EXEC-PEAK',
  'สูทสามชิ้นกระดุมแถวเดียว ปก Peak พร้อมเสื้อกั๊ก (Tailored Fit)',
  'Tailored Fit 3-Piece Executive Peak Lapel Suit',
  'Suit-3P', 'Tailored Fit', 'Single-2', 'Peak', 'Flap', 'Double', 'Single-Breasted',
  'tailored fit three-piece suit consisting of a single-breasted jacket with peak lapels, a matching single-breasted 5-button vest/waistcoat, flap pockets, ticket pocket, matching trousers, double rear vents',
  'tuxedo, casual, double breasted vest'
),
(
  'STYLE-BLAZER-PATCH',
  'เบลเซอร์ลำลองกระดุม 2 เม็ด กระเป๋าแปะ (Comfort Fit)',
  'Comfort Fit Casual Blazer with Patch Pockets',
  'Blazer', 'Comfort Fit', 'Single-2', 'Notch', 'Patch', 'Center', 'None',
  'comfort fit casual blazer jacket with two buttons, notch lapels, sporty patch pockets, center rear vent',
  'tuxedo, formal suit, matching trousers, double breasted'
);

-- =========================================================================
-- 2. SEED SUIT COLOR & PATTERNS (20 ITEMS)
-- =========================================================================

INSERT INTO suit_color_patterns (code, name_th, name_en, primary_hex, secondary_hex, pattern_type, pattern_scale, pattern_description, recommended_shirt, recommended_tie, display_order)
VALUES
(
  'SUIT-MIDNIGHT-NAVY',
  'กรมท่าเข้ม', 'Midnight Navy',
  '#101B33', NULL, 'Solid', 'medium',
  'กรมท่าเข้มคลาสสิก ให้ภาพลักษณ์สุขุมและเป็นทางการ',
  'White', 'Burgundy หรือ Silver', 1
),
(
  'SUIT-CLASSIC-NAVY',
  'กรมท่าคลาสสิก', 'Classic Navy',
  '#1D3155', NULL, 'Solid', 'medium',
  'เหมาะกับการทำงานและโอกาสทางธุรกิจทั่วไป',
  'White หรือ Light Blue', 'Navy, Red', 2
),
(
  'SUIT-ROYAL-BLUE',
  'น้ำเงินรอยัล', 'Royal Blue',
  '#254A84', NULL, 'Solid', 'medium',
  'สีสดขึ้นเล็กน้อย เหมาะกับงานแต่งและงานกลางวัน',
  'White', 'Navy หรือ Champagne', 3
),
(
  'SUIT-CHARCOAL-GREY',
  'เทาชาร์โคล', 'Charcoal Grey',
  '#3C3F45', NULL, 'Solid', 'medium',
  'สีเทาเข้มสำหรับผู้บริหารและงานทางการ',
  'White หรือ Pale Blue', 'Black, Burgundy', 4
),
(
  'SUIT-MEDIUM-GREY',
  'เทากลาง', 'Medium Grey',
  '#686B70', NULL, 'Solid', 'medium',
  'ใช้งานง่าย เหมาะกับทั้งงานกลางวันและกลางคืน',
  'White, Blue, Pink', 'Navy', 5
),
(
  'SUIT-LIGHT-GREY',
  'เทาอ่อน', 'Light Grey',
  '#A6A8AB', NULL, 'Solid', 'medium',
  'เหมาะกับอากาศร้อน งานกลางวัน และงานแต่ง',
  'White', 'Pastel Blue หรือ Pink', 6
),
(
  'SUIT-JET-BLACK',
  'ดำสนิท', 'Jet Black',
  '#111111', NULL, 'Solid', 'medium',
  'สีดำหรูสำหรับงานพิธี งานกลางคืน และงานเป็นทางการ',
  'White', 'Black', 7
),
(
  'SUIT-WARM-BEIGE',
  'เบจอุ่น', 'Warm Beige',
  '#B49A78', NULL, 'Solid', 'medium',
  'ให้ภาพลักษณ์อบอุ่น สบาย เหมาะกับงานกลางแจ้ง',
  'White หรือ Cream', 'Brown', 8
),
(
  'SUIT-SAND-CREAM',
  'ครีมทราย', 'Sand Cream',
  '#D0BFA3', NULL, 'Solid', 'medium',
  'สีอ่อนเหมาะกับงานริมทะเลและงานแต่งกลางวัน',
  'White', 'Champagne', 9
),
(
  'SUIT-CHOCOLATE-BROWN',
  'น้ำตาลช็อกโกแลต', 'Chocolate Brown',
  '#4C352D', NULL, 'Solid', 'medium',
  'โทนเข้มแบบวินเทจ เหมาะกับลุคหรูและอบอุ่น',
  'Cream', 'Dark Green หรือ Gold', 10
),
(
  'SUIT-OLIVE-GREEN',
  'เขียวโอลีฟ', 'Olive Green',
  '#4E5841', NULL, 'Solid', 'medium',
  'สีร่วมสมัย เหมาะกับงานกลางแจ้งและลุคไม่เป็นทางการมาก',
  'White หรือ Cream', 'Brown', 11
),
(
  'SUIT-DEEP-BURGUNDY',
  'เบอร์กันดีเข้ม', 'Deep Burgundy',
  '#572A32', NULL, 'Solid', 'medium',
  'สีเด่นหรู เหมาะกับงานกลางคืนและงานพิเศษ',
  'White หรือ Black', 'Black', 12
),
(
  'SUIT-NAVY-PINSTRIPE',
  'กรมท่าลายทางเล็ก', 'Navy Pinstripe',
  '#17243C', '#A7B0C0', 'Pinstripe', 'small',
  'ลายเส้นแนวตั้งช่วยให้รูปร่างดูสูงและเพรียว',
  'White', 'Burgundy', 13
),
(
  'SUIT-CHARCOAL-PINSTRIPE',
  'เทาชาร์โคลลายทาง', 'Charcoal Pinstripe',
  '#37393D', '#9DA0A4', 'Pinstripe', 'small',
  'ลายทางแบบผู้บริหาร เหมาะกับงานธุรกิจระดับสูง',
  'White', 'Black หรือ Silver', 14
),
(
  'SUIT-PRINCE-WALES-GREY',
  'เทาลายปรินซ์ออฟเวลส์', 'Prince of Wales Grey',
  '#777A7C', '#35383B', 'Check', 'medium',
  'ลายตารางอังกฤษ ให้ลุคคลาสสิกและมีรายละเอียด',
  'White หรือ Light Blue', 'Burgundy', 15
),
(
  'SUIT-NAVY-WINDOWPANE',
  'กรมท่าลายตารางใหญ่', 'Navy Windowpane',
  '#1B2B48', '#7183A0', 'Windowpane', 'large',
  'ลายตารางใหญ่ที่ดูทันสมัย เหมาะกับผู้ที่ต้องการความโดดเด่น',
  'White', 'Navy', 16
),
(
  'SUIT-GREY-WINDOWPANE',
  'เทาลายตารางใหญ่', 'Grey Windowpane',
  '#66696D', '#A8AAAD', 'Windowpane', 'large',
  'ลายชัดแต่ยังสุภาพ ใช้ได้ทั้งงานธุรกิจและงานสังคม',
  'White หรือ Pale Pink', 'Burgundy', 17
),
(
  'SUIT-BROWN-HERRINGBONE',
  'น้ำตาลลายก้างปลา', 'Brown Herringbone',
  '#604B3E', '#8A7464', 'Herringbone', 'small',
  'ลายก้างปลาสไตล์อังกฤษ ให้พื้นผิวและความรู้สึกวินเทจ',
  'Cream', 'Forest Green', 18
),
(
  'SUIT-CHARCOAL-HERRINGBONE',
  'เทาชาร์โคลลายก้างปลา', 'Charcoal Herringbone',
  '#44464A', '#66696E', 'Herringbone', 'small',
  'ลายละเอียด สุภาพ และดูมีมิติเมื่ออยู่ภายใต้แสง',
  'White', 'Navy', 19
),
(
  'SUIT-NAVY-BIRDSEYE',
  'กรมท่าลายเบิร์ดอาย', 'Navy Birdseye',
  '#24334B', '#53627B', 'Birdseye', 'small',
  'ลายจุดละเอียด เพิ่มมิติให้ผ้าโดยยังดูเรียบหรู',
  'White หรือ Light Blue', 'Burgundy หรือ Navy', 20
);

-- =========================================================================
-- 3. SEED PROVIDER SETTINGS
-- =========================================================================

INSERT INTO ai_provider_settings (provider, model_name, endpoint_url, is_enabled, priority, cost_per_generation, timeout_seconds, max_retries, configuration)
VALUES
(
  'Mock',
  'pierre-mock-tryon-v1',
  'local://mock-provider',
  TRUE,
  1,
  0.0000,
  15,
  1,
  '{}'::jsonb
),
(
  'Fal',
  'fal-ai/foduu/idm-vton',
  'https://queue.fal.run/fal-ai/foduu/idm-vton',
  TRUE,
  2,
  0.0150,
  60,
  3,
  '{"api_key_env": "FAL_API_KEY"}'::jsonb
),
(
  'Fashn',
  'fashn-v1',
  'https://api.fashn.ai/v1/run',
  TRUE,
  3,
  0.0500,
  120,
  3,
  '{"api_key_env": "FASHN_API_KEY"}'::jsonb
),
(
  'Replicate',
  'da77198e0e935a4d6b63...',
  'https://api.replicate.com/v1/predictions',
  TRUE,
  4,
  0.0250,
  120,
  3,
  '{"api_key_env": "REPLICATE_API_TOKEN"}'::jsonb
);
