import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";

// GET - Fetch forgot passcode notifications
export async function GET() {
  try {
    // Check if prisma is properly initialized
    if (!prisma) {
      throw new Error('Prisma client not initialized');
    }

    const notifications = await prisma.forgotPasscode.findMany({
      include: {
        user: {
          select: {
            id: true,
            namaLengkap: true,
            username: true,
            foto: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Error fetching forgot passcode notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST - Create new forgot passcode notification
export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, message } = await request.json();

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Nomor telepon harus diisi' },
        { status: 400 }
      );
    }

    // Check if phone number is registered
    const user = await prisma.user.findFirst({
      where: { noTlp: phoneNumber }
    });

    const notification = await prisma.forgotPasscode.create({
      data: {
        phoneNumber,
        message: message || null,
        isRegistered: !!user,
        userId: user?.id || null
      },
      include: {
        user: {
          select: {
            id: true,
            namaLengkap: true,
            username: true,
            foto: true
          }
        }
      }
    });

    return NextResponse.json(notification, { status: 201 });
  } catch (error) {
    console.error('Error creating forgot passcode notification:', error);
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    );
  }
}