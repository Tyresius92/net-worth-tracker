import { AccountType } from "@prisma/client";

export const accountTypesList: AccountType[] = [
  "checking",
  "credit_card",
  "investment",
  "line_of_credit",
  "mortgage",
  "other",
  "property",
  "savings",
];

export const isAccountType = (value: string): value is AccountType => {
  return [
    "checking",
    "credit_card",
    "investment",
    "line_of_credit",
    "mortgage",
    "other",
    "property",
    "savings",
  ].includes(value);
};

export const toPrettyAccountType = (type: AccountType): string => {
  if (type === "line_of_credit") {
    return "Line of Credit";
  }
  if (type === "credit_card") {
    return "Credit Card";
  }

  return type.charAt(0).toUpperCase() + type.slice(1);
};
