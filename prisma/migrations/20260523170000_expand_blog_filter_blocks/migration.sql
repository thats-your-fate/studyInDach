ALTER TABLE "BlogPostFilterBlock" ADD COLUMN "key" TEXT;
ALTER TABLE "BlogPostFilterBlock" ADD COLUMN "ctaLabel" TEXT;
ALTER TABLE "BlogPostFilterBlock" ADD COLUMN "ctaHref" TEXT;
ALTER TABLE "BlogPostFilterBlock" ADD COLUMN "displayMode" TEXT NOT NULL DEFAULT 'cards';
ALTER TABLE "BlogPostFilterBlock" ADD COLUMN "enabled" BOOLEAN NOT NULL DEFAULT true;

CREATE INDEX "BlogPostFilterBlock_key_idx" ON "BlogPostFilterBlock"("key");
CREATE INDEX "BlogPostFilterBlock_enabled_idx" ON "BlogPostFilterBlock"("enabled");
