-- CreateTable
CREATE TABLE "ContactFormSubmission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "emailAddress" TEXT NOT NULL,
    "message" TEXT NOT NULL
);
