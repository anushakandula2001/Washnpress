BEGIN;

-- Ensure plans have display names
UPDATE plans SET name = COALESCE(NULLIF(name, ''), initcap(tier)) WHERE name IS NULL OR name = '';

COMMIT;
