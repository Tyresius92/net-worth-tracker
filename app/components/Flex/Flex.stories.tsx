import type { Meta, StoryObj } from "@storybook/react-vite";

import { Flex } from "./Flex";

const meta = {
  component: Flex,
  tags: [],
  args: {
    children: (
      <>
        <div style={{ background: "#ccc", padding: "8px" }}>Item A</div>
        <div style={{ background: "#aaa", padding: "8px" }}>Item B</div>
        <div style={{ background: "#888", padding: "8px" }}>Item C</div>
      </>
    ),
  },
} satisfies Meta<typeof Flex>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Row: Story = {
  args: { flexDirection: "row", gap: 8 },
};

export const Column: Story = {
  args: { flexDirection: "column", gap: 8 },
};

export const Centered: Story = {
  args: { justifyContent: "center", alignItems: "center", gap: 8 },
};

export const SpaceBetween: Story = {
  args: { justifyContent: "space-between", p: 16 },
};
