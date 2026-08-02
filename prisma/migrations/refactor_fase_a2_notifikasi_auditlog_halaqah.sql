-- =============================================================
-- Refactor Fase A2 (feedback ChatGPT ronde 2, yang disetujui):
-- Notifikasi read-status, AuditLog metadata, HalaqahSantri FK tahun ajaran
-- =============================================================
-- 1) Notifikasi.isRead / readAt
--    Sebelumnya mark_read di PATCH /api/notifikasi/[id] adalah NO-OP
--    ("we don't have a read status field") dan /api/notifications/count
--    menghitung SEMUA notifikasi. Sekarang kolom dipakai; count = unread saja.
-- 2) AuditLog.ipAddress / userAgent / module
--    Kolom nullable; diisi di LOGIN, BACKUP, DATABASE_IMPORT/EXPORT,
--    UPDATE_PROFILE, dan module BACKUP_CRON untuk cron backup.
-- 3) HalaqahSantri: drop tahunAkademik (string) + semester (enum),
--    tambah tahunAjaranId FK -> TahunAjaran.
--    Data lama (5 baris "2026"/S2) di-backup lalu di-backfill ke
--    TahunAjaran aktif (id=1, 2026/2027 Semester 1).
-- Diterapkan via: npx prisma db push --accept-data-loss
-- (bukan prisma migrate; prisma/migrations hanya berisi SQL dokumentasi)

-- Referensi perubahannya (sudah diterapkan oleh db push):
ALTER TABLE "HalaqahSantri" DROP COLUMN IF EXISTS "tahunAkademik";
ALTER TABLE "HalaqahSantri" DROP COLUMN IF EXISTS "semester";
ALTER TABLE "HalaqahSantri" ADD COLUMN IF NOT EXISTS "tahunAjaranId" INTEGER;
