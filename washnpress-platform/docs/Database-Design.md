# Database Design

## Overview
This design provides a production-ready relational model for the Wash N Press platform.

Database engine target: PostgreSQL 15+

## ER Diagram

```mermaid
erDiagram
  USERS ||--o{ USER_ROLES : has
  ROLES ||--o{ USER_ROLES : grants
  SOCIETIES ||--o{ UNITS : contains
  SOCIETIES ||--o{ RESIDENTS : serves
  USERS ||--o| RESIDENTS : identity
  RESIDENTS ||--o{ SUBSCRIPTIONS : owns
  PLANS ||--o{ SUBSCRIPTIONS : selected
  RESIDENTS ||--o{ PICKUPS : requests
  SOCIETIES ||--o{ PICKUPS : scheduled_in
  PICKUPS ||--o{ ORDERS : creates
  ORDERS ||--o{ ORDER_ITEMS : contains
  ORDERS ||--o{ ORDER_EVENTS : tracks
  ORDERS ||--o{ WATER_LOGS : measures
  ORDERS ||--o{ SUPPORT_TICKETS : raises
  USERS ||--o{ SUPPORT_TICKETS : assigned
  UNITS ||--o{ UNIT_OPERATORS : staffed_by
  USERS ||--o{ UNIT_OPERATORS : person
  AUDIT_LOGS }o--|| USERS : actor

  USERS {
    uuid id PK
    varchar phone
    varchar full_name
    varchar status
    timestamptz created_at
  }
  ROLES {
    smallint id PK
    varchar name
  }
  SOCIETIES {
    uuid id PK
    varchar name
    varchar status
    timestamptz created_at
  }
  RESIDENTS {
    uuid id PK
    uuid user_id FK
    uuid society_id FK
    varchar unit_number
  }
  PLANS {
    uuid id PK
    varchar tier
    int garment_cap
    int monthly_inr
  }
  SUBSCRIPTIONS {
    uuid id PK
    uuid resident_id FK
    uuid plan_id FK
    varchar status
  }
  PICKUPS {
    uuid id PK
    uuid resident_id FK
    uuid society_id FK
    timestamptz scheduled_for
    varchar status
  }
  ORDERS {
    uuid id PK
    uuid pickup_id FK
    varchar order_code
    varchar status
  }
```

## Schema Principles
1. UUID primary keys for distributed-safe identity.
2. Strict foreign keys and check constraints.
3. Soft-delete ready pattern for recoverability where needed.
4. Audit log table for privileged actions and workflow transitions.
5. Indexed status + time columns for operational dashboards.

## Migration Files
- database/migrations/001_init_schema.sql
- database/migrations/002_indexes_and_constraints.sql
- database/migrations/003_audit_tables.sql

## Seed Files
- database/seeds/001_seed_reference_data.sql
- database/seeds/002_seed_demo_data.sql

## Audit Strategy
- Use audit_logs for admin/security-sensitive actions.
- Use order_events as domain event history for lifecycle traceability.
- Retain immutable actor, action, before_state, after_state snapshots.

## Backup and Recovery Guidance
- Daily full backups + point-in-time WAL archive.
- Validate restore in non-production weekly.
- Retention recommendation: 30 days daily + monthly snapshots for 12 months.
