import { describe, it, expect } from "vitest";

import { formatCurrency } from "./currencyUtils";

describe("formatCurrency", () => {
  it("should format cents to USD currency with cents by default", () => {
    expect(formatCurrency(1000)).toBe("$10.00");
    expect(formatCurrency(1050)).toBe("$10.50");
    expect(formatCurrency(5)).toBe("$0.05");
    expect(formatCurrency(0)).toBe("$0.00");
  });

  it("should format negative cents correctly", () => {
    expect(formatCurrency(-1000)).toBe("-$10.00");
    expect(formatCurrency(-1050)).toBe("-$10.50");
    expect(formatCurrency(-5)).toBe("-$0.05");
  });

  it("should format large numbers with commas", () => {
    expect(formatCurrency(100000)).toBe("$1,000.00");
    expect(formatCurrency(1000000)).toBe("$10,000.00");
    expect(formatCurrency(10000000)).toBe("$100,000.00");
    expect(formatCurrency(100000000)).toBe("$1,000,000.00");
  });

  it("should format cents to USD currency without cents when includeCents is false", () => {
    expect(formatCurrency(1000, { includeCents: false })).toBe("$10");
    expect(formatCurrency(1050, { includeCents: false })).toBe("$11");
    expect(formatCurrency(1099, { includeCents: false })).toBe("$11");
    expect(formatCurrency(5, { includeCents: false })).toBe("$0");
    expect(formatCurrency(0, { includeCents: false })).toBe("$0");
  });

  it("should format negative cents correctly without cents when includeCents is false", () => {
    expect(formatCurrency(-1000, { includeCents: false })).toBe("-$10");
    expect(formatCurrency(-1050, { includeCents: false })).toBe("-$11");
    expect(formatCurrency(-5, { includeCents: false })).toBe("-$0");
  });

  it("should format large numbers with commas without cents when includeCents is false", () => {
    expect(formatCurrency(100000, { includeCents: false })).toBe("$1,000");
    expect(formatCurrency(1000000, { includeCents: false })).toBe("$10,000");
    expect(formatCurrency(10000000, { includeCents: false })).toBe("$100,000");
    expect(formatCurrency(100000000, { includeCents: false })).toBe(
      "$1,000,000",
    );
  });

  it("should handle fractional cents correctly", () => {
    expect(formatCurrency(1000.5)).toBe("$10.01");
    expect(formatCurrency(1000.4)).toBe("$10.00");
    expect(formatCurrency(0.1)).toBe("$0.00");
    expect(formatCurrency(0.5)).toBe("$0.01");
  });

  it("should handle fractional cents correctly when includeCents is false", () => {
    expect(formatCurrency(1000.5, { includeCents: false })).toBe("$10");
    expect(formatCurrency(1050.5, { includeCents: false })).toBe("$11");
  });
});
