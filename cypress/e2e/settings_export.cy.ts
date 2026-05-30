import { faker } from "@faker-js/faker";

interface AccountResult {
  accountId: string;
  accountName: string;
}

describe("settings export", () => {
  it("shows 'The record' section with a Download link", () => {
    cy.login();
    cy.visitAndCheck("/settings");
    cy.findByText(/the record/i).should("exist");
    cy.findByRole("link", { name: /download/i }).should("exist");
    cy.cleanupUser();
  });

  it("returns a CSV file with correct headers and figure data", () => {
    const email = faker.internet.email({ provider: "example.com" });
    cy.login({ email });

    cy.task<AccountResult>("createAccount", {
      email,
      name: "My Checking",
      snapshots: [{ amountCents: 123456, date: "2025-01-15" }],
    }).then(({ accountId, accountName }) => {
      cy.request("/settings/export_data").then((response) => {
        expect(response.status).to.eq(200);
        expect(response.headers["content-type"]).to.include("text/csv");
        expect(response.headers["content-disposition"]).to.include(
          "attachment",
        );
        expect(response.headers["content-disposition"]).to.include(
          "net-worth-",
        );

        const body = String(response.body);
        expect(body).to.include(`${accountName} (${accountId})`);
        expect(body).to.include("2025-01-15");
        expect(body).to.include("1234.56");
      });
    });

    cy.cleanupUser();
  });

  it("includes all accounts and only dates where figures exist", () => {
    const email = faker.internet.email({ provider: "example.com" });
    cy.login({ email });

    cy.task<AccountResult>("createAccount", {
      email,
      name: "Checking",
      snapshots: [{ amountCents: 100000, date: "2025-01-01" }],
    }).then(({ accountId: checkingId }) => {
      cy.task<AccountResult>("createAccount", {
        email,
        name: "Savings",
        snapshots: [{ amountCents: 200000, date: "2025-02-01" }],
      }).then(({ accountId: savingsId }) => {
        cy.request("/settings/export_data").then((response) => {
          const body = String(response.body);
          const lines = body.split("\n");

          expect(lines[0]).to.include(`Checking (${checkingId})`);
          expect(lines[0]).to.include(`Savings (${savingsId})`);
          expect(lines).to.have.length(3);
          expect(lines[1]).to.include("2025-01-01");
          expect(lines[2]).to.include("2025-02-01");
        });
      });
    });

    cy.cleanupUser();
  });
});
