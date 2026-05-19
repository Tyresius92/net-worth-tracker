import type { Meta, StoryObj } from "@storybook/react-vite";

import { BalanceChart } from "./BalanceChart";

const meta = {
  component: BalanceChart,
  tags: [],
} satisfies Meta<typeof BalanceChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const GrowingBalance: Story = {
  args: {
    title: "Net worth over time",
    balances: [
      { date: "2024-01-01", amount: 1250000 },
      { date: "2024-02-01", amount: 1384000 },
      { date: "2024-03-01", amount: 1510000 },
      { date: "2024-04-01", amount: 1620000 },
      { date: "2024-05-01", amount: 1755000 },
      { date: "2024-06-01", amount: 1830000 },
      { date: "2024-07-01", amount: 1960000 },
      { date: "2024-08-01", amount: 2145000 },
      { date: "2024-09-01", amount: 2280000 },
      { date: "2024-10-01", amount: 2390000 },
      { date: "2024-11-01", amount: 2510000 },
      { date: "2024-12-01", amount: 2648000 },
    ],
  },
};

export const WithZeroCrossing: Story = {
  args: {
    title: "Balance during debt payoff",
    balances: [
      { date: "2024-01-01", amount: -520000 },
      { date: "2024-02-01", amount: -445000 },
      { date: "2024-03-01", amount: -360000 },
      { date: "2024-04-01", amount: -280000 },
      { date: "2024-05-01", amount: -190000 },
      { date: "2024-06-01", amount: -95000 },
      { date: "2024-07-01", amount: 12000 },
      { date: "2024-08-01", amount: 118000 },
      { date: "2024-09-01", amount: 235000 },
    ],
  },
};
