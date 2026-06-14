Run the full verification suite to match CI. Execute each check in order and stop at the first failure. Fix any issues found, then re-run from the beginning. Only report success after all checks pass.

## Checks (run in this order)

1. **Lint** — `npm run lint`
2. **Format** — `npx prettier --check .`
3. **Typecheck** — `npm run typecheck`
4. **Unit tests** — `npm test -- --run`
5. **Build** — `npm run build` (required before Playwright)
6. **E2E tests** — `npx playwright test`

## Behavior

- Stop at the first failure.
- Fix the issue (lint errors, type errors, formatting, test failures, etc.).
- Re-run the full suite from step 1.
- Repeat until all six checks pass.
- Report what was fixed and confirm all checks are green.
