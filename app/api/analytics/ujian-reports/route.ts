import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse, withAuth } from '@/lib/api-helpers';

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await withAuth(request, ['admin', 'super-admin']);
    if (error || !user) {
      return ApiResponse.unauthorized(error || 'Unauthorized');
    }

    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    
    try {
      const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Date filters
    const ujianDateFilter = startDate && endDate ? {
      tanggal: {
        gte: new Date(startDate),
        lte: new Date(endDate + 'T23:59:59.999Z')
      }
    } : {};

    // Get Ujian Reports
    const ujianReports = await prisma.ujian.findMany({
      where: ujianDateFilter,
      include: {
        santri: {
          select: {
            namaLengkap: true
          }
        },
        halaqah: {
          select: {
            namaHalaqah: true
          }
        }
      },
      orderBy: {
        tanggal: 'desc'
      }
    });

    // Process ujian data
    const processedUjianReports = ujianReports.map(ujian => ({
      id: ujian.id,
      santri: ujian.santri.namaLengkap,
      halaqah: ujian.halaqah.namaHalaqah,
      jenisUjian: ujian.jenis,
      nilaiAkhir: ujian.nilai,
      tanggal: ujian.tanggal,
      keterangan: ujian.keterangan
    }));

    // Get Target Reports
    const targetReports = await prisma.targetHafalan.findMany({
      include: {
        santri: {
          select: {
            namaLengkap: true,
            HalaqahSantri: {
              include: {
                halaqah: {
                  select: {
                    namaHalaqah: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        deadline: 'asc'
      }
    });

    // Process target data
    const processedTargetReports = targetReports.map(target => ({
      id: target.id,
      santri: target.santri.namaLengkap,
      halaqah: target.santri.HalaqahSantri[0]?.halaqah?.namaHalaqah || 'Belum ada halaqah',
      surat: target.surat,
      ayatTarget: target.ayatTarget,
      deadline: target.deadline,
      status: target.status,
      progress: target.status === 'selesai' ? 100 : 
                target.status === 'proses' ? 50 : 0
    }));

    // Summary statistics
    const ujianStats = {
      total: ujianReports.length,
      avgNilai: ujianReports.length > 0 
        ? ujianReports.reduce((sum, u) => sum + u.nilai, 0) / ujianReports.length 
        : 0
    };

    const targetStats = {
      total: targetReports.length,
      selesai: targetReports.filter(t => t.status === 'selesai').length,
      proses: targetReports.filter(t => t.status === 'proses').length,
      belum: targetReports.filter(t => t.status === 'belum').length,
      overdue: targetReports.filter(t => 
        t.status !== 'selesai' && new Date(t.deadline) < new Date()
      ).length
    };

      return NextResponse.json({
        ujianReports: processedUjianReports,
        targetReports: processedTargetReports,
        ujianStats,
        targetStats
      });
    } finally {
      await prisma.$disconnect();
    }
  } catch (error) {
    console.error('Ujian reports error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}