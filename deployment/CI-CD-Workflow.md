# CI/CD Workflow

## Pipeline Stages
1. Install dependencies
2. Lint checks
3. Unit tests
4. Production build
5. Docker image build and push
6. Azure deployment (main branch)

## Trigger Policy
- Pull Request to main: quality gates only
- Push to main: quality gates + image + deployment

## Required Secrets
- AZURE_CREDENTIALS
- AZURE_SUBSCRIPTION_ID
- AZURE_RESOURCE_GROUP

## Deployment Strategy
- Immutable container tag deployment
- Prefer blue/green or slot-based deployment for zero downtime

## Post Deploy Steps
- Smoke tests on key pages and APIs
- Monitor errors and latency for 15 minutes before marking successful
