import type { Meta, StoryObj } from "@storybook/react-vite";

import { Select } from "./Select";

const meta = {
  component: Select,
  tags: ["ai-generated"],
  args: {
    name: "account-type",
    label: "Account type",
    options: [
      { value: "checking", label: "Checking" },
      { value: "savings", label: "Savings" },
      { value: "investment", label: "Investment" },
    ],
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithDefaultValue: Story = {
  args: { defaultValue: "savings" },
};

export const WithError: Story = {
  args: { errorMessage: "Please select an account type" },
};

export const Disabled: Story = {
  args: { disabled: true },
};
