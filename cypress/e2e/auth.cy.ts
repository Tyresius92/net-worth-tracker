describe("protected route redirects", () => {
  it("redirects /settings to login with correct redirectTo param", () => {
    cy.visitAndCheck("/settings");
    cy.location("pathname").should("eq", "/login");
    cy.location("search").should("include", "redirectTo=%2Fsettings");
  });

  it("redirects /notes to login with correct redirectTo param", () => {
    cy.visitAndCheck("/notes");
    cy.location("pathname").should("eq", "/login");
    cy.location("search").should("include", "redirectTo=%2Fnotes");
  });

  it("redirects /plaid_items to login with correct redirectTo param", () => {
    cy.visitAndCheck("/plaid_items");
    cy.location("pathname").should("eq", "/login");
    cy.location("search").should("include", "redirectTo=%2Fplaid_items");
  });
});

describe("logout", () => {
  it("logs out and redirects to home", () => {
    cy.login();
    cy.visitAndCheck("/accounts");
    cy.intercept("POST", "/logout.data").as("logoutRequest");
    cy.findByRole("button", { name: /log out/i }).click();
    cy.wait("@logoutRequest");
    cy.location("pathname").should("eq", "/");
    cy.getCookie("__session").should("be.null");
    cy.cleanupUser();
  });

  it("clears the session so protected routes redirect to login after logout", () => {
    cy.login();
    cy.visitAndCheck("/accounts");
    cy.intercept("POST", "/logout.data").as("logoutRequest");
    cy.findByRole("button", { name: /log out/i }).click();
    cy.wait("@logoutRequest");
    cy.location("pathname").should("eq", "/");
    cy.getCookie("__session").should("be.null");
    cy.visitAndCheck("/accounts");
    cy.location("pathname").should("eq", "/login");
    cy.cleanupUser();
  });
});
