-- CreateTable
CREATE TABLE "GuildBan" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GuildBan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GuildBan_expiresAt_idx" ON "GuildBan"("expiresAt");

-- CreateIndex
CREATE INDEX "GuildBan_guildId_idx" ON "GuildBan"("guildId");

-- CreateIndex
CREATE UNIQUE INDEX "GuildBan_guildId_userId_key" ON "GuildBan"("guildId", "userId");

-- AddForeignKey
ALTER TABLE "GuildBan" ADD CONSTRAINT "GuildBan_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE CASCADE ON UPDATE CASCADE;
