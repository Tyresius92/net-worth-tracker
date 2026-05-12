import { describe, it, expect, vi } from "vitest";

import { UserFactory } from "~/factories/userFactory";

import {
  createPasswordResetToken,
  verifyPasswordResetToken,
  consumePasswordResetToken,
} from "./password-reset.server";
import { verifyLogin } from "./user.server";

describe("createPasswordResetToken", () => {
  it("returns a non-empty token string", async () => {
    const user = await UserFactory.create();
    const token = await createPasswordResetToken(user.id);
    expect(typeof token).toBe("string");
    expect(token.length).toBeGreaterThan(0);
  });

  it("returns different tokens on successive calls", async () => {
    const user = await UserFactory.create();
    const a = await createPasswordResetToken(user.id);
    const b = await createPasswordResetToken(user.id);
    expect(a).not.toBe(b);
  });

  it("invalidates the previous token when a new one is created", async () => {
    const user = await UserFactory.create();
    const first = await createPasswordResetToken(user.id);
    await createPasswordResetToken(user.id);
    expect(await verifyPasswordResetToken(first)).toBeNull();
  });
});

describe("verifyPasswordResetToken", () => {
  it("returns the record for a valid token", async () => {
    const user = await UserFactory.create();
    const token = await createPasswordResetToken(user.id);
    const result = await verifyPasswordResetToken(token);
    expect(result).not.toBeNull();
    expect(result?.user.id).toBe(user.id);
    expect(result?.user.email).toBe(user.email);
  });

  it("returns null for an unknown token", async () => {
    expect(await verifyPasswordResetToken("not-a-real-token")).toBeNull();
  });

  it("returns null for an expired token", async () => {
    vi.useFakeTimers();

    const user = await UserFactory.create();
    const token = await createPasswordResetToken(user.id);

    vi.advanceTimersByTime(60 * 60 * 1000 + 1);

    expect(await verifyPasswordResetToken(token)).toBeNull();

    vi.useRealTimers();
  });

  it("returns null for an already-used token", async () => {
    const user = await UserFactory.create();
    const token = await createPasswordResetToken(user.id);
    const record = await verifyPasswordResetToken(token);

    await consumePasswordResetToken(record!.id, user.id, "new-password-123");

    expect(await verifyPasswordResetToken(token)).toBeNull();
  });
});

describe("consumePasswordResetToken", () => {
  it("marks the token as used", async () => {
    const user = await UserFactory.create();
    const token = await createPasswordResetToken(user.id);
    const record = await verifyPasswordResetToken(token);

    await consumePasswordResetToken(record!.id, user.id, "new-password-123");

    expect(await verifyPasswordResetToken(token)).toBeNull();
  });

  it("updates the user's password", async () => {
    const user = await UserFactory.create();
    const token = await createPasswordResetToken(user.id);
    const record = await verifyPasswordResetToken(token);

    await consumePasswordResetToken(record!.id, user.id, "brand-new-password");

    expect(await verifyLogin(user.email, "brand-new-password")).not.toBeNull();
  });

  it("does not allow the old password after reset", async () => {
    const user = await UserFactory.create();
    const token = await createPasswordResetToken(user.id);
    const record = await verifyPasswordResetToken(token);

    await consumePasswordResetToken(record!.id, user.id, "brand-new-password");

    expect(await verifyLogin(user.email, "old-password")).toBeNull();
  });
});
