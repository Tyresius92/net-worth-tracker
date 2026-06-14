import * as Sentry from "@sentry/react-router";

export type LogContext = Record<string, unknown>;

interface LoggerInterface {
  error(errorOrMessage: Error | string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  setUser(user: { id: string } | null): void;
}

export const logger: LoggerInterface = {
  error(errorOrMessage, context) {
    if (errorOrMessage instanceof Error) {
      Sentry.withScope((scope) => {
        if (context) {scope.setExtras(context);}
        Sentry.captureException(errorOrMessage);
      });
    } else {
      Sentry.captureMessage(errorOrMessage, { level: "error", extra: context });
    }
  },

  warn(message, context) {
    Sentry.captureMessage(message, { level: "warning", extra: context });
  },

  info(message, context) {
    Sentry.addBreadcrumb({ message, level: "info", data: context });
  },

  setUser(user) {
    Sentry.setUser(user);
  },
};
