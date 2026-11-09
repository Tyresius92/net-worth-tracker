import { describe, expect, it } from "vitest";

import { MAX_NAME_LENGTH, validateName } from "./nameValidation";

describe("validateName", () => {
  it.each(["Tyrel", "Mary-Jane", "O'Brien", "José", "Nguyễn Văn", "J.R."])(
    "accepts %s",
    (name) => {
      expect(validateName(name, "First name")).toEqual({
        success: true,
        data: name,
      });
    },
  );

  it("accepts a name exactly at the max length", () => {
    const name = "a".repeat(MAX_NAME_LENGTH);
    expect(validateName(name, "First name").success).toBe(true);
  });

  it("rejects a name one character over the max length", () => {
    const name = "a".repeat(MAX_NAME_LENGTH + 1);
    expect(validateName(name, "First name")).toEqual({
      success: false,
      error: "First name is too long",
    });
  });

  it.each([null, undefined, 42, "", "   "])(
    "requires a value (%s)",
    (value) => {
      expect(validateName(value, "Last name")).toEqual({
        success: false,
        error: "Last name is required",
      });
    },
  );

  it.each([
    "https://myxa.cc",
    "see http://spam",
    "ftp://files",
    "www.casino",
    "visit meghahpl.com",
    "dragueopr.net/go",
    "https://meghahpl.com/go-bv.php?v44q88",
  ])("rejects link-like content (%s)", (value) => {
    expect(validateName(value, "First name")).toEqual({
      success: false,
      error: "First name can't contain links",
    });
  });

  it("uses the label in the error message", () => {
    expect(validateName("", "Middle name")).toEqual({
      success: false,
      error: "Middle name is required",
    });
  });
});
