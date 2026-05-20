import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Grid } from "./Grid";

describe("Grid", () => {
  it("renders children", () => {
    render(
      <Grid>
        <span>hello</span>
      </Grid>,
    );
    expect(screen.getByText("hello")).toBeInTheDocument();
  });

  it("applies gap as a CSS custom property", () => {
    render(
      <Grid gap={16}>
        <span>child</span>
      </Grid>,
    );
    const grid = screen.getByText("child").parentElement!;
    expect(grid.style.getPropertyValue("--grid-gap")).toBe("var(--space-16)");
  });

  it("applies rowGap as a CSS custom property", () => {
    render(
      <Grid rowGap={8}>
        <span>child</span>
      </Grid>,
    );
    const grid = screen.getByText("child").parentElement!;
    expect(grid.style.getPropertyValue("--grid-row-gap")).toBe(
      "var(--space-8)",
    );
  });

  it("omits gap custom properties when not set", () => {
    render(
      <Grid>
        <span>child</span>
      </Grid>,
    );
    const grid = screen.getByText("child").parentElement!;
    expect(grid.style.getPropertyValue("--grid-gap")).toBe("");
    expect(grid.style.getPropertyValue("--grid-row-gap")).toBe("");
  });
});

describe("Grid.Item", () => {
  it("renders children", () => {
    render(
      <Grid>
        <Grid.Item>hello</Grid.Item>
      </Grid>,
    );
    expect(screen.getByText("hello")).toBeInTheDocument();
  });

  it("defaults to full width (span 12) at all breakpoints", () => {
    render(
      <Grid>
        <Grid.Item>content</Grid.Item>
      </Grid>,
    );
    const item = screen.getByText("content");
    expect(item.style.getPropertyValue("--gi-span-xs")).toBe("12");
    expect(item.style.getPropertyValue("--gi-span-s")).toBe("12");
    expect(item.style.getPropertyValue("--gi-span-m")).toBe("12");
    expect(item.style.getPropertyValue("--gi-span-l")).toBe("12");
    expect(item.style.getPropertyValue("--gi-span-xl")).toBe("12");
  });

  it("carries a span value upward to larger breakpoints", () => {
    render(
      <Grid>
        <Grid.Item m={6}>content</Grid.Item>
      </Grid>,
    );
    const item = screen.getByText("content");
    expect(item.style.getPropertyValue("--gi-span-xs")).toBe("12");
    expect(item.style.getPropertyValue("--gi-span-s")).toBe("12");
    expect(item.style.getPropertyValue("--gi-span-m")).toBe("6");
    expect(item.style.getPropertyValue("--gi-span-l")).toBe("6");
    expect(item.style.getPropertyValue("--gi-span-xl")).toBe("6");
  });

  it("carries a span value through a gap in the middle", () => {
    render(
      <Grid>
        <Grid.Item s={8} l={4}>
          content
        </Grid.Item>
      </Grid>,
    );
    const item = screen.getByText("content");
    expect(item.style.getPropertyValue("--gi-span-xs")).toBe("12");
    expect(item.style.getPropertyValue("--gi-span-s")).toBe("8");
    expect(item.style.getPropertyValue("--gi-span-m")).toBe("8");
    expect(item.style.getPropertyValue("--gi-span-l")).toBe("4");
    expect(item.style.getPropertyValue("--gi-span-xl")).toBe("4");
  });

  it("defaults to no offset (auto) at all breakpoints", () => {
    render(
      <Grid>
        <Grid.Item>content</Grid.Item>
      </Grid>,
    );
    const item = screen.getByText("content");
    expect(item.style.getPropertyValue("--gi-col-start-xs")).toBe("auto");
    expect(item.style.getPropertyValue("--gi-col-start-s")).toBe("auto");
    expect(item.style.getPropertyValue("--gi-col-start-m")).toBe("auto");
    expect(item.style.getPropertyValue("--gi-col-start-l")).toBe("auto");
    expect(item.style.getPropertyValue("--gi-col-start-xl")).toBe("auto");
  });

  it("converts offset to a 1-indexed column start and carries it upward", () => {
    render(
      <Grid>
        <Grid.Item mOffset={3}>content</Grid.Item>
      </Grid>,
    );
    const item = screen.getByText("content");
    expect(item.style.getPropertyValue("--gi-col-start-xs")).toBe("auto");
    expect(item.style.getPropertyValue("--gi-col-start-s")).toBe("auto");
    expect(item.style.getPropertyValue("--gi-col-start-m")).toBe("4");
    expect(item.style.getPropertyValue("--gi-col-start-l")).toBe("4");
    expect(item.style.getPropertyValue("--gi-col-start-xl")).toBe("4");
  });

  it("resets a carried offset back to auto when set to 0", () => {
    render(
      <Grid>
        <Grid.Item sOffset={3} mOffset={0}>
          content
        </Grid.Item>
      </Grid>,
    );
    const item = screen.getByText("content");
    expect(item.style.getPropertyValue("--gi-col-start-xs")).toBe("auto");
    expect(item.style.getPropertyValue("--gi-col-start-s")).toBe("4");
    expect(item.style.getPropertyValue("--gi-col-start-m")).toBe("auto");
    expect(item.style.getPropertyValue("--gi-col-start-l")).toBe("auto");
    expect(item.style.getPropertyValue("--gi-col-start-xl")).toBe("auto");
  });

  it("defaults order to 0 at all breakpoints", () => {
    render(
      <Grid>
        <Grid.Item>content</Grid.Item>
      </Grid>,
    );
    const item = screen.getByText("content");
    expect(item.style.getPropertyValue("--gi-order-xs")).toBe("0");
    expect(item.style.getPropertyValue("--gi-order-s")).toBe("0");
    expect(item.style.getPropertyValue("--gi-order-m")).toBe("0");
    expect(item.style.getPropertyValue("--gi-order-l")).toBe("0");
    expect(item.style.getPropertyValue("--gi-order-xl")).toBe("0");
  });

  it("carries order upward to larger breakpoints", () => {
    render(
      <Grid>
        <Grid.Item xsOrder={2}>content</Grid.Item>
      </Grid>,
    );
    const item = screen.getByText("content");
    expect(item.style.getPropertyValue("--gi-order-xs")).toBe("2");
    expect(item.style.getPropertyValue("--gi-order-s")).toBe("2");
    expect(item.style.getPropertyValue("--gi-order-m")).toBe("2");
    expect(item.style.getPropertyValue("--gi-order-l")).toBe("2");
    expect(item.style.getPropertyValue("--gi-order-xl")).toBe("2");
  });

  it("overrides order at a specific breakpoint", () => {
    render(
      <Grid>
        <Grid.Item xsOrder={2} mOrder={0}>
          content
        </Grid.Item>
      </Grid>,
    );
    const item = screen.getByText("content");
    expect(item.style.getPropertyValue("--gi-order-xs")).toBe("2");
    expect(item.style.getPropertyValue("--gi-order-s")).toBe("2");
    expect(item.style.getPropertyValue("--gi-order-m")).toBe("0");
    expect(item.style.getPropertyValue("--gi-order-l")).toBe("0");
    expect(item.style.getPropertyValue("--gi-order-xl")).toBe("0");
  });
});
