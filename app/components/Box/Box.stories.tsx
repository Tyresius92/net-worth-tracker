import type { Meta, StoryObj } from "@storybook/react-vite";

import { Box } from "./Box";

const meta = {
  component: Box,
  tags: [],
} satisfies Meta<typeof Box>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: "Child content" },
};

export const WithPadding: Story = {
  args: { children: "Padded content", p: 16, m: 32 },
};

export const WithBackground: Story = {
  args: { children: "Colored background", bg: "sand-3", p: 12 },
};

export const WithBorder: Story = {
  args: { children: "Bordered box", borderColor: "sand-7", p: 12 },
};

export const WithMaxWidth: Story = {
  args: { children: "Max width box", maxWidth: 400, p: 12, bg: "sand-2" },
};
