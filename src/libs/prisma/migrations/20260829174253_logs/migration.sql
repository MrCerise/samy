-- CreateEnum
CREATE TYPE "LogCategory" AS ENUM ('CHANNELS', 'GUILD', 'IMAGES', 'MEMBERS', 'MESSAGES', 'MODERATION', 'ROLES', 'VOICE');

-- CreateEnum
CREATE TYPE "IgnoreTargetType" AS ENUM ('USER', 'ROLE', 'CHANNEL');

-- CreateTable
CREATE TABLE "LogChannel" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "category" "LogCategory" NOT NULL,
    "channelId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LogChannel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LogIgnore" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "targetType" "IgnoreTargetType" NOT NULL,
    "category" "LogCategory",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LogIgnore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LogRoute" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "sourceChannelId" TEXT NOT NULL,
    "targetChannelId" TEXT NOT NULL,
    "category" "LogCategory" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LogRoute_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LogChannel_guildId_idx" ON "LogChannel"("guildId");

-- CreateIndex
CREATE UNIQUE INDEX "LogChannel_guildId_category_key" ON "LogChannel"("guildId", "category");

-- CreateIndex
CREATE INDEX "LogIgnore_guildId_idx" ON "LogIgnore"("guildId");

-- CreateIndex
CREATE UNIQUE INDEX "LogIgnore_guildId_targetId_category_key" ON "LogIgnore"("guildId", "targetId", "category");

-- CreateIndex
CREATE INDEX "LogRoute_guildId_idx" ON "LogRoute"("guildId");

-- CreateIndex
CREATE UNIQUE INDEX "LogRoute_guildId_sourceChannelId_category_key" ON "LogRoute"("guildId", "sourceChannelId", "category");

-- AddForeignKey
ALTER TABLE "LogChannel" ADD CONSTRAINT "LogChannel_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LogIgnore" ADD CONSTRAINT "LogIgnore_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LogRoute" ADD CONSTRAINT "LogRoute_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE CASCADE ON UPDATE CASCADE;
