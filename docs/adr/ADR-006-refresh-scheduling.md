# ADR: Daily Scheduled Balance Refresh via GitHub Actions

**Status:** Superseded by [ADR-014](ADR-014-plaid-webhook-refresh.md)

---

## Context

Account balances need to stay reasonably current without requiring manual intervention. Two sub-decisions compose the full answer: whether to use a push (webhook) or pull (scheduled poll) model, and what mechanism should invoke the refresh.

The application's time horizon is relevant here: it is designed to produce a net worth trendline over years, not a real-time financial dashboard. Daily granularity is sufficient. A missed day is inconsequential — the carry-forward logic handles gaps gracefully (see [ADR-005: Snapshot-Based Balance Storage](ADR-005-balance-snapshot-storage.md)).

## Options Considered

### Plaid webhooks

Plaid offers a `SYNC_UPDATES_AVAILABLE` webhook event via their Transactions product, which fires roughly once per day per Plaid Item when new transaction data is available. This could serve as a signal that account balances have changed.

Rejected for three reasons:

- **Webhooks don't carry balance data.** The payload notifies that transactions have changed; it does not include account balances. A call to `/accounts/get` would still be required in response — adding webhook infrastructure without eliminating the pull.
- **Operational overhead.** Each Plaid Item must be individually configured with a webhook endpoint URL. Any change to that endpoint requires reconfiguring every item across every environment.
- **Transactions product cost.** The `SYNC_UPDATES_AVAILABLE` event is part of the Transactions product, which incurs per-call costs. The `/accounts/get` endpoint used by the pull approach is free.

### In-app cron (node-cron)

Run the refresh on a schedule within the application process using a package like `node-cron`. Rejected because wiring a background job into a React Router server entry point is not a supported pattern — the job would be coupled to the application's process lifecycle in ways that are difficult to reason about cleanly.

### GitHub Actions on a cron schedule

**Chosen.**

## Decision

GitHub Actions triggers the refresh once daily via a cron schedule. The action calls a signed HTTP endpoint on the running application (`POST /api/accounts/refresh`), which contains all job logic and performs the actual Plaid calls and database writes.

This approach has three deliberate properties:

**Pull over push.** Plaid webhooks would still require a `/accounts/get` call on receipt — they signal that something changed, not what changed. A scheduled pull achieves the same result with less infrastructure. The 24-hour polling window is acceptable given the multi-year time horizon; a cached balance that lands 15 minutes before or after Plaid's daily update is inconsequential.

**GitHub Actions as the trigger, not the job.** GitHub Actions was already present in the repository for CI/CD, costs nothing at this usage level, and handles cron scheduling reliably without additional tooling. It is responsible for exactly one thing: calling the endpoint on schedule. All job logic — Plaid API calls, balance normalization, database writes — lives inside the application.

**Nothing outside the application touches the database directly.** The HTTP endpoint boundary is deliberate. External systems, including GitHub Actions, interact with the application through its own interface; they do not read from or write to the database independently. This keeps the job logic colocated with the rest of the application code, testable alongside it, and decoupled from whatever scheduling mechanism calls it.

The endpoint is protected by a Bearer token (`REFRESH_API_SECRET`) verified on each request. An initial implementation accepted unauthenticated requests — the endpoint is non-destructive, but an unprotected endpoint triggering writes on a production financial application is not acceptable regardless.

## Consequences

**Positive:**

- No webhook infrastructure to maintain; no Plaid Items to reconfigure when the endpoint changes
- Scheduling and job logic are fully decoupled — the trigger mechanism can be swapped without touching application code
- GitHub Actions is free at this usage level and already present for CI/CD
- All job logic lives in the application, colocated with the code it depends on
- Missed days degrade gracefully via carry-forward logic

**Negative / Tradeoffs:**

- Balances are at most ~24 hours stale. Acceptable for this use case; the first thing to revisit if the application ever moves toward a multi-user model
- GitHub Actions cron is not guaranteed to fire at the exact configured time — minute-level delays are possible under load
- If the application is down when the action fires, that day's refresh is skipped silently
