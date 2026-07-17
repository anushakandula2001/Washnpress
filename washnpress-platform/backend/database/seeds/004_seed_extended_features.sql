BEGIN;

UPDATE societies SET latitude = 28.4595, longitude = 77.0266 WHERE name = 'Green Heights';
UPDATE societies SET latitude = 28.4612, longitude = 77.0280 WHERE name = 'Green Meadows Apartments';
UPDATE societies SET latitude = 12.9698, longitude = 77.7500 WHERE name = 'Orchid Heights';
UPDATE societies SET latitude = 28.5355, longitude = 77.3910 WHERE name = 'Lotus Enclave';

INSERT INTO operators (user_id, mode, masked_phone)
SELECT u.id, 'unit', '98XX-XXX-XX02'
FROM users u WHERE u.phone = '9876500002'
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO referrals (resident_id, code, total_earned_inr)
SELECT r.id, 'ASHA100', 100.00
FROM residents r
JOIN users u ON u.id = r.user_id
WHERE u.phone = '9876543210'
ON CONFLICT DO NOTHING;

INSERT INTO profile_settings (resident_id)
SELECT r.id FROM residents r
JOIN users u ON u.id = r.user_id
WHERE u.phone = '9876543210'
ON CONFLICT DO NOTHING;

INSERT INTO operator_earnings (operator_user_id, period_start, period_end, amount_inr, orders_completed)
SELECT u.id, date_trunc('month', CURRENT_DATE)::date, (date_trunc('month', CURRENT_DATE) + INTERVAL '1 month - 1 day')::date, 12500, 42
FROM users u WHERE u.phone = '9876500002'
ON CONFLICT DO NOTHING;

COMMIT;
