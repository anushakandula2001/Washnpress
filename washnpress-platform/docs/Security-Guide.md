# Security Guide

## Security Baseline Controls

### Authentication
- OTP-based login with expiry and lockout.
- Signed, httpOnly, secure session cookies.
- Session invalidation on logout and risky events.

### Authorization
- Enforce RBAC for resident/operator/admin routes and APIs.
- Add resource-scoped checks (society, unit, assignment).

### Data Protection
- Encrypt data in transit (TLS) and sensitive data at rest.
- Mask resident data for operator views where required.
- Define retention and deletion workflows for personal data.

### API Security
- Input validation via zod (already present in existing endpoints).
- Add rate limiting for auth and write endpoints.
- Add idempotency keys for transactional writes.
- Add request correlation IDs.

### Secrets Management
- Store production secrets in Key Vault or equivalent.
- No secrets in source control.
- Rotate secrets periodically and on incident.

### Logging and Audit
- Immutable audit logs for admin and support overrides.
- No PII or secrets in application logs.

## OWASP ASVS/Top 10 Focus Areas
1. Broken Access Control: currently high risk until RBAC is implemented.
2. Cryptographic Failures: enforce secure cookie and key management.
3. Injection: parameterized DB access and schema validation.
4. Insecure Design: add threat modeling for OTP/payment flows.
5. Security Misconfiguration: baseline headers and CSP.
6. Vulnerable Components: dependency scanning in CI.
7. Identification and Authentication Failures: OTP abuse protections.
8. Software and Data Integrity Failures: signed releases, protected branches.
9. Security Logging and Monitoring Failures: alerts and audit trails.
10. SSRF and platform-specific abuse: egress controls for integrations.

## Release Gate Security Checklist
- Auth and RBAC verified
- Rate limits enabled
- Dependency scan clean of critical issues
- Audit logs enabled
- Incident response runbook approved
