describe("protected route", () => {
  it("redirects /accounts to login when unauthenticated", () => {
    cy.visit("/accounts");
    cy.location("pathname").should("eq", "/login");
    cy.location("search").should("include", "redirectTo=%2Faccounts");
  });
});

describe("accounts", () => {
  describe("creating an account", () => {
    it("creates a new account and navigates to its detail page", () => {
      cy.login();
      cy.visitAndCheck("/accounts");
      cy.findByRole("link", { name: /add a source/i }).should("exist");
      cy.visitAndCheck("/accounts/new");
      cy.findByLabelText(/source name/i).type("My Checking Account");
      cy.findByLabelText(/source type/i).select("Checking");
      cy.findByRole("button", { name: /submit/i }).click();

      cy.location("pathname").should("match", /^\/accounts\/.+$/);
      cy.findAllByText(/my checking account/i).should("have.length", 2);
      cy.cleanupUser();
    });

    it("shows the new account in the Open Accounts sidebar", () => {
      cy.login();
      cy.visitAndCheck("/accounts/new");
      cy.findByLabelText(/source name/i).type("My Savings Account");
      cy.findByLabelText(/source type/i).select("Savings");
      cy.findByRole("button", { name: /submit/i }).click();

      cy.location("pathname").should("match", /^\/accounts\/.+$/);
      cy.findByRole("navigation", { name: /sources/i })
        .findByText("My Savings Account")
        .should("exist");
      cy.cleanupUser();
    });

    it("shows a validation error when the account name is empty", () => {
      cy.login();
      cy.visitAndCheck("/accounts/new");

      cy.findByLabelText(/source type/i).select("Checking");
      cy.findByRole("button", { name: /submit/i }).click();

      cy.location("pathname").should("eq", "/accounts/new");
      cy.findByText(/this field is required/i).should("exist");
      cy.cleanupUser();
    });
  });

  describe("editing an account", () => {
    it("updates the account name and type", () => {
      cy.login();
      cy.visitAndCheck("/accounts/new");
      cy.findByLabelText(/source name/i).should("not.be.disabled");
      cy.findByLabelText(/source name/i).type("Original Name");
      cy.findByLabelText(/source type/i).select("Checking");
      cy.findByRole("button", { name: /submit/i }).click();
      cy.location("pathname").should("match", /^\/accounts\/.+$/);
      cy.findByRole("link", { name: /edit source/i }).click();

      cy.findByLabelText(/source name/i).clear();
      cy.findByLabelText(/source name/i).type("Updated Name");
      cy.findByLabelText(/source type/i).select("Savings");
      cy.findByRole("button", { name: /save changes/i }).click();

      cy.location("pathname").should("match", /^\/accounts\/.+$/);
      cy.findAllByText(/updated name/i).should("have.length", 2);
      cy.cleanupUser();
    });
  });

  describe("adding a balance snapshot", () => {
    it("adds a new balance and shows it in the balances table", () => {
      cy.login();
      cy.visitAndCheck("/accounts/new");
      cy.findByLabelText(/source name/i).type("Balance Test Account");
      cy.findByLabelText(/source type/i).select("Checking");
      cy.findByRole("button", { name: /submit/i }).click();
      cy.location("pathname").should("match", /^\/accounts\/.+$/);

      cy.findByRole("link", { name: /record a figure/i }).click();

      cy.location("pathname").should(
        "match",
        /^\/accounts\/.+\/balances\/new$/,
      );

      cy.findByLabelText(/figure amount/i).type("1500.00");
      cy.findByLabelText(/figure date/i).type("2024-06-15");
      cy.findByRole("button", { name: /submit/i }).click();

      cy.location("pathname").should("match", /^\/accounts\/.+$/);
      cy.findByRole("table", { name: /figures/i })
        .findByText("$1,500.00")
        .should("exist");
      cy.cleanupUser();
    });
  });

  describe("closing an account", () => {
    it("marks the account as closed", () => {
      cy.login();
      cy.visitAndCheck("/accounts/new");
      cy.findByLabelText(/source name/i).type("Account To Close");
      cy.findByLabelText(/source type/i).select("Checking");
      cy.findByRole("button", { name: /submit/i }).click();
      cy.location("pathname").should("match", /^\/accounts\/.+$/);
      cy.findByRole("button", { name: /mark source as closed/i }).click();

      cy.findByText(/closed:/i).should("exist");
      cy.cleanupUser();
    });

    it("moves the closed account to the Closed Accounts section of the sidebar", () => {
      cy.login();
      cy.visitAndCheck("/accounts/new");
      cy.findByLabelText(/source name/i).type("Account To Close");
      cy.findByLabelText(/source type/i).select("Checking");
      cy.findByRole("button", { name: /submit/i }).click();
      cy.location("pathname").should("match", /^\/accounts\/.+$/);
      cy.findByRole("button", { name: /mark source as closed/i }).click();

      cy.findByRole("navigation", { name: /sources/i })
        .findByRole("heading", { name: /closed sources/i })
        .should("exist");
      cy.findByRole("navigation", { name: /sources/i })
        .findByText("Account To Close")
        .should("exist");
      cy.cleanupUser();
    });
  });
});
