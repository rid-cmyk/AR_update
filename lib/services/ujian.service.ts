import { prisma } from '@/lib/database/prisma';
import { getGuruSantriIds } from '@/lib/auth';
import { StatusUjian, JenisUjianTemplate } from '@prisma/client';
import { calculateNilaiPerJuz } from '@/lib/utils/hafalanAssessment';
import { notifyUjianSubmit, notifyUjianVerified } from '@/lib/services/whatsapp-notifier';

const JENIS_TO_ENUM: Record<string, JenisUjianTemplate> = {
  "tasmi": 'tasmi', "tasmi'": 'tasmi',
  "mhq": 'mhq', "uas": 'uas',
  "kenaikan juz": 'kenaikan_juz', "kenaikanjuz": 'kenaikan_juz', "kenaikan_juz": 'kenaikan_juz',
  "ujian harian": 'ujian_harian',
  "ujian tengah semester": 'ujian_tengah_semester', "tengah semester": 'ujian_tengah_semester',
  "tahfidz": 'tahfidz'
};

function mapStatus(status: string): StatusUjian {
  const s = (status || '').toUpperCase();
  if (s === 'DRAFT') return 'draft';
  return 'selesai';
}

async function getOrCreateTemplate(nama: string, tahunAjaranId: number, userId: number) {
  const normalized = nama.toLowerCase().trim();
  const enumKey = JENIS_TO_ENUM[normalized] || 'tahfidz';
  let template = await prisma.templateUjian.findFirst({
    where: { jenisUjian: enumKey, status: 'aktif' }
  });
  if (!template) {
    template = await prisma.templateUjian.create({
      data: {
        namaTemplate: `Template ${nama.toUpperCase()} Default`,
        jenisUjian: enumKey,
        deskripsi: `Template default untuk ujian ${nama}`,
        status: 'aktif',
        tahunAjaranId,
        createdBy: userId
      }
    });
  }
  return template;
}

interface AuthUser {
  id: number;
  namaLengkap: string;
  role: { name: string };
}

export class UjianServiceError extends Error {
  constructor(message: string, public statusCode: number = 500) {
    super(message);
    this.name = 'UjianServiceError';
  }
}

