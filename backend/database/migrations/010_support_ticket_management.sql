-- 010: Enterprise Support Ticket Management Module (Help Desk, SLA Rules, Threads, History)
-- Idempotent SQL script

-- 1. Create ticket_categories table
CREATE TABLE IF NOT EXISTS ticket_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(60) NOT NULL UNIQUE,
  assigned_team VARCHAR(50) NOT NULL,
  default_priority VARCHAR(20) NOT NULL DEFAULT 'Medium',
  first_response_sla_minutes INTEGER NOT NULL DEFAULT 30,
  resolution_sla_minutes INTEGER NOT NULL DEFAULT 1440,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Expand/Create support_tickets table
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_code VARCHAR(40) NOT NULL UNIQUE,
  resident_id UUID REFERENCES residents(id) ON DELETE SET NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  society_id UUID REFERENCES societies(id) ON DELETE SET NULL,
  category VARCHAR(60) NOT NULL,
  priority VARCHAR(20) NOT NULL DEFAULT 'Medium',
  status VARCHAR(30) NOT NULL DEFAULT 'Open',
  assigned_team VARCHAR(50) NOT NULL DEFAULT 'Customer Support',
  assigned_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  sla_first_response_due_at TIMESTAMPTZ,
  sla_resolution_due_at TIMESTAMPTZ,
  sla_first_responded_at TIMESTAMPTZ,
  sla_resolved_at TIMESTAMPTZ,
  sla_breached BOOLEAN NOT NULL DEFAULT FALSE,
  csat_rating INTEGER CHECK (csat_rating IS NULL OR (csat_rating >= 1 AND csat_rating <= 5)),
  csat_feedback TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
  CHECK (status IN ('Open', 'Assigned', 'In Progress', 'Waiting for Resident', 'Escalated', 'Resolved', 'Closed', 'Rejected'))
);

-- 3. Create ticket_messages table (Public vs Internal channels)
CREATE TABLE IF NOT EXISTS ticket_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  sender_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  sender_name VARCHAR(120),
  sender_type VARCHAR(30) NOT NULL DEFAULT 'resident', -- resident, support, operations, manager, system
  channel VARCHAR(30) NOT NULL DEFAULT 'customer', -- customer, internal
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (channel IN ('customer', 'internal'))
);

-- 4. Create ticket_attachments table
CREATE TABLE IF NOT EXISTS ticket_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  message_id UUID REFERENCES ticket_messages(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(50),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Create ticket_notes table (Internal staff notes)
CREATE TABLE IF NOT EXISTS ticket_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  author_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  author_name VARCHAR(120),
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Create ticket_history table (Audit trail)
CREATE TABLE IF NOT EXISTS ticket_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  actor_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  actor_name VARCHAR(120),
  action VARCHAR(80) NOT NULL,
  changes JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for high performance
CREATE INDEX IF NOT EXISTS idx_support_tickets_resident ON support_tickets(resident_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_society ON support_tickets(society_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_assigned_user ON support_tickets(assigned_user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_priority ON support_tickets(priority);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket ON ticket_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_attachments_ticket ON ticket_attachments(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_history_ticket ON ticket_history(ticket_id);
