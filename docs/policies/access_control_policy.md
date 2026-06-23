# Access Control Policy

## Purpose

Define how access to The Ledger and its data is granted, modified, and revoked, and document the authentication mechanisms that protect the application.

## Scope

All user accounts, administrative access, API integrations, and the tokens and certificates used for authentication.

## Authentication Mechanisms

### Sessions

User sessions are managed via HMAC-signed cookies (`SESSION_SECRET`). Cookies are configured as `httpOnly`, `SameSite=Lax`, and `Secure` in production (enforcing HTTPS). An optional "remember me" setting extends the session to 7 days.

### Two-Factor Authentication (2FA)

TOTP (time-based one-time passwords) via RFC 6238 is required for all users. TOTP secrets are encrypted at rest using `prisma-field-encryption`. Ten single-use recovery codes are generated when 2FA is enabled; each code is bcrypt-hashed before storage.

Login and 2FA verification are rate-limited: 5 attempts per 15-minute window per IP and user combination.

### Password Reset

Password reset tokens are 32-byte random hex strings, SHA256-hashed before storage, and expire after 1 hour. Tokens are single-use.

### Email Verification

Email verification tokens are 32-byte random hex strings, SHA256-hashed before storage, and expire after 24 hours. Tokens are single-use.

### Plaid Webhook Verification

Incoming Plaid webhooks are verified by checking the JWT signature against Plaid's public keys (fetched and cached by key ID). The token's `iat` claim must be within 5 minutes of the current time, and a SHA256 hash of the request body is compared against the `request_body_sha256` claim in the token payload.

### TLS

Production session cookies are flagged `Secure`, enforcing HTTPS. TLS certificates are managed by Fly.io.

## Access Levels

| Role                 | Description                                                                                                |
| -------------------- | ---------------------------------------------------------------------------------------------------------- |
| `customer` (default) | Authenticated user with access only to their own data.                                                     |
| `admin`              | System operator access: can view all users, manage user roles, delete accounts, and manage Plaid webhooks. |

## Granting Access

- **User access:** Open self-registration. New users must verify their email address before accessing the application.
- **Admin access:** Promoted by an existing admin via the admin user management UI at `/users/:userId`.

## Modifying Access

- Role changes (promote to admin / revoke admin) are performed by an admin via the admin UI.
- An admin cannot change their own role.
- The last remaining admin cannot be demoted.

## Revoking Access

- **Self-deletion:** Users can delete their own account via Settings. Password confirmation is required. All associated data (accounts, balance history, Plaid connections) is cascade-deleted.
- **Admin deletion:** Admins can delete any user account via the admin UI. The same cascade-delete applies.
- The last remaining admin account cannot be deleted.

## Data Isolation

All database queries are scoped to the authenticated user at the query level. There is no cross-user data access path for the `customer` role.

## Review Cadence

This policy is reviewed when access control architecture or security requirements change.
