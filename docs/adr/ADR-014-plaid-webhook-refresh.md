# ADR: Plaid Webhook-Driven Balance Refresh

**Status:** Accepted — supersedes [ADR-006](ADR-006-refresh-scheduling.md)

---

## Context

[ADR-006](ADR-006-refresh-scheduling.md) chose a GitHub Actions cron job to pull balances for all Plaid Items once daily. That decision was made under single-user assumptions, and three objections were raised against Plaid webhooks at the time:

1. **Webhooks don't carry balance data** — `SYNC_UPDATES_AVAILABLE` notifies that data has changed; a `/accounts/get` call is still required.
2. **Operational overhead** — each Plaid Item must be individually configured with a webhook URL, and any endpoint change requires reconfiguring every item.
3. **Transactions product cost** — the `SYNC_UPDATES_AVAILABLE` event is part of the Transactions product, which incurs per-call costs.

With multiple users, the original single-batch approach has meaningful problems:

- A slow or errored item blocks the entire refresh batch
- All users' balances update at the same moment (thundering herd against Plaid's API)
- Rate limit headroom shrinks linearly with user count
- Connection errors (`ITEM_LOGIN_REQUIRED`, expired tokens) are only discovered at the next cron run — up to 24 hours later

Each of ADR-006's three objections is now resolved or moot:

1. **Webhooks don't carry balance data** — still true. We still call `/accounts/get` on each webhook. The webhook is a trigger, not a data source. This is unchanged.
2. **Operational overhead** — `linkTokenCreate` accepts a `webhook` parameter, so new Items are registered automatically. A one-time backfill (`plaidClient.itemWebhookUpdate`) covers existing Items. Any future endpoint change requires a backfill, but that is a one-time migration cost, not ongoing overhead.
3. **Transactions product cost** — the application already uses `Products.Transactions` for account linking. The `SYNC_UPDATES_AVAILABLE` event is already available at no additional cost.

## Options Considered

### Keep GitHub Actions cron

The existing approach. Simple, decoupled, no Plaid configuration required. Acceptable for a single user.

Rejected now because: with multiple users it creates a thundering herd, masks connection errors for up to 24 hours, and fails atomically when any single Plaid API call errors.

### Plaid webhook-driven refresh

**Chosen.**

Each Plaid Item independently notifies the application when Plaid has updated data. The application refreshes only that item. Connection errors (`ITEM.ERROR`, `ITEM.PENDING_EXPIRATION`, `ITEM.USER_PERMISSION_REVOKED`) surface in near-real-time and mark the item unhealthy immediately.

## Decision

Replace the GitHub Actions cron with a Plaid webhook endpoint at `POST /api/subscriptions/plaid`.

**Webhook handling:**

| `webhook_type` | `webhook_code` | Action |
|---|---|---|
| `TRANSACTIONS` | `SYNC_UPDATES_AVAILABLE` | Call `refreshAccountBalances({ plaidItemId })` for the affected item |
| `ITEM` | `ERROR` | Mark the `PlaidItem` as `unhealthy` |
| `ITEM` | `PENDING_EXPIRATION` | Mark the `PlaidItem` as `unhealthy` |
| `ITEM` | `USER_PERMISSION_REVOKED` | Mark the `PlaidItem` as `unhealthy` |

The `SYNC_UPDATES_AVAILABLE` payload contains `item_id` (Plaid's identifier), matched to `PlaidItem.plaidItemId` via prisma-field-encryption's transparent query.

**Signature verification:** Every incoming webhook is verified using Plaid's JWT-based mechanism. The `Plaid-Verification` header contains a JWT signed with a Plaid-managed key. The key is fetched by ID (`kid`) from `plaidClient.webhookVerificationKeyGet()` and cached in memory. The JWT payload's `request_body_sha256` claim is compared against the SHA-256 of the raw request body to prevent body tampering.

**Item registration:** The `webhook` parameter is set on all `linkTokenCreate` calls so new Items are registered automatically. Existing Items are backfilled via `plaidClient.itemWebhookUpdate()`.

**Healthy/unhealthy cycle:** Webhook handlers write `status: "unhealthy"` on connection errors. The repair route (`/plaid_items/:itemId/update`) writes `status: "healthy"` on successful re-link, closing the cycle.

## Consequences

**Positive:**

- Each Plaid Item refreshes independently; a single error cannot block other users
- Connection errors surface in near-real-time rather than up to 24 hours later
- Refreshes are paced naturally by Plaid rather than concentrated at one moment per day
- The GitHub Actions cron and its `REFRESH_API_SECRET` scheduling dependency are eliminated

**Negative / Tradeoffs:**

- The endpoint must be publicly reachable by Plaid; local development requires a tunnel (e.g. ngrok) to test the full webhook flow end-to-end
- Webhook delivery is not guaranteed — Plaid retries failed deliveries, but a prolonged outage could still result in a missed refresh day (carry-forward logic in ADR-005 handles this gracefully)
- Existing Plaid Items require a one-time backfill to register the webhook URL
- Any future change to the webhook URL requires another backfill pass
