import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// GET target hafalan for santri
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const santriId = searchParams.get('santriId');
    const status = searchParams.get('status');

    let whereClause: any = {};

    if (santriId) {
      whereClause.santriId = parseInt(santriId);
    }

    if (status) {
      whereClause.status = status;
    }

    // Since we don't have target table in schema, return mock data
    const mockTargets = [
      {
        id: 1,
        santriId: santriId ? parseInt(santriId) : 1,
        judul: 'Hafal Juz 1 Lengkap',
        deskripsi: 'Target hafalan Juz 1 dari Al-Fatihah sampai Al-Baqarah ayat 141',
        targetAyat: 148,
        currentAyat: 111,
        tanggalMulai: '2024-01-01',
        tanggalTarget: '2024-02-01',
        status: 'active',
        prioritas: 'tinggi',
        kategori: 'ziyadah',
        surahList: ['Al-Fatihah', 'Al-Baqarah (1-141)'],
        createdAt: '2024-01-01'
      },
      {
        id: 2,
        santriId: santriId ? parseInt(santriId) : 1,
        judul: 'Muraja\'ah Juz 30',
        deskripsi: 'Mengulang dan memantapkan hafalan Juz 30 (Juz Amma)',
        targetAyat: 564,
        currentAyat: 508,
        tanggalMulai: '2024-01-01',
        tanggalTarget: '2024-01-15',
        status: 'active',
        prioritas: 'sedang',
        kategori: 'murajaah',
        surahList: ['An-Naba\'', 'An-Nazi\'at', 'Abasa', '...'],
        createdAt: '2024-01-01'
      }
    ];

    let filteredTargets = mockTargets;
    if (status) {
      filteredTargets = mockTargets.filter(t => t.status === status);
    }

    return NextResponse.json(filteredTargets);
  } catch (error) {
    console.error('GET /api/santri/target error:', error);
    return NextResponse.json({ error: 'Failed to fetch target data' }, { status: 500 });
  }
}

// POST new target
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      santriId,
      judul, 
      deskripsi, 
      targetAyat, 
      tanggalMulai, 
      tanggalTarget,
      prioritas,
      kategori,
      surahList
    } = body;

    if (!santriId || !judul || !deskripsi || !targetAyat || !tanggalMulai || !tanggalTarget) {
      return NextResponse.json({ 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    // Mock response since we don't have target table
    const newTarget = {
      id: Date.now(),
      santriId: parseInt(santriId),
      judul,
      deskripsi,
      targetAyat: parseInt(targetAyat),
      currentAyat: 0,
      tanggalMulai,
      tanggalTarget,
      status: 'active',
      prioritas: prioritas || 'sedang',
      kategori: kategori || 'ziyadah',
      surahList: surahList || [],
      createdAt: new Date().toISOString()
    };

    return NextResponse.json(newTarget, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/santri/target error:', error);
    return NextResponse.json({
      error: 'Failed to create target',
      details: error.message
    }, { status: 500 });
  }
}