import { faker } from "@faker-js/faker";

interface AccountResult {
  accountId: string;
  accountName: string;
}

describe("settings import", () => {
  it("shows the Import link in the 'The record' section of /settings", () => {
    cy.login();
    cy.visitAndCheck("/settings");
    cy.findByText(/the record/i).should("exist");
    cy.findByRole("link", { name: /^import$/i }).should("exist");
    cy.cleanupUser();
  });

  it("authenticated user uploads a valid export-format CSV and sees the result summary", () => {
    cy.login();
    cy.visitAndCheck("/settings/import_data");

    cy.get('input[type="file"]').selectFile("cypress/fixtures/import_valid.csv");
    cy.findByRole("button", { name: /^import$/i }).click();

    cy.findByText(/import complete/i).should("exist");
    cy.findByText(/sources created: 2/i).should("exist");
    cy.findByText(/figures added: 4/i).should("exist");
    cy.findByText(/figures skipped \(exact duplicates\): 0/i).should("exist");

    cy.cleanupUser();
  });

  it("re-uploading the same CSV results in all figures skipped and zero added", () => {
    const email = faker.internet.email({ provider: "example.com" });
    cy.login({ email });

    cy.task<AccountResult>("createAccount", {
      email,
      name: "Chase Checking",
      snapshots: [],
    }).then(({ accountId }) => {
      const csvContent = [
        `date,Chase Checking (${accountId})`,
        "2025-01-15,1234.56",
        "2025-01-16,1250.00",
      ].join("\n");

      const csvFile = {
        contents: Cypress.Buffer.from(csvContent),
        fileName: "import.csv",
        mimeType: "text/csv",
      };

      cy.visitAndCheck("/settings/import_data");

      // First upload: figures are new, so they get added
      cy.get('input[type="file"]').selectFile(csvFile);
      cy.findByRole("button", { name: /^import$/i }).click();
      cy.findByText(/import complete/i).should("exist");
      cy.findByText(/figures added: 2/i).should("exist");

      // Second upload: exact duplicates, all skipped
      cy.get('input[type="file"]').selectFile(csvFile);
      cy.findByRole("button", { name: /^import$/i }).click();

      cy.findByText(/sources created: 0/i).should("exist");
      cy.findByText(/figures added: 0/i).should("exist");
      cy.findByText(/figures skipped \(exact duplicates\): 2/i).should("exist");
    });

    cy.cleanupUser();
  });

  it("CSV with name-only headers creates new sources", () => {
    cy.login();
    cy.visitAndCheck("/settings/import_data");

    cy.get('input[type="file"]').selectFile(
      "cypress/fixtures/import_name_only.csv",
    );
    cy.findByRole("button", { name: /^import$/i }).click();

    cy.findByText(/import complete/i).should("exist");
    cy.findByText(/sources created: 2/i).should("exist");
    cy.findByText(/figures added: 3/i).should("exist");

    cy.cleanupUser();
  });

  it("redirects unauthenticated users away from /settings/import_data", () => {
    cy.visit("/settings/import_data");
    cy.location("pathname").should("equal", "/login");
  });
});
