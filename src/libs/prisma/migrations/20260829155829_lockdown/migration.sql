-- CreateTable
CREATE TABLE "LockdownChannel" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LockdownChannel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LockdownRole" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LockdownRole_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LockdownChannel_guildId_idx" ON "LockdownChannel"("guildId");

-- CreateIndex
CREATE UNIQUE INDEX "LockdownChannel_guildId_channelId_key" ON "LockdownChannel"("guildId", "channelId");

-- CreateIndex
CREATE INDEX "LockdownRole_guildId_idx" ON "LockdownRole"("guildId");

-- CreateIndex
CREATE UNIQUE INDEX "LockdownRole_guildId_roleId_key" ON "LockdownRole"("guildId", "roleId");

-- AddForeignKey
ALTER TABLE "LockdownChannel" ADD CONSTRAINT "LockdownChannel_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LockdownRole" ADD CONSTRAINT "LockdownRole_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE CASCADE ON UPDATE CASCADE;
