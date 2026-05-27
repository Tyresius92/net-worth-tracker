import process from "node:process";
import { isbot } from "isbot";
import * as Sentry from "@sentry/react-router";

Sentry.init({
  dsn: "https://6e947b5e11dca72072823b8789a39032@o4511327942475776.ingest.us.sentry.io/4511327945490432",
  enabled: process.env.NODE_ENV === "production",
  environment: process.env.APP_ENV ?? process.env.NODE_ENV,

  enableLogs: true,

  // Drop all bot/crawler transactions; sample 10% of real user transactions
  tracesSampler(samplingContext) {
    const ua = samplingContext.normalizedRequest?.headers?.["user-agent"] ?? "";
    if (ua && isbot(ua)) return 0;
    return 0.1;
  },

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
