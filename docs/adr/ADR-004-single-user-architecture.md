# ADR: Single-User Architecture

**Status:** Accepted

---

## Context

This application began with an open question: should it serve just its author, or could it become a product others could sign up for?

Multi-tenant design was seriously considered during early development. A subscription system was partially implemented using Stripe, with the intent of using Stripe Financial Connections as the balance data source. That implementation was scrapped when a fundamental catch-22 emerged: Stripe Financial Connections requires an approved, live product to access, but building that product required Financial Connections to be available first. This forced a pivot to Plaid as the data provider, and with it, a clearer reckoning with scope.

## Options Considered

### Multi-tenant SaaS

Users sign up, connect their own financial accounts, and maintain their own data. Considered and partially implemented. Set aside for both operational and architectural reasons.

### Single-user tool

**Chosen.**

## Decision

Build for a single user, explicitly and permanently for the foreseeable future.

The Stripe catch-22 was a forcing function, but the reasons for staying single-user run deeper:

**Operational scope.** Supporting multiple users means taking on responsibility for other people's financial data, providing customer support, handling account issues, and sustaining ongoing feature development. These are real operational commitments that fundamentally change what this project is. The purpose of this system is to track one person's finances reliably — not to operate a software business.

**Data responsibility.** Financial data is sensitive. Being responsible for a third party's financial data — the security posture, data retention, incident response — is a burden with no corresponding benefit at this scale.

**Architectural fit.** Single-user scope enabled a set of decisions that are significantly simpler than their multi-tenant equivalents: SQLite over a client-server database (see [ADR-003: SQLite over PostgreSQL](ADR-003-database-sqlite.md)), a daily refresh job with no rate limit concerns across users, and an auth model with no tenant isolation requirements. These decisions compound — each one becomes more defensible when the system serves exactly one user.

The `User` model retains a `role` field (`customer` / `admin`) — a remnant of the Stripe subscription implementation that was partially built before being scrapped. It has limited current use.

## Consequences

**Positive:**

- Architectural decisions throughout the stack are simpler — the database choice, auth model, refresh job, and query design all benefit from having no tenancy requirements
- No data ownership, isolation, or breach notification obligations to third parties
- No customer support, billing infrastructure, or feature prioritization across a user base required

**Negative / Tradeoffs:**

- If multi-user support were ever needed, the daily refresh job would require the most significant rethinking — Plaid rate limits would become a real constraint at scale
- The database choice and single-connection model would need revisiting under any meaningful write concurrency
- The `role` field is a low-level remnant of an abandoned direction
