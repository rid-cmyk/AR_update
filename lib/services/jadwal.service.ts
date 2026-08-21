import { prisma } from '@/lib/database/prisma';
import { type AuthUser } from '@/lib/auth';

export class JadwalService {
  static async list(user: AuthUser, filters: { halaqahId?: string; isTemplate?: string; isActive?: string }) {
    const whereClause: Record<string, unknown> = {};

    if (user.role.name === 'guru') {
      const guruPermissions = await prisma.guruPermission.findMany({ where: { guruId: user.id, isActive: true }, select: { halaqahId: true } });
      const permittedHalaqahIds = guruPermissions.map(p => p.halaqahId);
      whereClause.halaqah = { OR: [{ guruId: user.id }, { id: { in: permittedHalaqahIds } }] };
    } else if (user.role.name === 'santri') {
      whereClause.halaqah = { santri: { some: { santriId: user.id } } };
    }

    if (filters.halaqahId) whereClause.halaqahId = parseInt(filters.halaqahId);
    if (filters.isTemplate !== undefined && filters.isTemplate !== null) whereClause.isTemplate = filters.isTemplate === 'true';
    if (filters.isActive !== undefined && filters.isActive !== null) whereClause.isActive = filters.isActive === 'true';

    const jadwal = await prisma.jadwal.findMany({
      where: whereClause,
      select: {
        id: true, hari: true, jamMulai: true, jamSelesai: true, isTemplate: true, tanggalMulai: true, tanggalSelesai: true, isActive: true, createdAt: true, updatedAt: true,
        halaqah: { select: { id: true, namaHalaqah: true, guru: { select: { id: true, namaLengkap: true } }, _count: { select: { santri: true } } } }
      },
      orderBy: [{ hari: 'asc' }, { jamMulai: 'asc' }]
    });

    return jadwal.map(j => ({
      id: j.id, hari: j.hari, jamMulai: j.jamMulai, jamSelesai: j.jamSelesai,
      isTemplate: (j as Record<string, unknown>).isTemplate ?? true,
      tanggalMulai: (j as Record<string, unknown>).tanggalMulai ?? null,
      tanggalSelesai: (j as Record<string, unknown>).tanggalSelesai ?? null,
      isActive: (j as Record<string, unknown>).isActive ?? true,
      createdAt: (j as Record<string, unknown>).createdAt ?? new Date(),
      updatedAt: (j as Record<string, unknown>).updatedAt ?? new Date(),
      halaqah: { id: j.halaqah.id, namaHalaqah: j.halaqah.namaHalaqah, guru: j.halaqah.guru, jumlahSantri: j.halaqah._count.santri }
    }));
  }

  static async checkConflict(hari: string, jamMulai: string, jamSelesai: string, halaqahId: number, excludeId?: number) {
    const mulai = new Date(`2000-01-01T${jamMulai}`);
    const selesai = new Date(`2000-01-01T${jamSelesai}`);
    if (mulai >= selesai) throw new JadwalServiceError('Jam mulai harus lebih awal dari jam selesai', 400);

    const whereClause: any = {
      hari: hari as any,
      halaqahId,
      isActive: true,
      OR: [
        { AND: [{ jamMulai: { lte: mulai } }, { jamSelesai: { gt: mulai } }] },
        { AND: [{ jamMulai: { lt: selesai } }, { jamSelesai: { gte: selesai } }] },
        { AND: [{ jamMulai: { gte: mulai } }, { jamSelesai: { lte: selesai } }] }
      ]
    };

    if (excludeId) {
      whereClause.id = { not: excludeId };
    }

    const conflictingJadwal = await prisma.jadwal.findFirst({
      where: whereClause,
      include: { halaqah: { select: { namaHalaqah: true } } }
    });

    if (conflictingJadwal) {
      const jamMulaiStr = conflictingJadwal.jamMulai.toTimeString().slice(0, 5);
      const jamSelesaiStr = conflictingJadwal.jamSelesai.toTimeString().slice(0, 5);
      throw new JadwalServiceError(`Jadwal bentrok dengan jadwal ${(conflictingJadwal as any).halaqah.namaHalaqah} pada hari ${hari} jam ${jamMulaiStr}-${jamSelesaiStr}`, 400);
    }
  }

