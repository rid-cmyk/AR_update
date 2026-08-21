import { prisma } from '@/lib/database/prisma';

export interface AuthUser {
  id: number;
  namaLengkap: string;
  role: { name: string };
}

export class GuruPermissionServiceError extends Error {
  constructor(message: string, public statusCode: number = 500) {
    super(message);
    this.name = 'GuruPermissionServiceError';
  }
}

export class GuruPermissionService {
  private static checkAdmin(user: AuthUser) {
    if (!['super_admin'].includes(user.role.name)) throw new GuruPermissionServiceError('Access denied', 403);
  }

  static async list(user: AuthUser, filters: { guruId?: number }) {
    this.checkAdmin(user);
    
    const whereClause: any = {};
    if (filters.guruId) whereClause.guruId = filters.guruId;

    return await prisma.guruPermission.findMany({
      where: whereClause,
      include: {
        guru: { select: { id: true, namaLengkap: true, username: true } },
        halaqah: { select: { id: true, namaHalaqah: true, guru: { select: { namaLengkap: true } } } }
      },
      orderBy: [
        { guru: { namaLengkap: 'asc' } },
        { halaqah: { namaHalaqah: 'asc' } }
      ]
    });
  }

  static async upsert(user: AuthUser, data: any) {
    this.checkAdmin(user);
    
    const { guruId, halaqahId, canAbsensi = true, canHafalan = false, canTarget = false, isActive = true } = data;
    if (!guruId || !halaqahId) throw new GuruPermissionServiceError('guruId dan halaqahId harus diisi', 400);

    const guru = await prisma.user.findUnique({ where: { id: parseInt(guruId) }, include: { role: true } });
    if (!guru) throw new GuruPermissionServiceError('Guru tidak ditemukan', 404);
    if (guru.role.name !== 'guru') throw new GuruPermissionServiceError('User bukan guru', 400);

    const halaqah = await prisma.halaqah.findUnique({ where: { id: parseInt(halaqahId) } });
    if (!halaqah) throw new GuruPermissionServiceError('Halaqah tidak ditemukan', 404);

    const existingPermission = await prisma.guruPermission.findUnique({
      where: {
        guruId_halaqahId: {
          guruId: parseInt(guruId),
          halaqahId: parseInt(halaqahId)
        }
      }
    });

    const result = await prisma.$transaction(async (tx) => {
      let permission;
      if (existingPermission) {
        permission = await tx.guruPermission.update({
          where: { id: existingPermission.id },
          data: { canAbsensi, canHafalan, canTarget, isActive },
          include: {
            guru: { select: { id: true, namaLengkap: true, username: true } },
            halaqah: { select: { id: true, namaHalaqah: true } }
          }
        });
      } else {
        permission = await tx.guruPermission.create({
          data: {
            guruId: parseInt(guruId),
            halaqahId: parseInt(halaqahId),
            canAbsensi,
            canHafalan,
            canTarget,
            isActive,
            createdBy: user.id
          },
          include: {
            guru: { select: { id: true, namaLengkap: true, username: true } },
            halaqah: { select: { id: true, namaHalaqah: true } }
          }
        });
      }

      await tx.auditLog.create({
        data: {
          action: existingPermission ? 'UPDATE_GURU_PERMISSION' : 'CREATE_GURU_PERMISSION',
          keterangan: `${user.namaLengkap} ${existingPermission ? 'mengupdate' : 'memberikan'} permission ${guru.namaLengkap} untuk halaqah ${halaqah.namaHalaqah}`,
          userId: user.id
        }
      });

      return permission;
    });

    return {
      message: `Permission berhasil ${existingPermission ? 'diupdate' : 'dibuat'}`,
      data: result
    };
  }

  static async update(user: AuthUser, id: number, data: any) {
    this.checkAdmin(user);
    if (isNaN(id)) throw new GuruPermissionServiceError('Invalid permission ID', 400);

    const existingPermission = await prisma.guruPermission.findUnique({ where: { id } });
    if (!existingPermission) throw new GuruPermissionServiceError('Permission tidak ditemukan', 404);

    const { canAbsensi, canHafalan, canTarget, isActive } = data;
    const updatedPermission = await prisma.$transaction(async (tx) => {
      const perm = await tx.guruPermission.update({
        where: { id },
        data: {
          canAbsensi: canAbsensi ?? existingPermission.canAbsensi,
          canHafalan: canHafalan ?? existingPermission.canHafalan,
          canTarget: canTarget ?? existingPermission.canTarget,
          isActive: isActive ?? existingPermission.isActive
        },
        include: {
          guru: { select: { id: true, namaLengkap: true, username: true } },
          halaqah: { select: { id: true, namaHalaqah: true } }
        }
      });

      await tx.auditLog.create({
        data: {
          action: 'UPDATE_GURU_PERMISSION',
          keterangan: `${user.namaLengkap} mengupdate permission ${perm.guru.namaLengkap} untuk halaqah ${perm.halaqah.namaHalaqah}`,
          userId: user.id
        }
      });

      return perm;
    });

    return { message: 'Permission berhasil diupdate', data: updatedPermission };
  }

  static async delete(user: AuthUser, id: number) {
    this.checkAdmin(user);
    if (isNaN(id)) throw new GuruPermissionServiceError('Invalid permission ID', 400);

    const permission = await prisma.guruPermission.findUnique({
      where: { id },
      include: {
        guru: { select: { namaLengkap: true } },
        halaqah: { select: { namaHalaqah: true } }
      }
    });

    if (!permission) throw new GuruPermissionServiceError('Permission tidak ditemukan', 404);

    await prisma.$transaction(async (tx) => {
      await tx.guruPermission.delete({ where: { id } });

      await tx.auditLog.create({
        data: {
          action: 'DELETE_GURU_PERMISSION',
          keterangan: `${user.namaLengkap} menghapus permission ${permission.guru.namaLengkap} untuk halaqah ${permission.halaqah.namaHalaqah}`,
          userId: user.id
        }
      });
    });

    return { message: 'Permission berhasil dihapus' };
  }
}
