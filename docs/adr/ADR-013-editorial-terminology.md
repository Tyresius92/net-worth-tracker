# ADR: Editorial Vocabulary for User-Facing Text

**Status:** Accepted

---

## Context

ADR-009 established a monochrome, newspaper-inspired visual direction for the application. The decision rests on a specific framing: this is a financial newspaper that reports what is true, not a consumer product that encourages action. The typefaces, the color restraint, the typographic hierarchy — all of it builds toward a coherent conceptual identity.

That framing stops at the visual layer. The text throughout the application uses the generic vocabulary of personal finance software: accounts, balances, login, manual. These terms are legible but neutral; they belong to every financial application equally. They do not belong to a publication.

If the application is a newspaper, its language should reflect that. A newspaper does not have users who log in to check their account balances — it has subscribers who present credentials to access their record. The conceptual vocabulary is part of the product, not decoration added to it.

## Decision

Adopt a closed vocabulary of six terms for all user-facing text. These terms are not arbitrary renaming; they extend the publication metaphor from visuals into language.

| Term | Maps to | Usage examples |
|---|---|---|
| **Press credentials** | Login — email, password, authentication | *Apply for credentials · Present credentials · Credentials not recognized · Credentials last updated May 14, 2026* |
| **The record** | The user's data: their history, chart, and accumulated figures | *It opens a record, and a daily chart that begins the morning after · Record created · No record found* |
| **Sources** | Individual accounts — Chase Checking, a savings bond, the mortgage | *Add a source · No sources added · Sources · Chase Checking ••4821* |
| **Figures** | Balance snapshots — the number reported by a source on a given day | *Figure as of May 27 · Latest figure · Last figure reported May 14* |
| **Wire services** | Plaid-linked institutions — external sources that file figures automatically | *Wire services · Chase · Wire service interrupted — repair connection · Figures arrive daily from this wire service* |
| **Staff-reported** | Manual accounts — figures the user enters themselves | *Staff-reported · This source has not been updated in 30 days · Last reported: May 14, 2026* |

**Where this applies:**
All user-visible strings — headings, labels, button text, error messages, link text, empty states, email copy.

**Where this does not apply:**

- Prisma model names, database fields, and server-side variable names — these are internal identifiers; renaming them would create a gap between code conventions and database reality for no user-facing benefit
- The privacy policy — a legal document that references Plaid Inc. by name and describes financial institution credentials in standard legal language; editorial vocabulary would create ambiguity in a document where precision is required
- Form field type labels — the inputs labeled `Email address` and `Password` describe the type of data being entered; they are not the conceptual term for authentication
- Validation-only error messages — `Password is too short`, `Email is invalid`, and similar messages describe form input constraints, not the application's conceptual vocabulary

**Why the specific terms:**
Each term was chosen for its resonance with the publication metaphor:

- *Press credentials* — journalist accreditation. A subscriber earns access through registration, not simply by existing.
- *The record* — both the newspaper morgue file and the financial history: a document of what has been true over time.
- *Sources* — a journalist's sources file figures; the application's sources do the same.
- *Figures* — a number in print: factual, reported, not editorialized.
- *Wire services* — news agencies that file reports automatically on a schedule (AP, Reuters). Plaid-linked institutions do the same: they file figures daily without human intervention.
- *Staff-reported* — a byline for figures entered by the subscriber directly, distinguishing them from wire-sourced data.

**Relationship to ADR-009:**
This decision extends ADR-009's visual direction into language. ADR-009 established the principle that design decisions should all build toward a single central concept. Language is a design decision.

## Consequences

**Positive:**

- The publication metaphor is coherent at every layer of the product — visual, typographic, and linguistic — rather than stopping at the visual surface
- The vocabulary is distinctive; no other personal finance application uses this framing
- The closed vocabulary functions as a constraint: every new user-facing string must pass through the glossary, which keeps future additions consistent

**Negative / Tradeoffs:**

- The terms require a learning curve for new contributors — a developer familiar with fintech UI conventions will reach for "account" and "balance" instinctively
- The vocabulary must be documented clearly; undocumented, it looks like inconsistency rather than intentional design
- Some terms are contextually ambiguous on first encounter ("wire services," "staff-reported") and depend on the surrounding context and design to read correctly; used carelessly, they obscure rather than illuminate
