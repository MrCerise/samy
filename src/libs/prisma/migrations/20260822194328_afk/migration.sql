-- CreateTable
CREATE TABLE "Afk" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Afk_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Afk_guildId_idx" ON "Afk"("guildId");

-- CreateIndex
CREATE UNIQUE INDEX "Afk_userId_guildId_key" ON "Afk"("userId", "guildId");

-- AddForeignKey
ALTER TABLE "Afk" ADD CONSTRAINT "Afk_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE CASCADE ON UPDATE CASCADE;
