import { prisma } from '@/lib/database/prisma';
import { getGuruSantriIds } from '@/lib/auth';
import { notifyPrestasi } from '@/lib/services/whatsapp-notifier';

export interface AuthUser {
  id: number;
  namaLengkap: string;
  role: { name: string };
}

export class PrestasiServiceError extends Error {
  constructor(message: string, public statusCode: number = 500) {
    super(message);
    this.name = 'PrestasiServiceError';
  }
}

export class PrestasiService {
  static async list(user: AuthUser, halaqahId?: number) {
    if (user.role.name !== 'guru') throw new PrestasiServiceError('Access denied', 403);
    
    let santriIds: number[] = [];
    if (halaqahId) {
      const halaqahSantri = await prisma.halaqahSantri.findMany({
        where: { halaqahId, halaqah: { guruId: user.id } },
        select: { santriId: true }
      });
      santriIds = halaqahSantri.map(hs => hs.santriId);
    } else {
      santriIds = await getGuruSantriIds(user.id);
    }

    if (santriIds.length === 0) return [];

    return await prisma.prestasi.findMany({
      where: { santriId: { in: santriIds } },
      include: { santri: { select: { id: true, namaLengkap: true, username: true } } },
      orderBy: [{ tahun: 'desc' }, { id: 'desc' }]
    });
  }

  static async create(user: AuthUser, data: any) {
    if (user.role.name !== 'guru') throw new PrestasiServiceError('Access denied', 403);
    
    const { santriId, namaPrestasi, keterangan, kategori, tahun } = data;
    if (!santriId || !namaPrestasi || !tahun) throw new PrestasiServiceError('Missing required fields', 400);

    const guruSantriIds = await getGuruSantriIds(user.id);
    if (!guruSantriIds.includes(Number(santriId))) throw new PrestasiServiceError('Santri tidak terdaftar di halaqah Anda', 403);

    const prestasi = await prisma.prestasi.create({
      data: {
        santriId: Number(santriId),
        namaPrestasi,
        keterangan: keterangan || null,
        kategori: kategori || null,
        tahun: Number(tahun),
        validated: false
      },
      include: { santri: { select: { id: true, namaLengkap: true, username: true } } }
    });

    await prisma.notifikasi.create({
      data: {
        pesan: 'Prestasi baru ditambahkan: ' + prestasi.namaPrestasi,
        type: 'rapot',
        refId: prestasi.id,
        userId: Number(santriId)
      }
    });

    notifyPrestasi(Number(santriId), { namaPrestasi, namaGuru: user.namaLengkap }).catch(console.error);

    return prestasi;
  }

  static async update(user: AuthUser, id: number, data: any) {
    if (user.role.name !== 'guru') throw new PrestasiServiceError('Access denied', 403);
    if (isNaN(id)) throw new PrestasiServiceError('Invalid prestasi ID', 400);

    const existing = await prisma.prestasi.findUnique({ where: { id } });
    if (!existing) throw new PrestasiServiceError('Prestasi not found', 404);

    const guruSantriIds = await getGuruSantriIds(user.id);
    if (!guruSantriIds.includes(existing.santriId)) throw new PrestasiServiceError('Access denied', 403);

    const { santriId, namaPrestasi, keterangan, kategori, tahun } = data;
    return await prisma.prestasi.update({
      where: { id },
      data: {
        ...(santriId && { santriId: Number(santriId) }),
        ...(namaPrestasi && { namaPrestasi }),
        ...(keterangan !== undefined && { keterangan }),
        ...(kategori !== undefined && { kategori }),
        ...(tahun && { tahun: Number(tahun) })
      },
      include: { santri: { select: { id: true, namaLengkap: true, username: true } } }
    });
  }

  static async validate(user: AuthUser, id: number, validated: boolean) {
    if (user.role.name !== 'guru') throw new PrestasiServiceError('Access denied', 403);
    if (isNaN(id)) throw new PrestasiServiceError('Invalid prestasi ID', 400);
    if (validated === undefined) throw new PrestasiServiceError('Validated field is required', 400);

    const existing = await prisma.prestasi.findUnique({ where: { id } });
    if (!existing) throw new PrestasiServiceError('Prestasi not found', 404);

    const guruSantriIds = await getGuruSantriIds(user.id);
    if (!guruSantriIds.includes(existing.santriId)) throw new PrestasiServiceError('Access denied', 403);

    const updated = await prisma.prestasi.update({
      where: { id },
      data: { validated: Boolean(validated) },
      include: { santri: { select: { id: true, namaLengkap: true, username: true } } }
    });

    if (validated) {
      await prisma.notifikasi.create({
        data: {
          pesan: 'Prestasi ' + existing.namaPrestasi + ' telah divalidasi oleh guru',
          type: 'rapot',
          refId: id,
          userId: existing.santriId
        }
      });
      notifyPrestasi(existing.santriId, { namaPrestasi: existing.namaPrestasi, namaGuru: user.namaLengkap }).catch(console.error);
    }

    return updated;
  }

  static async delete(user: AuthUser, id: number) {
    if (user.role.name !== 'guru') throw new PrestasiServiceError('Access denied', 403);
    if (isNaN(id)) throw new PrestasiServiceError('Invalid prestasi ID', 400);

    const existing = await prisma.prestasi.findUnique({ where: { id } });
    if (!existing) throw new PrestasiServiceError('Prestasi not found', 404);

    const guruSantriIds = await getGuruSantriIds(user.id);
    if (!guruSantriIds.includes(existing.santriId)) throw new PrestasiServiceError('Access denied', 403);

    await prisma.prestasi.delete({ where: { id } });
    return { message: 'Prestasi deleted successfully' };
  }
}
