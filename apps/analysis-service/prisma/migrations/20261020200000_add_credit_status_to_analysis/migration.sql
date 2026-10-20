-- CreateEnum
CREATE TYPE "analysis"."CreditStatus" AS ENUM ('RESERVED', 'CONSUMED', 'REFUNDED');

-- AlterTable
ALTER TABLE "analysis"."Analysis" ADD COLUMN     "creditStatus" "analysis"."CreditStatus" NOT NULL DEFAULT 'RESERVED';

-- Backfill: finished analyses already used or released their credit
UPDATE "analysis"."Analysis" SET "creditStatus" = 'CONSUMED' WHERE "status" = 'COMPLETED';
UPDATE "analysis"."Analysis" SET "creditStatus" = 'REFUNDED' WHERE "status" = 'FAILED';

-- CreateIndex
CREATE INDEX "Analysis_userId_createdAt_idx" ON "analysis"."Analysis"("userId", "createdAt");
