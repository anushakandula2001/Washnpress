BEGIN;

-- Society geolocation + notify-me
ALTER TABLE societies ADD COLUMN IF NOT EXISTS latitude NUMERIC(10,7);
ALTER TABLE societies ADD COLUMN IF NOT EXISTS longitude NUMERIC(10,7);

CREATE TABLE IF NOT EXISTS society_notify_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  society_name VARCHAR(150) NOT NULL,
  phone VARCHAR(10) NOT NULL,
  city VARCHAR(100),
  pincode VARCHAR(10),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (phone ~ '^[6-9][0-9]{9}$')
);

-- Profile settings
CREATE TABLE IF NOT EXISTS profile_settings (
  resident_id UUID PRIMARY KEY REFERENCES residents(id) ON DELETE CASCADE,
  notifications_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  language VARCHAR(10) NOT NULL DEFAULT 'en',
  marketing_opt_in BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS account_deletion_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  reason TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (status IN ('pending', 'approved', 'rejected', 'completed'))
);

-- Support extensions
CREATE TABLE IF NOT EXISTS ticket_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  sender_user_id UUID REFERENCES users(id),
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ticket_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  file_name VARCHAR(200) NOT NULL,
  file_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Order extensions
CREATE TABLE IF NOT EXISTS order_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
  resident_id UUID NOT NULL REFERENCES residents(id),
  rating SMALLINT NOT NULL,
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (rating BETWEEN 1 AND 5)
);

CREATE TABLE IF NOT EXISTS order_disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id),
  resident_id UUID NOT NULL REFERENCES residents(id),
  reason TEXT NOT NULL,
  photo_url TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (status IN ('open', 'in_review', 'resolved', 'rejected'))
);

CREATE TABLE IF NOT EXISTS order_addon_selections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  addon_id UUID NOT NULL REFERENCES addon_services(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (order_id, addon_id)
);

ALTER TABLE pickups ADD COLUMN IF NOT EXISTS recurring_day VARCHAR(20);

-- Referrals
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resident_id UUID NOT NULL UNIQUE REFERENCES residents(id) ON DELETE CASCADE,
  code VARCHAR(20) NOT NULL UNIQUE,
  total_earned_inr NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS referral_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_id UUID NOT NULL REFERENCES referrals(id),
  referred_resident_id UUID NOT NULL REFERENCES residents(id),
  amount_inr NUMERIC(12,2) NOT NULL DEFAULT 100,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Payments
CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resident_id UUID NOT NULL REFERENCES residents(id),
  amount_inr NUMERIC(12,2) NOT NULL,
  type VARCHAR(30) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  gateway_ref VARCHAR(120),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (status IN ('pending', 'success', 'failed', 'refunded'))
);

-- Push tokens
CREATE TABLE IF NOT EXISTS push_notification_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  platform VARCHAR(20) NOT NULL DEFAULT 'web',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, token)
);

-- Operations
CREATE TABLE IF NOT EXISTS operators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  unit_id UUID REFERENCES units(id),
  mode VARCHAR(20) NOT NULL DEFAULT 'unit',
  masked_phone VARCHAR(15) NOT NULL DEFAULT '98XX-XXX-XX01',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (mode IN ('unit', 'route', 'hub'))
);

CREATE TABLE IF NOT EXISTS delivery_routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operator_user_id UUID NOT NULL REFERENCES users(id),
  route_date DATE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (status IN ('active', 'completed', 'cancelled'))
);

CREATE TABLE IF NOT EXISTS route_stops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id UUID NOT NULL REFERENCES delivery_routes(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES orders(id),
  stop_sequence INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (status IN ('pending', 'completed', 'skipped'))
);

CREATE TABLE IF NOT EXISTS operator_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operator_user_id UUID NOT NULL REFERENCES users(id),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  amount_inr NUMERIC(12,2) NOT NULL DEFAULT 0,
  orders_completed INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS offline_sync_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operator_user_id UUID NOT NULL REFERENCES users(id),
  payload JSONB NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ,
  CHECK (status IN ('pending', 'processed', 'failed'))
);

CREATE TABLE IF NOT EXISTS operator_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operator_user_id UUID NOT NULL REFERENCES users(id),
  order_id UUID REFERENCES orders(id),
  description TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Admin refunds
CREATE TABLE IF NOT EXISTS refunds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resident_id UUID NOT NULL REFERENCES residents(id),
  order_id UUID REFERENCES orders(id),
  amount_inr NUMERIC(12,2) NOT NULL,
  reason TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  approved_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (status IN ('pending', 'approved', 'rejected', 'processed'))
);

CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket ON ticket_messages(ticket_id, created_at);
CREATE INDEX IF NOT EXISTS idx_order_disputes_order ON order_disputes(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_resident ON payment_transactions(resident_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_route_stops_route ON route_stops(route_id, stop_sequence);
CREATE INDEX IF NOT EXISTS idx_refunds_status ON refunds(status, created_at DESC);

COMMIT;
