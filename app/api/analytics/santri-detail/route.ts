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
      include: { role: true,
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

    // Get ujian santri (gabungan ujian reguler & ujian guru)
    const ujianList = await prisma.ujianSantri.findMany({
      where: { santriId: Number(santriId) },
      orderBy: { tanggalUjian: 'desc' },
      include: {
        guru: {
          select: {
            namaLengkap: true
          }
        },
        templateUjian: {
          select: {
            namaTemplate: true
          }
        }
      }
    });

    // Get rapot
    const rapot = await prisma.raportSantri.findMany({
      where: { santriId: Number(santriId) },
      include: { tahunAjaran: true },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate ranking hafalan efficiently via PostgreSQL query
    let rankingHafalan = 1;
    let totalSantri = 0;
    try {
      const rankings = await prisma.$queryRaw<Array<{ id: number; totalAyat: number }>>`
        SELECT 
          u.id,
          COALESCE(SUM(h."ayatSelesai" - h."ayatMulai" + 1), 0)::int AS "totalAyat"
        FROM "User" u
        INNER JOIN "Role" r ON u."roleId" = r.id
        LEFT JOIN "Hafalan" h ON h."santriId" = u.id
        WHERE r.name = 'santri'
        GROUP BY u.id
        ORDER BY "totalAyat" DESC
      `;
      totalSantri = rankings.length;
      const rankIdx = rankings.findIndex(r => r.id === Number(santriId));
      rankingHafalan = rankIdx >= 0 ? rankIdx + 1 : totalSantri + 1;
    } catch (dbErr) {
      console.error('Error computing hafalan ranking via SQL, falling back to count:', dbErr);
      totalSantri = await prisma.user.count({ where: { role: { name: 'santri' } } });
      rankingHafalan = 1;
    }

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
    let monthlyProgress: Record<string, unknown>[] = [];
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
          jamMulai: j.jamMulai,
          jamSelesai: j.jamSelesai
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
        keterangan: null,
        halaqah: {
          namaHalaqah: santri.HalaqahSantri[0]?.halaqah.namaHalaqah || 'N/A'
        }
      })),
      ujian: ujianList.map(u => ({
          id: u.id,
          tanggal: u.tanggalUjian.toISOString(),
          jenis: u.jenisUjianLabel || u.templateUjian?.namaTemplate || 'Ujian',
          surah: u.juzDari && u.juzSampai ? `Juz ${u.juzDari}-${u.juzSampai}` : 'N/A',
          ayatMulai: u.juzDari || 1,
          ayatSelesai: u.juzSampai || 1,
          nilai: u.nilaiAkhir || 0,
          catatan: u.catatanGuru,
          penguji: {
            namaLengkap: u.guru?.namaLengkap || 'N/A'
          }
        })),
      rapot: rapot.map(r => ({
        id: r.id,
        periode: r.tahunAjaran?.semester || 'N/A',
        semester: r.tahunAjaran?.semester || 'N/A',
        tahunAjaran: r.tahunAjaran?.namaLengkap || 'N/A',
        totalHafalan: 0,
        nilaiRataRata: r.nilaiRataRata || 0,
        kehadiran: 0,
        catatan: r.catatanGuru || ''
      })),
      achievements,
      monthlyProgress
    });

  } catch (error: unknown) {
    console.error('❌ Santri detail error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : undefined,
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    });
    return NextResponse.json({ 
      error: 'Failed to fetch santri details',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}