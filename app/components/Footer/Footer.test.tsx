import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Footer } from "./Footer";

const renderWithRouter = (ui: React.ReactElement) => {
  const router = createMemoryRouter([{ path: "*", element: ui }]);
  return render(<RouterProvider router={router} />);
};

describe("Footer", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("displays the current year in the copyright notice", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2030, 5, 15, 12, 0, 0));
    renderWithRouter(<Footer user={null} />);
    expect(screen.getByText(/2030 Tyrel Clayton/)).toBeInTheDocument();
  });

  it("shows the GitHub source link when there is no user", () => {
    renderWithRouter(<Footer user={null} />);
    expect(
      screen.getByRole("link", { name: /view source on github/i }),
    ).toBeInTheDocument();
  });

  it("hides the GitHub source link when a user is logged in", () => {
    renderWithRouter(<Footer user={{ id: "user-1" }} />);
    expect(
      screen.queryByRole("link", { name: /view source on github/i }),
    ).not.toBeInTheDocument();
  });

  it("always shows the Privacy policy link", () => {
    renderWithRouter(<Footer user={null} />);
    expect(screen.getByRole("link", { name: /privacy policy/i })).toBeInTheDocument();
  });

  it("always shows the Contact link", () => {
    renderWithRouter(<Footer user={null} />);
    expect(screen.getByRole("link", { name: /contact/i })).toBeInTheDocument();
  });
});
