-- CreateTable
CREATE TABLE "Inquiry" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'new',
    "name" TEXT,
    "email" TEXT NOT NULL,
    "countryOfResidence" TEXT,
    "preferredStudyCountry" TEXT,
    "message" TEXT NOT NULL,
    "programId" INTEGER,
    "programNameSnapshot" TEXT,
    "universityNameSnapshot" TEXT,
    "programUrlSnapshot" TEXT,
    "locale" TEXT,
    "sourcePath" TEXT,
    "adminNotes" TEXT
);

-- CreateIndex
CREATE INDEX "Inquiry_status_idx" ON "Inquiry"("status");

-- CreateIndex
CREATE INDEX "Inquiry_email_idx" ON "Inquiry"("email");

-- CreateIndex
CREATE INDEX "Inquiry_programId_idx" ON "Inquiry"("programId");

-- CreateIndex
CREATE INDEX "Inquiry_createdAt_idx" ON "Inquiry"("createdAt");

