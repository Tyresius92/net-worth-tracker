# ADR: Manual Form Validation over Schema Validation Library

**Status:** Accepted

---

## Context

Form validation in this application is handled inline in React Router action functions: `formData.get()` followed by manual type checks and early returns. A code review flagged this as a maintenance and security concern, citing the absence of a schema validation library, no centralized validation rules, and no type narrowing from validated inputs.

Zod is the standard schema validation library in the Remix and React Router ecosystem. The review specifically referenced it, and a Prisma-to-Zod code generator (`zod-prisma-types`) exists that can produce Zod schemas directly from `schema.prisma`. This seemed worth examining closely before accepting the recommendation.

## Options Considered

### Zod with Prisma codegen (`zod-prisma-types`)

`zod-prisma-types` generates Zod schemas from the Prisma schema, producing validators like `AccountSchema` and `BalanceSnapshotSchema` that mirror the database model types. This was the most appealing option — auto-generation avoids writing schemas by hand and keeps them in sync with the data model.

**Not chosen.** The generated schemas validate the _stored_ shape of a record — `amount` as an integer in cents, `dateTime` as a `Date` object. Form inputs from the browser are a different shape entirely: `amount` arrives as a float string like `"1234.56"`, `dateTime` as `"2024-01-15"`. The conversion logic between those shapes (parsing, scaling, date construction) is exactly the part that requires validation. The generated schemas validate the output after that conversion, not the input that needs it. The integration is most useful when an API accepts payloads that directly match Prisma model types; it does not materially help with browser form validation.

### Zod without codegen

Zod's most meaningful benefit in this context is the combination of type narrowing and declarative schema reuse: define a schema once, call `.parse()` or `.safeParse()`, and receive a correctly-typed value without manual `typeof` checks.

**Not chosen.** The case for it is real but marginal here:

- **Type narrowing is already present.** The review noted "no type narrowing from validated input (just casting)" — but the current code uses `typeof x !== "string"` guards, which do give TypeScript proper narrowing. There are no unsafe casts.
- **Centralization matters at scale.** Sharing validation rules across many forms, many engineers, or many code paths is where a schema library earns its weight. This application has a small, fixed number of forms and a single author.
- **The duplication problem is real but small.** The `new` and `edit` account routes contained identical validation logic — a concrete maintenance issue. That is addressable without a library.
- **Dependency cost is non-zero.** Zod is a stable, well-maintained library with extremely low abandonment risk. That said, adding a dependency for marginal benefit in a scope-stable project is a cost worth avoiding on principle (see [ADR-003: SQLite over PostgreSQL](ADR-003-database-sqlite.md) for the same reasoning applied to infrastructure).

### Manual validation with shared helpers

**Chosen.**

Address the concrete problems identified in the review directly, without adding a dependency.

## Decision

Keep form validation manual, but fix the two real defects the review surfaced.

**The `parseFloat` bug.** The balance snapshot `new` and `edit` routes accepted any non-empty string for the `amount` field and called `parseFloat` on it without checking the result. `parseFloat("anything non-numeric")` returns `NaN`; `NaN * 100` is `NaN`; and `NaN` written to the database as an integer balance is a silent data corruption. The fix is an `isNaN` guard immediately after the string check.

**Duplicated account validation.** The `accounts/new` and `accounts/$accountId/edit` routes contained identical logic for validating `customName` and `type`. This was extracted into a single `validateAccountForm(formData)` function in `accountUtils.ts`, returning a discriminated union (`{ success: true, data }` / `{ success: false, errors }`). Both routes now call this function and destructure the result. TypeScript narrows correctly through the discriminant — the same guarantee Zod's `.safeParse()` would provide, with no additional dependency.

The type narrowing question raised in the review is answered by this pattern: a function that returns a typed discriminated union is semantically equivalent to `z.safeParse()` for the purposes of narrowing. The difference is that the schema-as-value approach Zod offers scales better when schemas need to be composed, reused across many call sites, or introspected at runtime. None of those conditions apply here.

If this application were to grow significantly — many more forms, shared validation across client and server, multiple contributors — Zod would become the right answer. The current scope does not warrant it.

## Consequences

**Positive:**

- No new dependency added to a scope-stable project
- The `parseFloat` NaN bug is fixed in both balance routes; financial data is no longer at risk of silent corruption
- Account form validation is centralized in one function, eliminating the duplication between `new` and `edit` routes
- Type narrowing at validation boundaries is explicit and correct without a library

**Negative / Tradeoffs:**

- Shared validation helpers must be maintained manually; a schema library would enforce consistency more mechanically as the form count grew
- Composing complex validation rules (nested objects, conditional fields, cross-field constraints) is more verbose with manual helpers than with Zod's combinator API — not a current concern, but a real ceiling
- Reviewers familiar with the Remix ecosystem will expect Zod; this ADR exists to document that its absence is intentional
