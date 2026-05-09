import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { Divider } from "./Divider";

describe("Divider", () => {
  it("renders a separator element", () => {
    render(<Divider />);
    expect(screen.getByRole("separator")).toBeInTheDocument();
  });

  it("applies the divider CSS module class", () => {
    render(<Divider />);
    expect(screen.getByRole("separator").className).toMatch(/divider/);
  });
});
