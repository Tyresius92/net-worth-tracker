import crypto from "crypto";

import { prisma } from "~/db.server";

const TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function createEmailVerificationToken(userId: string): Promise<string> {
  await prisma.emailVerificationToken.deleteMany({ where: { userId } });

  const token = crypto.randomBytes(32).toString("hex");

  await prisma.emailVerificationToken.create({
    data: {
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + TOKEN_EXPIRY_MS),
      userId,
    },
  });

  return token;
}

export async function verifyEmailVerificationToken(token: string) {
  const record = await prisma.emailVerificationToken.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: { select: { id: true, email: true, firstName: true } } },
  });

  if (!record) return null;
  if (record.usedAt) return null;
  if (record.expiresAt < new Date()) return null;

  return record;
}

export async function consumeEmailVerificationToken(tokenId: string, userId: string): Promise<void> {
  await prisma.$transaction([
    prisma.emailVerificationToken.update({
      where: { id: tokenId },
      data: { usedAt: new Date() },
    }),
    prisma.user.update({
      where: { id: userId },
      data: { emailVerifiedAt: new Date() },
    }),
  ]);
}
