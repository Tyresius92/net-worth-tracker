import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { FileUpload } from "./FileUpload";

describe("FileUpload", () => {
  it("renders the label associated with the input", () => {
    render(<FileUpload label="Upload figures" name="import_file" />);
    expect(screen.getByLabelText("Upload figures")).toBeInTheDocument();
  });

  it("renders a file input", () => {
    render(<FileUpload label="Upload figures" name="import_file" />);
    expect(screen.getByLabelText("Upload figures")).toHaveAttribute(
      "type",
      "file",
    );
  });

  it("joins the accept array as dot-prefixed comma-separated extensions", () => {
    render(
      <FileUpload label="Upload figures" name="import_file" accept={["csv"]} />,
    );
    expect(screen.getByLabelText("Upload figures")).toHaveAttribute(
      "accept",
      ".csv",
    );
  });

  it("joins multiple accept values correctly", () => {
    render(
      <FileUpload
        label="Upload figures"
        name="import_file"
        accept={["csv", "xlsx"]}
      />,
    );
    expect(screen.getByLabelText("Upload figures")).toHaveAttribute(
      "accept",
      ".csv,.xlsx",
    );
  });

  it("expands jpg to both .jpg and .jpeg extensions", () => {
    render(
      <FileUpload label="Upload figures" name="import_file" accept={["jpg"]} />,
    );
    expect(screen.getByLabelText("Upload figures")).toHaveAttribute(
      "accept",
      ".jpg,.jpeg",
    );
  });

  it("does not set accept when the prop is omitted", () => {
    render(<FileUpload label="Upload figures" name="import_file" />);
    expect(screen.getByLabelText("Upload figures")).not.toHaveAttribute(
      "accept",
    );
  });

  it("sets the multiple attribute when multiple is true", () => {
    render(
      <FileUpload label="Upload figures" name="import_file" multiple />,
    );
    expect(screen.getByLabelText("Upload figures")).toHaveAttribute("multiple");
  });

  it("is disabled when the disabled prop is set", () => {
    render(
      <FileUpload label="Upload figures" name="import_file" disabled />,
    );
    expect(screen.getByLabelText("Upload figures")).toBeDisabled();
  });

  it("renders hint text when hintText is provided", () => {
    render(
      <FileUpload
        label="Upload figures"
        name="import_file"
        hintText="CSV files only."
      />,
    );
    expect(screen.getByText(/csv files only/i)).toBeInTheDocument();
  });

  it("renders the error message when errorMessage is provided", () => {
    render(
      <FileUpload
        label="Upload figures"
        name="import_file"
        errorMessage="File must be a CSV."
      />,
    );
    expect(screen.getByText(/file must be a csv/i)).toBeInTheDocument();
  });

  it("sets aria-invalid when errorMessage is provided", () => {
    render(
      <FileUpload
        label="Upload figures"
        name="import_file"
        errorMessage="File must be a CSV."
      />,
    );
    expect(screen.getByLabelText("Upload figures")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });

  it("does not set aria-invalid when errorMessage is absent", () => {
    render(<FileUpload label="Upload figures" name="import_file" />);
    expect(screen.getByLabelText("Upload figures")).not.toHaveAttribute(
      "aria-invalid",
    );
  });

  it("shows both hint and error when both are provided", () => {
    render(
      <FileUpload
        label="Upload figures"
        name="import_file"
        hintText="CSV files only."
        errorMessage="File must be a CSV."
      />,
    );
    expect(screen.getByText(/csv files only/i)).toBeInTheDocument();
    expect(screen.getByText(/file must be a csv/i)).toBeInTheDocument();
  });
});
