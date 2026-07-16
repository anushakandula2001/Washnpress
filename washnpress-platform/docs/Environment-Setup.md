# Environment Setup

## Required Tooling
- Node.js 20+
- npm 10+
- Docker Desktop (recommended)
- PostgreSQL 15+ (for production path)

## Local Setup (Current App)
1. npm ci
2. npm run dev

## Local Setup (Target Production Path)
1. Start PostgreSQL and Redis locally (via docker-compose)
2. Apply migrations from database/run-migrations.sql
3. Configure environment variables
4. Run app with npm run dev

## Expected Environment Variables
See deployment/ENVIRONMENT_VARIABLES.md and deployment/.env.example.

## Troubleshooting
- If npm run dev fails from parent folder, run from washnpress-platform root.
- If port 3000 is occupied, set PORT to 3001.
- If tests fail due to lock files, ensure npm ci completed successfully.
