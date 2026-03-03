-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('DRAFT', 'FEASIBILITY', 'QUOTED', 'SIGNED', 'ARCHIVED');

-- AlterEnum
ALTER TYPE "SpecLevel" ADD VALUE IF NOT EXISTS 'ULTRA';

-- AlterTable
ALTER TABLE "Project"
  ADD COLUMN IF NOT EXISTS "clientName" TEXT,
  ADD COLUMN IF NOT EXISTS "address" TEXT,
  ADD COLUMN IF NOT EXISTS "floors" INTEGER NOT NULL DEFAULT 2,
  ADD COLUMN IF NOT EXISTS "status" "ProjectStatus" NOT NULL DEFAULT 'DRAFT',
  ADD COLUMN IF NOT EXISTS "contingencyPercent" DOUBLE PRECISION NOT NULL DEFAULT 0.05,
  ADD COLUMN IF NOT EXISTS "notes" TEXT;

-- CreateTable
CREATE TABLE IF NOT EXISTS "ProjectVersion" (
  "id" TEXT NOT NULL,
  "projectId" TEXT NOT NULL,
  "versionNumber" INTEGER NOT NULL,
  "label" TEXT,
  "snapshot" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ProjectVersion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ProjectVersion_projectId_idx" ON "ProjectVersion"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "ProjectVersion_projectId_versionNumber_key" ON "ProjectVersion"("projectId", "versionNumber");

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "ProjectVersion" ADD CONSTRAINT "ProjectVersion_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
