BEGIN;

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id UUID REFERENCES users(id),
  actor_role VARCHAR(50),
  action VARCHAR(120) NOT NULL,
  entity_name VARCHAR(120) NOT NULL,
  entity_id UUID,
  before_state JSONB,
  after_state JSONB,
  ip_address INET,
  user_agent TEXT,
  request_id VARCHAR(80),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_name, entity_id);
CREATE INDEX idx_audit_logs_actor_time ON audit_logs(actor_user_id, created_at);
CREATE INDEX idx_audit_logs_action_time ON audit_logs(action, created_at);

COMMIT;
