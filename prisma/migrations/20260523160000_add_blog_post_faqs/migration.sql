CREATE TABLE "BlogPostFaq" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "postId" INTEGER NOT NULL,
  "locale" TEXT,
  "question" TEXT NOT NULL,
  "answer" TEXT NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "BlogPostFaq_postId_fkey" FOREIGN KEY ("postId") REFERENCES "BlogPost" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "BlogPostFaq_postId_idx" ON "BlogPostFaq"("postId");
CREATE INDEX "BlogPostFaq_locale_idx" ON "BlogPostFaq"("locale");
