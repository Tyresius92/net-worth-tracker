describe("dashboard - unauthenticated", () => {
  it("shows the hero headline", () => {
    cy.visitAndCheck("/");
    cy.findByRole("heading", {
      name: /a ledger of your own/i,
    }).should("exist");
    cy.findByText(/privacy-first net worth tracker/i).should("exist");
    cy.findByRole("heading", { name: /your net worth is/i }).should(
      "not.exist",
    );
  });
});

describe("dashboard - authenticated, no accounts", () => {
  it("shows the net worth heading", () => {
    cy.login();
    cy.visitAndCheck("/");
    cy.findByRole("heading", { name: /your net worth is/i }).should("exist");

    cy.findByRole("heading", { name: /your net worth is \$0\.00/i }).should(
      "exist",
    );

    cy.findByRole("heading", {
      name: /a ledger of your own/i,
    }).should("not.exist");
    cy.cleanupUser();
  });
});

describe("dashboard - authenticated, with account balance", () => {
  beforeEach(() => {
    cy.login();

    cy.visitAndCheck("/accounts/new");
    cy.findByLabelText(/source name/i).type("Dashboard Test Account");
    cy.findByLabelText(/source type/i).select("Checking");
    cy.findByRole("button", { name: /submit/i }).click();
    cy.location("pathname").should("match", /^\/accounts\/.+$/);

    cy.findByRole("link", { name: /record a figure/i }).click();
    cy.findByLabelText(/figure amount/i).type("2500.00");
    cy.findByLabelText(/figure date/i).type(
      new Date().toISOString().split("T")[0],
    );
    cy.findByRole("button", { name: /submit/i }).click();
    cy.location("pathname").should("match", /^\/accounts\/.+$/);

    cy.visitAndCheck("/");
    cy.findByRole("heading", { name: /your net worth is \$2,500\.00/i }).should(
      "exist",
    );
    cy.findByText(/over the last 30 days/i).should("exist");
    cy.cleanupUser();
  });
});
