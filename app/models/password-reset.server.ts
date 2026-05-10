import crypto from "crypto";

import bcrypt from "bcryptjs";

import { prisma } from "~/db.server";

const TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function createPasswordResetToken(userId: string): Promise<string> {
  await prisma.passwordResetToken.deleteMany({ where: { userId } });

  const token = crypto.randomBytes(32).toString("hex");

  await prisma.passwordResetToken.create({
    data: {
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + TOKEN_EXPIRY_MS),
      userId,
    },
  });

  return token;
}

export async function verifyPasswordResetToken(token: string) {
  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: { select: { id: true, email: true } } },
  });

  if (!record) return null;
  if (record.usedAt) return null;
  if (record.expiresAt < new Date()) return null;

  return record;
}

export async function consumePasswordResetToken(
  tokenId: string,
  userId: string,
  newPassword: string,
): Promise<void> {
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.$transaction([
    prisma.passwordResetToken.update({
      where: { id: tokenId },
      data: { usedAt: new Date() },
    }),
    prisma.password.upsert({
      where: { userId },
      update: { hash: hashedPassword },
      create: { userId, hash: hashedPassword },
    }),
  ]);
}
