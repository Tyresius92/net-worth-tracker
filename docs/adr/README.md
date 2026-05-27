# Architecture Decision Records

This directory contains Architecture Decision Records (ADRs) for the Net Worth Tracker. Each ADR documents a significant architectural decision: the context that prompted it, the options considered, the decision made, and the consequences — both positive and negative.

ADRs are numbered in roughly chronological order of dependency. Later decisions frequently reference earlier ones.

## Index

| #                                             | Title                                                 | Summary                                                                                                              |
| --------------------------------------------- | ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| [001](ADR-001-framework-react-router.md)      | React Router 7 over Next.js                           | Chose React Router for its web-fundamentals philosophy and avoidance of vendor lock-in                               |
| [002](ADR-002-hosting-fly-io.md)              | Fly.io for Production Hosting                         | Fly.io validated as the right host via persistent volume support, Docker-based deploys, and effectively free pricing |
| [003](ADR-003-database-sqlite.md)             | SQLite over PostgreSQL                                | SQLite right-sized for a single-user workload; zero infrastructure overhead and file-based portability               |
| [004](ADR-004-single-user-architecture.md)    | Single-User Architecture                              | Deliberately single-user; multi-tenant was considered and partially implemented before being set aside               |
| [005](ADR-005-balance-snapshot-storage.md)    | Snapshot-Based Balance Storage                        | Daily balance snapshots with carry-forward logic; integer storage for financial precision                            |
| [006](ADR-006-refresh-scheduling.md)          | Daily Scheduled Refresh via GitHub Actions            | Scheduled pull over Plaid webhooks; GitHub Actions as the trigger, job logic inside the app                          |
| [007](ADR-007-styling-css-modules.md)         | CSS Modules for Component Styling                     | CSS Modules for colocation; design system owns all styles, application owns business logic                           |
| [008](ADR-008-two-factor-authentication.md)   | Mandatory TOTP Two-Factor Authentication              | TOTP via authenticator app; no third-party service dependency; mandatory for all logins                              |
| [009](ADR-009-monochrome-visual-direction.md) | Monochrome Visual Direction                           | Newspaper-inspired aesthetic; typography over color; color reserved for meaning                                      |
| [010](ADR-010-form-validation-approach.md)    | Manual Form Validation over Schema Validation Library | Evaluated Zod and Prisma codegen; addressed concrete defects with shared helpers instead                             |
| [011](ADR-011-multi-user-public-registration.md) | Multi-User Public Registration                     | Open public registration over single-user or restricted access; user isolation already enforced at the data layer   |
| [012](ADR-012-email-infrastructure.md)        | Email Infrastructure — Resend and React Email         | Resend + React Email for transactional email; React components for templates; development console fallback           |
| [013](ADR-013-editorial-terminology.md)       | Editorial Vocabulary for User-Facing Text             | Closed six-term vocabulary extending the newspaper metaphor from visuals into language                              |
