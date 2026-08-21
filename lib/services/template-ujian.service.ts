import { prisma } from '@/lib/database/prisma';

export interface AuthUser {
  id: number;
  namaLengkap: string;
  role: { name: string };
}

export class TemplateUjianServiceError extends Error {
  constructor(message: string, public statusCode: number = 500) {
    super(message);
    this.name = 'TemplateUjianServiceError';
  }
}

const DEFAULT_KOMPONEN: Record<string, Array<{ namaKomponen: string; bobotNilai: number; nilaiMaksimal: number; deskripsi: string; urutan: number; }>> = {
  tasmi: [
    { namaKomponen: 'Kelancaran', bobotNilai: 50, nilaiMaksimal: 100, deskripsi: 'Penilaian kelancaran dalam membaca Al-Quran', urutan: 1 },
    { namaKomponen: 'Tajwid & Makhraj', bobotNilai: 50, nilaiMaksimal: 100, deskripsi: 'Penilaian ketepatan tajwid dan makhraj huruf', urutan: 2 }
  ],
  mhq: [
    { namaKomponen: 'Kelancaran', bobotNilai: 30, nilaiMaksimal: 100, deskripsi: 'Penilaian kelancaran dalam membaca Al-Quran', urutan: 1 },
    { namaKomponen: 'Ketepatan Ayat', bobotNilai: 30, nilaiMaksimal: 100, deskripsi: 'Penilaian ketepatan hafalan ayat Al-Quran', urutan: 2 },
    { namaKomponen: 'Tajwid & Makhraj', bobotNilai: 25, nilaiMaksimal: 100, deskripsi: 'Penilaian ketepatan tajwid dan makhraj huruf', urutan: 3 },
    { namaKomponen: 'Penampilan', bobotNilai: 15, nilaiMaksimal: 100, deskripsi: 'Penilaian penampilan dan sikap saat ujian', urutan: 4 }
  ],
  uas: [
    { namaKomponen: 'Kelancaran', bobotNilai: 40, nilaiMaksimal: 100, deskripsi: 'Penilaian kelancaran dalam membaca Al-Quran', urutan: 1 },
    { namaKomponen: 'Ketepatan Ayat', bobotNilai: 30, nilaiMaksimal: 100, deskripsi: 'Penilaian ketepatan hafalan ayat Al-Quran', urutan: 2 },
    { namaKomponen: 'Tajwid & Makhraj', bobotNilai: 20, nilaiMaksimal: 100, deskripsi: 'Penilaian ketepatan tajwid dan makhraj huruf', urutan: 3 },
    { namaKomponen: 'Adab & Sikap', bobotNilai: 10, nilaiMaksimal: 100, deskripsi: 'Penilaian adab dan sikap santri', urutan: 4 }
  ],
  kenaikan_juz: [
    { namaKomponen: 'Kelancaran', bobotNilai: 40, nilaiMaksimal: 100, deskripsi: 'Penilaian kelancaran dalam membaca Al-Quran', urutan: 1 },
    { namaKomponen: 'Ketepatan Ayat', bobotNilai: 30, nilaiMaksimal: 100, deskripsi: 'Penilaian ketepatan hafalan ayat Al-Quran', urutan: 2 },
    { namaKomponen: 'Tajwid & Makhraj', bobotNilai: 20, nilaiMaksimal: 100, deskripsi: 'Penilaian ketepatan tajwid dan makhraj huruf', urutan: 3 },
    { namaKomponen: 'Adab & Sikap', bobotNilai: 10, nilaiMaksimal: 100, deskripsi: 'Penilaian adab dan sikap santri', urutan: 4 }
  ]
};

export class TemplateUjianService {
  private static checkAdmin(user: AuthUser) {
    if (!['super_admin'].includes(user.role.name)) {
      throw new TemplateUjianServiceError('Access denied', 403);
    }
  }

  static async listActive() {
    const templates = await prisma.templateUjian.findMany({
      where: { status: 'aktif' },
      include: {
        komponenPenilaian: { orderBy: { urutan: 'asc' } },
        tahunAjaran: { select: { namaLengkap: true, isActive: true } }
      },
      orderBy: { namaTemplate: 'asc' }
    });
    return templates.filter((t: any) => t.tahunAjaran.isActive);
  }

