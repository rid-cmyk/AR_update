import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/database/prisma'
import { withAuth } from '@/lib/api-helpers'

async function isHafalanInGuruHalaqah(hafalanId: number, guruId: number): Promise<boolean> {
  const hafalan = await prisma.hafalan.findUnique({
    where: { id: hafalanId },
    select: {
      santriId: true
    }
  });
  if (!hafalan) return false;

  const inHalaqah = await prisma.halaqahSantri.findFirst({
    where: {
      santriId: hafalan.santriId,
      halaqah: { guruId }
    },
    select: { id: true }
  });
  return !!inHalaqah;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await withAuth(request, ['guru', 'super_admin', 'admin']);
    if (error || !user) {
      return NextResponse.json(
        { error: error || 'Unauthorized' },
        { status: error === 'Insufficient permissions' ? 403 : 401 }
      );
    }

    const { id } = await params
    const body = await request.json()
    const { santriId, surat, ayatMulai, ayatSelesai, status, tanggal, keterangan } = body

    // Validation
    if (!santriId || !surat || !ayatMulai || !ayatSelesai || !status) {
      return NextResponse.json({
        success: false,
        error: 'Data tidak lengkap'
      }, { status: 400 })
    }

    // Guru hanya boleh mengubah hafalan santri di halaqah miliknya
    if (user.role.name === 'guru' && !(await isHafalanInGuruHalaqah(parseInt(id), user.id))) {
      return NextResponse.json({
        success: false,
        error: 'Anda tidak memiliki akses ke data hafalan ini'
      }, { status: 403 })
    }

    // Update hafalan record
    const hafalan = await prisma.hafalan.update({
      where: {
        id: parseInt(id)
      },
      data: {
        santriId: parseInt(santriId),
        surat,
        ayatMulai: parseInt(ayatMulai),
        ayatSelesai: parseInt(ayatSelesai),
        status,
        tanggal: new Date(tanggal),
        keterangan
      },
      include: {
        santri: {
          select: {
            id: true,
            namaLengkap: true,
            username: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: hafalan,
      message: 'Hafalan berhasil diperbarui'
    })

  } catch (error) {
    console.error('Error updating hafalan:', error)
    return NextResponse.json({
      success: false,
      error: 'Gagal memperbarui hafalan'
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await withAuth(request, ['guru', 'super_admin', 'admin']);
    if (error || !user) {
      return NextResponse.json(
        { error: error || 'Unauthorized' },
        { status: error === 'Insufficient permissions' ? 403 : 401 }
      );
    }

    const { id } = await params

    // Guru hanya boleh menghapus hafalan santri di halaqah miliknya
    if (user.role.name === 'guru' && !(await isHafalanInGuruHalaqah(parseInt(id), user.id))) {
      return NextResponse.json({
        success: false,
        error: 'Anda tidak memiliki akses ke data hafalan ini'
      }, { status: 403 })
    }

    // Delete hafalan record
    await prisma.hafalan.delete({
      where: {
        id: parseInt(id)
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Hafalan berhasil dihapus'
    })

  } catch (error) {
    console.error('Error deleting hafalan:', error)
    return NextResponse.json({
      success: false,
      error: 'Gagal menghapus hafalan'
    }, { status: 500 })
  }
}