import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { Flex } from "./Flex";

describe("Flex", () => {
  it("renders its children", () => {
    render(<Flex>Hello</Flex>);
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  it("always applies display: flex", () => {
    render(<Flex>content</Flex>);
    expect(screen.getByText("content")).toHaveStyle({ display: "flex" });
  });

  it("applies flexDirection", () => {
    render(<Flex flexDirection="column">content</Flex>);
    expect(screen.getByText("content")).toHaveStyle({
      flexDirection: "column",
    });
  });

  it("applies justifyContent", () => {
    render(<Flex justifyContent="space-between">content</Flex>);
    expect(screen.getByText("content")).toHaveStyle({
      justifyContent: "space-between",
    });
  });

  it("applies flexGrow", () => {
    render(<Flex flexGrow={1}>content</Flex>);
    expect(screen.getByText("content")).toHaveStyle({ flexGrow: "1" });
  });

  it("applies alignItems", () => {
    render(<Flex alignItems="center">content</Flex>);
    expect(screen.getByText("content")).toHaveStyle({ alignItems: "center" });
  });
});
