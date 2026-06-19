import { describe, it, expect } from "vitest";

import { validateRoleChange } from "./route";

describe("validateRoleChange", () => {
  it("returns error when attempting self-demotion", () => {
    const result = validateRoleChange({
      currentUserId: "user-1",
      targetUserId: "user-1",
      targetCurrentRole: "admin",
      newRole: "customer",
      adminCount: 2,
    });

    expect(result).toEqual({
      valid: false,
      error: "You cannot change your own role.",
    });
  });

  it("returns error when demoting the last admin", () => {
    const result = validateRoleChange({
      currentUserId: "user-1",
      targetUserId: "user-2",
      targetCurrentRole: "admin",
      newRole: "customer",
      adminCount: 1,
    });

    expect(result).toEqual({
      valid: false,
      error: "This is the only administrator and cannot be demoted.",
    });
  });

  it("returns valid when promoting a customer to admin", () => {
    const result = validateRoleChange({
      currentUserId: "user-1",
      targetUserId: "user-2",
      targetCurrentRole: "customer",
      newRole: "admin",
      adminCount: 1,
    });

    expect(result).toEqual({ valid: true });
  });

  it("returns valid when demoting an admin who is not the last admin", () => {
    const result = validateRoleChange({
      currentUserId: "user-1",
      targetUserId: "user-2",
      targetCurrentRole: "admin",
      newRole: "customer",
      adminCount: 2,
    });

    expect(result).toEqual({ valid: true });
  });

  it("returns error for an invalid role value", () => {
    const result = validateRoleChange({
      currentUserId: "user-1",
      targetUserId: "user-2",
      targetCurrentRole: "customer",
      newRole: "superadmin",
      adminCount: 1,
    });

    expect(result).toEqual({ valid: false, error: "Invalid role." });
  });
});
