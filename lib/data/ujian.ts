import { cache } from 'react';
import { prisma } from '@/lib/database/prisma';

export const getGuruUjianList = cache(async (guruId: number, search?: string, filterJenis?: string, filterStatus?: string) => {
  let ujianList = await prisma.ujianSantri.findMany({
    where: { guruId },
    include: {
      santri: {
        select: { id: true, namaLengkap: true, username: true, foto: true }
      },
      templateUjian: {
        select: { namaTemplate: true, jenisUjian: true }
      }
    },
    orderBy: { tanggalUjian: 'desc' }
  });

  const santriIds = [...new Set(ujianList.map(u => u.santriId))];
  const halaqahSantri = await prisma.halaqahSantri.findMany({
    where: { santriId: { in: santriIds } },
    include: { halaqah: true }
  });
  const halaqahMap = new Map<number, string>();
  for (const hs of halaqahSantri) {
    if (hs.halaqah?.namaHalaqah) {
      halaqahMap.set(hs.santriId, hs.halaqah.namaHalaqah);
    }
  }

  let data = ujianList.map(ujian => ({
    id: ujian.id,
    santriId: ujian.santriId,
    santriNama: ujian.santri?.namaLengkap,
    santriUsername: ujian.santri?.username,
    halaqah: halaqahMap.get(ujian.santriId),
    jenisUjian: ujian.jenisUjianLabel || ujian.templateUjian?.namaTemplate,
    nilaiAkhir: ujian.nilaiAkhir,
    tanggalUjian: ujian.tanggalUjian.toISOString(),
    statusUjian: ujian.statusUjian,
    status: ujian.statusUjian,
    keterangan: ujian.catatanGuru,
    catatan: ujian.nilaiDetail ? JSON.stringify(ujian.nilaiDetail) : undefined,
    juzRange: ujian.juzDari && ujian.juzSampai ? `${ujian.juzDari}-${ujian.juzSampai}` : '-',
    santri: ujian.santri,
    templateUjian: ujian.templateUjian
  }));

  // Apply filters in-memory if provided
  if (search) {
    const s = search.toLowerCase();
    data = data.filter(u => 
      (u.santriNama || '').toLowerCase().includes(s) ||
      (u.santriUsername || '').toLowerCase().includes(s) ||
      (u.halaqah || '').toLowerCase().includes(s) ||
      (u.jenisUjian || '').toLowerCase().includes(s)
    );
  }

  if (filterJenis && filterJenis !== 'all') {
    data = data.filter(u => u.jenisUjian === filterJenis || u.templateUjian?.jenisUjian === filterJenis);
  }

  if (filterStatus && filterStatus !== 'all') {
    data = data.filter(u => u.statusUjian === filterStatus);
  }

  return data;
});
