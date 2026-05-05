# ADR: Mandatory TOTP Two-Factor Authentication

**Status:** Accepted

---

## Context

This application connects to Plaid to access financial account data. Plaid strongly recommends that applications deploying Plaid Link implement multi-factor authentication:

> "To enhance security for consumers using your mobile and/or web applications where Plaid Link is deployed, it is highly recommended to implement multi-factor authentication (MFA). MFA adds an extra layer of protection by requiring users to provide two or more verification factors to gain access."

The application was initially deployed without 2FA. When Plaid's security recommendations surfaced during the integration process, 2FA was added to meet their guidance and to establish an appropriate security baseline for a system handling financial data.

## Options Considered

### No 2FA

The original implementation. Rejected once Plaid's guidance was reviewed — MFA is the expected security baseline for any application touching financial data, regardless of user count.

### SMS-based OTP

Would require integrating a third-party SMS provider (Twilio or similar), adding cost and an external service dependency. Rejected as disproportionate complexity for a single-user system.

### Email-based OTP

Similar to SMS — requires an email delivery service, adds an external dependency, and introduces deliverability as a failure mode. Rejected for the same reasons.

### TOTP via authenticator app

**Chosen.**

## Decision

Implement mandatory TOTP (Time-Based One-Time Password, RFC 6238) two-factor authentication, required for all logins.

**Why TOTP over SMS or email:**
TOTP requires no third-party service. The shared secret is stored in the database; tokens are generated entirely on-device by any RFC 6238-compatible authenticator. For a single-user system, TOTP is operationally simpler than any service-dependent alternative — and the author already uses an authenticator app for other accounts.

**Why mandatory rather than optional:**
With a single user, there is no meaningful UX tradeoff to make. Making it mandatory ensures the system demonstrably meets Plaid's guidance and provides an unambiguous answer if the integration is ever audited: access to this system requires 2FA, full stop.

**Rate limiting:**
Login attempts are rate-limited — a 15-minute lockout triggers after repeated failed 2FA token attempts. There is no reason to allow brute-force attempts against a system holding financial data, regardless of how obscure the system is.

**Development escape hatch:**
A static token (`000000`) is accepted in the development environment to avoid requiring an authenticator app during local development. This bypass is environment-gated and does not exist in production.

**Secret storage:**
The TOTP shared secret is stored encrypted at rest via `prisma-field-encryption`, consistent with how all sensitive fields in the database are handled — Plaid tokens, account identifiers. The encryption key lives in the deployment environment, not in the codebase.

## Consequences

**Positive:**
- Meets Plaid's security recommendations for applications accessing financial data
- No external service dependency — TOTP is entirely self-contained
- Rate limiting provides baseline brute-force protection
- Encrypted secret storage follows the same pattern applied to all sensitive fields

**Negative / Tradeoffs:**
- Adds a step to every login — acceptable friction for a security-sensitive application
- If the authenticator device is lost, account recovery requires direct database access; there is no self-service recovery flow
- The `000000` development bypass must remain strictly environment-gated; accidental exposure in production would be a serious vulnerability