  static async getTemplateStats() {
    const [
      totalTahunAkademik, totalJenisUjian, totalTemplateUjian, totalTemplateRaport,
      totalKomponenPenilaian, templateUjianAktif, templateRaportAktif,
    ] = await Promise.all([
      prisma.tahunAjaran.count(), prisma.jenisUjian.count(),
      prisma.templateUjian.count(), prisma.templateRaport.count(),
      prisma.komponenPenilaian.count(),
      prisma.templateUjian.count({ where: { status: "aktif" } }),
      prisma.templateRaport.count({ where: { status: "aktif" } }),
    ]);
    return {
      totalTahunAkademik, totalJenisUjian, totalTemplateUjian, totalTemplateRaport,
      totalKomponenPenilaian,
      templateUjian: { total: totalTemplateUjian, aktif: templateUjianAktif, nonAktif: totalTemplateUjian - templateUjianAktif },
      templateRaport: { total: totalTemplateRaport, aktif: templateRaportAktif, nonAktif: totalTemplateRaport - templateRaportAktif },
    };
  }

  static async list(user: AuthUser, filters: { jenisUjian?: string, tahunAjaranId?: number }) {
    this.checkAdmin(user);
    
    const whereClause: any = {};
    if (filters.jenisUjian) whereClause.jenisUjian = filters.jenisUjian;
    if (filters.tahunAjaranId) whereClause.tahunAjaranId = filters.tahunAjaranId;

    return await prisma.templateUjian.findMany({
      where: whereClause,
      include: {
        komponenPenilaian: { orderBy: { urutan: 'asc' } },
        tahunAjaran: true,
        creator: { select: { id: true, namaLengkap: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async create(user: AuthUser, data: { nama: string, jenisUjian: string, tahunAjaranId: number, deskripsi?: string, komponenPenilaian?: any[] }) {
    this.checkAdmin(user);

    if (!data.nama || !data.jenisUjian || !data.tahunAjaranId) {
      throw new TemplateUjianServiceError('Nama template, jenis ujian, dan tahun akademik wajib diisi', 400);
    }

    if (data.komponenPenilaian && data.komponenPenilaian.length > 0) {
      const totalBobot = data.komponenPenilaian.reduce((total, k) => total + (k.bobot || 0), 0);
      if (Math.abs(totalBobot - 100) > 0.01) {
        throw new TemplateUjianServiceError('Total bobot komponen penilaian harus 100%', 400);
      }
    }

    return await prisma.templateUjian.create({
      data: {
        namaTemplate: data.nama,
        jenisUjian: data.jenisUjian as any,
        tahunAjaranId: data.tahunAjaranId,
        deskripsi: data.deskripsi || '',
        createdBy: user.id,
        komponenPenilaian: {
          create: (data.komponenPenilaian || []).map((komponen: any, index: number) => ({
            namaKomponen: komponen.nama || komponen.namaKomponen,
            bobotNilai: komponen.bobot || komponen.bobotNilai,
            deskripsi: komponen.deskripsi || '',
            urutan: komponen.urutan || index + 1
          }))
        }
      },
      include: {
        tahunAjaran: true,
        komponenPenilaian: { orderBy: { urutan: 'asc' } }
      }
    });
  }

  static async delete(user: AuthUser, id: number) {
    this.checkAdmin(user);
    if (isNaN(id)) throw new TemplateUjianServiceError('ID template tidak valid', 400);

    const template = await prisma.templateUjian.findUnique({ where: { id } });
    if (!template) throw new TemplateUjianServiceError('Template ujian tidak ditemukan', 404);

    await prisma.templateUjian.delete({ where: { id } });
    return { success: true, message: 'Template ujian berhasil dihapus' };
  }

  static async getById(user: AuthUser, id: number) {
    this.checkAdmin(user);
    if (isNaN(id)) throw new TemplateUjianServiceError('ID template tidak valid', 400);

    const template = await prisma.templateUjian.findUnique({
      where: { id },
      include: {
        komponenPenilaian: { orderBy: { urutan: 'asc' } },
        tahunAjaran: true,
        creator: { select: { id: true, namaLengkap: true } }
      }
    });
    if (!template) throw new TemplateUjianServiceError('Template ujian tidak ditemukan', 404);

    return template;
  }

  static async toggleActive(user: AuthUser, id: number) {
    this.checkAdmin(user);
    if (isNaN(id)) throw new TemplateUjianServiceError('ID template tidak valid', 400);

    const template = await prisma.templateUjian.findUnique({ where: { id } });
    if (!template) throw new TemplateUjianServiceError('Template tidak ditemukan', 404);

    const updated = await prisma.templateUjian.update({
      where: { id },
      data: { status: template.status === 'aktif' ? 'nonaktif' : 'aktif' },
      include: {
        komponenPenilaian: { orderBy: { urutan: 'asc' } },
        tahunAjaran: true,
        creator: { select: { id: true, namaLengkap: true } }
      }
    });
    return updated;
  }

  static async addKomponen(user: AuthUser, templateId: number, data: { namaKomponen: string, bobotNilai: number, deskripsi?: string, urutan?: number }) {
    this.checkAdmin(user);
    if (isNaN(templateId)) throw new TemplateUjianServiceError('ID template tidak valid', 400);
    if (!data.namaKomponen || !data.bobotNilai) throw new TemplateUjianServiceError('Nama komponen dan bobot nilai wajib diisi', 400);

    const template = await prisma.templateUjian.findUnique({
      where: { id: templateId },
      include: { komponenPenilaian: true }
    });
    if (!template) throw new TemplateUjianServiceError('Template tidak ditemukan', 404);

    const totalBobot = template.komponenPenilaian.reduce((sum: number, k: any) => sum + k.bobotNilai, 0);
    if (totalBobot + data.bobotNilai > 100) {
      throw new TemplateUjianServiceError('Total bobot komponen penilaian tidak boleh melebihi 100%', 400);
    }

    const komponen = await prisma.komponenPenilaian.create({
      data: {
        templateUjianId: templateId,
        namaKomponen: data.namaKomponen,
        bobotNilai: data.bobotNilai,
        deskripsi: data.deskripsi || '',
        urutan: data.urutan || (template.komponenPenilaian.length + 1)
      }
    });
    return komponen;
  }

  static async updateKomponen(user: AuthUser, komponenId: number, data: { namaKomponen: string, bobotNilai: number, deskripsi?: string, urutan?: number }) {
    this.checkAdmin(user);
    if (isNaN(komponenId)) throw new TemplateUjianServiceError('ID komponen tidak valid', 400);
    if (!data.namaKomponen || !data.bobotNilai) throw new TemplateUjianServiceError('Nama komponen dan bobot nilai wajib diisi', 400);

    const komponen = await prisma.komponenPenilaian.findUnique({
      where: { id: komponenId },
      include: { templateUjian: { include: { komponenPenilaian: true } } }
    });
    if (!komponen) throw new TemplateUjianServiceError('Komponen tidak ditemukan', 404);

    const totalBobotLain = komponen.templateUjian!.komponenPenilaian
      .filter((k) => k.id !== komponenId)
      .reduce((sum: number, k: any) => sum + k.bobotNilai, 0);

    if (totalBobotLain + data.bobotNilai > 100) {
      throw new TemplateUjianServiceError('Total bobot komponen penilaian tidak boleh melebihi 100%', 400);
    }

    const updated = await prisma.komponenPenilaian.update({
      where: { id: komponenId },
      data: {
        namaKomponen: data.namaKomponen,
        bobotNilai: data.bobotNilai,
        deskripsi: data.deskripsi ?? komponen.deskripsi,
        urutan: data.urutan ?? komponen.urutan
      }
    });
    return updated;
  }

  static async deleteKomponen(user: AuthUser, komponenId: number) {
    this.checkAdmin(user);
    if (isNaN(komponenId)) throw new TemplateUjianServiceError('ID komponen tidak valid', 400);

    const komponen = await prisma.komponenPenilaian.findUnique({ where: { id: komponenId } });
    if (!komponen) throw new TemplateUjianServiceError('Komponen tidak ditemukan', 404);

    await prisma.komponenPenilaian.delete({ where: { id: komponenId } });
    return { success: true };
  }

  static async applyDefaultKomponen(user: AuthUser, templateId: number, jenisUjian: string) {
    this.checkAdmin(user);
    if (isNaN(templateId)) throw new TemplateUjianServiceError('ID template tidak valid', 400);
    
    const existingTemplate = await prisma.templateUjian.findUnique({ where: { id: templateId } });
    if (!existingTemplate) throw new TemplateUjianServiceError('Template tidak ditemukan', 404);

    const komponenData = DEFAULT_KOMPONEN[jenisUjian];
    if (!komponenData) throw new TemplateUjianServiceError('Template default tidak tersedia untuk jenis ujian ini', 400);

    await prisma.komponenPenilaian.deleteMany({ where: { templateUjianId: templateId } });

    const newKomponen = await Promise.all(
      komponenData.map(komponen =>
        prisma.komponenPenilaian.create({
          data: {
            ...komponen,
            templateUjianId: templateId
          }
        })
      )
    );

    return newKomponen;
  }
}
