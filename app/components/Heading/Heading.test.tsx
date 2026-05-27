import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { Heading } from "./Heading";

describe("Heading", () => {
  it("renders its children", () => {
    render(<Heading level={1}>Your net worth</Heading>);
    expect(
      screen.getByRole("heading", { name: "Your net worth" }),
    ).toBeInTheDocument();
  });

  it("renders an h1 for level 1", () => {
    render(<Heading level={1}>Title</Heading>);
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  });

  it("renders an h2 for level 2", () => {
    render(<Heading level={2}>Section</Heading>);
    expect(screen.getByRole("heading", { level: 2 })).toBeInTheDocument();
  });

  it("renders an h3 for level 3", () => {
    render(<Heading level={3}>Subsection</Heading>);
    expect(screen.getByRole("heading", { level: 3 })).toBeInTheDocument();
  });

  it("applies the base class", () => {
    render(<Heading level={2}>Section</Heading>);
    expect(screen.getByRole("heading", { level: 2 }).className).toMatch(/base/);
  });

  it("applies the level1 class for level 1", () => {
    render(<Heading level={1}>Title</Heading>);
    expect(screen.getByRole("heading", { level: 1 }).className).toMatch(
      /level1/,
    );
  });

  it("applies the level2 class for level 2", () => {
    render(<Heading level={2}>Section</Heading>);
    expect(screen.getByRole("heading", { level: 2 }).className).toMatch(
      /level2/,
    );
  });

  it("applies the level3 class for level 3", () => {
    render(<Heading level={3}>Subsection</Heading>);
    expect(screen.getByRole("heading", { level: 3 }).className).toMatch(
      /level3/,
    );
  });

  it("applies a font-size token as an inline style when fontSize is given", () => {
    render(
      <Heading level={1} fontSize={88}>
        Title
      </Heading>,
    );
    const style =
      screen.getByRole("heading", { level: 1 }).getAttribute("style") ?? "";
    expect(style).toContain("var(--font-size-88)");
  });

  it("does not apply an inline style when fontSize is omitted", () => {
    render(<Heading level={1}>Title</Heading>);
    expect(screen.getByRole("heading", { level: 1 })).not.toHaveAttribute(
      "style",
    );
  });
});
