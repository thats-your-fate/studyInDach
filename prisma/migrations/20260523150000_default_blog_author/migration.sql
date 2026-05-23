PRAGMA foreign_keys=OFF;

CREATE TABLE "BlogPost_new" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  "publishedAt" DATETIME,
  "status" TEXT NOT NULL DEFAULT 'draft',
  "type" TEXT NOT NULL DEFAULT 'guide',
  "authorName" TEXT DEFAULT 'Yaroslav Vynnychuk',
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

INSERT INTO "BlogPost_new" (
  "id",
  "createdAt",
  "updatedAt",
  "publishedAt",
  "status",
  "type",
  "authorName",
  "coverImageUrl",
  "coverImageAlt",
  "featured",
  "noindex",
  "translationKey",
  "canonicalPostId",
  "categoryId"
)
SELECT
  "id",
  "createdAt",
  "updatedAt",
  "publishedAt",
  "status",
  "type",
  "authorName",
  "coverImageUrl",
  "coverImageAlt",
  "featured",
  "noindex",
  "translationKey",
  "canonicalPostId",
  "categoryId"
FROM "BlogPost";

DROP TABLE "BlogPost";
ALTER TABLE "BlogPost_new" RENAME TO "BlogPost";

CREATE UNIQUE INDEX "BlogPost_translationKey_key" ON "BlogPost"("translationKey");
CREATE INDEX "BlogPost_status_publishedAt_idx" ON "BlogPost"("status", "publishedAt");
CREATE INDEX "BlogPost_type_idx" ON "BlogPost"("type");
CREATE INDEX "BlogPost_categoryId_idx" ON "BlogPost"("categoryId");

PRAGMA foreign_keys=ON;
