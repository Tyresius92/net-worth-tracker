/*
  Warnings:

  - You are about to drop the column `newEmail` on the `EmailVerificationToken` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_EmailVerificationToken" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "usedAt" DATETIME,
    "userId" TEXT NOT NULL,
    CONSTRAINT "EmailVerificationToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_EmailVerificationToken" ("createdAt", "expiresAt", "id", "tokenHash", "usedAt", "userId") SELECT "createdAt", "expiresAt", "id", "tokenHash", "usedAt", "userId" FROM "EmailVerificationToken";
DROP TABLE "EmailVerificationToken";
ALTER TABLE "new_EmailVerificationToken" RENAME TO "EmailVerificationToken";
CREATE UNIQUE INDEX "EmailVerificationToken_tokenHash_key" ON "EmailVerificationToken"("tokenHash");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
