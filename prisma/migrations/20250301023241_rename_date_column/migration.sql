/*
  Warnings:

  - You are about to drop the column `date` on the `AccountBalance` table. All the data in the column will be lost.
  - Added the required column `snapshotDatetime` to the `AccountBalance` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables

ALTER TABLE "AccountBalance" RENAME COLUMN "date" TO "snapshotDatetime";
