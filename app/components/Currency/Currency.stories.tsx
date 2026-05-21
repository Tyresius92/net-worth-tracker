import type { Meta, StoryObj } from "@storybook/react-vite";

import { Heading } from "../Heading/Heading";
import { Table } from "../Table/Table";
import { Text } from "../Text/Text";

import { Currency } from "./Currency";

const meta = {
  component: Currency,
  tags: [],
} satisfies Meta<typeof Currency>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { value: 17238800 },
};

export const WithoutCents: Story = {
  args: { value: 17238800, includeCents: false },
};

export const Negative: Story = {
  args: { value: -50000 },
};

export const InHeading: Story = {
  render: () => (
    <Heading level={1}>
      Your net worth is <Currency value={17238800} />
    </Heading>
  ),
};

export const InBodyText: Story = {
  render: () => (
    <Text variant="body">
      Up <Currency value={123456} includeCents={false} /> over the last 30 days
    </Text>
  ),
};

export const InCaption: Story = {
  render: () => (
    <Text variant="caption">
      Balance <Currency value={17238800} />
    </Text>
  ),
};

export const TabularAlignment: Story = {
  render: () => (
    <Table caption="Account balances">
      <Table.Head>
        <Table.ColumnHeader>Account</Table.ColumnHeader>
        <Table.ColumnHeader>Balance</Table.ColumnHeader>
      </Table.Head>
      <Table.Body>
        <Table.Row>
          <Table.RowHeader>Checking</Table.RowHeader>
          <Table.Cell align="end">
            <Currency value={111111} />
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.RowHeader>Savings</Table.RowHeader>
          <Table.Cell align="end">
            <Currency value={1234567} />
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.RowHeader>Investment account</Table.RowHeader>
          <Table.Cell align="end">
            <Currency value={88888888} />
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.RowHeader>Mortgage</Table.RowHeader>
          <Table.Cell align="end">
            <Currency value={-12450000} />
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.RowHeader>Credit card</Table.RowHeader>
          <Table.Cell align="end">
            <Currency value={-88888} />
          </Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table>
  ),
};
