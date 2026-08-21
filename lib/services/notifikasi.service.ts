import prisma from '@/lib/database/prisma';
import { type AuthUser } from '@/lib/auth';

export class NotifikasiService {
  static async listForUser(user: AuthUser, pagination: { page: number; limit: number }, unreadOnly: boolean) {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const targetAudienceFilter: string[] = ['semua'];
    if (user.role.name === 'santri') targetAudienceFilter.push('santri');
    else if (user.role.name === 'guru') targetAudienceFilter.push('guru');
    else if (user.role.name === 'ortu') targetAudienceFilter.push('ortu');
    else if (user.role.name === 'super_admin') targetAudienceFilter.push('super_admin');
    else if (user.role.name === 'yayasan') targetAudienceFilter.push('yayasan');

    const [notifikasi, pengumuman] = await Promise.all([
      prisma.notifikasi.findMany({ where: { userId: user.id }, orderBy: { tanggal: 'desc' }, skip, take: limit }),
      prisma.pengumuman.findMany({
        where: { AND: [{ targetAudience: { in: targetAudienceFilter as any } }, { OR: [{ tanggalKadaluarsa: null }, { tanggalKadaluarsa: { gte: new Date() } }] }] },
        include: { creator: { select: { namaLengkap: true } }, dibacaOleh: { where: { userId: user.id }, select: { dibacaPada: true } } },
        orderBy: { tanggal: 'desc' }, take: 20
      })
    ]);

    const pengumumanNotifications = pengumuman.map(p => ({
      id: `pengumuman_${p.id}`, pesan: `Pengumuman baru: ${p.judul}`, tanggal: p.tanggal,
      type: 'pengumuman', refId: p.id, userId: user.id, isRead: p.dibacaOleh.length > 0,
      metadata: { judul: p.judul, isi: p.isi.length > 100 ? `${p.isi.substring(0, 100)}...` : p.isi, fullContent: p.isi, creator: p.creator?.namaLengkap || 'Unknown', targetAudience: p.targetAudience, tanggalKadaluarsa: p.tanggalKadaluarsa }
    }));

    const allNotifications = [
      ...notifikasi.map(n => ({ ...n, isRead: n.isRead, readAt: n.readAt })),
      ...pengumumanNotifications
    ].sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());

    const filteredNotifications = unreadOnly ? allNotifications.filter(n => !n.isRead) : allNotifications;
    const unreadPengumumanCount = pengumumanNotifications.filter(p => !p.isRead).length;
    const unreadNotifikasiCount = notifikasi.filter(n => !n.isRead).length;

    return {
      data: filteredNotifications.slice(0, limit),
      pagination: { page, limit, total: allNotifications.length, totalPages: Math.ceil(allNotifications.length / limit) },
      unreadCount: unreadPengumumanCount + unreadNotifikasiCount,
      stats: { regularNotifications: notifikasi.length, pengumumanNotifications: pengumumanNotifications.length, unreadPengumuman: unreadPengumumanCount }
    };
  }

  static async createBulk(data: { pesan: string; type: string; refId?: number | null; userIds: number[] }) {
    const { pesan, type, refId, userIds } = data;
    if (!pesan || !type) throw new NotifikasiServiceError('Pesan dan type harus diisi', 400);
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) throw new NotifikasiServiceError('User IDs harus diisi', 400);

    const notifications = userIds.map((userId: number) => ({ pesan, type: type as any, refId: refId || null, userId: Number(userId) }));
    await prisma.notifikasi.createMany({ data: notifications });
    return { message: `${notifications.length} notifikasi berhasil dibuat`, count: notifications.length };
  }

  static async markAsRead(id: string, user: AuthUser, action: string) {
    if (action !== 'mark_read') throw new NotifikasiServiceError('Invalid action', 400);

    if (id.startsWith('pengumuman_')) {
      const pengumumanId = parseInt(id.replace('pengumuman_', ''));
      if (isNaN(pengumumanId)) throw new NotifikasiServiceError('Invalid pengumuman ID', 400);
      const existingRead = await prisma.pengumumanRead.findUnique({ where: { pengumumanId_userId: { pengumumanId, userId: user.id } } });
      if (!existingRead) await prisma.pengumumanRead.create({ data: { pengumumanId, userId: user.id } });
      return { message: 'Pengumuman marked as read', isRead: true };
    }

    const notifId = parseInt(id);
    if (isNaN(notifId)) throw new NotifikasiServiceError('Invalid notification ID', 400);
    await prisma.notifikasi.updateMany({ where: { id: notifId, userId: user.id }, data: { isRead: true, readAt: new Date() } });
    return { message: 'Notification marked as read', isRead: true };
  }

  static async delete(id: string, user: AuthUser) {
    if (id.startsWith('pengumuman_')) {
      const pengumumanId = parseInt(id.replace('pengumuman_', ''));
      if (isNaN(pengumumanId)) throw new NotifikasiServiceError('Invalid pengumuman ID', 400);

      if (['super_admin'].includes(user.role.name)) {
        await prisma.$transaction(async (tx) => {
          await tx.notifikasi.deleteMany({ where: { type: 'pengumuman', refId: pengumumanId } });
          await tx.pengumuman.delete({ where: { id: pengumumanId } });
        });
        return { message: 'Pengumuman berhasil dihapus untuk semua user', deletedId: pengumumanId, scope: 'all_users' };
      }

      const existingRead = await prisma.pengumumanRead.findUnique({ where: { pengumumanId_userId: { pengumumanId, userId: user.id } } });
      if (!existingRead) await prisma.pengumumanRead.create({ data: { pengumumanId, userId: user.id } });
      return { message: 'Pengumuman disembunyikan dari dashboard Anda', deletedId: pengumumanId, scope: 'current_user_only' };
    }

    const notifId = parseInt(id);
    if (isNaN(notifId)) throw new NotifikasiServiceError('Invalid notification ID', 400);
    const notification = await prisma.notifikasi.findFirst({ where: { id: notifId, userId: user.id } });
    if (!notification) throw new NotifikasiServiceError('Notification not found', 404);
    await prisma.notifikasi.delete({ where: { id: notifId } });
    return { message: 'Notifikasi berhasil dihapus', deletedId: notifId, scope: 'current_user_only' };
  }
}

export class NotifikasiServiceError extends Error {
  constructor(message: string, public statusCode: number = 500) {
    super(message);
    this.name = 'NotifikasiServiceError';
  }
}
