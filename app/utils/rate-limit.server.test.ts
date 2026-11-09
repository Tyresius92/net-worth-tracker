import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import {
  createRollingCap,
  getClientIp,
  isRateLimited,
  parseCapLimit,
} from "./rate-limit.server";

describe("isRateLimited", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns false on the first call for a new key", () => {
    expect(isRateLimited("rl-first")).toBe(false);
  });

  it("returns false for the first 5 calls (boundary)", () => {
    for (let i = 0; i < 5; i++) {
      expect(isRateLimited("rl-boundary")).toBe(false);
    }
  });

  it("returns true on the 6th call within the window", () => {
    for (let i = 0; i < 5; i++) {
      isRateLimited("rl-sixth");
    }
    expect(isRateLimited("rl-sixth")).toBe(true);
  });

  it("returns false again after the 15-minute window expires", () => {
    for (let i = 0; i < 6; i++) {
      isRateLimited("rl-reset");
    }
    expect(isRateLimited("rl-reset")).toBe(true);

    vi.advanceTimersByTime(15 * 60 * 1000 + 1);

    expect(isRateLimited("rl-reset")).toBe(false);
  });

  it("tracks different keys independently", () => {
    for (let i = 0; i < 6; i++) {
      isRateLimited("rl-key-a");
    }
    expect(isRateLimited("rl-key-a")).toBe(true);
    expect(isRateLimited("rl-key-b")).toBe(false);
  });
});

describe("getClientIp", () => {
  it("returns the fly-client-ip header value", () => {
    const req = new Request("http://localhost", {
      headers: { "fly-client-ip": "1.2.3.4" },
    });
    expect(getClientIp(req)).toBe("1.2.3.4");
  });

  it("falls back to the first x-forwarded-for address", () => {
    const req = new Request("http://localhost", {
      headers: { "x-forwarded-for": "5.6.7.8, 9.10.11.12" },
    });
    expect(getClientIp(req)).toBe("5.6.7.8");
  });

  it("trims whitespace from the x-forwarded-for address", () => {
    const req = new Request("http://localhost", {
      headers: { "x-forwarded-for": "  5.6.7.8  , 9.10.11.12" },
    });
    expect(getClientIp(req)).toBe("5.6.7.8");
  });

  it("prefers fly-client-ip over x-forwarded-for", () => {
    const req = new Request("http://localhost", {
      headers: {
        "fly-client-ip": "1.2.3.4",
        "x-forwarded-for": "5.6.7.8",
      },
    });
    expect(getClientIp(req)).toBe("1.2.3.4");
  });

  it("returns 'unknown' when no IP headers are present", () => {
    const req = new Request("http://localhost");
    expect(getClientIp(req)).toBe("unknown");
  });
});

describe("createRollingCap", () => {
  const HOUR_MS = 60 * 60 * 1000;

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const consumeTimes = (cap: { tryConsume: () => boolean }, times: number) =>
    Array.from({ length: times }, () => cap.tryConsume());

  it("allows up to the limit", () => {
    const cap = createRollingCap(3, HOUR_MS);
    expect(consumeTimes(cap, 3)).toEqual([true, true, true]);
  });

  it("refuses once the limit is reached", () => {
    const cap = createRollingCap(3, HOUR_MS);
    consumeTimes(cap, 3);
    expect(cap.tryConsume()).toBe(false);
  });

  it("does not count refused attempts against the window", () => {
    const cap = createRollingCap(1, HOUR_MS);
    cap.tryConsume();
    vi.advanceTimersByTime(HOUR_MS / 2);
    consumeTimes(cap, 5);
    vi.advanceTimersByTime(HOUR_MS / 2);
    expect(cap.tryConsume()).toBe(true);
  });

  it("frees a slot once the oldest use ages out of the window", () => {
    const cap = createRollingCap(2, HOUR_MS);
    cap.tryConsume();
    vi.advanceTimersByTime(HOUR_MS / 2);
    cap.tryConsume();
    expect(cap.tryConsume()).toBe(false);

    vi.advanceTimersByTime(HOUR_MS / 2);
    expect(cap.tryConsume()).toBe(true);
    expect(cap.tryConsume()).toBe(false);
  });

  it("keeps separate caps independent", () => {
    const first = createRollingCap(1, HOUR_MS);
    const second = createRollingCap(1, HOUR_MS);
    first.tryConsume();
    expect(second.tryConsume()).toBe(true);
  });
});

describe("parseCapLimit", () => {
  it("parses a positive integer", () => {
    expect(parseCapLimit("50")).toBe(50);
  });

  it.each(["", "abc", "0", "-5", "2.5", " 30"])("throws for %j", (value) => {
    expect(() => parseCapLimit(value)).toThrow(
      "VERIFICATION_EMAIL_DAILY_CAP must be a positive integer",
    );
  });
});
