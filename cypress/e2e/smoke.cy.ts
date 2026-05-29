import { faker } from "@faker-js/faker";

import { CYPRESS_TEST_PASSWORD } from "../support/constants";

describe("login route", () => {
  it("redirects unauthenticated users to login when visiting a protected route", () => {
    cy.visit("/accounts");
    cy.location("pathname").should("eq", "/login");
    cy.location("search").should("include", "redirectTo=%2Faccounts");
  });

  it("shows a validation error for an invalid email format", () => {
    cy.visitAndCheck("/login");
    cy.findByLabelText(/email address/i).type("not-an-email");
    cy.findByLabelText(/password/i).type("somepassword");
    cy.findByRole("button", { name: /log in/i }).click();
    cy.get("input:invalid").should("have.length", 1);
    cy.findByLabelText(/email address/i)
      .invoke("prop", "validationMessage")
      .should("eq", "Please enter an email address.");
  });

  it("shows an error when credentials are invalid", () => {
    cy.visitAndCheck("/login");
    cy.findByLabelText(/email address/i).type("nobody@example.com");
    cy.findByLabelText(/password/i).type("wrongpassword");
    cy.findByRole("button", { name: /log in/i }).click();
    cy.findByText(/credentials not recognized/i);
  });

  describe("with a registered user", () => {
    afterEach(() => {
      cy.cleanupUser();
    });

    it("logs in with valid credentials and redirects to the dashboard", () => {
      const email = faker.internet.email({ provider: "example.com" });
      cy.then(() => ({ email })).as("user");
      cy.task("createUser", email);

      cy.visitAndCheck("/login");
      cy.findByLabelText(/email address/i).type(email);
      cy.findByLabelText(/password/i).type(CYPRESS_TEST_PASSWORD);
      cy.findByRole("button", { name: /log in/i }).click();
      cy.location("pathname").should("eq", "/");
    });
  });
});
