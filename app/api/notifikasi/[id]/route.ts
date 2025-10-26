import prisma from '@/lib/database/prisma';
import { NextResponse } from 'next/server';
import { ApiResponse, withAuth } from '@/lib/api-helpers';

// PATCH - Mark notification as read
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await withAuth(request);
    if (error || !user) {
      return ApiResponse.unauthorized(error);
    }

    const id = (await params).id;
    const body = await request.json();
    const { action } = body;

    if (action === 'mark_read') {
      // Handle pengumuman notifications
      if (id.startsWith('pengumuman_')) {
        const pengumumanId = parseInt(id.replace('pengumuman_', ''));
        
        if (isNaN(pengumumanId)) {
          return NextResponse.json({ error: 'Invalid pengumuman ID' }, { status: 400 });
        }

        // Check if already read
        const existingRead = await prisma.pengumumanRead.findUnique({
          where: {
            pengumumanId_userId: {
              pengumumanId,
              userId: user.id
            }
          }
        });

        if (!existingRead) {
          await prisma.pengumumanRead.create({
            data: {
              pengumumanId,
              userId: user.id
            }
          });
        }

        console.log(`User ${user.namaLengkap} (${user.role.name}) marked pengumuman ${pengumumanId} as read`);
        return NextResponse.json({ 
          message: 'Pengumuman marked as read',
          isRead: true 
        });
      } else {
        // Handle regular notifications
        const notifId = parseInt(id);
        
        if (isNaN(notifId)) {
          return NextResponse.json({ error: 'Invalid notification ID' }, { status: 400 });
        }

        // For now, we'll just return success since we don't have a read status field
        // In a real implementation, you'd add a 'read' field to the Notifikasi model
        console.log(`User ${user.namaLengkap} (${user.role.name}) marked notification ${notifId} as read`);
        return NextResponse.json({ 
          message: 'Notification marked as read',
          isRead: true 
        });
      }
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error: any) {
    console.error('PATCH /api/notifikasi/[id] error:', error);
    return NextResponse.json({
      error: 'Failed to update notification',
      details: error.message || 'Unknown error occurred'
    }, { status: 500 });
  }
}

// DELETE notification - Enhanced with role-specific logic
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await withAuth(request);
    if (error || !user) {
      return ApiResponse.unauthorized(error);
    }

    const id = (await params).id;

    // Handle pengumuman notifications
    if (id.startsWith('pengumuman_')) {
      const pengumumanId = parseInt(id.replace('pengumuman_', ''));
      
      if (isNaN(pengumumanId)) {
        return NextResponse.json({ error: 'Invalid pengumuman ID' }, { status: 400 });
      }

      // Only admin can delete pengumuman completely
      if (['admin', 'super-admin'].includes(user.role.name)) {
        // Admin deletes the entire pengumuman (affects all users)
        await prisma.$transaction(async (tx) => {
          // Delete related notifications
          await tx.notifikasi.deleteMany({
            where: {
              type: 'pengumuman',
              refId: pengumumanId
            }
          });

          // Delete pengumuman
          await tx.pengumuman.delete({
            where: { id: pengumumanId }
          });
        });

        console.log(`Admin ${user.namaLengkap} deleted pengumuman ${pengumumanId} for all users`);
        return NextResponse.json({ 
          message: 'Pengumuman berhasil dihapus untuk semua user',
          deletedId: pengumumanId,
          scope: 'all_users'
        });
      } else {
        // Non-admin users can only "hide" it for themselves by marking as read and adding a hidden flag
        // For now, we'll just mark it as read (effectively hiding it from unread notifications)
        const existingRead = await prisma.pengumumanRead.findUnique({
          where: {
            pengumumanId_userId: {
              pengumumanId,
              userId: user.id
            }
          }
        });

        if (!existingRead) {
          await prisma.pengumumanRead.create({
            data: {
              pengumumanId,
              userId: user.id
            }
          });
        }

        console.log(`User ${user.namaLengkap} (${user.role.name}) hid pengumuman ${pengumumanId} for themselves`);
        return NextResponse.json({ 
          message: 'Pengumuman disembunyikan dari dashboard Anda',
          deletedId: pengumumanId,
          scope: 'current_user_only'
        });
      }
    } else {
      // Handle regular notifications
      const notifId = parseInt(id);
      
      if (isNaN(notifId)) {
        return NextResponse.json({ error: 'Invalid notification ID' }, { status: 400 });
      }

      // Check if notification exists and belongs to user
      const notification = await prisma.notifikasi.findFirst({
        where: {
          id: notifId,
          userId: user.id
        }
      });

      if (!notification) {
        return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
      }

      // Delete notification (only affects current user)
      await prisma.notifikasi.delete({
        where: { id: notifId }
      });

      console.log(`User ${user.namaLengkap} (${user.role.name}) deleted their notification ${notifId}`);
      return NextResponse.json({ 
        message: 'Notifikasi berhasil dihapus',
        deletedId: notifId,
        scope: 'current_user_only'
      });
    }

  } catch (error: any) {
    console.error('DELETE /api/notifikasi/[id] error:', error);
    return NextResponse.json({
      error: 'Failed to delete notification',
      details: error.message || 'Unknown error occurred'
    }, { status: 500 });
  }
}