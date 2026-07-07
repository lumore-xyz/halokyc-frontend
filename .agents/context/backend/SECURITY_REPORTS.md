# Backend Security Report

**Context:** [`AI_RULES.md`](AI_RULES.md) §"Security Rules" · [`PRODUCT_PLAN.md`](PRODUCT_PLAN.md) §9 · [`backend/DECISIONS.md`](DECISIONS.md) (ADRs touching auth, encryption, webhooks)

## Summary

- **Findings**: 3
- **Risk Level**: Resolved
- **Confidence**: High

---

## Resolved Findings

### [VULN-001] Server-Side Request Forgery (SSRF) (High)

- **Status**: Fixed
- **Location**: `backend/app/services/webhook_service.py:96`
- **Fix**: Implemented `_is_safe_url` helper to validate webhook callback
  URLs before dispatch. The guard now blocks non-HTTP(S) schemes, local and
  metadata hostnames, literal private/special-use IPs, and hostnames whose DNS
  records resolve to private, loopback, link-local, reserved, multicast, or
  otherwise non-global addresses. Webhook dispatch also disables automatic
  redirects.

### [VULN-002] Potential Memory Exhaustion / DoS (Medium)

- **Status**: Fixed
- **Location**: `backend/app/api/v1/routes/verification.py:221`
- **Fix**: Added a check for the uploaded file size against `settings.max_image_size_bytes` before reading the file content into memory.

### [VULN-003] Default Security Secrets (Medium)

- **Status**: Fixed
- **Location**: `backend/app/core/config.py:47, 51`
- **Fix**: Removed default values for `secret_key` and `webhook_secret`, making them required environment variables.
