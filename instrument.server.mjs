import process from "node:process";
import { isbot } from "isbot";
import { nodeProfilingIntegration } from "@sentry/profiling-node";
import * as Sentry from "@sentry/react-router";

Sentry.init({
  dsn: "https://e0392dd2f70d02d9425eb626235f59db@o4511593609297920.ingest.us.sentry.io/4511593609560064",
  enabled: true, // process.env.NODE_ENV === "production",
  environment: process.env.APP_ENV ?? process.env.NODE_ENV,

  enableLogs: true,

  integrations: [
    // Skip span creation entirely for the Fly health-check probe and the
    // self-referential HEAD request it triggers, plus known bot-probe paths.
    // These have no product value and would otherwise be traced like real traffic.
    Sentry.httpIntegration({
      ignoreIncomingRequests: (urlPath, request) => {
        if (urlPath === "/healthcheck") return true;
        if (request.method === "HEAD" && urlPath === "/") return true;
        if (urlPath.startsWith("/wp-admin") || urlPath.startsWith("/wp-login"))
          return true;
        return false;
      },
    }),
    nodeProfilingIntegration(),
  ],

  // Drop all bot/crawler transactions; trace all real user transactions
  tracesSampler(samplingContext) {
    const ua = samplingContext.normalizedRequest?.headers?.["user-agent"] ?? "";
    if (ua && isbot(ua)) return 0;
    return 1;
  },

  // Profile every session; actual profiling only runs while there's a sampled
  // root span, so this effectively matches the tracesSampler rate above.
  profileSessionSampleRate: 1,
  profileLifecycle: "trace",

  beforeSend(event) {
    // Drop bot-generated events
    const ua = event.request?.headers?.["user-agent"] ?? "";
    if (ua && isbot(ua)) return null;

    if (event.exception) {
      const error = event.exception.values?.[0];
      if (
        error?.type === "NotFoundException" ||
        error?.value?.includes("404") ||
        // getInternalRouterError 404s: "No routes matched location '...'"
        error?.value?.startsWith("No routes matched location")
      ) {
        return null;
      }
    }

    // Drop events for paths crawlers probe but the app will never serve
    const url = event.request?.url ?? "";
    const botProbes = [
      ".env",
      "wp-admin",
      "wp-login",
      "phpmyadmin",
      ".git/",
      "xmlrpc",
    ];
    if (botProbes.some((p) => url.includes(p))) return null;

    return event;
  },
});
