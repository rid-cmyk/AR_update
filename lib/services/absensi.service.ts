import { prisma } from '@/lib/database/prisma';
import { StatusAbsensi } from '@prisma/client';
import { AuthUser, getGuruSantriIds } from '@/lib/auth';
import { getGuruAbsensiData } from '@/lib/services/absensi';

export class AbsensiService {
  static async listForGuru(
    user: AuthUser,
    filters: { tanggal: string },
    _pagination?: { page?: number; limit?: number }
  ) {
    const { tanggal } = filters;
    if (!tanggal) {
      throw new Error('Tanggal harus diisi');
    }

    const targetDate = new Date(tanggal);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    targetDate.setHours(0, 0, 0, 0);

    if (targetDate > today) {
      throw new Error('Tidak dapat mengisi absensi untuk tanggal masa depan');
    }

    const absensiData = await getGuruAbsensiData(user.id, tanggal);

    return {
      tanggal,
      jadwals: absensiData.jadwals,
      absensi: absensiData.absensi,
      summary: absensiData.summary,
    };
  }

  static async create(
    user: AuthUser,
    data:
      | { santriId: string; jadwalId: string; tanggal: string; status: string }
      | Array<{ santriId: string; jadwalId: string; tanggal: string; status: string }>
  ) {
    const entries: Array<{ santriId: string; jadwalId: string; tanggal: string; status: string }> =
      Array.isArray(data) ? data : [data];

    if (entries.length === 0) {
      throw new Error('Data tidak lengkap');
    }

    const jadwalCache: Record<number, any> = {};

    const results = await prisma.$transaction(async (tx) => {
      const saved: any[] = [];

      for (const entry of entries) {
        const { santriId, jadwalId, tanggal, status } = entry;

        if (!santriId || !jadwalId || !tanggal || !status) {
          throw new Error('Data tidak lengkap. santriId, jadwalId, tanggal, dan status harus diisi.');
        }

        if (!['masuk', 'izin', 'alpha', 'sakit'].includes(status)) {
          throw new Error('Status harus masuk, izin, sakit, atau alpha');
        }

        const targetDate = new Date(tanggal);
        const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        const hari = dayNames[targetDate.getDay()];

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        targetDate.setHours(0, 0, 0, 0);

        if (targetDate > today) {
          throw new Error('Tidak dapat mengisi absensi untuk tanggal masa depan');
        }

        const jId = parseInt(jadwalId);
        let jadwal = jadwalCache[jId];

        if (!jadwal) {
          jadwal = await tx.jadwal.findFirst({
            where: {
              id: jId,
              hari: hari as any,
              isActive: true,
              halaqah: {
                guruId: user.id,
              },
            },
            include: {
              halaqah: {
                include: {
                  santri: true,
                },
              },
            },
          });

          if (jadwal) {
            jadwal._santriSet = new Set(
              (jadwal.halaqah?.santri || []).map((s: any) => s.santriId)
            );
          }
          jadwalCache[jId] = jadwal;
        }

        if (!jadwal) {
          throw new Error(`Jadwal tidak ditemukan, tidak aktif, atau tidak sesuai dengan hari ${hari}`);
        }

        const currentTime = new Date();
        const jadwalDate = new Date(tanggal);

        if (targetDate.getTime() === today.getTime()) {
          const jamMulai = new Date(jadwalDate);
          const [jamMulaiHour, jamMulaiMinute] = jadwal.jamMulai.toTimeString().slice(0, 5).split(':');
          jamMulai.setHours(parseInt(jamMulaiHour), parseInt(jamMulaiMinute), 0, 0);

          const jamSelesai = new Date(jadwalDate);
          const [jamSelesaiHour, jamSelesaiMinute] = jadwal.jamSelesai.toTimeString().slice(0, 5).split(':');
          jamSelesai.setHours(parseInt(jamSelesaiHour), parseInt(jamSelesaiMinute), 0, 0);

          const toleransiMulai = new Date(jamMulai.getTime() - 30 * 60 * 1000);
          const toleransiSelesai = new Date(jamSelesai.getTime() + 2 * 60 * 60 * 1000);

          if (currentTime < toleransiMulai || currentTime > toleransiSelesai) {
            throw new Error(`Absensi hanya dapat diisi pada rentang waktu ${jadwal.jamMulai.toTimeString().slice(0, 5)} - ${jadwal.jamSelesai.toTimeString().slice(0, 5)}`);
          }
        }

        let isMember = jadwal._santriSet
          ? jadwal._santriSet.has(parseInt(santriId))
          : (jadwal.halaqah?.santri || []).some((s: any) => s.santriId === parseInt(santriId));

        if (!isMember) {
          const isSantriInHalaqah = await tx.halaqahSantri.findFirst({
            where: { halaqahId: jadwal.halaqahId || jadwal.halaqah?.id, santriId: parseInt(santriId) },
          });
          if (isSantriInHalaqah) {
            isMember = true;
            if (jadwal._santriSet) jadwal._santriSet.add(parseInt(santriId));
          }
        }

        if (!isMember) {
          throw new Error('Santri tidak terdaftar di halaqah ini');
        }

        const existingAbsensi = await tx.absensi.findFirst({
          where: {
            santriId: parseInt(santriId),
            jadwalId: jId,
            tanggal: {
              gte: new Date(tanggal + 'T00:00:00.000Z'),
              lt: new Date(tanggal + 'T23:59:59.999Z'),
            },
          },
        });

        const includeOptions = {
          santri: { select: { id: true, namaLengkap: true, username: true } },
          jadwal: { include: { halaqah: { select: { id: true, namaHalaqah: true } } } },
        };

        let absensi;
        if (existingAbsensi) {
          absensi = await tx.absensi.update({
            where: { id: existingAbsensi.id },
            data: { status: status as StatusAbsensi },
            include: includeOptions,
          });
        } else {
          absensi = await tx.absensi.create({
            data: {
              santriId: parseInt(santriId),
              jadwalId: jId,
              tanggal: new Date(tanggal),
              status: status as StatusAbsensi,
            },
            include: includeOptions,
          });
        }

        saved.push(absensi);
      }
      return saved;
    }, {
      maxWait: 5000,
      timeout: 20000,
    });

    await prisma.auditLog.create({
      data: {
        action: 'BULK_ABSENSI',
        keterangan: `Guru ${user.namaLengkap} mencatat ${results.length} absensi`,
        userId: user.id,
      },
    });

    return {
      message: 'Absensi berhasil disimpan',
      data: Array.isArray(data) ? results : results[0],
    };
  }

