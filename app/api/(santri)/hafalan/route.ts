import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// GET hafalan records for santri
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const santriId = searchParams.get('santriId');
    const jenis = searchParams.get('jenis');
    const limit = searchParams.get('limit');

    let whereClause: any = {};

    if (santriId) {
      whereClause.santriId = parseInt(santriId);
    }

    if (jenis) {
      whereClause.jenis = jenis;
    }

    const hafalan = await prisma.hafalan.findMany({
      where: whereClause,
      include: {
        santri: {
          select: {
            id: true,
            namaLengkap: true,
            username: true
          }
        },
        guru: {
          select: {
            id: true,
            namaLengkap: true,
            username: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit ? parseInt(limit) : undefined
    });

    return NextResponse.json(hafalan);
  } catch (error) {
    console.error('GET /api/santri/hafalan error:', error);
    return NextResponse.json({ error: 'Failed to fetch hafalan data' }, { status: 500 });
  }
}

// POST new hafalan record
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      santriId,
      guruId,
      jenis,
      surah,
      ayatMulai,
      ayatSelesai,
      catatan,
      tanggal
    } = body;

    if (!santriId || !guruId || !jenis || !surah || !ayatMulai || !ayatSelesai) {
      return NextResponse.json({
        error: 'Missing required fields: santriId, guruId, jenis, surah, ayatMulai, ayatSelesai'
      }, { status: 400 });
    }

    // Validate jenis
    if (!['ziyadah', 'murajaah'].includes(jenis)) {
      return NextResponse.json({ 
        error: 'Invalid jenis. Must be either "ziyadah" or "murajaah"' 
      }, { status: 400 });
    }

    // Create hafalan record
    const hafalan = await prisma.hafalan.create({
      data: {
        santriId: parseInt(santriId),
        guruId: parseInt(guruId),
        jenis: jenis as 'ziyadah' | 'murajaah',
        surah,
        ayatMulai: parseInt(ayatMulai),
        ayatSelesai: parseInt(ayatSelesai),
        catatan: catatan || '',
        tanggal: tanggal ? new Date(tanggal) : new Date()
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
    });

    return NextResponse.json(hafalan, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/santri/hafalan error:', error);
    return NextResponse.json({
      error: 'Failed to create hafalan record',
      details: error.message
    }, { status: 500 });
  }
}