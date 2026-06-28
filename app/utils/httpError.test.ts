import { describe, expect, it } from "vitest";

import { HttpError } from "./httpError";

describe("HttpError", () => {
  it("is an instance of Error", () => {
    const error = new HttpError("Not Found", 404);
    expect(error).toBeInstanceOf(Error);
  });

  it("has the correct status and message", () => {
    const error = new HttpError("Invalid request", 400);
    expect(error.status).toBe(400);
    expect(error.message).toBe("Invalid request");
    expect(error.name).toBe("HttpError");
  });
});
