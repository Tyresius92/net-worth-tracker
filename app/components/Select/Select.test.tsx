import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { Select } from "./Select";

const OPTIONS = [
  { value: "cat", label: "Cat" },
  { value: "dog", label: "Dog" },
];

describe("Select", () => {
  it("renders the label associated with the select", () => {
    render(<Select label="Pet" name="pet" options={OPTIONS} />);
    expect(screen.getByLabelText("Pet")).toBeInTheDocument();
  });

  it("renders the placeholder option", () => {
    render(<Select label="Pet" name="pet" options={OPTIONS} />);
    expect(
      screen.getByRole("option", { name: "--Please choose an option--" }),
    ).toBeInTheDocument();
  });

  it("renders all provided options", () => {
    render(<Select label="Pet" name="pet" options={OPTIONS} />);
    expect(screen.getByRole("option", { name: "Cat" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Dog" })).toBeInTheDocument();
  });

  it("is disabled when the disabled prop is set", () => {
    render(<Select label="Pet" name="pet" options={OPTIONS} disabled />);
    expect(screen.getByRole("combobox")).toBeDisabled();
  });

  it("renders the error message when errorMessage is provided", () => {
    render(
      <Select
        label="Pet"
        name="pet"
        options={OPTIONS}
        errorMessage="Please select a pet"
      />,
    );
    expect(screen.getByText(/please select a pet/i)).toBeInTheDocument();
  });

  it("sets aria-invalid when errorMessage is provided", () => {
    render(
      <Select label="Pet" name="pet" options={OPTIONS} errorMessage="Required" />,
    );
    expect(screen.getByRole("combobox")).toHaveAttribute("aria-invalid", "true");
  });

  it("does not set aria-invalid when errorMessage is absent", () => {
    render(<Select label="Pet" name="pet" options={OPTIONS} />);
    expect(screen.getByRole("combobox")).not.toHaveAttribute("aria-invalid");
  });
});
