import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const resolvedParams = await params;
    const pengumumanId = parseInt(resolvedParams.id);

    // Check if already read
    const existingRead = await prisma.pengumumanRead.findUnique({
      where: {
        pengumumanId_userId: {
          pengumumanId: pengumumanId,
          userId: userId
        }
      }
    });

    if (existingRead) {
      return NextResponse.json({ 
        success: true,
        message: 'Already marked as read'
      });
    }

    // Mark as read
    await prisma.pengumumanRead.create({
      data: {
        pengumumanId: pengumumanId,
        userId: userId
      }
    });

    return NextResponse.json({ 
      success: true,
      message: 'Marked as read'
    });

  } catch (error) {
    console.error('Error marking pengumuman as read:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}