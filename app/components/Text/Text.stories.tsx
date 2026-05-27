import type { Meta, StoryObj } from "@storybook/react-vite";

import { Text } from "./Text";

const meta = {
  component: Text,
  tags: [],
} satisfies Meta<typeof Text>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Deck: Story = {
  args: {
    variant: "deck",
    children:
      "A self-hosted net worth tracker with automatic daily syncing, historical snapshots, and full data ownership.",
  },
};

export const Body: Story = {
  args: {
    variant: "body",
    children:
      "Every decision in this project reflects a single priority: durability. SQLite instead of Postgres — because a single file is simpler to back up and reason about.",
  },
};

export const Byline: Story = {
  args: {
    variant: "byline",
    children: "By Tyrel Clayton · Est. 2024",
  },
};

export const Caption: Story = {
  args: {
    variant: "caption",
    children: "Stack",
  },
};

export const Code: Story = {
  args: {
    variant: "code",
    children: "npm run dev",
  },
};

export const AsSpan: Story = {
  name: "as=span override",
  args: {
    variant: "body",
    as: "span",
    children: "Rendered as an inline span instead of a paragraph.",
  },
};

export const DropCap: Story = {
  args: {
    variant: "body",
    dropCap: true,
    children:
      "Every decision in this project reflects a single priority: durability. SQLite instead of Postgres — because a single file is simpler to back up and reason about. React Router instead of Next.js — because the file conventions fit the mental model.",
  },
};
