/*
  Warnings:

  - You are about to drop the `ModuleSetting` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ModuleSetting" DROP CONSTRAINT "ModuleSetting_guildId_fkey";

-- DropTable
DROP TABLE "ModuleSetting";
