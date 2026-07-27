-- DropForeignKey
ALTER TABLE "Welcome" DROP CONSTRAINT "Welcome_guildId_fkey";

-- AlterTable
ALTER TABLE "Guild" ADD COLUMN     "locale" TEXT,
ADD COLUMN     "prefix" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "locale" TEXT,
ADD COLUMN     "prefix" TEXT;

-- CreateTable
CREATE TABLE "CommandSetting" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "command" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "CommandSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Leave" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "message" TEXT NOT NULL,

    CONSTRAINT "Leave_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CommandSetting_guildId_idx" ON "CommandSetting"("guildId");

-- CreateIndex
CREATE UNIQUE INDEX "CommandSetting_guildId_command_key" ON "CommandSetting"("guildId", "command");

-- CreateIndex
CREATE INDEX "Leave_guildId_idx" ON "Leave"("guildId");

-- CreateIndex
CREATE INDEX "Leave_channelId_idx" ON "Leave"("channelId");

-- CreateIndex
CREATE UNIQUE INDEX "Leave_guildId_channelId_key" ON "Leave"("guildId", "channelId");

-- AddForeignKey
ALTER TABLE "CommandSetting" ADD CONSTRAINT "CommandSetting_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Welcome" ADD CONSTRAINT "Welcome_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Leave" ADD CONSTRAINT "Leave_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE CASCADE ON UPDATE CASCADE;
