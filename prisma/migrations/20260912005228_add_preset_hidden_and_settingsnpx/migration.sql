-- AlterTable
ALTER TABLE "ExamPreset" ADD COLUMN     "hidden" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Settings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "logoUrl" TEXT,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);
