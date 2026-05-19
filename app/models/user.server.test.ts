import { faker } from "@faker-js/faker";
import { describe, it, expect } from "vitest";

import { prisma } from "~/db.server";
import { AccountFactory } from "~/factories/accountFactory";
import { BalanceSnapshotFactory } from "~/factories/balanceSnapshotFactory";
import { PlaidItemFactory } from "~/factories/plaidItemFactory";
import { UserFactory } from "~/factories/userFactory";

import {
  getUserById,
  getUserByEmail,
  createUser,
  deleteUserByEmail,
  deleteUserById,
  verifyLogin,
  getLatestBalancesAsOfDate,
} from "./user.server";

describe("getUserById", () => {
  it("returns the user when the id exists", async () => {
    const created = await UserFactory.create();
    const result = await getUserById(created.id);
    expect(result?.id).toBe(created.id);
    expect(result?.email).toBe(created.email);
  });

  it("returns null when the id does not exist", async () => {
    expect(await getUserById("does-not-exist")).toBeNull();
  });
});

describe("getUserByEmail", () => {
  it("returns the user when the email exists", async () => {
    const created = await UserFactory.create();
    const result = await getUserByEmail(created.email);
    expect(result?.id).toBe(created.id);
  });

  it("returns null when the email does not exist", async () => {
    expect(await getUserByEmail("nobody@example.com")).toBeNull();
  });
});

describe("createUser", () => {
  it("creates a user with the given fields", async () => {
    const email = faker.internet.email();
    const user = await createUser({
      email,
      password: "password123",
      firstName: "Jane",
      lastName: "Doe",
    });

    expect(user.email).toBe(email);
    expect(user.firstName).toBe("Jane");
    expect(user.lastName).toBe("Doe");
  });

  it("stores the password as a hash, not plaintext", async () => {
    const email = faker.internet.email();
    await createUser({
      email,
      password: "secret123",
      firstName: "A",
      lastName: "B",
    });

    // A correct password should authenticate; the plaintext string should not
    // act as its own hash (bcrypt hashes are 60-char strings starting with "$2")
    expect(await verifyLogin(email, "secret123")).not.toBeNull();
    expect(await verifyLogin(email, "wrong-password")).toBeNull();
  });
});

describe("deleteUserByEmail", () => {
  it("removes the user from the database", async () => {
    const created = await UserFactory.create();
    await deleteUserByEmail(created.email);
    expect(await getUserByEmail(created.email)).toBeNull();
  });
});

describe("deleteUserById", () => {
  it("removes the user from the database", async () => {
    const created = await UserFactory.create();
    await deleteUserById(created.id);
    expect(await getUserById(created.id)).toBeNull();
  });

  it("cascades to delete accounts", async () => {
    const user = await UserFactory.createForConnect();
    const account = await AccountFactory.create({ user: { connect: user } });
    await deleteUserById(user.id);
    expect(
      await prisma.account.findUnique({ where: { id: account.id } }),
    ).toBeNull();
  });

  it("cascades to delete balance snapshots", async () => {
    const user = await UserFactory.createForConnect();
    const account = await AccountFactory.create({ user: { connect: user } });
    const snapshot = await BalanceSnapshotFactory.create({
      account: { connect: { id: account.id } },
    });
    await deleteUserById(user.id);
    expect(
      await prisma.balanceSnapshot.findUnique({ where: { id: snapshot.id } }),
    ).toBeNull();
  });

  it("cascades to delete plaid items", async () => {
    const user = await UserFactory.createForConnect();
    const plaidItem = await PlaidItemFactory.create({
      user: { connect: user },
    });
    await deleteUserById(user.id);
    expect(
      await prisma.plaidItem.findUnique({ where: { id: plaidItem.id } }),
    ).toBeNull();
  });
});

