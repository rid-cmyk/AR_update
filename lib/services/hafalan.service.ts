import { prisma } from '@/lib/database/prisma';
import { getGuruSantriIds } from '@/lib/auth';
import { isGuruAuthorizedForSantri } from '@/lib/services/authorization-guard';
import { notifyHafalan } from '@/lib/services/whatsapp-notifier';

interface HafalanFilters {
  santriName?: string;
  surat?: string;
  status?: string;
}

interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

interface AuthUser {
  id: number;
  namaLengkap: string;
  role: { name: string };
}

export class HafalanServiceError extends Error {
  constructor(message: string, public statusCode: number = 500) {
    super(message);
    this.name = 'HafalanServiceError';
  }
}

export class HafalanService {
  static async listForGuru(user: AuthUser, filters: HafalanFilters, pagination: PaginationParams) {
    // 1. Get santri IDs via getGuruSantriIds
    const santriIds = await getGuruSantriIds(user.id);

    if (santriIds.length === 0) {
      return { data: [], message: 'Tidak ada santri di halaqah' };
    }

    // 2. Build whereClause with filters (santriName, surat, status)
    const whereClause: Record<string, unknown> = {
      santriId: {
        in: santriIds
      }
    };

    if (filters.santriName) {
      whereClause.santri = {
        OR: [
          { namaLengkap: { contains: filters.santriName, mode: 'insensitive' } },
          { username: { contains: filters.santriName, mode: 'insensitive' } }
        ]
      };
    }

    if (filters.surat) {
      whereClause.surat = {
        contains: filters.surat,
        mode: 'insensitive'
      };
    }

    if (filters.status) {
      whereClause.status = filters.status;
    }

    // 3. Query prisma.hafalan.findMany with include/orderBy/pagination
    const hafalanData = await prisma.hafalan.findMany({
      where: whereClause,
      include: {
        santri: {
          select: {
            id: true,
            namaLengkap: true,
            username: true
          }
        }
      },
      orderBy: {
        tanggal: 'desc'
      },
      take: pagination.limit,
      skip: pagination.skip
    });

    // 4. Return { data, message }
    return { data: hafalanData, message: 'Berhasil mengambil data hafalan' };
  }

  static async create(
    user: AuthUser,
    data: {
      santriId: string | number;
      surat: string;
      ayatMulai: string | number;
      ayatSelesai: string | number;
      status: string;
      tanggal?: string;
      keterangan?: string;
    }
  ) {
    const { santriId, surat, ayatMulai, ayatSelesai, status, tanggal, keterangan } = data;

    // 1. Validate required fields
    if (!santriId || !surat || !ayatMulai || !ayatSelesai || !status) {
      throw new Error('Data tidak lengkap');
    }

    const targetSantriId = parseInt(String(santriId));

    // 2. BOLA/IDOR guard via isGuruAuthorizedForSantri (if guru role)
    if (user.role.name === 'guru') {
      const isAuthorized = await isGuruAuthorizedForSantri(user.id, targetSantriId);
      if (!isAuthorized) {
        throw new Error('Akses ditolak: Santri tidak terdaftar di halaqah Anda');
      }
    }

    // 3. Create hafalan record
    const hafalan = await prisma.hafalan.create({
      data: {
        santriId: targetSantriId,
        surat,
        ayatMulai: parseInt(String(ayatMulai)),
        ayatSelesai: parseInt(String(ayatSelesai)),
        status: status as any,
        tanggal: tanggal ? new Date(tanggal) : new Date(),
        keterangan
      },
      include: {
        santri: {
          select: {
            id: true,
            namaLengkap: true,
            username: true
          }
        }
      }
    });

    // 4. Fire-and-forget notifyHafalan
    notifyHafalan(
      hafalan.santriId,
      hafalan.status as 'ziyadah' | 'murojaah',
      {
        namaSurat: hafalan.surat,
        ayatAwal: hafalan.ayatMulai,
        ayatAkhir: hafalan.ayatSelesai,
        namaGuru: user.namaLengkap,
      }
    ).catch(console.error);

    return hafalan;
  }

  static async checkOwnership(hafalanId: number, guruId: number): Promise<boolean> {
    const hafalan = await prisma.hafalan.findUnique({
      where: { id: hafalanId },
      select: { santriId: true }
    });
    if (!hafalan) return false;

    const inHalaqah = await prisma.halaqahSantri.findFirst({
      where: { santriId: hafalan.santriId, halaqah: { guruId } },
      select: { id: true }
    });
    return !!inHalaqah;
  }

