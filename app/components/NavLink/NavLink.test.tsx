import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { describe, it, expect } from "vitest";

import { NavLink } from "./NavLink";

const renderWithRouter = (ui: React.ReactElement, { route = "/" } = {}) => {
  const router = createMemoryRouter([{ path: "*", element: ui }], {
    initialEntries: [route],
  });
  return render(<RouterProvider router={router} />);
};

describe("NavLink", () => {
  it("renders children", () => {
    renderWithRouter(<NavLink to="/accounts">Accounts</NavLink>);
    expect(screen.getByRole("link", { name: "Accounts" })).toBeInTheDocument();
  });

  it("renders with the correct href", () => {
    renderWithRouter(<NavLink to="/accounts">Accounts</NavLink>);
    expect(screen.getByRole("link", { name: "Accounts" })).toHaveAttribute(
      "href",
      "/accounts",
    );
  });

  it("applies aria-current when the link matches the current route", () => {
    renderWithRouter(<NavLink to="/accounts">Accounts</NavLink>, {
      route: "/accounts",
    });
    expect(screen.getByRole("link", { name: "Accounts" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("does not apply aria-current when the link does not match the current route", () => {
    renderWithRouter(<NavLink to="/accounts">Accounts</NavLink>, { route: "/" });
    expect(screen.getByRole("link", { name: "Accounts" })).not.toHaveAttribute(
      "aria-current",
    );
  });
});
