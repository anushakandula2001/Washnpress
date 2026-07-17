\echo 'Running Wash N Press migrations'
\i database/migrations/001_init_schema.sql
\i database/migrations/002_indexes_and_constraints.sql
\i database/migrations/003_audit_tables.sql

\echo 'Running Wash N Press seeds'
\i database/seeds/001_seed_reference_data.sql
\i database/seeds/002_seed_demo_data.sql

\echo 'Done.'
