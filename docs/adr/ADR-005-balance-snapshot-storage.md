# ADR: Snapshot-Based Balance Storage

**Status:** Accepted

---

## Context

This application tracks financial net worth over time. The core question at the data layer: what is the right unit of storage — individual transactions that can be aggregated into balances, or balance snapshots recorded at a point in time?

Several constraints shaped the answer before any code was written:

- **Historical data from Mint was snapshot-based.** Mint's net worth export provided end-of-month account balances — not transactions. Any data model had to be able to import this sparse historical record.
- **Some accounts can never be automatically updated.** Real property has no API. Those balances require manual entry, which is inherently a snapshot: "this account was worth this much on this date."
- **Plaid's free tier provides current balances, not transactions.** Plaid offers a transactions API, but it incurs per-call costs. The `accountsGet` endpoint — which returns current balances — is free and updates daily. This made the balance-based approach significantly cheaper to operate.

## Options Considered

### Transaction ledger

Store individual transactions and derive balances by summing them. Provides the richest data model and would have enabled budgeting features. Rejected for two reasons: Plaid's transactions API costs money at scale, and budgeting is explicitly out of scope (see [ADR-004: Single-User Architecture](ADR-004-single-user-architecture.md)) — dedicated tools do it better and are worth supporting directly.

### Latest-balance-only

Store only the most recent known balance per account. Simple, but loses history entirely. Rejected immediately — historical net worth tracking is the core purpose of the application.

### Daily snapshots with carry-forward

**Chosen.**

## Decision

Store balance snapshots with an explicit date field, and fill missing days by carrying the most recent known balance forward.

**Why snapshots rather than transactions:**
The data this system works with is fundamentally snapshot-shaped — Plaid provides current balances, manual accounts are updated point-in-time, and Mint's historical export was end-of-month snapshots. A transaction ledger would impose a model that doesn't match any of the data sources.

**Why carry-forward:**
Accounts update at different frequencies. Automated accounts refresh daily; manual accounts (properties, miscellaneous assets) update only when the user records a change; closed accounts stop producing data entirely. Without carry-forward, charts and aggregate calculations become inconsistent — if one account updates on Tuesday and another on Wednesday, cross-account comparisons are unreliable. Filling every day with the most recent known balance produces a consistent, comparable timeline across all accounts regardless of update frequency.

**The `dateTime` field:**
Each snapshot carries an explicit `dateTime` representing when the balance was true — distinct from Prisma's `createdAt` and `updatedAt` timestamps, which reflect when the database record was written. This separation is essential: historical imports need to record that a balance existed years ago, not that the record was created today. For the daily refresh job, `dateTime` is today's date. For imported or manually entered data, it can be any date.

**Multiple snapshots per day:**
The model allows multiple snapshots for the same account on the same day. The last one written wins. This keeps the refresh job simple — it creates a new record each run rather than checking for and updating an existing one — with the implicit assumption that a later reading supersedes an earlier one.

**Integer storage:**
Balances are stored as integers in the lowest denomination (dollars × 100, equivalent to cents). Plaid returns balances as floats; storing floats risks accumulating precision errors across thousands of records and calculations. Storing integers and converting at the display layer is more reliable. This approach is borrowed directly from Stripe's convention — amounts as integers in the currency's smallest unit — which has proven robust in practice. The conversion adds cognitive overhead and has caused friction at the UI layer, particularly in chart rendering, but the correctness guarantee is worth the tradeoff.

## Consequences

**Positive:**
- Data model matches the shape of data from all sources — Plaid, manual entry, and Mint historical import
- Carry-forward produces consistent, gap-free timelines across accounts with different update frequencies
- Integer storage eliminates floating-point precision risk
- Explicit `dateTime` supports both real-time and historical data without schema changes
- Closed accounts degrade gracefully — their last known balance carries forward automatically

**Negative / Tradeoffs:**
- Integer storage requires conversion at every display boundary; chart rendering in particular requires careful handling
- Carry-forward means a missed refresh day silently uses yesterday's balance — correct behavior, but requires understanding the model to avoid misreading data
- Multiple snapshots per day with last-wins semantics is implicit rather than enforced at the database level
