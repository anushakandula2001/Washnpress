-- Add missing columns to plans table for dynamic rendering and syncing

ALTER TABLE plans
ADD COLUMN features JSONB DEFAULT '[]'::jsonb,
ADD COLUMN display_order INTEGER DEFAULT 0,
ADD COLUMN is_popular BOOLEAN DEFAULT false,
ADD COLUMN support_type VARCHAR(50) DEFAULT 'Standard';
