BEGIN;

ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_status_check
  CHECK (status IN (
    'Scheduled',
    'Picked Up',
    'In Wash',
    'Dry',
    'Iron',
    'QC Hold',
    'Out for Delivery',
    'Delivered',
    'Cancelled',
    'cancelled'
  ));

COMMIT;
