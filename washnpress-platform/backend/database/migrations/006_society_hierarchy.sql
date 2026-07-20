-- 006: Society hierarchy (Tower → Floor → Flat), operator↔society, resident flat reference
-- Idempotent: safe to run on existing databases

ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS gender VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS date_of_birth DATE;

CREATE TABLE IF NOT EXISTS society_towers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  society_id UUID NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
  name VARCHAR(80) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (society_id, name),
  CHECK (status IN ('active', 'inactive'))
);

CREATE TABLE IF NOT EXISTS society_floors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tower_id UUID NOT NULL REFERENCES society_towers(id) ON DELETE CASCADE,
  floor_number INTEGER NOT NULL,
  label VARCHAR(40) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tower_id, floor_number),
  CHECK (status IN ('active', 'inactive'))
);

CREATE TABLE IF NOT EXISTS society_flats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  floor_id UUID NOT NULL REFERENCES society_floors(id) ON DELETE CASCADE,
  flat_number VARCHAR(30) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (floor_id, flat_number),
  CHECK (status IN ('active', 'inactive', 'occupied'))
);

CREATE INDEX IF NOT EXISTS idx_society_towers_society ON society_towers(society_id);
CREATE INDEX IF NOT EXISTS idx_society_floors_tower ON society_floors(tower_id);
CREATE INDEX IF NOT EXISTS idx_society_flats_floor ON society_flats(floor_id);

ALTER TABLE residents ADD COLUMN IF NOT EXISTS flat_id UUID REFERENCES society_flats(id);
ALTER TABLE residents ADD COLUMN IF NOT EXISTS resident_code VARCHAR(30);
ALTER TABLE residents ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE residents ADD COLUMN IF NOT EXISTS gender VARCHAR(20);
ALTER TABLE residents ADD COLUMN IF NOT EXISTS date_of_birth DATE;

CREATE UNIQUE INDEX IF NOT EXISTS idx_residents_resident_code
  ON residents(resident_code) WHERE resident_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_residents_flat ON residents(flat_id);

ALTER TABLE operators ADD COLUMN IF NOT EXISTS operator_code VARCHAR(30);
ALTER TABLE operators ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE operators ADD COLUMN IF NOT EXISTS gender VARCHAR(20);
ALTER TABLE operators ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE operators ADD COLUMN IF NOT EXISTS address_line_1 TEXT;
ALTER TABLE operators ADD COLUMN IF NOT EXISTS address_line_2 TEXT;
ALTER TABLE operators ADD COLUMN IF NOT EXISTS city VARCHAR(80);
ALTER TABLE operators ADD COLUMN IF NOT EXISTS state VARCHAR(80);
ALTER TABLE operators ADD COLUMN IF NOT EXISTS pincode VARCHAR(10);
ALTER TABLE operators ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';
ALTER TABLE operators ADD COLUMN IF NOT EXISTS joined_at DATE DEFAULT CURRENT_DATE;

CREATE UNIQUE INDEX IF NOT EXISTS idx_operators_operator_code
  ON operators(operator_code) WHERE operator_code IS NOT NULL;

CREATE TABLE IF NOT EXISTS operator_societies (
  operator_id UUID NOT NULL REFERENCES operators(id) ON DELETE CASCADE,
  society_id UUID NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (operator_id, society_id)
);

CREATE TABLE IF NOT EXISTS service_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  society_id UUID NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
  name VARCHAR(120) NOT NULL,
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (society_id, name),
  CHECK (status IN ('active', 'inactive'))
);

CREATE TABLE IF NOT EXISTS executive_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  society_id UUID NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
  executive_user_id UUID REFERENCES users(id),
  full_name VARCHAR(120) NOT NULL,
  phone VARCHAR(10) NOT NULL,
  service_area_id UUID REFERENCES service_areas(id),
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (phone ~ '^[6-9][0-9]{9}$'),
  CHECK (status IN ('active', 'inactive'))
);

CREATE SEQUENCE IF NOT EXISTS resident_code_seq START 100;
CREATE SEQUENCE IF NOT EXISTS operator_code_seq START 1;
