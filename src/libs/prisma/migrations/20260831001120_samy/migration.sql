-- CreateTable
CREATE TABLE "SamyImage" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SamyImage_pkey" PRIMARY KEY ("id")
);
