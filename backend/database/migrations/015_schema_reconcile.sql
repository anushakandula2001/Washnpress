-- 015: Reconcile support/commerce schema gaps for fresh clones and upgrades.
-- Idempotent: safe on DBs that already partially applied 005/010/orphan addon fields.

-- ── Addon catalog extended fields (was orphan under src/backend/database/migrations) ──
ALTER TABLE addon_services
  ADD COLUMN IF NOT EXISTS category VARCHAR(100) NOT NULL DEFAULT 'General',
  ADD COLUMN IF NOT EXISTS priority VARCHAR(20) NOT NULL DEFAULT 'Normal',
  ADD COLUMN IF NOT EXISTS display_order INTEGER NOT NULL DEFAULT 0;

-- ── Keep assignee column name aligned with application repositories ──
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'support_tickets'
      AND column_name = 'assigned_user_id'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'support_tickets'
      AND column_name = 'assigned_to_user_id'
  ) THEN
    ALTER TABLE support_tickets RENAME COLUMN assigned_user_id TO assigned_to_user_id;
  END IF;
END $$;

ALTER TABLE support_tickets
  ADD COLUMN IF NOT EXISTS assigned_to_user_id UUID REFERENCES users(id);

DROP INDEX IF EXISTS idx_support_tickets_assigned_user;
CREATE INDEX IF NOT EXISTS idx_support_tickets_assigned_to_user
  ON support_tickets(assigned_to_user_id);

-- ── Upgrade slim ticket_messages (005) to enterprise shape (010) ──
ALTER TABLE ticket_messages
  ADD COLUMN IF NOT EXISTS sender_name VARCHAR(120),
  ADD COLUMN IF NOT EXISTS sender_type VARCHAR(30) NOT NULL DEFAULT 'resident',
  ADD COLUMN IF NOT EXISTS channel VARCHAR(30) NOT NULL DEFAULT 'customer',
  ADD COLUMN IF NOT EXISTS message TEXT;

-- Backfill message from legacy body column when present
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'ticket_messages'
      AND column_name = 'body'
  ) THEN
    EXECUTE 'UPDATE ticket_messages SET message = body WHERE message IS NULL';
  END IF;
END $$;

-- Ensure message is populated for NOT NULL constraint path
UPDATE ticket_messages SET message = COALESCE(message, '') WHERE message IS NULL;

ALTER TABLE ticket_messages
  ALTER COLUMN message SET DEFAULT '',
  ALTER COLUMN message SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'ticket_messages_channel_check'
  ) THEN
    ALTER TABLE ticket_messages
      ADD CONSTRAINT ticket_messages_channel_check
      CHECK (channel IN ('customer', 'internal'));
  END IF;
END $$;

-- Keep body in sync for older repositories that still write body
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'ticket_messages'
      AND column_name = 'body'
  ) THEN
    EXECUTE 'UPDATE ticket_messages SET body = COALESCE(body, message, '''')';
  ELSE
    ALTER TABLE ticket_messages ADD COLUMN body TEXT;
    UPDATE ticket_messages SET body = COALESCE(message, '');
    ALTER TABLE ticket_messages ALTER COLUMN body SET DEFAULT '';
    ALTER TABLE ticket_messages ALTER COLUMN body SET NOT NULL;
  END IF;
END $$;

-- ── Ticket attachments extended fields from 010 ──
ALTER TABLE ticket_attachments
  ADD COLUMN IF NOT EXISTS message_id UUID REFERENCES ticket_messages(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS file_type VARCHAR(50);

-- ── Commerce analytics columns used by admin pricing analytics ──
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS total_inr NUMERIC(12,2) NOT NULL DEFAULT 0;

ALTER TABLE order_items
  ADD COLUMN IF NOT EXISTS garment_id UUID REFERENCES garment_catalog(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS order_applied_addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  addon_id UUID NOT NULL REFERENCES addon_services(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price_inr NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (order_id, addon_id)
);

CREATE INDEX IF NOT EXISTS idx_order_applied_addons_order ON order_applied_addons(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_garment ON order_items(garment_id);
CREATE INDEX IF NOT EXISTS idx_addon_services_display_order ON addon_services(display_order);
