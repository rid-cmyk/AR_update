import { prisma } from '@/lib/database/prisma';
import { type AuthUser } from '@/lib/auth';
import { formatPhoneNumber } from '@/lib/utils/phoneFormatter';
import { canEditOthersPasscode } from '@/lib/permissions';
import { getDefaultPermissionsForNewRole, syncRolePermissions } from '@/lib/permissions';

const SYSTEM_ROLES = ['super_admin', 'guru', 'santri', 'ortu', 'yayasan'];

export class UserService {
  static async list(roleFilter?: string) {
    const whereClause = roleFilter
      ? { role: { name: { equals: roleFilter, mode: 'insensitive' as const } } }
      : {};

    const users = await prisma.user.findMany({
      where: whereClause,
      include: { role: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' }
    });

    return users.map(u => {
      const { passCode, ...safeUser } = u;
      if (u.role?.name === 'super_admin') return { ...safeUser, passCode };
      return safeUser;
    });
  }

  static async create(data: {
    username: string; namaLengkap: string; email?: string; noTlp?: string;
    roleId: string | number; alamat?: string; children?: number[]; passCode: string;
  }) {
    const { username, namaLengkap, email, noTlp, roleId, alamat, children, passCode } = data;

    if (!username || !namaLengkap || !roleId || !passCode) throw new UserServiceError('Username, nama lengkap, role, dan passcode harus diisi', 400);

    const settingRecord = await prisma.systemSetting.findUnique({ where: { id: 'global' } });
    if (settingRecord?.data) {
      const settings = settingRecord.data as any;
      if (settings.allowRegistration === false) throw new UserServiceError('Pembuatan pengguna baru saat ini ditutup oleh sistem (Registrasi Nonaktif)', 403);
      if (settings.maxUsers) {
        const totalUsers = await prisma.user.count();
        if (totalUsers >= settings.maxUsers) throw new UserServiceError(`Kapasitas pengguna penuh. Sistem dibatasi maksimal ${settings.maxUsers} pengguna.`, 403);
      }
    }

    if (username.trim().length < 3) throw new UserServiceError('Username minimal 3 karakter', 400);
    if (!passCode || passCode.length < 6 || passCode.length > 10 || !/^[a-zA-Z0-9]+$/.test(passCode)) throw new UserServiceError('Passcode harus 6-10 karakter (huruf/angka, tanpa spasi atau simbol)', 400);

    const existingPasscode = await prisma.user.findFirst({ where: { passCode } });
    if (existingPasscode) throw new UserServiceError(`Passcode sudah digunakan oleh ${existingPasscode.namaLengkap} (@${existingPasscode.username})`, 400);

    const existingUser = await prisma.user.findUnique({ where: { username: username.trim() } });
    if (existingUser) throw new UserServiceError('Username sudah digunakan', 400);

    if (email) {
      const existingEmail = await prisma.user.findFirst({ where: { email: email.trim() } });
      if (existingEmail) throw new UserServiceError('Email sudah digunakan', 400);
    }

    const role = await prisma.role.findUnique({ where: { id: parseInt(String(roleId)) } });
    if (!role) throw new UserServiceError('Role tidak ditemukan', 400);

        const formattedPhoneNumber = noTlp ? formatPhoneNumber(noTlp.trim()) : null;

    let validChildren: number[] = [];
    if (role.name.toLowerCase() === 'ortu' && children && children.length > 0) {
      const santriCheck = await prisma.user.findMany({ where: { id: { in: children }, role: { name: 'santri' } } });
      if (santriCheck.length !== children.length) {
        throw new UserServiceError('Beberapa santri yang dipilih tidak valid', 400);
      }
      validChildren = children;
    }

    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          username: username.trim(), namaLengkap: namaLengkap.trim(),
          email: email?.trim() || null, noTlp: formattedPhoneNumber, roleId: parseInt(String(roleId)),
          alamat: alamat?.trim() || null, passCode,
        },
        include: { role: { select: { id: true, name: true } } }
      });

      if (validChildren.length > 0) {
        await tx.orangTuaSantri.createMany({
          data: validChildren.map((santriId: number) => ({ orangTuaId: user.id, santriId }))
        });
      }

      return user;
    });

    const { ...safeUser } = newUser;
    return safeUser;
  }

  static async update(userId: number, data: {
    username: string; namaLengkap: string; email?: string; noTlp?: string;
    roleId: string | number; alamat?: string; children?: number[] | undefined; passCode?: string;
  }) {
    const { username, namaLengkap, email, noTlp, roleId, alamat, children, passCode } = data;

    if (!username || !namaLengkap || !roleId) throw new UserServiceError('Username, nama lengkap, dan role harus diisi', 400);

    const existingUser = await prisma.user.findUnique({ where: { id: userId }, include: { role: true } });
    if (!existingUser) throw new UserServiceError('User tidak ditemukan', 404);

    const duplicateUsername = await prisma.user.findFirst({ where: { username: username.trim(), id: { not: userId } } });
    if (duplicateUsername) throw new UserServiceError('Username sudah digunakan', 400);

    if (email) {
      const duplicateEmail = await prisma.user.findFirst({ where: { email: email.trim(), id: { not: userId } } });
      if (duplicateEmail) throw new UserServiceError('Email sudah digunakan', 400);
    }

    const role = await prisma.role.findUnique({ where: { id: parseInt(String(roleId)) } });
    if (!role) throw new UserServiceError('Role tidak ditemukan', 400);

    if (passCode) {
      if (passCode.length < 6 || passCode.length > 10 || !/^[a-zA-Z0-9]+$/.test(passCode)) throw new UserServiceError('Passcode harus 6-10 karakter (huruf/angka, tanpa spasi atau simbol)', 400);
      const existingPasscode = await prisma.user.findFirst({ where: { passCode, id: { not: userId } } });
      if (existingPasscode) throw new UserServiceError(`Passcode sudah digunakan oleh ${existingPasscode.namaLengkap} (@${existingPasscode.username})`, 400);
    }

    const formattedPhoneNumber = noTlp ? formatPhoneNumber(noTlp.trim()) : null;

    let validChildren: number[] | undefined = undefined;
    if (role.name.toLowerCase() === 'ortu' && children !== undefined) {
      if (children.length > 0) {
        const santriCheck = await prisma.user.findMany({ where: { id: { in: children }, role: { name: 'santri' } } });
        if (santriCheck.length !== children.length) {
          throw new UserServiceError('Beberapa santri yang dipilih tidak valid', 400);
        }
      }
      validChildren = children;
    }

    const updatedUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id: userId },
        data: {
          username: username.trim(), namaLengkap: namaLengkap.trim(),
          email: email?.trim() || null, noTlp: formattedPhoneNumber,
          roleId: parseInt(String(roleId)), alamat: alamat?.trim() || null,
          ...(passCode && { passCode }),
        },
        include: { role: { select: { id: true, name: true } } }
      });

      if (formattedPhoneNumber && formattedPhoneNumber !== existingUser.noTlp) {
        try {
          await tx.forgotPasscode.updateMany({ where: { phoneNumber: formattedPhoneNumber, isRegistered: false }, data: { isRegistered: true, userId } });
          if (existingUser.noTlp) {
            await tx.forgotPasscode.updateMany({ where: { phoneNumber: existingUser.noTlp, userId }, data: { phoneNumber: formattedPhoneNumber } });
          }
        } catch (syncError) {
          console.warn('Failed to sync forgot passcode notifications:', syncError);
        }
      }

      if (validChildren !== undefined) {
        await tx.orangTuaSantri.deleteMany({ where: { orangTuaId: userId } });
        if (validChildren.length > 0) {
          await tx.orangTuaSantri.createMany({
            data: validChildren.map((santriId: number) => ({ orangTuaId: userId, santriId }))
          });
        }
      }

      return user;
    });

    const { passCode: passCodeFromDb, ...safeUser } = updatedUser;
    return { ...safeUser, passCode: passCodeFromDb };
  }

  static async delete(userId: number) {
    const existingUser = await prisma.user.findUnique({ where: { id: userId }, include: { role: true } });
    if (!existingUser) throw new UserServiceError('User tidak ditemukan', 404);
    if (existingUser.role.name.toLowerCase() === 'super_admin') throw new UserServiceError('Tidak dapat menghapus Super Admin', 400);
    await prisma.user.delete({ where: { id: userId } });
    return { message: 'User berhasil dihapus' };
  }

  static async updatePhoto(userId: number, foto: string, currentUser: AuthUser) {
    const existingUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!existingUser) throw new UserServiceError('User tidak ditemukan', 404);
    if (currentUser.id !== userId && !['super_admin'].includes(currentUser.role.name)) throw new UserServiceError('Tidak memiliki izin untuk mengubah foto user ini', 403);

    const updatedUser = await prisma.user.update({
      where: { id: userId }, data: { foto },
      select: { id: true, username: true, namaLengkap: true, foto: true, role: { select: { id: true, name: true } } }
    });
    return updatedUser;
  }

  static async updatePasscode(userId: number, passCode: string) {
    if (!passCode) throw new UserServiceError('Passcode harus diisi', 400);
    if (passCode.length < 6 || passCode.length > 10 || !/^[a-zA-Z0-9]+$/.test(passCode)) throw new UserServiceError('Passcode harus 6-10 karakter (huruf/angka, tanpa spasi atau simbol)', 400);

    const existingUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!existingUser) throw new UserServiceError('User tidak ditemukan', 404);

    const updatedUser = await prisma.user.update({
      where: { id: userId }, data: { passCode },
      select: { id: true, username: true, namaLengkap: true, passCode: true, role: { select: { id: true, name: true } } }
    });
    return updatedUser;
  }

  static async getPasscode(userId: number, currentUser: AuthUser) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true, namaLengkap: true, passCode: true, role: { select: { id: true, name: true } } }
    });
    if (!user) throw new UserServiceError('User tidak ditemukan', 404);
    if (!canEditOthersPasscode(currentUser.role.name)) throw new UserServiceError('Hanya Super Admin yang dapat melihat passcode pengguna lain', 403);
    return { userId: user.id, username: user.username, namaLengkap: user.namaLengkap, hasPasscode: !!user.passCode, passCode: user.passCode, role: user.role };
  }

  static async checkPasscode(passCode: string, excludeUserId?: number) {
    if (!passCode) throw new UserServiceError('Passcode is required', 400);
    const existingUser = await prisma.user.findFirst({
      where: { passCode, ...(excludeUserId && { id: { not: excludeUserId } }) },
      select: { id: true, namaLengkap: true, username: true, role: { select: { name: true } } }
    });
    if (existingUser) return { exists: true, user: { id: existingUser.id, namaLengkap: existingUser.namaLengkap, username: existingUser.username, role: existingUser.role.name } };
    return { exists: false, message: 'Passcode available' };
  }

  static async getChildren(userId: number, currentUser: AuthUser) {
    if (currentUser.id !== userId && !['super_admin'].includes(currentUser.role.name)) throw new UserServiceError('Tidak memiliki izin melihat data ini', 403);

    const user = await prisma.user.findUnique({ where: { id: userId }, include: { role: true } });
    if (!user) throw new UserServiceError('User tidak ditemukan', 404);
    if (user.role.name.toLowerCase() !== 'ortu') throw new UserServiceError('User bukan orang tua', 400);

    const children = await prisma.orangTuaSantri.findMany({
      where: { orangTuaId: userId },
      include: { santri: { select: { id: true, namaLengkap: true, username: true, foto: true } } }
    });
    return children.map(child => child.santriId);
  }

  static async getAssignedSantris(userId: number) {
    const parentUser = await prisma.user.findUnique({ where: { id: userId }, include: { role: true } });
    if (!parentUser) throw new UserServiceError('User not found', 404);
    if (parentUser.role.name.toLowerCase() !== 'ortu') throw new UserServiceError('User is not a parent', 400);

    return prisma.orangTuaSantri.findMany({
      where: { orangTuaId: userId },
      include: { santri: { select: { id: true, username: true, namaLengkap: true } } }
    });
  }

  static async updateAssignedSantris(userId: number, assignedSantris: number[]) {
    const parentUser = await prisma.user.findUnique({ where: { id: userId }, include: { role: true } });
    if (!parentUser) throw new UserServiceError('User not found', 404);
    if (parentUser.role.name.toLowerCase() !== 'ortu') throw new UserServiceError('User is not a parent', 400);

    for (const santriId of assignedSantris) {
      const santri = await prisma.user.findUnique({ where: { id: santriId }, include: { role: true } });
      if (!santri) throw new UserServiceError(`Santri with ID ${santriId} not found`, 400);
      if (santri.role.name.toLowerCase() !== 'santri') throw new UserServiceError(`User with ID ${santriId} is not a santri`, 400);
    }

    await prisma.orangTuaSantri.deleteMany({ where: { orangTuaId: userId } });
    if (assignedSantris.length > 0) {
      await prisma.orangTuaSantri.createMany({
        data: assignedSantris.map(santriId => ({ orangTuaId: userId, santriId }))
      });
    }
    return { message: 'Assigned santris updated successfully' };
  }

  static validateOwnershipAccess(userId: number, currentUser: AuthUser) {
    if (currentUser.id !== userId && !['super_admin'].includes(currentUser.role.name)) throw new UserServiceError('Access denied', 403);
  }

  static async listAdmin(user: AuthUser, filters: { role?: string, excludeAssigned?: boolean, excludeHalaqahId?: number }) {
    if (!['super_admin'].includes(user.role.name)) throw new UserServiceError('Access denied', 403);
    
    const whereClause: any = {};
    if (filters.role) whereClause.role = { name: filters.role };

    if (filters.excludeAssigned && filters.role === 'santri') {
      const assignedSantriQuery: any = {};
      if (filters.excludeHalaqahId) assignedSantriQuery.halaqahId = { not: filters.excludeHalaqahId };
      const assignedSantriIds = await prisma.halaqahSantri.findMany({ where: assignedSantriQuery, select: { santriId: true } });
      const assignedIds = assignedSantriIds.map(hs => hs.santriId);
      if (assignedIds.length > 0) whereClause.id = { notIn: assignedIds };
    }

    return await prisma.user.findMany({
      where: whereClause,
      select: { id: true, username: true, namaLengkap: true, role: { select: { name: true } } },
      orderBy: { namaLengkap: 'asc' }
    });
  }

  static async listAvailable(user: AuthUser, halaqahId: number) {
    if (!['super_admin'].includes(user.role.name)) throw new UserServiceError('Access denied', 403);
    if (isNaN(halaqahId)) throw new UserServiceError('halaqahId is required', 400);
    
    return await prisma.user.findMany({
      where: {
        role: { name: 'santri' },
        OR: [
          { HalaqahSantri: { none: {} } },
          { HalaqahSantri: { some: { halaqahId } } }
        ]
      },
      select: { id: true, username: true, namaLengkap: true, role: { select: { name: true } } },
      orderBy: { namaLengkap: 'asc' }
    });
  }

  static async getAllAssignedSantriIds(user: AuthUser) {
    if (!['super_admin'].includes(user.role.name)) throw new UserServiceError('Access denied', 403);
    
    const assignedSantris = await prisma.orangTuaSantri.findMany({ select: { santriId: true } });
    return assignedSantris.map(item => item.santriId);
  }

  static async getUsedSantriIds() {
    const relations = await prisma.orangTuaSantri.findMany({ select: { santriId: true } });
    return [...new Set(relations.map(r => r.santriId))];
  }

  static async getSantriAssignments() {
    const assignments = await prisma.orangTuaSantri.findMany({
      include: {
        santri: { select: { id: true, namaLengkap: true, username: true, foto: true } },
        orangTua: { select: { id: true, namaLengkap: true, username: true } }
      }
    });
    const grouped: Record<number, { santri: Record<string, unknown>; parents: Record<string, unknown>[] }> = {};
    for (const a of assignments) {
      if (!grouped[a.santriId]) grouped[a.santriId] = { santri: a.santri as any, parents: [] };
      grouped[a.santriId].parents.push(a.orangTua as any);
    }
    return grouped;
  }

  static async refreshAssignments() {
    const [usedRelations, detailedAssignments] = await Promise.all([
      prisma.orangTuaSantri.findMany({ select: { santriId: true } }),
      prisma.orangTuaSantri.findMany({
        include: {
          santri: { select: { id: true, namaLengkap: true, username: true, foto: true } },
          orangTua: { select: { id: true, namaLengkap: true, username: true } }
        }
      })
    ]);

    const usedSantriIds = [...new Set(usedRelations.map(r => r.santriId))];
    const grouped: Record<number, { santri: Record<string, unknown>; parents: Record<string, unknown>[] }> = {};
    for (const a of detailedAssignments) {
      if (!grouped[a.santriId]) grouped[a.santriId] = { santri: a.santri as any, parents: [] };
      grouped[a.santriId].parents.push(a.orangTua as any);
    }
    return { usedSantriIds, santriAssignments: grouped, timestamp: new Date().toISOString() };
  }
}

