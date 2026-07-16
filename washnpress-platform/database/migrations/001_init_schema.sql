BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE roles (
  id SMALLINT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(10) NOT NULL UNIQUE,
  full_name VARCHAR(120),
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (status IN ('active', 'blocked', 'deleted')),
  CHECK (phone ~ '^[6-9][0-9]{9}$')
);

CREATE TABLE user_roles (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id SMALLINT NOT NULL REFERENCES roles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, role_id)
);

CREATE TABLE societies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(150) NOT NULL,
  address_line_1 VARCHAR(200),
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  pincode VARCHAR(10),
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (status IN ('active', 'coming_soon', 'inactive'))
);

CREATE TABLE units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  society_id UUID NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
  unit_code VARCHAR(50) NOT NULL,
  equipment_model VARCHAR(120),
  water_recycling_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  base_draw_inr NUMERIC(12,2) NOT NULL DEFAULT 0,
  revenue_share_percent NUMERIC(5,2) NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (society_id, unit_code),
  CHECK (status IN ('active', 'inactive'))
);

CREATE TABLE residents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  society_id UUID NOT NULL REFERENCES societies(id),
  unit_number VARCHAR(30) NOT NULL,
  tower_block VARCHAR(30),
  alternate_contact VARCHAR(10),
  preferred_windows TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (alternate_contact IS NULL OR alternate_contact ~ '^[6-9][0-9]{9}$')
);

CREATE TABLE plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier VARCHAR(30) NOT NULL UNIQUE,
  garment_cap INTEGER NOT NULL,
  turnaround_hours INTEGER NOT NULL,
  monthly_inr NUMERIC(12,2) NOT NULL,
  annual_discount_percent NUMERIC(5,2) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (garment_cap > 0),
  CHECK (turnaround_hours > 0)
);

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resident_id UUID NOT NULL REFERENCES residents(id),
  plan_id UUID NOT NULL REFERENCES plans(id),
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  cycle_start DATE NOT NULL,
  cycle_end DATE NOT NULL,
  garments_used INTEGER NOT NULL DEFAULT 0,
  auto_renew BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (status IN ('active', 'paused', 'cancelled', 'expired')),
  CHECK (cycle_end > cycle_start),
  CHECK (garments_used >= 0)
);

CREATE TABLE pickup_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  society_id UUID NOT NULL REFERENCES societies(id),
  slot_date DATE NOT NULL,
  window VARCHAR(20) NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  capacity_total INTEGER NOT NULL,
  capacity_remaining INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (window IN ('Morning', 'Afternoon', 'Evening')),
  CHECK (capacity_total >= 0),
  CHECK (capacity_remaining >= 0),
  CHECK (capacity_remaining <= capacity_total)
);

CREATE TABLE pickups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resident_id UUID NOT NULL REFERENCES residents(id),
  society_id UUID NOT NULL REFERENCES societies(id),
  pickup_slot_id UUID REFERENCES pickup_slots(id),
  scheduled_for TIMESTAMPTZ NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'scheduled',
  recurring BOOLEAN NOT NULL DEFAULT FALSE,
  special_instructions TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (status IN ('scheduled', 'rescheduled', 'cancelled', 'completed'))
);

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pickup_id UUID NOT NULL UNIQUE REFERENCES pickups(id),
  order_code VARCHAR(30) NOT NULL UNIQUE,
  status VARCHAR(30) NOT NULL DEFAULT 'Scheduled',
  qr_batch_code VARCHAR(80),
  pickup_garment_count INTEGER NOT NULL DEFAULT 0,
  delivered_garment_count INTEGER,
  qc_status VARCHAR(20),
  qc_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (status IN ('Scheduled', 'Picked Up', 'In Wash', 'Dry', 'Iron', 'QC Hold', 'Out for Delivery', 'Delivered')),
  CHECK (pickup_garment_count >= 0)
);

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  category VARCHAR(60) NOT NULL,
  quantity INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (quantity >= 0)
);

CREATE TABLE order_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  event_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  actor_user_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE water_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
  garment_count INTEGER NOT NULL,
  actual_liters_used NUMERIC(12,2) NOT NULL,
  baseline_liters_per_garment NUMERIC(12,2) NOT NULL DEFAULT 8,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (garment_count >= 0),
  CHECK (actual_liters_used >= 0),
  CHECK (baseline_liters_per_garment > 0)
);

CREATE TABLE support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_code VARCHAR(30) NOT NULL UNIQUE,
  order_id UUID REFERENCES orders(id),
  resident_id UUID REFERENCES residents(id),
  category VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'open',
  priority VARCHAR(20) NOT NULL DEFAULT 'medium',
  assigned_to_user_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  CHECK (priority IN ('low', 'medium', 'high', 'critical'))
);

COMMIT;
