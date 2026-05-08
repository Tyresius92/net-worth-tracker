import { faker } from "@faker-js/faker";

import { defineBalanceSnapshotFactory } from "~/__generated__/fabbrica";

import { AccountFactory } from "./accountFactory";

export const BalanceSnapshotFactory = defineBalanceSnapshotFactory({
  defaultData: () => ({
    account: AccountFactory,
    amount: faker.number.int({ min: -2_147_483_648, max: 2_147_483_647 }),
    dateTime: new Date(),
  }),
});
