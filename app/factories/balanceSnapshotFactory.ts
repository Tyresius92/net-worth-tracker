import { faker } from "@faker-js/faker";

import { defineBalanceSnapshotFactory } from "~/__generated__/fabbrica";

import { AccountFactory } from "./accountFactory";

export const BalanceSnapshotFactory = defineBalanceSnapshotFactory({
  defaultData: () => ({
    account: AccountFactory,
    amount: faker.number.int(),
    dateTime: new Date(),
  }),
});