describe("verifyLogin", () => {
  it("returns the user without the password relation for correct credentials", async () => {
    const email = faker.internet.email();
    await createUser({
      email,
      password: "correct-pass",
      firstName: "A",
      lastName: "B",
    });

    const result = await verifyLogin(email, "correct-pass");

    expect(result).not.toBeNull();
    expect(result?.email).toBe(email);
    // @ts-expect-error we are explicitly testing that this is actually not set
    expect(result?.password).toBeUndefined();
  });

  it("returns null for an incorrect password", async () => {
    const email = faker.internet.email();
    await createUser({
      email,
      password: "correct-pass",
      firstName: "A",
      lastName: "B",
    });

    expect(await verifyLogin(email, "wrong-pass")).toBeNull();
  });

  it("returns null when the email does not exist", async () => {
    expect(await verifyLogin("ghost@example.com", "anypassword")).toBeNull();
  });
});

describe("getLatestBalancesAsOfDate", () => {
  it("returns the most recent snapshot on or before the cutoff date", async () => {
    const user = await UserFactory.createForConnect();
    const account = await AccountFactory.create({ user: { connect: user } });

    await BalanceSnapshotFactory.create({
      account: { connect: { id: account.id } },
      amount: 10_000,
      dateTime: new Date("2024-01-01"),
    });
    await BalanceSnapshotFactory.create({
      account: { connect: { id: account.id } },
      amount: 20_000,
      dateTime: new Date("2024-06-01"),
    });

    const result = await getLatestBalancesAsOfDate(
      user.id,
      new Date("2024-09-01"),
    );
    const snapshots = result.accounts.find(
      (a) => a.id === account.id,
    )?.balanceSnapshots;

    expect(snapshots).toHaveLength(1);
    expect(snapshots![0].amount).toBe(20_000);
  });

  it("excludes snapshots dated after the cutoff", async () => {
    const user = await UserFactory.createForConnect();
    const account = await AccountFactory.create({ user: { connect: user } });

    await BalanceSnapshotFactory.create({
      account: { connect: { id: account.id } },
      amount: 10_000,
      dateTime: new Date("2024-01-01"),
    });
    await BalanceSnapshotFactory.create({
      account: { connect: { id: account.id } },
      amount: 50_000,
      dateTime: new Date("2024-12-01"),
    });

    const result = await getLatestBalancesAsOfDate(
      user.id,
      new Date("2024-06-01"),
    );
    const snapshots = result.accounts.find(
      (a) => a.id === account.id,
    )?.balanceSnapshots;

    expect(snapshots).toHaveLength(1);
    expect(snapshots![0].amount).toBe(10_000);
  });

  it("returns an empty snapshot array when no snapshots exist before the cutoff", async () => {
    const user = await UserFactory.createForConnect();
    const account = await AccountFactory.create({ user: { connect: user } });

    await BalanceSnapshotFactory.create({
      account: { connect: { id: account.id } },
      dateTime: new Date("2024-06-01"),
    });

    const result = await getLatestBalancesAsOfDate(
      user.id,
      new Date("2023-01-01"),
    );
    const snapshots = result.accounts.find(
      (a) => a.id === account.id,
    )?.balanceSnapshots;

    expect(snapshots).toHaveLength(0);
  });

  it("excludes closed accounts", async () => {
    const user = await UserFactory.createForConnect();
    const open = await AccountFactory.create({ user: { connect: user } });
    const closed = await AccountFactory.create({
      user: { connect: user },
      closedAt: new Date("2024-01-01"),
    });

    await BalanceSnapshotFactory.create({
      account: { connect: { id: open.id } },
      dateTime: new Date("2024-06-01"),
    });
    await BalanceSnapshotFactory.create({
      account: { connect: { id: closed.id } },
      dateTime: new Date("2024-06-01"),
    });

    const result = await getLatestBalancesAsOfDate(
      user.id,
      new Date("2024-12-01"),
    );

    expect(result.accounts.find((a) => a.id === open.id)).toBeDefined();
    expect(result.accounts.find((a) => a.id === closed.id)).toBeUndefined();
  });
});
