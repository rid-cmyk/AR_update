import { prisma } from '@/lib/database/prisma';

export interface AuthUser {
  id: number;
  namaLengkap: string;
  role: { name: string };
}

export class SemesterServiceError extends Error {
  constructor(message: string, public statusCode: number = 500) {
    super(message);
    this.name = 'SemesterServiceError';
  }
}

export class SemesterService {
  static async updateSemester(id: number, data: any, user: AuthUser) {
    if (user.role.name !== 'super_admin') throw new SemesterServiceError('Unauthorized', 403);
    return await prisma.semester.update({
      where: { id },
      data: { tanggalMulai: data.tanggalMulai, tanggalSelesai: data.tanggalSelesai }
    });
  }

  static async setActiveSemester(semesterId: number, user: AuthUser) {
    if (user.role.name !== 'super_admin') throw new SemesterServiceError('Unauthorized', 403);
    
    const targetSemester = await prisma.semester.findUnique({
      where: { id: semesterId }
    });

    if (!targetSemester) throw new SemesterServiceError('Semester tidak ditemukan', 404);

    await prisma.$transaction([
      prisma.tahunAjaran.updateMany({ where: { isActive: true }, data: { isActive: false } }),
      prisma.semester.updateMany({ where: { isActive: true }, data: { isActive: false } }),
      prisma.semester.update({ where: { id: semesterId }, data: { isActive: true } }),
      prisma.tahunAjaran.update({ where: { id: targetSemester.tahunAjaranId }, data: { isActive: true } })
    ]);

    return { message: 'Semester berhasil diaktifkan' };
  }
}