  static async listMultiRole(user: AuthUser, filters: { halaqahId?: string | null; tanggal: string }) {
    const { halaqahId, tanggal } = filters;

    if (!tanggal) {
      throw new Error('tanggal is required');
    }

    let jadwalIds: number[] = [];

    if (halaqahId) {
      const jadwal = await prisma.jadwal.findFirst({
        where: {
          halaqahId: Number(halaqahId),
          jamMulai: {
            gte: new Date(tanggal + ' 00:00:00'),
            lt: new Date(tanggal + ' 23:59:59'),
          },
        },
      });
      if (jadwal) jadwalIds = [jadwal.id];
    } else if (user.role.name === 'guru') {
      const userHalaqah = await prisma.halaqah.findMany({
        where: { guruId: user.id },
        select: { id: true },
      });
      const halaqahIds = userHalaqah.map((h) => h.id);

      const jadwals = await prisma.jadwal.findMany({
        where: {
          halaqahId: { in: halaqahIds },
          jamMulai: {
            gte: new Date(tanggal + ' 00:00:00'),
            lt: new Date(tanggal + ' 23:59:59'),
          },
        },
        select: { id: true },
      });
      jadwalIds = jadwals.map((j) => j.id);
    }

    if (jadwalIds.length === 0) {
      return [];
    }

    const absensi = await prisma.absensi.findMany({
      where: {
        jadwalId: { in: jadwalIds },
      },
      include: {
        santri: {
          select: {
            id: true,
            namaLengkap: true,
            username: true,
          },
        },
      },
    });

    return absensi;
  }

  static async delete(user: AuthUser, id: number) {
    if (user.role.name !== 'guru' && user.role.name !== 'super_admin') {
      throw new Error('Forbidden');
    }

    const absensi = await prisma.absensi.findUnique({
      where: { id },
      include: { 
        santri: { 
          include: { 
            HalaqahSantri: { 
              include: { 
                halaqah: true 
              } 
            } 
          } 
        } 
      }
    });

    if (!absensi) {
      throw new Error('Not found');
    }

    if (user.role.name === 'guru') {
      const isAuthorized = absensi.santri.HalaqahSantri.some((hs: any) => hs.halaqah.guruId === user.id);
      if (!isAuthorized) {
        throw new Error('Unauthorized to delete this absensi');
      }
    }

    await prisma.absensi.delete({
      where: { id }
    });

    return { success: true };
  }
}