  static async create(user: AuthUser, data: { hari: string; jamMulai: string; jamSelesai: string; halaqahId: string | number; isTemplate?: boolean; tanggalMulai?: string; tanggalSelesai?: string; isActive?: boolean }) {
    const { hari, jamMulai, jamSelesai, halaqahId, isTemplate = true, tanggalMulai, tanggalSelesai, isActive = true } = data;
    if (!hari || !jamMulai || !jamSelesai || !halaqahId) throw new JadwalServiceError('Hari, jam mulai, jam selesai, dan halaqah harus diisi', 400);

    const halaqah = await prisma.halaqah.findUnique({ where: { id: parseInt(String(halaqahId)) } });
    if (!halaqah) throw new JadwalServiceError('Halaqah tidak ditemukan', 404);

    const mulai = new Date(`2000-01-01T${jamMulai}`);
    const selesai = new Date(`2000-01-01T${jamSelesai}`);
    if (mulai >= selesai) throw new JadwalServiceError('Jam mulai harus lebih awal dari jam selesai', 400);

    if (tanggalMulai && tanggalSelesai) {
      if (new Date(tanggalMulai) >= new Date(tanggalSelesai)) throw new JadwalServiceError('Tanggal mulai harus lebih awal dari tanggal selesai', 400);
    }

    await this.checkConflict(hari, jamMulai, jamSelesai, parseInt(String(halaqahId)));

    const jadwal = await prisma.jadwal.create({
      data: {
        hari: hari as any, jamMulai: new Date(`2000-01-01T${jamMulai}`), jamSelesai: new Date(`2000-01-01T${jamSelesai}`),
        halaqah: { connect: { id: parseInt(String(halaqahId)) } },
        isTemplate: Boolean(isTemplate), isActive: Boolean(isActive),
        ...(tanggalMulai && { tanggalMulai: new Date(tanggalMulai) }),
        ...(tanggalSelesai && { tanggalSelesai: new Date(tanggalSelesai) })
      },
      select: {
        id: true, hari: true, jamMulai: true, jamSelesai: true, isTemplate: true, tanggalMulai: true, tanggalSelesai: true, isActive: true,
        halaqah: { select: { id: true, namaHalaqah: true, guru: { select: { id: true, namaLengkap: true } }, _count: { select: { santri: true } } } }
      }
    });

    return {
      id: jadwal.id, hari: jadwal.hari, jamMulai: jadwal.jamMulai, jamSelesai: jadwal.jamSelesai,
      isTemplate: jadwal.isTemplate ?? true, tanggalMulai: jadwal.tanggalMulai ?? null, tanggalSelesai: jadwal.tanggalSelesai ?? null, isActive: jadwal.isActive ?? true,
      halaqah: { id: (jadwal as any).halaqah.id, namaHalaqah: (jadwal as any).halaqah.namaHalaqah, guru: (jadwal as any).halaqah.guru, jumlahSantri: (jadwal as any).halaqah._count.santri }
    };
  }

  static async listForGuru(user: AuthUser, halaqahId?: string) {
    const whereClause: Record<string, unknown> = { halaqah: { guruId: user.id } };
    if (halaqahId) whereClause.halaqahId = parseInt(halaqahId);

    const jadwal = await prisma.jadwal.findMany({
      where: whereClause,
      include: { halaqah: { include: { santri: { include: { santri: { select: { id: true, namaLengkap: true } } } } } } },
      orderBy: [{ hari: 'asc' }, { jamMulai: 'asc' }]
    });

    return jadwal.map(j => ({
      id: j.id, hari: j.hari, jamMulai: j.jamMulai, jamSelesai: j.jamSelesai,
      halaqah: { id: j.halaqah.id, namaHalaqah: j.halaqah.namaHalaqah, jumlahSantri: j.halaqah.santri.length, santri: j.halaqah.santri.map(hs => hs.santri) }
    }));
  }

