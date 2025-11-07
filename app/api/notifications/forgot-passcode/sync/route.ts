import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";

// POST - Sync forgot passcode notifications with user data
export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, userId } = await request.json();

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Nomor telepon harus diisi' },
        { status: 400 }
      );
    }

    // Find user by phone number if userId not provided
    let user = null;
    if (userId) {
      user = await prisma.user.findUnique({
        where: { id: parseInt(userId) },
        select: {
          id: true,
          namaLengkap: true,
          username: true,
          foto: true,
          passCode: true,
          noTlp: true
        }
      });
    } else {
      user = await prisma.user.findFirst({
        where: { noTlp: phoneNumber },
        select: {
          id: true,
          namaLengkap: true,
          username: true,
          foto: true,
          passCode: true,
          noTlp: true
        }
      });
    }

    // Update all forgot passcode notifications with this phone number
    const updateResult = await prisma.forgotPasscode.updateMany({
      where: {
        phoneNumber: phoneNumber
      },
      data: {
        isRegistered: !!user,
        userId: user?.id || null
      }
    });

    return NextResponse.json({
      success: true,
      updated: updateResult.count,
      user: user ? {
        id: user.id,
        namaLengkap: user.namaLengkap,
        username: user.username,
        foto: user.foto,
        passCode: user.passCode
      } : null
    });
  } catch (error) {
    console.error('Error syncing forgot passcode notifications:', error);
    return NextResponse.json(
      { error: 'Failed to sync notifications' },
      { status: 500 }
    );
  }
}

// GET - Check sync status for all notifications
export async function GET() {
  try {
    // Find all unregistered notifications
    const unregisteredNotifications = await prisma.forgotPasscode.findMany({
      where: {
        isRegistered: false
      },
      select: {
        id: true,
        phoneNumber: true
      }
    });

    let syncedCount = 0;
    const syncResults = [];

    // Check each unregistered notification
    for (const notification of unregisteredNotifications) {
      const user = await prisma.user.findFirst({
        where: { noTlp: notification.phoneNumber },
        select: {
          id: true,
          namaLengkap: true,
          username: true,
          foto: true,
          passCode: true
        }
      });

      if (user) {
        // Update the notification
        await prisma.forgotPasscode.update({
          where: { id: notification.id },
          data: {
            isRegistered: true,
            userId: user.id
          }
        });

        syncedCount++;
        syncResults.push({
          notificationId: notification.id,
          phoneNumber: notification.phoneNumber,
          user: {
            id: user.id,
            namaLengkap: user.namaLengkap,
            username: user.username
          }
        });
      }
    }

    return NextResponse.json({
      success: true,
      totalChecked: unregisteredNotifications.length,
      syncedCount,
      syncResults
    });
  } catch (error) {
    console.error('Error checking sync status:', error);
    return NextResponse.json(
      { error: 'Failed to check sync status' },
      { status: 500 }
    );
  }
}