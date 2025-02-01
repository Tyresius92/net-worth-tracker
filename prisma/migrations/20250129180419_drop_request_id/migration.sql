/*
  Warnings:

  - You are about to drop the column `plaidRequestId` on the `UserPlaidItem` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_UserPlaidItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "accessToken" TEXT NOT NULL,
    "plaidItemId" TEXT NOT NULL
);
INSERT INTO "new_UserPlaidItem" ("accessToken", "createdAt", "id", "plaidItemId", "updatedAt") SELECT "accessToken", "createdAt", "id", "plaidItemId", "updatedAt" FROM "UserPlaidItem";
DROP TABLE "UserPlaidItem";
ALTER TABLE "new_UserPlaidItem" RENAME TO "UserPlaidItem";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
