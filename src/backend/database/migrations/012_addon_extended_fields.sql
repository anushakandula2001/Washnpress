-- Add extended fields to addon_services table

ALTER TABLE addon_services 
ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT 'General' NOT NULL,
ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'Normal' NOT NULL,
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0 NOT NULL;
