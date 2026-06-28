import {
  addBreadcrumb,
  captureException,
  captureMessage,
  setUser,
  withScope,
} from "@sentry/react-router";

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
      withScope((scope) => {
        if (context) {
          scope.setExtras(context);
        }
        captureException(errorOrMessage);
      });
    } else {
      captureMessage(errorOrMessage, { level: "error", extra: context });
    }
  },

  warn(message, context) {
    captureMessage(message, { level: "warning", extra: context });
  },

  info(message, context) {
    addBreadcrumb({ message, level: "info", data: context });
  },

  setUser(user) {
    setUser(user);
  },
};
