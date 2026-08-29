-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_companies" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "npwp" TEXT,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "onboarding_step" INTEGER NOT NULL DEFAULT 0,
    "onboarding_completed" BOOLEAN NOT NULL DEFAULT false,
    "industry" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_companies" ("address", "created_at", "email", "id", "is_active", "name", "npwp", "phone", "updated_at") SELECT "address", "created_at", "email", "id", "is_active", "name", "npwp", "phone", "updated_at" FROM "companies";
DROP TABLE "companies";
ALTER TABLE "new_companies" RENAME TO "companies";
CREATE UNIQUE INDEX "companies_npwp_key" ON "companies"("npwp");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
