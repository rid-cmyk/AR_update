import { prisma } from '@/lib/database/prisma';

export interface AuthUser {
  id: number;
  namaLengkap: string;
  role: { name: string };
}

export class JenisUjianServiceError extends Error {
  constructor(message: string, public statusCode: number = 500) {
    super(message);
    this.name = 'JenisUjianServiceError';
  }
}

export class JenisUjianService {
  private static checkAdmin(user: AuthUser) {
    if (!['super_admin'].includes(user.role.name)) throw new JenisUjianServiceError('Access denied', 403);
  }

  static mapJenisUjian(j: any) {
    return {
      ...j,
      komponenPenilaian: (j.komponenPenilaian || []).map((k: any) => ({
        id: k.id,
        nama: k.namaKomponen,
        bobot: k.bobotNilai,
        deskripsi: k.deskripsi,
        urutan: k.urutan,
        isActive: k.isActive,
        nilaiMaksimal: k.nilaiMaksimal,
        nilaiMinimal: k.nilaiMinimal
      }))
    };
  }

  static async list(user: AuthUser) {
    if (!['super_admin', 'guru'].includes(user.role.name)) throw new JenisUjianServiceError('Access denied', 403);
    
    const jenisUjianList = await prisma.jenisUjian.findMany({
      include: {
        komponenPenilaian: { orderBy: { bobotNilai: 'desc' } },
        creator: { select: { namaLengkap: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return jenisUjianList.map(j => this.mapJenisUjian(j));
  }

  static async create(user: AuthUser, data: any) {
    this.checkAdmin(user);
    
    const { nama, kode, deskripsi, komponenPenilaian } = data;
    if (!nama || !kode) throw new JenisUjianServiceError('Nama dan kode wajib diisi', 400);

    if (komponenPenilaian && komponenPenilaian.length > 0) {
      const totalBobot = komponenPenilaian.reduce((sum: number, k: any) => sum + parseFloat(k.bobot), 0);
      if (Math.abs(totalBobot - 100) > 0.01) throw new JenisUjianServiceError('Total bobot komponen penilaian harus 100%', 400);
    }

    const existing = await prisma.jenisUjian.findUnique({ where: { kode } });
    if (existing) throw new JenisUjianServiceError('Kode jenis ujian sudah digunakan', 400);

    const jenisUjian = await prisma.jenisUjian.create({
      data: {
        nama,
        kode,
        deskripsi,
        createdBy: user.id,
        komponenPenilaian: {
          create: komponenPenilaian?.map((k: any) => ({
            namaKomponen: k.nama,
            bobotNilai: parseFloat(k.bobot),
            urutan: k.urutan || 1
          })) || []
        }
      },
      include: { komponenPenilaian: true }
    });

    return jenisUjian;
  }

  static async getById(user: AuthUser, id: number) {
    if (!['super_admin', 'guru'].includes(user.role.name)) throw new JenisUjianServiceError('Access denied', 403);
    if (isNaN(id)) throw new JenisUjianServiceError('ID jenis ujian tidak valid', 400);

    const jenisUjian = await prisma.jenisUjian.findUnique({
      where: { id },
      include: {
        komponenPenilaian: { orderBy: { bobotNilai: 'desc' } },
        creator: { select: { namaLengkap: true } }
      }
    });

    if (!jenisUjian) throw new JenisUjianServiceError('Jenis ujian tidak ditemukan', 404);
    return this.mapJenisUjian(jenisUjian);
  }

  static async update(user: AuthUser, id: number, data: any) {
    this.checkAdmin(user);
    if (isNaN(id)) throw new JenisUjianServiceError('ID jenis ujian tidak valid', 400);

    const { nama, kode, deskripsi, komponenPenilaian } = data;
    if (!nama || !kode) throw new JenisUjianServiceError('Nama dan kode wajib diisi', 400);

    const existing = await prisma.jenisUjian.findUnique({ where: { id } });
    if (!existing) throw new JenisUjianServiceError('Jenis ujian tidak ditemukan', 404);

    try {
      const updated = await prisma.$transaction(async (tx) => {
        if (Array.isArray(komponenPenilaian)) {
          await tx.komponenPenilaian.deleteMany({ where: { jenisUjianId: id } });
          await tx.komponenPenilaian.createMany({
            data: komponenPenilaian.map((k: any) => ({
              jenisUjianId: id,
              namaKomponen: k.nama,
              bobotNilai: k.bobot || 0,
              deskripsi: k.deskripsi,
              urutan: k.urutan || 0,
              isActive: true,
              nilaiMaksimal: k.nilaiMaksimal || 100,
              nilaiMinimal: k.nilaiMinimal || 0
            }))
          });
        }
        return tx.jenisUjian.update({
          where: { id },
          data: { nama, kode, deskripsi },
          include: { komponenPenilaian: { orderBy: { bobotNilai: 'desc' } } }
        });
      });
      return this.mapJenisUjian(updated);
    } catch (error: any) {
      if (error?.code === 'P2002') throw new JenisUjianServiceError('Jenis ujian dengan nama & tipe yang sama sudah ada', 409);
      throw error;
    }
  }

  static async delete(user: AuthUser, id: number) {
    this.checkAdmin(user);
    if (isNaN(id)) throw new JenisUjianServiceError('ID jenis ujian tidak valid', 400);

    const existing = await prisma.jenisUjian.findUnique({ where: { id } });
    if (!existing) throw new JenisUjianServiceError('Jenis ujian tidak ditemukan', 404);

    await prisma.jenisUjian.delete({ where: { id } });
    return { message: 'Jenis ujian berhasil dihapus' };
  }
}
