import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { QuranUtils } from '@/utils/data/quran-mapping';

const prisma = new PrismaClient();

// PUT - Update target juz
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const targetId = parseInt(params.id);
    const body = await request.json();
    const { santriId, juz, deadline, status } = body;

    // Get existing target
    const existingTarget = await prisma.targetJuz.findUnique({
      where: { id: targetId },
      include: {
        santri: {
          select: {
            id: true,
            namaLengkap: true
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
        error: 'Anda tidak memiliki akses untuk mengubah target santri ini' 
      }, { status: 403 });
    }

    // Validation
    if (juz && (juz < 1 || juz > 30)) {
      return NextResponse.json({ 
        error: 'Juz harus antara 1-30' 
      }, { status: 400 });
    }

    if (status && !['belum', 'proses', 'selesai'].includes(status)) {
      return NextResponse.json({ 
        error: 'Status harus belum, proses, atau selesai' 
      }, { status: 400 });
    }

    // Check for duplicate if juz is being changed
    if (juz && juz !== existingTarget.juz) {
      const duplicateTarget = await prisma.targetJuz.findFirst({
        where: {
          santriId: existingTarget.santriId,
          juz: parseInt(juz),
          status: { in: ['belum', 'proses'] },
          id: { not: targetId }
        }
      });

      if (duplicateTarget) {
        return NextResponse.json({ 
          error: `Target untuk Juz ${juz} sudah ada dan belum selesai` 
        }, { status: 400 });
      }
    }

    // Prepare update data
    const updateData: any = {};
    if (santriId) updateData.santriId = parseInt(santriId);
    if (juz) updateData.juz = parseInt(juz);
    if (deadline) updateData.deadline = new Date(deadline);
    if (status) updateData.status = status;

    // Update target
    const updatedTarget = await prisma.targetJuz.update({
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

    // Create notification if significant changes
    if (juz || deadline || status) {
      let notificationMessage = `Target hafalan diperbarui: `;
      
      if (juz) {
        const juzInfo = QuranUtils.getJuzInfo(parseInt(juz));
        const suratList = juzInfo.map(item => item.surat).join(', ');
        notificationMessage += `Juz ${juz} (${suratList})`;
      } else {
        const juzInfo = QuranUtils.getJuzInfo(existingTarget.juz);
        const suratList = juzInfo.map(item => item.surat).join(', ');
        notificationMessage += `Juz ${existingTarget.juz} (${suratList})`;
      }
      
      if (deadline) {
        notificationMessage += ` - deadline ${new Date(deadline).toLocaleDateString('id-ID')}`;
      }

      await prisma.notifikasi.create({
        data: {
          pesan: notificationMessage,
          type: 'hafalan',
          refId: updatedTarget.id,
          userId: updatedTarget.santriId
        }
      });
    }

    // Log activity
    await prisma.auditLog.create({
      data: {
        action: 'UPDATE_TARGET_JUZ',
        keterangan: `Guru ${user.namaLengkap} mengubah target Juz ${updatedTarget.juz} untuk ${updatedTarget.santri.namaLengkap}`,
        userId: userId
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Target juz berhasil diperbarui',
      data: updatedTarget
    });

  } catch (error) {
    console.error('Error updating target juz:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE - Hapus target juz
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const targetId = parseInt(params.id);

    // Get existing target
    const existingTarget = await prisma.targetJuz.findUnique({
      where: { id: targetId },
      include: {
        santri: {
          select: {
            id: true,
            namaLengkap: true
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
        error: 'Anda tidak memiliki akses untuk menghapus target santri ini' 
      }, { status: 403 });
    }

    // Delete target
    await prisma.targetJuz.delete({
      where: { id: targetId }
    });

    // Create notification
    const juzInfo = QuranUtils.getJuzInfo(existingTarget.juz);
    const suratList = juzInfo.map(item => item.surat).join(', ');
    
    await prisma.notifikasi.create({
      data: {
        pesan: `Target hafalan dibatalkan: Juz ${existingTarget.juz} (${suratList})`,
        type: 'hafalan',
        refId: existingTarget.id,
        userId: existingTarget.santriId
      }
    });

    // Log activity
    await prisma.auditLog.create({
      data: {
        action: 'DELETE_TARGET_JUZ',
        keterangan: `Guru ${user.namaLengkap} menghapus target Juz ${existingTarget.juz} untuk ${existingTarget.santri.namaLengkap}`,
        userId: userId
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Target juz berhasil dihapus'
    });

  } catch (error) {
    console.error('Error deleting target juz:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// GET - Get specific target juz
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const targetId = parseInt(params.id);

    // Get target with progress calculation
    const target = await prisma.targetJuz.findUnique({
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

    if (!target) {
      return NextResponse.json({ error: 'Target tidak ditemukan' }, { status: 404 });
    }

    // Check if santri is in guru's halaqah
    const halaqahSantri = await prisma.halaqahSantri.findFirst({
      where: {
        santriId: target.santriId,
        halaqah: {
          guruId: userId
        }
      }
    });

    if (!halaqahSantri) {
      return NextResponse.json({ 
        error: 'Anda tidak memiliki akses untuk melihat target santri ini' 
      }, { status: 403 });
    }

    // Get hafalan data for progress calculation
    const hafalanData = await prisma.hafalan.findMany({
      where: {
        santriId: target.santriId,
        status: 'ziyadah'
      },
      select: {
        surat: true,
        ayatMulai: true,
        ayatSelesai: true
      }
    });

    // Calculate juz progress
    const juzProgress = QuranUtils.calculateJuzProgressFromSurat(hafalanData);
    const targetJuzProgress = juzProgress[target.juz];

    const targetWithProgress = {
      ...target,
      progress: targetJuzProgress.progress,
      hafalAyat: targetJuzProgress.hafalAyat,
      totalAyat: targetJuzProgress.totalAyat,
      details: targetJuzProgress.details
    };

    return NextResponse.json({
      success: true,
      data: targetWithProgress
    });

  } catch (error) {
    console.error('Error fetching target juz:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}