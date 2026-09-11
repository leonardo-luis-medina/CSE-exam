-- CreateTable
CREATE TABLE "ExamPreset" (
    "id" SERIAL NOT NULL,
    "examId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "config" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExamPreset_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ExamPreset" ADD CONSTRAINT "ExamPreset_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE CASCADE ON UPDATE CASCADE;
