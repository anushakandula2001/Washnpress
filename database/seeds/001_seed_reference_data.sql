BEGIN;

INSERT INTO roles (id, name) VALUES
  (1, 'resident'),
  (2, 'operator'),
  (3, 'admin')
ON CONFLICT (id) DO NOTHING;

INSERT INTO plans (tier, garment_cap, turnaround_hours, monthly_inr, annual_discount_percent)
VALUES
  ('Basic', 35, 48, 1499, 10),
  ('Standard', 60, 36, 2199, 12),
  ('Premium', 90, 24, 2999, 15),
  ('Family Pack', 160, 24, 4599, 18)
ON CONFLICT (tier) DO NOTHING;

COMMIT;
