# ADR: Monochrome Visual Direction

**Status:** Accepted

---

## Context

Early versions of this application used a green color palette loosely themed around "money." The implementation was scattered and the concept was generic — color used as decoration without a guiding idea behind it.

A lecture in Josh Comeau's [Whimsical Animations](https://www.joshwcomeau.com/courses/whimsical-animations/) course posed the question: _what is the core idea of your site?_ The argument was that design decisions — animations, color, typography — should all build toward and reinforce a single central concept, rather than being applied independently. That question prompted a brainstorming session that reframed the application entirely.

The answer: this is a boring application, intentionally. It tracks what is true about your finances today. It is not exciting. It does not encourage action. It reports. That framing pointed directly to the newspaper — calm, authoritative, typography-forward, monochrome.

## Decision

Adopt a monochrome visual direction with editorial typography as the primary vehicle for visual character.

**The newspaper as the design system's north star:**
A newspaper's visual language works precisely because it restrains color. What makes a newspaper striking is hierarchy — masthead, headline, subhead, body — expressed through type rather than hue. This application's purpose maps cleanly onto that model: a primary fact (net worth), supporting context (account balances, changes), and detail available on demand.

**Typography over color:**
The typefaces — Chomsky for display, Libre Baskerville and Source Serif 4 for body — are chosen for their editorial character. They establish visual identity without requiring color to carry that weight. This approach favors restraint and hierarchy over decoration.

**Color as meaning, not decoration:**
Color is not absent — it is reserved. The governing principle:

> **Color must have a purpose. Any deviation from the monochrome baseline requires a reason.**

This applies to charts, interactive states, alerts, and any planned whimsical additions. Color earns its presence by communicating something; it is not applied because a surface feels empty.

**The Radix color palette:**
The full Radix color scale is retained in the token system despite the monochrome direction using only a small subset of it. The cost is negligible — a slightly larger CSS file that browsers cache aggressively. The benefit is flexibility: rebranding or expanding the palette requires no reconstruction, and the tokens serve as a useful reference across other projects. Radix's palette also makes dark mode straightforward to implement well, which was a secondary factor in the original selection.

## Consequences

**Positive:**

- Strong, coherent visual identity expressed primarily through typography and hierarchy
- The "color has purpose" principle keeps future additions coherent — every color decision is evaluated against a clear standard
- Monochrome palette pairs naturally with dark mode; Radix handles light/dark token mapping cleanly
- Distinctive in a category (personal finance) that tends toward data-dense, color-heavy UI

**Negative / Tradeoffs:**

- Restraint requires ongoing discipline — the temptation to add color for visual interest rather than meaning is a real design risk as the application grows
- The full Radix palette in the token system overstates the color vocabulary actually in use; the gap between available and used tokens may cause confusion during future development
