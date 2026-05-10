# ADR: Multi-User Public Registration

**Status:** Accepted

---

## Context

ADR-004 established this application as a deliberate single-user system. That decision was made on sound grounds: no multi-tenancy complexity, no account recovery infrastructure, no privacy isolation concerns beyond the author's own data.

This application is a real financial tool that solves a real problem. Keeping it permanently single-user means the engineering — the Plaid integration, the balance tracking over time, the account management flows — is invisible to anyone who isn't the owner. That is a reasonable tradeoff early in a project's life, but it becomes harder to justify as the software matures. A working financial tracker is more valuable when more people can use it.

The timing of this decision was shaped by a potential job search. Most of what makes this project worth showing is behind a login; a visitor to the site sees a landing page and very little else. That context explains why this was addressed now rather than later — but the case for opening registration stands independent of it.

A demo account with pre-seeded fake data was considered as an alternative. It was rejected. The value of this application is that it works: the Plaid integration pulls real data, balances accumulate over real time, and the financial picture it produces is accurate. Synthetic data reduces that to a prototype. The working system is the thing worth demonstrating, and a demo account cannot demonstrate it.

This left the question of how to open the application to outside visitors. Options considered:

## Options Considered

### Remain single-user

The status quo. Visitors see the landing page and must take the author's word for what exists behind it.

Rejected. A financial tracking application that only one person can use is a tool, not a product. The engineering decisions made throughout this project — production deployment, field encryption, rate limiting, 2FA, a full Plaid integration — are decisions that only make sense for software intended to be used. Keeping it single-user indefinitely is inconsistent with how it was built. An active job search brought this tension into focus, but it would have surfaced eventually regardless.

### Demo account with pre-seeded data

A shared login (e.g. `demo@theledger.dev`) pre-populated with realistic-looking financial data. Any visitor could log in and explore the interface without creating an account.

Rejected. The Plaid integration — one of the more technically interesting parts of the application — cannot be demonstrated authentically with synthetic data. The balance tracking features are only meaningful when observed over real time with real data. A demo account would show the shell of the application without the substance. A polished screenshot would accomplish the same thing at lower cost.

### Invite-code registration

A join page gated by a static or single-use code distributed through the portfolio or resume. Only people with the code could create accounts, keeping registration effectively controlled without requiring manual approval.

Considered seriously and ultimately rejected. The friction is unnecessary: if the goal is to let hiring managers who find the application use it, the invite code adds a step that serves no meaningful purpose. There is no sensitive resource being protected from general public access at the registration level — any sensitivity is in the per-user data, which is already isolated. An invite code would reduce spontaneous sign-ups without providing a real security or operational benefit.

### Open public registration

**Chosen.**

## Decision

Remove the single-user constraint and open the application to public registration. The join page, which already exists in the codebase, will be linked from the landing page. Any visitor can create an account. All registered users have access to the full application, including the Plaid integration.

**Why fully open rather than restricted:**
The application's data model already enforces user-level isolation — every account, balance snapshot, and Plaid item is scoped to a user record. There is no architectural change required to prevent one user's data from being visible to another; that guarantee already exists. Opening registration does not weaken it.

**Why full Plaid access for all users:**
Restricting Plaid to the owner account would create a two-tier experience where other users get a lesser version of the product. The Plaid integration is central to how the application works; a net worth tracker without bank syncing is just a spreadsheet. Any registered user can connect bank accounts through Plaid and use the full product. This is the intended experience.

**Relationship to ADR-004:**
This decision amends ADR-004. The single-user architecture constraint is lifted. The reasoning in ADR-004 for preferring simplicity over multi-tenancy remains valid as an engineering principle; it is being overridden here by a product consideration that did not exist when ADR-004 was written.

**Relationship to email infrastructure (ADR-012):**
Public registration with real users requires self-service account recovery. A user who forgets their password or loses their authenticator device has no database access to fall back on. Email infrastructure was established in ADR-012 to support the recovery flows that this decision makes necessary.

## Consequences

**Positive:**

- Any visitor can use the full application, including the Plaid integration and balance tracking features
- No change required to the data model; user isolation was already enforced at the record level
- The join flow already exists in the codebase and requires only surface-level changes to be accessible

**Negative / Tradeoffs:**

- The application now has real users with real expectations; account recovery, password resets, and general reliability matter more than they did for a single-user system
- The privacy policy must accurately reflect a multi-user system where user data is isolated but co-located on shared infrastructure
- "Open to everyone" was chosen for simplicity rather than as a deliberate long-term product strategy; if the application's scope or audience changes significantly, the registration model may need revisiting
