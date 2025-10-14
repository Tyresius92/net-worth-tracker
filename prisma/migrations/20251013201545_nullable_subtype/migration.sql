-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PlaidAccount" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "plaidItemId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "plaidAccountId" TEXT NOT NULL,
    "officialName" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mask" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "subtype" TEXT,
    CONSTRAINT "PlaidAccount_plaidItemId_fkey" FOREIGN KEY ("plaidItemId") REFERENCES "PlaidItem" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PlaidAccount_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_PlaidAccount" ("accountId", "createdAt", "id", "mask", "name", "officialName", "plaidAccountId", "plaidItemId", "subtype", "type", "updatedAt") SELECT "accountId", "createdAt", "id", "mask", "name", "officialName", "plaidAccountId", "plaidItemId", "subtype", "type", "updatedAt" FROM "PlaidAccount";
DROP TABLE "PlaidAccount";
ALTER TABLE "new_PlaidAccount" RENAME TO "PlaidAccount";
CREATE UNIQUE INDEX "PlaidAccount_accountId_key" ON "PlaidAccount"("accountId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
