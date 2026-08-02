-- =============================================================
-- MERGE REFACTOR: 28 tabel -> 24 tabel (Fase A+B)
-- Dijalankan manual via db push + script migrasi, bukan prisma migrate.
-- Urutan eksekusi aktual: ALTER di bawah -> scripts/migrate-*.js -> prisma db push.
-- =============================================================

-- 1) UjianGuru -> UjianSantri (kolom baru pada tabel target)
ALTER TABLE "UjianSantri" ADD COLUMN IF NOT EXISTS "guruId" INTEGER;
ALTER TABLE "UjianSantri" ADD COLUMN IF NOT EXISTS "jenisUjianLabel" TEXT;
ALTER TABLE "UjianSantri" ADD COLUMN IF NOT EXISTS "nilaiDetail" JSONB;
ALTER TABLE "UjianSantri" ADD COLUMN IF NOT EXISTS "pengaturan" JSONB;
CREATE INDEX IF NOT EXISTS "UjianSantri_guruId_idx" ON "UjianSantri"("guruId");

-- 2) KomponenPenilaianJenis -> KomponenPenilaian (tambah kolom, templateUjianId jadi opsional)
ALTER TABLE "KomponenPenilaian" ADD COLUMN IF NOT EXISTS "jenisUjianId" INTEGER;
ALTER TABLE "KomponenPenilaian" ALTER COLUMN "templateUjianId" DROP NOT NULL;

-- 3) Backup -> AuditLog (tidak butuh ALTER; dipetakan ke action 'BACKUP', nama file di keterangan)

-- 4) Grafik + enum RefType dihapus tanpa migrasi data.

-- Script migrasi data (sudah dijalankan sebelum db push):
--   scripts/migrate-backup-to-auditlog.js  -> AuditLog action='BACKUP' (0 baris di dev)
--   scripts/migrate-komponen.js            -> KomponenPenilaianJenis -> KomponenPenilaian (3 baris)
--   scripts/migrate-ujian-guru.js          -> UjianGuru -> UjianSantri (0 baris di dev)
--   lalu: npx prisma db push --accept-data-loss (drop tabel lama, buat ulang dari schema.prisma)
