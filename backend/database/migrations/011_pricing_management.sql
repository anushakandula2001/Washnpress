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

-- 3. Seed Finance Admin Role (ID: 5, assuming 1=admin, 2=operator, 3=resident, 4=support)
-- Let's check max ID and insert
DO $$
DECLARE
  v_role_id SMALLINT;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM roles WHERE name = 'finance_admin') THEN
    SELECT COALESCE(MAX(id), 0) + 1 INTO v_role_id FROM roles;
    INSERT INTO roles (id, name) VALUES (v_role_id, 'finance_admin');
  END IF;
END $$;

COMMIT;
