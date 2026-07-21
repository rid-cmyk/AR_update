import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';



export async function GET() {
  try {
    // Get token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify token
    const decoded = verifyToken<Record<string, unknown>>(token);
    const userId = typeof decoded.id === 'string' ? parseInt(decoded.id) : (decoded.id as number);

    // Get notifications for the user
    const notifications = await prisma.notifikasi.findMany({
      where: {
        userId: userId
      },
      orderBy: {
        tanggal: 'desc'
      }
    });

    return NextResponse.json({ 
      success: true,
      data: notifications
    });

  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
  }
}