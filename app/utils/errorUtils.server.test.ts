import { describe, expect, it } from "vitest";

import { NonErrorThrown, toError } from "./errorUtils.server";

describe("toError", () => {
  it("returns the same Error when given an Error", () => {
    const original = new Error("something broke");
    const result = toError(original);

    expect(result).toBe(original);
  });

  it("returns the same instance for Error subclasses", () => {
    const original = new TypeError("bad type");
    const result = toError(original);

    expect(result).toBe(original);
  });

  it("wraps a string in NonErrorThrown", () => {
    const result = toError("yikes");

    expect(result).toBeInstanceOf(NonErrorThrown);
    expect(result.message).toBe("Non-error thrown: yikes");
    expect(result).toHaveProperty("cause", "yikes");
  });

  it("wraps a number in NonErrorThrown", () => {
    const result = toError(42);

    expect(result).toBeInstanceOf(NonErrorThrown);
    expect(result.message).toBe("Non-error thrown: 42");
    expect(result).toHaveProperty("cause", 42);
  });

  it("wraps null in NonErrorThrown", () => {
    const result = toError(null);

    expect(result).toBeInstanceOf(NonErrorThrown);
    expect(result.message).toBe("Non-error thrown: null");
    expect(result).toHaveProperty("cause", null);
  });

  it("wraps undefined in NonErrorThrown", () => {
    const result = toError(undefined);

    expect(result).toBeInstanceOf(NonErrorThrown);
    expect(result.message).toBe("Non-error thrown: undefined");
    expect(result).toHaveProperty("cause", undefined);
  });

  it("wraps an object in NonErrorThrown", () => {
    const obj = { code: 500 };
    const result = toError(obj);

    expect(result).toBeInstanceOf(NonErrorThrown);
    expect(result.message).toBe("Non-error thrown: [object Object]");
    expect(result).toHaveProperty("cause", obj);
  });
});

describe("NonErrorThrown", () => {
  it("has the correct name", () => {
    const err = new NonErrorThrown("test");

    expect(err.name).toBe("NonErrorThrown");
  });

  it("is an instance of Error", () => {
    const err = new NonErrorThrown("test");

    expect(err).toBeInstanceOf(Error);
  });
});
