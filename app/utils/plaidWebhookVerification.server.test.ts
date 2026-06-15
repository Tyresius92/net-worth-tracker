import { createHash } from "crypto";

import { type JWK, exportJWK, generateKeyPair, SignJWT } from "jose";
import { afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { plaidMock } from "../../mocks/plaid";

import {
  keyCache,
  verifyPlaidWebhook,
} from "./plaidWebhookVerification.server";

const TEST_KID = "test-plaid-key-id";
const BODY = '{"webhook_type":"TRANSACTIONS","item_id":"abc123"}';
const BODY_HASH = createHash("sha256").update(BODY).digest("hex");

describe("verifyPlaidWebhook", () => {
  let signKey!: CryptoKey;
  let wrongSignKey!: CryptoKey;
  let publicJwk!: JWK;

  beforeAll(async () => {
    const { privateKey, publicKey } = await generateKeyPair("ES256");
    const { privateKey: wrongPrivateKey } = await generateKeyPair("ES256");
    signKey = privateKey;
    wrongSignKey = wrongPrivateKey;
    publicJwk = await exportJWK(publicKey);
  });

  beforeEach(() => {
    plaidMock.forVerificationKey(TEST_KID, publicJwk);
  });

  afterEach(() => {
    keyCache.clear();
  });

  const buildToken = async (
    overrides?: { iat?: number; request_body_sha256?: string },
    key?: CryptoKey,
  ) =>
    new SignJWT({
      request_body_sha256: overrides?.request_body_sha256 ?? BODY_HASH,
    })
      .setProtectedHeader({ alg: "ES256", kid: TEST_KID })
      .setIssuedAt(overrides?.iat ?? Math.floor(Date.now() / 1000))
      .sign(key ?? signKey);

  it("returns true for a valid webhook", async () => {
    const token = await buildToken();
    expect(await verifyPlaidWebhook(BODY, token)).toBe(true);
  });

  it("returns false when the JWT signature does not match the verification key", async () => {
    const token = await buildToken({}, wrongSignKey);
    expect(await verifyPlaidWebhook(BODY, token)).toBe(false);
  });

  it("returns false when iat is more than 5 minutes old", async () => {
    const iat = Math.floor(Date.now() / 1000) - 301;
    const token = await buildToken({ iat });
    expect(await verifyPlaidWebhook(BODY, token)).toBe(false);
  });

  it("returns false when the body hash does not match", async () => {
    const token = await buildToken({ request_body_sha256: "wrong-hash" });
    expect(await verifyPlaidWebhook(BODY, token)).toBe(false);
  });

  it("returns false when kid is missing from the JWT header", async () => {
    const token = await new SignJWT({ request_body_sha256: BODY_HASH })
      .setProtectedHeader({ alg: "ES256" })
      .setIssuedAt()
      .sign(signKey);
    expect(await verifyPlaidWebhook(BODY, token)).toBe(false);
  });

  it("returns false for a malformed token", async () => {
    expect(await verifyPlaidWebhook(BODY, "not-a-jwt")).toBe(false);
    expect(await verifyPlaidWebhook(BODY, "")).toBe(false);
  });
});
