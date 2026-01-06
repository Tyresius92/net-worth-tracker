# Net Worth Tracker

A personal, privacy-first net worth tracking application built after Mint’s shutdown, designed to be durable and operationally simple, with a strong bias toward accessibility.

This project prioritizes **long-term data ownership**, **correctness**, and **intentional tradeoffs** over feature breadth or growth. It is built and run for a single user (me), and intentionally avoids many “product” features in favor of reliability and clarity.

---

## Motivation

When Mint shut down, I lost nearly eight years of net worth history. Replacing it meant learning a new tool with no guarantee of long-term stability or data portability.

Rather than repeat that cycle, I built a small, self-hosted system that:

- I fully control
- Stores historical data durably
- Automatically syncs balances
- Requires minimal ongoing maintenance
- Can reasonably run “forever” at low cost

---

## Core Features

- Automatic account syncing via Plaid
- Historical net worth tracking
  - Daily balance snapshots
  - Carry-forward logic for missing days
- Net worth and account balance charts
  - Charts render client-side due to Recharts SSR limitations
- Two-factor authentication (2FA) for login (required for Plaid integrations)
- Accessible, semantic HTML-first UI
- Staging and production environments
- Automated daily refresh job

---

## Tech Stack

### Frontend / App Architecture

- React Router 7 (Remix successor)
- Loader/action–driven data fetching
- Server-rendered pages with minimal client-side state
- Client-side chart rendering using Recharts (SSR not currently supported)
- Native HTML elements with light customization, prioritizing accessibility

### Backend / Data

- SQLite
  - Chosen for simplicity, cost, and durability
  - Data volume is small (<1GB) and write patterns are predictable
- Snapshot-based balance storage
- Schema migrations run automatically during deploys

### Infrastructure

- Fly.io for hosting
- Staging and production environments
- GitHub Actions for scheduled jobs
- Daily background refresh via a signed internal endpoint

---

## Design Decisions & Tradeoffs

### SQLite in Production

This application uses SQLite intentionally.

Given the constraints of the system — a single user, low write concurrency, predictable access patterns, and a total data size well under 1GB — SQLite provides several advantages:

- Extremely low operational overhead
- Strong correctness guarantees
- Simple deployment and backup
- No additional infrastructure to manage

For systems with higher write concurrency, multi-tenant access, or horizontal scaling requirements, a client/server database would be a better choice. Those tradeoffs are explicitly out of scope for this project.

---

## Data Syncing Model

Rather than relying on webhooks, this app performs a **daily pull** of account balances from Plaid:

- A scheduled job triggers a server endpoint once per day
- Balances are snapshotted and stored
- Missing dates carry forward the most recent known balance

This approach was chosen because:

- It is free within Plaid’s limits
- It is simpler to reason about operationally
- Occasional missed days degrade gracefully

---

## Authentication & 2FA

Plaid requires two-factor authentication for applications accessing financial data.

This project implements:

- Cookie-based session authentication using `createCookieSessionStorage`
- Username/password login with mandatory 2FA
- Secure storage of Plaid tokens using Fly.io secrets
- No public sign-up flow (single-user system)

2FA was added both to meet Plaid requirements and to ensure the system meets a baseline level of security appropriate for financial data.

---

## Non-Goals

This project intentionally does **not** attempt to support:

- Multiple users
- Public sign-ups
- Budgeting or categorization
- Notifications
- Mobile apps
- Real-time syncing
- Growth or monetization features

These were explicitly excluded to keep the system small, understandable, and maintainable.

---

## Testing Philosophy

This codebase favors **correctness and simplicity** over exhaustive test coverage.

- Unit tests cover critical data utilities and calculations
- Snapshot-based balance logic is validated against historical spreadsheet data
- End-to-end tests are intentionally limited

Given the small, well-bounded domain and single-user scope, this approach provides high confidence with low maintenance overhead.

---

## Running Locally

```bash
npm run setup
npm run dev
```

Environment variables are required for:

- Plaid credentials
- Session secrets

See `.env.example` for details.

---

## Why This Exists on My Resume

This project is not meant to be impressive in isolation.

It exists to demonstrate:

- End-to-end ownership of a real system
- Intentional architectural tradeoffs
- Modern React Router patterns
- Accessibility-first UI decisions
- Comfort working with authentication, background jobs, and deployment
- Shipping something durable and actually used
