# Deployment Guide

## Deployment Targets
- Local developer machine (Windows/macOS/Linux)
- Azure App Service for production web hosting

## Build and Run

1. Install dependencies
- npm ci

2. Quality gates
- npm run lint
- npm test
- npm run build

3. Start app
- npm run start

## Containerized Deployment
Use Dockerfile and docker-compose.yml in repository root.

Local container run:
1. docker build -t washnpress-platform:local .
2. docker run --rm -p 3000:3000 --env-file deployment/.env.example washnpress-platform:local

## Azure Deployment Options
1. Azure Web App for Containers
- Build image in GitHub Actions
- Push image to Azure Container Registry
- Deploy image to Web App

2. Azure App Service (Node runtime)
- Use npm run build artifact deploy

## Pre-Production Checklist
- Auth/RBAC enabled
- Database migrations applied
- Seed restricted to non-production data only
- Secrets set in Azure Key Vault
- Alerting configured

## Rollback Strategy
- Keep last known good image tag
- On failure: redeploy previous image tag
- Run post-rollback smoke checks on / and /api/sustainability

## Post Deployment Verification
- Pages load: /, /resident, /operations, /admin, /login
- API endpoints respond with expected status codes
- Logs contain no startup errors
