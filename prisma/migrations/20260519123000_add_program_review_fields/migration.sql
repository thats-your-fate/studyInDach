-- AlterTable
ALTER TABLE "DegreeProgram" ADD COLUMN "reviewStatus" TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE "DegreeProgram" ADD COLUMN "isPublished" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "DegreeProgram" ADD COLUMN "isLikelyDegreeProgram" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "DegreeProgram" ADD COLUMN "qualityFlags" TEXT;

-- CreateIndex
CREATE INDEX "DegreeProgram_reviewStatus_idx" ON "DegreeProgram"("reviewStatus");

-- CreateIndex
CREATE INDEX "DegreeProgram_isPublished_idx" ON "DegreeProgram"("isPublished");

-- CreateIndex
CREATE INDEX "DegreeProgram_isLikelyDegreeProgram_idx" ON "DegreeProgram"("isLikelyDegreeProgram");
