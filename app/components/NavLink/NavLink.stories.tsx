import type { Meta, StoryObj } from "@storybook/react-vite";
import { MemoryRouter, Route, Routes } from "react-router";

import { NavLink } from "./NavLink";

const meta = {
  component: NavLink,
  tags: [],
} satisfies Meta<typeof NavLink>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Navigation: Story = {
  args: { to: "/dashboard" },
  render: () => (
    <MemoryRouter initialEntries={["/dashboard"]}>
      <nav
        style={{
          display: "flex",
        }}
      >
        <NavLink to="/dashboard">Dashboard</NavLink>
        <NavLink to="/accounts">Accounts</NavLink>
        <NavLink to="/settings">Settings</NavLink>
      </nav>
      <Routes>
        <Route path="/dashboard" element={<p>Dashboard page</p>} />
        <Route path="/accounts" element={<p>Accounts page</p>} />
        <Route path="/settings" element={<p>Settings page</p>} />
      </Routes>
    </MemoryRouter>
  ),
};