export class UjianService {
  static async listForGuru(user: AuthUser) {
    const ujianList = await prisma.ujianSantri.findMany({
      where: { guruId: user.id },
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
      halaqahMap.set(hs.santriId, hs.halaqah?.namaHalaqah);
    }

    const data = ujianList.map(ujian => ({
      id: ujian.id,
      santriId: ujian.santriId,
      santriNama: ujian.santri?.namaLengkap,
      halaqah: halaqahMap.get(ujian.santriId),
      jenisUjian: ujian.jenisUjianLabel || ujian.templateUjian?.namaTemplate,
      nilaiAkhir: ujian.nilaiAkhir,
      tanggalUjian: ujian.tanggalUjian,
      statusUjian: ujian.statusUjian,
      status: ujian.statusUjian,
      keterangan: ujian.catatanGuru,
      catatan: ujian.nilaiDetail ? JSON.stringify(ujian.nilaiDetail) : undefined,
      nilaiDetail: ujian.nilaiDetail ?? undefined,
      pengaturan: ujian.pengaturan ? JSON.stringify(ujian.pengaturan) : undefined,
      juzMulai: ujian.juzDari,
      juzSelesai: ujian.juzSampai,
      tipeUjian: (ujian.pengaturan as any)?.tipeUjian || 'per-juz',
      santri: ujian.santri,
      templateUjian: ujian.templateUjian,
      juzRange: ujian.juzDari && ujian.juzSampai
        ? { dari: ujian.juzDari, sampai: ujian.juzSampai }
        : undefined
    }));

    return data;
  }

  static async createBulk(user: AuthUser, data: { ujianResults: any[]; jenisUjian: { nama: string; tipeUjian: string }; juzRange: { dari: number; sampai: number }; status?: string; metadata?: Record<string, any> }) {
    const {
      ujianResults,
      jenisUjian,
      juzRange,
      status = 'SELESAI',
      metadata
    } = data;

    if (!ujianResults || !Array.isArray(ujianResults) || ujianResults.length === 0) {
      throw new Error('Data ujian tidak lengkap');
    }

    if (!jenisUjian || !jenisUjian.nama || !jenisUjian.tipeUjian) {
      throw new Error('Jenis ujian tidak lengkap');
    }

    if (!juzRange || !juzRange.dari || !juzRange.sampai) {
      throw new Error('Range juz tidak ditemukan');
    }

    if (juzRange.dari < 1 || juzRange.sampai > 30 || juzRange.dari > juzRange.sampai) {
      throw new Error('Range juz tidak valid (1-30)');
    }

    for (const result of ujianResults) {
      if (!result.santriId || !result.nilaiDetail || typeof result.nilaiAkhir !== 'number') {
        throw new Error(`Data ujian tidak lengkap untuk santri ID: ${result.santriId}`);
      }
      result.nilaiAkhir = Math.min(100, Math.max(0, result.nilaiAkhir));
      for (const key of Object.keys(result.nilaiDetail)) {
        const v = result.nilaiDetail[key];
        if (typeof v === 'number') {
          result.nilaiDetail[key] = Math.min(100, Math.max(0, v));
        }
      }
    }

    const guruSantriIds = await getGuruSantriIds(user.id);
    const invalidSantri = ujianResults.filter((r: any) => !guruSantriIds.includes(Number(r.santriId)));
    if (invalidSantri.length > 0) {
      throw new Error(`Santri ID ${invalidSantri.map((r: any) => r.santriId).join(', ')} tidak terdaftar di halaqah Anda`);
    }

    const tahunAjaran = await prisma.tahunAjaran.findFirst({ where: { isActive: true } });
    if (!tahunAjaran) {
      throw new Error('Tahun ajaran aktif tidak ditemukan');
    }

    const templateUjian = await getOrCreateTemplate(jenisUjian.nama, tahunAjaran.id, user.id);
    const tanggalUjian = metadata?.tanggalUjian ? new Date(metadata.tanggalUjian) : new Date();

    const setting = await prisma.systemSetting.findUnique({ where: { id: 'global' } });
    const kkmDefault = Number((setting?.data as Record<string, unknown>)?.kkmDefault || 70);

    const canOverrideRemedial = ['super_admin'].includes(user.role.name) && metadata?.overrideRemedial === true;

    const savedUjian = await prisma.$transaction(
      ujianResults.map((result: any) => {
        const nilaiDetailKeys = Object.keys(result.nilaiDetail || {});
        const nilaiArray = Object.values(result.nilaiDetail || {}).filter(n => typeof n === 'number') as number[];
        const avgNilai = nilaiArray.length > 0 ? nilaiArray.reduce((a, b) => a + b, 0) / nilaiArray.length : 0;

        const evalResult = calculateNilaiPerJuz(
          result.nilaiDetail,
          juzRange.dari,
          juzRange.sampai,
          kkmDefault,
          canOverrideRemedial
        );

        return prisma.ujianSantri.create({
          data: {
            santriId: result.santriId,
            templateUjianId: templateUjian.id,
            tahunAjaranId: tahunAjaran.id,
            tanggalUjian,
            nilaiAkhir: result.nilaiAkhir ?? avgNilai,
            statusUjian: mapStatus(status),
            catatanGuru: result.catatan || null,
            createdBy: user.id,
            guruId: user.id,
            jenisUjianLabel: jenisUjian.nama,
            nilaiDetail: result.nilaiDetail,
            pengaturan: {
              tipeUjian: jenisUjian.tipeUjian,
              totalItems: nilaiDetailKeys.length,
              completedItems: nilaiArray.length,
              kkm: kkmDefault,
              statusKelulusan: evalResult.isAllJuzLulus ? 'LULUS' : (canOverrideRemedial ? 'TIDAK_LULUS' : 'REMEDIAL_REQUIRED'),
              rekomendasiRemedial: !evalResult.isAllJuzLulus && !canOverrideRemedial,
              juzRemedialList: evalResult.juzRemedialList,
              nilaiPerJuz: JSON.parse(JSON.stringify(evalResult.nilaiPerJuz)),
              predikatAkhir: evalResult.predikatAkhir
            },
            juzDari: juzRange.dari,
            juzSampai: juzRange.sampai
          }
        });
      })
    );

    return savedUjian;
  }

  static async update(
    id: number,
    user: AuthUser,
    data: { tanggal?: string; keterangan?: string; nilai?: number }
  ) {
    const existing = await prisma.ujianSantri.findUnique({
      where: { id },
      select: { guruId: true }
    });

    if (!existing) {
      throw new Error('Ujian tidak ditemukan');
    }

    if (user.role.name === 'guru' && existing.guruId !== user.id) {
      throw new Error('Forbidden - Bukan pemilik record ujian ini');
    }

    const clampedNilai = data.nilai !== undefined ? Math.min(100, Math.max(0, Number(data.nilai) || 0)) : undefined;

    const ujian = await prisma.ujianSantri.update({
      where: { id },
      data: {
        ...(clampedNilai !== undefined && { nilaiAkhir: clampedNilai }),
        tanggalUjian: data.tanggal ? new Date(data.tanggal) : undefined,
        catatanGuru: data.keterangan
      },
      include: {
        santri: { select: { id: true, namaLengkap: true, username: true } },
        guru: { select: { id: true, namaLengkap: true } }
      }
    });

    return ujian;
  }

  static async delete(id: number, user: AuthUser) {
    const existing = await prisma.ujianSantri.findUnique({
      where: { id },
      select: { guruId: true }
    });

    if (!existing) {
      throw new Error('Ujian tidak ditemukan');
    }

    if (user.role.name === 'guru' && existing.guruId !== user.id) {
      throw new Error('Forbidden - Bukan pemilik record ujian ini');
    }

    await prisma.ujianSantri.delete({ where: { id } });
    return { message: 'Ujian berhasil dihapus' };
  }

  static async submit(id: number, user: AuthUser, body?: { alasanTanpaRemedial?: string }) {
    const sessionUserId = user.id;
    const existingUjian = await prisma.ujianSantri.findFirst({
      where: { id, guruId: sessionUserId }
    });

    if (!existingUjian) {
      throw new Error('Ujian tidak ditemukan atau Anda tidak memiliki akses');
    }

    const overrideRemedial = false;
    const alasanTanpaRemedial = typeof body?.alasanTanpaRemedial === 'string' ? body.alasanTanpaRemedial : '';

    const pengaturan = (existingUjian.pengaturan as Record<string, any>) || {};
    const rekomendasiRemedial = Boolean(pengaturan.rekomendasiRemedial);
    const juzRemedialList = Array.isArray(pengaturan.juzRemedialList) ? pengaturan.juzRemedialList : [];

    if (rekomendasiRemedial && !overrideRemedial && juzRemedialList.length > 0) {
      const err = new Error(`Terdapat ${juzRemedialList.length} juz di bawah KKM (Juz ${juzRemedialList.join(', ')}). Harap jadwalkan remedial per-juz atau konfirmasikan teruskan tanpa remedial.`);
      (err as any).requireRemedialDecision = true;
      (err as any).juzRemedialList = juzRemedialList;
      (err as any).kkm = pengaturan.kkm || 70;
      (err as any).statusCode = 422;
      throw err;
    }

    const updatedPengaturan = {
      ...pengaturan,
      overrideRemedial,
      alasanTanpaRemedial,
      statusKelulusan: overrideRemedial ? 'TIDAK_LULUS' : (pengaturan.statusKelulusan || 'LULUS'),
    };

    const ujian = await prisma.ujianSantri.update({
      where: { id },
      data: { statusUjian: 'selesai', pengaturan: updatedPengaturan },
      include: {
        santri: { select: { namaLengkap: true, username: true } },
        guru: { select: { namaLengkap: true } },
        templateUjian: { select: { namaTemplate: true } }
      }
    });

    const adminUser = await prisma.user.findFirst({
      where: { role: { name: 'super_admin' } },
      select: { id: true }
    });
    if (adminUser) {
      await prisma.notifikasi.create({
        data: {
          pesan: `Ujian ${ujian.jenisUjianLabel || ujian.templateUjian?.namaTemplate} untuk santri ${ujian.santri.namaLengkap} menunggu verifikasi`,
          type: 'rapot',
          refId: id,
          userId: adminUser.id
        }
      });

      notifyUjianSubmit(ujian.santriId, {
        jenisUjian: ujian.jenisUjianLabel || ujian.templateUjian?.namaTemplate || 'Ujian',
        namaGuru: ujian.guru?.namaLengkap || "Guru",
      }).catch(console.error);
    }

    return ujian;
  }

  static async updateRemedial(
    id: number,
    user: AuthUser,
    data: { nilaiDetail?: Record<string, number>; nilaiAkhir?: number; catatan?: string; status?: string }
  ) {
    const sessionUserId = user.id;
    const existingUjian = await prisma.ujianSantri.findFirst({
      where: { id, guruId: sessionUserId }
    });

    if (!existingUjian) {
      throw new Error('Ujian tidak ditemukan atau Anda tidak memiliki akses');
    }

    const clampNilai = (v: unknown, fallback = 0): number => {
      const n = Number(v);
      if (!Number.isFinite(n)) return fallback;
      return Math.min(100, Math.max(0, Math.round(n)));
    };

    const nilaiDetail: Record<string, number> =
      data.nilaiDetail && typeof data.nilaiDetail === 'object'
        ? Object.fromEntries(Object.entries(data.nilaiDetail).map(([k, v]) => [k, clampNilai(v)]))
        : (existingUjian.nilaiDetail as Record<string, number>) || {};
    const nilaiAkhir = clampNilai(data.nilaiAkhir, existingUjian.nilaiAkhir || 0);
    const catatan = typeof data.catatan === 'string' ? data.catatan : existingUjian.catatanGuru || '';
    const status = String(data.status || 'SELESAI').toUpperCase() === 'DRAFT' ? 'draft' : 'selesai';

    const pengaturan = (existingUjian.pengaturan as Record<string, any>) || {};
    const kkm = Number(pengaturan.kkm) || 70;
    const juzDari = existingUjian.juzDari || 1;
    const juzSampai = existingUjian.juzSampai || 1;

    const evalResult = calculateNilaiPerJuz(nilaiDetail, juzDari, juzSampai, kkm, false);

    const updatedPengaturan = {
      ...pengaturan,
      isRemedial: true,
      parentUjianId: pengaturan.parentUjianId || id,
      kkm,
      nilaiPerJuz: JSON.parse(JSON.stringify(evalResult.nilaiPerJuz)),
      juzRemedialList: evalResult.juzRemedialList,
      statusKelulusan: status === 'draft' ? 'REMEDIAL_IN_PROGRESS' : (evalResult.isAllJuzLulus ? 'LULUS' : 'REMEDIAL_REQUIRED'),
      rekomendasiRemedial: status === 'selesai' && !evalResult.isAllJuzLulus,
    };

    const remedialUjian = await prisma.ujianSantri.update({
      where: { id },
      data: {
        statusUjian: status,
        nilaiAkhir,
        nilaiDetail,
        catatanGuru: catatan || `Ujian Remedial untuk Juz ${[...(pengaturan.targetJuzRemedial || [])].join(', ')}`,
        pengaturan: updatedPengaturan,
        tanggalUjian: new Date(),
      },
      include: {
        santri: { select: { namaLengkap: true, username: true } },
        templateUjian: { select: { namaTemplate: true } },
      },
    });

    return remedialUjian;
  }

  static async createRemedial(
    id: number,
    user: AuthUser,
    body?: { targetJuz?: number[] }
  ) {
    const sessionUserId = user.id;
    const existingUjian = await prisma.ujianSantri.findFirst({
      where: { id, guruId: sessionUserId },
      include: {
        templateUjian: true,
        santri: { select: { namaLengkap: true, username: true } }
      }
    });

    if (!existingUjian) {
      throw new Error('Ujian tidak ditemukan atau Anda tidak memiliki akses');
    }

    let customTargetJuz: number[] = [];
    if (Array.isArray(body?.targetJuz)) {
      customTargetJuz = body.targetJuz.map(Number).filter((n: number) => !isNaN(n));
    }

    const pengaturan = (existingUjian.pengaturan as Record<string, any>) || {};
    const defaultRemedialList = Array.isArray(pengaturan.juzRemedialList) ? pengaturan.juzRemedialList : [];
    const targetJuz = customTargetJuz.length > 0 ? customTargetJuz : defaultRemedialList;

    if (targetJuz.length === 0) {
      throw new Error('Tidak ada juz yang memerlukan remedial pada ujian ini');
    }

    const juzDari = Math.min(...targetJuz);
    const juzSampai = Math.max(...targetJuz);

    const remedialUjian = await prisma.ujianSantri.create({
      data: {
        santriId: existingUjian.santriId,
        templateUjianId: existingUjian.templateUjianId,
        tahunAjaranId: existingUjian.tahunAjaranId,
        tanggalUjian: new Date(),
        statusUjian: 'draft',
        catatanGuru: `Ujian Remedial untuk Juz ${targetJuz.join(', ')}`,
        createdBy: sessionUserId,
        guruId: sessionUserId,
        jenisUjianLabel: existingUjian.jenisUjianLabel,
        juzDari,
        juzSampai,
        pengaturan: {
          ...pengaturan,
          isRemedial: true,
          parentUjianId: id,
          targetJuzRemedial: targetJuz,
          kkm: pengaturan.kkm || 70,
          statusKelulusan: 'REMEDIAL_IN_PROGRESS',
        },
      },
      include: {
        santri: { select: { namaLengkap: true, username: true } },
        templateUjian: { select: { namaTemplate: true } }
      }
    });

    return remedialUjian;
  }

  static async createDetailed(
    user: AuthUser,
    data: {
      santriId: string; jenisUjian: string; tanggal: string;
      juzMulai?: number; juzSelesai?: number; jumlahPertanyaan?: number;
      keterangan?: string; juzPenilaian: Record<string, number>; nilaiAkhir?: number;
    }
  ) {
    const { santriId, jenisUjian, tanggal, juzMulai, juzSelesai, jumlahPertanyaan, keterangan, juzPenilaian, nilaiAkhir } = data;

    if (!santriId || !jenisUjian || !tanggal || !juzPenilaian) {
      throw new Error('Data ujian tidak lengkap');
    }

    const santri = await prisma.user.findFirst({
      where: { username: santriId },
      include: { HalaqahSantri: { include: { halaqah: true } } }
    });

    if (!santri) {
      throw new Error('Santri tidak ditemukan');
    }

    const halaqahSantri = santri.HalaqahSantri.find(hs => hs.halaqah.guruId === user.id);
    if (!halaqahSantri) {
      throw new Error('Anda tidak memiliki akses untuk menilai santri ini');
    }

    const tahunAkademikAktif = await prisma.tahunAjaran.findFirst({ where: { isActive: true } });
    if (!tahunAkademikAktif) {
      throw new Error('Tahun akademik aktif tidak ditemukan');
    }

    let templateUjian = await prisma.templateUjian.findFirst({
      where: { jenisUjian: jenisUjian as JenisUjianTemplate, status: 'aktif' },
      include: { komponenPenilaian: true }
    });

    if (!templateUjian) {
      templateUjian = await prisma.templateUjian.create({
        data: {
          namaTemplate: `Template ${jenisUjian.toUpperCase()} Default`,
          jenisUjian: jenisUjian as JenisUjianTemplate,
          deskripsi: `Template default untuk ujian ${jenisUjian}`,
          status: 'aktif',
          tahunAjaranId: tahunAkademikAktif.id,
          createdBy: user.id,
          komponenPenilaian: { create: getDefaultKomponen(jenisUjian) }
        },
        include: { komponenPenilaian: true }
      });
    }

    const setting = await prisma.systemSetting.findUnique({ where: { id: 'global' } });
    const kkmDefault = Number((setting?.data as Record<string, unknown>)?.kkmDefault || 70);

    const evalResult = calculateNilaiPerJuz(
      juzPenilaian, Number(juzMulai || 1), Number(juzSelesai || 30), kkmDefault
    );

    const ujian = await prisma.ujianSantri.create({
      data: {
        santriId: santri.id,
        templateUjianId: templateUjian.id,
        tahunAjaranId: tahunAkademikAktif.id,
        tanggalUjian: new Date(tanggal),
        nilaiAkhir: nilaiAkhir ?? evalResult.nilaiAkhirGabungan,
        statusUjian: 'draft' as StatusUjian,
        catatanGuru: `${keterangan || ''} | Juz ${juzMulai || 1}-${juzSelesai || 30} | ${jenisUjian === 'mhq' ? `${jumlahPertanyaan} pertanyaan/juz` : ''}`.trim(),
        juzDari: Number(juzMulai || 1),
        juzSampai: Number(juzSelesai || 30),
        createdBy: user.id,
        nilaiDetail: juzPenilaian,
        pengaturan: {
          kkm: kkmDefault,
          statusKelulusan: evalResult.isAllJuzLulus ? 'LULUS' : 'REMEDIAL_REQUIRED',
          rekomendasiRemedial: !evalResult.isAllJuzLulus,
          juzRemedialList: evalResult.juzRemedialList,
          nilaiPerJuz: JSON.parse(JSON.stringify(evalResult.nilaiPerJuz)),
          predikatAkhir: evalResult.predikatAkhir
        }
      },
      include: {
        santri: { select: { namaLengkap: true, username: true } },
        templateUjian: { select: { namaTemplate: true, jenisUjian: true } },
        tahunAjaran: { select: { namaLengkap: true } }
      }
    });

    return ujian;
  }

  static async verify(
    id: number,
    user: AuthUser,
    data: { action: 'verify' | 'reject'; keterangan?: string }
  ) {
    const existingUjian = await prisma.ujianSantri.findUnique({ where: { id } });
    if (!existingUjian) {
      throw new Error('Ujian tidak ditemukan');
    }

    const newStatus = data.action === 'verify' ? 'diverifikasi' : 'ditolak';
    const updateData: Record<string, unknown> = {
      statusUjian: newStatus,
      tanggalVerifikasi: new Date()
    };

    if (data.keterangan) {
      updateData.catatanGuru = [existingUjian.catatanGuru, data.keterangan].filter(Boolean).join(' | ');
    }

    const verifierId = user.id;
    if (!isNaN(verifierId)) {
      updateData.diverifikasiBy = verifierId;
    }

    const ujian = await prisma.ujianSantri.update({
      where: { id },
      data: updateData,
      include: {
        santri: { select: { namaLengkap: true, username: true } },
        guru: { select: { id: true, namaLengkap: true } },
        templateUjian: { select: { namaTemplate: true } }
      }
    });

    const guruId = ujian.guru?.id || ujian.createdBy;
    if (guruId) {
      await prisma.notifikasi.create({
        data: {
          pesan: `Ujian ${ujian.jenisUjianLabel || ujian.templateUjian?.namaTemplate} untuk santri ${ujian.santri.namaLengkap} telah ${data.action === 'verify' ? 'diverifikasi' : 'ditolak'}`,
          type: 'rapot',
          refId: id,
          userId: guruId
        }
      });

      notifyUjianVerified(ujian.santriId, data.action === "verify" ? "verified" : "rejected", {
        jenisUjian: ujian.jenisUjianLabel || ujian.templateUjian?.namaTemplate || "Ujian",
        guruId: guruId,
        keterangan: data.action === "verify" ? "Ujian telah diverifikasi" : "Ujian ditolak",
      }).catch(console.error);
    }

    return ujian;
  }

  static async getLaporan(
    user: AuthUser,
    filters: { periode?: string; jenisUjian?: string; halaqah?: string; format?: string }
  ) {
    const now = new Date();
    let startDate: Date;
    const endDate = now;

    switch (filters.periode) {
      case 'bulan-ini':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'semester-ini': {
        const currentMonth = now.getMonth();
        const semesterStart = currentMonth >= 6 ? 6 : 0;
        startDate = new Date(now.getFullYear(), semesterStart, 1);
        break;
      }
      case 'tahun-ini':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const whereClause: Record<string, unknown> = {
      tanggalUjian: { gte: startDate, lte: endDate }
    };

    if (user.role.name === 'guru') {
      whereClause.santri = {
        HalaqahSantri: { some: { halaqah: { guruId: user.id } } }
      };
    }

    if (filters.jenisUjian) {
      whereClause.templateUjian = { jenisUjian: filters.jenisUjian };
    }

    const ujianData = await prisma.ujianSantri.findMany({
      where: whereClause,
      include: {
        santri: {
          include: {
            role: true,
            HalaqahSantri: {
              include: { halaqah: { include: { guru: true } } }
            }
          }
        },
        templateUjian: { include: { komponenPenilaian: true } },
        tahunAjaran: true
      },
      orderBy: { tanggalUjian: 'desc' }
    });

    const processedData = ujianData.map(ujian => ({
      id: ujian.id,
      santriId: ujian.santriId,
      santriNama: ujian.santri.namaLengkap,
      halaqah: ujian.santri.HalaqahSantri?.[0]?.halaqah?.namaHalaqah || 'Tidak ada halaqah',
      jenisUjian: ujian.templateUjian.jenisUjian,
      nilaiAkhir: ujian.nilaiAkhir || 0,
      tanggalUjian: ujian.tanggalUjian.toISOString(),
      statusUjian: ujian.statusUjian,
      juzRange: ujian.juzDari && ujian.juzSampai ? { dari: ujian.juzDari, sampai: ujian.juzSampai } : null,
      catatanGuru: ujian.catatanGuru
    }));

    if (filters.format === 'summary') {
      return generateSummaryReport(ujianData, filters);
    } else if (filters.format === 'detail') {
      return generateDetailReport(ujianData, filters);
    } else if (filters.format === 'export') {
      return generateExportData(ujianData, filters);
    }

    return {
      data: processedData,
      metadata: {
        periode: filters.periode,
        jenisUjian: filters.jenisUjian,
        halaqah: filters.halaqah,
        totalUjian: processedData.length,
        dateRange: { start: startDate.toISOString(), end: endDate.toISOString() }
      },
      message: 'Laporan ujian berhasil diambil'
    };
  }

  static async getAllForAdmin(user: AuthUser) {
    if (user.role.name !== 'super_admin' && user.role.name !== 'admin') {
      throw new UjianServiceError('Unauthorized', 401);
    }
    return await prisma.ujianSantri.findMany({
      include: {
        santri: { select: { id: true, namaLengkap: true, username: true } },
        guru: { select: { id: true, namaLengkap: true } },
        templateUjian: { select: { id: true, namaTemplate: true, jenisUjian: true } }
      },
      orderBy: { tanggalUjian: 'desc' }
    });
  }
}

function getDefaultKomponen(jenisUjian: string) {
  const komponenMap: Record<string, Array<{
    namaKomponen: string; bobotNilai: number; nilaiMaksimal: number; deskripsi: string; urutan: number;
  }>> = {
    tasmi: [
      { namaKomponen: 'Kelancaran', bobotNilai: 60, nilaiMaksimal: 100, deskripsi: 'Penilaian kelancaran membaca per halaman', urutan: 1 },
      { namaKomponen: 'Tajwid', bobotNilai: 40, nilaiMaksimal: 100, deskripsi: 'Penilaian ketepatan tajwid', urutan: 2 }
    ],
    mhq: [
      { namaKomponen: 'Ketepatan Hafalan', bobotNilai: 50, nilaiMaksimal: 100, deskripsi: 'Ketepatan menjawab pertanyaan hafalan', urutan: 1 },
      { namaKomponen: 'Kelancaran', bobotNilai: 30, nilaiMaksimal: 100, deskripsi: 'Kelancaran dalam menjawab', urutan: 2 },
      { namaKomponen: 'Tajwid', bobotNilai: 20, nilaiMaksimal: 100, deskripsi: 'Ketepatan tajwid saat menjawab', urutan: 3 }
    ],
    uas: [
      { namaKomponen: 'Hafalan', bobotNilai: 70, nilaiMaksimal: 100, deskripsi: 'Penilaian hafalan per juz', urutan: 1 },
      { namaKomponen: 'Tajwid', bobotNilai: 30, nilaiMaksimal: 100, deskripsi: 'Penilaian tajwid', urutan: 2 }
    ],
    kenaikan_juz: [
      { namaKomponen: 'Hafalan', bobotNilai: 80, nilaiMaksimal: 100, deskripsi: 'Penilaian hafalan untuk kenaikan juz', urutan: 1 },
      { namaKomponen: 'Kelancaran', bobotNilai: 20, nilaiMaksimal: 100, deskripsi: 'Penilaian kelancaran', urutan: 2 }
    ]
  };
  return komponenMap[jenisUjian] || komponenMap.uas;
}

function generateSummaryReport(ujianData: any[], filters: { periode?: string; jenisUjian?: string; halaqah?: string }) {
  const totalUjian = ujianData.length;
  const nilaiRataRata = totalUjian > 0
    ? ujianData.reduce((sum, u) => sum + (u.nilaiAkhir || 0), 0) / totalUjian
    : 0;

  const byJenisUjian = ujianData.reduce((acc, ujian) => {
    const jenis = ujian.templateUjian.jenisUjian;
    if (!acc[jenis]) acc[jenis] = { count: 0, totalNilai: 0, rataRata: 0 };
    acc[jenis].count++;
    acc[jenis].totalNilai += ujian.nilaiAkhir || 0;
    acc[jenis].rataRata = acc[jenis].totalNilai / acc[jenis].count;
    return acc;
  }, {} as Record<string, any>);

  const byHalaqah = ujianData.reduce((acc, ujian) => {
    const halaqahName = ujian.santri.HalaqahSantri?.[0]?.halaqah?.namaHalaqah || 'Tidak ada halaqah';
    if (!acc[halaqahName]) acc[halaqahName] = { count: 0, totalNilai: 0, rataRata: 0, santriCount: new Set() };
    acc[halaqahName].count++;
    acc[halaqahName].totalNilai += ujian.nilaiAkhir || 0;
    acc[halaqahName].santriCount.add(ujian.santriId);
    acc[halaqahName].rataRata = acc[halaqahName].totalNilai / acc[halaqahName].count;
    return acc;
  }, {} as Record<string, any>);

  Object.keys(byHalaqah).forEach(key => {
    byHalaqah[key].santriCount = byHalaqah[key].santriCount.size;
  });

  const performanceCategories = {
    excellent: ujianData.filter(u => (u.nilaiAkhir || 0) >= 90).length,
    good: ujianData.filter(u => (u.nilaiAkhir || 0) >= 80 && (u.nilaiAkhir || 0) < 90).length,
    average: ujianData.filter(u => (u.nilaiAkhir || 0) >= 70 && (u.nilaiAkhir || 0) < 80).length,
    needsImprovement: ujianData.filter(u => (u.nilaiAkhir || 0) < 70).length
  };

  return {
    data: {
      summary: {
        totalUjian,
        nilaiRataRata: Math.round(nilaiRataRata * 100) / 100,
        periode: filters.periode || 'bulan-ini',
        jenisUjian: filters.jenisUjian || 'semua',
        halaqah: filters.halaqah || 'semua'
      },
      byJenisUjian,
      byHalaqah,
      performanceCategories,
      trends: { weeklyAverage: [], monthlyProgress: [] }
    },
    message: 'Summary laporan ujian berhasil diambil'
  };
}

function generateDetailReport(ujianData: any[], filters: { periode?: string; jenisUjian?: string; halaqah?: string }) {
  const detailData = ujianData.map(ujian => ({
    id: ujian.id,
    tanggalUjian: ujian.tanggalUjian.toISOString(),
    santri: {
      id: ujian.santriId,
      nama: ujian.santri.namaLengkap,
      username: ujian.santri.username,
      halaqah: ujian.santri.HalaqahSantri?.[0]?.halaqah?.namaHalaqah || 'Tidak ada halaqah'
    },
    ujian: {
      jenis: ujian.templateUjian.jenisUjian,
      template: ujian.templateUjian.namaTemplate,
      juzRange: ujian.juzDari && ujian.juzSampai ? { dari: ujian.juzDari, sampai: ujian.juzSampai } : null,
      nilaiAkhir: ujian.nilaiAkhir || 0,
      status: ujian.statusUjian
    },
    catatan: ujian.catatanGuru,
    tahunAjaran: ujian.tahunAjaran?.tahunAjaran || 'Unknown'
  }));

  return {
    data: detailData,
    metadata: {
      totalRecords: detailData.length,
      periode: filters.periode || 'bulan-ini',
      jenisUjian: filters.jenisUjian || 'semua',
      halaqah: filters.halaqah || 'semua'
    },
    message: 'Detail laporan ujian berhasil diambil'
  };
}

function generateExportData(ujianData: any[], filters: { periode?: string; jenisUjian?: string; halaqah?: string }) {
  const exportData = ujianData.map(ujian => ({
    'Tanggal Ujian': ujian.tanggalUjian.toLocaleDateString('id-ID'),
    'Nama Santri': ujian.santri.namaLengkap,
    'Username': ujian.santri.username,
    'Halaqah': ujian.santri.HalaqahSantri?.[0]?.halaqah?.namaHalaqah || 'Tidak ada halaqah',
    'Jenis Ujian': ujian.templateUjian.jenisUjian,
    'Template': ujian.templateUjian.namaTemplate,
    'Juz Dari': ujian.juzDari || '-',
    'Juz Sampai': ujian.juzSampai || '-',
    'Nilai Akhir': ujian.nilaiAkhir || 0,
    'Status': ujian.statusUjian,
    'Catatan Guru': ujian.catatanGuru || '-',
    'Tahun Ajaran': ujian.tahunAjaran?.tahunAjaran || 'Unknown'
  }));

  return {
    data: exportData,
    metadata: {
      format: 'export',
      totalRecords: exportData.length,
      periode: filters.periode || 'bulan-ini',
      jenisUjian: filters.jenisUjian || 'semua',
      halaqah: filters.halaqah || 'semua',
      exportDate: new Date().toISOString()
    },
    message: 'Data export laporan ujian berhasil diambil'
  };
}

