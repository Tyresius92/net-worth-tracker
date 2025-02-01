/*
  Warnings:

  - Added the required column `plaidItemId` to the `UserPlaidItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `plaidRequestId` to the `UserPlaidItem` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_UserPlaidItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "accessToken" TEXT NOT NULL,
    "plaidItemId" TEXT NOT NULL,
    "plaidRequestId" TEXT NOT NULL
);
INSERT INTO "new_UserPlaidItem" ("accessToken", "createdAt", "id", "updatedAt") SELECT "accessToken", "createdAt", "id", "updatedAt" FROM "UserPlaidItem";
DROP TABLE "UserPlaidItem";
ALTER TABLE "new_UserPlaidItem" RENAME TO "UserPlaidItem";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
