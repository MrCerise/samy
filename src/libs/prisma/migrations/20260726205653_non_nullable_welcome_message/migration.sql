/*
  Warnings:

  - Made the column `message` on table `Welcome` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Welcome" ALTER COLUMN "message" SET NOT NULL;
