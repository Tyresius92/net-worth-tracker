import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { formatDate, getDateNDaysAgo } from "./dateUtils";

describe("formatDate", () => {
  it("formats a date using en-US medium style", () => {
    // Use local-time constructor to avoid UTC→local conversion shifting the day
    expect(formatDate(new Date(2024, 0, 15))).toBe("Jan 15, 2024");
  });

  it("omits a leading zero from single-digit days", () => {
    expect(formatDate(new Date(2024, 11, 1))).toBe("Dec 1, 2024");
  });
});

describe("getDateNDaysAgo", () => {
  beforeEach(() => {
    // Use noon local time to avoid day-boundary ambiguity
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2024, 5, 15, 12, 0, 0)); // June 15, 2024
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns today when daysAgo is 0", () => {
    const result = getDateNDaysAgo(0);
    expect(result.getFullYear()).toBe(2024);
    expect(result.getMonth()).toBe(5); // June
    expect(result.getDate()).toBe(15);
  });

  it("returns yesterday when daysAgo is 1", () => {
    const result = getDateNDaysAgo(1);
    expect(result.getFullYear()).toBe(2024);
    expect(result.getMonth()).toBe(5);
    expect(result.getDate()).toBe(14);
  });

  it("crosses a month boundary correctly", () => {
    // June 15 − 15 = May 31
    const result = getDateNDaysAgo(15);
    expect(result.getMonth()).toBe(4); // May
    expect(result.getDate()).toBe(31);
  });

  it("returns the correct date 30 days ago", () => {
    // June 15 − 30 = May 16
    const result = getDateNDaysAgo(30);
    expect(result.getMonth()).toBe(4); // May
    expect(result.getDate()).toBe(16);
  });
});
