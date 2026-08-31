/*
  Warnings:

  - You are about to drop the column `markovEnabled` on the `Guild` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Guild" DROP COLUMN "markovEnabled";

-- CreateTable
CREATE TABLE "MarkovSettings" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "mentionEnabled" BOOLEAN NOT NULL DEFAULT true,
    "randomEnabled" BOOLEAN NOT NULL DEFAULT false,
    "randomFrequency" INTEGER NOT NULL DEFAULT 200,
    "randomCooldown" INTEGER NOT NULL DEFAULT 300,
    "chainOrder" INTEGER NOT NULL DEFAULT 2,
    "minOutputLength" INTEGER NOT NULL DEFAULT 3,
    "maxOutputLength" INTEGER NOT NULL DEFAULT 25,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarkovSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MarkovSettings_guildId_key" ON "MarkovSettings"("guildId");

-- AddForeignKey
ALTER TABLE "MarkovSettings" ADD CONSTRAINT "MarkovSettings_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE CASCADE ON UPDATE CASCADE;
