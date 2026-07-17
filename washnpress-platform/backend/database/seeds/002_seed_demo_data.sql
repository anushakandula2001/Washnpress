BEGIN;

WITH s AS (
  INSERT INTO societies (name, address_line_1, city, state, pincode, status)
  VALUES ('Green Heights', 'Sector 45', 'Gurugram', 'Haryana', '122003', 'active')
  RETURNING id
),
u_admin AS (
  INSERT INTO users (phone, full_name, status)
  VALUES ('9876500001', 'Platform Admin', 'active')
  RETURNING id
),
u_operator AS (
  INSERT INTO users (phone, full_name, status)
  VALUES ('9876500002', 'Unit Operator', 'active')
  RETURNING id
),
u_resident AS (
  INSERT INTO users (phone, full_name, status)
  VALUES ('9876543210', 'Asha Nair', 'active')
  RETURNING id
),
r AS (
  INSERT INTO residents (user_id, society_id, unit_number, tower_block, alternate_contact, preferred_windows)
  SELECT u_resident.id, s.id, 'B-805', 'B', '9876500009', ARRAY['Morning']::TEXT[]
  FROM u_resident, s
  RETURNING id, society_id
),
unit_insert AS (
  INSERT INTO units (society_id, unit_code, equipment_model, water_recycling_enabled, base_draw_inr, revenue_share_percent, status)
  SELECT s.id, 'GH-UNIT-01', 'EcoWash X2', TRUE, 18000, 12, 'active'
  FROM s
  RETURNING id
),
slot_insert AS (
  INSERT INTO pickup_slots (society_id, slot_date, slot_window, start_time, end_time, capacity_total, capacity_remaining)
  SELECT s.id, CURRENT_DATE + INTERVAL '1 day', 'Morning', '09:00', '11:00', 20, 18
  FROM s
  RETURNING id
),
sub_insert AS (
  INSERT INTO subscriptions (resident_id, plan_id, status, cycle_start, cycle_end, garments_used, auto_renew)
  SELECT r.id, p.id, 'active', CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', 18, TRUE
  FROM r, plans p
  WHERE p.tier = 'Standard'
  RETURNING id
),
pickup_insert AS (
  INSERT INTO pickups (resident_id, society_id, pickup_slot_id, scheduled_for, status, recurring, special_instructions)
  SELECT r.id, r.society_id, slot_insert.id, now() + INTERVAL '1 day', 'scheduled', FALSE, 'Handle delicate fabrics separately.'
  FROM r, slot_insert
  RETURNING id
),
order_insert AS (
  INSERT INTO orders (pickup_id, order_code, status, qr_batch_code, pickup_garment_count)
  SELECT pickup_insert.id, 'WNP-10021', 'In Wash', 'QR-WNP-10021', 18
  FROM pickup_insert
  RETURNING id
)
INSERT INTO water_logs (order_id, garment_count, actual_liters_used, baseline_liters_per_garment)
SELECT order_insert.id, 18, 112, 8
FROM order_insert;

INSERT INTO user_roles (user_id, role_id)
SELECT id, 3 FROM users WHERE phone = '9876500001'
ON CONFLICT DO NOTHING;

INSERT INTO user_roles (user_id, role_id)
SELECT id, 2 FROM users WHERE phone = '9876500002'
ON CONFLICT DO NOTHING;

INSERT INTO user_roles (user_id, role_id)
SELECT id, 1 FROM users WHERE phone = '9876543210'
ON CONFLICT DO NOTHING;

COMMIT;
