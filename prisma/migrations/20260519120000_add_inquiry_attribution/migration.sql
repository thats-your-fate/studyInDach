-- AlterTable
ALTER TABLE "Inquiry" ADD COLUMN "referrer" TEXT;
ALTER TABLE "Inquiry" ADD COLUMN "utmSource" TEXT;
ALTER TABLE "Inquiry" ADD COLUMN "utmMedium" TEXT;
ALTER TABLE "Inquiry" ADD COLUMN "utmCampaign" TEXT;
ALTER TABLE "Inquiry" ADD COLUMN "landingPath" TEXT;

-- CreateIndex
CREATE INDEX "Inquiry_locale_idx" ON "Inquiry"("locale");

-- CreateIndex
CREATE INDEX "Inquiry_sourcePath_idx" ON "Inquiry"("sourcePath");

-- CreateIndex
CREATE INDEX "Inquiry_landingPath_idx" ON "Inquiry"("landingPath");
