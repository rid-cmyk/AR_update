import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// PUT - Update hafalan
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
    const hafalanId = parseInt(resolvedParams.id);
    const body = await request.json();
    const { tanggal, surat, ayatMulai, ayatSelesai, status, keterangan } = body;

    // Get existing hafalan
    const existingHafalan = await prisma.hafalan.findUnique({
      where: { id: hafalanId },
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

    if (!existingHafalan) {
      return NextResponse.json({ error: 'Hafalan tidak ditemukan' }, { status: 404 });
    }

    // Check if santri is in guru's halaqah
    const halaqahSantri = await prisma.halaqahSantri.findFirst({
      where: {
        santriId: existingHafalan.santriId,
        halaqah: {
          guruId: userId
        }
      }
    });

    if (!halaqahSantri) {
      return NextResponse.json({ 
        error: 'Anda tidak memiliki akses untuk mengubah hafalan ini' 
      }, { status: 403 });
    }

    // Prepare update data
    const updateData: any = {};
    
    if (tanggal) updateData.tanggal = new Date(tanggal);
    if (surat) updateData.surat = surat;
    if (ayatMulai) updateData.ayatMulai = parseInt(ayatMulai);
    if (ayatSelesai) updateData.ayatSelesai = parseInt(ayatSelesai);
    if (status && ['ziyadah', 'murojaah'].includes(status)) {
      updateData.status = status;
    }
    if (keterangan !== undefined) updateData.keterangan = keterangan;

    // Validate ayat range
    if (ayatMulai && ayatSelesai && ayatMulai > ayatSelesai) {
      return NextResponse.json({ 
        error: 'Ayat mulai tidak boleh lebih besar dari ayat selesai' 
      }, { status: 400 });
    }

    // Update hafalan
    const updatedHafalan = await prisma.hafalan.update({
      where: { id: hafalanId },
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

    // Create notification for santri
    await prisma.notifikasi.create({
      data: {
        pesan: `Hafalan ${updatedHafalan.surat} ayat ${updatedHafalan.ayatMulai}-${updatedHafalan.ayatSelesai} telah diperbarui`,
        type: 'hafalan',
        refId: hafalanId,
        userId: existingHafalan.santriId
      }
    });

    // Log activity
    await prisma.auditLog.create({
      data: {
        action: 'UPDATE_HAFALAN',
        keterangan: `Guru ${user.namaLengkap} mengupdate hafalan ${updatedHafalan.surat} untuk ${updatedHafalan.santri.namaLengkap}`,
        userId: userId
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Hafalan berhasil diperbarui',
      data: updatedHafalan
    });

  } catch (error) {
    console.error('Error updating hafalan:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE - Hapus hafalan
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

    const resolvedParams2 = await params;
    const hafalanId = parseInt(resolvedParams2.id);

    // Get existing hafalan
    const existingHafalan = await prisma.hafalan.findUnique({
      where: { id: hafalanId },
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

    if (!existingHafalan) {
      return NextResponse.json({ error: 'Hafalan tidak ditemukan' }, { status: 404 });
    }

    // Check if santri is in guru's halaqah
    const halaqahSantri = await prisma.halaqahSantri.findFirst({
      where: {
        santriId: existingHafalan.santriId,
        halaqah: {
          guruId: userId
        }
      }
    });

    if (!halaqahSantri) {
      return NextResponse.json({ 
        error: 'Anda tidak memiliki akses untuk menghapus hafalan ini' 
      }, { status: 403 });
    }

    // Delete hafalan
    await prisma.hafalan.delete({
      where: { id: hafalanId }
    });

    // Create notification for santri
    await prisma.notifikasi.create({
      data: {
        pesan: `Hafalan ${existingHafalan.surat} ayat ${existingHafalan.ayatMulai}-${existingHafalan.ayatSelesai} telah dihapus`,
        type: 'hafalan',
        refId: null,
        userId: existingHafalan.santriId
      }
    });

    // Log activity
    await prisma.auditLog.create({
      data: {
        action: 'DELETE_HAFALAN',
        keterangan: `Guru ${user.namaLengkap} menghapus hafalan ${existingHafalan.surat} untuk ${existingHafalan.santri.namaLengkap}`,
        userId: userId
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Hafalan berhasil dihapus'
    });

  } catch (error) {
    console.error('Error deleting hafalan:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}