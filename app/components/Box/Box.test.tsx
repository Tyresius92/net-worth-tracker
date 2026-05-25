import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { Box } from "./Box";

describe("Box", () => {
  it("renders its children", () => {
    render(<Box>Hello</Box>);
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  it("applies maxWidth as a px value", () => {
    render(<Box maxWidth={600}>content</Box>);
    expect(screen.getByText("content")).toHaveStyle({ maxWidth: "600px" });
  });

  it("applies textAlign as a style", () => {
    render(<Box textAlign="center">content</Box>);
    expect(screen.getByText("content")).toHaveStyle({ textAlign: "center" });
  });

  it("applies hyphens as a style", () => {
    render(<Box hyphens="auto">content</Box>);
    expect(screen.getByText("content")).toHaveStyle({ hyphens: "auto" });
  });

  describe("multi-column layout", () => {
    it("applies columnCount as a style", () => {
      render(<Box columnCount={2}>content</Box>);
      expect(screen.getByText("content")).toHaveStyle({ columnCount: "2" });
    });

    it("applies columnRule color as a CSS variable", () => {
      render(
        <Box columnCount={2} columnRule={{ color: "sand-7" }}>
          content
        </Box>,
      );
      expect(screen.getByText("content").getAttribute("style")).toContain(
        "var(--color-sand-7)",
      );
    });

    it("applies columnRule defaults for width and style", () => {
      render(
        <Box columnCount={2} columnRule={{ color: "sand-7" }}>
          content
        </Box>,
      );
      const style = screen.getByText("content").getAttribute("style") ?? "";
      expect(style).toContain("solid");
    });
  });

  describe("border props", () => {
    it("applies a border prop to all four sides", () => {
      render(<Box border={{ color: "sand-7" }}>content</Box>);
      const style = screen.getByText("content").getAttribute("style") ?? "";
      // jsdom collapses identical four-side values into shorthand
      expect(style).toContain("var(--color-sand-7)");
    });

    it("borderY overrides border for top and bottom but not left and right", () => {
      render(
        <Box border={{ color: "sand-7" }} borderY={{ color: "sand-3" }}>
          content
        </Box>,
      );
      const style = screen.getByText("content").getAttribute("style") ?? "";
      // jsdom collapses to 2-value shorthand: "top/bottom right/left"
      expect(style).toContain(
        "border-color: var(--color-sand-3) var(--color-sand-7)",
      );
    });

    it("a specific side overrides borderY", () => {
      render(
        <Box
          border={{ color: "sand-7" }}
          borderY={{ color: "sand-3" }}
          borderTop={{ color: "sand-1" }}
        >
          content
        </Box>,
      );
      const style = screen.getByText("content").getAttribute("style") ?? "";
      // jsdom collapses to 3-value shorthand: "top right/left bottom"
      expect(style).toContain(
        "border-color: var(--color-sand-1) var(--color-sand-7) var(--color-sand-3)",
      );
    });

    it("applies border width and style defaults", () => {
      render(<Box border={{ color: "sand-7" }}>content</Box>);
      const style = screen.getByText("content").getAttribute("style") ?? "";
      // jsdom collapses identical four-side values into shorthand
      expect(style).toContain("border-width: 1px");
      expect(style).toContain("border-style: solid");
    });
  });
});
