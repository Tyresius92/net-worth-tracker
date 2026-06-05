import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "../Button/Button";

import { VisuallyHidden } from "./VisuallyHidden";

const meta = {
  component: VisuallyHidden,
  tags: [],
} satisfies Meta<typeof VisuallyHidden>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "This text is visually hidden but accessible to screen readers",
  },
};

export const InContext: Story = {
  args: { children: "Close dialog" },
  render: () => (
    <Button>
      <VisuallyHidden>Close dialog</VisuallyHidden>
      <span aria-hidden="true">✕</span>
    </Button>
  ),
};
