import { faker } from "@faker-js/faker";

import { definePlaidItemFactory } from "~/__generated__/fabbrica";

import { UserFactory } from "./userFactory";

export const PlaidItemFactory = definePlaidItemFactory({
  defaultData: () => ({
    status: "healthy",
    user: UserFactory,
    plaidItemId: faker.string.uuid(),
    accessToken: faker.string.uuid(),
    institutionId: faker.string.uuid(),
    institutionName: faker.company.name(),
  }),
});
