import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - List semua jenis ujian
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const jenisUjianList = await prisma.jenisUjian.findMany({
      include: {
        komponenPenilaian: {
          orderBy: {
            bobot: 'desc'
          }
        },
        creator: {
          select: {
            namaLengkap: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(jenisUjianList);
  } catch (error) {
    console.error('Error fetching jenis ujian:', error);
    return NextResponse.json(
      { error: 'Failed to fetch jenis ujian' },
      { status: 500 }
    );
  }
}

// POST - Create jenis ujian baru
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { nama, kode, deskripsi, komponenPenilaian } = body;

    // Validasi
    if (!nama || !kode) {
      return NextResponse.json(
        { error: 'Nama dan kode wajib diisi' },
        { status: 400 }
      );
    }

    // Validasi total bobot = 100%
    if (komponenPenilaian && komponenPenilaian.length > 0) {
      const totalBobot = komponenPenilaian.reduce(
        (sum: number, k: any) => sum + parseFloat(k.bobot),
        0
      );
      if (Math.abs(totalBobot - 100) > 0.01) {
        return NextResponse.json(
          { error: 'Total bobot komponen penilaian harus 100%' },
          { status: 400 }
        );
      }
    }

    // Cek kode sudah ada
    const existing = await prisma.jenisUjian.findUnique({
      where: { kode }
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Kode jenis ujian sudah digunakan' },
        { status: 400 }
      );
    }

    // Create jenis ujian dengan komponen penilaian
    const jenisUjian = await prisma.jenisUjian.create({
      data: {
        nama,
        kode,
        deskripsi,
        createdBy: session.user.id,
        komponenPenilaian: {
          create: komponenPenilaian?.map((k: any) => ({
            nama: k.nama,
            bobot: parseFloat(k.bobot),
            createdBy: session.user.id
          })) || []
        }
      },
      include: {
        komponenPenilaian: true
      }
    });

    return NextResponse.json(jenisUjian, { status: 201 });
  } catch (error: any) {
    console.error('Error creating jenis ujian:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create jenis ujian' },
      { status: 500 }
    );
  }
}
