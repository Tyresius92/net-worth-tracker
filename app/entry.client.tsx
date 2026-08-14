/**
 * By default, Remix will handle hydrating your app on the client for you.
 * You are free to delete this file if you'd like to, but if you ever want it revealed again, you can run `npx remix reveal` ✨
 * For more information, see https://remix.run/docs/en/main/file-conventions/entry.client
 */
import {
  init,
  reactRouterTracingIntegration,
  replayIntegration,
  sentryOnError,
} from "@sentry/react-router";
import { isbot } from "isbot";
import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { HydratedRouter } from "react-router/dom";
import invariant from "tiny-invariant";

invariant(typeof import.meta.env.APP_ENV === "string", "APP_ENV not set");

init({
  dsn: "https://e0392dd2f70d02d9425eb626235f59db@o4511593609297920.ingest.us.sentry.io/4511593609560064",
  enabled: import.meta.env.MODE === "production",
  environment: import.meta.env.APP_ENV,
  integrations: [reactRouterTracingIntegration(), replayIntegration()],
  enableLogs: true,
  tracePropagationTargets: [/^\//],
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Drop all bot/crawler transactions; trace all real user transactions
  tracesSampler() {
    if (isbot(navigator.userAgent)) {
      return 0;
    }
    return 1;
  },

  // Suppress React Router 404s that fire when crawlers hit non-existent paths
  ignoreErrors: [/No routes matched location/],

  beforeSend(event) {
    if (isbot(navigator.userAgent)) {
      return null;
    }
    return event;
  },
});

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <HydratedRouter onError={sentryOnError} />
    </StrictMode>,
  );
});
