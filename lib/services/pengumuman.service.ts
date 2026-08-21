import prisma from '@/lib/database/prisma';
import { Prisma, TargetAudience, NotifType } from '@prisma/client';
import { withApiCache, invalidateApiCache } from '@/lib/api-cache';
import { notifyPengumuman } from '@/lib/services/whatsapp-notifier';

interface AuthUser {
  id: number;
  namaLengkap: string;
  role: { name: string };
}

interface PaginationParams {
  page: number;
  limit: number;
}

export class PengumumanServiceError extends Error {
  constructor(message: string, public statusCode: number = 500) {
    super(message);
    this.name = 'PengumumanServiceError';
  }
}

export class PengumumanService {
  static async listMultiRole(
    user: AuthUser,
    pagination: PaginationParams,
    targetAudience?: string
  ) {
    const { page, limit } = pagination;

    const whereClause: Prisma.PengumumanWhereInput = {
      AND: [
        {
          OR: [
            { tanggalKadaluarsa: null },
            { tanggalKadaluarsa: { gte: new Date() } }
          ]
        }
      ]
    };

    if (user.role.name !== 'super_admin') {
      const audienceFilter = ['semua'];

      if (user.role.name === 'santri') {
        audienceFilter.push('santri');
      } else if (user.role.name === 'guru') {
        audienceFilter.push('guru');
      } else if (user.role.name === 'ortu') {
        audienceFilter.push('ortu');
      } else if (user.role.name === 'yayasan') {
        audienceFilter.push('yayasan');
      }

      (whereClause.AND as Prisma.PengumumanWhereInput[]).push({
        targetAudience: {
          in: audienceFilter as TargetAudience[]
        }
      });
    }

    if (targetAudience && ['super_admin'].includes(user.role.name)) {
      (whereClause.AND as Prisma.PengumumanWhereInput[]).push({
        targetAudience: targetAudience as TargetAudience
      });
    }

    const skip = (page - 1) * limit;

    const cacheKey = `pengumuman:role-${user.role.name}:user-${user.id}:page-${page}:limit-${limit}:aud-${targetAudience || 'all'}`;

    const [pengumuman, total] = await withApiCache(cacheKey, 60_000, async () => {
      return await Promise.all([
        prisma.pengumuman.findMany({
          where: whereClause,
          include: {
            creator: {
              select: {
                id: true,
                namaLengkap: true,
                role: {
                  select: {
                    name: true
                  }
                }
              }
            },
            dibacaOleh: ['super_admin'].includes(user.role.name) ? {
              select: {
                dibacaPada: true,
                user: {
                  select: {
                    id: true,
                    namaLengkap: true,
                    role: {
                      select: {
                        name: true
                      }
                    }
                  }
                }
              }
            } : {
              where: {
                userId: user.id
              },
              select: {
                dibacaPada: true
              }
            },
            _count: {
              select: {
                dibacaOleh: true
              }
            }
          },
          orderBy: {
            tanggal: 'desc'
          },
          skip,
          take: limit
        }),
        prisma.pengumuman.count({ where: whereClause })
      ]);
    });

    const formatted = pengumuman.map(p => ({
      id: p.id,
      judul: p.judul,
      isi: p.isi,
      tanggal: p.tanggal,
      tanggalKadaluarsa: p.tanggalKadaluarsa,
      targetAudience: p.targetAudience,
      creator: p.creator,
      isRead: p.dibacaOleh.length > 0,
      readCount: p._count.dibacaOleh,
      readDetails: ['super_admin'].includes(user.role.name) ?
        p.dibacaOleh.map((read: any) => ({
          userId: read.user.id,
          userName: read.user.namaLengkap,
          userRole: read.user.role.name,
          readAt: read.dibacaPada
        })) : undefined,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt
    }));

    return {
      data: formatted,
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
    data: {
      judul: string;
      isi: string;
      targetAudience: string;
      tanggalKadaluarsa?: string;
    }
  ) {
    if (!['super_admin'].includes(user.role.name)) {
      throw new Error('Access denied');
    }

    const { judul, isi, targetAudience, tanggalKadaluarsa } = data;

    if (!judul || !isi) {
      throw new Error('Judul dan isi pengumuman harus diisi');
    }

    if (!targetAudience) {
      throw new Error('Target audience harus dipilih');
    }

    const validTargets = ['semua', 'guru', 'santri', 'ortu', 'yayasan'];
    if (!validTargets.includes(targetAudience)) {
      throw new Error('Target audience tidak valid');
    }

    const pengumuman = await prisma.pengumuman.create({
      data: {
        judul,
        isi,
        targetAudience: targetAudience as TargetAudience,
        tanggalKadaluarsa: tanggalKadaluarsa ? new Date(tanggalKadaluarsa) : null,
        createdBy: user.id
      },
      include: {
        creator: {
          select: {
            id: true,
            namaLengkap: true,
            role: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    await createNotificationsForAnnouncement(pengumuman.id, targetAudience, user.id, judul, isi);

    invalidateApiCache('pengumuman');

    return {
      id: pengumuman.id,
      judul: pengumuman.judul,
      isi: pengumuman.isi,
      tanggal: pengumuman.tanggal,
      tanggalKadaluarsa: pengumuman.tanggalKadaluarsa,
      targetAudience: pengumuman.targetAudience,
      creator: pengumuman.creator,
      isRead: false,
      readCount: 0,
      createdAt: pengumuman.createdAt,
      updatedAt: pengumuman.updatedAt
    };
  }

  static async delete(user: AuthUser, id: number) {
    if (!['super_admin'].includes(user.role.name)) {
      throw new Error('Access denied');
    }

    if (isNaN(id)) {
      throw new Error('Invalid pengumuman ID');
    }

    const existingPengumuman = await prisma.pengumuman.findUnique({
      where: { id }
    });

    if (!existingPengumuman) {
      throw new Error('Pengumuman not found');
    }

    await prisma.$transaction(async (tx) => {
      const deletedNotifications = await tx.notifikasi.deleteMany({
        where: {
          type: 'pengumuman',
          refId: id
        }
      });

      await tx.pengumuman.delete({
        where: { id }
      });

      console.log(`Deleted pengumuman ${id} and ${deletedNotifications.count} related notifications`);
    });

    return {
      message: 'Pengumuman dan notifikasi terkait berhasil dihapus',
      deletedId: id
    };
  }

  static async getById(user: AuthUser, id: number) {
    if (isNaN(id)) {
      throw new Error('Invalid pengumuman ID');
    }

    const pengumuman = await prisma.pengumuman.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            namaLengkap: true,
            role: {
              select: {
                name: true
              }
            }
          }
        },
        dibacaOleh: {
          where: {
            userId: user.id
          },
          select: {
            dibacaPada: true
          }
        },
        _count: {
          select: {
            dibacaOleh: true
          }
        }
      }
    });

    if (!pengumuman) {
      throw new Error('Pengumuman not found');
    }

    const hasAccess = 
      ['super_admin'].includes(user.role.name) ||
      pengumuman.targetAudience === 'semua' ||
      pengumuman.targetAudience === user.role.name;

    if (!hasAccess) {
      throw new Error('Access denied');
    }

    if (pengumuman.dibacaOleh.length === 0) {
      await prisma.pengumumanRead.create({
        data: {
          pengumumanId: id,
          userId: user.id
        }
      });
    }

    return {
      id: pengumuman.id,
      judul: pengumuman.judul,
      isi: pengumuman.isi,
      tanggal: pengumuman.tanggal,
      tanggalKadaluarsa: pengumuman.tanggalKadaluarsa,
      targetAudience: pengumuman.targetAudience,
      creator: pengumuman.creator,
      isRead: pengumuman.dibacaOleh.length > 0 || pengumuman.dibacaOleh.length === 0,
      readCount: pengumuman._count.dibacaOleh + (pengumuman.dibacaOleh.length === 0 ? 1 : 0),
      createdAt: pengumuman.createdAt,
      updatedAt: pengumuman.updatedAt
    };
  }

  static async update(
    user: AuthUser,
    id: number,
    data: {
      judul: string;
      isi: string;
      targetAudience: string;
      tanggalKadaluarsa?: string | null;
    }
  ) {
    if (!['super_admin'].includes(user.role.name)) {
      throw new Error('Access denied');
    }

    if (isNaN(id)) {
      throw new Error('Invalid pengumuman ID');
    }

    const { judul, isi, targetAudience, tanggalKadaluarsa } = data;

    if (!judul || !isi) {
      throw new Error('Judul dan isi pengumuman harus diisi');
    }

    if (!targetAudience) {
      throw new Error('Target audience harus dipilih');
    }

    const validTargets = ['semua', 'guru', 'santri', 'ortu', 'yayasan'];
    if (!validTargets.includes(targetAudience)) {
      throw new Error('Target audience tidak valid');
    }

    const existingPengumuman = await prisma.pengumuman.findUnique({
      where: { id }
    });

    if (!existingPengumuman) {
      throw new Error('Pengumuman not found');
    }

    const updatedPengumuman = await prisma.pengumuman.update({
      where: { id },
      data: {
        judul,
        isi,
        targetAudience: targetAudience as TargetAudience,
        tanggalKadaluarsa: tanggalKadaluarsa ? new Date(tanggalKadaluarsa) : null,
        updatedAt: new Date()
      },
      include: {
        creator: {
          select: {
            id: true,
            namaLengkap: true,
            role: {
              select: {
                name: true
              }
            }
          }
        },
        _count: {
          select: {
            dibacaOleh: true
          }
        }
      }
    });
    
    invalidateApiCache('pengumuman');

    return {
      id: updatedPengumuman.id,
      judul: updatedPengumuman.judul,
      isi: updatedPengumuman.isi,
      tanggal: updatedPengumuman.tanggal,
      tanggalKadaluarsa: updatedPengumuman.tanggalKadaluarsa,
      targetAudience: updatedPengumuman.targetAudience,
      creator: updatedPengumuman.creator,
      isRead: false,
      readCount: updatedPengumuman._count.dibacaOleh,
      createdAt: updatedPengumuman.createdAt,
      updatedAt: updatedPengumuman.updatedAt
    };
  }

  static async markAsRead(userId: number, pengumumanId: number) {
    if (isNaN(pengumumanId)) throw new Error('Invalid ID');
    
    const existing = await prisma.pengumumanRead.findUnique({
      where: {
        pengumumanId_userId: {
          pengumumanId,
          userId
        }
      }
    });

    if (!existing) {
      await prisma.pengumumanRead.create({
        data: {
          pengumumanId,
          userId
        }
      });
    }

    return { success: true };
  }

  static async markAsUnread(userId: number, pengumumanId: number) {
    if (isNaN(pengumumanId)) throw new Error('Invalid ID');
    
    try {
      await prisma.pengumumanRead.delete({
        where: {
          pengumumanId_userId: {
            pengumumanId,
            userId
          }
        }
      });
    } catch (error) {
      // Ignore if not found
    }

    return { success: true };
  }

  static async getUnreadLatest(user: AuthUser, limit = 5) {
    const audienceFilter = ['semua'];

    if (user.role.name === 'santri') {
      audienceFilter.push('santri');
    } else if (user.role.name === 'guru') {
      audienceFilter.push('guru');
    } else if (user.role.name === 'ortu') {
      audienceFilter.push('ortu');
    } else if (user.role.name === 'yayasan') {
      audienceFilter.push('yayasan');
    }

    const pengumuman = await prisma.pengumuman.findMany({
      where: {
        OR: [
          { tanggalKadaluarsa: null },
          { tanggalKadaluarsa: { gte: new Date() } }
        ],
        targetAudience: {
          in: audienceFilter as TargetAudience[]
        },
        dibacaOleh: {
          none: {
            userId: user.id
          }
        }
      },
      include: {
        creator: {
          select: {
            id: true,
            namaLengkap: true
          }
        }
      },
      orderBy: {
        tanggal: 'desc'
      },
      take: limit
    });

    return pengumuman;
  }
}

async function createNotificationsForAnnouncement(
  pengumumanId: number,
  targetAudience: string,
  creatorId: number,
  judul: string,
  isi: string
) {
  try {
    let targetUsers: { id: number; namaLengkap: string }[] = [];

    if (targetAudience === 'semua') {
      targetUsers = await prisma.user.findMany({
        where: {
          id: { not: creatorId }
        },
        select: {
          id: true,
          namaLengkap: true
        }
      });
    } else {
      targetUsers = await prisma.user.findMany({
        where: {
          role: { name: targetAudience },
          id: { not: creatorId }
        },
        select: {
          id: true,
          namaLengkap: true
        }
      });
    }

    if (targetUsers.length > 0) {
      const notifications = targetUsers.map(u => ({
        pesan: `Pengumuman baru: "${judul}" - Klik untuk membaca selengkapnya`,
        type: 'pengumuman' as NotifType,
        refId: pengumumanId,
        userId: u.id
      }));

      await prisma.notifikasi.createMany({
        data: notifications
      });

      console.log(`Created ${notifications.length} notifications for pengumuman ${pengumumanId}`);

      notifyPengumuman(pengumumanId, judul, isi, targetAudience).catch(console.error);
    } else {
      console.log(`No target users found for audience: ${targetAudience}`);
    }
  } catch (error) {
    console.error('Error creating notifications:', error);
  }
}
