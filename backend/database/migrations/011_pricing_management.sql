BEGIN;

-- 1. Support Soft Deletes in Catalogs
ALTER TABLE garment_catalog ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE addon_services ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT FALSE;

-- 2. Audit Trail Table for Pricing Changes
CREATE TABLE IF NOT EXISTS pricing_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module VARCHAR(50) NOT NULL, -- garment, addon, delivery, tax, plan
  item_name VARCHAR(150) NOT NULL,
  previous_value_json JSONB,
  new_value_json JSONB,
  remarks TEXT,
  updated_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indices for efficient filtering
CREATE INDEX IF NOT EXISTS idx_pricing_history_module ON pricing_history(module);
CREATE INDEX IF NOT EXISTS idx_pricing_history_created_at ON pricing_history(created_at DESC);

-- 3. Seed Finance Admin Role (fixed id 5; core roles 1–3 are seeded later)
INSERT INTO roles (id, name)
VALUES (5, 'finance_admin')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name
WHERE roles.name IS DISTINCT FROM EXCLUDED.name;

INSERT INTO roles (id, name)
VALUES (4, 'support')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name
WHERE roles.name IS DISTINCT FROM EXCLUDED.name;

COMMIT;
