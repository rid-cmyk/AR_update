import { prisma } from '@/lib/database/prisma';
import { JUZ_MAPPING, JuzMapping } from '@/utils/juz-mapping';

export interface AuthUser {
  id: number;
  namaLengkap: string;
  role: { name: string };
}

export class GuruSantriServiceError extends Error {
  constructor(message: string, public statusCode: number = 500) {
    super(message);
    this.name = 'GuruSantriServiceError';
  }
}

function getJuzForHafalan(surat: string, ayatSelesai: number): number {
  const norm = (s: string) => s.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();
  const suratNorm = norm(surat);
  let best: JuzMapping | null = null;
  for (const m of JUZ_MAPPING) {
    if (norm(m.suratName) !== suratNorm) continue;
    if (ayatSelesai >= m.ayatMulai && ayatSelesai <= m.ayatSelesai) {
      best = m;
      break;
    }
    if (!best || m.juzNumber > best.juzNumber) best = m;
  }
  return best?.juzNumber || 0;
}

export class GuruSantriService {
  static async getHalaqahGuruForYayasan() {
    const halaqahList = await prisma.halaqah.findMany({
      where: { guruId: { not: null } },
      select: {
        id: true,
        namaHalaqah: true,
        guruId: true,
        guru: { select: { id: true, namaLengkap: true, noTlp: true } },
        _count: { select: { santri: true } },
      },
      orderBy: { namaHalaqah: "asc" },
    });

    return halaqahList
      .filter((h) => h.guru !== null)
      .map((h) => ({
        halaqahId: h.id,
        namaHalaqah: h.namaHalaqah,
        guruId: h.guru!.id,
        namaGuru: h.guru!.namaLengkap,
        noTlp: h.guru!.noTlp,
        jumlahSantri: h._count.santri,
      }));
  }

  static async getDetail(user: AuthUser, santriId: number) {
    if (!['guru', 'super_admin'].includes(user.role.name)) {
      throw new GuruSantriServiceError('Access denied', 403);
    }

    const halaqahSantri = await prisma.halaqahSantri.findFirst({
      where: {
        santriId,
        ...(user.role.name === 'guru' ? { halaqah: { guruId: user.id } } : {})
      },
      include: {
        santri: { include: { role: true } },
        halaqah: { select: { id: true, namaHalaqah: true } }
      },
      orderBy: { id: 'desc' }
    });

    if (!halaqahSantri) {
      throw new GuruSantriServiceError('Santri tidak ditemukan dalam halaqah Anda', 404);
    }

    const latestHafalan = await prisma.hafalan.findFirst({
      where: { santriId },
      orderBy: { tanggal: 'desc' },
      select: { surat: true, ayatSelesai: true }
    });

    const juzTerakhir = getJuzForHafalan(latestHafalan?.surat || '', latestHafalan?.ayatSelesai || 0);
    const halamanTerakhir = 0;
    const progress = Math.min(100, (juzTerakhir / 30) * 100);
    const jumlahHafalan = await prisma.hafalan.count({ where: { santriId } });

    return {
      id: String(halaqahSantri.santri.id),
      nama: halaqahSantri.santri.namaLengkap,
      namaLengkap: halaqahSantri.santri.namaLengkap,
      username: halaqahSantri.santri.username,
      kelas: halaqahSantri.halaqah.namaHalaqah,
      halaqah: halaqahSantri.halaqah.namaHalaqah,
      halaqahId: halaqahSantri.halaqah.id,
      juzTerakhir,
      halamanTerakhir,
      progress,
      jumlahHafalan,
      status: 'aktif'
    };
  }

  static async getByHalaqah(user: AuthUser) {
    if (user.role.name !== 'guru') throw new GuruSantriServiceError('Access denied - Hanya guru yang dapat mengakses endpoint ini', 403);

    const halaqahList = await prisma.halaqah.findMany({
      where: { guruId: user.id },
      include: { guru: { select: { id: true, namaLengkap: true, username: true } } }
    });

    if (halaqahList.length === 0) return null;

    const halaqahIds = halaqahList.map(h => h.id);

    const halaqahSantriList = await prisma.halaqahSantri.findMany({
      where: { halaqahId: { in: halaqahIds } },
      include: {
        santri: { include: { role: true } },
        semester: { include: { tahunAjaran: true } },
        halaqah: { include: { guru: { select: { id: true, namaLengkap: true, username: true } } } }
      },
      orderBy: { santri: { namaLengkap: 'asc' } }
    });

    const transformedSantri = halaqahSantriList.map((hs) => ({
      id: hs.santri.id,
      namaLengkap: hs.santri.namaLengkap,
      username: hs.santri.username,
      email: hs.santri.email,
      tahunAjaran: hs.semester?.tahunAjaran ? {
        id: hs.semester.tahunAjaran.id,
        namaLengkap: hs.semester.tahunAjaran.namaLengkap,
        semester: hs.semester.namaSemester
      } : null,
      halaqah: {
        id: hs.halaqah.id,
        namaHalaqah: hs.halaqah.namaHalaqah,
        guru: hs.halaqah.guru ? {
          id: hs.halaqah.guru.id,
          namaLengkap: hs.halaqah.guru.namaLengkap,
          username: hs.halaqah.guru.username
        } : null
      }
    }));

    const byHalaqah = transformedSantri.reduce((acc: any, santri) => {
      const halaqahName = santri.halaqah?.namaHalaqah || 'Tidak ada halaqah';
      if (!acc[halaqahName]) {
        acc[halaqahName] = { halaqah: santri.halaqah, santri: [] };
      }
      acc[halaqahName].santri.push(santri);
      return acc;
    }, {});

    return {
      santriList: transformedSantri,
      byHalaqah,
      halaqahList: halaqahList.map(h => ({ id: h.id, namaHalaqah: h.namaHalaqah, guru: h.guru })),
      summary: {
        totalSantri: transformedSantri.length,
        totalHalaqah: Object.keys(byHalaqah).length,
        santriPerHalaqah: Object.values(byHalaqah).map((h: any) => ({
          halaqah: h.halaqah?.namaHalaqah || 'Tidak ada halaqah',
          guru: h.halaqah?.guru?.namaLengkap || 'Tidak ada guru',
          jumlahSantri: h.santri.length
        }))
      }
    };
  }
}
