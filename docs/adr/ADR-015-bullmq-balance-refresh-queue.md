# ADR: BullMQ Job Queue for Scheduled Balance Refresh

**Status:** Accepted — supplements [ADR-014](ADR-014-plaid-webhook-refresh.md)

---

## Context

[ADR-014](ADR-014-plaid-webhook-refresh.md) replaced the GitHub Actions daily cron with Plaid webhook-driven balance refreshes. Webhooks eliminated the thundering herd problem and surfaced connection errors in near-real-time — both meaningful improvements for a multi-user application.

However, Plaid webhooks are event-driven: they fire when new transactions are available, not on a fixed schedule. Plaid checks institutions for new transactions one to four times per day, but if no new transactions exist, no webhook is sent. For low-activity accounts — a savings account earning interest, a mortgage with one monthly payment, a credit card used twice a month — this means weeks can pass between webhooks. During those gaps, no balance snapshots are created, even as the underlying balance changes (interest accrual, pending charges settling, fee assessments).

The carry-forward logic from [ADR-005](ADR-005-balance-snapshot-storage.md) handles display gracefully: charts always show a continuous line. But carry-forward masks real staleness. A savings account that accrued $50 in interest over three weeks would show its pre-interest balance until the next transaction triggered a webhook. For a net worth tracker, silently carrying forward a stale balance for weeks is an accuracy problem even if the UI doesn't reveal it.

The original cron ([ADR-006](ADR-006-refresh-scheduling.md)) solved this by refreshing all items on a fixed schedule, but it was removed in ADR-014 because it concentrated all Plaid API calls into a single moment — a thundering herd that would worsen linearly with user count. The problem was never scheduled refreshes per se; it was firing them all simultaneously.

## Options Considered

### In-process scheduler (node-cron) with in-Redis job queue

**Chosen.**

Use `node-cron` to fire the weekly trigger inside the application process. Individual per-item refresh jobs are enqueued into BullMQ and processed by the in-process worker, which handles rate limiting (1 job per 10 seconds), retries with exponential backoff, and staggering. A `last_run_at` timestamp is stored in Redis after each run; on startup, if that key is absent or more than 7 days old, the refresh runs immediately to handle the case where a deploy happened to coincide with the scheduled cron time.

This hybrid approach retains all the meaningful BullMQ benefits (rate limiting, retry, fan-out) while eliminating the BullMQ job scheduler (`upsertJobScheduler`), which turned out to have significant per-command cost implications.

**Why the pure BullMQ scheduler was abandoned:** The initial implementation used `upsertJobScheduler` to register the weekly cron inside Redis. BullMQ stores the next scheduled occurrence as a delayed job in a Redis sorted set. As long as that delayed job exists, the worker's `BZPOPMIN` block timeout is hard-capped at 10 seconds (a non-configurable constant in BullMQ's source), completely bypassing the `drainDelay` option. This caused the worker to poll Redis every ~10–22 seconds continuously — roughly 8,600 `BZPOPMIN` calls per day — rather than going idle between runs. On Upstash's pay-per-command pricing, this generates ~260K commands/month from idle polling alone, with no configuration available to reduce it without patching BullMQ. Moving the weekly trigger to `node-cron` eliminates the delayed job from Redis entirely; the worker goes truly idle between weekly runs and `drainDelay` governs actual polling frequency.

**Deploy resilience:** A `node-cron` timer is in-memory and does not survive application restarts. For a weekly schedule, the probability that a deploy lands within the exact cron window is negligible. The Redis `last_run_at` key provides a startup guard: if the app restarts and the last run was more than 7 days ago, the refresh runs immediately on boot rather than waiting another week.

### Pure in-process scheduler (node-cron / setTimeout), no BullMQ

Run the weekly refresh inside the application process using `node-cron` or a plain `setInterval`, calling `refreshAccountBalances` directly for each item.

Rejected for two reasons:

- **No staggering primitive.** Spacing API calls across time requires hand-rolled delay logic — a loop with sleeps, manual tracking of which items have been processed, error handling for partial completion. BullMQ's rate limiter handles this out of the box.
- **No retries.** A failed refresh for one item is silently dropped. BullMQ provides per-item retry with exponential backoff at no additional complexity cost.

### Route webhooks through the queue

Unify all refreshes — both webhook-triggered and scheduled — through BullMQ. The webhook handler would enqueue a job rather than calling `refreshAccountBalances` directly.

