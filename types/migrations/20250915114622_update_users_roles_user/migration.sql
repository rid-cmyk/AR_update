/*
  Warnings:

  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Guru` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Ortu` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OrtuAnak` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Profile` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Santri` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Yayasan` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `namaLengkap` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `roleId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Absensi" DROP CONSTRAINT "Absensi_santriId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Guru" DROP CONSTRAINT "Guru_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Hafalan" DROP CONSTRAINT "Hafalan_santriId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Halaqah" DROP CONSTRAINT "Halaqah_guruId_fkey";

-- DropForeignKey
ALTER TABLE "public"."HalaqahSantri" DROP CONSTRAINT "HalaqahSantri_santriId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Ortu" DROP CONSTRAINT "Ortu_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."OrtuAnak" DROP CONSTRAINT "OrtuAnak_ortuId_fkey";

-- DropForeignKey
ALTER TABLE "public"."OrtuAnak" DROP CONSTRAINT "OrtuAnak_santriId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Prestasi" DROP CONSTRAINT "Prestasi_santriId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Profile" DROP CONSTRAINT "Profile_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Santri" DROP CONSTRAINT "Santri_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TargetHafalan" DROP CONSTRAINT "TargetHafalan_santriId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Ujian" DROP CONSTRAINT "Ujian_santriId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Yayasan" DROP CONSTRAINT "Yayasan_userId_fkey";

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "role",
ADD COLUMN     "foto" TEXT,
ADD COLUMN     "namaLengkap" TEXT NOT NULL,
ADD COLUMN     "noTlp" TEXT,
ADD COLUMN     "roleId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "public"."Guru";

-- DropTable
DROP TABLE "public"."Ortu";

-- DropTable
DROP TABLE "public"."OrtuAnak";

-- DropTable
DROP TABLE "public"."Profile";

-- DropTable
DROP TABLE "public"."Santri";

-- DropTable
DROP TABLE "public"."Yayasan";

-- DropEnum
DROP TYPE "public"."Role";

-- CreateTable
CREATE TABLE "public"."Role" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "public"."Role"("name");

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "public"."Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Halaqah" ADD CONSTRAINT "Halaqah_guruId_fkey" FOREIGN KEY ("guruId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."HalaqahSantri" ADD CONSTRAINT "HalaqahSantri_santriId_fkey" FOREIGN KEY ("santriId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Hafalan" ADD CONSTRAINT "Hafalan_santriId_fkey" FOREIGN KEY ("santriId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TargetHafalan" ADD CONSTRAINT "TargetHafalan_santriId_fkey" FOREIGN KEY ("santriId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Absensi" ADD CONSTRAINT "Absensi_santriId_fkey" FOREIGN KEY ("santriId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Prestasi" ADD CONSTRAINT "Prestasi_santriId_fkey" FOREIGN KEY ("santriId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Ujian" ADD CONSTRAINT "Ujian_santriId_fkey" FOREIGN KEY ("santriId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
