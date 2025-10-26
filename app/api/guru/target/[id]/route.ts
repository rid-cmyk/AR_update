import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// PUT - Update target hafalan
export async function PUT(
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

    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true }
    });

    if (!user || user.role.name !== 'guru') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const resolvedParams = await params;
    const targetId = parseInt(resolvedParams.id);
    const body = await request.json();
    const { surat, ayatTarget, deadline, status } = body;

    // Get existing target
    const existingTarget = await prisma.targetHafalan.findUnique({
      where: { id: targetId },
      include: {
        santri: {
          select: {
            id: true,
            namaLengkap: true,
            username: true
          }
        }
      }
    });

    if (!existingTarget) {
      return NextResponse.json({ error: 'Target tidak ditemukan' }, { status: 404 });
    }

    // Check if santri is in guru's halaqah
    const halaqahSantri = await prisma.halaqahSantri.findFirst({
      where: {
        santriId: existingTarget.santriId,
        halaqah: {
          guruId: userId
        }
      }
    });

    if (!halaqahSantri) {
      return NextResponse.json({ 
        error: 'Anda tidak memiliki akses untuk mengubah target ini' 
      }, { status: 403 });
    }

    // Prepare update data
    const updateData: any = {};
    
    if (surat) updateData.surat = surat;
    if (ayatTarget) updateData.ayatTarget = parseInt(ayatTarget);
    if (deadline) updateData.deadline = new Date(deadline);
    if (status && ['belum', 'proses', 'selesai'].includes(status)) {
      updateData.status = status;
    }

    // Validate ayat target
    if (ayatTarget && ayatTarget <= 0) {
      return NextResponse.json({ 
        error: 'Target ayat harus lebih dari 0' 
      }, { status: 400 });
    }

    // Update target
    const updatedTarget = await prisma.targetHafalan.update({
      where: { id: targetId },
      data: updateData,
      include: {
        santri: {
          select: {
            id: true,
            namaLengkap: true,
            username: true
          }
        }
      }
    });

    // Create notification if status changed
    if (status && status !== existingTarget.status) {
      let message = '';
      switch (status) {
        case 'proses':
          message = `Target hafalan ${updatedTarget.surat} dimulai`;
          break;
        case 'selesai':
          message = `Selamat! Target hafalan ${updatedTarget.surat} telah selesai`;
          break;
        case 'belum':
          message = `Target hafalan ${updatedTarget.surat} direset`;
          break;
      }

      await prisma.notifikasi.create({
        data: {
          pesan: message,
          type: 'hafalan',
          refId: targetId,
          userId: existingTarget.santriId
        }
      });
    }

    // Log activity
    await prisma.auditLog.create({
      data: {
        action: 'UPDATE_TARGET',
        keterangan: `Guru ${user.namaLengkap} mengupdate target ${updatedTarget.surat} untuk ${updatedTarget.santri.namaLengkap}`,
        userId: userId
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Target hafalan berhasil diupdate',
      data: updatedTarget
    });

  } catch (error) {
    console.error('Error updating target hafalan:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE - Hapus target hafalan
export async function DELETE(
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

    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true }
    });

    if (!user || user.role.name !== 'guru') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const resolvedParams = await params;
    const targetId = parseInt(resolvedParams.id);

    // Get existing target
    const existingTarget = await prisma.targetHafalan.findUnique({
      where: { id: targetId },
      include: {
        santri: {
          select: {
            id: true,
            namaLengkap: true,
            username: true
          }
        }
      }
    });

    if (!existingTarget) {
      return NextResponse.json({ error: 'Target tidak ditemukan' }, { status: 404 });
    }

    // Check if santri is in guru's halaqah
    const halaqahSantri = await prisma.halaqahSantri.findFirst({
      where: {
        santriId: existingTarget.santriId,
        halaqah: {
          guruId: userId
        }
      }
    });

    if (!halaqahSantri) {
      return NextResponse.json({ 
        error: 'Anda tidak memiliki akses untuk menghapus target ini' 
      }, { status: 403 });
    }

    // Delete target
    await prisma.targetHafalan.delete({
      where: { id: targetId }
    });

    // Create notification
    await prisma.notifikasi.create({
      data: {
        pesan: `Target hafalan ${existingTarget.surat} telah dihapus`,
        type: 'hafalan',
        refId: null,
        userId: existingTarget.santriId
      }
    });

    // Log activity
    await prisma.auditLog.create({
      data: {
        action: 'DELETE_TARGET',
        keterangan: `Guru ${user.namaLengkap} menghapus target ${existingTarget.surat} untuk ${existingTarget.santri.namaLengkap}`,
        userId: userId
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Target hafalan berhasil dihapus'
    });

  } catch (error) {
    console.error('Error deleting target hafalan:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}