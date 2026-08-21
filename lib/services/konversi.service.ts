import { prisma } from '@/lib/database/prisma';
import { calculateJuzProgress, calculateSuratProgress, convertJuzToSuratTarget } from '@/utils/hafalan-converter';

export interface AuthUser {
  id: number;
  namaLengkap: string;
  role: { name: string };
}

export class KonversiServiceError extends Error {
  constructor(message: string, public statusCode: number = 500) {
    super(message);
    this.name = 'KonversiServiceError';
  }
}

export class KonversiService {
  static async getProgressJuz(user: AuthUser, santriIdParam: string | null) {
    let targetSantriId = user.id;

    if (santriIdParam) {
      if (user.role.name === 'guru') {
        const halaqahSantri = await prisma.halaqahSantri.findFirst({
          where: { santriId: parseInt(santriIdParam), halaqah: { guruId: user.id } }
        });
        if (!halaqahSantri) throw new KonversiServiceError('Santri tidak ditemukan dalam halaqah Anda', 403);
        targetSantriId = parseInt(santriIdParam);
      } else if (user.role.name === 'santri' && parseInt(santriIdParam) !== user.id) {
        throw new KonversiServiceError('Santri hanya bisa melihat data pribadi', 403);
      } else if (user.role.name === 'ortu') {
        const anak = await prisma.orangTuaSantri.findFirst({
          where: { orangTuaId: user.id, santriId: parseInt(santriIdParam) },
          select: { id: true }
        });
        if (!anak) throw new KonversiServiceError('Anda tidak memiliki akses ke data santri ini', 403);
        targetSantriId = parseInt(santriIdParam);
      } else {
        targetSantriId = parseInt(santriIdParam); // admin, yayasan
      }
    }

    const hafalanData = await prisma.hafalan.findMany({
      where: { santriId: targetSantriId, status: 'ziyadah' },
      select: { surat: true, ayatMulai: true, ayatSelesai: true, status: true, tanggal: true },
      orderBy: { tanggal: 'desc' }
    });

    const hafalanForConverter = hafalanData.map(h => ({
      surat: h.surat,
      ayatMulai: h.ayatMulai,
      ayatSelesai: h.ayatSelesai,
      status: h.status as 'ziyadah' | 'murojaah'
    }));

    const progressJuz = calculateJuzProgress(hafalanForConverter);
    const progressSurat = calculateSuratProgress(hafalanForConverter);

    const totalJuzSelesai = progressJuz.filter(j => j.status === 'selesai').length;
    const totalJuzProses = progressJuz.filter(j => j.status === 'proses').length;
    const totalAyatHafal = progressJuz.reduce((sum, j) => sum + j.ayatHafal, 0);
    const totalAyatAlQuran = progressJuz.reduce((sum, j) => sum + j.totalAyat, 0);
    const progressKeseluruhan = totalAyatAlQuran > 0 ? Math.round((totalAyatHafal / totalAyatAlQuran) * 100) : 0;

    return {
      santriId: targetSantriId,
      progressJuz,
      progressSurat,
      statistik: {
        totalJuzSelesai,
        totalJuzProses,
        totalJuzBelum: 30 - totalJuzSelesai - totalJuzProses,
        totalAyatHafal,
        totalAyatAlQuran,
        progressKeseluruhan,
        totalSuratDihafal: progressSurat.length
      },
      lastUpdated: new Date().toISOString()
    };
  }

  static getTargetSurat(juzParam: string) {
    if (!juzParam) throw new KonversiServiceError('Parameter juz diperlukan. Contoh: ?juz=1,2,3', 400);

    const targetJuz = juzParam.split(',').map(j => {
      const juzNumber = parseInt(j.trim());
      if (isNaN(juzNumber) || juzNumber < 1 || juzNumber > 30) {
        throw new KonversiServiceError('Juz ' + j + ' tidak valid. Harus antara 1-30', 400);
      }
      return juzNumber;
    });

    const suratTarget = convertJuzToSuratTarget(targetJuz);

    const totalSurat = suratTarget.length;
    const totalAyatTarget = suratTarget.reduce((sum, s) => sum + s.ayatHafal, 0);
    const suratLengkap = suratTarget.filter(s => s.progress === 100).length;
    const suratSebagian = suratTarget.filter(s => s.progress > 0 && s.progress < 100).length;

    const generateRencanaHafalan = (suratTarget: any[]) => {
      return suratTarget.map((surat, index) => {
        let rencana = '';
        if (surat.progress === 100) {
          rencana = 'Hafal lengkap surat ' + surat.surat + ' (' + surat.totalAyat + ' ayat)';
        } else {
          rencana = 'Hafal surat ' + surat.surat + ' ayat 1-' + surat.ayatHafal + ' dari ' + surat.totalAyat + ' ayat';
        }
        
        return {
          urutan: index + 1,
          surat: surat.surat,
          target: 'Ayat 1-' + surat.ayatHafal,
          totalAyat: surat.ayatHafal,
          juzTerkait: surat.juzTerkait,
          rencana,
          prioritas: surat.juzTerkait.length === 1 ? 'tinggi' : 'sedang'
        };
      }).sort((a, b) => {
        if (a.prioritas !== b.prioritas) return a.prioritas === 'tinggi' ? -1 : 1;
        return Math.min(...a.juzTerkait) - Math.min(...b.juzTerkait);
      });
    };

    return {
      targetJuz: targetJuz.sort(),
      suratTarget,
      statistik: {
        totalJuz: targetJuz.length,
        totalSurat,
        totalAyatTarget,
        suratLengkap,
        suratSebagian,
        estimasiWaktu: Math.ceil(totalAyatTarget / 10) + ' hari'
      },
      rencanaHafalan: generateRencanaHafalan(suratTarget),
      lastGenerated: new Date().toISOString()
    };
  }
}
