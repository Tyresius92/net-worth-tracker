import type { Meta, StoryObj } from "@storybook/react-vite";

import { Checkbox } from "./Checkbox";

const meta = {
  component: Checkbox,
  tags: [],
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Unchecked: Story = {
  args: { name: "agree", label: "I agree to the terms" },
};

export const Checked: Story = {
  args: { name: "agree", label: "I agree to the terms", defaultChecked: true },
};

export const Disabled: Story = {
  args: { name: "agree", label: "Cannot change this option", disabled: true },
};
