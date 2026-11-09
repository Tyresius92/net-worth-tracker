# ADR: Sign-Up Abuse Protection

**Status:** Accepted. Supplements [ADR-011](ADR-011-multi-user-public-registration.md) and [ADR-012](ADR-012-email-infrastructure.md).

---

## Context

[ADR-011](ADR-011-multi-user-public-registration.md) opened the application to public registration, and [ADR-012](ADR-012-email-infrastructure.md) added Resend so that registration could send a verification email. ADR-012 assumed email volume would stay tiny and limited to account recovery. Public registration broke that assumption: anyone on the internet can now make the application send an email to any address.

In November 2026 automated form spam began hitting `/join`. Each submission put a casino promotion (for example, "🎰 Get $3000 on your bonus account… visit http://…") in the First name field and someone else's email address in the Email field. Hundreds of accounts were created.

The attack worked because of one line in the verification email: `Hi {firstName}, thanks for signing up.` Every submission caused `noreply@theledger.dev` to deliver the spammer's text and link to a third party's inbox. The application had become a spam relay. That had three costs:

- **Quota.** Resend's free tier allows 100 emails per day. The spam consumed it, which would block real verification and password-reset emails.
- **Sender reputation.** Mail sent to addresses that never asked for it, with gambling links in the body, is how a domain ends up on blocklists. Losing `theledger.dev`'s reputation would break all transactional email.
- **Data.** Hundreds of junk unverified users in the database.

The existing defense was a per-IP limit on `/join` (5 attempts per 15 minutes, in memory). It did not help, because the submissions came from many IPs.

## Options Considered

### Layered, in-application defenses

**Chosen.** Four independent layers, each cheap, with no new services:

1. **Remove user-supplied text from the email.** The verification email no longer includes the user's name. This removes the reason to attack the form: even a submission that gets through every other layer can no longer deliver a message.
2. **Validate name fields.** Names longer than 50 characters, or containing anything link-like (`://`, `http:`, `www.`, or a bare domain such as `example.com`), are rejected.
3. **Honeypot field.** The form includes an off-screen field that people never see. A submission that fills it in is silently dropped: no user is created and no email is sent. The bot sees what looks like success.
4. **Global daily cap on verification emails.** A rolling 24-hour cap, shared by every path that sends a verification email (sign-up, login by an unverified user, and the Resend button). The cap is set by the `VERIFICATION_EMAIL_DAILY_CAP` environment variable. It protects the Resend quota even if bots get past everything else.

### Cloudflare Turnstile (CAPTCHA)

The strongest single defense against automated submissions, and the domain's DNS is already on Cloudflare.

Rejected for now. It adds a third-party script to the sign-up page, a site key and secret key to manage, and friction for every real person who signs up. The first layer above already removes the reason to attack, and the remaining layers handle volume. Turnstile is the next step if spam keeps getting through.

### Making the repository private

The repository is public, so the defenses are visible to anyone. Making it private was considered so that attackers could not read how the defenses work.

Rejected. None of the defenses depend on being secret. The honeypot and the validation rules can be seen and tested from the sign-up form itself, whether or not the source is public. The most important layer, keeping user text out of the email, works even when the attacker knows about it. The one value worth keeping private, the cap size, lives in an environment variable, not in the code. The repository also stays public as a portfolio.

### Persisting the cap counter in the database or Redis

The cap counter is kept in memory, so it resets whenever the process restarts (every deploy or secret change). A counter in SQLite or Redis would survive restarts.

Rejected for now.

- **SQLite:** would need a new table or a count over existing rows. Verification tokens can't be counted, because `createEmailVerificationToken` deletes a user's previous tokens, so repeated resends would never add up.
- **Redis:** already provisioned for BullMQ ([ADR-015](ADR-015-bullmq-balance-refresh-queue.md)). But that ADR deliberately keeps Redis off primary request paths so that a Redis outage only degrades background work. Putting it in the sign-up path would undo that.

At current traffic, a cap that occasionally resets on deploy is acceptable. It matches the existing in-memory per-IP limiter.

### Deleting unverified users automatically

A scheduled job that deletes users who are still unverified after some number of days would clean up junk accounts automatically.

Not adopted. Existing spam accounts were deleted by hand. The layers above stop new ones from being created, so a recurring purge is not needed yet.

## Decision

Adopt the four layered defenses.

**Email content:** `EmailVerificationEmail` takes only a `verifyUrl` prop. The email must not include any user-supplied text. The same rule should apply to any future email sent to an address the application has not yet verified.

**Name validation:** `validateName` in `app/utils/nameValidation.ts` returns `{ success: true, data } | { success: false, error }`, following the pattern from [ADR-010](ADR-010-form-validation-approach.md).

**Honeypot:** a `Honeypot` design-system component renders the field, and `isHoneypotTripped` in `app/utils/honeypot.server.ts` checks it on the server. The field is named `website` and labelled "Leave this field empty". That label lets a bot that reads labels avoid the trap. This is deliberate and matches common practice: the honeypot is meant to catch simple bots, the label is a safety net if a screen reader or autofill tool ever reaches the field, and the other layers handle smarter bots.

**Cap:**

- `createRollingCap` in `app/utils/rate-limit.server.ts` provides `verificationEmailCap`.
- `VERIFICATION_EMAIL_DAILY_CAP` is required, with no default. An invariant stops the application at startup if it is missing or not a positive integer. Leaving out the cap should be a visible configuration error, not something that silently falls back to a default.
- When the cap is reached:
  - **Sign-up** is refused with "Applications are closed for today. Try again tomorrow." No user is created, so refusals don't leave unverified accounts behind.
  - **Login by an unverified user** still goes to the pending page, but no email is sent.
  - **Resend** shows "We couldn't send another email right now. Try again tomorrow."
- Password-reset emails do not count toward the cap and are never blocked, so existing users can always recover their accounts.

## Consequences

**Positive:**

- The form is no longer worth abusing: a successful submission delivers nothing the attacker controls.
- Resend usage for verification emails has a hard upper limit, which leaves room for password resets.
- No new third-party services, scripts, or keys. Sign-up has no added friction for real people.
- Every layer has tests. The honeypot is a documented, reusable design-system component.

**Negative / Tradeoffs:**

- **The cap resets on restart.** Each deploy or `fly secrets set` gives a fresh daily allowance. A determined attacker who sends a full cap's worth right after each deploy could still use more than the cap in a single day.
- **A capped login doesn't say that no email was sent.** An unverified user who logs in while the cap is reached sees the usual "We sent a verification link…" message, but no email arrives until they use Resend after the cap resets. This was accepted to keep the change small.
- **Real sign-ups can be refused.** If the cap is reached, whether by bots or by a genuine surge, legitimate sign-ups are turned away until the 24-hour window moves on.
- **The cap is required configuration.** Every environment (local `.env`, `.env.test`, and each Fly app's secrets) must set `VERIFICATION_EMAIL_DAILY_CAP`, or the application will not start. In production builds `tiny-invariant` removes the message, so the failure appears in logs only as `Invariant failed`.
- **The link check can reject a real name.** A name written with a dot and no space, such as "Mary.Ann", looks like a domain and is rejected. Names such as "St. John" and "J.R." pass.
- **The honeypot only stops simple bots.** Bots that read labels or run a real browser get past it. Those are left to the other layers.
