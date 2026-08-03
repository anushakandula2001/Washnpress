BEGIN;

-- Extend platform_commerce_settings with detailed delivery charges
ALTER TABLE platform_commerce_settings ADD COLUMN IF NOT EXISTS min_order_desc VARCHAR(255) DEFAULT 'Minimum order value for delivery';
ALTER TABLE platform_commerce_settings ADD COLUMN IF NOT EXISTS min_order_is_active BOOLEAN DEFAULT true;

ALTER TABLE platform_commerce_settings ADD COLUMN IF NOT EXISTS delivery_fee_desc VARCHAR(255) DEFAULT 'Standard delivery charge';
ALTER TABLE platform_commerce_settings ADD COLUMN IF NOT EXISTS delivery_fee_is_active BOOLEAN DEFAULT true;

ALTER TABLE platform_commerce_settings ADD COLUMN IF NOT EXISTS free_delivery_desc VARCHAR(255) DEFAULT 'Free delivery above this amount';
ALTER TABLE platform_commerce_settings ADD COLUMN IF NOT EXISTS free_delivery_is_active BOOLEAN DEFAULT true;

ALTER TABLE platform_commerce_settings ADD COLUMN IF NOT EXISTS express_delivery_inr NUMERIC(12,2) DEFAULT 99.00 CHECK (express_delivery_inr >= 0);
ALTER TABLE platform_commerce_settings ADD COLUMN IF NOT EXISTS express_delivery_desc VARCHAR(255) DEFAULT 'Same-day or next-slot delivery';
ALTER TABLE platform_commerce_settings ADD COLUMN IF NOT EXISTS express_delivery_is_active BOOLEAN DEFAULT true;

ALTER TABLE platform_commerce_settings ADD COLUMN IF NOT EXISTS late_night_delivery_inr NUMERIC(12,2) DEFAULT 50.00 CHECK (late_night_delivery_inr >= 0);
ALTER TABLE platform_commerce_settings ADD COLUMN IF NOT EXISTS late_night_delivery_desc VARCHAR(255) DEFAULT '10 PM to 7 AM delivery';
ALTER TABLE platform_commerce_settings ADD COLUMN IF NOT EXISTS late_night_delivery_time VARCHAR(100) DEFAULT '10 PM to 7 AM';
ALTER TABLE platform_commerce_settings ADD COLUMN IF NOT EXISTS late_night_delivery_is_active BOOLEAN DEFAULT true;

-- Extend platform_commerce_settings with detailed taxes & fees
ALTER TABLE platform_commerce_settings ADD COLUMN IF NOT EXISTS cgst_percent NUMERIC(5,2) DEFAULT 2.50 CHECK (cgst_percent >= 0);
ALTER TABLE platform_commerce_settings ADD COLUMN IF NOT EXISTS cgst_is_active BOOLEAN DEFAULT true;

ALTER TABLE platform_commerce_settings ADD COLUMN IF NOT EXISTS sgst_percent NUMERIC(5,2) DEFAULT 2.50 CHECK (sgst_percent >= 0);
ALTER TABLE platform_commerce_settings ADD COLUMN IF NOT EXISTS sgst_is_active BOOLEAN DEFAULT true;

ALTER TABLE platform_commerce_settings ADD COLUMN IF NOT EXISTS gst_is_active BOOLEAN DEFAULT true;

ALTER TABLE platform_commerce_settings ADD COLUMN IF NOT EXISTS service_tax_label VARCHAR(100) DEFAULT 'Platform convenience fee';
ALTER TABLE platform_commerce_settings ADD COLUMN IF NOT EXISTS service_tax_is_active BOOLEAN DEFAULT true;

ALTER TABLE platform_commerce_settings ADD COLUMN IF NOT EXISTS packaging_fee_inr NUMERIC(12,2) DEFAULT 10.00 CHECK (packaging_fee_inr >= 0);
ALTER TABLE platform_commerce_settings ADD COLUMN IF NOT EXISTS packaging_fee_label VARCHAR(100) DEFAULT 'Packaging and handling';
ALTER TABLE platform_commerce_settings ADD COLUMN IF NOT EXISTS packaging_fee_type VARCHAR(20) DEFAULT 'flat';
ALTER TABLE platform_commerce_settings ADD COLUMN IF NOT EXISTS packaging_fee_is_active BOOLEAN DEFAULT true;

COMMIT;
