DROP TABLE IF EXISTS "BlogPostFilterBlock";
DROP TABLE IF EXISTS "BlogPostUniversityLink";
DROP TABLE IF EXISTS "BlogPostProgramLink";
DROP TABLE IF EXISTS "BlogPostTag";
DROP TABLE IF EXISTS "BlogTagTranslation";
DROP TABLE IF EXISTS "BlogTag";
DROP TABLE IF EXISTS "BlogCategoryTranslation";
DROP TABLE IF EXISTS "BlogCategory";
DROP TABLE IF EXISTS "BlogPostTranslation";
DROP TABLE IF EXISTS "BlogPost";

CREATE TABLE "BlogPost" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  "publishedAt" DATETIME,
  "status" TEXT NOT NULL DEFAULT 'draft',
  "type" TEXT NOT NULL DEFAULT 'guide',
  "authorName" TEXT DEFAULT 'Study in DACH',
  "coverImageUrl" TEXT,
  "coverImageAlt" TEXT,
  "featured" BOOLEAN NOT NULL DEFAULT false,
  "noindex" BOOLEAN NOT NULL DEFAULT false,
  "translationKey" TEXT NOT NULL,
  "canonicalPostId" INTEGER,
  "categoryId" INTEGER,
  CONSTRAINT "BlogPost_canonicalPostId_fkey" FOREIGN KEY ("canonicalPostId") REFERENCES "BlogPost" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "BlogPost_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "BlogCategory" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "BlogPostTranslation" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "postId" INTEGER NOT NULL,
  "locale" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "excerpt" TEXT,
  "contentMd" TEXT NOT NULL,
  "contentHtml" TEXT,
  "seoTitle" TEXT,
  "seoDescription" TEXT,
  "seoKeywords" TEXT,
  "ogTitle" TEXT,
  "ogDescription" TEXT,
  "ogImageUrl" TEXT,
  "readingMinutes" INTEGER,
  "tableOfContents" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "BlogPostTranslation_postId_fkey" FOREIGN KEY ("postId") REFERENCES "BlogPost" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "BlogCategory" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "key" TEXT NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE "BlogCategoryTranslation" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "categoryId" INTEGER NOT NULL,
  "locale" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "description" TEXT,
  CONSTRAINT "BlogCategoryTranslation_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "BlogCategory" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "BlogTag" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "key" TEXT NOT NULL
);

CREATE TABLE "BlogTagTranslation" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "tagId" INTEGER NOT NULL,
  "locale" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  CONSTRAINT "BlogTagTranslation_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "BlogTag" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "BlogPostTag" (
  "postId" INTEGER NOT NULL,
  "tagId" INTEGER NOT NULL,
  PRIMARY KEY ("postId", "tagId"),
  CONSTRAINT "BlogPostTag_postId_fkey" FOREIGN KEY ("postId") REFERENCES "BlogPost" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "BlogPostTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "BlogTag" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "BlogPostProgramLink" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "postId" INTEGER NOT NULL,
  "programId" INTEGER NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "label" TEXT,
  CONSTRAINT "BlogPostProgramLink_postId_fkey" FOREIGN KEY ("postId") REFERENCES "BlogPost" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "BlogPostProgramLink_programId_fkey" FOREIGN KEY ("programId") REFERENCES "DegreeProgram" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "BlogPostUniversityLink" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "postId" INTEGER NOT NULL,
  "universityId" TEXT NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "label" TEXT,
  CONSTRAINT "BlogPostUniversityLink_postId_fkey" FOREIGN KEY ("postId") REFERENCES "BlogPost" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "BlogPostUniversityLink_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "BlogPostFilterBlock" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "postId" INTEGER NOT NULL,
  "locale" TEXT,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "filterJson" TEXT NOT NULL,
  "limit" INTEGER NOT NULL DEFAULT 8,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "BlogPostFilterBlock_postId_fkey" FOREIGN KEY ("postId") REFERENCES "BlogPost" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "BlogPost_translationKey_key" ON "BlogPost"("translationKey");
CREATE INDEX "BlogPost_status_publishedAt_idx" ON "BlogPost"("status", "publishedAt");
CREATE INDEX "BlogPost_type_idx" ON "BlogPost"("type");
CREATE INDEX "BlogPost_categoryId_idx" ON "BlogPost"("categoryId");
CREATE UNIQUE INDEX "BlogPostTranslation_locale_slug_key" ON "BlogPostTranslation"("locale", "slug");
CREATE UNIQUE INDEX "BlogPostTranslation_postId_locale_key" ON "BlogPostTranslation"("postId", "locale");
CREATE INDEX "BlogPostTranslation_locale_idx" ON "BlogPostTranslation"("locale");
CREATE UNIQUE INDEX "BlogCategory_key_key" ON "BlogCategory"("key");
CREATE UNIQUE INDEX "BlogCategoryTranslation_locale_slug_key" ON "BlogCategoryTranslation"("locale", "slug");
CREATE UNIQUE INDEX "BlogCategoryTranslation_categoryId_locale_key" ON "BlogCategoryTranslation"("categoryId", "locale");
CREATE UNIQUE INDEX "BlogTag_key_key" ON "BlogTag"("key");
CREATE UNIQUE INDEX "BlogTagTranslation_locale_slug_key" ON "BlogTagTranslation"("locale", "slug");
CREATE UNIQUE INDEX "BlogTagTranslation_tagId_locale_key" ON "BlogTagTranslation"("tagId", "locale");
CREATE INDEX "BlogPostProgramLink_postId_idx" ON "BlogPostProgramLink"("postId");
CREATE INDEX "BlogPostProgramLink_programId_idx" ON "BlogPostProgramLink"("programId");
CREATE INDEX "BlogPostUniversityLink_postId_idx" ON "BlogPostUniversityLink"("postId");
CREATE INDEX "BlogPostUniversityLink_universityId_idx" ON "BlogPostUniversityLink"("universityId");
CREATE INDEX "BlogPostFilterBlock_postId_idx" ON "BlogPostFilterBlock"("postId");
