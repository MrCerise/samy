-- CreateTable
CREATE TABLE "Autorole" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Autorole_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Autorole_guildId_idx" ON "Autorole"("guildId");

-- CreateIndex
CREATE INDEX "Autorole_roleId_idx" ON "Autorole"("roleId");

-- CreateIndex
CREATE UNIQUE INDEX "Autorole_guildId_roleId_key" ON "Autorole"("guildId", "roleId");

-- AddForeignKey
ALTER TABLE "Autorole" ADD CONSTRAINT "Autorole_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE CASCADE ON UPDATE CASCADE;
