import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";

export async function POST(request: NextRequest) {
  try {
    const { passCode, excludeUserId } = await request.json();

    if (!passCode) {
      return NextResponse.json(
        { error: 'Passcode is required' },
        { status: 400 }
      );
    }

    // Check if passcode exists (excluding the current user if editing)
    const existingUser = await prisma.user.findFirst({
      where: {
        passCode: passCode,
        ...(excludeUserId && { id: { not: excludeUserId } })
      },
      select: {
        id: true,
        namaLengkap: true,
        username: true,
        role: {
          select: {
            name: true
          }
        }
      }
    });

    if (existingUser) {
      return NextResponse.json({
        exists: true,
        user: {
          id: existingUser.id,
          namaLengkap: existingUser.namaLengkap,
          username: existingUser.username,
          role: existingUser.role.name
        }
      });
    }

    return NextResponse.json({
      exists: false,
      message: 'Passcode available'
    });

  } catch (error) {
    console.error('Error checking passcode:', error);
    return NextResponse.json(
      { error: 'Failed to check passcode' },
      { status: 500 }
    );
  }
}