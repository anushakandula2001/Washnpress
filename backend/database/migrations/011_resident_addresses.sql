BEGIN;

CREATE TABLE IF NOT EXISTS resident_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resident_id UUID NOT NULL REFERENCES residents(id) ON DELETE CASCADE,
  label VARCHAR(80) NOT NULL,
  address_line TEXT NOT NULL,
  city VARCHAR(120) NOT NULL,
  state VARCHAR(120),
  pincode VARCHAR(12),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_resident_addresses_resident_id
  ON resident_addresses(resident_id);

COMMIT;