Rejected because it makes Redis a single point of failure for the primary refresh path. Webhooks are the dominant source of balance updates; adding a Redis dependency to that path means an Upstash outage would block all balance refreshes — not just the weekly safety net. Keeping webhooks direct means Redis is purely additive infrastructure. If Redis is unavailable, the application degrades to webhook-only behavior, which is exactly how it worked before this change.

### BullMQ job queue with BullMQ job scheduler (upsertJobScheduler)

The initial implementation. Abandoned after discovering the per-command cost problem described above in "In-process scheduler with in-Redis job queue."

## Decision

Add a BullMQ job queue backed by Upstash Redis (provisioned through Fly.io) to run a weekly scheduled refresh of all Plaid Items. Webhooks remain the primary refresh trigger and are unchanged. The weekly cron trigger is managed by `node-cron` in-process; BullMQ handles per-item job queuing, rate limiting, and retries.

**Why BullMQ:** It provides rate limiting, retry with exponential backoff, and stalled-job detection — all features this implementation uses — without requiring a custom implementation of any of them. It runs in-process as an npm dependency; no separate worker server is required.

**Why Upstash Redis:** Upstash is available as a managed service through Fly.io (`flyctl redis create`), billed on the existing Fly.io account with no additional service provider. The free tier (500K commands/month, 256MB) is sufficient at current scale: with `node-cron` as the trigger and no delayed jobs persisted in Redis, the worker goes truly idle between weekly runs, consuming only a small number of `BZPOPMIN` commands during actual job processing.

**Why weekly:** The application's time horizon is years, not hours. A savings account that updates once a week instead of once a day produces a net worth chart that is visually indistinguishable at any reasonable zoom level. Weekly keeps Plaid API usage low, avoids unnecessary snapshot volume in SQLite, and is frequent enough that no account's balance is ever more than ~7 days stale. Webhooks handle accounts with active transaction flow; the weekly job exists only for the quiet ones.

**Queue architecture:**

- A `balance-refresh` queue holds individual per-item refresh jobs, each carrying a single `plaidItemId`.
- A BullMQ worker processes jobs from this queue in-process, with a rate limiter (1 job per 10 seconds) that naturally staggers Plaid API calls.
- `node-cron` fires a weekly schedule (Sunday 3:00 AM UTC). When it fires, it calls `enqueueAllHealthyItems()` directly, which queries all healthy Plaid Items and enqueues one refresh job per item.
- A `balance_refresh:last_run_at` key in Redis records the timestamp of each run. On startup, if this key is absent or older than 7 days, the refresh runs immediately.
- Retry configuration: 3 attempts with exponential backoff. Failed items do not block other items in the queue.

**Webhook path unchanged:** The webhook handler at `POST /api/subscriptions/plaid` continues to call `refreshAccountBalances` directly. No Redis dependency is introduced on the primary refresh path.

**Worker lifecycle:** The BullMQ worker starts in-process when the application boots, initialized via a module import in `entry.server.tsx` guarded by the existing singleton pattern. No separate process, Dockerfile change, or Fly.io configuration change is required beyond setting the `REDIS_URL` secret.

## Consequences

**Positive:**

- Low-activity accounts receive at least one balance snapshot per week, regardless of webhook activity
- Plaid API calls are staggered automatically; no thundering herd regardless of item count
- Failed refreshes retry with backoff rather than being silently skipped
- Per-item job state survives application restarts (jobs queued in Redis before a deploy are processed after)
- No new service provider — Upstash is provisioned and billed through the existing Fly.io account
- No new server infrastructure — the worker runs in the existing application process
- Idle Redis command count is minimal — the worker is truly dormant between weekly runs

**Negative / Tradeoffs:**

- Redis is a new runtime dependency. If Upstash is unavailable, the weekly scheduled refresh does not run (webhooks are unaffected)
- BullMQ and node-cron add production dependencies to the application
- The `node-cron` timer is in-memory: a deploy that coincides exactly with the Sunday 3 AM UTC window would miss that week's run. The Redis `last_run_at` startup guard handles this in practice
- The worker runs in-process, meaning a worker crash could theoretically affect the web server. At the current job volume (10 items/week, each taking ~1 second of API call time), this risk is negligible
- Local development requires a running Redis instance (Docker container) to test queue behavior
