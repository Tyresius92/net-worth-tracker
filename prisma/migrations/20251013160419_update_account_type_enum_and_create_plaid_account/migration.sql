/*
  Warnings:

  - You are about to drop the column `nickName` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `officialName` on the `Account` table. All the data in the column will be lost.
  - Added the required column `institutionId` to the `PlaidItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `institutionName` to the `PlaidItem` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "PlaidAccount" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "plaidItemId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    CONSTRAINT "PlaidAccount_plaidItemId_fkey" FOREIGN KEY ("plaidItemId") REFERENCES "PlaidItem" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PlaidAccount_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Account" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "closedAt" DATETIME,
    "name" TEXT,
    "type" TEXT NOT NULL DEFAULT 'other',
    "userId" TEXT NOT NULL,
    CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Account" ("closedAt", "createdAt", "id", "type", "updatedAt", "userId") SELECT "closedAt", "createdAt", "id", "type", "updatedAt", "userId" FROM "Account";
DROP TABLE "Account";
ALTER TABLE "new_Account" RENAME TO "Account";
CREATE TABLE "new_PlaidItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    "plaidItemId" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "institutionName" TEXT NOT NULL,
    CONSTRAINT "PlaidItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_PlaidItem" ("accessToken", "createdAt", "id", "plaidItemId", "updatedAt", "userId") SELECT "accessToken", "createdAt", "id", "plaidItemId", "updatedAt", "userId" FROM "PlaidItem";
DROP TABLE "PlaidItem";
ALTER TABLE "new_PlaidItem" RENAME TO "PlaidItem";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
