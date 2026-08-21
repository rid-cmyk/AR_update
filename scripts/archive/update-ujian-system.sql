-- Update UjianSantri table
ALTER TABLE "UjianSantri" ADD COLUMN IF NOT EXISTS "juzDari" INTEGER;
ALTER TABLE "UjianSantri" ADD COLUMN IF NOT EXISTS "juzSampai" INTEGER;

-- Update NilaiUjian table for UAS support
ALTER TABLE "NilaiUjian" ALTER COLUMN "komponenPenilaianId" DROP NOT NULL;
ALTER TABLE "NilaiUjian" ADD COLUMN IF NOT EXISTS "urutan" INTEGER;

-- Drop unique constraint if exists
ALTER TABLE "NilaiUjian" DROP CONSTRAINT IF EXISTS "NilaiUjian_ujianSantriId_komponenPenilaianId_key";

-- Add tahfidz to JenisUjianTemplate enum
ALTER TYPE "JenisUjianTemplate" ADD VALUE IF NOT EXISTS 'tahfidz';

-- Update any existing test data
UPDATE "UjianSantri" SET "juzDari" = 1, "juzSampai" = 1 WHERE "juzDari" IS NULL;