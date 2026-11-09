import { describe, expect, it } from "vitest";

import { isHoneypotTripped } from "./honeypot.server";

const formDataWith = (entries: Record<string, string>) =>
  Object.entries(entries).reduce((formData, [key, value]) => {
    formData.append(key, value);
    return formData;
  }, new FormData());

describe("isHoneypotTripped", () => {
  it("is false when the field is missing", () => {
    expect(isHoneypotTripped(formDataWith({}), "website")).toBe(false);
  });

  it("is false when the field is empty", () => {
    expect(isHoneypotTripped(formDataWith({ website: "" }), "website")).toBe(
      false,
    );
  });

  it("is true when the field has a value", () => {
    expect(
      isHoneypotTripped(
        formDataWith({ website: "https://spam.example" }),
        "website",
      ),
    ).toBe(true);
  });

  it("is true for whitespace-only values", () => {
    expect(isHoneypotTripped(formDataWith({ website: " " }), "website")).toBe(
      true,
    );
  });

  it("only checks the named field", () => {
    expect(
      isHoneypotTripped(formDataWith({ firstName: "Ada" }), "website"),
    ).toBe(false);
  });
});
