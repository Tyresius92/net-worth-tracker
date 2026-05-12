import crypto from "crypto";

import bcrypt from "bcryptjs";

import { prisma } from "~/db.server";

const CODE_COUNT = 10;
const CODE_BYTES = 6; // 48 bits → 12 hex chars displayed as XXXX-XXXX-XXXX

function formatCode(raw: string): string {
  const upper = raw.toUpperCase();
  return `${upper.slice(0, 4)}-${upper.slice(4, 8)}-${upper.slice(8, 12)}`;
}

function normalizeCode(code: string): string {
  return code.replace(/-/g, "").toLowerCase();
}

export async function generateRecoveryCodes(userId: string): Promise<string[]> {
  await prisma.recoveryCode.deleteMany({ where: { userId } });

  const plaintextCodes: string[] = [];
  const createData: { codeHash: string; userId: string }[] = [];

  for (let i = 0; i < CODE_COUNT; i++) {
    const raw = crypto.randomBytes(CODE_BYTES).toString("hex");
    const formatted = formatCode(raw);
    const hash = await bcrypt.hash(normalizeCode(formatted), 10);
    plaintextCodes.push(formatted);
    createData.push({ codeHash: hash, userId });
  }

  await prisma.recoveryCode.createMany({ data: createData });

  return plaintextCodes;
}

export async function consumeRecoveryCode(
  userId: string,
  code: string,
): Promise<boolean> {
  const normalized = normalizeCode(code);
  const unusedCodes = await prisma.recoveryCode.findMany({
    where: { userId, usedAt: null },
    select: { id: true, codeHash: true },
  });

  for (const record of unusedCodes) {
    const matches = await bcrypt.compare(normalized, record.codeHash);
    if (matches) {
      await prisma.recoveryCode.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      });
      return true;
    }
  }

  return false;
}

export async function getRecoveryCodeCount(userId: string): Promise<number> {
  return prisma.recoveryCode.count({ where: { userId, usedAt: null } });
}
