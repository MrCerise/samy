/*
  Warnings:

  - You are about to drop the column `sessionKey` on the `LastFM` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "LastFM" DROP COLUMN "sessionKey";

-- CreateTable
CREATE TABLE "Guild" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Guild_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Welcome" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "message" TEXT,

    CONSTRAINT "Welcome_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Welcome_guildId_idx" ON "Welcome"("guildId");

-- CreateIndex
CREATE INDEX "Welcome_channelId_idx" ON "Welcome"("channelId");

-- AddForeignKey
ALTER TABLE "Welcome" ADD CONSTRAINT "Welcome_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
