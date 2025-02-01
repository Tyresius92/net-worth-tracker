/*
  Warnings:

  - Added the required column `accountId` to the `PlaidAccount` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PlaidAccount" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "accountId" TEXT NOT NULL,
    "officialName" TEXT NOT NULL,
    "nickName" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    CONSTRAINT "PlaidAccount_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "PlaidItem" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_PlaidAccount" ("createdAt", "id", "itemId", "nickName", "officialName", "updatedAt") SELECT "createdAt", "id", "itemId", "nickName", "officialName", "updatedAt" FROM "PlaidAccount";
DROP TABLE "PlaidAccount";
ALTER TABLE "new_PlaidAccount" RENAME TO "PlaidAccount";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
