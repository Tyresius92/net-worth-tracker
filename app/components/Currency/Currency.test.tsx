import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { Currency } from "./Currency";

describe("Currency", () => {
  it("renders a formatted currency value", () => {
    render(<Currency value={17238800} />);
    expect(screen.getByText("$172,388.00")).toBeInTheDocument();
  });

  it("renders as a span", () => {
    render(<Currency value={17238800} />);
    expect(screen.getByText("$172,388.00").tagName).toBe("SPAN");
  });

  it("applies the currency class", () => {
    render(<Currency value={17238800} />);
    expect(screen.getByText("$172,388.00").className).toMatch(/currency/);
  });

  it("omits cents when includeCents is false", () => {
    render(<Currency value={17238800} includeCents={false} />);
    expect(screen.getByText("$172,388")).toBeInTheDocument();
  });

  it("includes cents by default", () => {
    render(<Currency value={100} />);
    expect(screen.getByText("$1.00")).toBeInTheDocument();
  });

  it("renders negative values", () => {
    render(<Currency value={-50000} />);
    expect(screen.getByText("-$500.00")).toBeInTheDocument();
  });
});
