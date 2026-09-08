-- DropForeignKey
ALTER TABLE "Question" DROP CONSTRAINT "Question_yearId_fkey";

-- AlterTable
ALTER TABLE "Question" ALTER COLUMN "yearId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_yearId_fkey" FOREIGN KEY ("yearId") REFERENCES "Year"("id") ON DELETE SET NULL ON UPDATE CASCADE;
