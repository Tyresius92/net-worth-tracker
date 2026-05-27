import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { Text } from "./Text";

describe("Text", () => {
  it("renders its children", () => {
    render(<Text variant="body">Hello</Text>);
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  it("applies the deck class for the deck variant", () => {
    render(<Text variant="deck">Standfirst</Text>);
    expect(screen.getByText("Standfirst").className).toMatch(/deck/);
  });

  it("applies the body class for the body variant", () => {
    render(<Text variant="body">Paragraph</Text>);
    expect(screen.getByText("Paragraph").className).toMatch(/body/);
  });

  it("applies the byline class for the byline variant", () => {
    render(<Text variant="byline">By Tyrel Clayton</Text>);
    expect(screen.getByText("By Tyrel Clayton").className).toMatch(/byline/);
  });

  it("applies the caption class for the caption variant", () => {
    render(<Text variant="caption">Stack</Text>);
    expect(screen.getByText("Stack").className).toMatch(/caption/);
  });

  it("applies the code class for the code variant", () => {
    render(<Text variant="code">npm install</Text>);
    expect(screen.getByText("npm install").className).toMatch(/code/);
  });

  it("renders a p element by default for the deck variant", () => {
    render(<Text variant="deck">Standfirst</Text>);
    expect(screen.getByText("Standfirst").tagName).toBe("P");
  });

  it("renders a p element by default for the body variant", () => {
    render(<Text variant="body">Paragraph</Text>);
    expect(screen.getByText("Paragraph").tagName).toBe("P");
  });

  it("renders a p element by default for the byline variant", () => {
    render(<Text variant="byline">By Tyrel Clayton</Text>);
    expect(screen.getByText("By Tyrel Clayton").tagName).toBe("P");
  });

  it("renders a span element by default for the caption variant", () => {
    render(<Text variant="caption">Stack</Text>);
    expect(screen.getByText("Stack").tagName).toBe("SPAN");
  });

  it("renders a code element by default for the code variant", () => {
    render(<Text variant="code">npm install</Text>);
    expect(screen.getByText("npm install").tagName).toBe("CODE");
  });

  it("overrides the rendered element to span via the as prop", () => {
    render(
      <Text variant="body" as="span">
        Inline
      </Text>,
    );
    expect(screen.getByText("Inline").tagName).toBe("SPAN");
  });

  it("overrides the rendered element to p via the as prop", () => {
    render(
      <Text variant="caption" as="p">
        Label
      </Text>,
    );
    expect(screen.getByText("Label").tagName).toBe("P");
  });

  it("applies the dropCap class when dropCap is true", () => {
    render(
      <Text variant="body" dropCap>
        Paragraph
      </Text>,
    );
    expect(screen.getByText("Paragraph").className).toMatch(/dropCap/);
  });

  it("does not apply the dropCap class when dropCap is omitted", () => {
    render(<Text variant="body">Paragraph</Text>);
    expect(screen.getByText("Paragraph").className).not.toMatch(/dropCap/);
  });
});
