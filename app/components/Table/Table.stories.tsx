import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { Table } from "./Table";

const meta = {
  component: Table,
  tags: ["ai-generated"],
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithData: Story = {
  args: {
    caption: "Account balances",
    children: (
      <>
        <Table.Head>
          <Table.ColumnHeader>Account</Table.ColumnHeader>
          <Table.ColumnHeader>Type</Table.ColumnHeader>
          <Table.ColumnHeader>Balance</Table.ColumnHeader>
        </Table.Head>
        <Table.Body>
          <Table.Row>
            <Table.RowHeader>Chase Checking</Table.RowHeader>
            <Table.Cell>Checking</Table.Cell>
            <Table.Cell>$4,200.00</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.RowHeader>Ally Savings</Table.RowHeader>
            <Table.Cell>Savings</Table.Cell>
            <Table.Cell>$18,500.00</Table.Cell>
          </Table.Row>
        </Table.Body>
      </>
    ),
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Account balances")).toBeVisible();
    const headers = canvas.getAllByRole("columnheader");
    await expect(headers).toHaveLength(3);
    headers.forEach((h) => expect(h).toHaveAttribute("scope", "col"));
  },
};

export const SingleColumn: Story = {
  args: {
    caption: "Recent activity",
    children: (
      <Table.Body>
        <Table.Row>
          <Table.Cell>Balance synced</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>Snapshot created</Table.Cell>
        </Table.Row>
      </Table.Body>
    ),
  },
};
