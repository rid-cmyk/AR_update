import prisma from '@/lib/database/prisma';
import { NextResponse } from 'next/server';
import { ApiResponse, withAuth } from '@/lib/api-helpers';

// GET notifications for current user - Enhanced with pengumuman integration
export async function GET(request: Request) {
  try {
    const { user, error } = await withAuth(request);
    if (error || !user) {
      return ApiResponse.unauthorized(error || 'Unauthorized');
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50'); // Increased for better UX
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    const skip = (page - 1) * limit;

    // Get regular notifications
    const notifikasi = await prisma.notifikasi.findMany({
      where: {
        userId: user.id
      },
      orderBy: {
        tanggal: 'desc'
      },
      skip,
      take: limit
    });

    // Get pengumuman as notifications based on user role
    let pengumumanNotifications: any[] = [];
    
    // Build target audience filter - ONLY show pengumuman for user's role or 'semua'
    const targetAudienceFilter = [
      'semua' // Always include 'semua' (for all users)
    ];

    // Add specific role filter based on user's role
    if (user.role.name === 'santri') {
      targetAudienceFilter.push('santri');
    } else if (user.role.name === 'guru') {
      targetAudienceFilter.push('guru');
    } else if (user.role.name === 'ortu') {
      targetAudienceFilter.push('ortu');
    } else if (user.role.name === 'admin') {
      targetAudienceFilter.push('admin');
    } else if (user.role.name === 'yayasan') {
      targetAudienceFilter.push('yayasan');
    }

    console.log(`User ${user.namaLengkap} (${user.role.name}) will see pengumuman with targetAudience: ${targetAudienceFilter.join(', ')}`);

    const pengumuman = await prisma.pengumuman.findMany({
      where: {
        AND: [
          {
            targetAudience: {
              in: targetAudienceFilter as any
            }
          },
          {
            // Only active announcements (not expired)
            OR: [
              { tanggalKadaluarsa: null },
              { tanggalKadaluarsa: { gte: new Date() } }
            ]
          }
        ]
      },
      include: {
        creator: {
          select: {
            namaLengkap: true
          }
        },
        dibacaOleh: {
          where: {
            userId: user.id
          },
          select: {
            dibacaPada: true
          }
        }
      },
      orderBy: {
        tanggal: 'desc'
      },
      take: 20 // Limit pengumuman notifications
    });

    // Transform pengumuman to notification format
    pengumumanNotifications = pengumuman.map(p => ({
      id: `pengumuman_${p.id}`,
      pesan: `Pengumuman baru: ${p.judul}`,
      tanggal: p.tanggal,
      type: 'pengumuman',
      refId: p.id,
      userId: user.id,
      isRead: p.dibacaOleh.length > 0,
      metadata: {
        judul: p.judul,
        isi: p.isi.length > 100 ? `${p.isi.substring(0, 100)}...` : p.isi,
        fullContent: p.isi,
        creator: p.creator.namaLengkap,
        targetAudience: p.targetAudience,
        tanggalKadaluarsa: p.tanggalKadaluarsa
      }
    }));

    // Combine and sort all notifications
    const allNotifications = [
      ...notifikasi.map(n => ({ ...n, isRead: false })), // Regular notifications (assume unread for now)
      ...pengumumanNotifications
    ].sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());

    // Filter unread only if requested
    const filteredNotifications = unreadOnly 
      ? allNotifications.filter(n => !n.isRead)
      : allNotifications;

    const total = await prisma.notifikasi.count({ 
      where: { userId: user.id } 
    });

    // Calculate unread count (including unread pengumuman)
    const unreadPengumumanCount = pengumumanNotifications.filter(p => !p.isRead).length;
    const unreadCount = notifikasi.length + unreadPengumumanCount; // Simplified for now

    console.log(`User ${user.namaLengkap} (${user.role.name}) has ${allNotifications.length} total notifications (${pengumumanNotifications.length} pengumuman, ${notifikasi.length} regular)`);

    return NextResponse.json({
      data: filteredNotifications.slice(0, limit),
      pagination: {
        page,
        limit,
        total: allNotifications.length,
        totalPages: Math.ceil(allNotifications.length / limit)
      },
      unreadCount: unreadPengumumanCount + notifikasi.length,
      stats: {
        regularNotifications: notifikasi.length,
        pengumumanNotifications: pengumumanNotifications.length,
        unreadPengumuman: unreadPengumumanCount
      }
    });

  } catch (error) {
    console.error('GET /api/notifikasi error:', error);
    return NextResponse.json({ error: 'Failed to fetch notifikasi' }, { status: 500 });
  }
}

// POST - Create notification (for system use)
export async function POST(request: Request) {
  try {
    const { user, error } = await withAuth(request);
    if (error || !user) {
      return ApiResponse.unauthorized(error || 'Unauthorized');
    }

    // Only admin and super-admin can create notifications
    if (!['admin', 'super-admin'].includes(user.role.name)) {
      return ApiResponse.forbidden('Access denied');
    }

    const body = await request.json();
    const { pesan, type, refId, userIds } = body;

    if (!pesan || !type) {
      return NextResponse.json({ 
        error: 'Pesan dan type harus diisi' 
      }, { status: 400 });
    }

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json({ 
        error: 'User IDs harus diisi' 
      }, { status: 400 });
    }

    // Create notifications for multiple users
    const notifications = userIds.map((userId: number) => ({
      pesan,
      type: type as any,
      refId: refId || null,
      userId: Number(userId)
    }));

    await prisma.notifikasi.createMany({
      data: notifications
    });

    console.log(`Created ${notifications.length} notifications`);
    return NextResponse.json({ 
      message: `${notifications.length} notifikasi berhasil dibuat`,
      count: notifications.length
    });

  } catch (error: any) {
    console.error('POST /api/notifikasi error:', error);
    return NextResponse.json({
      error: 'Failed to create notifikasi',
      details: error.message || 'Unknown error occurred'
    }, { status: 500 });
  }
}