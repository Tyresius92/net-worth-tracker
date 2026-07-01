# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A personal net worth tracking application built after Mint's shutdown. It automatically syncs bank balances via Plaid, tracks historical net worth over time using daily snapshots, and presents the data as a calm "financial status console" — intentionally boring by design. The visual direction is newspaper-inspired: monochrome, typography-forward, hierarchical. Color is used only when it carries meaning.

The application is open to public registration. Every query is scoped to the authenticated user — there is no admin data access path; the `role` field on `User` is a remnant of an abandoned Stripe implementation and has minimal current use.

Architectural decisions are documented in [`docs/adr/`](docs/adr/). Read these before making significant structural choices — many "obvious" alternatives (Tailwind, Zod, PostgreSQL, Next.js) were considered and explicitly rejected with documented reasoning.

## How we work

**Ask before assuming.** When there is any ambiguity about what is wanted — in scope, design, behavior, or implementation — ask rather than guess. Do not make assumptions and proceed. This applies even if clarification takes many rounds of back-and-forth. A wrong implementation that must be undone costs more than the time spent clarifying.

**One logical unit at a time.** Break all work into discrete steps. Complete one step, report what was done, and wait for explicit approval before beginning the next.

**Verify before declaring done.** After completing any coding task, run the full verification suite (`/ship-check`) before reporting the task as complete. If a check fails, fix it and re-run. Only declare done when all checks are green.

**Tests are part of the task, not a follow-up.** Every implementation task that writes or modifies production code must include tests. Before writing any code, the plan must identify:

- Which Vitest unit tests to write (colocated with source: `app/path/to/file.test.ts`)
- Which Playwright e2e tests to write (in `tests/as_user/`, `tests/as_admin/`, etc.), if the change has a user-visible behavior
- Or a specific reason why tests are not applicable for this change (e.g. pure config change, CSS-only, types-only)

Do not exit plan mode without a Testing section that lists specific Vitest and/or Playwright test files to create or modify, or a specific reason why no tests apply.

Use Vitest for: utility functions, server-side logic, data transformations, model functions, React components that don't require a full React Router server (design system components, standalone reusable components, custom hooks — a MemoryRouter is fine).
Use Playwright for: page flows, form submissions, auth behavior, UI interactions the user would perform.
Both may be needed for a single feature.

**Do not import route `action` or `loader` functions directly in Vitest tests.** Playwright is always the right tool for testing route actions because it exercises the full request cycle through the UI. The sole exception is headless API endpoints with no UI (e.g., webhook receivers). If you believe a direct action import is necessary, ask before proceeding.

## Commands

This project uses Node v24. There is a `.nvmrc` file in the root of the directory with the specific pinned version.

Always run commands using Node v24.

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
npm run test:e2e:dev         # open Playwright in UI mode
npm run test:e2e:run         # run Playwright headless

