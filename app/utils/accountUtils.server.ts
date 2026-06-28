import type { AccountType } from "@prisma/client";
import {
  type AccountBase,
  AccountType as PlaidAccountType,
  AccountSubtype,
} from "plaid";

export const getAccountType = (obj: AccountBase): AccountType => {
  if (obj.type === PlaidAccountType.Depository) {
    if (obj.subtype === AccountSubtype.Checking) {
      return "checking";
    }
    if (obj.subtype === AccountSubtype.Savings) {
      return "savings";
    }
    if (obj.subtype === AccountSubtype.MoneyMarket) {
      return "money_market";
    }
    if (
      obj.subtype === AccountSubtype.Cd ||
      obj.subtype === AccountSubtype.Hsa ||
      obj.subtype === AccountSubtype.CashManagement
    ) {
      return "other";
    }
    console.error(
      `Unknown object subtype with depository object type: ${obj.subtype}`,
    );
    return "other";
  }
  if (obj.type === PlaidAccountType.Credit) {
    if (obj.subtype === AccountSubtype.CreditCard) {
      return "credit_card";
    }
    console.error(
      `Unknown object subtype with credit object type: ${obj.subtype}`,
    );
    return "other";
  }
  if (obj.type === PlaidAccountType.Investment) {
    if (obj.subtype === AccountSubtype.Ira) {
      return "traditional_ira";
    }
    if (obj.subtype === AccountSubtype._401k) {
      return "retirement_401k";
    }
    console.error(
      `Unknown object subtype with investment object type: ${obj.subtype}`,
    );
    return "other";
  }
  if (obj.type === PlaidAccountType.Loan) {
    if (obj.subtype === AccountSubtype.Mortgage) {
      return "mortgage";
    }
    if (obj.subtype === AccountSubtype.Student) {
      return "loan";
    }
    console.error(
      `Unknown object subtype with loan object type: ${obj.subtype}`,
    );
    return "other";
  }

  console.error(`Unknown object type: ${obj.type}; Subtype: ${obj.subtype}`);
  return "other";
};
