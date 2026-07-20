/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-helpers';
import { prisma } from '@/lib/database/prisma';

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await withAuth(request);
    if (error || !user) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
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

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await withAuth(request);
    if (error || !user) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { nama, kode, deskripsi, komponenPenilaian } = body;

    if (!nama || !kode) {
      return NextResponse.json(
        { error: 'Nama dan kode wajib diisi' },
        { status: 400 }
      );
    }

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

    const existing = await prisma.jenisUjian.findUnique({
      where: { kode }
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Kode jenis ujian sudah digunakan' },
        { status: 400 }
      );
    }

    const jenisUjian = await prisma.jenisUjian.create({
      data: {
        nama,
        kode,
        deskripsi,
        createdBy: user.id,
        komponenPenilaian: {
          create: komponenPenilaian?.map((k: any) => ({
            nama: k.nama,
            bobot: parseFloat(k.bobot),
            createdBy: user.id
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

export async function DELETE(request: NextRequest) {
  try {
    const { user, error } = await withAuth(request);
    if (error || !user) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID jenis ujian wajib diisi' },
        { status: 400 }
      );
    }

    await prisma.jenisUjian.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({
      success: true,
      message: 'Jenis ujian berhasil dihapus'
    });
  } catch (error: any) {
    console.error('Error deleting jenis ujian:', error);
    return NextResponse.json(
      { error: error.message || 'Gagal menghapus jenis ujian' },
      { status: 500 }
    );
  }
}