  static async updateForGuru(user: AuthUser, data: { jadwalId: string | number; jamMulai: string; jamSelesai: string }) {
    const { jadwalId, jamMulai, jamSelesai } = data;
    if (!jadwalId || !jamMulai || !jamSelesai) throw new JadwalServiceError('Jadwal ID, jam mulai, dan jam selesai harus diisi', 400);

    const jadwal = await prisma.jadwal.findFirst({ where: { id: parseInt(String(jadwalId)), halaqah: { guruId: user.id } } });
    if (!jadwal) throw new JadwalServiceError('Jadwal not found or access denied', 404);

    const mulai = new Date(`2000-01-01T${jamMulai}`);
    const selesai = new Date(`2000-01-01T${jamSelesai}`);
    if (mulai >= selesai) throw new JadwalServiceError('Jam mulai harus lebih awal dari jam selesai', 400);

    const updatedJadwal = await prisma.jadwal.update({
      where: { id: parseInt(String(jadwalId)) },
      data: { jamMulai: new Date(`2000-01-01T${jamMulai}`), jamSelesai: new Date(`2000-01-01T${jamSelesai}`) },
      include: { halaqah: { include: { santri: { include: { santri: { select: { id: true, namaLengkap: true } } } } } } }
    });

    return {
      id: updatedJadwal.id, hari: updatedJadwal.hari, jamMulai: updatedJadwal.jamMulai, jamSelesai: updatedJadwal.jamSelesai,
      halaqah: { id: updatedJadwal.halaqah.id, namaHalaqah: updatedJadwal.halaqah.namaHalaqah, jumlahSantri: updatedJadwal.halaqah.santri.length, santri: updatedJadwal.halaqah.santri.map(hs => hs.santri) }
    };
  }

  static async listForSantri(user: AuthUser) {
    const jadwal = await prisma.jadwal.findMany({
      where: { halaqah: { santri: { some: { santriId: user.id } } } },
      include: { halaqah: { include: { guru: { select: { id: true, namaLengkap: true } }, santri: { include: { santri: { select: { id: true, namaLengkap: true } } } } } } },
      orderBy: [{ hari: 'asc' }, { jamMulai: 'asc' }]
    });

    return jadwal.map(j => ({
      id: j.id, hari: j.hari, jamMulai: j.jamMulai, jamSelesai: j.jamSelesai,
      halaqah: { id: j.halaqah.id, namaHalaqah: j.halaqah.namaHalaqah, guru: j.halaqah.guru, jumlahSantri: j.halaqah.santri.length }
    }));
  }

  static async getById(user: AuthUser, id: number) {
    if (isNaN(id)) throw new JadwalServiceError('Invalid jadwal ID', 400);
    
    const jadwal = await prisma.jadwal.findUnique({
      where: { id },
      select: {
        id: true, hari: true, jamMulai: true, jamSelesai: true, isTemplate: true, tanggalMulai: true, tanggalSelesai: true, isActive: true, createdAt: true, updatedAt: true,
        halaqah: { select: { id: true, namaHalaqah: true, guru: { select: { id: true, namaLengkap: true } }, _count: { select: { santri: true } } } }
      }
    });

    if (!jadwal) throw new JadwalServiceError('Jadwal not found', 404);

    return {
      id: jadwal.id, hari: jadwal.hari, jamMulai: jadwal.jamMulai, jamSelesai: jadwal.jamSelesai,
      isTemplate: (jadwal as any).isTemplate ?? true,
      tanggalMulai: (jadwal as any).tanggalMulai ?? null,
      tanggalSelesai: (jadwal as any).tanggalSelesai ?? null,
      isActive: (jadwal as any).isActive ?? true,
      createdAt: (jadwal as any).createdAt ?? new Date(),
      updatedAt: (jadwal as any).updatedAt ?? new Date(),
      halaqah: { id: jadwal.halaqah.id, namaHalaqah: jadwal.halaqah.namaHalaqah, guru: jadwal.halaqah.guru, jumlahSantri: jadwal.halaqah._count.santri }
    };
  }

