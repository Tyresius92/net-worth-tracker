import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { describe, it, expect } from "vitest";

import { Link } from "./Link";

const renderWithRouter = (ui: React.ReactElement) => {
  const router = createMemoryRouter([{ path: "*", element: ui }]);
  return render(<RouterProvider router={router} />);
};

describe("Link", () => {
  describe("external link", () => {
    it("renders children", () => {
      renderWithRouter(
        <Link href={new URL("https://example.com")}>Visit us</Link>,
      );
      expect(
        screen.getByRole("link", { name: "Visit us" }),
      ).toBeInTheDocument();
    });

    it("renders with the correct href", () => {
      renderWithRouter(
        <Link href={new URL("https://example.com")}>Visit us</Link>,
      );
      expect(screen.getByRole("link", { name: "Visit us" })).toHaveAttribute(
        "href",
        "https://example.com",
      );
    });

    it("forwards target and rel props", () => {
      renderWithRouter(
        <Link href={new URL("https://example.com")} newTab>
          Visit us
        </Link>,
      );
      const link = screen.getByRole("link", { name: "Visit us" });
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noreferrer");
    });

    it("applies the link CSS module class", () => {
      renderWithRouter(
        <Link href={new URL("https://example.com")}>Visit us</Link>,
      );
      expect(screen.getByRole("link", { name: "Visit us" }).className).toMatch(
        /link/,
      );
    });
  });

  describe("internal link", () => {
    it("renders children", () => {
      renderWithRouter(<Link to="/about">About</Link>);
      expect(screen.getByRole("link", { name: "About" })).toBeInTheDocument();
    });

    it("renders with the correct href", () => {
      renderWithRouter(<Link to="/about">About</Link>);
      expect(screen.getByRole("link", { name: "About" })).toHaveAttribute(
        "href",
        "/about",
      );
    });

    it("applies the link CSS module class", () => {
      renderWithRouter(<Link to="/about">About</Link>);
      expect(screen.getByRole("link", { name: "About" }).className).toMatch(
        /link/,
      );
    });
  });
});
