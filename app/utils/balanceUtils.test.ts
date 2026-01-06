import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import {
  fillDailyBalanceDayData,
  parseDate,
  formatDate,
  addDays,
  startOfToday,
} from "./balanceUtils";

describe("balanceUtils", () => {
  describe("parseDate", () => {
    it("should parse a date string into a Date object", () => {
      const result = parseDate("2026-01-15");
      expect(result).toBeInstanceOf(Date);
      expect(result.getFullYear()).toBe(2026);
      expect(result.getMonth()).toBe(0); // January is 0
      expect(result.getDate()).toBe(15);
    });

    it("should handle single-digit months and days", () => {
      const result = parseDate("2026-1-5");
      expect(result.getFullYear()).toBe(2026);
      expect(result.getMonth()).toBe(0); // January is 0
      expect(result.getDate()).toBe(5);
    });

    it("should set time to midnight in local timezone", () => {
      const result = parseDate("2026-01-15");
      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(0);
      expect(result.getMilliseconds()).toBe(0);
    });
  });

  describe("formatDate", () => {
    it("should format a Date object into a YYYY-MM-DD string", () => {
      const date = new Date(2026, 0, 15); // January 15, 2026
      const result = formatDate(date);
      expect(result).toBe("2026-01-15");
    });

    it("should pad single-digit months and days with zeros", () => {
      const date = new Date(2026, 0, 5); // January 5, 2026
      const result = formatDate(date);
      expect(result).toBe("2026-01-05");
    });

    it("should handle December correctly", () => {
      const date = new Date(2026, 11, 25); // December 25, 2026
      const result = formatDate(date);
      expect(result).toBe("2026-12-25");
    });
  });

  describe("addDays", () => {
    it("should add days to a date", () => {
      const date = new Date(2026, 0, 15); // January 15, 2026
      const result = addDays(date, 5);
      expect(result.getFullYear()).toBe(2026);
      expect(result.getMonth()).toBe(0);
      expect(result.getDate()).toBe(20);
    });

    it("should handle month transitions", () => {
      const date = new Date(2026, 0, 30); // January 30, 2026
      const result = addDays(date, 5);
      expect(result.getFullYear()).toBe(2026);
      expect(result.getMonth()).toBe(1); // February
      expect(result.getDate()).toBe(4);
    });

    it("should handle year transitions", () => {
      const date = new Date(2026, 11, 30); // December 30, 2026
      const result = addDays(date, 5);
      expect(result.getFullYear()).toBe(2027);
      expect(result.getMonth()).toBe(0); // January
      expect(result.getDate()).toBe(4);
    });

    it("should handle negative days", () => {
      const date = new Date(2026, 0, 15); // January 15, 2026
      const result = addDays(date, -5);
      expect(result.getFullYear()).toBe(2026);
      expect(result.getMonth()).toBe(0);
      expect(result.getDate()).toBe(10);
    });
  });

  describe("startOfToday", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("should return today's date at midnight", () => {
      // Set system time to a specific datetime
      vi.setSystemTime(new Date(2026, 0, 15, 14, 30, 45)); // Jan 15, 2026, 14:30:45

      const result = startOfToday();

      expect(result.getFullYear()).toBe(2026);
      expect(result.getMonth()).toBe(0);
      expect(result.getDate()).toBe(15);
      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(0);
      expect(result.getMilliseconds()).toBe(0);
    });
  });

  describe("fillDailyBalanceDayData", () => {
    // Mock the Date object to have a fixed "today" for consistent testing
    const mockToday = new Date("2026-01-06T12:00:00.000Z");

    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(mockToday);
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("should return an empty array when input is empty", () => {
      const result = fillDailyBalanceDayData([]);
      expect(result).toEqual([]);
    });

    it("should handle a single day of data", () => {
      const data = [{ date: "2026-01-01", amount: 1000 }];

      const result = fillDailyBalanceDayData(data);

      // Should fill from 2026-01-01 to today (2026-01-06)
      expect(result).toEqual([
        { date: "2026-01-01", amount: 1000 },
        { date: "2026-01-02", amount: 1000 },
        { date: "2026-01-03", amount: 1000 },
        { date: "2026-01-04", amount: 1000 },
        { date: "2026-01-05", amount: 1000 },
        { date: "2026-01-06", amount: 1000 },
      ]);
    });

    it("should fill gaps between multiple days of data", () => {
      const data = [
        { date: "2026-01-01", amount: 1000 },
        { date: "2026-01-03", amount: 1500 },
        { date: "2026-01-05", amount: 2000 },
      ];

      const result = fillDailyBalanceDayData(data);

      expect(result).toEqual([
        { date: "2026-01-01", amount: 1000 },
        { date: "2026-01-02", amount: 1000 },
        { date: "2026-01-03", amount: 1500 },
        { date: "2026-01-04", amount: 1500 },
        { date: "2026-01-05", amount: 2000 },
        { date: "2026-01-06", amount: 2000 },
      ]);
    });

    it("should handle data with duplicate dates (last one wins)", () => {
      const data = [
        { date: "2026-01-01", amount: 1000 },
        { date: "2026-01-01", amount: 1200 },
        { date: "2026-01-03", amount: 1500 },
      ];

      const result = fillDailyBalanceDayData(data);

      expect(result).toEqual([
        { date: "2026-01-01", amount: 1200 },
        { date: "2026-01-02", amount: 1200 },
        { date: "2026-01-03", amount: 1500 },
        { date: "2026-01-04", amount: 1500 },
        { date: "2026-01-05", amount: 1500 },
        { date: "2026-01-06", amount: 1500 },
      ]);
    });

    it("should handle data with negative amounts", () => {
      const data = [
        { date: "2026-01-01", amount: -1000 },
        { date: "2026-01-03", amount: -500 },
        { date: "2026-01-05", amount: 0 },
      ];

      const result = fillDailyBalanceDayData(data);

      expect(result).toEqual([
        { date: "2026-01-01", amount: -1000 },
        { date: "2026-01-02", amount: -1000 },
        { date: "2026-01-03", amount: -500 },
        { date: "2026-01-04", amount: -500 },
        { date: "2026-01-05", amount: 0 },
        { date: "2026-01-06", amount: 0 },
      ]);
    });

    it("should handle data spanning a longer time period", () => {
      // Set a different "today" for this test
      vi.setSystemTime(new Date("2026-01-15T12:00:00.000Z"));

      const data = [
        { date: "2026-01-01", amount: 1000 },
        { date: "2026-01-10", amount: 1500 },
      ];

      const result = fillDailyBalanceDayData(data);

      // Should fill from 2026-01-01 to 2026-01-15
      expect(result.length).toBe(15);
      expect(result[0]).toEqual({ date: "2026-01-01", amount: 1000 });
      expect(result[9]).toEqual({ date: "2026-01-10", amount: 1500 });
      expect(result[14]).toEqual({ date: "2026-01-15", amount: 1500 });

      // Check that all days between 01-01 and 01-10 have amount 1000
      for (let i = 1; i < 9; i++) {
        expect(result[i].amount).toBe(1000);
      }

      // Check that all days between 01-10 and 01-15 have amount 1500
      for (let i = 10; i < 15; i++) {
        expect(result[i].amount).toBe(1500);
      }
    });
  });
});
