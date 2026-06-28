# ADR: BullMQ Job Queue for Scheduled Balance Refresh

**Status:** Accepted — supplements [ADR-014](ADR-014-plaid-webhook-refresh.md)

---

## Context

[ADR-014](ADR-014-plaid-webhook-refresh.md) replaced the GitHub Actions daily cron with Plaid webhook-driven balance refreshes. Webhooks eliminated the thundering herd problem and surfaced connection errors in near-real-time — both meaningful improvements for a multi-user application.

However, Plaid webhooks are event-driven: they fire when new transactions are available, not on a fixed schedule. Plaid checks institutions for new transactions one to four times per day, but if no new transactions exist, no webhook is sent. For low-activity accounts — a savings account earning interest, a mortgage with one monthly payment, a credit card used twice a month — this means weeks can pass between webhooks. During those gaps, no balance snapshots are created, even as the underlying balance changes (interest accrual, pending charges settling, fee assessments).

The carry-forward logic from [ADR-005](ADR-005-balance-snapshot-storage.md) handles display gracefully: charts always show a continuous line. But carry-forward masks real staleness. A savings account that accrued $50 in interest over three weeks would show its pre-interest balance until the next transaction triggered a webhook. For a net worth tracker, silently carrying forward a stale balance for weeks is an accuracy problem even if the UI doesn't reveal it.

The original cron ([ADR-006](ADR-006-refresh-scheduling.md)) solved this by refreshing all items on a fixed schedule, but it was removed in ADR-014 because it concentrated all Plaid API calls into a single moment — a thundering herd that would worsen linearly with user count. The problem was never scheduled refreshes per se; it was firing them all simultaneously.

## Options Considered

### In-process scheduler (node-cron / setTimeout)

Run the weekly refresh inside the application process using `node-cron` or a plain `setInterval`. No external dependencies.

Rejected for three reasons:

- **No deploy resilience.** All state is in-memory. A redeploy, crash, or restart loses the schedule and any in-flight work. Jobs interrupted mid-execution are silently dropped with no retry. On Fly.io, where deploys replace the running VM, every deployment resets the clock — a weekly job could be perpetually preempted if deploys happen frequently enough.
- **No staggering primitive.** Spacing API calls across time requires hand-rolled delay logic — a loop with sleeps, manual tracking of which items have been processed, error handling for partial completion. BullMQ's rate limiter handles this out of the box.
- **HMR complications in development.** Vite's dev-mode module reloading can re-evaluate server modules, spawning duplicate timers without careful singleton guarding. Solvable, but unnecessary complexity when the production solution already handles it.

ADR-006 previously rejected in-app cron for similar reasons: "wiring a background job into a React Router server entry point is not a supported pattern." That objection remains valid for purely in-memory scheduling.

### Route webhooks through the queue

Unify all refreshes — both webhook-triggered and scheduled — through BullMQ. The webhook handler would enqueue a job rather than calling `refreshAccountBalances` directly. This gives automatic retries, a single code path, and faster webhook responses (just an enqueue, not a full Plaid API round-trip).

Rejected because it makes Redis a single point of failure for the primary refresh path. Webhooks are the dominant source of balance updates; adding a Redis dependency to that path means an Upstash outage would block all balance refreshes — not just the weekly safety net. Keeping webhooks direct means Redis is purely additive infrastructure. If Redis is unavailable, the application degrades to webhook-only behavior, which is exactly how it worked before this change.

### BullMQ job queue with external Redis

**Chosen.**

## Decision

Add a BullMQ job queue backed by Upstash Redis (provisioned through Fly.io) to run a weekly scheduled refresh of all Plaid Items. Webhooks remain the primary refresh trigger and are unchanged.

**Why BullMQ:** It is the standard Node.js job queue library. It provides rate limiting, retry with exponential backoff, repeatable (cron) jobs, and stalled-job detection — all features this implementation uses — without requiring a custom implementation of any of them. It runs in-process as an npm dependency; no separate worker server is required.

**Why Upstash Redis:** Upstash is available as a managed service through Fly.io (`flyctl redis create`), billed on the existing Fly.io account with no additional service provider. The free tier (500K commands/month, 256MB) is sufficient by orders of magnitude — the weekly refresh of ~10 items uses fewer than 100 commands per run. Upstash's persistence and replication are managed externally; no Fly.io volume is required for Redis data.

**Why weekly:** The application's time horizon is years, not hours. A savings account that updates once a week instead of once a day produces a net worth chart that is visually indistinguishable at any reasonable zoom level. Weekly keeps Plaid API usage low, avoids unnecessary snapshot volume in SQLite, and is frequent enough that no account's balance is ever more than ~7 days stale. Webhooks handle accounts with active transaction flow; the weekly job exists only for the quiet ones.

**Queue architecture:**

- A `balance-refresh` queue holds individual per-item refresh jobs, each carrying a single `plaidItemId`.
- A BullMQ worker processes jobs from this queue in-process, with a rate limiter (1 job per 10 seconds) that naturally staggers Plaid API calls. 10 items at 10-second spacing completes in under two minutes; 100 items would take ~17 minutes — well within acceptable bounds for a weekly background task.
- A repeatable job registered on startup fires weekly (Sunday 3:00 AM UTC). When it fires, it queries all healthy Plaid Items and enqueues one refresh job per item. The rate limiter handles the rest.
- Retry configuration: 3 attempts with exponential backoff. Failed items do not block other items in the queue.

**Deploy resilience:** All queue state — pending jobs, delayed jobs, repeatable job definitions — lives in Redis, external to the Fly.io VM. Redeployments do not affect queued work:

- Pending and delayed jobs persist in Redis and are picked up by the new worker instance after boot.
- A job interrupted mid-execution by a deploy is detected by BullMQ's stalled-job mechanism and automatically re-queued for retry on the new instance.
- The repeatable job definition is stored in Redis. BullMQ deduplicates on startup — redeploying does not create duplicate schedules.

**Webhook path unchanged:** The webhook handler at `POST /api/subscriptions/plaid` continues to call `refreshAccountBalances` directly. No Redis dependency is introduced on the primary refresh path.

**Worker lifecycle:** The BullMQ worker starts in-process when the application boots, initialized via a module import in `entry.server.tsx` guarded by the existing singleton pattern. No separate process, Dockerfile change, or Fly.io configuration change is required beyond setting the `REDIS_URL` secret.

## Consequences

**Positive:**

- Low-activity accounts receive at least one balance snapshot per week, regardless of webhook activity
- Plaid API calls are staggered automatically; no thundering herd regardless of item count
- Failed refreshes retry with backoff rather than being silently skipped
- Queue state survives application restarts and deployments
- No new service provider — Upstash is provisioned and billed through the existing Fly.io account
- No new server infrastructure — the worker runs in the existing application process

**Negative / Tradeoffs:**

- Redis is a new runtime dependency. If Upstash is unavailable, the weekly scheduled refresh does not run (webhooks are unaffected)
- BullMQ adds a production dependency to the application. It is mature and widely used, but it is still a dependency to maintain and update
- The worker runs in-process, meaning a worker crash could theoretically affect the web server. At the current job volume (10 items/week, each taking ~1 second of API call time), this risk is negligible. If job volume or complexity grows significantly, the worker should be extracted to a separate process on a dedicated Fly.io machine
- Local development requires a running Redis instance (Docker container) to test queue behavior
