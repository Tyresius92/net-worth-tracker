# ADR: CSS Modules for Component Styling

**Status:** Accepted

---

## Context

This application is built on React Router 7 (Remix's successor — see [ADR-001: React Router 7 over Next.js](ADR-001-framework-react-router.md)), which has a strong architectural philosophy favoring browser fundamentals and static, build-time CSS over JavaScript-heavy runtime styling solutions.

The governing principle behind this decision:

> **The design system owns styles. The application owns business logic.** Consumers of components get the styles they get — styling decisions are not distributed across the application.

This principle rules out any approach that encourages utility-class usage at the call site or requires the consuming application to make visual decisions that belong to the design system.

## Options Considered

### Tailwind CSS

Tailwind has first-class support in React Router and is commonly recommended. It was rejected on philosophical grounds: utility classes scatter styling decisions throughout JSX, making the design system a loose set of guardrails rather than an authoritative source. Long `className` strings are difficult to reason about and organize without additional tooling. More fundamentally, Tailwind inverts the ownership model — the application ends up making visual decisions that should belong to the design system.

### styled-components

The author's preferred tool in other contexts. Technically compatible with Remix/React Router but requires additional configuration and goes against the framework's grain. More fundamentally, styled-components is a runtime solution — styles are computed in JavaScript — which contradicts both the framework philosophy and the goal of producing static, build-time CSS.

### Vanilla CSS

The most idiomatic Remix/React Router choice. However, Remix's `links` export pattern made component-level style colocation painful: every component exporting CSS required a corresponding `links` export, and every route using that component had to spread those links into its own `links` function. As the component library grew, this created real maintenance overhead and added noise to every route file.

### CSS Modules

**Chosen.**

## Decision

Use CSS Modules for all component-level styles. Global CSS custom properties serve as the design token layer — colors, spacing, typography — referenced by component styles but defined centrally.

CSS Modules solve the concrete problem with vanilla CSS: Vite handles them automatically, so styles colocate with their component file without requiring manual link spreading in every consuming route. Styles remain static and extracted at build time, fully aligned with the framework's philosophy.

The token layer lives in global CSS files by design. Tokens are inherently global — they define the visual language of the application, not individual components. Components reference tokens; they do not define them.

## Consequences

**Positive:**
- Style colocation without route-level boilerplate — `.module.css` files live next to their component file
- No runtime CSS computation; styles are static and extracted at build time
- Clear architectural boundary: the design system is the authoritative source for all visual decisions
- Fully aligned with React Router's philosophy; no additional framework configuration required

**Negative / Tradeoffs:**
- CSS Modules' local scoping is likely unnecessary given the design system structure — styles are already well-bounded by component ownership. The module mechanism earns its place through colocation and Vite's automatic bundling, not through CSS isolation per se.
- Requires moving away from styled-components, the author's preferred tool in other contexts.
