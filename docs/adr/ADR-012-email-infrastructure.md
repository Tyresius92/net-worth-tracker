# ADR: Email Infrastructure — Resend and React Email

**Status:** Accepted

---

## Context

The application was originally architected as a single-user system. In that context, email capability was unnecessary: account recovery could be handled through direct database access, and there were no other users for whom self-service flows would be needed. ADR-004 documents this explicitly.

ADR-011 amends that constraint: the application now supports public registration. With real users who do not have database access, self-service account recovery — specifically, password reset and 2FA backup flows — requires the ability to send transactional email. Without it, any locked-out user other than the database owner has no recovery path.

This ADR documents the selection of an email delivery provider and email templating library to establish that capability. It covers only the infrastructure layer; the specific recovery flows that will use it are documented separately as they are implemented.

## Options Considered

### No email — admin-assisted recovery only

The original posture. When the application had one user, this was a reasonable stance: a locked-out user is also the person with database access, and direct intervention is always available.

Rejected as a long-term approach because it does not scale beyond a single user. Any additional user who loses their password or their authenticator device has no self-service path, and every recovery event requires manual intervention from the application owner. This is both poor UX and an operational burden that grows with user count.

### Nodemailer with a third-party SMTP provider

Nodemailer is the most established Node.js email library and supports any SMTP backend — AWS SES, Mailgun, Gmail, or a self-hosted server. It would provide maximum control over the delivery infrastructure.

Rejected because it requires selecting, configuring, and maintaining a separate SMTP provider in addition to the library itself. At the volume this application will ever reach (a small number of transactional emails for account recovery), the operational overhead is not justified. The lower-level control Nodemailer provides offers no concrete benefit at this scale.

### SendGrid

A mature, full-featured transactional email platform. Technically sound and widely used.

Rejected primarily because its free tier (100 emails/day) is sufficient but its API surface and dashboard are heavier than needed. More relevantly, it does not offer a first-class React-native templating story, which would mean maintaining email templates as HTML strings — a worse developer experience given the existing React codebase.

### Mailgun

Similar profile to SendGrid. REST API, reliable delivery, SMTP relay available.

Rejected for the same reasons as SendGrid: appropriate for the scale but carries more complexity than needed, and no meaningful advantage over Resend for this use case.

### Resend

**Chosen.**

## Decision

Use Resend as the email delivery provider, with React Email (v6) for email template authoring and `@react-email/render` for server-side rendering to HTML.

**Why Resend:**
Resend is a transactional email API built with a developer-first approach and a deliberately narrow scope. Its SDK (`resend` npm package) is small and has no unnecessary abstractions — sending an email is a single function call. Its free tier (3,000 emails/month, 100/day) exceeds what this application will ever consume for account recovery flows. Critically, Resend has first-class support for React Email templates, which means email template code lives in the same language and component model as the rest of the application.

**Why React Email v6:**
React Email v6 consolidates what were previously many separate `@react-email/*` packages into a single `react-email` package. Email components (`Html`, `Body`, `Section`, `Button`, etc.) are imported directly from `react-email`. Server-side rendering to an HTML string — what Resend's API accepts — is handled by `@react-email/render`. This means email templates are authored as standard React components with inline styles, type-checked by the existing TypeScript setup, and readable by anyone already familiar with the codebase.

**Domain and sending address:**
The domain `theledger.dev` was registered through Cloudflare Registrar. DNS management for email authentication (DKIM, SPF) is configured in Cloudflare alongside the domain's other DNS records. All transactional email is sent from `noreply@theledger.dev`. This address is not a real mailbox; replies bounce, which is standard and expected for one-way transactional email.

**Development behavior:**
In non-production environments, `sendEmail` logs the recipient, subject, and rendered HTML to the console rather than calling the Resend API. This means local development and test environments require no API key and produce no external side effects. The environment gate is explicit and located in the single `email.server.ts` utility — there is no risk of the bypass silently persisting in production.

**Environment configuration:**
Two environment variables are required in production:
- `RESEND_API_KEY` — the API key issued by Resend
- `FROM_EMAIL` — the sending address; defaults to `noreply@theledger.dev` if unset, but should be explicitly configured

Both are documented in `.env.example`.

## Consequences

**Positive:**
- Email templates are React components — they are type-checked, composable, and consistent with the rest of the codebase
- Resend's delivery logs and dashboard make it straightforward to diagnose failed or missing emails
- The free tier is more than sufficient; no cost is expected at projected volume
- Development and test environments are fully isolated from the live email service
- DNS and domain management are co-located in Cloudflare, reducing the number of external systems to maintain

**Negative / Tradeoffs:**
- Email delivery now depends on Resend as an external service; if Resend experiences an outage, transactional email fails
- A verified sending domain is required — `theledger.dev` was purchased and configured specifically for this purpose, adding a small annual cost (~$10/year)
- React email templates must use inline styles; CSS variables and external stylesheets are not supported by email clients, which means the visual design system used in the application cannot be directly shared with email templates
