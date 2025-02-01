/*
  Warnings:

  - Added the required column `userId` to the `UserPlaidItem` table without a default value. This is not possible if the table is not empty.

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
    "userId" TEXT NOT NULL,
    CONSTRAINT "UserPlaidItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_UserPlaidItem" ("accessToken", "createdAt", "id", "plaidItemId", "updatedAt") SELECT "accessToken", "createdAt", "id", "plaidItemId", "updatedAt" FROM "UserPlaidItem";
DROP TABLE "UserPlaidItem";
ALTER TABLE "new_UserPlaidItem" RENAME TO "UserPlaidItem";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
