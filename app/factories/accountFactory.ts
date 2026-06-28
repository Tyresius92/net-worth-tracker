import { faker } from "@faker-js/faker";
import type { AccountType } from "@prisma/client";

import { defineAccountFactory } from "~/__generated__/fabbrica";

import { UserFactory } from "./userFactory";

const accountTypes: AccountType[] = [
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

export const AccountFactory = defineAccountFactory({
  defaultData: () => ({
    user: UserFactory,
    closedAt: undefined,
    type: faker.helpers.arrayElement(accountTypes),
  }),
});
