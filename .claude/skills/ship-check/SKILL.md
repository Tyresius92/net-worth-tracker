---
name: ship-check
description: Run the full verification suite to match CI — use after completing any implementation task, or when asked to verify, check, or confirm the code is ready to ship. Checks run in priority order: typecheck, unit tests, build, E2E, lint, then format last. Format failures are auto-fixed; all other failures trigger a full re-run from the top.
---

Run the full verification suite. Execute each check in order, stopping at the first failure. Fix the issue, then re-run according to the rules below. Only declare success after all six checks pass in sequence.

## Checks (run in this order)

1. **Typecheck** — `npm run typecheck`
2. **Unit tests** — `npm test -- --run`
3. **Build** — `npm run build`
4. **E2E tests** — `npx playwright test`
5. **Lint** — `npm run lint`
6. **Format** — `npx prettier --check .`

## Behavior on failure

**Steps 1–5 (typecheck, unit tests, build, E2E, lint):**

- Fix the issue (type errors, test failures, build errors, lint violations).
- For lint: first attempt auto-fix with `npx eslint --fix .`, then manually fix any remaining violations that ESLint cannot auto-fix.
- After fixing, **re-run the full suite from step 1**. A code change that fixes a later step can break an earlier one.

**Step 6 (format):**

- Auto-fix by running `npm run format`.
- Re-run **only the format check** (`npx prettier --check .`) to confirm. Prettier changes cannot break compilation, tests, or lint, so a full re-run is not needed.

## Done

Report what was fixed (if anything) and confirm all six checks are green.
