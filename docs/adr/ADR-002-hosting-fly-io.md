# ADR: Fly.io for Production Hosting

**Status:** Accepted

---

## Context

This application needs a hosting platform that can run a Node.js server continuously, persist a SQLite database file across deployments, and support two environments (staging and production) — all at a cost appropriate for a single-user personal project with minimal traffic.

The framework choice (React Router via Remix stacks — see [ADR-001: React Router 7 over Next.js](ADR-001-framework-react-router.md)) is directly relevant here: the Remix stack selected to bootstrap this project came with Fly.io deployment configuration included. That reduced the hosting decision from "evaluate and configure a platform" to "evaluate whether to deviate from the default."

## Options Considered

### Local-only ("glorified spreadsheet")

Running the app locally and triggering Plaid syncs manually via a button click. Functionally viable, but requires the host machine to be running when a sync is needed and eliminates remote access. Rejected early as incompatible with the goal of a durable, always-available system.

### AWS

Technically capable of everything required. Rejected due to operational overhead and cost complexity — IAM roles, VPC configuration, EC2 or container orchestration, storage configuration. The operational surface area is disproportionate to a single-user application with predictable, low workload. AWS is the right choice when scale justifies the complexity; it is not justified here.

### Self-hosting (home server)

Attractive for full ownership and zero ongoing infrastructure cost. Requires significant one-time setup (port forwarding, DNS, nginx, process management, TLS) and ongoing maintenance. Remains a viable contingency if Fly.io's pricing changes — SQLite's file-based nature makes migration to self-hosting drag-and-drop. Set aside for now due to setup overhead relative to current need.

### Fly.io

**Chosen.**

## Decision

Deploy to Fly.io. The Remix stack bootstrapping this project came with Fly.io configuration included — `fly.toml`, Dockerfile, and GitHub Actions deploy workflows. Evaluating alternatives found no requirement that Fly.io couldn't meet, and no gap that justified the added cost of switching.

Specific factors that validated Fly.io as the right choice rather than just the easy one:

- **Pricing.** Fly.io charges based on actual usage; single-user traffic has never approached the billing threshold. Effectively free to operate.
- **Persistent volumes.** Most managed platforms treat the filesystem as ephemeral. Fly.io volumes provide durable block storage, which is what makes SQLite viable in production. Without volume persistence, SQLite would not be a usable database on this platform.
- **Docker-based deployment.** The app deploys as a container image, not via a proprietary build system. This keeps deployment artifacts platform-agnostic — the same image could run on AWS, Railway, Render, or a home server.
- **Staging and production environments.** Fly.io supports multiple named apps with separate configuration, making two-environment deployment straightforward. This was included in the Remix stack and matched an explicit project requirement.

## Consequences

**Positive:**
- Effectively free at current usage levels
- Docker-based deploys are portable; no meaningful platform lock-in
- SQLite persistence is well-supported via volumes
- Staging and production parity with minimal configuration overhead
- Low migration cost if needed — SQLite is a single file, and the container image runs anywhere

**Negative / Tradeoffs:**
- No true free tier; pricing is usage-based and could change. The SQLite + Docker portability mitigates this risk significantly — self-hosting remains a viable fallback
- Brief downtime during deployments (machine spin-down and spin-up) is expected at this tier and acceptable for a single-user application
- Documentation is adequate but not exceptional
