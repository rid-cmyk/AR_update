-- Add juz fields to UjianSantri table
ALTER TABLE "UjianSantri" ADD COLUMN "juzDari" INTEGER;
ALTER TABLE "UjianSantri" ADD COLUMN "juzSampai" INTEGER;

-- Make komponenPenilaianId nullable in NilaiUjian for UAS support
ALTER TABLE "NilaiUjian" ALTER COLUMN "komponenPenilaianId" DROP NOT NULL;

-- Add urutan field to NilaiUjian for UAS page ordering
ALTER TABLE "NilaiUjian" ADD COLUMN "urutan" INTEGER;

-- Drop the unique constraint on ujianSantriId and komponenPenilaianId
ALTER TABLE "NilaiUjian" DROP CONSTRAINT IF EXISTS "NilaiUjian_ujianSantriId_komponenPenilaianId_key";