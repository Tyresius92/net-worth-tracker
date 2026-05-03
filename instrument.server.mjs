import process from "node:process";
import * as Sentry from "@sentry/react-router";

Sentry.init({
  dsn: "https://6e947b5e11dca72072823b8789a39032@o4511327942475776.ingest.us.sentry.io/4511327945490432",
  enabled: process.env.NODE_ENV === "production",
  environment: process.env.APP_ENV ?? process.env.NODE_ENV,

  // Enable logs to be sent to Sentry
  enableLogs: true,

  tracesSampleRate: 1.0,

  // Set up performance monitoring
  beforeSend(event) {
    // Filter out 404s from error reporting
    if (event.exception) {
      const error = event.exception.values?.[0];
      if (
        error?.type === "NotFoundException" ||
        error?.value?.includes("404")
      ) {
        return null;
      }
    }
    return event;
  },
});
