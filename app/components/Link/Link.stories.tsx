import type { Meta, StoryObj } from "@storybook/react-vite";
import { MemoryRouter, Route, Routes } from "react-router";

import { Link } from "./Link";

const meta = {
  component: Link,
  tags: [],
} satisfies Meta<typeof Link>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Internal: Story = {
  args: { to: "/accounts" },
  render: () => (
    <MemoryRouter initialEntries={["/dashboard"]}>
      <p>
        To see your balances, <Link to="/accounts">view your accounts</Link>.
      </p>
      <Routes>
        <Route path="/dashboard" element={null} />
        <Route path="/accounts" element={<p>Accounts page</p>} />
      </Routes>
    </MemoryRouter>
  ),
};

export const External: Story = {
  args: { href: new URL("https://example.com"), children: "Visit example.com" },
};

export const ExternalNewTab: Story = {
  args: {
    href: new URL("https://example.com"),
    children: "Open in new tab",
    newTab: true,
  },
};
