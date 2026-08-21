import { prisma } from '@/lib/database/prisma';
import { type AuthUser } from '@/lib/auth';
import { getCurrentTahunAkademik, getTahunAkademikRange, type TahunAkademikInfo } from '@/lib/tahun-akademik-utils';
import { getActiveTahunAkademik } from '@/lib/tahun-akademik-middleware';

function groupByTahunAjaran(list: TahunAkademikInfo[]): TahunAkademikInfo[] {
  return [...new Map(list.map((item) => [`${item.tahunMulai}-${item.tahunSelesai}`, item])).values()];
}

async function createSemesters(tahunAjaranId: number, tahunMulai: number, tahunSelesai: number, userId: number) {
  await prisma.semester.createMany({
    data: [
      { tahunAjaranId, namaSemester: 'Semester 1 Ganjil', semesterUrutan: 1, tanggalMulai: new Date(`${tahunMulai}-07-01`), tanggalSelesai: new Date(`${tahunMulai}-12-31`), isActive: false, createdBy: userId },
      { tahunAjaranId, namaSemester: 'Semester 2 Genap', semesterUrutan: 2, tanggalMulai: new Date(`${tahunSelesai}-01-01`), tanggalSelesai: new Date(`${tahunSelesai}-06-30`), isActive: false, createdBy: userId }
    ]
  });
}

export class TahunAkademikService {
  static async list() {
    const tahunAjaran = await prisma.tahunAjaran.findMany({
      include: {
        creator: { select: { id: true, namaLengkap: true, username: true } },
        semesters: { orderBy: { semesterUrutan: 'asc' } },
        _count: { select: { templateUjian: true, templateRaport: true, ujianSantri: true, raportSantri: true } }
      },
      orderBy: [{ tahunMulai: 'desc' }]
    });
    const currentTahunAkademik = getCurrentTahunAkademik();
    const activeTahunAkademik = await getActiveTahunAkademik();
    return { data: tahunAjaran, meta: { total: tahunAjaran.length, active: tahunAjaran.find(ta => ta.isActive), current: currentTahunAkademik, activeContext: activeTahunAkademik } };
  }

  static async create(user: AuthUser, data: { tahunMulai: number; tahunSelesai: number; namaLengkap?: string; tanggalMulai: string; tanggalSelesai: string }) {
    const { tahunMulai, tahunSelesai, namaLengkap, tanggalMulai, tanggalSelesai } = data;
    if (!tahunMulai || !tahunSelesai || !tanggalMulai || !tanggalSelesai) throw new TahunAkademikServiceError('Semua field harus diisi', 400);
    if (tahunSelesai <= tahunMulai) throw new TahunAkademikServiceError('Tahun selesai harus lebih besar dari tahun mulai', 400);

    const existing = await prisma.tahunAjaran.findFirst({ where: { tahunMulai, tahunSelesai } });
    if (existing) throw new TahunAkademikServiceError('Tahun akademik dengan periode yang sama sudah ada', 400);

    const finalNamaLengkap = namaLengkap || `${tahunMulai}/${tahunSelesai}`;
    const newTahunAjaran = await prisma.tahunAjaran.create({
      data: { tahunMulai, tahunSelesai, namaLengkap: finalNamaLengkap, tanggalMulai: new Date(tanggalMulai), tanggalSelesai: new Date(tanggalSelesai), isActive: false, createdBy: user.id },
      include: { creator: { select: { id: true, namaLengkap: true, username: true } } }
    });
    await createSemesters(newTahunAjaran.id, newTahunAjaran.tahunMulai, newTahunAjaran.tahunSelesai, user.id);
    return { message: `Tahun akademik ${finalNamaLengkap} beserta Semester 1 & 2 berhasil dibuat`, data: newTahunAjaran };
  }

  static async update(id: number, data: { tahunMulai: number; tahunSelesai: number; tanggalMulai: string; tanggalSelesai: string; namaLengkap?: string }) {
    const { tahunMulai, tahunSelesai, tanggalMulai, tanggalSelesai, namaLengkap } = data;
    if (!tahunMulai || !tahunSelesai || !tanggalMulai || !tanggalSelesai) throw new TahunAkademikServiceError('Semua field harus diisi', 400);
    if (tahunSelesai <= tahunMulai) throw new TahunAkademikServiceError('Tahun selesai harus lebih besar dari tahun mulai', 400);

    const existing = await prisma.tahunAjaran.findFirst({ where: { tahunMulai, tahunSelesai, NOT: { id } } });
    if (existing) throw new TahunAkademikServiceError('Tahun akademik dan semester ini sudah ada', 400);

    const finalNamaLengkap = namaLengkap || `${tahunMulai}/${tahunSelesai}`;
    return prisma.tahunAjaran.update({
      where: { id },
      data: { tahunMulai, tahunSelesai, namaLengkap: finalNamaLengkap, tanggalMulai: new Date(tanggalMulai), tanggalSelesai: new Date(tanggalSelesai) }
    });
  }

  static async delete(id: number) {
    const templateCount = await prisma.templateUjian.count({ where: { tahunAjaranId: id } });
    if (templateCount > 0) throw new TahunAkademikServiceError('Tahun akademik tidak dapat dihapus karena sedang digunakan dalam template ujian', 400);
    await prisma.tahunAjaran.delete({ where: { id } });
    return { message: 'Tahun akademik berhasil dihapus' };
  }

