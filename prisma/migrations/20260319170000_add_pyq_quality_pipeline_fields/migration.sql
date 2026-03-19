-- AlterTable
ALTER TABLE "PYQ"
ADD COLUMN     "confidenceScore" DOUBLE PRECISION NOT NULL DEFAULT 0.45,
ADD COLUMN     "sourceType" TEXT NOT NULL DEFAULT 'community',
ADD COLUMN     "sourceUrl" TEXT,
ADD COLUMN     "sourceReputation" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
ADD COLUMN     "dedupeGroup" TEXT,
ADD COLUMN     "reviewStatus" TEXT NOT NULL DEFAULT 'pending',
ADD COLUMN     "reviewNotes" TEXT,
ADD COLUMN     "reviewedAt" TIMESTAMP(3),
ADD COLUMN     "reviewedBy" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "PYQ_reviewStatus_idx" ON "PYQ"("reviewStatus");

-- CreateIndex
CREATE INDEX "PYQ_confidenceScore_idx" ON "PYQ"("confidenceScore");

-- CreateIndex
CREATE INDEX "PYQ_dedupeGroup_idx" ON "PYQ"("dedupeGroup");

-- CreateIndex
CREATE INDEX "PYQ_companyId_reviewStatus_idx" ON "PYQ"("companyId", "reviewStatus");
