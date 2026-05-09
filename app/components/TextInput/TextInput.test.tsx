import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, it, expect } from "vitest";

import { TextInput } from "./TextInput";

describe("TextInput", () => {
  it("renders the label associated with the input", () => {
    render(<TextInput label="Email" name="email" type="email" />);
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
  });

  it("forwards the type prop to the input", () => {
    render(<TextInput label="Password" name="password" type="password" />);
    expect(screen.getByLabelText("Password")).toHaveAttribute(
      "type",
      "password",
    );
  });

  it("is disabled when the disabled prop is set", () => {
    render(<TextInput label="Username" name="username" type="text" disabled />);
    expect(screen.getByLabelText("Username")).toBeDisabled();
  });

  it("renders the error message when errorMessage is provided", () => {
    render(
      <TextInput
        label="Email"
        name="email"
        type="email"
        errorMessage="Invalid email"
      />,
    );
    expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
  });

  it("sets aria-invalid when errorMessage is provided", () => {
    render(
      <TextInput
        label="Email"
        name="email"
        type="email"
        errorMessage="Required"
      />,
    );
    expect(screen.getByLabelText("Email")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });

  it("does not set aria-invalid when errorMessage is absent", () => {
    render(<TextInput label="Email" name="email" type="email" />);
    expect(screen.getByLabelText("Email")).not.toHaveAttribute("aria-invalid");
  });

  it("renders hint text when hintText is provided", () => {
    render(
      <TextInput
        label="Email"
        name="email"
        type="email"
        hintText="Enter your work email"
      />,
    );
    expect(screen.getByText(/enter your work email/i)).toBeInTheDocument();
  });

  it("forwards the ref to the input element", () => {
    const ref = createRef<HTMLInputElement>();
    render(<TextInput label="Name" name="name" type="text" ref={ref} />);
    expect(ref.current).toBe(screen.getByLabelText("Name"));
  });
});
