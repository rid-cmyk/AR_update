import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/database/prisma";
import { getGuruAbsensiData } from "@/lib/services/absensi";
import { redirect } from "next/navigation";
import dayjs from "dayjs";
import AbsensiClient from "./AbsensiClient";

export const dynamic = "force-dynamic";

export default async function AbsensiGuruPage() {
  const { user } = await getAuthUser();
  
  if (!user || user.role.name !== "guru") {
    redirect("/login");
  }

  const todayStr = dayjs().format("YYYY-MM-DD");
  
  // 1. Fetch initial absensi data for today
  const absensiData = await getGuruAbsensiData(user.id, todayStr);

  // 2. Fetch halaqah list for this guru
  const halaqahList = await prisma.halaqah.findMany({
    where: { guruId: user.id },
    select: {
      id: true,
      namaHalaqah: true,
      _count: {
        select: {
          santri: true,
        },
      },
    },
  });

  const formattedHalaqahList = halaqahList.map((h) => ({
    id: h.id,
    namaHalaqah: h.namaHalaqah,
    jumlahSantri: h._count.santri,
  }));

  return (
    <AbsensiClient
      initialJadwals={absensiData.jadwals}
      initialAbsensi={absensiData.absensi}
      initialSummary={absensiData.summary}
      initialHalaqahList={formattedHalaqahList}
    />
  );
}