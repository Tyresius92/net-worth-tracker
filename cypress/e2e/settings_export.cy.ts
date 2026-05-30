import { faker } from "@faker-js/faker";

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

    cy.task("createAccount", {
      email,
      name: "My Checking",
      snapshots: [{ amountCents: 123456, date: "2025-01-15" }],
    }).then((result) => {
      const { accountId, accountName } = result as {
        accountId: string;
        accountName: string;
      };

      cy.request("/settings/export_data").then((response) => {
        expect(response.status).to.eq(200);
        expect(response.headers["content-type"]).to.include("text/csv");
        expect(response.headers["content-disposition"]).to.include(
          "attachment",
        );
        expect(response.headers["content-disposition"]).to.include(
          "net-worth-",
        );

        const body = response.body as string;
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

    cy.task("createAccount", {
      email,
      name: "Checking",
      snapshots: [{ amountCents: 100000, date: "2025-01-01" }],
    }).then((checking) => {
      cy.task("createAccount", {
        email,
        name: "Savings",
        snapshots: [{ amountCents: 200000, date: "2025-02-01" }],
      }).then((savings) => {
        const { accountId: checkingId } = checking as {
          accountId: string;
          accountName: string;
        };
        const { accountId: savingsId } = savings as {
          accountId: string;
          accountName: string;
        };

        cy.request("/settings/export_data").then((response) => {
          const body = response.body as string;
          const lines = body.split("\n");

          // Header contains both accounts
          expect(lines[0]).to.include(`Checking (${checkingId})`);
          expect(lines[0]).to.include(`Savings (${savingsId})`);

          // Only two data rows — one per distinct date
          expect(lines).to.have.length(3);

          // Each row is scoped to the date that account has data
          expect(lines[1]).to.include("2025-01-01");
          expect(lines[2]).to.include("2025-02-01");
        });
      });
    });

    cy.cleanupUser();
  });
});
