\echo 'Running Wash N Press migrations'

\i backend/database/migrations/001_init_schema.sql
\i backend/database/migrations/002_indexes_and_constraints.sql
\i backend/database/migrations/003_audit_tables.sql
\i backend/database/migrations/004_wallet_payments_addons.sql
\i backend/database/migrations/005_extended_features.sql
\i backend/database/migrations/006_society_hierarchy.sql
\i backend/database/migrations/007_slots_and_user_notifications.sql
\i backend/database/migrations/008_admin_commerce_catalog.sql
\i backend/database/migrations/009_society_setup_workflow.sql
\i backend/database/migrations/010_support_ticket_management.sql
\i backend/database/migrations/011_pricing_management.sql
\i backend/database/migrations/012_resident_addresses.sql
\i backend/database/migrations/013_allow_order_cancellation.sql
\i backend/database/migrations/014_delivery_tax_settings.sql

\echo 'Running Wash N Press seeds'

\i backend/database/seeds/001_seed_reference_data.sql
\i backend/database/seeds/002_seed_demo_data.sql
\i backend/database/seeds/003_seed_extended_demo.sql
\i backend/database/seeds/004_seed_extended_features.sql

\echo 'Done.'