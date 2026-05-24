ALTER TABLE "DegreeProgram" ADD COLUMN "contentType" TEXT NOT NULL DEFAULT 'degree_program';
ALTER TABLE "DegreeProgram" ADD COLUMN "isSitemapIncluded" BOOLEAN;
ALTER TABLE "DegreeProgram" ADD COLUMN "publicCatalogPriority" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "DegreeProgram" ADD COLUMN "reviewNotes" TEXT;

CREATE INDEX "DegreeProgram_contentType_idx" ON "DegreeProgram"("contentType");
CREATE INDEX "DegreeProgram_isSitemapIncluded_idx" ON "DegreeProgram"("isSitemapIncluded");
CREATE INDEX "DegreeProgram_publicCatalogPriority_idx" ON "DegreeProgram"("publicCatalogPriority");
