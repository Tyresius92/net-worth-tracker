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
});
