import prisma from '@/lib/database/prisma';
import { NextResponse } from 'next/server';
import { ApiResponse, withAuth } from '@/lib/api-helpers';

// GET all pengumuman
export async function GET(request: Request) {
  try {
    const { user, error } = await withAuth(request);
    if (error || !user) {
      return ApiResponse.unauthorized(error || 'Unauthorized');
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const targetAudience = searchParams.get('targetAudience');

    // Build where clause with proper AND/OR structure
    const whereClause: any = {
      AND: [
        {
          // Only show active announcements (not expired)
          OR: [
            { tanggalKadaluarsa: null },
            { tanggalKadaluarsa: { gte: new Date() } }
          ]
        }
      ]
    };

    // Filter berdasarkan role user untuk melihat pengumuman yang relevan
    if (user.role.name !== 'admin' && user.role.name !== 'super_admin') {
      // Non-admin users only see pengumuman targeted to them or 'semua'
      const targetAudienceFilter = ['semua'];
      
      if (user.role.name === 'santri') {
        targetAudienceFilter.push('santri');
      } else if (user.role.name === 'guru') {
        targetAudienceFilter.push('guru');
      } else if (user.role.name === 'ortu') {
        targetAudienceFilter.push('ortu');
      } else if (user.role.name === 'yayasan') {
        targetAudienceFilter.push('yayasan');
      }

      whereClause.AND.push({
        targetAudience: {
          in: targetAudienceFilter
        }
      });

      console.log(`User ${user.namaLengkap} (${user.role.name}) can see pengumuman with targetAudience: ${targetAudienceFilter.join(', ')}`);
    }

    // Filter berdasarkan targetAudience jika disediakan (untuk admin)
    if (targetAudience && ['admin', 'super_admin'].includes(user.role.name)) {
      whereClause.AND.push({
        targetAudience: targetAudience
      });
    }

    const skip = (page - 1) * limit;

    const [pengumuman, total] = await Promise.all([
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
          dibacaOleh: ['admin', 'super_admin'].includes(user.role.name) ? {
            // Admin can see all readers
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
            // Non-admin only see their own read status
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
      // Enhanced read details for admin
      readDetails: ['admin', 'super_admin'].includes(user.role.name) ? 
        p.dibacaOleh.map((read: any) => ({
          userId: read.user.id,
          userName: read.user.namaLengkap,
          userRole: read.user.role.name,
          readAt: read.dibacaPada
        })) : undefined,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt
    }));

    return NextResponse.json({
      data: formatted,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('GET /api/pengumuman error:', error);
    return NextResponse.json({ error: 'Failed to fetch pengumuman' }, { status: 500 });
  }
}

// CREATE pengumuman
export async function POST(request: Request) {
  try {
    const { user, error } = await withAuth(request);
    if (error || !user) {
      return ApiResponse.unauthorized(error || 'Unauthorized');
    }

    // Hanya admin dan super-admin yang bisa membuat pengumuman
    if (!['admin', 'super_admin'].includes(user.role.name)) {
      return ApiResponse.forbidden('Access denied');
    }

    const body = await request.json();
    const { judul, isi, targetAudience, tanggalKadaluarsa } = body;

    console.log('Creating pengumuman:', body);

    if (!judul || !isi) {
      return NextResponse.json({ 
        error: 'Judul dan isi pengumuman harus diisi' 
      }, { status: 400 });
    }

    if (!targetAudience) {
      return NextResponse.json({ 
        error: 'Target audience harus dipilih' 
      }, { status: 400 });
    }

    // Validasi targetAudience
    const validTargets = ['semua', 'guru', 'santri', 'ortu', 'admin', 'yayasan'];
    if (!validTargets.includes(targetAudience)) {
      return NextResponse.json({ 
        error: 'Target audience tidak valid' 
      }, { status: 400 });
    }

    // Create pengumuman
    const pengumuman = await prisma.pengumuman.create({
      data: {
        judul,
        isi,
        targetAudience: targetAudience as any,
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

    // Create notifications for target users
    await createNotificationsForAnnouncement(pengumuman.id, targetAudience, user.id, judul);

    const formatted = {
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

    console.log('Pengumuman created successfully:', formatted.id);
    return NextResponse.json(formatted);

  } catch (error: any) {
    console.error('POST /api/pengumuman error:', error);
    return NextResponse.json({
      error: 'Failed to create pengumuman',
      details: error.message || 'Unknown error occurred'
    }, { status: 500 });
  }
}

// Enhanced helper function to create notifications with better targeting
async function createNotificationsForAnnouncement(
  pengumumanId: number, 
  targetAudience: string, 
  creatorId: number,
  judul: string
) {
  try {
    let targetUsers: { id: number; namaLengkap: string }[] = [];

    if (targetAudience === 'semua') {
      // Get all users except the creator
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
      // Get users with specific role
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

    // Create notifications with more descriptive messages
    if (targetUsers.length > 0) {
      const notifications = targetUsers.map(user => ({
        pesan: `Pengumuman baru: "${judul}" - Klik untuk membaca selengkapnya`,
        type: 'pengumuman' as any,
        refId: pengumumanId,
        userId: user.id
      }));

      await prisma.notifikasi.createMany({
        data: notifications
      });

      console.log(`Created ${notifications.length} notifications for pengumuman ${pengumumanId}`);
      console.log(`Target audience: ${targetAudience}, Users notified: ${targetUsers.map(u => u.namaLengkap).join(', ')}`);
    } else {
      console.log(`No target users found for audience: ${targetAudience}`);
    }
  } catch (error) {
    console.error('Error creating notifications:', error);
  }
}