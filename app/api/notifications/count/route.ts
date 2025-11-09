import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Get token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const userId = decoded.id;

    // Count unread notifications for the user
    const count = await prisma.notifikasi.count({
      where: {
        userId: userId,
        // You can add additional conditions here if you have a 'read' field
        // isRead: false
      }
    });

    // Also count unread pengumuman for the user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Skip pengumuman count for super_admin
    let unreadPengumuman = 0;
    if (user.role.name.toLowerCase() !== 'super_admin') {
      // Get pengumuman that haven't been read by this user
      // Map role name to enum value
      const roleMapping: { [key: string]: string } = {
        'super-admin': 'super_admin',
        'orang_tua': 'ortu'
      };
      
      const targetRole = roleMapping[user.role.name.toLowerCase()] || user.role.name.toLowerCase();

      unreadPengumuman = await prisma.pengumuman.count({
        where: {
          OR: [
            { targetAudience: 'semua' },
            { targetAudience: targetRole as any }
          ],
          NOT: {
            dibacaOleh: {
              some: {
                userId: userId
              }
            }
          }
        }
      });
    }

    const totalCount = count + unreadPengumuman;

    return NextResponse.json({ 
      count: totalCount,
      notifications: count,
      pengumuman: unreadPengumuman
    });

  } catch (error) {
    console.error('Error fetching notification count:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

