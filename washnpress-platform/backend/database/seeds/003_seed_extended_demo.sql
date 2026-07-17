BEGIN;

-- Wallet for demo resident
INSERT INTO wallets (resident_id, balance_inr)
SELECT r.id, 1250.00
FROM residents r
JOIN users u ON u.id = r.user_id
WHERE u.phone = '9876543210'
ON CONFLICT (resident_id) DO NOTHING;

INSERT INTO wallet_transactions (wallet_id, type, description, amount_inr)
SELECT w.id, 'credit', 'Added to Wallet', 500.00
FROM wallets w
JOIN residents r ON r.id = w.resident_id
JOIN users u ON u.id = r.user_id
WHERE u.phone = '9876543210'
ON CONFLICT DO NOTHING;

INSERT INTO wallet_transactions (wallet_id, type, description, amount_inr)
SELECT w.id, 'debit', 'Payment - Order #WNP12330', 150.00
FROM wallets w
JOIN residents r ON r.id = w.resident_id
JOIN users u ON u.id = r.user_id
WHERE u.phone = '9876543210'
ON CONFLICT DO NOTHING;

INSERT INTO wallet_transactions (wallet_id, type, description, amount_inr)
SELECT w.id, 'credit', 'Referral Bonus', 100.00
FROM wallets w
JOIN residents r ON r.id = w.resident_id
JOIN users u ON u.id = r.user_id
WHERE u.phone = '9876543210'
ON CONFLICT DO NOTHING;

-- Payment method
INSERT INTO payment_methods (resident_id, brand, last4, expiry_month, expiry_year, is_default)
SELECT r.id, 'Visa', '3245', 12, 2028, TRUE
FROM residents r
JOIN users u ON u.id = r.user_id
WHERE u.phone = '9876543210'
ON CONFLICT DO NOTHING;

-- Billing invoices
INSERT INTO billing_invoices (resident_id, subscription_id, invoice_code, billing_month, billed_on, amount_inr, status)
SELECT r.id, s.id, 'INV-2026-07', 'July 2026', '2026-06-28', 2199.00, 'paid'
FROM residents r
JOIN users u ON u.id = r.user_id
JOIN subscriptions s ON s.resident_id = r.id AND s.status = 'active'
WHERE u.phone = '9876543210'
ON CONFLICT (invoice_code) DO NOTHING;

INSERT INTO billing_invoices (resident_id, subscription_id, invoice_code, billing_month, billed_on, amount_inr, status)
SELECT r.id, s.id, 'INV-2026-06', 'June 2026', '2026-05-28', 2199.00, 'paid'
FROM residents r
JOIN users u ON u.id = r.user_id
JOIN subscriptions s ON s.resident_id = r.id
WHERE u.phone = '9876543210'
ON CONFLICT (invoice_code) DO NOTHING;

INSERT INTO billing_invoices (resident_id, subscription_id, invoice_code, billing_month, billed_on, amount_inr, status)
SELECT r.id, s.id, 'INV-2026-05', 'May 2026', '2026-04-28', 2199.00, 'paid'
FROM residents r
JOIN users u ON u.id = r.user_id
JOIN subscriptions s ON s.resident_id = r.id
WHERE u.phone = '9876543210'
ON CONFLICT (invoice_code) DO NOTHING;

-- Addon services
INSERT INTO addon_services (code, name, description, price_inr, icon) VALUES
  ('dry-cleaning', 'Dry Cleaning', 'Premium dry clean for suits & sarees', 80, 'shirt'),
  ('shoe-cleaning', 'Shoe Cleaning', 'Deep clean for leather & canvas shoes', 150, 'footprints'),
  ('stain-treatment', 'Stain Treatment', 'Targeted stain removal treatment', 50, 'sparkles'),
  ('express-delivery', 'Express Delivery', 'Same-day delivery within 12 hours', 199, 'zap'),
  ('fabric-softener', 'Fabric Softener', 'Premium softener for all garments', 30, 'droplets')
ON CONFLICT (code) DO NOTHING;

-- Notifications
INSERT INTO notifications (resident_id, title, body, is_read)
SELECT r.id, 'Pickup Tomorrow', 'Your pickup is scheduled for tomorrow 10:00 AM – 12:00 PM', FALSE
FROM residents r JOIN users u ON u.id = r.user_id WHERE u.phone = '9876543210';

INSERT INTO notifications (resident_id, title, body, is_read)
SELECT r.id, 'Order In Progress', 'Order #WNP-10021 is now in wash', FALSE
FROM residents r JOIN users u ON u.id = r.user_id WHERE u.phone = '9876543210';

INSERT INTO notifications (resident_id, title, body, is_read)
SELECT r.id, 'Wallet Credit', '₹100 referral bonus added to your wallet', TRUE
FROM residents r JOIN users u ON u.id = r.user_id WHERE u.phone = '9876543210';

-- Additional societies
INSERT INTO societies (name, address_line_1, city, state, pincode, status) VALUES
  ('Green Meadows Apartments', '12 Lotus Avenue, Sector 45', 'Gurugram', 'Haryana', '122001', 'active'),
  ('Orchid Heights', '88 Orchid Road, Whitefield', 'Bengaluru', 'Karnataka', '560066', 'active'),
  ('Lotus Enclave', '22 Lake View Road', 'Noida', 'Uttar Pradesh', '201301', 'active')
ON CONFLICT DO NOTHING;

-- More pickup slots for Green Heights
INSERT INTO pickup_slots (society_id, slot_date, slot_window, start_time, end_time, capacity_total, capacity_remaining)
SELECT s.id, CURRENT_DATE + INTERVAL '1 day', 'Evening', '18:00', '20:00', 15, 12
FROM societies s WHERE s.name = 'Green Heights';

INSERT INTO pickup_slots (society_id, slot_date, slot_window, start_time, end_time, capacity_total, capacity_remaining)
SELECT s.id, CURRENT_DATE + INTERVAL '2 days', 'Morning', '10:00', '12:00', 20, 20
FROM societies s WHERE s.name = 'Green Heights';

COMMIT;
