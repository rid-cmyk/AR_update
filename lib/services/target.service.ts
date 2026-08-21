import { prisma } from '@/lib/database/prisma';
import { type AuthUser } from '@/lib/auth';
import { notifyTarget } from '@/lib/services/whatsapp-notifier';
import { createAuditLog } from '@/lib/services/audit.service';
import { QuranUtils } from '@/utils/data/quran-mapping';
import { STATUS_TARGET } from '@/constants/constants';
import { StatusTarget } from '@prisma/client';

interface TargetFilters {
  santriName?: string;
  santriId?: string;
  surat?: string;
  status?: string;
}

interface PaginationParams {
  page: number;
  limit: number;
}

export class TargetService {
  static async listForGuru(user: AuthUser, filters: TargetFilters, pagination: PaginationParams) {
    const { page, limit } = pagination;
    const { santriName, santriId, surat, status } = filters;

    // Get santri in guru's halaqah first
    const halaqahSantri = await prisma.halaqahSantri.findMany({
      where: {
        halaqah: {
          guruId: user.id
        }
      },
      include: {
        santri: {
          select: {
            id: true,
            namaLengkap: true
          }
        }
      }
    });

    let santriIds = halaqahSantri.map(hs => hs.santriId);

    // Filter by specific santri if specified
    if (santriId) {
      santriIds = santriIds.filter(id => id === parseInt(santriId));
    }

    // Filter by santri name if specified
    if (santriName) {
      const filteredSantri = halaqahSantri.filter(hs =>
        hs.santri.namaLengkap.toLowerCase().includes(santriName.toLowerCase())
      );
      santriIds = filteredSantri.map(hs => hs.santriId);
    }

    const whereClause: any = {
      santriId: { in: santriIds }
    };

    // Filter by surat if specified
    if (surat) {
      whereClause.surat = {
        contains: surat,
        mode: 'insensitive'
      };
    }

    // Filter by status if specified
    if (status && ['belum', 'proses', 'selesai'].includes(status)) {
      whereClause.status = status;
    }

    const skip = (page - 1) * limit;

    const [targets, total] = await Promise.all([
      prisma.targetHafalan.findMany({
        where: whereClause,
        include: {
          santri: {
            select: {
              id: true,
              namaLengkap: true,
              username: true
            }
          }
        },
        orderBy: {
          deadline: 'asc'
        },
        skip,
        take: limit
      }),
      prisma.targetHafalan.count({ where: whereClause })
    ]);

    return {
      data: targets,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  static async create(
    user: AuthUser,
    data: { santriId: string | number; surat: string; ayatTarget: string | number; deadline: string; status?: string }
  ) {
    const { santriId, surat, ayatTarget, deadline, status } = data;

    // Validation
    if (!santriId || !surat || !ayatTarget || !deadline) {
      throw new TargetServiceError('Data tidak lengkap. Santri, surat, target ayat, dan deadline harus diisi.', 400);
    }

    // Validate status
    const validStatus = status || 'belum';
    if (!['belum', 'proses', 'selesai'].includes(validStatus)) {
      throw new TargetServiceError('Status harus belum, proses, atau selesai', 400);
    }

    // Validate ayat target
    if (Number(ayatTarget) <= 0) {
      throw new TargetServiceError('Target ayat harus lebih dari 0', 400);
    }

    // Check if santri is in guru's halaqah
    const halaqahSantri = await prisma.halaqahSantri.findFirst({
      where: {
        santriId: parseInt(String(santriId)),
        halaqah: {
          guruId: user.id
        }
      }
    });

    if (!halaqahSantri) {
      throw new TargetServiceError('Santri tidak ada dalam halaqah Anda', 403);
    }

    // Check if target already exists for this santri and surat
    const existingTarget = await prisma.targetHafalan.findFirst({
      where: {
        santriId: parseInt(String(santriId)),
        surat: surat,
        status: { in: ['belum', 'proses'] }
      }
    });

    if (existingTarget) {
      throw new TargetServiceError(`Target untuk surat ${surat} sudah ada dan belum selesai`, 400);
    }

    // Create target hafalan
    const target = await prisma.targetHafalan.create({
      data: {
        santriId: parseInt(String(santriId)),
        surat,
        ayatTarget: parseInt(String(ayatTarget)),
        deadline: new Date(deadline),
        status: validStatus as StatusTarget
      },
      include: {
        santri: {
          select: {
            id: true,
            namaLengkap: true,
            username: true
          }
        }
      }
    });

    // Create notification for santri
    await prisma.notifikasi.create({
      data: {
        pesan: `Target hafalan baru: ${surat} (${ayatTarget} ayat) - deadline ${new Date(deadline).toLocaleDateString('id-ID')}`,
        type: 'hafalan',
        refId: target.id,
        userId: parseInt(String(santriId))
      }
    });

    // WhatsApp notification to parent
    notifyTarget(parseInt(String(santriId)), "created", {
      namaSurat: surat,
      namaGuru: user.namaLengkap,
    }).catch(console.error);

    // Log activity
    await createAuditLog(
      'CREATE_TARGET',
      `Guru ${user.namaLengkap} menetapkan target ${surat} untuk ${(target as any).santri.namaLengkap}`,
      user.id
    );

    return target;
  }

  static async createMultiRole(
    user: AuthUser,
    data: { santriId: string | number; surat: string; ayatTarget: string | number; deadline: string; status?: string; halaqahId: string | number }
  ) {
    const { santriId, surat, ayatTarget, deadline, status, halaqahId } = data;

    if (!santriId || !surat || !ayatTarget || !deadline || !halaqahId) {
      throw new TargetServiceError('Missing required fields', 400);
    }

    const halaqahSantri = await prisma.halaqahSantri.findFirst({
      where: {
        halaqahId: Number(halaqahId),
        santriId: Number(santriId)
      }
    });

    if (!halaqahSantri) {
      throw new TargetServiceError('Santri tidak terdaftar di halaqah ini', 400);
    }

    if (user.role.name === 'guru') {
      const ownedHalaqah = await prisma.halaqah.findFirst({
        where: { id: Number(halaqahId), guruId: user.id },
        select: { id: true }
      });
      if (!ownedHalaqah) {
        throw new TargetServiceError('Anda tidak memiliki akses ke halaqah ini', 403);
      }
    }

    const target = await prisma.targetHafalan.create({
      data: {
        santriId: Number(santriId),
        surat,
        ayatTarget: Number(ayatTarget),
        deadline: new Date(deadline),
        status: status as any
      },
      include: {
        santri: {
          select: {
            id: true,
            namaLengkap: true,
            username: true
          }
        }
      }
    });

    return target;
  }

  static async listMultiRole(user: AuthUser, halaqahId?: number) {
    const roleName = user.role.name;

    let santriIds: number[] = [];

    if (roleName === 'super_admin') {
      if (halaqahId) {
        const halaqahSantri = await prisma.halaqahSantri.findMany({
          where: { halaqahId: Number(halaqahId) },
          select: { santriId: true }
        });
        santriIds = halaqahSantri.map(hs => hs.santriId);
      }
    } else if (roleName === 'guru') {
      let allowedHalaqahIds: number[] | null = null;
      if (halaqahId) {
        const owned = await prisma.halaqah.findFirst({
          where: { id: Number(halaqahId), guruId: user.id },
          select: { id: true }
        });
        if (!owned) {
          throw new TargetServiceError('Anda tidak memiliki akses ke halaqah ini', 403);
        }
        allowedHalaqahIds = [Number(halaqahId)];
      }
      const halaqahList = await prisma.halaqah.findMany({
        where: allowedHalaqahIds ? { id: { in: allowedHalaqahIds }, guruId: user.id } : { guruId: user.id },
        include: {
          santri: { select: { santriId: true } }
        }
      });
      santriIds = [...new Set(halaqahList.flatMap(h => h.santri.map(hs => hs.santriId)))];
    } else if (roleName === 'santri') {
      santriIds = [user.id];
    } else if (roleName === 'ortu') {
      const children = await prisma.orangTuaSantri.findMany({
        where: { orangTuaId: user.id },
        select: { santriId: true }
      });
      santriIds = children.map(c => c.santriId);
    } else {
      throw new TargetServiceError('Role tidak memiliki akses ke target', 403);
    }

    const where: Record<string, unknown> = {};
    if (santriIds.length > 0) {
      where.santriId = { in: santriIds };
    } else {
      return [];
    }

    const targets = await prisma.targetHafalan.findMany({
      where,
      include: {
        santri: {
          select: {
            id: true,
            namaLengkap: true,
            username: true
          }
        }
      },
      orderBy: { deadline: 'asc' }
    });

    return targets;
  }

  // ─── Private helpers ─────────────────────────────────────────────

  private static async requireTargetInGuruHalaqah(targetId: number, guruId: number) {
    const target = await prisma.targetHafalan.findUnique({
      where: { id: targetId },
      include: {
        santri: { select: { id: true, namaLengkap: true, username: true } }
      }
    });
    if (!target) throw new TargetServiceError('Target tidak ditemukan', 404);
    const halaqahSantri = await prisma.halaqahSantri.findFirst({
      where: { santriId: target.santriId, halaqah: { guruId } }
    });
    if (!halaqahSantri) throw new TargetServiceError('Anda tidak memiliki akses untuk target ini', 403);
    return target;
  }

  private static async sendStatusNotification(
    targetId: number, santriId: number, surat: string, status: string, guruName: string
  ) {
    let message = '';
    if (status === 'proses') message = `Target hafalan ${surat} dimulai`;
    else if (status === 'selesai') message = `Selamat! Target hafalan ${surat} telah selesai`;
    else if (status === 'belum') message = `Target hafalan ${surat} direset`;
    if (message) {
      await prisma.notifikasi.create({ data: { pesan: message, type: 'hafalan', refId: targetId, userId: santriId } });
      const waAction = status === 'selesai' ? 'completed' : status === 'belum' ? 'deleted' : 'created';
      notifyTarget(santriId, waAction, { namaSurat: surat, namaGuru: guruName }).catch(console.error);
    }
  }

  // ─── guru/target/[id] ───────────────────────────────────────────

  static async updateById(id: number, user: AuthUser, data: { surat?: string; ayatTarget?: string | number; deadline?: string; status?: string }) {
    const target = await this.requireTargetInGuruHalaqah(id, user.id);
    const updateData: Record<string, unknown> = {};
    if (data.surat) updateData.surat = data.surat;
    if (data.ayatTarget) {
      if (Number(data.ayatTarget) <= 0) throw new TargetServiceError('Target ayat harus lebih dari 0', 400);
      updateData.ayatTarget = Number(data.ayatTarget);
    }
    if (data.deadline) updateData.deadline = new Date(data.deadline);
    if (data.status && ['belum', 'proses', 'selesai'].includes(data.status)) updateData.status = data.status;

    const updated = await prisma.targetHafalan.update({
      where: { id }, data: updateData,
      include: { santri: { select: { id: true, namaLengkap: true, username: true } } }
    });

    if (data.status && data.status !== target.status) {
      await this.sendStatusNotification(id, target.santriId, updated.surat, data.status, user.namaLengkap);
    }
    await createAuditLog('UPDATE_TARGET', `Guru ${user.namaLengkap} mengupdate target ${updated.surat} untuk ${updated.santri.namaLengkap}`, user.id);
    return updated;
  }

  static async deleteById(id: number, user: AuthUser) {
    const target = await this.requireTargetInGuruHalaqah(id, user.id);
    await prisma.targetHafalan.delete({ where: { id } });
    await prisma.notifikasi.create({
      data: { pesan: `Target hafalan ${target.surat} telah dihapus`, type: 'hafalan', refId: null, userId: target.santriId }
    });
    notifyTarget(target.santriId, 'deleted', { namaSurat: target.surat, namaGuru: user.namaLengkap }).catch(console.error);
    await createAuditLog('DELETE_TARGET', `Guru ${user.namaLengkap} menghapus target ${target.surat} untuk ${target.santri.namaLengkap}`, user.id);
    return { message: 'Target hafalan berhasil dihapus' };
  }

  // ─── guru/target-hafalan ────────────────────────────────────────

  static async listWithProgress(user: AuthUser, santriId?: number) {
    const whereClause: Record<string, unknown> = {};
    if (santriId) {
      const found = await prisma.halaqahSantri.findFirst({
        where: { santriId, halaqah: { guruId: user.id } }
      });
      if (!found) throw new TargetServiceError('Santri tidak ada dalam halaqah Anda', 403);
      whereClause.santriId = santriId;
    } else {
      const halaqahList = await prisma.halaqah.findMany({
        where: { guruId: user.id },
        include: { santri: { select: { santriId: true } } }
      });
      whereClause.santriId = { in: halaqahList.flatMap(h => h.santri.map(s => s.santriId)) };
    }

    const targetData = await prisma.targetHafalan.findMany({
      where: whereClause,
      include: { santri: { select: { id: true, namaLengkap: true, username: true } } },
      orderBy: { deadline: 'asc' }
    });

    const allSantriIds = [...new Set(targetData.map(t => t.santriId))];
    const allSurats = [...new Set(targetData.map(t => t.surat))];
    const allHafalan = await prisma.hafalan.findMany({
      where: { santriId: { in: allSantriIds }, surat: { in: allSurats }, status: 'ziyadah' },
      orderBy: { ayatSelesai: 'desc' }
    });

    const hafalanMap = new Map<string, typeof allHafalan>();
    for (const h of allHafalan) {
      const key = `${h.santriId}:${h.surat}`;
      if (!hafalanMap.has(key)) hafalanMap.set(key, []);
      hafalanMap.get(key)!.push(h);
    }

    return targetData.map(target => {
      const hafalanData = (hafalanMap.get(`${target.santriId}:${target.surat}`) || [])
        .filter(h => new Date(h.tanggal) <= new Date(target.deadline));
      let currentAyat = 0;
      if (hafalanData.length > 0) currentAyat = Math.min(hafalanData[0].ayatSelesai, target.ayatTarget);
      return {
        id: target.id, santriId: target.santriId, santriNama: target.santri.namaLengkap,
        surat: target.surat, ayatTarget: target.ayatTarget, currentAyat,
        deadline: target.deadline.toISOString(), status: target.status,
        progressPercentage: Math.round((currentAyat / target.ayatTarget) * 100)
      };
    });
  }

  static async createFromHafalan(user: AuthUser, data: { santriId: string | number; surat: string; ayatTarget: string | number; deadline: string }) {
    const { santriId, surat, ayatTarget, deadline } = data;
    if (!santriId || !surat || !ayatTarget || !deadline) throw new TargetServiceError('Data tidak lengkap', 400);

    const santriInHalaqah = await prisma.halaqahSantri.findFirst({
      where: { santriId: parseInt(String(santriId)), halaqah: { guruId: user.id } }
    });
    if (!santriInHalaqah) throw new TargetServiceError('Santri tidak ada dalam halaqah Anda', 403);

    const existingTarget = await prisma.targetHafalan.findFirst({
      where: { santriId: parseInt(String(santriId)), surat, status: { in: ['belum', 'proses'] } }
    });
    if (existingTarget) throw new TargetServiceError('Target untuk surah ini sudah ada dan belum selesai', 400);

    return prisma.targetHafalan.create({
      data: { santriId: parseInt(String(santriId)), surat, ayatTarget: parseInt(String(ayatTarget)), deadline: new Date(deadline), status: 'belum' },
      include: { santri: { select: { namaLengkap: true, username: true } } }
    });
  }

  static async updateFromHafalan(user: AuthUser, data: { id: number; surat?: string; ayatTarget?: string | number; deadline?: string; status?: string }) {
    const target = await this.requireTargetInGuruHalaqah(data.id, user.id);
    return prisma.targetHafalan.update({
      where: { id: data.id },
      data: { surat: data.surat, ayatTarget: data.ayatTarget ? parseInt(String(data.ayatTarget)) : undefined, deadline: data.deadline ? new Date(data.deadline) : undefined, status: data.status as StatusTarget | undefined },
      include: { santri: { select: { namaLengkap: true, username: true } } }
    });
  }

  static async deleteFromHafalan(user: AuthUser, id: number) {
    await this.requireTargetInGuruHalaqah(id, user.id);
    await prisma.targetHafalan.delete({ where: { id } });
    return { message: 'Target hafalan berhasil dihapus' };
  }

  // ─── guru/target-juz/[id] ───────────────────────────────────────

  static async getTargetJuz(id: number, user: AuthUser) {
    const target = await this.requireTargetInGuruHalaqah(id, user.id);
    const hafalanData = await prisma.hafalan.findMany({
      where: { santriId: target.santriId, status: 'ziyadah' },
      select: { surat: true, ayatMulai: true, ayatSelesai: true }
    });
    const juzProgress = QuranUtils.calculateJuzProgressFromSurat(hafalanData);
    const targetProgress = (juzProgress as Record<string, unknown>)[target.surat] as Record<string, unknown> | undefined;
    if (!targetProgress) return { ...target, progress: 0, hafalAyat: 0, totalAyat: 0, details: [] };
    return { ...target, progress: targetProgress.progress, hafalAyat: targetProgress.hafalAyat, totalAyat: targetProgress.totalAyat, details: targetProgress.details };
  }

  static async updateTargetJuz(id: number, user: AuthUser, data: { santriId?: string | number; juz?: number; deadline?: string; status?: string }) {
    const target = await this.requireTargetInGuruHalaqah(id, user.id);
    if (data.juz && (data.juz < 1 || data.juz > 30)) throw new TargetServiceError('Juz harus antara 1-30', 400);
    if (data.status && !['belum', 'proses', 'selesai'].includes(data.status)) throw new TargetServiceError('Status harus belum, proses, atau selesai', 400);

    if (data.juz && data.juz !== Number(target.surat)) {
      const dup = await prisma.targetHafalan.findFirst({
        where: { santriId: target.santriId, surat: String(data.juz), status: { in: ['belum', 'proses'] }, id: { not: id } }
      });
      if (dup) throw new TargetServiceError(`Target untuk Juz ${data.juz} sudah ada dan belum selesai`, 400);
    }

    const updateData: Record<string, unknown> = {};
    if (data.santriId) updateData.santriId = parseInt(String(data.santriId));
    if (data.juz) updateData.surat = String(data.juz);
    if (data.deadline) updateData.deadline = new Date(data.deadline);
    if (data.status) updateData.status = data.status;

    const updated = await prisma.targetHafalan.update({
      where: { id }, data: updateData,
      include: { santri: { select: { id: true, namaLengkap: true, username: true } } }
    });

    if (data.juz || data.deadline || data.status) {
      const juzNum = data.juz ? String(data.juz) : target.surat;
      const juzInfo = QuranUtils.getJuzInfo(parseInt(juzNum));
      const suratList = juzInfo.map((item: Record<string, unknown>) => item.surat as string).join(', ');
      let msg = `Target hafalan diperbarui: Juz ${juzNum} (${suratList})`;
      if (data.deadline) msg += ` - deadline ${new Date(data.deadline).toLocaleDateString('id-ID')}`;
      await prisma.notifikasi.create({ data: { pesan: msg, type: 'hafalan', refId: updated.id, userId: updated.santriId } });
      notifyTarget(updated.santriId, 'created', { namaSurat: `Juz ${updated.surat}`, namaGuru: user.namaLengkap }).catch(console.error);
    }

    await createAuditLog('UPDATE_TARGET_JUZ', `Guru ${user.namaLengkap} mengubah target Juz ${updated.surat} untuk ${updated.santri.namaLengkap}`, user.id);
    return updated;
  }

  static async deleteTargetJuz(id: number, user: AuthUser) {
    const target = await this.requireTargetInGuruHalaqah(id, user.id);
    await prisma.targetHafalan.delete({ where: { id } });
    const juzInfo = QuranUtils.getJuzInfo(parseInt(target.surat));
    const suratList = juzInfo.map((item: Record<string, unknown>) => item.surat as string).join(', ');
    await prisma.notifikasi.create({
      data: { pesan: `Target hafalan dibatalkan: Juz ${target.surat} (${suratList})`, type: 'hafalan', refId: null, userId: target.santriId }
    });
    notifyTarget(target.santriId, 'deleted', { namaSurat: `Juz ${target.surat}`, namaGuru: user.namaLengkap }).catch(console.error);
    await createAuditLog('DELETE_TARGET_JUZ', `Guru ${user.namaLengkap} menghapus target Juz ${target.surat} untuk ${target.santri.namaLengkap}`, user.id);
    return { message: 'Target juz berhasil dihapus' };
  }

  // ─── target/[id] (multi-role) ───────────────────────────────────

  static async updateMultiRole(id: number, user: AuthUser, data: { santriId?: string | number; surat?: string; ayatTarget?: string | number; deadline?: string; status?: string }) {
    const existingTarget = await prisma.targetHafalan.findUnique({
      where: { id: Number(id) },
      include: { santri: { include: { HalaqahSantri: { include: { halaqah: true } } } } }
    });
    if (!existingTarget) throw new TargetServiceError('Target not found', 404);

    if (user.role.name === 'guru') {
      const isAuthorized = existingTarget.santri.HalaqahSantri.some((hs: Record<string, unknown>) => (hs.halaqah as Record<string, unknown>).guruId === user.id);
      if (!isAuthorized) throw new TargetServiceError('Unauthorized to update this target', 403);
    }

    const statusMap: Record<string, string> = { 'belum': STATUS_TARGET.BELUM, 'proses': STATUS_TARGET.PROSES, 'selesai': STATUS_TARGET.SELESAI };

    return prisma.targetHafalan.update({
      where: { id: Number(id) },
      data: {
        santriId: data.santriId ? Number(data.santriId) : undefined,
        surat: data.surat, ayatTarget: data.ayatTarget ? Number(data.ayatTarget) : undefined,
        deadline: data.deadline ? new Date(data.deadline) : undefined,
        status: data.status ? (statusMap[data.status] || STATUS_TARGET.BELUM) as any : undefined
      },
      include: { santri: { select: { id: true, namaLengkap: true, username: true } } }
    });
  }

  static async deleteMultiRole(id: number, user: AuthUser) {
    if (user.role.name === 'guru') {
      const existingTarget = await prisma.targetHafalan.findUnique({
        where: { id: Number(id) },
        include: { santri: { include: { HalaqahSantri: { include: { halaqah: true } } } } }
      });
      if (!existingTarget) throw new TargetServiceError('Target not found', 404);
      const isAuthorized = existingTarget.santri.HalaqahSantri.some((hs: Record<string, unknown>) => (hs.halaqah as Record<string, unknown>).guruId === user.id);
      if (!isAuthorized) throw new TargetServiceError('Unauthorized to delete this target', 403);
    }
    await prisma.targetHafalan.delete({ where: { id: Number(id) } });
    return { message: 'Target deleted' };
  }

  // ─── santri/target ──────────────────────────────────────────────

  static async listForSantri(user: AuthUser, pagination: { page: number; limit: number }, statusFilter?: string) {
    const { page, limit } = pagination;
    const whereClause: Record<string, unknown> = { santriId: user.id };
    if (statusFilter && ['belum', 'proses', 'selesai'].includes(statusFilter)) whereClause.status = statusFilter;

    const skip = (page - 1) * limit;
    const [targets, total] = await Promise.all([
      prisma.targetHafalan.findMany({ where: whereClause, orderBy: [{ status: 'asc' }, { deadline: 'asc' }], skip, take: limit }),
      prisma.targetHafalan.count({ where: whereClause })
    ]);

    const stats = await prisma.targetHafalan.groupBy({ by: ['status'], where: { santriId: user.id }, _count: { id: true } });
    const statistics = {
      total,
      belum: (stats as any[]).find(s => s.status === 'belum')?._count?.id || 0,
      proses: (stats as any[]).find(s => s.status === 'proses')?._count?.id || 0,
      selesai: (stats as any[]).find(s => s.status === 'selesai')?._count?.id || 0
    };

    const allSurats = [...new Set(targets.map(t => t.surat))];
    const allHafalan = await prisma.hafalan.findMany({
      where: { santriId: user.id, surat: { in: allSurats }, status: 'ziyadah' },
      select: { surat: true, ayatMulai: true, ayatSelesai: true }
    });

    const hafalanMap = new Map<string, typeof allHafalan>();
    for (const h of allHafalan) {
      if (!hafalanMap.has(h.surat)) hafalanMap.set(h.surat, []);
      hafalanMap.get(h.surat)!.push(h);
    }

    const selesaiIds: number[] = [];
    const prosesIds: number[] = [];
    const targetsWithProgress = targets.map(target => {
      const hafalanRecords = hafalanMap.get(target.surat) || [];
      const ayatSet = new Set<number>();
      hafalanRecords.forEach(r => { for (let i = r.ayatMulai; i <= r.ayatSelesai; i++) ayatSet.add(i); });
      const currentAyat = ayatSet.size;
      const progress = Math.min(Math.round((currentAyat / target.ayatTarget) * 100), 100);
      let newStatus = target.status;
      if (progress >= 100 && target.status !== 'selesai') { newStatus = 'selesai'; selesaiIds.push(target.id); }
      else if (progress > 0 && target.status === 'belum') { newStatus = 'proses'; prosesIds.push(target.id); }
      return { ...target, status: newStatus, currentAyat, progress };
    });

    if (selesaiIds.length > 0) await prisma.targetHafalan.updateMany({ where: { id: { in: selesaiIds } }, data: { status: 'selesai' } });
    if (prosesIds.length > 0) await prisma.targetHafalan.updateMany({ where: { id: { in: prosesIds } }, data: { status: 'proses' } });

    return { data: targetsWithProgress, statistics, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }
}

export class TargetServiceError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'TargetServiceError';
  }
}
