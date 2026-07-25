# Deployment Folder

Contains Azure and CI/CD deployment assets:

- `.env.example` — production env template
- `ENVIRONMENT_VARIABLES.md` — variable reference
- `azure-webapp.bicep` — Azure infrastructure
- `azure.parameters.example.json`
- `CI-CD-Workflow.md`

## Docker assets (moved)

Container files now live in `docker/`:

- `docker/Dockerfile`
- `docker/docker-compose.yml`
- `docker/.env.example`

## CI/CD

- `.github/workflows/ci-cd.yml` — lint, test, build, Docker push, Azure deploy
