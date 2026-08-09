import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import { withAuth } from '@/lib/api-helpers';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await withAuth(request, ['admin', 'super_admin']);
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = parseInt((await params).id);
    const body = await request.json();

    const updated = await prisma.semester.update({
      where: { id },
      data: {
        tanggalMulai: body.tanggalMulai,
        tanggalSelesai: body.tanggalSelesai
      }
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('Update semester error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal mengupdate semester' },
      { status: 500 }
    );
  }
}