# Database
npm run setup                          # generate + migrate + seed
npm run dev:db:reset                   # reset dev database
npm run test:db:reset                  # reset test database
npx prisma migrate dev --name <name>   # create a migration
```

## Architecture

### Framework and routing

React Router v8. Routes are defined in [`app/routes.ts`](app/routes.ts) using the programmatic config API (`route()`, `index()`, `layout()`). Each route lives in its own directory under `app/routes/` and exports a `loader`, `action`, and default component. Route types are auto-generated into `+types/` files — run `npm run typecheck` to regenerate them. The path alias `~/` maps to `app/`.

**Naming conventions — these apply everywhere: route paths, file names, folder names, and Playwright test file names:**

| Segment type             | Convention   | Example                             |
| ------------------------ | ------------ | ----------------------------------- |
| Static route segments    | `snake_case` | `forgot_password`, `recovery_codes` |
| Dynamic route parameters | `camelCase`  | `:itemId`, `:accountId`             |
| File and folder names    | `snake_case` | `forgot_password/route.tsx`         |

**Never use kebab-case** — not in route paths, not in file names, not in folder names. This includes settings sub-routes, auth routes, and Playwright test filenames.

Example route path: `/plaid_items/:itemId/update`
Example file path: `app/routes/plaid_items/$itemId/update/route.tsx`

**Exception:** `.claude/skills/<name>/` directory names use `kebab-case`, matching Anthropic's Agent Skills convention (the directory name becomes the `/<name>` command). This is the only place in the repo where kebab-case is correct.

This convention also applies to all URL strings in code: `redirect("/forgot_password")`, `<Link to="/settings/recovery_codes">`, and URL constructions like `` `${origin}/verify_email?token=${token}` ``.

### Data layer

Prisma ORM over SQLite. The schema is at [`prisma/schema.prisma`](prisma/schema.prisma). All models must have `id` (cuid), `createdAt`, and `updatedAt` — copy from an existing model exactly. Model names are PascalCase; field names are camelCase; enum values are snake_case.

Sensitive fields (Plaid tokens, institution names, account masks) are encrypted at rest using `prisma-field-encryption`. The `prisma` client singleton is exported from [`app/db.server.ts`](app/db.server.ts).

The test suite uses a separate database configured in `.env.test`. `vitest.config.ts` loads that file automatically. `test/global-setup.ts` resets and migrates the test database before each run.

### Balance storage model

Balances are stored as **integers in cents** (e.g., $12.34 → `1234`). Plaid floats are converted on ingest; `formatCurrency` in [`app/utils/currencyUtils.ts`](app/utils/currencyUtils.ts) converts back at display time. This is a deliberate correctness decision — never store or pass floats for monetary values.

Each `BalanceSnapshot` has a `dateTime` field (when the balance was true) distinct from `createdAt`/`updatedAt` (when the record was written). `fillDailyBalanceDayData` in [`app/utils/balanceUtils.ts`](app/utils/balanceUtils.ts) carries the last known balance forward through any gaps — charts always show a complete daily timeline.

Multiple snapshots on the same day are allowed; last one written wins. Balance refreshes are triggered by Plaid webhooks (`POST /api/subscriptions/plaid`) in response to `TRANSACTIONS` events and `LOGIN_REPAIRED` signals. Each webhook creates a new snapshot rather than upserting.

### Component system

Before beginning any task that involves routes, components, or anything user-facing, read all `.mdx` files in `app/components/`. These are the authoritative documentation for each component's supported behaviors, props, and intended use.

A custom component library lives in [`app/components/`](app/components/). The primary layout primitive is `Box` — use it for all spacing and layout instead of bespoke CSS classes. It accepts responsive spacing props prefixed by breakpoint (`xsP`, `xsPx`, `xsMt`, `lMb`, etc.) that map to CSS custom properties (`--space-N`). The `xs` breakpoint is the mobile base; each larger breakpoint cascades upward unless overridden.

Spacing tokens: `--space-{0,1,2,4,6,8,10,12,14,16,20,24,28,32,...}` (px values).
Font size tokens: `--font-size-{12,14,16,18,20,24,30,36,48,60,72}`.
Color tokens: full Radix color palette, but the monochrome direction uses only grays in practice. Color requires a semantic reason.

Component styles use CSS Modules (`.module.css` files colocated with the component). Global tokens are defined in [`app/components/_GlobalStyles/`](app/components/_GlobalStyles/).

All styles should be in the design system. Do not place `.module.css` files in the `app/routes` directory; Use existing design system components instead. CSS Modules in that directory are legacy and should not be replicated.

**Extending and creating components.** The design system exists to serve the application. When a component does not support a required behavior, or no suitable component exists, extend or create one — do not work around the gap with one-off CSS classes, bespoke wrappers, or higher-level abstractions.

- **Extending an existing component:** Propose the change first — describe the prop name, what it does, and a usage example — and wait for approval before writing any code.
- **Creating a net-new component:** Propose a full API design — component name, props, variants, when/when-not-to-use, and a usage example — and wait for approval before writing any code.

**The three-step flow for component changes** (applies when adding a new prop or meaningful behavior):

1. **Add the prop / behavior** — the code change
2. **Write tests** — unit tests covering the new behavior
3. **Update documentation** — add or update the `.mdx` file and Storybook story

Stop and wait for explicit approval between each step.

When a new prop is added, it needs a Storybook story. When a minor visual change adds a new value to an existing prop already covered by a Storybook control (e.g. a new Button variant surfaced by the existing `variant` arg), a dedicated story is probably not needed — use judgment and flag it if unclear.

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
- Playwright e2e tests are in `tests/`
- Prefer `const` arrow functions over `function` declarations everywhere except route module default exports. React Router requires a default export from each route file; use `export default function RouteComponent()` there and `const` arrow functions for everything else (helpers, utilities, loaders, actions outside of route files).
- Prefer array methods (`map`, `filter`, `reduce`, `flatMap`, `find`, `some`, `every`) over `for`, `while`, and `forEach`. Prefer methods that transform data over those that require side effects.
- Narrow `unknown` values with type guard functions rather than direct annotations or `as` assertions: `const isFoo = (value: unknown): value is Foo => ...`
- Do not use `useFetcher`. Use `Form` for all form submissions. If you believe a situation requires `useFetcher`, stop and ask before using it.

## User-facing terminology

This application uses a closed vocabulary for all user-visible text. The terms extend the newspaper/publication metaphor (see [ADR-013](docs/adr/ADR-013-editorial-terminology.md)) — do not substitute generic fintech language.

| Term                  | Maps to                                                                      | Do not write                                                   |
| --------------------- | ---------------------------------------------------------------------------- | -------------------------------------------------------------- |
| **Press credentials** | Login — email, password, authentication                                      | "login", "sign in", "account credentials"                      |
| **The record**        | The user's data: history, chart, accumulated figures                         | "account", "your data", "your file"                            |
| **Sources**           | Individual financial accounts (Chase Checking, mortgage, savings bond)       | "account", "accounts"                                          |
| **Figures**           | Balance snapshots — the number a source reports on a given day               | "balance", "balances", "snapshot"                              |
| **Wire services**     | Plaid-linked institutions — external sources that file figures automatically | "Plaid account", "institution", "linked account", "Plaid item" |
| **Staff-reported**    | Manual accounts — figures the user enters themselves                         | "manual", "manual account"                                     |

**Applies to:** headings, labels, button text, error messages, link text, empty states, email copy — any string the user sees.

**Does not apply to:**

- Prisma model names, database fields, and code variable names — keep using `account`, `balanceSnapshot`, `plaidItem`, etc.
- The privacy policy — a legal document that references Plaid Inc. by name; editorial vocabulary would create ambiguity where precision is required
- Form field type labels: `Email address` and `Password` describe the type of data being entered, not the authentication concept
- Validation messages that describe field constraints: `Password is too short`, `Email is invalid`
