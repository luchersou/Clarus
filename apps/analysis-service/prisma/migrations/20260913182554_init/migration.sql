-- CreateEnum
CREATE TYPE "analysis"."AnalysisType" AS ENUM ('SUMMARY', 'EXTRACT_VALUES', 'DEADLINES', 'COMPARE');

-- CreateEnum
CREATE TYPE "analysis"."AnalysisStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "analysis"."Analysis" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "analysis"."AnalysisType" NOT NULL,
    "status" "analysis"."AnalysisStatus" NOT NULL DEFAULT 'PENDING',
    "result" JSONB,
    "sourcePage" INTEGER,
    "confidence" DOUBLE PRECISION,
    "failureReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Analysis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Analysis_documentId_idx" ON "analysis"."Analysis"("documentId");

-- CreateIndex
CREATE INDEX "Analysis_userId_idx" ON "analysis"."Analysis"("userId");