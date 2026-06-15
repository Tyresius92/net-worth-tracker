import { createHash } from "crypto";

import { importJWK, jwtVerify } from "jose";

import { plaidClient } from "~/plaid";

type JoseKey = Awaited<ReturnType<typeof importJWK>>;

export const keyCache = new Map<string, JoseKey>();

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const getVerificationKey = async (kid: string): Promise<JoseKey> => {
  const cached = keyCache.get(kid);
  if (cached) {
    return cached;
  }

  const { data } = await plaidClient.webhookVerificationKeyGet({ key_id: kid });
  const jwk: Record<string, unknown> = Object.fromEntries(
    Object.entries(data.key),
  );
  const key = await importJWK(jwk);
  keyCache.set(kid, key);
  return key;
};

export const verifyPlaidWebhook = async (
  rawBody: string,
  token: string,
): Promise<boolean> => {
  try {
    const [headerB64] = token.split(".");
    const header: unknown = JSON.parse(
      Buffer.from(headerB64, "base64url").toString(),
    );

    if (!isRecord(header)) {
      return false;
    }

    const kid = header["kid"];
    if (!kid || typeof kid !== "string") {
      return false;
    }

    const key = await getVerificationKey(kid);
    const { payload } = await jwtVerify(token, key);

    const iat = payload.iat;
    if (!iat || Date.now() / 1000 - iat > 300) {
      return false;
    }

    const bodyHash = createHash("sha256").update(rawBody).digest("hex");
    if (payload["request_body_sha256"] !== bodyHash) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
};
