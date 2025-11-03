import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";

// PUT - Mark notification as read
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const notificationId = parseInt(resolvedParams.id);

    if (isNaN(notificationId)) {
      return NextResponse.json(
        { error: 'ID notifikasi tidak valid' },
        { status: 400 }
      );
    }

    const notification = await prisma.forgotPasscode.update({
      where: { id: notificationId },
      data: {
        isRead: true,
        readAt: new Date()
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

    return NextResponse.json(notification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark notification as read' },
      { status: 500 }
    );
  }
}