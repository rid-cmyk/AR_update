import { prisma } from "@/lib/database/prisma";

export async function getGuruAbsensiData(userId: number, tanggalStr: string) {
  // Get guru's own halaqah
  const ownHalaqahs = await prisma.halaqah.findMany({
    where: { guruId: userId },
    select: { id: true },
  });

  const halaqahIds = ownHalaqahs.map((h) => h.id);

  if (halaqahIds.length === 0) {
    return {
      jadwals: [],
      absensi: [],
      summary: {
        totalJadwal: 0,
        totalSantri: 0,
        hadir: 0,
        izin: 0,
        alpha: 0,
        belumAbsen: 0,
      },
    };
  }

  const targetDate = new Date(tanggalStr);
  const dayNames = [
    "Minggu",
    "Senin",
    "Selasa",
    "Rabu",
    "Kamis",
    "Jumat",
    "Sabtu",
  ];
  const hari = dayNames[targetDate.getDay()];

  const jadwals = await prisma.jadwal.findMany({
    where: {
      halaqahId: { in: halaqahIds },
      hari: hari as any,
      isActive: true,
    },
    include: {
      halaqah: {
        include: {
          guru: {
            select: {
              id: true,
              namaLengkap: true,
            },
          },
          santri: {
            include: {
              santri: {
                select: {
                  id: true,
                  namaLengkap: true,
                  username: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: {
      jamMulai: "asc",
    },
  });

  if (jadwals.length === 0) {
    return {
      jadwals: [],
      absensi: [],
      summary: {
        totalJadwal: 0,
        totalSantri: 0,
        hadir: 0,
        izin: 0,
        alpha: 0,
        belumAbsen: 0,
      },
    };
  }

  const existingAbsensi = await prisma.absensi.findMany({
    where: {
      jadwalId: { in: jadwals.map((j) => j.id) },
      tanggal: {
        gte: new Date(tanggalStr + "T00:00:00.000Z"),
        lt: new Date(tanggalStr + "T23:59:59.999Z"),
      },
    },
    include: {
      santri: {
        select: {
          id: true,
          namaLengkap: true,
          username: true,
        },
      },
      jadwal: {
        include: {
          halaqah: {
            select: {
              id: true,
              namaHalaqah: true,
            },
          },
        },
      },
    },
  });

  const completeAbsensi: any[] = [];
  let totalSantri = 0;
  let hadir = 0;
  let izin = 0;
  let alpha = 0;

  for (const jadwal of jadwals as any[]) {
    for (const halaqahSantri of jadwal.halaqah.santri) {
      totalSantri++;

      const existingRecord = existingAbsensi.find(
        (a) => a.santriId === halaqahSantri.santriId && a.jadwalId === jadwal.id
      );

      if (existingRecord) {
        completeAbsensi.push(existingRecord);
        switch (existingRecord.status) {
          case "masuk":
            hadir++;
            break;
          case "izin":
            izin++;
            break;
          case "alpha":
            alpha++;
            break;
        }
      } else {
        const placeholder = {
          id: null,
          santriId: halaqahSantri.santriId,
          jadwalId: jadwal.id,
          tanggal: targetDate,
          status: null,
          santri: halaqahSantri.santri,
          jadwal: {
            id: jadwal.id,
            hari: jadwal.hari,
            jamMulai: jadwal.jamMulai,
            jamSelesai: jadwal.jamSelesai,
            halaqah: {
              id: jadwal.halaqah.id,
              namaHalaqah: jadwal.halaqah.namaHalaqah,
            },
          },
        };
        completeAbsensi.push(placeholder);
      }
    }
  }

  const formattedJadwals = jadwals.map((jadwal) => ({
    id: jadwal.id,
    hari: jadwal.hari,
    jamMulai: jadwal.jamMulai.toTimeString().slice(0, 5),
    jamSelesai: jadwal.jamSelesai.toTimeString().slice(0, 5),
    halaqah: {
      id: jadwal.halaqah.id,
      namaHalaqah: jadwal.halaqah.namaHalaqah,
      guru: jadwal.halaqah.guru,
      jumlahSantri: jadwal.halaqah.santri.length,
    },
  }));

  return {
    jadwals: formattedJadwals,
    absensi: completeAbsensi,
    summary: {
      totalJadwal: jadwals.length,
      totalSantri: totalSantri,
      hadir: hadir,
      izin: izin,
      alpha: alpha,
      belumAbsen: totalSantri - hadir - izin - alpha,
    },
  };
}
