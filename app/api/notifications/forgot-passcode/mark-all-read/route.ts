import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";

// PUT - Mark all notifications as read
export async function PUT() {
  try {
    await prisma.forgotPasscode.updateMany({
      where: { isRead: false },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark all notifications as read' },
      { status: 500 }
    );
  }
}