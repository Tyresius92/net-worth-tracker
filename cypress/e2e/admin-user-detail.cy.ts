import { faker } from "@faker-js/faker";

describe("/users/:userId — admin user detail", () => {
  let adminEmail: string;
  let targetEmail: string;

  beforeEach(() => {
    adminEmail = faker.internet.email({ provider: "example.com" });
    targetEmail = faker.internet.email({ provider: "example.com" });
    cy.task("createUser", targetEmail);
    cy.loginAsAdmin({ email: adminEmail });
  });

  afterEach(() => {
    cy.cleanupUser({ email: adminEmail });
    cy.cleanupUser({ email: targetEmail });
  });

  it("is linked from the /users table", () => {
    cy.visitAndCheck("/users");
    cy.findAllByRole("link", { name: /^view$/i })
      .first()
      .click();
    cy.location("pathname").should("match", /^\/users\/.+$/);
  });

  it("shows the target user's name, email, role, and 2FA status", () => {
    cy.task("createUser", targetEmail);
    cy.visitAndCheck("/users");
    cy.findAllByRole("link", { name: /^view$/i })
      .filter(`:contains("${targetEmail}")`)
      .first()
      .click();

    cy.findByText(targetEmail);
    cy.findByText(/customer/i);
    cy.findByText(/not enabled/i);
  });

  it("shows empty states when the user has no accounts or plaid connections", () => {
    cy.visitAndCheck("/users");
    cy.findAllByRole("link", { name: /^view$/i })
      .first()
      .click();
    cy.findByText(/no accounts/i);
    cy.findByText(/no plaid connections/i);
  });

  it("has a delete account link", () => {
    cy.visitAndCheck("/users");
    cy.findAllByRole("link", { name: /^view$/i })
      .first()
      .click();
    cy.findByRole("link", { name: /delete account/i });
  });

  it("redirects non-admins to /", () => {
    cy.clearCookie("__session");
    cy.login();
    cy.visit("/users/some-id");
    cy.location("pathname").should("eq", "/");
  });
});

describe("/users/:userId/delete — admin delete user", () => {
  let adminEmail: string;
  let targetEmail: string;

  beforeEach(() => {
    adminEmail = faker.internet.email({ provider: "example.com" });
    targetEmail = faker.internet.email({ provider: "example.com" });
    cy.task("createUser", targetEmail);
    cy.loginAsAdmin({ email: adminEmail });
  });

  afterEach(() => {
    cy.cleanupUser({ email: adminEmail });
    cy.cleanupUser({ email: targetEmail });
  });

  it("is linked from the /users table", () => {
    cy.visitAndCheck("/users");
    cy.findAllByRole("link", { name: /^delete$/i })
      .first()
      .click();
    cy.location("pathname").should("match", /^\/users\/.+\/delete$/);
  });

  it("shows the target user's name and email on the confirmation page", () => {
    cy.visitAndCheck("/users");
    cy.findAllByRole("link", { name: /^delete$/i })
      .first()
      .click();
    cy.findByText(targetEmail);
  });

  it("deletes the user and redirects to /users on confirm", () => {
    cy.visitAndCheck("/users");
    cy.findAllByRole("link", { name: /^delete$/i })
      .first()
      .click();
    cy.findByRole("button", {
      name: /permanently delete this account/i,
    }).click();
    cy.location("pathname").should("eq", "/users");
    cy.findByText(targetEmail).should("not.exist");
  });

  it("blocks an admin from deleting their own account via the admin panel", () => {
    cy.visitAndCheck("/users");
    cy.findByText(adminEmail)
      .closest("tr")
      .findByRole("link", { name: /^delete$/i })
      .click();
    cy.findByText(/cannot delete your own account from here/i);
    cy.findByRole("button", { name: /permanently delete/i }).should(
      "not.exist",
    );
  });

  it("blocks deletion of the last admin", () => {
    cy.visitAndCheck("/users");
    cy.findByText(adminEmail)
      .closest("tr")
      .findByRole("link", { name: /^delete$/i })
      .click();
    cy.findByText(/cannot delete your own account/i);
  });

  it("redirects non-admins to /", () => {
    cy.clearCookie("__session");
    cy.login();
    cy.visit("/users/some-id/delete");
    cy.location("pathname").should("eq", "/");
  });
});
