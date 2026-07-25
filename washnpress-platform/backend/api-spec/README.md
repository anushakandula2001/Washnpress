# API Specification

Machine-readable OpenAPI 3.1 contract for all **91** Wash N Press API routes.

## Files

| File | Description |
|------|-------------|
| `openapi.json` | Full OpenAPI 3.1 spec (source of truth) |
| `openapi.yaml` | Legacy YAML stub — use `openapi.json` instead |

## Regenerate

```bash
npm run openapi:generate
```

This writes `backend/api-spec/openapi.json` and `public/openapi.json`.

## Interactive docs

With the dev server running:

- **Swagger UI:** [http://localhost:3000/docs/swagger](http://localhost:3000/docs/swagger)
- **Raw spec:** [http://localhost:3000/openapi.json](http://localhost:3000/openapi.json) or `GET /api/openapi`

## Auth

Session cookie `wnp_session` is set after OTP verify or operator login. In Swagger UI, authenticate via `POST /api/auth/otp/verify` first — the cookie is sent automatically on same-origin requests.

**Dev demo phones:** Resident `9876543210`, Operator `9876500002`, Admin `9876500001`
