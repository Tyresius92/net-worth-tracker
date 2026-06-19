import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { Box } from "./Box";
import styles from "./Box.module.css";

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

  describe("responsive spacing", () => {
    it("sets a padding custom property from xsPb", () => {
      render(<Box xsPb={16}>content</Box>);
      const style = screen.getByText("content").getAttribute("style") ?? "";
      expect(style).toContain("--box-pb-xs: var(--space-16)");
    });

    it("xsP shorthand sets all four sides", () => {
      render(<Box xsP={12}>content</Box>);
      const style = screen.getByText("content").getAttribute("style") ?? "";
      expect(style).toContain("--box-pt-xs: var(--space-12)");
      expect(style).toContain("--box-pb-xs: var(--space-12)");
      expect(style).toContain("--box-pl-xs: var(--space-12)");
      expect(style).toContain("--box-pr-xs: var(--space-12)");
    });

    it("xsPx shorthand sets left and right only", () => {
      render(<Box xsPx={8}>content</Box>);
      const style = screen.getByText("content").getAttribute("style") ?? "";
      expect(style).toContain("--box-pl-xs: var(--space-8)");
      expect(style).toContain("--box-pr-xs: var(--space-8)");
      expect(style).not.toContain("--box-pt-xs");
      expect(style).not.toContain("--box-pb-xs");
    });

    it("a specific side overrides xsPx", () => {
      render(
        <Box xsPx={8} xsPl={24}>
          content
        </Box>,
      );
      const style = screen.getByText("content").getAttribute("style") ?? "";
      expect(style).toContain("--box-pl-xs: var(--space-24)");
      expect(style).toContain("--box-pr-xs: var(--space-8)");
    });

    it("sets a breakpoint-specific padding property from mPb", () => {
      render(
        <Box xsPb={8} mPb={32}>
          content
        </Box>,
      );
      const style = screen.getByText("content").getAttribute("style") ?? "";
      expect(style).toContain("--box-pb-xs: var(--space-8)");
      expect(style).toContain("--box-pb-m: var(--space-32)");
    });

    it("sets margin custom properties from xsMb", () => {
      render(<Box xsMb={16}>content</Box>);
      const style = screen.getByText("content").getAttribute("style") ?? "";
      expect(style).toContain("--box-mb-xs: var(--space-16)");
    });

    it("xsGap shorthand sets both row-gap and col-gap", () => {
      render(
        <Box display="flex" xsGap={8}>
          content
        </Box>,
      );
      const style = screen.getByText("content").getAttribute("style") ?? "";
      expect(style).toContain("--box-row-gap-xs: var(--space-8)");
      expect(style).toContain("--box-col-gap-xs: var(--space-8)");
    });

    it("xsRowGap overrides xsGap for row-gap only", () => {
      render(
        <Box display="flex" xsGap={8} xsRowGap={16}>
          content
        </Box>,
      );
      const style = screen.getByText("content").getAttribute("style") ?? "";
      expect(style).toContain("--box-row-gap-xs: var(--space-16)");
      expect(style).toContain("--box-col-gap-xs: var(--space-8)");
    });

    it("applies the .box class when spacing props are provided", () => {
      render(<Box xsPb={8}>content</Box>);
      expect(screen.getByText("content")).toHaveClass(styles.box);
    });

    it("does not apply the .box class when no spacing props are provided", () => {
      render(<Box bg="sand-3">content</Box>);
      expect(screen.getByText("content")).not.toHaveClass(styles.box);
    });
  });

  describe("multi-column layout", () => {
    it("sets column count CSS custom properties", () => {
      render(<Box xsColumns={2}>content</Box>);
      const style = screen.getByText("content").getAttribute("style") ?? "";
      expect(style).toContain("--box-col-xs: 2");
    });

    it("cascades column count up through breakpoints by default", () => {
      render(
        <Box xsColumns={1} mColumns={2}>
          content
        </Box>,
      );
      const style = screen.getByText("content").getAttribute("style") ?? "";
      expect(style).toContain("--box-col-xs: 1");
      expect(style).toContain("--box-col-s: 1");
      expect(style).toContain("--box-col-m: 2");
      expect(style).toContain("--box-col-l: 2");
      expect(style).toContain("--box-col-xl: 2");
    });

    it("applies columnRule color as a CSS variable", () => {
      render(
        <Box xsColumns={2} columnRule={{ color: "sand-7" }}>
          content
        </Box>,
      );
      const style = screen.getByText("content").getAttribute("style") ?? "";
      expect(style).toContain("var(--color-sand-7)");
    });

    it("applies columnRule defaults for width and style", () => {
      render(
        <Box xsColumns={2} columnRule={{ color: "sand-7" }}>
          content
        </Box>,
      );
      const style = screen.getByText("content").getAttribute("style") ?? "";
      expect(style).toContain("solid");
    });
  });

  describe("role prop", () => {
    it("passes role attribute to the rendered element", () => {
      render(<Box role="alert">error message</Box>);
      expect(screen.getByRole("alert")).toHaveTextContent("error message");
    });

    it("does not render a role attribute when not provided", () => {
      render(<Box>content</Box>);
      expect(screen.getByText("content")).not.toHaveAttribute("role");
    });
  });

  describe("border props", () => {
    it("applies a border prop to all four sides", () => {
      render(<Box border={{ color: "sand-7" }}>content</Box>);
      const style = screen.getByText("content").getAttribute("style") ?? "";
      expect(style).toContain("var(--color-sand-7)");
    });

    it("borderY overrides border for top and bottom but not left and right", () => {
      render(
        <Box border={{ color: "sand-7" }} borderY={{ color: "sand-3" }}>
          content
        </Box>,
      );
      const style = screen.getByText("content").getAttribute("style") ?? "";
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
      expect(style).toContain(
        "border-color: var(--color-sand-1) var(--color-sand-7) var(--color-sand-3)",
      );
    });

    it("applies border width and style defaults", () => {
      render(<Box border={{ color: "sand-7" }}>content</Box>);
      const style = screen.getByText("content").getAttribute("style") ?? "";
      expect(style).toContain("border-width: 1px");
      expect(style).toContain("border-style: solid");
    });
  });
});
