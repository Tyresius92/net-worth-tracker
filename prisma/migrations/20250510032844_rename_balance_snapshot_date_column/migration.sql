/*
  Warnings:

  - You are about to drop the column `date` on the `BalanceSnapshot` table. All the data in the column will be lost.
  - Added the required column `dateTime` to the `BalanceSnapshot` table without a default value. This is not possible if the table is not empty.

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
    "dateTime" DATETIME NOT NULL,
    CONSTRAINT "BalanceSnapshot_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_BalanceSnapshot" ("accountId", "amount", "createdAt", "id", "updatedAt") SELECT "accountId", "amount", "createdAt", "id", "updatedAt" FROM "BalanceSnapshot";
DROP TABLE "BalanceSnapshot";
ALTER TABLE "new_BalanceSnapshot" RENAME TO "BalanceSnapshot";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
