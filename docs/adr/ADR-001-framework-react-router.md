# ADR: React Router 7 over Next.js

**Status:** Accepted

---

## Context

This application is built to be durable — a personal finance system intended to run reliably for decades without requiring framework rewrites or migration away from a platform that no longer serves the project's needs. Framework selection therefore carried more weight than it might in a shorter-lived project.

A consistent principle across this project's architectural decisions:

> **Prefer native platform primitives over proprietary abstractions.** When a framework requires learning a custom domain language wrapping a native API, that abstraction carries long-term cost — cognitive overhead, ecosystem dependency, and reduced portability.

## Options Considered

### Smaller / one-off frameworks

Briefly considered and quickly discarded. Given the expectation that this system will be maintained for decades, selecting an obscure or low-adoption framework introduces serious longevity risk: abandoned maintenance, shrinking community knowledge, and eventual forced migration. Only established, well-maintained frameworks remained in consideration.

### Next.js

Next.js is the dominant React framework and the default choice for most new React projects. It was rejected for three reasons:

**1. Platform coupling.** While Next.js is open-source and technically deployable anywhere, its most capable features are deeply integrated with Vercel's infrastructure. A project designed to be self-hosted and platform-independent is poorly served by a framework that increasingly assumes a specific deployment target.

**2. Runtime vs. build-time cognitive overhead.** Next.js requires constant awareness of whether code runs at build time or request time, which rendering model applies, and which data fetching strategy each page uses. This overhead is real and grows as the framework evolves.

**3. Proprietary abstractions over web fundamentals.** Next.js frequently re-implements browser platform APIs behind a custom interface: its own `Link`, its own `fetch`, its own router. Developers learn "the Next.js way" as a domain language rather than deepening their understanding of the web platform itself. A developer who spends time in Next.js gets better at Next.js — a developer who spends time in React Router gets better at the web.

### React Router 7

**Chosen.**

## Decision

Use React Router 7, adopted initially via a Remix 2 starter template and migrated to React Router 7 shortly after project inception — the Remix → React Router 7 consolidation was in progress at the time, and migrating early was the right call.

React Router's approach is to make the web platform's own primitives first-class concepts rather than hiding them behind abstraction. Loaders and actions map directly to the request/response model. Forms work like forms. Links work like links. A developer who deepens their React Router knowledge is also deepening their understanding of the web platform.

The Remix project also offered opinionated starter templates with batteries included — authentication, database setup, deployment configuration — which substantially reduced initial setup time without locking in a specific infrastructure provider.

## Consequences

**Positive:**
- Framework knowledge transfers directly to web platform knowledge; the learning compounds
- Not coupled to any deployment platform; runs on any Node.js host
- Loader/action data fetching model maps cleanly to HTTP request/response semantics
- Progressive enhancement and semantic HTML are well-supported by design

**Negative / Tradeoffs:**
- Smaller ecosystem and community than Next.js; fewer third-party integrations are built with Remix/React Router in mind
- The Remix → React Router 7 rename and API evolution required migration work early in the project — a cost paid upfront for being on the leading edge of the transition
- Less overlap with what most React developers know, which would increase onboarding friction if the project ever needed a new contributor
