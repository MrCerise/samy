-- AlterTable
ALTER TABLE "Guild" ADD COLUMN     "markovEnabled" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "MarkovChain" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "messageCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarkovChain_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MarkovChain_guildId_key" ON "MarkovChain"("guildId");

-- AddForeignKey
ALTER TABLE "MarkovChain" ADD CONSTRAINT "MarkovChain_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE CASCADE ON UPDATE CASCADE;
