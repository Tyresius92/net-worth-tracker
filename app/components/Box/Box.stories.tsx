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
  args: { children: "Bordered box", border: { color: "sand-7" }, p: 12 },
};

export const WithSideBorder: Story = {
  name: "With side border (borderLeft)",
  args: {
    children: "Left-ruled box",
    borderLeft: { color: "sand-8", width: 3 },
    pl: 12,
  },
};

export const WithMaxWidth: Story = {
  args: { children: "Max width box", maxWidth: 400, p: 12, bg: "sand-2" },
};

export const WithColumnLayout: Story = {
  args: {
    columnCount: 2,
    columnGap: 24,
    columnRule: { color: "sand-6" },
    children:
      "Every decision in this project reflects a single priority: durability. SQLite instead of Postgres — because a single file is simpler to back up and reason about. React Router instead of Next.js — because the file conventions fit the mental model. No ORM magic — because raw Prisma is already close enough to SQL that another abstraction layer adds confusion without removing complexity.",
  },
};
