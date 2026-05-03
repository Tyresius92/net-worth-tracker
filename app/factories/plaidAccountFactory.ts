import { faker } from "@faker-js/faker";

import { definePlaidAccountFactory } from "~/__generated__/fabbrica";

import { AccountFactory } from "./accountFactory";
import { PlaidItemFactory } from "./plaidItemFactory";

export const PlaidAccountFactory = definePlaidAccountFactory({
  defaultData: () => ({
    plaidItem: PlaidItemFactory,
    account: AccountFactory,
    plaidAccountId: faker.string.uuid(),
    name: faker.finance.accountName(),
    officialName: faker.finance.accountName(),
    type: "depository",
    mask: faker.string.numeric(4),
  }),
});
