import { prisma } from "@/lib/database/prisma";
import JadwalClient from "./JadwalClient";
import dayjs from "dayjs";

export const dynamic = "force-dynamic";

export default async function AdminJadwalPage() {
  // 1. Fetch jadwal data with optimized select
  const jadwal = await prisma.jadwal.findMany({
    select: {
      id: true,
      hari: true,
      jamMulai: true,
      jamSelesai: true,
      isTemplate: true,
      tanggalMulai: true,
      tanggalSelesai: true,
      isActive: true,
      halaqah: {
        select: {
          id: true,
          namaHalaqah: true,
          guru: {
            select: {
              id: true,
              namaLengkap: true,
            },
          },
          _count: {
            select: {
              santri: true,
            },
          },
        },
      },
    },
    orderBy: [{ hari: "asc" }, { jamMulai: "asc" }],
  });

  const initialJadwal = jadwal.map((j) => ({
    id: j.id,
    hari: j.hari,
    jamMulai: j.jamMulai,
    jamSelesai: j.jamSelesai,
    isTemplate: j.isTemplate,
    tanggalMulai: j.tanggalMulai,
    tanggalSelesai: j.tanggalSelesai,
    isActive: j.isActive,
    halaqah: {
      id: j.halaqah.id,
      namaHalaqah: j.halaqah.namaHalaqah,
      guru: j.halaqah.guru,
      jumlahSantri: j.halaqah._count.santri,
    },
  }));

  // 2. Fetch active halaqah data
  const halaqah = await prisma.halaqah.findMany({
    select: {
      id: true,
      namaHalaqah: true,
    },
    orderBy: {
      namaHalaqah: "asc",
    },
  });

  // Count this week's jadwal (basic counting logic)
  const currentDay = dayjs().format("dddd");
  let thisWeekCount = 0;
  
  // Mapping standard JS days to Indonesian days used in DB
  const dayMap: Record<number, string> = {
    0: "Minggu",
    1: "Senin",
    2: "Selasa",
    3: "Rabu",
    4: "Kamis",
    5: "Jumat",
    6: "Sabtu"
  };
  
  const todayIndo = dayMap[dayjs().day()] || currentDay;
  
  thisWeekCount = initialJadwal.filter(j => j.hari === todayIndo).length;

  return (
    <JadwalClient
      initialJadwal={initialJadwal}
      halaqahList={halaqah}
      thisWeekCount={thisWeekCount}
    />
  );
}