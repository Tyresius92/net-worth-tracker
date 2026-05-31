import { faker } from "@faker-js/faker";

import { CYPRESS_TEST_PASSWORD } from "../support/constants";

describe("/settings/delete_account", () => {
  let userEmail: string;

  beforeEach(() => {
    userEmail = faker.internet.email({ provider: "example.com" });
    cy.login({ email: userEmail });
  });

  afterEach(() => {
    cy.cleanupUser();
  });

  it("redirects to /login when unauthenticated", () => {
    cy.clearCookie("__session");
    cy.visit("/settings/delete_account");
    cy.location("pathname").should("eq", "/login");
  });

  it("is linked from the settings page", () => {
    cy.visitAndCheck("/settings");
    cy.findByRole("link", { name: /close your record/i }).click();
    cy.location("pathname").should("eq", "/settings/delete_account");
  });

  it("lists the consequences of deleting", () => {
    cy.visitAndCheck("/settings/delete_account");
    cy.findByText(/all of your sources and figure history will be deleted/i);
    cy.findByText(/there is no recovery mechanism/i);
  });

  it("shows an error when the confirmation text is wrong", () => {
    cy.visitAndCheck("/settings/delete_account");
    cy.findByLabelText(/type delete to confirm/i).type("delete");
    cy.findByLabelText(/current password/i).type(CYPRESS_TEST_PASSWORD);
    cy.findByRole("button", { name: /close my record permanently/i }).click();
    cy.findByText(/please type delete to confirm/i);
    cy.location("pathname").should("eq", "/settings/delete_account");
  });

  it("shows an error for an incorrect password", () => {
    cy.visitAndCheck("/settings/delete_account");
    cy.findByLabelText(/type delete to confirm/i).type("DELETE");
    cy.findByLabelText(/current password/i).type("wrong-password");
    cy.findByRole("button", { name: /close my record permanently/i }).click();
    cy.findByText(/incorrect password/i);
    cy.location("pathname").should("eq", "/settings/delete_account");
  });

  it("deletes the account and redirects to /goodbye on valid input", () => {
    cy.visitAndCheck("/settings/delete_account");
    cy.findByLabelText(/type delete to confirm/i).type("DELETE");
    cy.findByLabelText(/current password/i).type(CYPRESS_TEST_PASSWORD);
    cy.findByRole("button", { name: /close my record permanently/i }).click();
    cy.location("pathname").should("eq", "/goodbye");
    cy.getCookie("__session").should("be.null");
  });
});

describe("/settings/delete_account — last admin guardrail", () => {
  let adminEmail: string;

  beforeEach(() => {
    adminEmail = faker.internet.email({ provider: "example.com" });
    cy.loginAsAdmin({ email: adminEmail });
  });

  afterEach(() => {
    cy.cleanupUser();
  });

  it("blocks the last admin from deleting their account", () => {
    cy.visitAndCheck("/settings/delete_account");
    cy.findByLabelText(/type delete to confirm/i).type("DELETE");
    cy.findByLabelText(/current password/i).type(CYPRESS_TEST_PASSWORD);
    cy.findByRole("button", { name: /close my record permanently/i }).click();
    cy.findByText(/only administrator/i);
    cy.location("pathname").should("eq", "/settings/delete_account");
  });
});
