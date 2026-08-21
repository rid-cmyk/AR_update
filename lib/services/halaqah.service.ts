import prisma from '@/lib/database/prisma';
import { logHalaqahAction } from '@/lib/halaqah-logger';
import { getCurrentTahunAjaranId } from '@/lib/tahun-akademik';

interface AuthUser {
  id: number;
  namaLengkap: string;
  role: { name: string };
}

export class HalaqahService {
  static async listAll() {
    const halaqah = await prisma.halaqah.findMany({
      select: {
        id: true,
        namaHalaqah: true,
        guru: {
          select: {
            id: true,
            namaLengkap: true,
          }
        },
        santri: {
          select: {
            santri: {
              select: {
                id: true,
                namaLengkap: true,
              }
            }
          }
        }
      },
      orderBy: { id: 'desc' }
    });

    return halaqah.map(h => ({
      id: h.id,
      namaHalaqah: h.namaHalaqah,
      guru: h.guru,
      santri: h.santri.map(s => s.santri),
      jumlahSantri: h.santri.length
    }));
  }

  static async create(
    user: AuthUser,
    data: { namaHalaqah: string; guruId?: string | number; santriIds: (string | number)[] }
  ) {
    const { namaHalaqah, guruId, santriIds } = data;

    if (!namaHalaqah) {
      throw new Error('Nama halaqah is required');
    }

    if (!santriIds || !Array.isArray(santriIds) || santriIds.length < 5) {
      throw new Error('At least 5 santri must be selected');
    }

    const existingAssignments = await prisma.halaqahSantri.findMany({
      where: {
        santriId: {
          in: santriIds.map(id => Number(id))
        }
      },
      include: {
        halaqah: true,
        santri: true
      }
    });

    if (existingAssignments.length > 0) {
      const conflictingSantri = existingAssignments.map(assignment => 
        `${assignment.santri.namaLengkap} (sudah di ${assignment.halaqah.namaHalaqah})`
      );
      throw new Error(`Santri berikut sudah terdaftar di halaqah lain: ${conflictingSantri.join(', ')}`);
    }

    const halaqah = await prisma.halaqah.create({
      data: {
        namaHalaqah,
        ...(guruId && { guruId: Number(guruId) })
      }
    });

    if (santriIds && Array.isArray(santriIds) && santriIds.length > 0) {
      const tahunAjaranId = await getCurrentTahunAjaranId();

      const santriAssignments = santriIds.map((santriId) => ({
        halaqahId: halaqah.id,
        santriId: Number(santriId),
        tahunAjaranId
      }));

      await prisma.halaqahSantri.createMany({
        data: santriAssignments
      });
    }

    const halaqahWithRelations = await prisma.halaqah.findUnique({
      where: { id: halaqah.id },
      select: {
        id: true,
        namaHalaqah: true,
        guru: {
          select: {
            id: true,
            namaLengkap: true,
          }
        },
        santri: {
          select: {
            santri: {
              select: {
                id: true,
                namaLengkap: true,
              }
            }
          }
        }
      }
    });

    if (!halaqahWithRelations) {
      throw new Error('Failed to retrieve created halaqah');
    }

    await logHalaqahAction({
      action: 'CREATE',
      halaqahId: halaqahWithRelations.id,
      halaqahName: halaqahWithRelations.namaHalaqah,
      userId: user.id,
      details: { santriCount: halaqahWithRelations.santri.length, guruId }
    });

    return {
      id: halaqahWithRelations.id,
      namaHalaqah: halaqahWithRelations.namaHalaqah,
      guru: halaqahWithRelations.guru,
      santri: halaqahWithRelations.santri.map((s: { santri: Record<string, unknown> }) => s.santri),
      jumlahSantri: halaqahWithRelations.santri.length
    };
  }

  // ─── halaqah/[id] ─────────────────────────────────────────────

  static async getById(id: number) {
    if (isNaN(id)) throw new HalaqahServiceError('Invalid halaqah ID', 400);
    const halaqah = await prisma.halaqah.findUnique({
      where: { id },
      include: { guru: true, santri: { include: { santri: true } } }
    });
    if (!halaqah) throw new HalaqahServiceError('Halaqah not found', 404);
    return {
      id: halaqah.id, namaHalaqah: halaqah.namaHalaqah, guru: halaqah.guru,
      santri: halaqah.santri.map(s => s.santri), jumlahSantri: halaqah.santri.length
    };
  }

