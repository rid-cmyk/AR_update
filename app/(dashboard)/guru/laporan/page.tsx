import { getAuthUser, getGuruSantriIds } from "@/lib/auth";
import { prisma } from "@/lib/database/prisma";
import { redirect } from "next/navigation";
import LaporanClient from "./LaporanClient";

export const dynamic = "force-dynamic";

export default async function GuruLaporanPage() {
  const { user } = await getAuthUser();
  if (!user || user.role.name !== "guru") {
    redirect("/login");
  }

  // 1. Get all santri under this guru
  const santriIds = await getGuruSantriIds(user.id);
  const totalSantri = santriIds.length;

  // 2. Get ujian statistics
  const ujianSelesai = await prisma.ujianSantri.findMany({
    where: { 
      createdBy: user.id 
    },
    select: { 
      nilaiAkhir: true 
    }
  });

  const totalUjian = ujianSelesai.length;
  const sumNilai = ujianSelesai.reduce((sum, u) => sum + (u.nilaiAkhir || 0), 0);
  const rataRataNilai = totalUjian > 0 ? (sumNilai / totalUjian).toFixed(1) : 0;

  // 3. Get hafalan progress
  const totalHafalan = await prisma.hafalan.count({
    where: { santriId: { in: santriIds } }
  });

  // Calculate hafalan rate (assuming 30 juz target per santri)
  const rawHafalanRate = totalSantri > 0 ? Math.round((totalHafalan / (totalSantri * 30)) * 100) : 0;
  const hafalanRate = Math.min(rawHafalanRate, 100);

  const stats = {
    totalUjian,
    rataRataNilai,
    totalSantri,
    hafalanRate
  };

  return (
    <LaporanClient initialStats={stats} />
  );
}