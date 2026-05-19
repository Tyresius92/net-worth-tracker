import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

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
  play: async ({ canvas }) => {
    // The span is rendered but visually hidden — the text is still in the DOM
    const span = canvas.getByText(/visually hidden/i);
    await expect(span).toBeInTheDocument();
    // aria-hidden is NOT set — screen readers still see this content
    await expect(span).not.toHaveAttribute("aria-hidden");
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
