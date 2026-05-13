import { faker } from "@faker-js/faker";

import { CYPRESS_TEST_PASSWORD } from "../support/constants";

const NEW_PASSWORD = "brand-new-password-123";

describe("forgot-password route", () => {
  it("redirects logged-in users to /", () => {
    cy.login();
    cy.visit("/forgot-password");
    cy.location("pathname").should("eq", "/");
    cy.cleanupUser();
  });

  it("shows a browser validation error for an invalid email format", () => {
    cy.visitAndCheck("/forgot-password");
    cy.findByLabelText(/email address/i).type("not-an-email");
    cy.findByRole("button", { name: /send reset link/i }).click();
    cy.get("input:invalid").should("have.length", 1);
  });

  it("shows the confirmation screen for a registered email", () => {
    const email = faker.internet.email({ provider: "example.com" });
    cy.then(() => ({ email })).as("user");
    cy.task("createUser", email);

    cy.visit("/forgot-password");
    cy.findByLabelText(/email address/i).type(email);
    cy.findByRole("button", { name: /send reset link/i }).click();
    cy.findByText(/check your inbox/i);
    cy.findByText(/if that email address is registered/i);

    cy.cleanupUser();
  });

  it("shows the same confirmation screen for an unregistered email", () => {
    cy.visit("/forgot-password");
    cy.findByLabelText(/email address/i).type("nobody@example.com");
    cy.findByRole("button", { name: /send reset link/i }).click();
    cy.findByText(/check your inbox/i);
    cy.findByText(/if that email address is registered/i);
  });

  it("shows a back to login link on the confirmation screen", () => {
    cy.visit("/forgot-password");
    cy.findByLabelText(/email address/i).type("nobody@example.com");
    cy.findByRole("button", { name: /send reset link/i }).click();
    cy.findByRole("link", { name: /back to login/i }).click();
    cy.location("pathname").should("eq", "/login");
  });
});

describe("reset-password route", () => {
  it("redirects to /forgot-password when no token is provided", () => {
    cy.visit("/reset-password");
    cy.location("pathname").should("eq", "/forgot-password");
  });

  it("shows the expired state for an invalid token", () => {
    cy.visit("/reset-password?token=not-a-real-token");
    cy.findByText(/link expired/i);
    cy.findByRole("link", { name: /request a new link/i }).should(
      "have.attr",
      "href",
      "/forgot-password",
    );
  });

  describe("with a valid token", () => {
    let userEmail: string;

    beforeEach(() => {
      userEmail = faker.internet.email({ provider: "example.com" });
      cy.then(() => ({ email: userEmail })).as("user");
      cy.task("createUser", userEmail);
    });

    afterEach(() => {
      cy.cleanupUser();
    });

    it("shows the password form", () => {
      cy.task("createPasswordResetToken", userEmail).then((token) => {
        cy.visit(`/reset-password?token=${token}`);
        cy.findByLabelText(/^new password$/i);
        cy.findByLabelText(/confirm new password/i);
        cy.findByRole("button", { name: /set new password/i });
      });
    });

    it("shows an error when passwords do not match", () => {
      cy.task("createPasswordResetToken", userEmail).then((token) => {
        cy.visit(`/reset-password?token=${token}`);
        cy.findByLabelText(/^new password$/i).type(NEW_PASSWORD);
        cy.findByLabelText(/confirm new password/i).type("something-different");
        cy.findByRole("button", { name: /set new password/i }).click();
        cy.findByText(/passwords do not match/i);
      });
    });

    it("shows an error when the password is too short", () => {
      cy.task("createPasswordResetToken", userEmail).then((token) => {
        cy.visit(`/reset-password?token=${token}`);
        cy.findByLabelText(/^new password$/i).type("short");
        cy.findByLabelText(/confirm new password/i).type("short");
        cy.findByRole("button", { name: /set new password/i }).click();
        cy.findByText(/at least 8 characters/i);
      });
    });

    it("redirects to /login after a successful reset", () => {
      cy.task("createPasswordResetToken", userEmail).then((token) => {
        cy.visit(`/reset-password?token=${token}`);
        cy.findByLabelText(/^new password$/i).type(NEW_PASSWORD);
        cy.findByLabelText(/confirm new password/i).type(NEW_PASSWORD);
        cy.findByRole("button", { name: /set new password/i }).click();
        cy.location("pathname").should("eq", "/login");
      });
    });

    it("allows login with the new password after reset", () => {
      cy.task("createPasswordResetToken", userEmail).then((token) => {
        cy.visit(`/reset-password?token=${token}`);
        cy.findByLabelText(/^new password$/i).type(NEW_PASSWORD);
        cy.findByLabelText(/confirm new password/i).type(NEW_PASSWORD);
        cy.findByRole("button", { name: /set new password/i }).click();

        cy.location("pathname").should("eq", "/login");
        cy.findByLabelText(/email address/i).type(userEmail);
        cy.findByLabelText(/password/i).type(NEW_PASSWORD);
        cy.findByRole("button", { name: /log in/i }).click();
        cy.location("pathname").should("eq", "/");
      });
    });

    it("blocks login with the old password after reset", () => {
      cy.task("createPasswordResetToken", userEmail).then((token) => {
        cy.visit(`/reset-password?token=${token}`);
        cy.findByLabelText(/^new password$/i).type(NEW_PASSWORD);
        cy.findByLabelText(/confirm new password/i).type(NEW_PASSWORD);
        cy.findByRole("button", { name: /set new password/i }).click();

        cy.location("pathname").should("eq", "/login");
        cy.findByLabelText(/email address/i).type(userEmail);
        cy.findByLabelText(/password/i).type(CYPRESS_TEST_PASSWORD);
        cy.findByRole("button", { name: /log in/i }).click();
        cy.findByText(/invalid email or password/i);
      });
    });

    it("shows the expired state when the same token is used twice", () => {
      cy.task("createPasswordResetToken", userEmail).then((token) => {
        cy.visit(`/reset-password?token=${token}`);
        cy.findByLabelText(/^new password$/i).type(NEW_PASSWORD);
        cy.findByLabelText(/confirm new password/i).type(NEW_PASSWORD);
        cy.findByRole("button", { name: /set new password/i }).click();
        cy.location("pathname").should("eq", "/login");

        cy.visit(`/reset-password?token=${token}`);
        cy.findByText(/link expired/i);
      });
    });
  });
});

describe("login route", () => {
  it("has a forgot password link that navigates to /forgot-password", () => {
    cy.visitAndCheck("/login");
    cy.findByRole("link", { name: /forgot password/i }).click();
    cy.location("pathname").should("eq", "/forgot-password");
  });
});
