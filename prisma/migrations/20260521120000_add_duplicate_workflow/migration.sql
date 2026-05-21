-- Add safe duplicate-review metadata. These fields intentionally avoid hard relations
-- so rows can be marked and reviewed before any destructive merge work happens.
ALTER TABLE "University" ADD COLUMN "duplicateStatus" TEXT NOT NULL DEFAULT 'unique';
ALTER TABLE "University" ADD COLUMN "canonicalUniversityId" TEXT;
ALTER TABLE "University" ADD COLUMN "duplicateNotes" TEXT;

ALTER TABLE "DegreeProgram" ADD COLUMN "duplicateStatus" TEXT NOT NULL DEFAULT 'unique';
ALTER TABLE "DegreeProgram" ADD COLUMN "canonicalProgramId" INTEGER;
ALTER TABLE "DegreeProgram" ADD COLUMN "duplicateNotes" TEXT;

CREATE INDEX "University_duplicateStatus_idx" ON "University"("duplicateStatus");
CREATE INDEX "University_canonicalUniversityId_idx" ON "University"("canonicalUniversityId");
CREATE INDEX "DegreeProgram_duplicateStatus_idx" ON "DegreeProgram"("duplicateStatus");
CREATE INDEX "DegreeProgram_canonicalProgramId_idx" ON "DegreeProgram"("canonicalProgramId");
