# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A personal net worth tracking application built after Mint's shutdown. It automatically syncs bank balances via Plaid, tracks historical net worth over time using daily snapshots, and presents the data as a calm "financial status console" — intentionally boring by design. The visual direction is newspaper-inspired: monochrome, typography-forward, hierarchical. Color is used only when it carries meaning.

The application is open to public registration. Every query is scoped to the authenticated user — there is no admin data access path; the `role` field on `User` is a remnant of an abandoned Stripe implementation and has minimal current use.

Architectural decisions are documented in [`docs/adr/`](docs/adr/). Read these before making significant structural choices — many "obvious" alternatives (Tailwind, Zod, PostgreSQL, Next.js) were considered and explicitly rejected with documented reasoning.

## Commands

This project uses Node v22. There is a `.nvmrc` file in the root of the directory with the specific pinned version.

Always run commands using Node v22.

```bash
npm run dev           # start dev server (http://localhost:3000)
npm run build         # production build
npm run typecheck     # react-router typegen + tsc
npm run lint          # eslint
npm run format        # prettier --write

# Tests
npm test                     # vitest (watch mode)
npm test -- --run            # vitest (single run)
npm test -- --run path/to/file.test.ts   # run a single test file
npm run test:e2e:dev         # open Cypress in dev mode
npm run test:e2e:run         # run Cypress headless (Firefox)

# Database
npm run setup                          # generate + migrate + seed
npm run dev:db:reset                   # reset dev database
npm run test:db:reset                  # reset test database
npx prisma migrate dev --name <name>   # create a migration
```

## Architecture

### Framework and routing

React Router v7. Routes are defined in [`app/routes.ts`](app/routes.ts) using the programmatic config API (`route()`, `index()`, `layout()`). Each route lives in its own directory under `app/routes/` and exports a `loader`, `action`, and default component. Route types are auto-generated into `+types/` files — run `npm run typecheck` to regenerate them. The path alias `~/` maps to `app/`.

File and folder names use snake_case.
Routes also use snake_case - do not use kebab-case.
Route parameters use camelCase.

Example: `/plaid_items/:itemId/update/route.tsx`

### Data layer

Prisma ORM over SQLite. The schema is at [`prisma/schema.prisma`](prisma/schema.prisma). All models must have `id` (cuid), `createdAt`, and `updatedAt` — copy from an existing model exactly. Model names are PascalCase; field names are camelCase; enum values are snake_case.

Sensitive fields (Plaid tokens, institution names, account masks) are encrypted at rest using `prisma-field-encryption`. The `prisma` client singleton is exported from [`app/db.server.ts`](app/db.server.ts).

The test suite uses a separate database configured in `.env.test`. `vitest.config.ts` loads that file automatically. `test/global-setup.ts` resets and migrates the test database before each run.

### Balance storage model

Balances are stored as **integers in cents** (e.g., $12.34 → `1234`). Plaid floats are converted on ingest; `formatCurrency` in [`app/utils/currencyUtils.ts`](app/utils/currencyUtils.ts) converts back at display time. This is a deliberate correctness decision — never store or pass floats for monetary values.

Each `BalanceSnapshot` has a `dateTime` field (when the balance was true) distinct from `createdAt`/`updatedAt` (when the record was written). `fillDailyBalanceDayData` in [`app/utils/balanceUtils.ts`](app/utils/balanceUtils.ts) carries the last known balance forward through any gaps — charts always show a complete daily timeline.

Multiple snapshots on the same day are allowed; last one written wins. The daily refresh job (triggered via GitHub Actions → `POST /api/accounts/refresh` with a Bearer token) creates a new snapshot each run rather than upserting.

### Component system

A custom component library lives in [`app/components/`](app/components/). The primary layout primitive is `Box` — use it for all spacing and layout instead of bespoke CSS classes. It accepts typed spacing props (`p`, `px`, `py`, `pt`, `pb`, `pl`, `pr`, `m`, `mx`, etc.) that map to CSS custom properties (`--space-N`).

Spacing tokens: `--space-{0,1,2,4,6,8,10,12,14,16,20,24,28,32,...}` (px values).
Font size tokens: `--font-size-{12,14,16,18,20,24,30,36,48,60,72}`.
Color tokens: full Radix color palette, but the monochrome direction uses only grays in practice. Color requires a semantic reason.

Component styles use CSS Modules (`.module.css` files colocated with the component). Global tokens are defined in [`app/components/_GlobalStyles/`](app/components/_GlobalStyles/).

All styles should be in the design system. Do not place `.module.css` files in the `app/routes` directory; Use existing design system components instead. CSS Modules in that directory are legacy and should not be replicated. If something cannot be implemented with existing functionality, flag this for the user and ask for guidance on how to proceed.

Charts use Recharts and must render **client-side only** — Recharts does not support SSR. Use a `clientOnly` guard or lazy import when adding chart components.

### Form validation

No Zod. Validation is done manually in action functions using `formData.get()` + `typeof` guards. Shared validation logic is extracted into helper functions that return a discriminated union `{ success: true, data } | { success: false, errors }` — see `validateAccountForm` in [`app/utils/accountUtils.server.ts`](app/utils/accountUtils.server.ts) as the pattern to follow.

### Authentication

Session-based auth via [`app/session.server.ts`](app/session.server.ts). 2FA (TOTP) is required for all users. Use `requireUser(request)` or `requireUserId(request)` at the top of every protected loader/action.

### Email

Resend + React Email. In non-production environments, `sendEmail` (from [`app/utils/email.server.ts`](app/utils/email.server.ts)) logs to the console instead of sending. Email templates live in [`app/emails/`](app/emails/) as React components — they must use inline styles (no CSS variables; email clients don't support them).

## Code conventions

- Named imports only: `import { x } from "..."` not `import * as X from "..."`
- Use `Box` component props for all layout and spacing — don't add one-off CSS classes
- Server-only modules use `.server.ts` suffix
- Test files colocate with the file they test (`.test.ts` / `.test.tsx`)
- Cypress e2e tests are in `cypress/e2e/`; use `cy.visitAndCheck()` (custom command) instead of bare `cy.visit()`
  - Exception: if a redirect is expected (e.g. on a protected route), use `cy.visit()` and assert on the new expected URL separately.
