-- =============================================================
-- DROP NilaiUjian (dead table, 25 tabel -> 24 tabel)
-- =============================================================
-- Tabel NilaiUjian TIDAK PERNAH ditulis oleh aplikasi (0 write path;
-- payload nilaiUjian dari komponen dialog lama di-ignore oleh endpoint).
-- Skor ujian yang nyata disimpan di UjianSantri.nilaiDetail (JSON,
-- granularitas per-juz/per-halaman/per-soal). Normalisasi penuh ke
-- NilaiUjian tidak cocok dengan granularitas heterogen tersebut.
-- Dihapus via: npx prisma db push --accept-data-loss

DROP TABLE IF EXISTS "NilaiUjian";