  static async update(user: AuthUser, id: number, data: { hari: string; jamMulai: string; jamSelesai: string; halaqahId: string | number; isTemplate?: boolean; tanggalMulai?: string; tanggalSelesai?: string; isActive?: boolean }) {
    if (!['super_admin', 'yayasan'].includes(user.role.name)) {
      throw new JadwalServiceError('Access denied', 403);
    }
    
    if (isNaN(id)) throw new JadwalServiceError('Invalid jadwal ID', 400);

    const { hari, jamMulai, jamSelesai, halaqahId, isTemplate, tanggalMulai, tanggalSelesai, isActive } = data;
    if (!hari || !jamMulai || !jamSelesai || !halaqahId) throw new JadwalServiceError('Hari, jam mulai, jam selesai, dan halaqah harus diisi', 400);

    const existingJadwal = await prisma.jadwal.findUnique({ where: { id } });
    if (!existingJadwal) throw new JadwalServiceError('Jadwal not found', 404);

    if (tanggalMulai && tanggalSelesai) {
      if (new Date(tanggalMulai) >= new Date(tanggalSelesai)) throw new JadwalServiceError('Tanggal mulai harus lebih awal dari tanggal selesai', 400);
    }

    await this.checkConflict(hari, jamMulai, jamSelesai, parseInt(String(halaqahId)), id);

    const updatedJadwal = await prisma.jadwal.update({
      where: { id },
      data: {
        hari: hari as any, jamMulai: new Date(`2000-01-01T${jamMulai}`), jamSelesai: new Date(`2000-01-01T${jamSelesai}`),
        halaqah: { connect: { id: parseInt(String(halaqahId)) } },
        ...(isTemplate !== undefined && { isTemplate: Boolean(isTemplate) }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
        ...(tanggalMulai && { tanggalMulai: new Date(tanggalMulai) }),
        ...(tanggalSelesai && { tanggalSelesai: new Date(tanggalSelesai) })
      },
      select: {
        id: true, hari: true, jamMulai: true, jamSelesai: true, isTemplate: true, tanggalMulai: true, tanggalSelesai: true, isActive: true,
        halaqah: { select: { id: true, namaHalaqah: true, guru: { select: { id: true, namaLengkap: true } }, _count: { select: { santri: true } } } }
      }
    });

    return updatedJadwal;
  }

  static async delete(user: AuthUser, id: number) {
    if (!['super_admin', 'yayasan'].includes(user.role.name)) {
      throw new JadwalServiceError('Access denied', 403);
    }
    
    if (isNaN(id)) throw new JadwalServiceError('Invalid jadwal ID', 400);

    const existingJadwal = await prisma.jadwal.findUnique({ where: { id } });
    if (!existingJadwal) throw new JadwalServiceError('Jadwal not found', 404);

    await prisma.jadwal.delete({ where: { id } });
    return { success: true, message: 'Jadwal berhasil dihapus' };
  }

  static async toggleActive(user: AuthUser, id: number) {
    if (!['super_admin', 'yayasan'].includes(user.role.name)) {
      throw new JadwalServiceError('Access denied', 403);
    }
    
    if (isNaN(id)) throw new JadwalServiceError('Invalid jadwal ID', 400);

    const existingJadwal = await prisma.jadwal.findUnique({ where: { id } });
    if (!existingJadwal) throw new JadwalServiceError('Jadwal not found', 404);

    const isActive = !(existingJadwal as any).isActive;
    await prisma.jadwal.update({
      where: { id },
      data: { isActive }
    });

    return { success: true, isActive };
  }

  static async listByHalaqah(halaqahId: number) {
    if (isNaN(halaqahId)) throw new JadwalServiceError('Invalid halaqah ID', 400);

    const jadwal = await prisma.jadwal.findMany({
      where: { halaqahId },
      orderBy: [{ hari: 'asc' }, { jamMulai: 'asc' }]
    });

    return jadwal;
  }
}

export class JadwalServiceError extends Error {
  constructor(message: string, public statusCode: number = 500) {
    super(message);
    this.name = 'JadwalServiceError';
  }
}
