/*
  Warnings:

  - A unique constraint covering the columns `[guildId,channelId]` on the table `Welcome` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Welcome_guildId_channelId_key" ON "Welcome"("guildId", "channelId");
