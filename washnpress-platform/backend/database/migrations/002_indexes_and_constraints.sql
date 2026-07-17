BEGIN;

CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_residents_society ON residents(society_id);
CREATE INDEX idx_subscriptions_resident_status ON subscriptions(resident_id, status);
CREATE INDEX idx_pickup_slots_society_date_window ON pickup_slots(society_id, slot_date, slot_window);
CREATE INDEX idx_pickups_society_status_time ON pickups(society_id, status, scheduled_for);
CREATE INDEX idx_orders_status_created ON orders(status, created_at);
CREATE INDEX idx_orders_qr_batch_code ON orders(qr_batch_code);
CREATE INDEX idx_order_events_order_time ON order_events(order_id, created_at);
CREATE INDEX idx_water_logs_created ON water_logs(created_at);
CREATE INDEX idx_support_tickets_status_priority ON support_tickets(status, priority);
CREATE INDEX idx_support_tickets_order_id ON support_tickets(order_id);

ALTER TABLE orders
  ADD CONSTRAINT chk_order_delivery_count
  CHECK (delivered_garment_count IS NULL OR delivered_garment_count >= 0);

ALTER TABLE orders
  ADD CONSTRAINT chk_qc_reason_on_hold
  CHECK (status <> 'QC Hold' OR qc_reason IS NOT NULL);

COMMIT;
