import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";

// DELETE - Delete notification
export async function DELETE(
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

    await prisma.forgotPasscode.delete({
      where: { id: notificationId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting notification:', error);
    return NextResponse.json(
      { error: 'Failed to delete notification' },
      { status: 500 }
    );
  }
}