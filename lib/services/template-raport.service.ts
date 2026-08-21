import { prisma } from '@/lib/database/prisma';
import { StatusTemplate } from '@prisma/client';

export interface AuthUser {
  id: number;
  namaLengkap: string;
  role: { name: string };
}

export class TemplateRaportServiceError extends Error {
  constructor(message: string, public statusCode: number = 500) {
    super(message);
    this.name = 'TemplateRaportServiceError';
  }
}

export class TemplateRaportService {
  private static checkAdmin(user: AuthUser) {
    if (!['super_admin'].includes(user.role.name)) throw new TemplateRaportServiceError('Access denied', 403);
  }

  static async list(user: AuthUser, filters: { tahunAjaranId?: number }) {
    this.checkAdmin(user);
    
    const whereClause: any = {};
    if (filters.tahunAjaranId) whereClause.tahunAjaranId = filters.tahunAjaranId;

    return await prisma.templateRaport.findMany({
      where: whereClause,
      include: {
        tahunAjaran: true,
        creator: { select: { id: true, namaLengkap: true } },
        _count: { select: { raportSantri: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async create(user: AuthUser, data: any) {
    this.checkAdmin(user);
    
    const { nama, tahunAjaranId, namaLembaga, alamatLembaga, headerKop, footerKop, tandaTanganKepala, namaKepala, jabatanKepala, tampilanGrafik, tampilanRanking, catatanTemplate } = data;
    if (!nama || !tahunAjaranId || !namaLembaga) throw new TemplateRaportServiceError('Nama template, tahun akademik, dan nama lembaga wajib diisi', 400);

    return await prisma.templateRaport.create({
      data: {
        namaTemplate: nama,
        tahunAjaranId: parseInt(tahunAjaranId),
        namaLembaga,
        alamatLembaga: alamatLembaga || null,
        headerKop: headerKop || null,
        footerKop: footerKop || null,
        tandaTanganKepala: tandaTanganKepala || null,
        namaKepala: namaKepala || null,
        jabatanKepala: jabatanKepala || null,
        tampilanGrafik: tampilanGrafik ?? true,
        tampilanRanking: tampilanRanking ?? true,
        catatanTemplate: catatanTemplate || null,
        createdBy: user.id
      },
      include: {
        tahunAjaran: true,
        creator: { select: { id: true, namaLengkap: true } }
      }
    });
  }

  static async getById(user: AuthUser, id: number) {
    this.checkAdmin(user);
    if (isNaN(id)) throw new TemplateRaportServiceError('ID tidak valid', 400);

    const template = await prisma.templateRaport.findUnique({
      where: { id },
      include: {
        tahunAjaran: true,
        creator: { select: { id: true, namaLengkap: true } },
        _count: { select: { raportSantri: true } }
      }
    });

    if (!template) throw new TemplateRaportServiceError('Template raport tidak ditemukan', 404);
    return template;
  }

  static async update(user: AuthUser, id: number, data: any) {
    this.checkAdmin(user);
    if (isNaN(id)) throw new TemplateRaportServiceError('ID tidak valid', 400);

    const { nama, tahunAjaranId, namaLembaga, alamatLembaga, headerKop, footerKop, tandaTanganKepala, namaKepala, jabatanKepala, tampilanGrafik, tampilanRanking, catatanTemplate, status } = data;

    const existing = await prisma.templateRaport.findUnique({ where: { id } });
    if (!existing) throw new TemplateRaportServiceError('Template raport tidak ditemukan', 404);
    if (!nama || !namaLembaga) throw new TemplateRaportServiceError('Nama template dan nama lembaga wajib diisi', 400);

    return await prisma.templateRaport.update({
      where: { id },
      data: {
        namaTemplate: nama,
        tahunAjaranId: tahunAjaranId ? parseInt(tahunAjaranId) : existing.tahunAjaranId,
        namaLembaga,
        alamatLembaga: alamatLembaga ?? existing.alamatLembaga,
        headerKop: headerKop ?? existing.headerKop,
        footerKop: footerKop ?? existing.footerKop,
        tandaTanganKepala: tandaTanganKepala ?? existing.tandaTanganKepala,
        namaKepala: namaKepala ?? existing.namaKepala,
        jabatanKepala: jabatanKepala ?? existing.jabatanKepala,
        tampilanGrafik: tampilanGrafik ?? existing.tampilanGrafik,
        tampilanRanking: tampilanRanking ?? existing.tampilanRanking,
        catatanTemplate: catatanTemplate ?? existing.catatanTemplate,
        status: status as StatusTemplate ?? existing.status
      },
      include: {
        tahunAjaran: true,
        creator: { select: { id: true, namaLengkap: true } }
      }
    });
  }

  static async delete(user: AuthUser, id: number) {
    this.checkAdmin(user);
    if (isNaN(id)) throw new TemplateRaportServiceError('ID tidak valid', 400);

    const existing = await prisma.templateRaport.findUnique({
      where: { id },
      include: { _count: { select: { raportSantri: true } } }
    });
    if (!existing) throw new TemplateRaportServiceError('Template raport tidak ditemukan', 404);
    if (existing._count.raportSantri > 0) throw new TemplateRaportServiceError('Template tidak bisa dihapus karena masih digunakan oleh raport santri', 400);

    await prisma.templateRaport.delete({ where: { id } });
    return { message: 'Template raport berhasil dihapus' };
  }

  static async toggleActive(user: AuthUser, id: number) {
    this.checkAdmin(user);
    if (isNaN(id)) throw new TemplateRaportServiceError('ID tidak valid', 400);

    const existing = await prisma.templateRaport.findUnique({ where: { id } });
    if (!existing) throw new TemplateRaportServiceError('Template raport tidak ditemukan', 404);

    const newStatus = existing.status === 'aktif' ? 'nonaktif' : 'aktif';
    return await prisma.templateRaport.update({
      where: { id },
      data: { status: newStatus as StatusTemplate }
    });
  }

  static async exportAsJson(user: AuthUser, id: number) {
    this.checkAdmin(user);
    if (isNaN(id)) throw new TemplateRaportServiceError('ID tidak valid', 400);

    const template = await prisma.templateRaport.findUnique({
      where: { id },
      include: { tahunAjaran: { select: { namaLengkap: true } } }
    });
    if (!template) throw new TemplateRaportServiceError('Template raport tidak ditemukan', 404);

    return {
      namaTemplate: template.namaTemplate,
      namaLembaga: template.namaLembaga,
      logoLembaga: template.logoLembaga,
      alamatLembaga: template.alamatLembaga,
      headerKopSurat: template.headerKop,
      footerRaport: template.footerKop,
      tandaTanganKepala: template.tandaTanganKepala,
      namaKepala: template.namaKepala,
      jabatanKepala: template.jabatanKepala,
      formatTampilan: {
        tampilanGrafik: template.tampilanGrafik,
        tampilanRanking: template.tampilanRanking,
        catatanTemplate: template.catatanTemplate
      },
      tahunAjaran: template.tahunAjaran?.namaLengkap || null
    };
  }
}
