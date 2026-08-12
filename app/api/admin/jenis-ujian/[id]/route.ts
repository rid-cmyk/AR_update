import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-helpers';
import { prisma } from '@/lib/database/prisma';

function mapJenisUjian(j: any) {
  return {
    ...j,
    komponenPenilaian: (j.komponenPenilaian || []).map((k: any) => ({
      id: k.id,
      nama: k.namaKomponen,
      bobot: k.bobotNilai,
      deskripsi: k.deskripsi,
      urutan: k.urutan,
      isActive: k.isActive,
      nilaiMaksimal: k.nilaiMaksimal,
      nilaiMinimal: k.nilaiMinimal
    }))
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await withAuth(request, ['super_admin', 'admin', 'guru']);
    if (error || !user) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const jenisUjianId = parseInt(id);
    if (isNaN(jenisUjianId)) {
      return NextResponse.json({ error: 'ID jenis ujian tidak valid' }, { status: 400 });
    }

    const jenisUjian = await prisma.jenisUjian.findUnique({
      where: { id: jenisUjianId },
      include: {
        komponenPenilaian: { orderBy: { bobotNilai: 'desc' } },
        creator: { select: { namaLengkap: true } }
      }
    });

    if (!jenisUjian) {
      return NextResponse.json({ error: 'Jenis ujian tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json(mapJenisUjian(jenisUjian));
  } catch (error) {
    console.error('Error fetching jenis ujian:', error);
    return NextResponse.json({ error: 'Failed to fetch jenis ujian' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await withAuth(request, ['super_admin', 'admin']);
    if (error || !user) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const jenisUjianId = parseInt(id);
    if (isNaN(jenisUjianId)) {
      return NextResponse.json({ error: 'ID jenis ujian tidak valid' }, { status: 400 });
    }

    const body = await request.json();
    const { nama, kode, deskripsi, komponenPenilaian } = body;

    const existing = await prisma.jenisUjian.findUnique({ where: { id: jenisUjianId } });
    if (!existing) {
      return NextResponse.json({ error: 'Jenis ujian tidak ditemukan' }, { status: 404 });
    }

    // Validasi: nama & kode wajib diisi
    if (!nama || !kode) {
      return NextResponse.json(
        { error: 'Nama dan kode wajib diisi' },
        { status: 400 }
      );
    }

    // Ganti komponen penilaian secara atomik
    const updated = await prisma.$transaction(async (tx) => {
      if (Array.isArray(komponenPenilaian)) {
        await tx.komponenPenilaian.deleteMany({ where: { jenisUjianId } });
        await tx.komponenPenilaian.createMany({
          data: komponenPenilaian.map((k: any) => ({
            jenisUjianId,
            namaKomponen: k.nama,
            bobotNilai: k.bobot || 0,
            deskripsi: k.deskripsi,
            urutan: k.urutan || 0,
            isActive: true,
            nilaiMaksimal: k.nilaiMaksimal || 100,
            nilaiMinimal: k.nilaiMinimal || 0
          }))
        });
      }

      return tx.jenisUjian.update({
        where: { id: jenisUjianId },
        data: {
          nama,
          kode,
          deskripsi
        },
        include: { komponenPenilaian: { orderBy: { bobotNilai: 'desc' } } }
      });
    });

    return NextResponse.json({ success: true, data: mapJenisUjian(updated) });
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json(
        { error: 'Jenis ujian dengan nama & tipe yang sama sudah ada' },
        { status: 409 }
      );
    }
    console.error('Error updating jenis ujian:', error);
    return NextResponse.json({ error: 'Failed to update jenis ujian' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await withAuth(request, ['super_admin', 'admin']);
    if (error || !user) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const jenisUjianId = parseInt(id);
    if (isNaN(jenisUjianId)) {
      return NextResponse.json({ error: 'ID jenis ujian tidak valid' }, { status: 400 });
    }

    const existing = await prisma.jenisUjian.findUnique({ where: { id: jenisUjianId } });
    if (!existing) {
      return NextResponse.json({ error: 'Jenis ujian tidak ditemukan' }, { status: 404 });
    }

    // KomponenPenilaian ikut terhapus (onDelete: Cascade)
    await prisma.jenisUjian.delete({ where: { id: jenisUjianId } });

    return NextResponse.json({ success: true, message: 'Jenis ujian berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting jenis ujian:', error);
    return NextResponse.json({ error: 'Failed to delete jenis ujian' }, { status: 500 });
  }
}