  static async getActive() {
    const activeTahunAkademik = await prisma.tahunAjaran.findFirst({
      where: { isActive: true },
      include: {
        creator: { select: { id: true, namaLengkap: true, username: true } },
        _count: { select: { templateUjian: true, templateRaport: true, ujianSantri: true, raportSantri: true } }
      }
    });
    const currentTahunAkademik = getCurrentTahunAkademik();
    return {
      active: activeTahunAkademik, current: currentTahunAkademik, hasActive: !!activeTahunAkademik,
      isCurrentActive: activeTahunAkademik ? (activeTahunAkademik.tahunMulai === currentTahunAkademik.tahunMulai && activeTahunAkademik.tahunSelesai === currentTahunAkademik.tahunSelesai) : false
    };
  }

  static async setActive(tahunAjaranId: number) {
    const tahunAjaran = await prisma.tahunAjaran.findUnique({ where: { id: tahunAjaranId } });
    if (!tahunAjaran) throw new TahunAkademikServiceError('Tahun ajaran tidak ditemukan', 404);
    await prisma.tahunAjaran.updateMany({ where: { isActive: true }, data: { isActive: false } });
    const updated = await prisma.tahunAjaran.update({
      where: { id: tahunAjaranId }, data: { isActive: true, updatedAt: new Date() },
      include: { creator: { select: { id: true, namaLengkap: true, username: true } } }
    });
    return { message: `Tahun akademik ${updated.namaLengkap} berhasil diaktifkan`, data: updated };
  }

  static async autoGenerate(user: AuthUser, startYear: number, endYear: number, autoSetActive: boolean) {
    if (!startYear || !endYear) throw new TahunAkademikServiceError('startYear dan endYear harus diisi', 400);
    if (startYear > endYear) throw new TahunAkademikServiceError('startYear tidak boleh lebih besar dari endYear', 400);

    const tahunAkademikList = groupByTahunAjaran(getTahunAkademikRange(startYear, endYear));
    const currentTahunAkademik = getCurrentTahunAkademik();
    const createdRecords: any[] = [];
    const skippedRecords: Array<TahunAkademikInfo & { reason: string; id?: number }> = [];

    for (const tahunAkademik of tahunAkademikList) {
      try {
        const existing = await prisma.tahunAjaran.findFirst({ where: { tahunMulai: tahunAkademik.tahunMulai, tahunSelesai: tahunAkademik.tahunSelesai } });
        if (existing) { skippedRecords.push({ ...tahunAkademik, reason: 'Already exists', id: existing.id }); continue; }

        const isCurrentActive = autoSetActive && tahunAkademik.tahunMulai === currentTahunAkademik.tahunMulai && tahunAkademik.tahunSelesai === currentTahunAkademik.tahunSelesai;
        if (isCurrentActive) await prisma.tahunAjaran.updateMany({ where: { isActive: true }, data: { isActive: false } });

        const newRecord = await prisma.tahunAjaran.create({
          data: { tahunMulai: tahunAkademik.tahunMulai, tahunSelesai: tahunAkademik.tahunSelesai, namaLengkap: tahunAkademik.namaLengkap, tanggalMulai: tahunAkademik.tanggalMulai, tanggalSelesai: tahunAkademik.tanggalSelesai, isActive: isCurrentActive, createdBy: user.id }
        });
        await createSemesters(newRecord.id, newRecord.tahunMulai, newRecord.tahunSelesai, user.id);
        createdRecords.push(newRecord);
      } catch { skippedRecords.push({ ...tahunAkademik, reason: 'Database error' }); }
    }

    return { message: `Berhasil generate ${createdRecords.length} tahun akademik`, data: { created: createdRecords.length, skipped: skippedRecords.length, total: tahunAkademikList.length } };
  }

  static async previewAutoGenerate(startYear: number, endYear: number) {
    if (startYear > endYear) throw new TahunAkademikServiceError('startYear tidak boleh lebih besar dari endYear', 400);
    const tahunAkademikList = groupByTahunAjaran(getTahunAkademikRange(startYear, endYear));
    const currentTahunAkademik = getCurrentTahunAkademik();
    const existingRecords = await prisma.tahunAjaran.findMany({ where: { tahunMulai: { gte: startYear, lte: endYear } }, select: { id: true, tahunMulai: true, tahunSelesai: true, namaLengkap: true, isActive: true } });

    const preview = tahunAkademikList.map((t) => {
      const existing = existingRecords.find((r) => r.tahunMulai === t.tahunMulai && r.tahunSelesai === t.tahunSelesai);
      const isCurrent = t.tahunMulai === currentTahunAkademik.tahunMulai && t.tahunSelesai === currentTahunAkademik.tahunSelesai;
      return { ...t, exists: !!existing, existingId: existing?.id, isCurrentActive: existing?.isActive || false, willBeActive: isCurrent, status: existing ? 'exists' : 'will_create' };
    });

    return { preview, total: preview.length, existing: preview.filter((p) => p.exists).length, willCreate: preview.filter((p) => !p.exists).length, currentTahunAkademik };
  }
}

export class TahunAkademikServiceError extends Error {
  constructor(message: string, public statusCode: number = 500) {
    super(message);
    this.name = 'TahunAkademikServiceError';
  }
}
