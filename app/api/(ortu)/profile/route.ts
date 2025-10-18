import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || "mysecretkey";

export async function PUT(request: Request) {
  try {
    // Get token from cookie
    const token = request.headers.get('cookie')?.split('auth_token=')[1]?.split(';')[0];

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const userId = decoded.id;

    const body = await request.json();
    const { namaLengkap, username, noTlp } = body;

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        namaLengkap: namaLengkap || undefined,
        username: username || undefined,
        noTlp: noTlp || undefined,
      },
      select: {
        id: true,
        namaLengkap: true,
        username: true,
        foto: true,
        noTlp: true,
        role: {
          select: {
            name: true
          }
        },
        createdAt: true,
        updatedAt: true
      }
    });

    return NextResponse.json({
      id: updatedUser.id,
      namaLengkap: updatedUser.namaLengkap,
      username: updatedUser.username,
      foto: updatedUser.foto,
      noTlp: updatedUser.noTlp,
      role: {
        name: updatedUser.role.name
      }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    // Get token from cookie
    const token = request.headers.get('cookie')?.split('auth_token=')[1]?.split(';')[0];

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const userId = decoded.id;

    // Get user profile from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        namaLengkap: true,
        foto: true,
        noTlp: true,
        role: {
          select: {
            name: true
          }
        },
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: user.id,
      namaLengkap: user.namaLengkap,
      username: user.username,
      foto: user.foto,
      role: {
        name: user.role.name
      }
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}