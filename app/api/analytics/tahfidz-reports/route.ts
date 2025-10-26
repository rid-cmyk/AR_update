import prisma from '@/lib/database/prisma';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const semester = searchParams.get('semester'); // S1 or S2
    const tahunAjaran = searchParams.get('tahunAjaran');
    const halaqahId = searchParams.get('halaqahId');

    if (!semester || !tahunAjaran) {
      return NextResponse.json({ error: 'Semester and tahunAjaran are required' }, { status: 400 });
    }

    // Get halaqah santri records first
    const halaqahSantriWhere: any = {
      tahunAkademik: tahunAjaran,
      semester: semester as any
    };

    if (halaqahId) {
      halaqahSantriWhere.halaqahId = Number(halaqahId);
    }

    const halaqahSantriRecords = await prisma.halaqahSantri.findMany({
      where: halaqahSantriWhere,
      include: {
        santri: true,
        halaqah: {
          include: {
            guru: true
          }
        }
      }
    });

    const santriIds = [...new Set(halaqahSantriRecords.map(hs => hs.santriId))];

    // Get santri with their data
    const santriList = await prisma.user.findMany({
      where: {
        id: { in: santriIds }
      },
      include: {
        Hafalan: {
          where: {
            tanggal: {
              gte: new Date(`${tahunAjaran}-01-01`),
              lt: new Date(`${parseInt(tahunAjaran) + 1}-01-01`)
            }
          }
        },
        Absensi: true,
        Prestasi: {
          where: {
            tahun: parseInt(tahunAjaran)
          }
        },
        TargetHafalan: true
      }
    });

    // Process each santri's data
    const reports = await Promise.all(
      santriList.map(async (santri) => {
        const halaqahInfo = halaqahSantriRecords.find(hs => hs.santriId === santri.id);

        // Calculate hafalan statistics
        const totalHafalan = santri.Hafalan.length;
        const ziyadahCount = santri.Hafalan.filter(h => h.status === 'ziyadah').length;
        const murojaahCount = santri.Hafalan.filter(h => h.status === 'murojaah').length;

        const totalAyat = santri.Hafalan.reduce((sum, h) => {
          return sum + (h.ayatSelesai - h.ayatMulai + 1);
        }, 0);

        // Calculate attendance
        const totalAbsensi = santri.Absensi.length;
        const presentCount = santri.Absensi.filter(a => a.status === 'masuk').length;
        const attendanceRate = totalAbsensi > 0 ? (presentCount / totalAbsensi) * 100 : 0;

        // Calculate target achievement
        const targets = santri.TargetHafalan;
        const completedTargets = targets.filter(t => t.status === 'selesai').length;
        const targetAchievementRate = targets.length > 0 ? (completedTargets / targets.length) * 100 : 0;

        // Calculate final grade based on criteria
        let nilaiAkhir = 0;
        let statusAkhir = 'Merah';

        if (targetAchievementRate >= 80 && attendanceRate >= 80) {
          nilaiAkhir = Math.round((targetAchievementRate + attendanceRate) / 2);
          if (nilaiAkhir >= 90) statusAkhir = 'Hijau';
          else if (nilaiAkhir >= 75) statusAkhir = 'Kuning';
        } else {
          nilaiAkhir = Math.round(Math.min(targetAchievementRate, attendanceRate));
        }

        // Get achievements count
        const achievementsCount = santri.Prestasi.length;

        return {
          santriId: santri.id,
          namaSantri: santri.namaLengkap,
          halaqah: halaqahInfo?.halaqah.namaHalaqah || 'N/A',
          guru: halaqahInfo?.halaqah.guru?.namaLengkap || 'N/A',
          hafalan: {
            total: totalHafalan,
            ziyadah: ziyadahCount,
            murojaah: murojaahCount,
            totalAyat: totalAyat
          },
          absensi: {
            total: totalAbsensi,
            present: presentCount,
            rate: Math.round(attendanceRate * 100) / 100
          },
          target: {
            total: targets.length,
            completed: completedTargets,
            rate: Math.round(targetAchievementRate * 100) / 100
          },
          prestasi: achievementsCount,
          nilaiAkhir,
          statusAkhir,
          catatan: generateNotes(attendanceRate, targetAchievementRate, totalAyat)
        };
      })
    );

    // Sort by nilaiAkhir descending
    reports.sort((a, b) => b.nilaiAkhir - a.nilaiAkhir);

    return NextResponse.json({
      semester,
      tahunAjaran,
      halaqahId: halaqahId || 'all',
      totalSantri: reports.length,
      reports,
      summary: {
        averageNilaiAkhir: reports.length > 0 ? Math.round(reports.reduce((sum, r) => sum + r.nilaiAkhir, 0) / reports.length) : 0,
        statusDistribution: {
          hijau: reports.filter(r => r.statusAkhir === 'Hijau').length,
          kuning: reports.filter(r => r.statusAkhir === 'Kuning').length,
          merah: reports.filter(r => r.statusAkhir === 'Merah').length
        }
      }
    });

  } catch (error) {
    console.error('Tahfidz reports error:', error);
    return NextResponse.json({ error: 'Failed to generate tahfidz reports' }, { status: 500 });
  }
}

function generateNotes(attendanceRate: number, targetRate: number, totalAyat: number): string {
  const notes = [];

  if (attendanceRate < 75) {
    notes.push('Kehadiran perlu ditingkatkan');
  }

  if (targetRate < 80) {
    notes.push('Pencapaian target hafalan perlu diperbaiki');
  }

  if (totalAyat < 50) {
    notes.push('Jumlah ayat hafalan masih rendah');
  }

  if (notes.length === 0) {
    return 'Performa baik, tetap pertahankan';
  }

  return notes.join('. ');
}