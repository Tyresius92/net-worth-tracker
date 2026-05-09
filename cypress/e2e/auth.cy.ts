describe("protected route redirects", () => {
  it("redirects /profile to login with correct redirectTo param", () => {
    cy.visit("/profile");
    cy.location("pathname").should("eq", "/login");
    cy.location("search").should("include", "redirectTo=%2Fprofile");
  });

  it("redirects /notes to login with correct redirectTo param", () => {
    cy.visit("/notes");
    cy.location("pathname").should("eq", "/login");
    cy.location("search").should("include", "redirectTo=%2Fnotes");
  });

  it("redirects /plaid_items to login with correct redirectTo param", () => {
    cy.visit("/plaid_items");
    cy.location("pathname").should("eq", "/login");
    cy.location("search").should("include", "redirectTo=%2Fplaid_items");
  });
});

describe("logout", () => {
  afterEach(() => {
    cy.cleanupUser();
  });

  it("logs out and redirects to home", () => {
    cy.login();
    cy.visit("/");
    cy.findByRole("button", { name: /log out/i }).click();
    cy.location("pathname").should("eq", "/");
    cy.getCookie("__session").should("be.null");
  });

  it("clears the session so protected routes redirect to login after logout", () => {
    cy.login();
    cy.visit("/");
    cy.findByRole("button", { name: /log out/i }).click();
    cy.location("pathname").should("eq", "/");
    cy.visit("/accounts");
    cy.location("pathname").should("eq", "/login");
  });
});
