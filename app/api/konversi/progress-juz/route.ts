// 📊 API Konversi: Hafalan Surat → Progress Juz
// Endpoint: GET /api/konversi/progress-juz

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { calculateJuzProgress, calculateSuratProgress } from '@/utils/hafalan-converter';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Ambil token dari header
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token tidak ditemukan' },
        { status: 401 }
      );
    }

    // Verifikasi token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const userId = decoded.userId;

    // Ambil parameter query
    const { searchParams } = new URL(request.url);
    const santriId = searchParams.get('santriId');
    
    // Jika ada santriId, pastikan user adalah guru yang mengajar santri tersebut
    let targetSantriId = userId;
    
    if (santriId) {
      // Cek apakah user adalah guru
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { role: true }
      });
      
      if (user?.role.name === 'guru') {
        // Pastikan santri ada di halaqah guru ini
        const halaqahSantri = await prisma.halaqahSantri.findFirst({
          where: {
            santriId: parseInt(santriId),
            halaqah: {
              guruId: userId
            }
          }
        });
        
        if (!halaqahSantri) {
          return NextResponse.json(
            { error: 'Santri tidak ditemukan dalam halaqah Anda' },
            { status: 403 }
          );
        }
        
        targetSantriId = parseInt(santriId);
      } else if (user?.role.name === 'santri' && parseInt(santriId) !== userId) {
        return NextResponse.json(
          { error: 'Santri hanya bisa melihat data pribadi' },
          { status: 403 }
        );
      }
    }

    // Ambil data hafalan santri (hanya ziyadah yang dihitung sebagai progress)
    const hafalanData = await prisma.hafalan.findMany({
      where: {
        santriId: targetSantriId,
        status: 'ziyadah' // Hanya ziyadah yang dihitung progress
      },
      select: {
        surat: true,
        ayatMulai: true,
        ayatSelesai: true,
        status: true,
        tanggal: true
      },
      orderBy: {
        tanggal: 'desc'
      }
    });

    // Konversi ke format yang dibutuhkan converter
    const hafalanForConverter = hafalanData.map(h => ({
      surat: h.surat,
      ayatMulai: h.ayatMulai,
      ayatSelesai: h.ayatSelesai,
      status: h.status as 'ziyadah' | 'murojaah'
    }));

    // Hitung progress per juz
    const progressJuz = calculateJuzProgress(hafalanForConverter);
    
    // Hitung progress per surat
    const progressSurat = calculateSuratProgress(hafalanForConverter);

    // Statistik ringkasan
    const totalJuzSelesai = progressJuz.filter(j => j.status === 'selesai').length;
    const totalJuzProses = progressJuz.filter(j => j.status === 'proses').length;
    const totalAyatHafal = progressJuz.reduce((sum, j) => sum + j.ayatHafal, 0);
    const totalAyatAlQuran = progressJuz.reduce((sum, j) => sum + j.totalAyat, 0);
    const progressKeseluruhan = Math.round((totalAyatHafal / totalAyatAlQuran) * 100);

    const result = {
      success: true,
      data: {
        santriId: targetSantriId,
        progressJuz,
        progressSurat,
        statistik: {
          totalJuzSelesai,
          totalJuzProses,
          totalJuzBelum: 30 - totalJuzSelesai - totalJuzProses,
          totalAyatHafal,
          totalAyatAlQuran,
          progressKeseluruhan,
          totalSuratDihafal: progressSurat.length
        },
        lastUpdated: new Date().toISOString()
      }
    };

    return NextResponse.json(result);

  } catch (error) {
    console.error('❌ Error in progress-juz API:', error);
    
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { error: 'Token tidak valid' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}