import { faker } from "@faker-js/faker";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      /**
       * Creates a test user in the database and sets the session cookie.
       * Yields the user object and registers it under the "@user" alias for cleanup.
       *
       * @example cy.login()
       * @example cy.login({ email: 'whatever@example.com' })
       */
      login: typeof login;

      /**
       * Deletes the current @user from the database and clears the session cookie.
       *
       * @example cy.cleanupUser()
       * @example cy.cleanupUser({ email: 'whatever@example.com' })
       */
      cleanupUser: typeof cleanupUser;

      /**
       * Visits a URL and waits for the pathname to settle.
       *
       * @example cy.visitAndCheck('/')
       * @example cy.visitAndCheck('/', 500)
       */
      visitAndCheck: typeof visitAndCheck;
    }
  }
}

function login({
  email = faker.internet.email({ provider: "example.com" }),
}: {
  email?: string;
} = {}) {
  cy.then(() => ({ email })).as("user");
  cy.task("createUser", email).then((cookieValue) => {
    cy.setCookie("__session", cookieValue as string);
  });
  return cy.get("@user");
}

function cleanupUser({ email }: { email?: string } = {}) {
  if (email) {
    deleteUserByEmail(email);
  } else {
    cy.get("@user").then((user) => {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      const email = (user as { email?: string }).email;
      if (email) {
        deleteUserByEmail(email);
      }
    });
  }
  cy.clearCookie("__session");
}

function deleteUserByEmail(email: string) {
  cy.task("deleteUser", email);
  cy.clearCookie("__session");
}

// We're waiting a second because of this issue happen randomly
// https://github.com/cypress-io/cypress/issues/7306
// Also added custom types to avoid getting detached
// https://github.com/cypress-io/cypress/issues/7306#issuecomment-1152752612
// ===========================================================
function visitAndCheck(url: string, waitTime = 1000) {
  cy.visit(url);
  cy.location("pathname").should("contain", url).wait(waitTime);
}

export const registerCommands = () => {
  Cypress.Commands.add("login", login);
  Cypress.Commands.add("cleanupUser", cleanupUser);
  Cypress.Commands.add("visitAndCheck", visitAndCheck);
};
