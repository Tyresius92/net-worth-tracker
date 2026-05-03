// Shared constants for Cypress test infrastructure.
// This file must remain free of Node.js-only imports — it runs in the browser.

// Password used when cy.task("createUser") seeds a test user.
// Tests that exercise the login form must use this same value.
export const CYPRESS_TEST_PASSWORD = "cypress-test-password";
