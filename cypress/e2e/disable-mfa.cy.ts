import { faker } from "@faker-js/faker";

describe("/settings/disable_mfa", () => {
  let userEmail: string;

  beforeEach(() => {
    userEmail = faker.internet.email({ provider: "example.com" });
    cy.then(() => ({ email: userEmail })).as("user");
    cy.task("createUser", userEmail);
    cy.task("enableUserMFA", { email: userEmail });
  });

  afterEach(() => {
    cy.cleanupUser();
  });

  it("is linked from the settings page", () => {
    cy.visitAndCheck("/settings");
    cy.findByRole("link", { name: /disable/i }).click();
    cy.location("pathname").should("eq", "/settings/disable_mfa");
  });

  it("lists the consequences of disabling", () => {
    cy.visitAndCheck("/settings/disable_mfa");
    cy.findByText(/recovery codes will be permanently deleted/i);
    cy.findByText(/Wire service figures will pause/i);
  });

  it("shows an error for an invalid TOTP code", () => {
    cy.visitAndCheck("/settings/disable_mfa");
    cy.findByLabelText(/authenticator code/i).type("999999");
    cy.findByRole("button", { name: /disable two-factor/i }).click();
    cy.findByText(/invalid verification code/i);
    cy.location("pathname").should("eq", "/settings/disable_mfa");
  });

  it("disables 2FA and redirects to /settings on a valid code", () => {
    cy.task<string>("generateTOTPCode", userEmail).then((code) => {
      cy.visitAndCheck("/settings/disable_mfa");
      cy.findByLabelText(/authenticator code/i).type(code);
      cy.findByRole("button", { name: /disable two-factor/i }).click();
      cy.location("pathname").should("eq", "/settings");
      cy.findByText(/not enabled/i);
    });
  });

  it("deletes recovery codes on disable", () => {
    cy.task<string>("generateTOTPCode", userEmail).then((code) => {
      cy.visitAndCheck("/settings/disable_mfa");
      cy.findByLabelText(/authenticator code/i).type(code);
      cy.findByRole("button", { name: /disable two-factor/i }).click();

      cy.visit("/settings/recovery-codes");
      cy.location("pathname").should("eq", "/settings");
    });
  });

  it("cannot be used twice without re-enabling", () => {
    cy.task<string>("generateTOTPCode", userEmail).then((code) => {
      cy.visitAndCheck("/settings/disable_mfa");
      cy.findByLabelText(/authenticator code/i).type(code);
      cy.findByRole("button", { name: /disable two-factor/i }).click();

      cy.visit("/settings/disable_mfa");
      cy.location("pathname").should("eq", "/settings");
    });
  });
});

describe("/settings/disable_mfa without 2FA enabled", () => {
  it("redirects to /settings", () => {
    const email = faker.internet.email({ provider: "example.com" });
    cy.then(() => ({ email })).as("user");
    cy.task("createUser", email).then((cookieValue) => {
      if (typeof cookieValue === "string")
        cy.setCookie("__session", cookieValue);
    });
    cy.visit("/settings/disable_mfa");
    cy.location("pathname").should("eq", "/settings");
    cy.cleanupUser();
  });
});
