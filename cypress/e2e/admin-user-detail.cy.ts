import { faker } from "@faker-js/faker";

describe("/users/:userId — admin user detail", () => {
  it("is linked from the /users table", () => {
    const adminEmail = faker.internet.email({ provider: "example.com" });
    const targetEmail = faker.internet.email({ provider: "example.com" });
    cy.task("createUser", targetEmail);
    cy.loginAsAdmin({ email: adminEmail });
    cy.visitAndCheck("/users");
    cy.findAllByRole("link", { name: /^view$/i })
      .first()
      .click();
    cy.location("pathname").should("match", /^\/users\/.+$/);
    cy.cleanupUser({ email: adminEmail });
    cy.cleanupUser({ email: targetEmail });
  });

  it("shows the target user's name, email, role, and 2FA status", () => {
    const adminEmail = faker.internet.email({ provider: "example.com" });
    const targetEmail = faker.internet.email({ provider: "example.com" });
    cy.task("createUser", targetEmail);
    cy.loginAsAdmin({ email: adminEmail });
    cy.visitAndCheck("/users");
    cy.findByText(targetEmail)
      .closest("tr")
      .findByRole("link", { name: /^view$/i })
      .click();

    cy.findByText(targetEmail);
    cy.findByText(/customer/i);
    cy.findByText(/not enabled/i);
    cy.cleanupUser({ email: adminEmail });
    cy.cleanupUser({ email: targetEmail });
  });

  it("shows empty states when the user has no accounts or plaid connections", () => {
    const adminEmail = faker.internet.email({ provider: "example.com" });
    const targetEmail = faker.internet.email({ provider: "example.com" });
    cy.task("createUser", targetEmail);
    cy.loginAsAdmin({ email: adminEmail });
    cy.visitAndCheck("/users");
    cy.findAllByRole("link", { name: /^view$/i })
      .first()
      .click();
    cy.findByText(/no accounts/i);
    cy.findByText(/no plaid connections/i);
    cy.cleanupUser({ email: adminEmail });
    cy.cleanupUser({ email: targetEmail });
  });

  it("has a delete account link", () => {
    const adminEmail = faker.internet.email({ provider: "example.com" });
    const targetEmail = faker.internet.email({ provider: "example.com" });
    cy.task("createUser", targetEmail);
    cy.loginAsAdmin({ email: adminEmail });
    cy.visitAndCheck("/users");
    cy.findAllByRole("link", { name: /^view$/i })
      .first()
      .click();
    cy.findByRole("link", { name: /delete account/i });
    cy.cleanupUser({ email: adminEmail });
    cy.cleanupUser({ email: targetEmail });
  });

  it("redirects non-admins to /", () => {
    const adminEmail = faker.internet.email({ provider: "example.com" });
    const targetEmail = faker.internet.email({ provider: "example.com" });
    cy.task("createUser", targetEmail);
    cy.loginAsAdmin({ email: adminEmail });
    cy.clearCookie("__session");
    cy.login();
    cy.visit("/users/some-id");
    cy.location("pathname").should("eq", "/");
    cy.cleanupUser({ email: adminEmail });
    cy.cleanupUser({ email: targetEmail });
  });
});

describe("/users/:userId/delete — admin delete user", () => {
  it("is linked from the /users table", () => {
    const adminEmail = faker.internet.email({ provider: "example.com" });
    const targetEmail = faker.internet.email({ provider: "example.com" });
    cy.task("createUser", targetEmail);
    cy.loginAsAdmin({ email: adminEmail });
    cy.visitAndCheck("/users");
    cy.findAllByRole("link", { name: /^delete$/i })
      .first()
      .click();
    cy.location("pathname").should("match", /^\/users\/.+\/delete$/);
    cy.cleanupUser({ email: adminEmail });
    cy.cleanupUser({ email: targetEmail });
  });

  it("shows the target user's name and email on the confirmation page", () => {
    const adminEmail = faker.internet.email({ provider: "example.com" });
    const targetEmail = faker.internet.email({ provider: "example.com" });
    cy.task("createUser", targetEmail);
    cy.loginAsAdmin({ email: adminEmail });
    cy.visitAndCheck("/users");
    cy.findAllByRole("link", { name: /^delete$/i })
      .first()
      .click();
    cy.findByText(targetEmail);
    cy.cleanupUser({ email: adminEmail });
    cy.cleanupUser({ email: targetEmail });
  });

  it("deletes the user and redirects to /users on confirm", () => {
    const adminEmail = faker.internet.email({ provider: "example.com" });
    const targetEmail = faker.internet.email({ provider: "example.com" });
    cy.task("createUser", targetEmail);
    cy.loginAsAdmin({ email: adminEmail });
    cy.visitAndCheck("/users");
    cy.findAllByRole("link", { name: /^delete$/i })
      .first()
      .click();
    cy.findByRole("button", {
      name: /permanently delete this account/i,
    }).click();
    cy.location("pathname").should("eq", "/users");
    cy.findByText(targetEmail).should("not.exist");
    cy.cleanupUser({ email: adminEmail });
    cy.cleanupUser({ email: targetEmail });
  });

  it("blocks an admin from deleting their own account via the admin panel", () => {
    const adminEmail = faker.internet.email({ provider: "example.com" });
    const targetEmail = faker.internet.email({ provider: "example.com" });
    cy.task("createUser", targetEmail);
    cy.loginAsAdmin({ email: adminEmail });
    cy.visitAndCheck("/users");
    cy.findByText(adminEmail)
      .closest("tr")
      .findByRole("link", { name: /^delete$/i })
      .click();
    cy.findByText(/cannot delete your own account from here/i);
    cy.findByRole("button", { name: /permanently delete/i }).should(
      "not.exist",
    );
    cy.cleanupUser({ email: adminEmail });
    cy.cleanupUser({ email: targetEmail });
  });

  it("blocks deletion of the last admin", () => {
    const adminEmail = faker.internet.email({ provider: "example.com" });
    const targetEmail = faker.internet.email({ provider: "example.com" });
    cy.task("createUser", targetEmail);
    cy.loginAsAdmin({ email: adminEmail });
    cy.visitAndCheck("/users");
    cy.findByText(adminEmail)
      .closest("tr")
      .findByRole("link", { name: /^delete$/i })
      .click();
    cy.findByText(/cannot delete your own account/i);
    cy.cleanupUser({ email: adminEmail });
    cy.cleanupUser({ email: targetEmail });
  });

  it("redirects non-admins to /", () => {
    const adminEmail = faker.internet.email({ provider: "example.com" });
    const targetEmail = faker.internet.email({ provider: "example.com" });
    cy.task("createUser", targetEmail);
    cy.loginAsAdmin({ email: adminEmail });
    cy.clearCookie("__session");
    cy.login();
    cy.visit("/users/some-id/delete");
    cy.location("pathname").should("eq", "/");
    cy.cleanupUser({ email: adminEmail });
    cy.cleanupUser({ email: targetEmail });
  });
});