  static async updateById(id: number, user: AuthUser, data: { namaHalaqah?: string; guruId?: string | number; santriIds?: (string | number)[] }) {
    if (isNaN(id)) throw new HalaqahServiceError('Invalid halaqah ID', 400);
    const { namaHalaqah, guruId, santriIds } = data;
    if (!namaHalaqah) throw new HalaqahServiceError('Nama halaqah is required', 400);
    if (!santriIds || !Array.isArray(santriIds) || santriIds.length < 5) throw new HalaqahServiceError('At least 5 santri must be selected', 400);

    const existingAssignments = await prisma.halaqahSantri.findMany({
      where: { santriId: { in: santriIds.map(id => Number(id)) }, halaqahId: { not: id } },
      include: { halaqah: true, santri: true }
    });
    if (existingAssignments.length > 0) {
      const conflicting = existingAssignments.map(a => `${a.santri.namaLengkap} (sudah di ${a.halaqah.namaHalaqah})`);
      throw new HalaqahServiceError(`Santri berikut sudah terdaftar di halaqah lain: ${conflicting.join(', ')}`, 400);
    }

    const existingHalaqah = await prisma.halaqah.findUnique({ where: { id } });
    if (!existingHalaqah) throw new HalaqahServiceError('Halaqah not found', 404);

    await prisma.$transaction(async (tx) => {
      await tx.halaqah.update({ where: { id }, data: { namaHalaqah, ...(guruId && { guruId: Number(guruId) }) } });
      await tx.halaqahSantri.deleteMany({ where: { halaqahId: id } });
      if (santriIds.length > 0) {
        const tahunAjaranId = await getCurrentTahunAjaranId();
        await tx.halaqahSantri.createMany({
          data: santriIds.map((santriId: string | number) => ({ halaqahId: id, santriId: Number(santriId), tahunAjaranId }))
        });
      }
    });

    const halaqahWithRelations = await prisma.halaqah.findUnique({
      where: { id },
      include: { guru: true, santri: { include: { santri: true } } }
    });
    if (!halaqahWithRelations) throw new HalaqahServiceError('Failed to retrieve updated halaqah', 500);

    await logHalaqahAction({
      action: 'UPDATE', halaqahId: halaqahWithRelations.id, halaqahName: halaqahWithRelations.namaHalaqah,
      userId: user.id, details: { santriCount: halaqahWithRelations.santri.length, guruId }
    });

    return {
      id: halaqahWithRelations.id, namaHalaqah: halaqahWithRelations.namaHalaqah, guru: halaqahWithRelations.guru,
      santri: halaqahWithRelations.santri.map((s: { santri: Record<string, unknown> }) => s.santri),
      jumlahSantri: halaqahWithRelations.santri.length
    };
  }

  static async deleteById(id: number, user: AuthUser) {
    if (isNaN(id)) throw new HalaqahServiceError('Invalid halaqah ID', 400);
    const existingHalaqah = await prisma.halaqah.findUnique({
      where: { id }, include: { santri: { select: { santriId: true } }, jadwal: true }
    });
    if (!existingHalaqah) throw new HalaqahServiceError('Halaqah not found', 404);

    const santriIds = existingHalaqah.santri.map(hs => hs.santriId);
    const ujianCount = santriIds.length > 0 ? await prisma.ujianSantri.count({ where: { santriId: { in: santriIds } } }) : 0;
    if (ujianCount > 0) throw new HalaqahServiceError('Cannot delete halaqah with existing ujian records', 400);

    await prisma.$transaction(async (tx) => {
      await tx.halaqahSantri.deleteMany({ where: { halaqahId: id } });
      await tx.jadwal.deleteMany({ where: { halaqahId: id } });
      await tx.halaqah.delete({ where: { id } });
    });

    await logHalaqahAction({
      action: 'DELETE', halaqahId: id, halaqahName: existingHalaqah.namaHalaqah,
      userId: user.id, details: { santriCount: existingHalaqah.santri.length }
    });

    return { message: 'Halaqah berhasil dihapus', deletedId: id };
  }

  // ─── admin/halaqah ────────────────────────────────────────────

  static async listForAdmin(tahunAjaranId?: string) {
    const whereClause: Record<string, unknown> = {};
    const santriFilter = tahunAjaranId && !isNaN(Number(tahunAjaranId)) ? { tahunAjaranId: Number(tahunAjaranId) } : undefined;
    if (santriFilter) whereClause.santri = { some: santriFilter };

    const halaqahList = await prisma.halaqah.findMany({
      where: whereClause,
      include: {
        guru: { select: { namaLengkap: true } },
        santri: santriFilter ? { where: santriFilter } : undefined,
        _count: { select: { santri: santriFilter ? { where: santriFilter } : true } }
      },
      orderBy: { namaHalaqah: 'asc' }
    });

    return halaqahList.map(h => ({ id: h.id, namaHalaqah: h.namaHalaqah, guru: h.guru, santriCount: h._count.santri }));
  }

  // ─── guru/halaqah ─────────────────────────────────────────────

