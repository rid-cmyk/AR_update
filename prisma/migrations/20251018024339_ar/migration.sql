/*
  Warnings:

  - Added the required column `createdBy` to the `Pengumuman` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Pengumuman` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TargetAudience" AS ENUM ('semua', 'guru', 'santri', 'admin');

-- AlterTable
ALTER TABLE "Pengumuman" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "createdBy" INTEGER NOT NULL,
ADD COLUMN     "tanggalKadaluarsa" TIMESTAMP(3),
ADD COLUMN     "targetAudience" "TargetAudience" NOT NULL DEFAULT 'semua',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "tanggal" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Prestasi" ADD COLUMN     "validated" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Raport" ADD COLUMN     "validated" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "alamat" TEXT;

-- CreateTable
CREATE TABLE "PengumumanRead" (
    "id" SERIAL NOT NULL,
    "pengumumanId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "dibacaPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PengumumanRead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrangTuaSantri" (
    "id" SERIAL NOT NULL,
    "orangTuaId" INTEGER NOT NULL,
    "santriId" INTEGER NOT NULL,

    CONSTRAINT "OrangTuaSantri_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PengumumanRead_pengumumanId_userId_key" ON "PengumumanRead"("pengumumanId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "OrangTuaSantri_orangTuaId_santriId_key" ON "OrangTuaSantri"("orangTuaId", "santriId");

-- AddForeignKey
ALTER TABLE "Pengumuman" ADD CONSTRAINT "Pengumuman_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PengumumanRead" ADD CONSTRAINT "PengumumanRead_pengumumanId_fkey" FOREIGN KEY ("pengumumanId") REFERENCES "Pengumuman"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PengumumanRead" ADD CONSTRAINT "PengumumanRead_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrangTuaSantri" ADD CONSTRAINT "OrangTuaSantri_orangTuaId_fkey" FOREIGN KEY ("orangTuaId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrangTuaSantri" ADD CONSTRAINT "OrangTuaSantri_santriId_fkey" FOREIGN KEY ("santriId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
