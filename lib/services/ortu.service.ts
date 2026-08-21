import { prisma } from '@/lib/database/prisma';

export interface AuthUser {
  id: number;
  namaLengkap: string;
  role: { name: string };
}

export class OrtuServiceError extends Error {
  constructor(message: string, public statusCode: number = 500) {
    super(message);
    this.name = 'OrtuServiceError';
  }
}

export class OrtuService {
  static async getDashboardStats(user: AuthUser) {
    if (user.role.name !== 'ortu') throw new OrtuServiceError('Access denied', 403);

    const orangTuaSantriRelations = await prisma.orangTuaSantri.findMany({
      where: { orangTuaId: user.id },
      include: {
        santri: {
          select: {
            id: true,
            username: true,
            namaLengkap: true,
            foto: true,
            role: { select: { id: true, name: true } },
            HalaqahSantri: { select: { halaqah: { select: { namaHalaqah: true } } }, take: 1 },
            Hafalan: { orderBy: { tanggal: 'desc' }, take: 50 },
            Absensi: { orderBy: { tanggal: 'desc' }, take: 30 },
            TargetHafalan: { orderBy: { deadline: 'desc' } },
            Prestasi: { orderBy: { tahun: 'desc' } }
          }
        }
      }
    });

    const anakList = orangTuaSantriRelations.map(relation => {
      const santri = relation.santri;
      const totalHafalan = santri.Hafalan.length;
      const totalAbsensi = santri.Absensi.length;
      const totalAbsensiMasuk = santri.Absensi.filter(a => a.status === 'masuk').length;
      
      return {
        ...santri,
        halaqah: santri.HalaqahSantri?.[0]?.halaqah?.namaHalaqah || 'Tanpa Halaqah',
        hafalanProgress: totalHafalan > 0 ? Math.min(Math.round((totalHafalan / 30) * 100), 100) : 0,
        attendanceRate: totalAbsensi > 0 ? Math.round((totalAbsensiMasuk / totalAbsensi) * 100) : 0,
        totalPrestasi: santri.Prestasi.length,
        lastActivity: santri.Hafalan[0]?.tanggal || santri.Absensi[0]?.tanggal || new Date().toISOString()
      };
    });

    const totalChildren = anakList.length;
    let totalHafalan = 0;
    let totalAbsensiMasuk = 0;
    let totalAbsensi = 0;
    let totalPrestasi = 0;

    anakList.forEach(anak => {
      totalHafalan += anak.Hafalan.length;
      totalAbsensiMasuk += anak.Absensi.filter(a => a.status === 'masuk').length;
      totalAbsensi += anak.Absensi.length;
      totalPrestasi += anak.Prestasi.length;
    });

    const avgHafalanProgress = totalChildren > 0 ? Math.round((totalHafalan / totalChildren) * 10) / 10 : 0;
    const avgAttendanceRate = totalAbsensi > 0 ? Math.round((totalAbsensiMasuk / totalAbsensi) * 100) : 0;

    return {
      children: anakList,
      overview: { totalChildren, avgHafalanProgress, avgAttendanceRate, totalPrestasi },
      orangTuaInfo: { id: user.id, namaLengkap: user.namaLengkap }
    };
  }

  static async getTarget(user: AuthUser, anakIdParam: string | null) {
    if (user.role.name !== "ortu") throw new OrtuServiceError("Unauthorized", 401);
    if (!anakIdParam) throw new OrtuServiceError("anakId is required", 400);

    const anakId = parseInt(anakIdParam);

    const orangTuaSantri = await prisma.orangTuaSantri.findFirst({
      where: { orangTuaId: user.id, santriId: anakId }
    });
    if (!orangTuaSantri) throw new OrtuServiceError("Access denied - not your child", 403);

    const targetHafalan = await prisma.targetHafalan.findMany({
      where: { santriId: anakId },
      orderBy: { deadline: "asc" }
    });

    const allSurats = [...new Set(targetHafalan.map(t => t.surat))];
    const allHafalanBulk = await prisma.hafalan.findMany({
      where: { santriId: anakId, surat: { in: allSurats }, status: "ziyadah" }
    });

    const hafalanMap = new Map();
    for (const h of allHafalanBulk) {
      if (!hafalanMap.has(h.surat)) hafalanMap.set(h.surat, []);
      hafalanMap.get(h.surat).push(h);
    }

    return targetHafalan.map(target => {
      const hafalan = hafalanMap.get(target.surat) || [];
      const totalHafal = hafalan.reduce((sum: number, h: any) => sum + (h.ayatSelesai - h.ayatMulai + 1), 0);
      const progress = Math.min(Math.round((totalHafal / target.ayatTarget) * 100), 100);

      return {
        id: target.id,
        surat: target.surat,
        ayatTarget: target.ayatTarget,
        deadline: target.deadline.toISOString(),
        status: target.status,
        progress
      };
    });
  }

