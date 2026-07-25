-- 009: Society Master Setup Workflow (Buildings, Floors, Flats, Statuses)
-- Idempotent SQL script

-- 1. Modify CHECK constraint on societies.status to support Pending Setup, In Progress, Completed
DO $$
BEGIN
  ALTER TABLE societies DROP CONSTRAINT IF EXISTS societies_status_check;
  ALTER TABLE societies ADD CONSTRAINT societies_status_check
    CHECK (status IN ('active', 'coming_soon', 'inactive', 'Pending Setup', 'In Progress', 'Completed'));
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- 2. Create normalized buildings table
CREATE TABLE IF NOT EXISTS buildings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  society_id UUID NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (society_id, name)
);

-- 3. Create normalized floors table
CREATE TABLE IF NOT EXISTS floors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id UUID NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
  floor_number INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (building_id, floor_number)
);

-- 4. Create normalized flats table
CREATE TABLE IF NOT EXISTS flats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id UUID NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
  floor_id UUID NOT NULL REFERENCES floors(id) ON DELETE CASCADE,
  flat_number VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (floor_id, flat_number),
  CHECK (status IN ('active', 'inactive', 'occupied'))
);

CREATE INDEX IF NOT EXISTS idx_buildings_society ON buildings(society_id);
CREATE INDEX IF NOT EXISTS idx_floors_building ON floors(building_id);
CREATE INDEX IF NOT EXISTS idx_flats_building ON flats(building_id);
CREATE INDEX IF NOT EXISTS idx_flats_floor ON flats(floor_id);

-- 5. Add building_id column to society_towers or link compatibility if needed
ALTER TABLE residents ADD COLUMN IF NOT EXISTS building_id UUID REFERENCES buildings(id);
