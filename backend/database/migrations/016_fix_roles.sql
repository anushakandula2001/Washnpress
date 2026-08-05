-- 016: Repair core role IDs corrupted when finance_admin was inserted as id=1
-- before reference seed (resident/operator/admin) could claim ids 1–3.

-- Ensure canonical role names for fixed IDs
INSERT INTO roles (id, name) VALUES
  (1, 'resident'),
  (2, 'operator'),
  (3, 'admin'),
  (4, 'support'),
  (5, 'finance_admin')
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name;

-- If a legacy finance_admin row exists under another id, remove duplicates by name
DELETE FROM roles a
USING roles b
WHERE a.name = b.name
  AND a.id > b.id
  AND a.name IN ('resident', 'operator', 'admin', 'support', 'finance_admin');

-- Re-bind demo users to canonical roles by phone
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, 1 FROM users u WHERE u.phone = '9876543210'
ON CONFLICT DO NOTHING;

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, 2 FROM users u WHERE u.phone = '9876500002'
ON CONFLICT DO NOTHING;

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, 3 FROM users u WHERE u.phone = '9876500001'
ON CONFLICT DO NOTHING;

-- Drop incorrect finance_admin assignment from the demo resident if present
DELETE FROM user_roles ur
USING users u, roles r
WHERE ur.user_id = u.id
  AND ur.role_id = r.id
  AND u.phone = '9876543210'
  AND r.name = 'finance_admin';