export class RoleService {
  static async list() {
    return prisma.role.findMany({ include: { _count: true }, orderBy: { name: 'asc' } });
  }

  static async create(name: string) {
    if (!name || name.trim().length < 3) throw new UserServiceError('Nama role harus diisi minimal 3 karakter', 400);
    const existingRole = await prisma.role.findUnique({ where: { name: name.trim() } });
    if (existingRole) throw new UserServiceError('Role dengan nama tersebut sudah ada', 400);

    const newRole = await prisma.role.create({ data: { name: name.trim() }, include: { _count: true } });
    const defaultPermissions = getDefaultPermissionsForNewRole();
    await syncRolePermissions(newRole.name, defaultPermissions);
    return newRole;
  }

  static async update(roleId: number, name: string) {
    if (!name || name.trim().length < 3) throw new UserServiceError('Nama role harus diisi minimal 3 karakter', 400);
    const existingRole = await prisma.role.findUnique({ where: { id: roleId } });
    if (!existingRole) throw new UserServiceError('Role tidak ditemukan', 404);
    if (SYSTEM_ROLES.includes(existingRole.name.toLowerCase()) && existingRole.name !== name.trim()) throw new UserServiceError('Tidak dapat mengubah nama role sistem', 400);

    const duplicateRole = await prisma.role.findFirst({ where: { name: name.trim(), id: { not: roleId } } });
    if (duplicateRole) throw new UserServiceError('Role dengan nama tersebut sudah ada', 400);

    return prisma.role.update({
      where: { id: roleId }, data: { name: name.trim() },
      include: { _count: { select: { users: true } } }
    });
  }

