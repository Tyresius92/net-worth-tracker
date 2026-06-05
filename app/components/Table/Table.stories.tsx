import type { Meta, StoryObj } from "@storybook/react-vite";

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
};

export const WithFooter: Story = {
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
            <Table.Cell align="end">$4,200.00</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.RowHeader>Ally Savings</Table.RowHeader>
            <Table.Cell>Savings</Table.Cell>
            <Table.Cell align="end">$18,500.00</Table.Cell>
          </Table.Row>
        </Table.Body>
        <Table.Foot>
          <Table.RowHeader>Total</Table.RowHeader>
          <Table.Cell />
          <Table.Cell align="end">$22,700.00</Table.Cell>
        </Table.Foot>
      </>
    ),
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
