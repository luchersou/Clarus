/*
  Warnings:

  - The values [PROCESSING] on the enum `DocumentStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "documents"."DocumentStatus_new" AS ENUM ('UPLOADED', 'PROCESSED', 'FAILED');
ALTER TABLE "documents"."Document" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "documents"."Document" ALTER COLUMN "status" TYPE "documents"."DocumentStatus_new" USING ("status"::text::"documents"."DocumentStatus_new");
ALTER TYPE "documents"."DocumentStatus" RENAME TO "DocumentStatus_old";
ALTER TYPE "documents"."DocumentStatus_new" RENAME TO "DocumentStatus";
DROP TYPE "documents"."DocumentStatus_old";
ALTER TABLE "documents"."Document" ALTER COLUMN "status" SET DEFAULT 'UPLOADED';
COMMIT;