  static async update(user: AuthUser, id: number, data: any) {
    if (!['guru', 'super_admin'].includes(user.role.name)) {
      throw new Error('Access denied');
    }

    const { santriId, surat, ayatMulai, ayatSelesai, status, tanggal, keterangan } = data;
    if (!santriId || !surat || !ayatMulai || !ayatSelesai || !status) {
      throw new Error('Data tidak lengkap');
    }

    if (user.role.name === 'guru' && !(await this.checkOwnership(id, user.id))) {
      throw new Error('Anda tidak memiliki akses ke data hafalan ini');
    }

    const updateData: Record<string, unknown> = {
      santriId: parseInt(santriId),
      surat,
      ayatMulai: parseInt(ayatMulai),
      ayatSelesai: parseInt(ayatSelesai),
      status,
      keterangan
    };

    if (tanggal) {
      updateData.tanggal = new Date(tanggal);
    }

    const hafalan = await prisma.hafalan.update({
      where: { id },
      data: updateData,
      include: {
        santri: {
          select: { id: true, namaLengkap: true, username: true }
        }
      }
    });

    return hafalan;
  }

  static async delete(user: AuthUser, id: number) {
    if (!['guru', 'super_admin'].includes(user.role.name)) {
      throw new Error('Access denied');
    }

    if (user.role.name === 'guru' && !(await this.checkOwnership(id, user.id))) {
      throw new Error('Anda tidak memiliki akses ke data hafalan ini');
    }

    await prisma.hafalan.delete({
      where: { id }
    });

    return { success: true };
  }

  static async listHafalan(user: AuthUser, filters: { halaqahId?: string | null, santriId?: string | null, tanggal?: string | null }) {
    const where: any = {};
    let santriIds: number[] = [];

    if (user.role.name === "guru") {
      const guruSantri = await prisma.halaqahSantri.findMany({
        where: { halaqah: { guruId: user.id } },
        select: { santriId: true }
      });
      santriIds = guruSantri.map(hs => hs.santriId);
    } else if (user.role.name === "santri") {
      santriIds = [user.id];
    } else if (user.role.name === "ortu") {
      const anak = await prisma.orangTuaSantri.findMany({
        where: { orangTuaId: user.id },
        select: { santriId: true }
      });
      santriIds = anak.map(a => a.santriId);
    }

    if (filters.halaqahId) {
      const halaqahSantri = await prisma.halaqahSantri.findMany({
        where: { halaqahId: Number(filters.halaqahId) },
        select: { santriId: true }
      });
      const halaqahSantriIds = halaqahSantri.map(hs => hs.santriId);
      santriIds = santriIds.length > 0
        ? santriIds.filter(id => halaqahSantriIds.includes(id))
        : halaqahSantriIds;
    }

    if (santriIds.length > 0) {
      where.santriId = { in: santriIds };
    }

    if (filters.santriId) {
      const targetSantriId = Number(filters.santriId);
      const isStaff = ["super_admin", "yayasan"].includes(user.role.name);
      if (isStaff || santriIds.includes(targetSantriId)) {
        where.santriId = targetSantriId;
      } else {
        throw new HafalanServiceError("Anda tidak memiliki akses ke data santri ini", 403);
      }
    }

    if (filters.tanggal) {
      where.tanggal = {
        gte: new Date(filters.tanggal + " 00:00:00"),
        lt: new Date(filters.tanggal + " 23:59:59")
      };
    }

    return await prisma.hafalan.findMany({
      where,
      include: { santri: { select: { id: true, namaLengkap: true, username: true } } },
      orderBy: { tanggal: "desc" }
    });
  }

  static async createHafalan(user: AuthUser, data: any) {
    const { santriId, surat, ayatMulai, ayatSelesai, jenis, halaqahId, tanggal } = data;
    if (!santriId || !surat || !ayatMulai || !ayatSelesai || !jenis || !tanggal) {
      throw new HafalanServiceError("Missing required fields", 400);
    }

    if (user.role.name === "guru") {
      const guruSantri = await prisma.halaqahSantri.findMany({
        where: { halaqah: { guruId: user.id } },
        select: { santriId: true }
      });
      const guruSantriIds = guruSantri.map(hs => hs.santriId);
      if (!guruSantriIds.includes(Number(santriId))) {
        throw new HafalanServiceError("Santri tidak terdaftar di halaqah Anda", 403);
      }
    }

    if (halaqahId) {
      const halaqahSantri = await prisma.halaqahSantri.findFirst({
        where: { halaqahId: Number(halaqahId), santriId: Number(santriId) }
      });
      if (!halaqahSantri) throw new HafalanServiceError("Santri tidak terdaftar di halaqah ini", 400);
    }

    return await prisma.hafalan.create({
      data: {
        santriId: Number(santriId),
        surat,
        ayatMulai: Number(ayatMulai),
        ayatSelesai: Number(ayatSelesai),
        status: jenis === "ziyadah" ? "ziyadah" : "murojaah",
        tanggal: new Date(tanggal)
      },
      include: { santri: { select: { id: true, namaLengkap: true, username: true } } }
    });
  }
}
