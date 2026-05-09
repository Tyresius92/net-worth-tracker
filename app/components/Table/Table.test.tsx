import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { Table } from "./Table";

describe("Table", () => {
  it("renders the caption", () => {
    render(
      <Table caption="Accounts">
        <Table.Body>
          <Table.Row>
            <Table.Cell>Hello</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>,
    );
    expect(screen.getByText("Accounts")).toBeInTheDocument();
  });

  it("renders column headers with scope='col'", () => {
    render(
      <Table caption="Accounts">
        <Table.Head>
          <Table.ColumnHeader>Name</Table.ColumnHeader>
          <Table.ColumnHeader>Balance</Table.ColumnHeader>
        </Table.Head>
        <Table.Body>
          <Table.Row>
            <Table.Cell>Hello</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>,
    );
    const headers = screen.getAllByRole("columnheader");
    expect(headers).toHaveLength(2);
    headers.forEach((h) => expect(h).toHaveAttribute("scope", "col"));
  });

  it("renders row headers with scope='row'", () => {
    render(
      <Table caption="Accounts">
        <Table.Head>
          <Table.ColumnHeader>Name</Table.ColumnHeader>
        </Table.Head>
        <Table.Body>
          <Table.Row>
            <Table.RowHeader>Savings</Table.RowHeader>
          </Table.Row>
        </Table.Body>
      </Table>,
    );
    expect(screen.getByRole("rowheader")).toHaveAttribute("scope", "row");
  });

  it("renders cell content", () => {
    render(
      <Table caption="Accounts">
        <Table.Head>
          <Table.ColumnHeader>Balance</Table.ColumnHeader>
        </Table.Head>
        <Table.Body>
          <Table.Row>
            <Table.Cell>$1,000.00</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>,
    );
    expect(screen.getByRole("cell", { name: "$1,000.00" })).toBeInTheDocument();
  });

  it("renders multiple rows", () => {
    render(
      <Table caption="Accounts">
        <Table.Head>
          <Table.ColumnHeader>Name</Table.ColumnHeader>
        </Table.Head>
        <Table.Body>
          <Table.Row>
            <Table.Cell>Checking</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>Savings</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>,
    );
    expect(screen.getAllByRole("row")).toHaveLength(3); // 1 header + 2 data rows
  });
});
