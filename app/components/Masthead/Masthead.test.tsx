import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Masthead } from "./Masthead";

const renderWithRouter = (ui: React.ReactElement) => {
  const router = createMemoryRouter([{ path: "*", element: ui }]);
  return render(<RouterProvider router={router} />);
};

describe("Masthead", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders the site title", () => {
    renderWithRouter(<Masthead user={null}>content</Masthead>);
    expect(
      screen.getByRole("heading", { name: /the ledger/i }),
    ).toBeInTheDocument();
  });

  it("has an accessible label on the nav element", () => {
    renderWithRouter(<Masthead user={null}>content</Masthead>);
    expect(
      screen.getByRole("navigation", { name: /main/i }),
    ).toBeInTheDocument();
  });

  it("shows the Log Out button when a user is logged in", () => {
    renderWithRouter(
      <Masthead user={{ id: "user-1", twoFactorEnabled: false, role: "customer" }}>
        content
      </Masthead>,
    );
    expect(
      screen.getByRole("button", { name: /log out/i }),
    ).toBeInTheDocument();
  });

  it("shows the Present credentials link when there is no user", () => {
    renderWithRouter(<Masthead user={null}>content</Masthead>);
    expect(
      screen.getByRole("link", { name: /present credentials/i }),
    ).toBeInTheDocument();
  });

  it("does not show the Log Out button when there is no user", () => {
    renderWithRouter(<Masthead user={null}>content</Masthead>);
    expect(
      screen.queryByRole("button", { name: /log out/i }),
    ).not.toBeInTheDocument();
  });

  it("shows the Wire services link when twoFactorEnabled is true", () => {
    renderWithRouter(
      <Masthead user={{ id: "user-1", twoFactorEnabled: true, role: "customer" }}>
        content
      </Masthead>,
    );
    expect(
      screen.getByRole("link", { name: /wire services/i }),
    ).toBeInTheDocument();
  });

  it("does not show the Wire services link when twoFactorEnabled is false", () => {
    renderWithRouter(
      <Masthead user={{ id: "user-1", twoFactorEnabled: false, role: "customer" }}>
        content
      </Masthead>,
    );
    expect(
      screen.queryByRole("link", { name: /wire services/i }),
    ).not.toBeInTheDocument();
  });

  it("renders children", () => {
    renderWithRouter(
      <Masthead user={null}>
        <span>Extra Content</span>
      </Masthead>,
    );
    expect(screen.getByText("Extra Content")).toBeInTheDocument();
  });

  it("shows the admin bar when the user's role is admin", () => {
    renderWithRouter(
      <Masthead user={{ id: "user-1", twoFactorEnabled: false, role: "admin" }}>
        content
      </Masthead>,
    );
    expect(
      screen.getByRole("navigation", { name: /admin/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /users/i })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /contact messages/i }),
    ).toBeInTheDocument();
  });

  it("does not show the admin bar when the user's role is customer", () => {
    renderWithRouter(
      <Masthead user={{ id: "user-1", twoFactorEnabled: false, role: "customer" }}>
        content
      </Masthead>,
    );
    expect(
      screen.queryByRole("navigation", { name: /admin/i }),
    ).not.toBeInTheDocument();
  });

  it("does not show the admin bar when there is no user", () => {
    renderWithRouter(<Masthead user={null}>content</Masthead>);
    expect(
      screen.queryByRole("navigation", { name: /admin/i }),
    ).not.toBeInTheDocument();
  });

  it("renders the formatted current date", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2024, 5, 15, 12, 0, 0)); // June 15, 2024 (Saturday)
    renderWithRouter(<Masthead user={null}>content</Masthead>);
    expect(screen.getByText(/saturday, june 15, 2024/i)).toBeInTheDocument();
  });
});
