import { AccountType } from "@prisma/client";

export const accountTypesList: AccountType[] = [
  "checking",
  "credit_card",
  "loan",
  "money_market",
  "mortgage",
  "property",
  "retirement_401k",
  "roth_ira",
  "savings",
  "traditional_ira",
  "other",
];

export const isAccountType = (value: string): value is AccountType => {
  return [
    "checking",
    "credit_card",
    "loan",
    "money_market",
    "mortgage",
    "property",
    "retirement_401k",
    "roth_ira",
    "savings",
    "traditional_ira",
    "other",
  ].includes(value);
};

const prettyAccountTypes: Record<AccountType, string> = {
  checking: "Checking",
  savings: "Savings",
  other: "Other",
  credit_card: "Credit Card",
  mortgage: "Mortgage",
  property: "Property",
  loan: "Loan",
  money_market: "Money Market",
  retirement_401k: "401k",
  roth_ira: "Roth IRA",
  traditional_ira: "Traditional IRA",
} as const;

export const toPrettyAccountType = (type: AccountType): string => {
  return prettyAccountTypes[type];
};
