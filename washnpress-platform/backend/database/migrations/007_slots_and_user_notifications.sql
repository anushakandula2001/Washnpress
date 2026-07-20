BEGIN;

-- Soft-disable slots without deleting history
ALTER TABLE pickup_slots
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;

CREATE INDEX IF NOT EXISTS idx_pickup_slots_active_date
  ON pickup_slots (society_id, slot_date, is_active)
  WHERE is_active = TRUE AND capacity_remaining > 0;

-- Operator / admin notifications (residents keep using notifications.resident_id)
CREATE TABLE IF NOT EXISTS user_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(150) NOT NULL,
  body TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  related_order_code VARCHAR(30),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_notifications_user_read
  ON user_notifications (user_id, is_read, created_at DESC);

COMMIT;
