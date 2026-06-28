import { describe, it, expect } from "vitest";

import { UserFactory } from "~/factories/userFactory";

import {
  generateRecoveryCodes,
  consumeRecoveryCode,
  getRecoveryCodeCount,
} from "./recovery-code.server";

describe("generateRecoveryCodes", () => {
  it("returns 10 codes", async () => {
    const user = await UserFactory.create();
    const codes = await generateRecoveryCodes(user.id);
    expect(codes).toHaveLength(10);
  });

  it("returns codes in XXXX-XXXX-XXXX format", async () => {
    const user = await UserFactory.create();
    const codes = await generateRecoveryCodes(user.id);
    for (const code of codes) {
      expect(code).toMatch(/^[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}$/);
    }
  });

  it("returns unique codes", async () => {
    const user = await UserFactory.create();
    const codes = await generateRecoveryCodes(user.id);
    const unique = new Set(codes);
    expect(unique.size).toBe(10);
  });

  it("replaces existing codes on regeneration", async () => {
    const user = await UserFactory.create();
    await generateRecoveryCodes(user.id);
    await generateRecoveryCodes(user.id);
    expect(await getRecoveryCodeCount(user.id)).toBe(10);
  }, 10000);
});

describe("consumeRecoveryCode", () => {
  it("returns true for a valid unused code", async () => {
    const user = await UserFactory.create();
    const [code] = await generateRecoveryCodes(user.id);
    expect(await consumeRecoveryCode(user.id, code!)).toBe(true);
  });

  it("returns false for an unknown code", async () => {
    const user = await UserFactory.create();
    await generateRecoveryCodes(user.id);
    expect(await consumeRecoveryCode(user.id, "0000-0000-0000")).toBe(false);
  });

  it("returns false when a code is used a second time", async () => {
    const user = await UserFactory.create();
    const [code] = await generateRecoveryCodes(user.id);
    await consumeRecoveryCode(user.id, code!);
    expect(await consumeRecoveryCode(user.id, code!)).toBe(false);
  });

  it("accepts codes regardless of dash or case formatting", async () => {
    const user = await UserFactory.create();
    const [code] = await generateRecoveryCodes(user.id);
    const withoutDashes = code!.replace(/-/g, "");
    expect(await consumeRecoveryCode(user.id, withoutDashes)).toBe(true);
  });

  it("does not consume a second code when one already matched", async () => {
    const user = await UserFactory.create();
    const [first, second] = await generateRecoveryCodes(user.id);
    await consumeRecoveryCode(user.id, first!);
    expect(await consumeRecoveryCode(user.id, second!)).toBe(true);
  });
});

describe("getRecoveryCodeCount", () => {
  it("returns 10 after initial generation", async () => {
    const user = await UserFactory.create();
    await generateRecoveryCodes(user.id);
    expect(await getRecoveryCodeCount(user.id)).toBe(10);
  });

  it("decrements by 1 after consuming a code", async () => {
    const user = await UserFactory.create();
    const [code] = await generateRecoveryCodes(user.id);
    await consumeRecoveryCode(user.id, code!);
    expect(await getRecoveryCodeCount(user.id)).toBe(9);
  });

  it("returns 0 when no codes have been generated", async () => {
    const user = await UserFactory.create();
    expect(await getRecoveryCodeCount(user.id)).toBe(0);
  });
});