  static async delete(roleId: number) {
    const existingRole = await prisma.role.findUnique({ where: { id: roleId }, include: { _count: { select: { users: true } } } });
    if (!existingRole) throw new UserServiceError('Role tidak ditemukan', 404);
    if (existingRole._count.users > 0) throw new UserServiceError('Tidak dapat menghapus role yang masih digunakan oleh user', 400);
    if (SYSTEM_ROLES.includes(existingRole.name.toLowerCase())) throw new UserServiceError('Tidak dapat menghapus role sistem', 400);
    await prisma.role.delete({ where: { id: roleId } });
    return { message: 'Role berhasil dihapus' };
  }

  static async getPermissions() {
    const roles = await prisma.role.findMany({ select: { id: true, name: true, _count: { select: { users: true } } } });
    const dynamicPermissions: Record<string, Record<string, unknown>> = {};

    roles.forEach((role, index) => {
      const roleName = role.name.toLowerCase();
      const level = roleName === 'super_admin' ? 6 : roleName === 'guru' ? 4 : roleName === 'santri' ? 3 : roleName === 'ortu' ? 2 : roleName === 'yayasan' ? 1 : Math.max(1, 6 - index);
      dynamicPermissions[roleName] = {
        level, allowedRoutes: [roleName, `${roleName}/profil`, ...(roleName === 'super_admin' ? ['guru', 'santri', 'ortu', 'yayasan', 'users', 'settings'] : [])],
        dashboard: `/${roleName}/dashboard`, userCount: role._count.users
      };
    });
    return { permissions: dynamicPermissions, roles };
  }

