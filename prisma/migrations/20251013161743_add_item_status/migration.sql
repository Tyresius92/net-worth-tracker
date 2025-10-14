/*
  Warnings:

  - Added the required column `mask` to the `PlaidAccount` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `PlaidAccount` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `PlaidItem` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PlaidAccount" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "plaidItemId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mask" TEXT NOT NULL,
    CONSTRAINT "PlaidAccount_plaidItemId_fkey" FOREIGN KEY ("plaidItemId") REFERENCES "PlaidItem" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PlaidAccount_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_PlaidAccount" ("accountId", "createdAt", "id", "plaidItemId", "updatedAt") SELECT "accountId", "createdAt", "id", "plaidItemId", "updatedAt" FROM "PlaidAccount";
DROP TABLE "PlaidAccount";
ALTER TABLE "new_PlaidAccount" RENAME TO "PlaidAccount";
CREATE TABLE "new_PlaidItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "plaidItemId" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "institutionName" TEXT NOT NULL,
    CONSTRAINT "PlaidItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_PlaidItem" ("accessToken", "createdAt", "id", "institutionId", "institutionName", "plaidItemId", "updatedAt", "userId") SELECT "accessToken", "createdAt", "id", "institutionId", "institutionName", "plaidItemId", "updatedAt", "userId" FROM "PlaidItem";
DROP TABLE "PlaidItem";
ALTER TABLE "new_PlaidItem" RENAME TO "PlaidItem";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
