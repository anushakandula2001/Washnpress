\echo 'Running Wash N Press migrations'
\i backend/database/migrations/001_init_schema.sql
\i backend/database/migrations/002_indexes_and_constraints.sql
\i backend/database/migrations/003_audit_tables.sql
\i backend/database/migrations/004_wallet_payments_addons.sql

\i backend/database/migrations/005_extended_features.sql

\echo 'Running Wash N Press seeds'
\i backend/database/seeds/001_seed_reference_data.sql
\i backend/database/seeds/002_seed_demo_data.sql
\i backend/database/seeds/003_seed_extended_demo.sql
\i backend/database/seeds/004_seed_extended_features.sql

\echo 'Done.'
