import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { VisuallyHidden } from "./VisuallyHidden";

describe("VisuallyHidden", () => {
  it("renders its children in the DOM", () => {
    render(<VisuallyHidden>Screen reader text</VisuallyHidden>);
    expect(screen.getByText("Screen reader text")).toBeInTheDocument();
  });

  it("applies the visually-hidden CSS module class", () => {
    render(<VisuallyHidden>Hidden</VisuallyHidden>);
    expect(screen.getByText("Hidden").className).toMatch(/visually-hidden/);
  });
});
