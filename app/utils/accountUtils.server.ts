import { AccountType } from "@prisma/client";
import { AccountBase } from "plaid";

export const getAccountType = (obj: AccountBase): AccountType => {
  if (obj.type === "depository") {
    if (obj.subtype === "checking") {
      return "checking";
    }
    if (obj.subtype === "savings") {
      return "savings";
    }
    if (obj.subtype === "money market") {
      return "money_market";
    }
    if (
      obj.subtype === "cd" ||
      obj.subtype === "hsa" ||
      obj.subtype === "cash management"
    ) {
      return "other";
    }
    console.error(
      `Unknown object subtype with depository object type: ${obj.subtype}`,
    );
    return "other";
  }
  if (obj.type === "credit") {
    if (obj.subtype === "credit card") {
      return "credit_card";
    }
    console.error(
      `Unknown object subtype with credit object type: ${obj.subtype}`,
    );
    return "other";
  }
  if (obj.type === "investment") {
    if (obj.subtype === "ira") {
      return "traditional_ira";
    }
    if (obj.subtype === "401k") {
      return "retirement_401k";
    }
    console.error(
      `Unknown object subtype with investment object type: ${obj.subtype}`,
    );
    return "other";
  }
  if (obj.type === "loan") {
    if (obj.subtype === "mortgage") {
      return "mortgage";
    }
    if (obj.subtype === "student") {
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
