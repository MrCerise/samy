/*
  Warnings:

  - Made the column `category` on table `LogIgnore` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
ALTER TYPE "LogCategory" ADD VALUE 'ALL';

-- AlterTable
ALTER TABLE "LogIgnore" ALTER COLUMN "category" SET NOT NULL;
