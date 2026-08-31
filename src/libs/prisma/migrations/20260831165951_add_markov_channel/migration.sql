-- CreateTable
CREATE TABLE "MarkovChannel" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MarkovChannel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MarkovChannel_guildId_idx" ON "MarkovChannel"("guildId");

-- CreateIndex
CREATE INDEX "MarkovChannel_channelId_idx" ON "MarkovChannel"("channelId");

-- CreateIndex
CREATE UNIQUE INDEX "MarkovChannel_guildId_channelId_key" ON "MarkovChannel"("guildId", "channelId");

-- AddForeignKey
ALTER TABLE "MarkovChannel" ADD CONSTRAINT "MarkovChannel_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE CASCADE ON UPDATE CASCADE;
