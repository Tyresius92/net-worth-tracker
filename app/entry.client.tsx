/**
 * By default, Remix will handle hydrating your app on the client for you.
 * You are free to delete this file if you'd like to, but if you ever want it revealed again, you can run `npx remix reveal` ✨
 * For more information, see https://remix.run/docs/en/main/file-conventions/entry.client
 */
import {
  init,
  reactRouterTracingIntegration,
  replayIntegration,
} from "@sentry/react-router";
import { isbot } from "isbot";
import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { HydratedRouter } from "react-router/dom";

init({
  dsn: "https://6e947b5e11dca72072823b8789a39032@o4511327942475776.ingest.us.sentry.io/4511327945490432",
  enabled: import.meta.env.MODE === "production",
  environment: import.meta.env.APP_ENV ?? import.meta.env.MODE,
  integrations: [reactRouterTracingIntegration(), replayIntegration()],
  enableLogs: true,
  tracePropagationTargets: [/^\//],
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Drop all bot/crawler transactions; sample 10% of real user transactions
  tracesSampler() {
    if (isbot(navigator.userAgent)) {return 0;}
    return 0.1;
  },

  // Suppress React Router 404s that fire when crawlers hit non-existent paths
  ignoreErrors: [/No routes matched location/],

  beforeSend(event) {
    if (isbot(navigator.userAgent)) {return null;}
    return event;
  },
});

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <HydratedRouter />
    </StrictMode>,
  );
});
