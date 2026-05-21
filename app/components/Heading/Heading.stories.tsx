import type { Meta, StoryObj } from "@storybook/react-vite";

import { Heading } from "./Heading";

const meta = {
  component: Heading,
  tags: [],
} satisfies Meta<typeof Heading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Level1: Story = {
  args: { level: 1, children: "Your net worth is $172,388" },
};

export const Level2: Story = {
  args: { level: 2, children: "Highlights" },
};

export const Level3: Story = {
  args: { level: 3, children: "Specifications" },
};
