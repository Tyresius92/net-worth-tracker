/*
  Warnings:

  - Added the required column `amount` to the `BalanceSnapshot` table without a default value. This is not possible if the table is not empty.
  - Added the required column `date` to the `BalanceSnapshot` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BalanceSnapshot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "accountId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "date" DATETIME NOT NULL,
    CONSTRAINT "BalanceSnapshot_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_BalanceSnapshot" ("accountId", "createdAt", "id", "updatedAt") SELECT "accountId", "createdAt", "id", "updatedAt" FROM "BalanceSnapshot";
DROP TABLE "BalanceSnapshot";
ALTER TABLE "new_BalanceSnapshot" RENAME TO "BalanceSnapshot";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
