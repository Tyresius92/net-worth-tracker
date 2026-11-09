import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Honeypot } from "./Honeypot";

describe("Honeypot", () => {
  it("renders a labeled text input with the given name", () => {
    render(<Honeypot name="website" />);
    const input = screen.getByLabelText("Leave this field empty");
    expect(input).toHaveAttribute("type", "text");
    expect(input).toHaveAttribute("name", "website");
    expect(input).toHaveValue("");
  });

  it("keeps the input out of the tab order and autofill", () => {
    render(<Honeypot name="website" />);
    const input = screen.getByLabelText("Leave this field empty");
    expect(input).toHaveAttribute("tabindex", "-1");
    expect(input).toHaveAttribute("autocomplete", "off");
  });

  it("hides the field from assistive technology", () => {
    render(<Honeypot name="website" />);
    expect(
      screen.queryByRole("textbox", { name: "Leave this field empty" }),
    ).not.toBeInTheDocument();
  });
});
