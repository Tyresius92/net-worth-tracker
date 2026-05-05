# ADR: SQLite over PostgreSQL

**Status:** Accepted

---

## Context

This application is a single-user personal finance tracker with a predictable, low-volume workload: one user, daily balance snapshots, and a total dataset well under 1GB. The Remix stack used to bootstrap the project offered both SQLite and PostgreSQL variants, making the database choice an explicit early decision.

## Options Considered

### MongoDB

Briefly considered. Rejected on principle: SQL's schema-first approach — defining data structure upfront and enforcing it at the database level — is strongly preferred over schema-on-read. Designing the data model before writing application code is a deliberate practice, not an afterthought.

### PostgreSQL

The conventional production choice. Not inappropriate here, but unnecessarily complex given the requirements:

- Requires a running database server as a separate infrastructure dependency
- Adds operational overhead: connection pooling, server management, backups
- Its core strengths — high write concurrency, horizontal scaling, multi-tenant isolation — are all explicitly out of scope for this project
- Managed PostgreSQL hosting adds cost where SQLite adds none

### SQLite

**Chosen.**

## Decision

Use SQLite. The requirements of this system — single user, low write concurrency, predictable access patterns, total data well under 1GB — align precisely with SQLite's strengths. PostgreSQL's advantages are all out of scope.

The instinct toward PostgreSQL is understandable — it is the professionally safe choice and requires no justification. But choosing a more capable tool to avoid scrutiny would itself be a poor reason, and the workload here clearly does not warrant the operational overhead.

Key factors:

- **Right-sized for the workload.** SQLite is a serious, production-grade database running in billions of deployments. Hesitation around SQLite in production typically applies to high-concurrency or multi-tenant systems — neither applies here.
- **Zero infrastructure overhead.** No separate database process, no connection pooling, no server to manage. The database is a file.
- **Portability.** A single-file database makes migrating to a different host — managed platform, self-hosted server, local machine — drag-and-drop. This directly supports the project's goal of long-term durability independent of any infrastructure provider (see [ADR-002: Fly.io for Production Hosting](ADR-002-hosting-fly-io.md)).
- **Strong correctness guarantees.** SQLite is fully ACID-compliant and runs in WAL mode, providing the correctness properties required for financial data.
- **Prisma compatibility.** The same Prisma ORM surface covers both SQLite and PostgreSQL. If requirements change and migration becomes necessary, application code changes are minimal.

The database URL includes `?connection_limit=1`, a Prisma recommendation for SQLite that maintains a single connection rather than a pool. This serializes writes and prevents "database is locked" errors under concurrent access — not a constraint at this usage level, but worth making explicit.

## Consequences

**Positive:**
- No separate database process or infrastructure to manage
- File-based — trivial to back up, inspect, and migrate
- Effectively zero cost
- ACID-compliant with WAL mode
- Low migration cost to PostgreSQL if requirements change

**Negative / Tradeoffs:**
- SQLite in production invites more scrutiny than PostgreSQL would. The requirements support the choice clearly — which is precisely what this ADR exists to document.
- Writes are serialized via `connection_limit=1`. Not a constraint at current usage, but a real ceiling if concurrency requirements changed.
- Not appropriate if the system ever needs multiple users, horizontal scaling, or high write concurrency. Those requirements would warrant revisiting this decision.
