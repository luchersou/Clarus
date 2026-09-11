-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "documents";

-- CreateEnum
CREATE TYPE "documents"."FileType" AS ENUM ('PDF', 'DOCX', 'XLSX');

-- CreateEnum
CREATE TYPE "documents"."DocumentStatus" AS ENUM ('UPLOADED', 'PROCESSING', 'PROCESSED', 'FAILED');

-- CreateTable
CREATE TABLE "documents"."Document" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileType" "documents"."FileType" NOT NULL,
    "fileSizeBytes" INTEGER NOT NULL,
    "storageUrl" TEXT NOT NULL,
    "status" "documents"."DocumentStatus" NOT NULL DEFAULT 'UPLOADED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);
