import { faker } from "@faker-js/faker";

import { CYPRESS_TEST_PASSWORD } from "../support/constants";

describe("recovery code login", () => {
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

  it("shows a 'use a recovery code' toggle on the 2FA page", () => {
    cy.visitAndCheck("/login");
    cy.findByLabelText(/email address/i).type(userEmail);
    cy.findByLabelText(/password/i).type(CYPRESS_TEST_PASSWORD);
    cy.findByRole("button", { name: /log in/i }).click();

    cy.location("pathname").should("eq", "/login/2fa");
    cy.findByRole("button", { name: /use a recovery code instead/i });
  });

  it("allows login with a recovery code", () => {
    cy.task<{ codes: string[] }>("enableUserMFA", { email: userEmail }).then(
      ({ codes }) => {
        cy.visitAndCheck("/login");
        cy.findByLabelText(/email address/i).type(userEmail);
        cy.findByLabelText(/password/i).type(CYPRESS_TEST_PASSWORD);
        cy.findByRole("button", { name: /log in/i }).click();

        cy.location("pathname").should("eq", "/login/2fa");
        cy.findByRole("button", {
          name: /use a recovery code instead/i,
        }).click();
        cy.findByLabelText(/recovery code/i).type(codes[0]);
        cy.findByRole("button", { name: /verify/i }).click();

        cy.location("pathname").should("eq", "/");
      },
    );
  });

  it("shows an error for an invalid recovery code", () => {
    cy.visitAndCheck("/login");
    cy.findByLabelText(/email address/i).type(userEmail);
    cy.findByLabelText(/password/i).type(CYPRESS_TEST_PASSWORD);
    cy.findByRole("button", { name: /log in/i }).click();

    cy.location("pathname").should("eq", "/login/2fa");
    cy.findByRole("button", { name: /use a recovery code instead/i }).click();
    cy.findByLabelText(/recovery code/i).type("0000-0000-0000");
    cy.findByRole("button", { name: /verify/i }).click();

    cy.findByText(/invalid recovery code/i);
    cy.location("pathname").should("eq", "/login/2fa");
  });

  it("does not allow a recovery code to be used twice", () => {
    cy.task<{ codes: string[] }>("enableUserMFA", { email: userEmail }).then(
      ({ codes }) => {
        const useCode = (code: string) => {
          cy.visitAndCheck("/login");
          cy.findByLabelText(/email address/i).type(userEmail);
          cy.findByLabelText(/password/i).type(CYPRESS_TEST_PASSWORD);
          cy.findByRole("button", { name: /log in/i }).click();
          cy.location("pathname").should("eq", "/login/2fa");
          cy.findByRole("button", {
            name: /use a recovery code instead/i,
          }).click();
          cy.findByLabelText(/recovery code/i).type(code);
          cy.findByRole("button", { name: /verify/i }).click();
        };

        useCode(codes[0]);
        cy.location("pathname").should("eq", "/");
        cy.findByRole("button", { name: /log out/i }).click();

        useCode(codes[0]);
        cy.location("pathname").should("eq", "/login/2fa");
      },
    );
  });

  it("redirects to /settings/recovery_codes and shows exhausted warning after the last code is used", () => {
    cy.task<{ codes: string[] }>("enableUserMFA", {
      email: userEmail,
      codeCount: 1,
    }).then(({ codes }) => {
      cy.visitAndCheck("/login");
      cy.findByLabelText(/email address/i).type(userEmail);
      cy.findByLabelText(/password/i).type(CYPRESS_TEST_PASSWORD);
      cy.findByRole("button", { name: /log in/i }).click();

      cy.location("pathname").should("eq", "/login/2fa");
      cy.findByRole("button", { name: /use a recovery code instead/i }).click();
      cy.findByLabelText(/recovery code/i).type(codes[0]);
      cy.findByRole("button", { name: /verify/i }).click();

      cy.location("pathname").should("eq", "/settings/recovery_codes");
      cy.findByText(/used all of your recovery codes/i);
    });
  });
});

describe("/settings/recovery_codes page", () => {
  let userEmail: string;

  beforeEach(() => {
    userEmail = faker.internet.email({ provider: "example.com" });
    cy.then(() => ({ email: userEmail })).as("user");
    cy.task("createUser", userEmail).then((cookieValue) => {
      if (typeof cookieValue === "string")
        cy.setCookie("__session", cookieValue);
    });
    cy.task("enableUserMFA", { email: userEmail });
  });

  afterEach(() => {
    cy.cleanupUser();
  });

  it("shows the remaining code count", () => {
    cy.visitAndCheck("/settings/recovery_codes");
    cy.contains(/10 of 10 recovery codes remaining/i);
  });

  it("regenerates codes when a valid TOTP code is entered", () => {
    cy.visitAndCheck("/settings/recovery_codes");
    cy.task<string>("generateTOTPCode", userEmail).then((code) => {
      cy.findByLabelText(/authenticator code/i).type(code);
    });
    cy.findByRole("button", { name: /generate new codes/i }).click();

    cy.location("pathname").should("eq", "/settings/recovery_codes");
    cy.findByText(/save your recovery codes/i);
  });

  it("shows an error when an invalid TOTP code is entered", () => {
    cy.visitAndCheck("/settings/recovery_codes");
    cy.findByLabelText(/authenticator code/i).type("999999");
    cy.findByRole("button", { name: /generate new codes/i }).click();

    cy.findByText(/invalid verification code/i);
  });

  it("shows newly generated codes exactly once", () => {
    cy.visitAndCheck("/settings/recovery_codes");
    cy.task<string>("generateTOTPCode", userEmail).then((code) => {
      cy.findByLabelText(/authenticator code/i).type(code);
    });
    cy.findByRole("button", { name: /generate new codes/i }).click();

    cy.findByText(/save your recovery codes/i);

    cy.reload();
    cy.findByText(/save your recovery codes/i).should("not.exist");
    cy.findByText(/recovery codes remaining/i);
  });
});

describe("settings page recovery code count", () => {
  let userEmail: string;

  beforeEach(() => {
    userEmail = faker.internet.email({ provider: "example.com" });
    cy.then(() => ({ email: userEmail })).as("user");
    cy.task("createUser", userEmail).then((cookieValue) => {
      if (typeof cookieValue === "string")
        cy.setCookie("__session", cookieValue);
    });
    cy.task("enableUserMFA", { email: userEmail });
  });

  afterEach(() => {
    cy.cleanupUser();
  });

  it("shows the recovery code count on the settings page", () => {
    cy.visitAndCheck("/settings");
    cy.findByText(/10 of 10 remaining/i);
  });

  it("links to the recovery codes management page", () => {
    cy.visitAndCheck("/settings");
    cy.findByRole("link", { name: /manage/i }).click();
    cy.location("pathname").should("eq", "/settings/recovery_codes");
  });
});
