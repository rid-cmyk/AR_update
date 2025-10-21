-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('admin', 'guru', 'santri', 'ortu', 'yayasan');

-- CreateEnum
CREATE TYPE "public"."Semester" AS ENUM ('S1', 'S2');

-- CreateEnum
CREATE TYPE "public"."StatusHafalan" AS ENUM ('ziyadah', 'murojaah');

-- CreateEnum
CREATE TYPE "public"."StatusTarget" AS ENUM ('belum', 'proses', 'selesai');

-- CreateEnum
CREATE TYPE "public"."Hari" AS ENUM ('Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu');

-- CreateEnum
CREATE TYPE "public"."StatusAbsensi" AS ENUM ('alpha', 'izin', 'masuk');

-- CreateEnum
CREATE TYPE "public"."JenisUjian" AS ENUM ('tahfidz', 'tasmi', 'lainnya');

-- CreateEnum
CREATE TYPE "public"."NotifType" AS ENUM ('user', 'hafalan', 'rapot', 'absensi', 'pengumuman');

-- CreateEnum
CREATE TYPE "public"."RefType" AS ENUM ('guru', 'halaqah', 'santri');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "public"."Role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Profile" (
    "id" SERIAL NOT NULL,
    "namaLengkap" TEXT NOT NULL,
    "foto" TEXT,
    "noTlp" TEXT,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Santri" (
    "id" SERIAL NOT NULL,
    "angkatan" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Santri_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Ortu" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Ortu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OrtuAnak" (
    "id" SERIAL NOT NULL,
    "ortuId" INTEGER NOT NULL,
    "santriId" INTEGER NOT NULL,

    CONSTRAINT "OrtuAnak_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Guru" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Guru_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Yayasan" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Yayasan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Halaqah" (
    "id" SERIAL NOT NULL,
    "namaHalaqah" TEXT NOT NULL,
    "guruId" INTEGER NOT NULL,

    CONSTRAINT "Halaqah_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."HalaqahSantri" (
    "id" SERIAL NOT NULL,
    "tahunAkademik" TEXT NOT NULL,
    "semester" "public"."Semester" NOT NULL,
    "halaqahId" INTEGER NOT NULL,
    "santriId" INTEGER NOT NULL,

    CONSTRAINT "HalaqahSantri_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Hafalan" (
    "id" SERIAL NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "surat" TEXT NOT NULL,
    "ayatMulai" INTEGER NOT NULL,
    "ayatSelesai" INTEGER NOT NULL,
    "status" "public"."StatusHafalan" NOT NULL,
    "keterangan" TEXT,
    "santriId" INTEGER NOT NULL,

    CONSTRAINT "Hafalan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TargetHafalan" (
    "id" SERIAL NOT NULL,
    "surat" TEXT NOT NULL,
    "ayatTarget" INTEGER NOT NULL,
    "deadline" TIMESTAMP(3) NOT NULL,
    "status" "public"."StatusTarget" NOT NULL,
    "santriId" INTEGER NOT NULL,

    CONSTRAINT "TargetHafalan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Jadwal" (
    "id" SERIAL NOT NULL,
    "hari" "public"."Hari" NOT NULL,
    "jamMulai" TIMESTAMP(3) NOT NULL,
    "jamSelesai" TIMESTAMP(3) NOT NULL,
    "halaqahId" INTEGER NOT NULL,

    CONSTRAINT "Jadwal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Absensi" (
    "id" SERIAL NOT NULL,
    "status" "public"."StatusAbsensi" NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "santriId" INTEGER NOT NULL,
    "jadwalId" INTEGER NOT NULL,

    CONSTRAINT "Absensi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Prestasi" (
    "id" SERIAL NOT NULL,
    "namaPrestasi" TEXT NOT NULL,
    "keterangan" TEXT,
    "kategori" TEXT,
    "tahun" INTEGER NOT NULL,
    "santriId" INTEGER NOT NULL,

    CONSTRAINT "Prestasi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Raport" (
    "id" SERIAL NOT NULL,
    "semester" "public"."Semester" NOT NULL,
    "tahunAkademik" TEXT NOT NULL,

    CONSTRAINT "Raport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RaportDetail" (
    "id" SERIAL NOT NULL,
    "nilaiAkhir" DOUBLE PRECISION NOT NULL,
    "catatan" TEXT,
    "tanggalCetak" TIMESTAMP(3) NOT NULL,
    "raportId" INTEGER NOT NULL,

    CONSTRAINT "RaportDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Ujian" (
    "id" SERIAL NOT NULL,
    "jenis" "public"."JenisUjian" NOT NULL,
    "nilai" DOUBLE PRECISION NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "keterangan" TEXT,
    "santriId" INTEGER NOT NULL,
    "halaqahId" INTEGER NOT NULL,
    "raportId" INTEGER NOT NULL,

    CONSTRAINT "Ujian_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Notifikasi" (
    "id" SERIAL NOT NULL,
    "pesan" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" "public"."NotifType" NOT NULL,
    "refId" INTEGER,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Notifikasi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Grafik" (
    "id" SERIAL NOT NULL,
    "tipeGrafik" TEXT NOT NULL,
    "periode" TEXT NOT NULL,
    "dataJson" JSONB NOT NULL,
    "refId" INTEGER,
    "refType" "public"."RefType" NOT NULL,

    CONSTRAINT "Grafik_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Backup" (
    "id" SERIAL NOT NULL,
    "namaFile" TEXT NOT NULL,
    "tanggalBackup" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Backup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AuditLog" (
    "id" SERIAL NOT NULL,
    "action" TEXT NOT NULL,
    "keterangan" TEXT,
    "tanggal" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Pengumuman" (
    "id" SERIAL NOT NULL,
    "judul" TEXT NOT NULL,
    "isi" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pengumuman_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "public"."User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "public"."Profile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Santri_userId_key" ON "public"."Santri"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Ortu_userId_key" ON "public"."Ortu"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Guru_userId_key" ON "public"."Guru"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Yayasan_userId_key" ON "public"."Yayasan"("userId");

-- AddForeignKey
ALTER TABLE "public"."Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Santri" ADD CONSTRAINT "Santri_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Ortu" ADD CONSTRAINT "Ortu_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrtuAnak" ADD CONSTRAINT "OrtuAnak_ortuId_fkey" FOREIGN KEY ("ortuId") REFERENCES "public"."Ortu"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrtuAnak" ADD CONSTRAINT "OrtuAnak_santriId_fkey" FOREIGN KEY ("santriId") REFERENCES "public"."Santri"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Guru" ADD CONSTRAINT "Guru_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Yayasan" ADD CONSTRAINT "Yayasan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Halaqah" ADD CONSTRAINT "Halaqah_guruId_fkey" FOREIGN KEY ("guruId") REFERENCES "public"."Guru"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."HalaqahSantri" ADD CONSTRAINT "HalaqahSantri_halaqahId_fkey" FOREIGN KEY ("halaqahId") REFERENCES "public"."Halaqah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."HalaqahSantri" ADD CONSTRAINT "HalaqahSantri_santriId_fkey" FOREIGN KEY ("santriId") REFERENCES "public"."Santri"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Hafalan" ADD CONSTRAINT "Hafalan_santriId_fkey" FOREIGN KEY ("santriId") REFERENCES "public"."Santri"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TargetHafalan" ADD CONSTRAINT "TargetHafalan_santriId_fkey" FOREIGN KEY ("santriId") REFERENCES "public"."Santri"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Jadwal" ADD CONSTRAINT "Jadwal_halaqahId_fkey" FOREIGN KEY ("halaqahId") REFERENCES "public"."Halaqah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Absensi" ADD CONSTRAINT "Absensi_santriId_fkey" FOREIGN KEY ("santriId") REFERENCES "public"."Santri"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Absensi" ADD CONSTRAINT "Absensi_jadwalId_fkey" FOREIGN KEY ("jadwalId") REFERENCES "public"."Jadwal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Prestasi" ADD CONSTRAINT "Prestasi_santriId_fkey" FOREIGN KEY ("santriId") REFERENCES "public"."Santri"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RaportDetail" ADD CONSTRAINT "RaportDetail_raportId_fkey" FOREIGN KEY ("raportId") REFERENCES "public"."Raport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Ujian" ADD CONSTRAINT "Ujian_santriId_fkey" FOREIGN KEY ("santriId") REFERENCES "public"."Santri"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Ujian" ADD CONSTRAINT "Ujian_halaqahId_fkey" FOREIGN KEY ("halaqahId") REFERENCES "public"."Halaqah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Ujian" ADD CONSTRAINT "Ujian_raportId_fkey" FOREIGN KEY ("raportId") REFERENCES "public"."Raport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notifikasi" ADD CONSTRAINT "Notifikasi_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