  static async getAnakList(user: AuthUser) {
    if (user.role.name !== "ortu") throw new OrtuServiceError("Unauthorized", 401);

    const orangTuaSantri = await prisma.orangTuaSantri.findMany({
      where: { orangTuaId: user.id },
      include: { santri: { select: { id: true, namaLengkap: true, username: true, foto: true } } }
    });

    const santriIds = orangTuaSantri.map(ots => ots.santriId);
    const allHalaqahSantri = await prisma.halaqahSantri.findMany({
      where: { santriId: { in: santriIds } },
      include: { halaqah: { include: { guru: { select: { id: true, namaLengkap: true } } } } }
    });

    const halaqahMap = new Map(allHalaqahSantri.map(hs => [hs.santriId, hs]));

    return orangTuaSantri.map(ots => {
      const halaqahSantri = halaqahMap.get(ots.santriId);
      return {
        ...ots.santri,
        halaqah: halaqahSantri ? {
          id: halaqahSantri.halaqah.id,
          namaHalaqah: halaqahSantri.halaqah.namaHalaqah,
          guru: halaqahSantri.halaqah.guru
        } : null
      };
    });
  }

  static async getAbsensiSummary(user: AuthUser, anakIdParam: string | null) {
    if (user.role.name !== "ortu") throw new OrtuServiceError("Unauthorized", 401);
    if (!anakIdParam) throw new OrtuServiceError("anakId is required", 400);

    const anakId = parseInt(anakIdParam);

    const orangTuaSantri = await prisma.orangTuaSantri.findFirst({
      where: { orangTuaId: user.id, santriId: anakId }
    });
    if (!orangTuaSantri) throw new OrtuServiceError("Access denied - not your child", 403);

    const absensiData = await prisma.absensi.findMany({
      where: { santriId: anakId },
      include: { jadwal: { include: { halaqah: { select: { namaHalaqah: true } } } } },
      orderBy: { tanggal: "desc" },
      take: 10
    });

    const totalHadir = absensiData.filter(a => a.status === "masuk").length;
    const totalIzin = absensiData.filter(a => a.status === "izin").length;
    const totalAlpha = absensiData.filter(a => a.status === "alpha").length;

    const recentAbsensi = absensiData.map(absensi => ({
      id: absensi.id,
      tanggal: absensi.tanggal.toISOString(),
      status: absensi.status,
      jadwal: {
        hari: absensi.jadwal.hari,
        jamMulai: absensi.jadwal.jamMulai.toTimeString().slice(0, 5),
        jamSelesai: absensi.jadwal.jamSelesai.toTimeString().slice(0, 5),
        halaqah: { namaHalaqah: absensi.jadwal.halaqah.namaHalaqah }
      }
    }));

    return { totalHadir, totalIzin, totalAlpha, recentAbsensi };
  }

  static async getGuruHalaqah(user: AuthUser) {
    if (user.role.name !== 'ortu') throw new OrtuServiceError('Access denied', 403);

    const parentRelations = await prisma.orangTuaSantri.findMany({
      where: { orangTuaId: user.id },
      select: { santriId: true },
    });
    const santriIds = parentRelations.map((r) => r.santriId);
    if (santriIds.length === 0) return [];

    const halaqahSantri = await prisma.halaqahSantri.findMany({
      where: { santriId: { in: santriIds } },
      select: {
        halaqahId: true,
        santriId: true,
        halaqah: {
          select: { id: true, namaHalaqah: true, guruId: true, guru: { select: { id: true, namaLengkap: true, noTlp: true } } }
        },
        santri: { select: { id: true, namaLengkap: true } },
      },
    });

    const result = halaqahSantri
      .filter((hs) => hs.halaqah.guru !== null)
      .map((hs) => ({
        guruId: hs.halaqah.guru!.id,
        namaGuru: hs.halaqah.guru!.namaLengkap,
        noTlp: hs.halaqah.guru!.noTlp,
        halaqahId: hs.halaqah.id,
        namaHalaqah: hs.halaqah.namaHalaqah,
        namaSantri: hs.santri.namaLengkap,
      }));

    const seen = new Set<string>();
    return result.filter((r) => {
      const key = `${r.guruId}-${r.halaqahId}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  static async getHafalanProgress(user: AuthUser, anakIdParam: string | null) {
    if (user.role.name !== "ortu") throw new OrtuServiceError("Unauthorized", 401);
    if (!anakIdParam) throw new OrtuServiceError("anakId is required", 400);

    const anakId = parseInt(anakIdParam);

    const orangTuaSantri = await prisma.orangTuaSantri.findFirst({
      where: { orangTuaId: user.id, santriId: anakId }
    });
    if (!orangTuaSantri) throw new OrtuServiceError("Access denied - not your child", 403);

    const hafalanData = await prisma.hafalan.findMany({
      where: { santriId: anakId },
      orderBy: { tanggal: "desc" },
      take: 10
    });

    const totalAyat = hafalanData.reduce((sum: number, hafalan: any) => sum + (hafalan.ayatSelesai - hafalan.ayatMulai + 1), 0);
    const ziyadahCount = hafalanData.filter((h: any) => h.status === "ziyadah").length;
    const totalSurat = new Set(hafalanData.map((h: any) => h.surat)).size;
    const progress = Math.min(Math.round((totalAyat / 6236) * 100), 100);

    return { totalSurat, totalAyat, progress, ziyadahCount, recentHafalan: hafalanData };
  }
}
