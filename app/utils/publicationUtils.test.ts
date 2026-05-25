import { describe, expect, it } from "vitest";

import { getPublicationLabel } from "./publicationUtils";

describe("getPublicationLabel", () => {
  it.each([
    [1, "Vol I · No. I"],
    [2, "Vol I · No. II"],
    [30, "Vol I · No. XXX"],
    [31, "Vol II · No. I"],
    [53, "Vol II · No. XXIII"],
    [60, "Vol II · No. XXX"],
    [90, "Vol III · No. XXX"],
    [299, "Vol X · No. XXIX"],
    [300, "Vol X · No. XXX"],
  ])("input %i => %s", (input, expected) => {
    expect(getPublicationLabel(input)).toBe(expected);
  });
});
