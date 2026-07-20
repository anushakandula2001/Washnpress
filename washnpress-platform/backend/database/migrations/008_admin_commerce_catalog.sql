BEGIN;

-- Garment catalog (admin-managed; residents consume for pickup)
CREATE TABLE IF NOT EXISTS garment_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  wash_price_inr NUMERIC(12,2) NOT NULL DEFAULT 0,
  wash_iron_price_inr NUMERIC(12,2) NOT NULL DEFAULT 0,
  iron_price_inr NUMERIC(12,2) NOT NULL DEFAULT 0,
  dry_clean_price_inr NUMERIC(12,2) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (wash_price_inr >= 0),
  CHECK (wash_iron_price_inr >= 0),
  CHECK (iron_price_inr >= 0),
  CHECK (dry_clean_price_inr >= 0)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_garment_catalog_name_lower
  ON garment_catalog (lower(trim(name)));

-- Delivery + tax platform settings (single-row config)
CREATE TABLE IF NOT EXISTS platform_commerce_settings (
  id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  min_order_amount_inr NUMERIC(12,2) NOT NULL DEFAULT 0,
  delivery_fee_inr NUMERIC(12,2) NOT NULL DEFAULT 0,
  free_delivery_threshold_inr NUMERIC(12,2) NOT NULL DEFAULT 0,
  gst_percent NUMERIC(5,2) NOT NULL DEFAULT 5,
  service_tax_percent NUMERIC(5,2) NOT NULL DEFAULT 0,
  other_charges_label VARCHAR(80) NOT NULL DEFAULT 'Other',
  other_charges_inr NUMERIC(12,2) NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (min_order_amount_inr >= 0),
  CHECK (delivery_fee_inr >= 0),
  CHECK (free_delivery_threshold_inr >= 0),
  CHECK (gst_percent >= 0),
  CHECK (service_tax_percent >= 0),
  CHECK (other_charges_inr >= 0)
);

INSERT INTO platform_commerce_settings (id) VALUES (1)
ON CONFLICT (id) DO NOTHING;

-- Extend subscription plans
ALTER TABLE plans ADD COLUMN IF NOT EXISTS name VARCHAR(100);
ALTER TABLE plans ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS quarterly_inr NUMERIC(12,2);
ALTER TABLE plans ADD COLUMN IF NOT EXISTS yearly_inr NUMERIC(12,2);
ALTER TABLE plans ADD COLUMN IF NOT EXISTS max_pickups INTEGER;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS priority_pickup BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS free_delivery BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS express_discount_percent NUMERIC(5,2) NOT NULL DEFAULT 0;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS validity_days INTEGER NOT NULL DEFAULT 30;

UPDATE plans SET name = COALESCE(NULLIF(name, ''), tier) WHERE name IS NULL;
UPDATE plans SET quarterly_inr = COALESCE(quarterly_inr, monthly_inr * 3 * 0.95)
  WHERE quarterly_inr IS NULL;
UPDATE plans SET yearly_inr = COALESCE(
  yearly_inr,
  monthly_inr * 12 * (1 - COALESCE(annual_discount_percent, 0) / 100)
) WHERE yearly_inr IS NULL;
UPDATE plans SET max_pickups = COALESCE(max_pickups, GREATEST(4, garment_cap / 5))
  WHERE max_pickups IS NULL;

-- System / business settings (key-value)
CREATE TABLE IF NOT EXISTS platform_settings (
  key VARCHAR(80) PRIMARY KEY,
  value_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO platform_settings (key, value_json) VALUES
  ('working_hours', '{"mon":"09:00-20:00","tue":"09:00-20:00","wed":"09:00-20:00","thu":"09:00-20:00","fri":"09:00-20:00","sat":"09:00-18:00","sun":"closed"}'::jsonb),
  ('holiday_calendar', '[]'::jsonb),
  ('otp', '{"ttlSeconds":300,"maxAttempts":5}'::jsonb),
  ('notifications', '{"emailEnabled":false,"smsEnabled":true,"pushEnabled":true}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Admin broadcast notifications (fan-out to resident/user notifications)
CREATE TABLE IF NOT EXISTS admin_broadcasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(150) NOT NULL,
  body TEXT NOT NULL,
  type VARCHAR(30) NOT NULL DEFAULT 'system',
  audience VARCHAR(30) NOT NULL,
  society_id UUID REFERENCES societies(id),
  resident_id UUID REFERENCES residents(id),
  operator_user_id UUID REFERENCES users(id),
  status VARCHAR(20) NOT NULL DEFAULT 'sent',
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (type IN ('system','maintenance','offer','subscription','order','emergency')),
  CHECK (audience IN ('all_residents','society','operator','resident')),
  CHECK (status IN ('draft','sent','failed'))
);

ALTER TABLE notifications ADD COLUMN IF NOT EXISTS type VARCHAR(30) DEFAULT 'system';
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS broadcast_id UUID REFERENCES admin_broadcasts(id);

ALTER TABLE user_notifications ADD COLUMN IF NOT EXISTS type VARCHAR(30) DEFAULT 'system';
ALTER TABLE user_notifications ADD COLUMN IF NOT EXISTS broadcast_id UUID REFERENCES admin_broadcasts(id);

-- Seed default garments if empty
INSERT INTO garment_catalog (name, wash_price_inr, wash_iron_price_inr, iron_price_inr, dry_clean_price_inr, sort_order)
SELECT v.name, v.wash, v.wi, v.iron, v.dc, v.ord
FROM (VALUES
  ('Shirt', 40, 60, 25, 80, 1),
  ('T-Shirt', 35, 50, 20, 70, 2),
  ('Trousers', 50, 70, 30, 90, 3),
  ('Jeans', 60, 80, 35, 110, 4),
  ('Kurta', 55, 75, 30, 100, 5),
  ('Saree', 90, 120, 50, 180, 6),
  ('Bedsheet', 70, 90, 40, 130, 7)
) AS v(name, wash, wi, iron, dc, ord)
WHERE NOT EXISTS (SELECT 1 FROM garment_catalog LIMIT 1);

-- Seed common addons if missing
INSERT INTO addon_services (code, name, description, price_inr, icon, is_active)
VALUES
  ('steam_iron', 'Steam Iron', 'Professional steam iron finish', 49, 'shirt', TRUE),
  ('shoe_cleaning', 'Shoe Cleaning', 'Deep clean for footwear', 149, 'sparkles', TRUE),
  ('dry_cleaning', 'Dry Cleaning', 'Premium dry cleaning', 199, 'sparkles', TRUE),
  ('express_delivery', 'Express Delivery', 'Same-day or next-slot delivery', 99, 'truck', TRUE),
  ('stain_removal', 'Stain Removal', 'Targeted stain treatment', 79, 'sparkles', TRUE)
ON CONFLICT (code) DO NOTHING;

COMMIT;