  static async createWithPermissions(roleName: string, level?: number) {
    if (!roleName) throw new UserServiceError('Role name is required', 400);
    const newRole = await prisma.role.create({ data: { name: roleName.toLowerCase().replace(/\s+/g, '_') } });
    return {
      role: newRole,
      permission: { level: level || 1, allowedRoutes: [newRole.name, `${newRole.name}/profil`], dashboard: `/${newRole.name}/dashboard`, userCount: 0 }
    };
  }

  static async getRolePermissions(roleId: number) {
    const role = await prisma.role.findUnique({ where: { id: roleId } });
    if (!role) throw new UserServiceError('Role tidak ditemukan', 404);
    return { roleId, roleName: role.name, permissions: getDefaultPermissions(role.name) };
  }

  static async updateRolePermissions(roleId: number, permissions: string[]) {
    const role = await prisma.role.findUnique({ where: { id: roleId } });
    if (!role) throw new UserServiceError('Role tidak ditemukan', 404);
    if (!Array.isArray(permissions)) throw new UserServiceError('Permissions harus berupa array', 400);
    return { message: 'Permissions berhasil diperbarui', roleId, roleName: role.name, permissions };
  }

}

function getDefaultPermissions(roleName: string): string[] {
  const rolePermissions: Record<string, string[]> = {
    super_admin: ['dashboard_view', 'profile_view', 'profile_edit', 'pengumuman_view', 'absensi_view', 'absensi_input', 'hafalan_view', 'hafalan_input', 'laporan_view', 'laporan_export', 'user_management', 'role_management', 'system_settings', 'backup_restore'],
    yayasan: ['dashboard_view', 'profile_view', 'profile_edit', 'pengumuman_view', 'absensi_view', 'hafalan_view', 'laporan_view', 'laporan_export'],
    guru: ['dashboard_view', 'profile_view', 'profile_edit', 'pengumuman_view', 'absensi_view', 'absensi_input', 'hafalan_view', 'hafalan_input'],
    santri: ['dashboard_view', 'profile_view', 'profile_edit', 'pengumuman_view', 'absensi_view', 'hafalan_view'],
    ortu: ['dashboard_view', 'profile_view', 'profile_edit', 'pengumuman_view', 'absensi_view', 'hafalan_view', 'laporan_view'],
  };
  return rolePermissions[roleName.toLowerCase()] || ['dashboard_view', 'profile_view', 'profile_edit', 'pengumuman_view'];
}

export class UserServiceError extends Error {
  constructor(message: string, public statusCode: number = 500) {
    super(message);
    this.name = 'UserServiceError';
  }
}
