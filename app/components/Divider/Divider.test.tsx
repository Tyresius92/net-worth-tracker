import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { Divider } from "./Divider";

describe("Divider", () => {
  it("renders a separator element", () => {
    render(<Divider />);
    expect(screen.getByRole("separator")).toBeInTheDocument();
  });

  it("applies the default class when no variant is given", () => {
    render(<Divider />);
    expect(screen.getByRole("separator").className).toMatch(/default/);
  });

  it("applies the light class for the light variant", () => {
    render(<Divider variant="light" />);
    expect(screen.getByRole("separator").className).toMatch(/light/);
  });

  it("applies the heavy class for the heavy variant", () => {
    render(<Divider variant="heavy" />);
    expect(screen.getByRole("separator").className).toMatch(/heavy/);
  });
});
