import { prisma } from '@/lib/database/prisma';
import { signToken } from '@/lib/jwt';

export interface AuthUser {
  id: number;
  namaLengkap: string;
  role: { name: string };
}

export class ProfileServiceError extends Error {
  constructor(message: string, public statusCode: number = 500) {
    super(message);
    this.name = 'ProfileServiceError';
  }
}

export class ProfileService {
  static async getProfile(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: { select: { name: true } } }
    });

    if (!user) throw new ProfileServiceError('User not found', 404);

    return {
      success: true,
      user: {
        id: user.id,
        namaLengkap: user.namaLengkap,
        username: user.username,
        email: user.email,
        foto: user.foto,
        alamat: user.alamat,
        noTlp: user.noTlp,
        role: (user as any).role.name,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    };
  }

  static async updateProfile(userId: number, data: any, requestInfo: { ip?: string, userAgent?: string }) {
    const { namaLengkap, username, email, foto, alamat, noTlp } = data;

    if (!namaLengkap || !username) throw new ProfileServiceError('Nama lengkap dan username wajib diisi', 400);

    const existingUser = await prisma.user.findFirst({
      where: { username, NOT: { id: userId } }
    });

    if (existingUser) throw new ProfileServiceError('Username sudah digunakan oleh user lain', 400);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { namaLengkap, username, email, foto, alamat, noTlp, updatedAt: new Date() },
      include: { role: { select: { name: true } } }
    });

    const newToken = signToken({
      id: updatedUser.id,
      namaLengkap: updatedUser.namaLengkap,
      username: updatedUser.username,
      role: (updatedUser as any).role.name,
      foto: updatedUser.foto
    });

    await prisma.auditLog.create({
      data: {
        action: 'UPDATE_PROFILE',
        keterangan: 'User ' + updatedUser.namaLengkap + ' updated profile',
        userId: updatedUser.id,
        ipAddress: requestInfo.ip || null,
        userAgent: requestInfo.userAgent || null,
        module: 'PROFILE'
      }
    });

    return {
      success: true,
      message: 'Profil berhasil diperbarui',
      user: {
        id: updatedUser.id,
        namaLengkap: updatedUser.namaLengkap,
        username: updatedUser.username,
        email: updatedUser.email,
        foto: updatedUser.foto,
        alamat: updatedUser.alamat,
        noTlp: updatedUser.noTlp,
        role: (updatedUser as any).role.name
      },
      newToken
    };
  }
}
