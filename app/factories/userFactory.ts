import { faker } from "@faker-js/faker";

import { defineUserFactory } from "~/__generated__/fabbrica";

export const UserFactory = defineUserFactory({
  defaultData: () => ({
    email: faker.internet.email(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),

    twoFactorEnabled: true,
  }),
});
