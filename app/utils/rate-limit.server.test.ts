import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { isRateLimited, getClientIp } from "./rate-limit.server";

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
