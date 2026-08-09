import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import { withAuth } from '@/lib/api-helpers';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await withAuth(request, ['admin', 'super_admin']);
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const semesterId = parseInt((await params).id);
    
    const targetSemester = await prisma.semester.findUnique({
      where: { id: semesterId }
    });

    if (!targetSemester) {
      return NextResponse.json({ success: false, error: 'Semester tidak ditemukan' }, { status: 404 });
    }

    // Gunakan transaction untuk memastikan integritas
    await prisma.$transaction([
      // 1. Nonaktifkan semua TahunAjaran dan Semester
      prisma.tahunAjaran.updateMany({
        where: { isActive: true },
        data: { isActive: false }
      }),
      prisma.semester.updateMany({
        where: { isActive: true },
        data: { isActive: false }
      }),
      // 2. Aktifkan Semester yang dipilih
      prisma.semester.update({
        where: { id: semesterId },
        data: { isActive: true }
      }),
      // 3. Aktifkan TahunAjaran induknya
      prisma.tahunAjaran.update({
        where: { id: targetSemester.tahunAjaranId },
        data: { isActive: true }
      })
    ]);

    return NextResponse.json({ 
      success: true, 
      message: 'Semester berhasil diaktifkan'
    });
  } catch (error: any) {
    console.error('Active semester error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal mengaktifkan semester' },
      { status: 500 }
    );
  }
}
