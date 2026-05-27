import type { Meta, StoryObj } from "@storybook/react-vite";

import { Divider } from "./Divider";

const meta = {
  component: Divider,
  tags: [],
} satisfies Meta<typeof Divider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Light: Story = {
  args: { variant: "light" },
};

export const Heavy: Story = {
  args: { variant: "heavy" },
};
