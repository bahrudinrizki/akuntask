-- CreateTable
CREATE TABLE "chart_of_accounts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "company_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "parent_id" TEXT,
    "level" INTEGER NOT NULL DEFAULT 1,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "chart_of_accounts_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "chart_of_accounts_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "chart_of_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "journals" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "company_id" TEXT NOT NULL,
    "reference_no" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'POSTED',
    "total_debit" REAL NOT NULL,
    "total_credit" REAL NOT NULL,
    "created_by_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "journals_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "journals_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "journal_lines" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "journal_id" TEXT NOT NULL,
    "coa_id" TEXT NOT NULL,
    "debit" REAL NOT NULL DEFAULT 0,
    "credit" REAL NOT NULL DEFAULT 0,
    "description" TEXT,
    CONSTRAINT "journal_lines_journal_id_fkey" FOREIGN KEY ("journal_id") REFERENCES "journals" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "journal_lines_coa_id_fkey" FOREIGN KEY ("coa_id") REFERENCES "chart_of_accounts" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "chart_of_accounts_company_id_type_idx" ON "chart_of_accounts"("company_id", "type");

-- CreateIndex
CREATE INDEX "chart_of_accounts_parent_id_idx" ON "chart_of_accounts"("parent_id");

-- CreateIndex
CREATE UNIQUE INDEX "chart_of_accounts_company_id_code_key" ON "chart_of_accounts"("company_id", "code");

-- CreateIndex
CREATE INDEX "journals_company_id_date_idx" ON "journals"("company_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "journals_company_id_reference_no_key" ON "journals"("company_id", "reference_no");

-- CreateIndex
CREATE INDEX "journal_lines_journal_id_idx" ON "journal_lines"("journal_id");

-- CreateIndex
CREATE INDEX "journal_lines_coa_id_idx" ON "journal_lines"("coa_id");