  static async listForGuru(user: AuthUser) {
    const halaqahs = await prisma.halaqah.findMany({
      where: { guruId: user.id },
      include: {
        guru: { select: { id: true, namaLengkap: true } },
        santri: { include: { santri: { select: { id: true, namaLengkap: true, username: true } } } }
      },
      orderBy: { namaHalaqah: 'asc' }
    });
    return halaqahs.map(h => ({
      id: h.id, namaHalaqah: h.namaHalaqah, guru: h.guru,
      jumlahSantri: h.santri.length, santri: h.santri.map(s => s.santri)
    }));
  }

  // ─── guru/accessible-halaqah ──────────────────────────────────

  static async listAccessible(user: AuthUser) {
    const ownHalaqahs = await prisma.halaqah.findMany({
      where: { guruId: user.id },
      include: {
        guru: { select: { id: true, namaLengkap: true } },
        santri: { include: { santri: { select: { id: true, namaLengkap: true } } } }
      }
    });

    const permittedHalaqahs = await prisma.guruPermission.findMany({
      where: { guruId: user.id, isActive: true },
      include: {
        halaqah: {
          include: {
            guru: { select: { id: true, namaLengkap: true } },
            santri: { include: { santri: { select: { id: true, namaLengkap: true } } } }
          }
        }
      }
    });

    const accessibleHalaqahs = [
      ...ownHalaqahs.map(h => ({
        id: h.id, namaHalaqah: h.namaHalaqah, guru: h.guru, jumlahSantri: h.santri.length,
        accessType: 'own' as const,
        permissions: { canAbsensi: true, canHafalan: true, canTarget: true }
      })),
      ...permittedHalaqahs.map(p => ({
        id: p.halaqah.id, namaHalaqah: p.halaqah.namaHalaqah, guru: p.halaqah.guru,
        jumlahSantri: p.halaqah.santri.length, accessType: 'permitted' as const,
        permissions: { canAbsensi: p.canAbsensi, canHafalan: p.canHafalan, canTarget: p.canTarget }
      }))
    ];

    const uniqueHalaqahs = accessibleHalaqahs.reduce((acc, current) => {
      const existing = acc.find(h => h.id === current.id);
      if (!existing) acc.push(current);
      else if (current.accessType === 'own') acc[acc.findIndex(h => h.id === current.id)] = current;
      return acc;
    }, [] as typeof accessibleHalaqahs);

    return uniqueHalaqahs.sort((a, b) => {
      if (a.accessType === 'own' && b.accessType !== 'own') return -1;
      if (a.accessType !== 'own' && b.accessType === 'own') return 1;
      return a.namaHalaqah.localeCompare(b.namaHalaqah);
    });
  }

  // ─── admin/sync/halaqah ───────────────────────────────────────

  static async getSyncStatus() {
    return {
      totalHalaqah: await prisma.halaqah.count(),
      totalSantri: await prisma.user.count({ where: { role: { name: 'santri' } } }),
      totalGuru: await prisma.user.count({ where: { role: { name: 'guru' } } }),
      totalAssignments: await prisma.halaqahSantri.count(),
      halaqahWithGuru: await prisma.halaqah.count({ where: { guruId: { gt: 0 } } }),
      santriAssigned: await prisma.user.count({ where: { role: { name: 'santri' }, HalaqahSantri: { some: {} } } })
    };
  }

  static async runSync() {
    const syncResults = { duplicateSantri: [] as any[], orphanedAssignments: [] as any[], halaqahWithoutSantri: [] as any[], santriWithoutHalaqah: [] as any[], fixed: [] as string[] };

    const duplicateAssignments = await prisma.$queryRaw`
      SELECT santriId, COUNT(*) as count, array_agg(halaqahId) as halaqahIds
      FROM "HalaqahSantri" GROUP BY santriId HAVING COUNT(*) > 1
    `;
    syncResults.duplicateSantri = duplicateAssignments as any[];

    const orphanedAssignments = await prisma.halaqahSantri.findMany({
      where: { NOT: { santri: { id: { gt: 0 } } } }, include: { halaqah: true }
    });
    syncResults.orphanedAssignments = orphanedAssignments;

    syncResults.halaqahWithoutSantri = await prisma.halaqah.findMany({ where: { santri: { none: {} } } });

    syncResults.santriWithoutHalaqah = await prisma.user.findMany({
      where: { role: { name: 'santri' }, HalaqahSantri: { none: {} } },
      select: { id: true, namaLengkap: true, username: true }
    });

    if (orphanedAssignments.length > 0) {
      await prisma.halaqahSantri.deleteMany({ where: { id: { in: orphanedAssignments.map(oa => oa.id) } } });
      syncResults.fixed.push(`Removed ${orphanedAssignments.length} orphaned assignments`);
    }

    return syncResults;
  }
}

export class HalaqahServiceError extends Error {
  constructor(message: string, public statusCode: number = 500) {
    super(message);
    this.name = 'HalaqahServiceError';
  }
}
