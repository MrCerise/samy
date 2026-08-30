/*
  Warnings:

  - You are about to drop the `LogRoute` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "LogRoute" DROP CONSTRAINT "LogRoute_guildId_fkey";

-- DropTable
DROP TABLE "LogRoute";
