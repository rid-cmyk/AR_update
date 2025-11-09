import prisma from '@/lib/database/prisma';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const santriId = searchParams.get('santriId');

    console.log('📊 Fetching santri detail for ID:', santriId);

    if (!santriId) {
      return NextResponse.json({ error: 'Santri ID is required' }, { status: 400 });
    }

    // Get santri basic info
    const santri = await prisma.user.findUnique({
      where: { id: Number(santriId) },
      include: {
        role: true,
        HalaqahSantri: {
          include: {
            halaqah: {
              include: {
                guru: {
                  select: {
                    id: true,
                    namaLengkap: true,
                    username: true
                  }
                },
                jadwal: true
              }
            }
          }
        }
      }
    });

    if (!santri) {
      console.log('❌ Santri not found with ID:', santriId);
      return NextResponse.json({ error: 'Santri not found' }, { status: 404 });
    }

    console.log('✅ Santri found:', santri.namaLengkap);

    // Get hafalan statistics
    const hafalanStats = await prisma.hafalan.groupBy({
      by: ['status'],
      where: { santriId: Number(santriId) },
      _count: { status: true },
      _sum: {
        ayatMulai: true,
        ayatSelesai: true
      }
    });

    const totalAyatHafal = hafalanStats.reduce((sum, stat) => {
      return sum + (stat._sum.ayatSelesai || 0) - (stat._sum.ayatMulai || 0) + stat._count.status;
    }, 0);

    // Get all hafalan with guru info
    const allHafalan = await prisma.hafalan.findMany({
      where: { santriId: Number(santriId) },
      orderBy: { tanggal: 'desc' },
      include: {
        santri: {
          include: {
            HalaqahSantri: {
              include: {
                halaqah: {
                  include: {
                    guru: {
                      select: {
                        namaLengkap: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    // Get recent hafalan (last 10)
    const recentHafalan = allHafalan.slice(0, 10);

    // Get attendance statistics
    const attendanceStats = await prisma.absensi.groupBy({
      by: ['status'],
      where: { santriId: Number(santriId) },
      _count: { status: true }
    });

    const totalAbsensi = attendanceStats.reduce((sum, stat) => sum + stat._count.status, 0);
    const presentCount = attendanceStats.find(stat => stat.status === 'masuk')?._count.status || 0;
    const attendanceRate = totalAbsensi > 0 ? (presentCount / totalAbsensi) * 100 : 0;

    // Get target progress with calculated progress percentage
    const targets = await prisma.targetHafalan.findMany({
      where: { santriId: Number(santriId) },
      orderBy: { deadline: 'desc' }
    });

    // Get absensi (without halaqah relation for now)
    const absensi = await prisma.absensi.findMany({
      where: { santriId: Number(santriId) },
      orderBy: { tanggal: 'desc' }
    });

    // Get ujian from both Ujian and UjianGuru models
    const ujianRegular = await prisma.ujian.findMany({
      where: { santriId: Number(santriId) },
      orderBy: { tanggal: 'desc' },
      include: {
        halaqah: {
          include: {
            guru: {
              select: {
                namaLengkap: true
              }
            }
          }
        }
      }
    });

    const ujianGuru = await prisma.ujianGuru.findMany({
      where: { santriId: Number(santriId) },
      orderBy: { tanggalUjian: 'desc' },
      include: {
        guru: {
          select: {
            namaLengkap: true
          }
        }
      }
    });

    // Get rapot
    const rapot = await prisma.raportSantri.findMany({
      where: { santriId: Number(santriId) },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate ranking hafalan
    const allSantriHafalan = await prisma.user.findMany({
      where: {
        role: {
          name: 'santri'
        }
      },
      include: {
        Hafalan: {
          select: {
            ayatMulai: true,
            ayatSelesai: true
          }
        }
      }
    });

    const santriRankings = allSantriHafalan.map(s => ({
      id: s.id,
      totalAyat: s.Hafalan.reduce((sum, h) => sum + (h.ayatSelesai - h.ayatMulai + 1), 0)
    })).sort((a, b) => b.totalAyat - a.totalAyat);

    const rankingHafalan = santriRankings.findIndex(s => s.id === Number(santriId)) + 1;
    const totalSantri = santriRankings.length;

    console.log('📊 Statistics calculated:', {
      totalAyatHafal,
      rankingHafalan,
      totalSantri,
      hafalanCount: allHafalan.length,
      absensiCount: absensi.length
    });

    // Get achievements
    const achievements = await prisma.prestasi.findMany({
      where: { santriId: Number(santriId) },
      orderBy: { tahun: 'desc' }
    });

    // Get monthly progress (simplified to avoid SQL errors)
    let monthlyProgress: any[] = [];
    try {
      monthlyProgress = await prisma.$queryRaw`
        SELECT
          DATE_TRUNC('month', "tanggal") as month,
          COUNT(*) as hafalan_count,
          SUM("ayatSelesai" - "ayatMulai" + 1) as ayat_count
        FROM "Hafalan"
        WHERE "santriId" = ${Number(santriId)}
          AND "tanggal" >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '6 months')
        GROUP BY DATE_TRUNC('month', "tanggal")
        ORDER BY month DESC
      `;
    } catch (sqlError) {
      console.error('Monthly progress query error:', sqlError);
      monthlyProgress = [];
    }

    console.log('✅ All data fetched successfully, preparing response...');

    return NextResponse.json({
      id: santri.id,
      namaLengkap: santri.namaLengkap,
      namaPanggilan: santri.username, // Bisa diganti dengan field namaPanggilan jika ada
      username: santri.username,
      role: santri.role.name,
      foto: santri.foto,
      halaqah: santri.HalaqahSantri.map(hs => ({
        id: hs.halaqah.id,
        namaHalaqah: hs.halaqah.namaHalaqah,
        guru: {
          namaLengkap: hs.halaqah.guru?.namaLengkap || 'Tidak ada guru',
          username: hs.halaqah.guru?.username || ''
        },
        jadwal: hs.halaqah.jadwal.map(j => ({
          hari: j.hari,
          waktuMulai: j.waktuMulai,
          waktuSelesai: j.waktuSelesai
        }))
      })),
      orangTua: [], // TODO: Add OrangTuaSantri relation when model is created
      statistics: {
        totalAyatHafal,
        hafalanByType: hafalanStats,
        attendanceRate: Math.round(attendanceRate * 100) / 100,
        attendanceStats,
        totalTargets: targets.length,
        completedTargets: targets.filter(t => t.status === 'selesai').length,
        totalAchievements: achievements.length,
        rankingHafalan,
        totalSantri
      },
      recentHafalan: recentHafalan.map(h => ({
        id: h.id,
        tanggal: h.tanggal.toISOString(),
        jenis: h.status,
        surah: h.surat,
        ayat: `${h.ayatMulai}-${h.ayatSelesai}`,
        guru: h.santri.HalaqahSantri[0]?.halaqah.guru?.namaLengkap || 'N/A',
        status: h.status,
        catatan: h.keterangan
      })),
      allHafalan: allHafalan.map(h => ({
        id: h.id,
        tanggal: h.tanggal.toISOString(),
        jenis: h.status,
        surah: h.surat,
        ayatMulai: h.ayatMulai,
        ayatSelesai: h.ayatSelesai,
        status: h.status,
        catatan: h.keterangan,
        guru: {
          namaLengkap: h.santri.HalaqahSantri[0]?.halaqah.guru?.namaLengkap || 'N/A'
        }
      })),
      targets: targets.map(t => ({
        id: t.id,
        surah: t.surat,
        ayatMulai: 1,
        ayatSelesai: t.ayatTarget,
        targetSelesai: t.deadline.toISOString(),
        status: t.status,
        progress: t.status === 'selesai' ? 100 : 50 // Simplified progress calculation
      })),
      absensi: absensi.map(a => ({
        id: a.id,
        tanggal: a.tanggal.toISOString(),
        status: a.status,
        keterangan: a.keterangan || null,
        halaqah: {
          namaHalaqah: santri.HalaqahSantri[0]?.halaqah.namaHalaqah || 'N/A'
        }
      })),
      ujian: [
        ...ujianRegular.map(u => ({
          id: u.id,
          tanggal: u.tanggal.toISOString(),
          jenis: u.jenis,
          surah: 'N/A',
          ayatMulai: 1,
          ayatSelesai: 10,
          nilai: u.nilai || 0,
          catatan: u.keterangan,
          penguji: {
            namaLengkap: u.halaqah.guru?.namaLengkap || 'N/A'
          }
        })),
        ...ujianGuru.map(u => ({
          id: u.id,
          tanggal: u.tanggalUjian.toISOString(),
          jenis: u.jenisUjian,
          surah: `Juz ${u.juzMulai}-${u.juzSelesai}`,
          ayatMulai: u.juzMulai,
          ayatSelesai: u.juzSelesai,
          nilai: u.totalNilai || 0,
          catatan: u.keterangan,
          penguji: {
            namaLengkap: u.guru.namaLengkap
          }
        }))
      ],
      rapot: rapot.map(r => ({
        id: r.id,
        periode: r.semester,
        semester: r.semester,
        tahunAjaran: r.tahunAjaran,
        totalHafalan: r.totalHafalan || 0,
        nilaiRataRata: r.nilaiRataRata || 0,
        kehadiran: r.persentaseKehadiran || 0,
        catatan: r.catatan
      })),
      achievements,
      monthlyProgress
    });

  } catch (error: any) {
    console.error('❌ Santri detail error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return NextResponse.json({ 
      error: 'Failed to fetch santri details',
      details: error.message 
    }, { status: 500 });
  }
}