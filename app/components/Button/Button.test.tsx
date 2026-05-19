import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import { Button } from "./Button";

describe("Button", () => {
  it("renders its children", () => {
    render(<Button>Click me</Button>);
    expect(
      screen.getByRole("button", { name: "Click me" }),
    ).toBeInTheDocument();
  });

  it("defaults to the primary variant", () => {
    render(<Button>Submit</Button>);
    expect(screen.getByRole("button").className).toMatch(/primary/);
  });

  it("applies the secondary variant class", () => {
    render(<Button variant="secondary">Cancel</Button>);
    expect(screen.getByRole("button").className).toMatch(/secondary/);
  });

  it("applies the danger variant class", () => {
    render(<Button variant="danger">Delete</Button>);
    expect(screen.getByRole("button").className).toMatch(/danger/);
  });

  it("is disabled when the disabled prop is set", () => {
    render(<Button disabled>Submit</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("calls onClick when clicked", () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it("forwards the type prop", () => {
    render(<Button type="submit">Submit</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "submit");
  });
});
