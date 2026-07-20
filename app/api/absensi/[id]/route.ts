import prisma from '@/lib/database/prisma'
import { NextResponse } from 'next/server'
import { withAuth } from '@/lib/api-helpers'

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, error } = await withAuth(request);
    if (error || !user) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
    }

    const role = user.role;
    if (role.name !== 'guru' && role.name !== 'admin' && role.name !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    
    const absensi = await prisma.absensi.findUnique({
      where: { id: parseInt(id) },
      include: { 
        santri: { 
          include: { 
            HalaqahSantri: { 
              include: { 
                halaqah: true 
              } 
            } 
          } 
        } 
      }
    });

    if (!absensi) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    if (role.name === 'guru') {
      const isAuthorized = absensi.santri.HalaqahSantri.some((hs: { halaqah: { guruId: number | null } }) => hs.halaqah.guruId === user.id);
      if (!isAuthorized) {
        return NextResponse.json({ error: 'Unauthorized to delete this absensi' }, { status: 403 });
      }
    }

    await prisma.absensi.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({ message: 'Success' });
  } catch (error) {
    console.error('DELETE /api/absensi/[id] error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
