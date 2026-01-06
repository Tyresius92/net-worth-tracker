import { AccountType } from "@prisma/client";
import {
  AccountBase,
  AccountType as PlaidAccountType,
  AccountSubtype,
} from "plaid";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { getAccountType } from "./accountUtils.server";

describe("getAccountType", () => {
  // Mock console.error to prevent actual console output during tests
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Helper function to create a mock AccountBase object
  const createMockAccount = (
    type: AccountBase["type"],
    subtype: AccountBase["subtype"],
  ): AccountBase => {
    return {
      account_id: "mock-account-id",
      balances: {
        available: 1000,
        current: 1000,
        iso_currency_code: "USD",
        limit: null,
        unofficial_currency_code: null,
      },
      mask: "1234",
      name: "Mock Account",
      official_name: "Official Mock Account",
      type,
      subtype: subtype,
    };
  };

  describe("depository accounts", () => {
    it("should return 'checking' for depository checking accounts", () => {
      const account = createMockAccount(
        PlaidAccountType.Depository,
        AccountSubtype.Checking,
      );
      expect(getAccountType(account)).toBe(AccountType.checking);
    });

    it("should return 'savings' for depository savings accounts", () => {
      const account = createMockAccount(
        PlaidAccountType.Depository,
        AccountSubtype.Savings,
      );
      expect(getAccountType(account)).toBe(AccountType.savings);
    });

    it("should return 'money_market' for depository money market accounts", () => {
      const account = createMockAccount(
        PlaidAccountType.Depository,
        AccountSubtype.MoneyMarket,
      );
      expect(getAccountType(account)).toBe(AccountType.money_market);
    });

    it("should return 'other' for depository cd accounts", () => {
      const account = createMockAccount(
        PlaidAccountType.Depository,
        AccountSubtype.Cd,
      );
      expect(getAccountType(account)).toBe(AccountType.other);
    });

    it("should return 'other' for depository hsa accounts", () => {
      const account = createMockAccount(
        PlaidAccountType.Depository,
        AccountSubtype.Hsa,
      );
      expect(getAccountType(account)).toBe(AccountType.other);
    });

    it("should return 'other' for depository cash management accounts", () => {
      const account = createMockAccount(
        PlaidAccountType.Depository,
        AccountSubtype.CashManagement,
      );
      expect(getAccountType(account)).toBe(AccountType.other);
    });

    it("should return 'other' and log error for unknown depository subtypes", () => {
      const account = createMockAccount(
        PlaidAccountType.Depository,
        // @ts-expect-error - Testing with invalid subtype
        "unknown",
      );
      expect(getAccountType(account)).toBe(AccountType.other);
      expect(console.error).toHaveBeenCalledWith(
        "Unknown object subtype with depository object type: unknown",
      );
    });
  });

  describe("credit accounts", () => {
    it("should return 'credit_card' for credit card accounts", () => {
      const account = createMockAccount(
        PlaidAccountType.Credit,
        AccountSubtype.CreditCard,
      );
      expect(getAccountType(account)).toBe(AccountType.credit_card);
    });

    it("should return 'other' and log error for unknown credit subtypes", () => {
      const account = createMockAccount(
        PlaidAccountType.Credit,
        // @ts-expect-error - Testing with invalid subtype
        "unknown",
      );
      expect(getAccountType(account)).toBe(AccountType.other);
      expect(console.error).toHaveBeenCalledWith(
        "Unknown object subtype with credit object type: unknown",
      );
    });
  });

  describe("investment accounts", () => {
    it("should return 'traditional_ira' for investment ira accounts", () => {
      const account = createMockAccount(
        PlaidAccountType.Investment,
        AccountSubtype.Ira,
      );
      expect(getAccountType(account)).toBe(AccountType.traditional_ira);
    });

    it("should return 'retirement_401k' for investment 401k accounts", () => {
      const account = createMockAccount(
        PlaidAccountType.Investment,
        AccountSubtype._401k,
      );
      expect(getAccountType(account)).toBe(AccountType.retirement_401k);
    });

    it("should return 'other' and log error for unknown investment subtypes", () => {
      const account = createMockAccount(
        PlaidAccountType.Investment,
        // @ts-expect-error - Testing with invalid subtype
        "unknown",
      );
      expect(getAccountType(account)).toBe(AccountType.other);
      expect(console.error).toHaveBeenCalledWith(
        "Unknown object subtype with investment object type: unknown",
      );
    });

    describe("loan accounts", () => {
      it("should return 'mortgage' for loan mortgage accounts", () => {
        const account = createMockAccount(
          PlaidAccountType.Loan,
          AccountSubtype.Mortgage,
        );
        expect(getAccountType(account)).toBe(AccountType.mortgage);
      });

      it("should return 'loan' for loan student accounts", () => {
        const account = createMockAccount(
          PlaidAccountType.Loan,
          AccountSubtype.Student,
        );
        expect(getAccountType(account)).toBe(AccountType.loan);
      });

      it("should return 'other' and log error for unknown loan subtypes", () => {
        const account = createMockAccount(
          PlaidAccountType.Loan,
          // @ts-expect-error - Testing with invalid subtype
          "unknown",
        );
        expect(getAccountType(account)).toBe(AccountType.other);
        expect(console.error).toHaveBeenCalledWith(
          "Unknown object subtype with loan object type: unknown",
        );
      });
    });

    describe("unknown account types", () => {
      it("should return 'other' and log error for unknown account types", () => {
        const account = createMockAccount(
          // @ts-expect-error - Testing with invalid account type and subtype
          "unknown",
          "unknown",
        );
        expect(getAccountType(account)).toBe(AccountType.other);
        expect(console.error).toHaveBeenCalledWith(
          "Unknown object type: unknown; Subtype: unknown",
        );
      });

      it("should handle null subtypes", () => {
        // @ts-expect-error - Testing with invalid account type
        const account = createMockAccount("unknown", null);
        expect(getAccountType(account)).toBe(AccountType.other);
        expect(console.error).toHaveBeenCalledWith(
          "Unknown object type: unknown; Subtype: null",
        );
      });
    });
  });
});
