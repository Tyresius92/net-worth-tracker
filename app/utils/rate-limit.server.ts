import invariant from "tiny-invariant";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

interface Entry {
  count: number;
  resetAt: number;
}

const store = new Map<string, Entry>();

export function isRateLimited(key: string): boolean {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now >= entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  entry.count += 1;
  return entry.count > MAX_ATTEMPTS;
}

export function getClientIp(request: Request): string {
  return (
    request.headers.get("fly-client-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * A global cap of `limit` uses per rolling `windowMs`, shared by every caller.
 * In memory, so it resets when the process restarts.
 */
export const createRollingCap = (limit: number, windowMs: number) => {
  let timestamps: number[] = [];

  return {
    /** Records a use and returns true, or returns false if the cap is reached. */
    tryConsume: (): boolean => {
      const now = Date.now();
      timestamps = timestamps.filter((time) => now - time < windowMs);
      if (timestamps.length >= limit) {
        return false;
      }
      timestamps = [...timestamps, now];
      return true;
    },
  };
};

/** Parses a positive integer cap, throwing if the value is anything else. */
export const parseCapLimit = (value: string): number => {
  invariant(
    /^\d+$/.test(value) && Number(value) > 0,
    "VERIFICATION_EMAIL_DAILY_CAP must be a positive integer",
  );
  return Number(value);
};

invariant(
  process.env.VERIFICATION_EMAIL_DAILY_CAP,
  "VERIFICATION_EMAIL_DAILY_CAP must be set",
);

/** Shared by every path that sends a verification email. Password resets are not capped. */
export const verificationEmailCap = createRollingCap(
  parseCapLimit(process.env.VERIFICATION_EMAIL_DAILY_CAP),
  DAY_MS,
);
