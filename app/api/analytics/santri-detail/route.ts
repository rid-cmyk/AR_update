import prisma from '@/lib/database/prisma';
import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-helpers';

export async function GET(request: Request) {
  try {
    const { user, error } = await withAuth(request, ['super_admin', 'admin', 'yayasan']);
    if (error || !user) {
      return NextResponse.json(
        { error: error || 'Unauthorized' },
        { status: error === 'Insufficient permissions' ? 403 : 401 }
      );
    }

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

    // Parallelize all independent analytics queries
    const [
      hafalanStats,
      allHafalan,
      attendanceStats,
      targets,
      absensi,
      ujianList,
      rapot,
      achievements,
      rankingResult,
      monthlyProgressResult
    ] = await Promise.all([
      // Hafalan statistics
      prisma.hafalan.groupBy({
        by: ['status'],
        where: { santriId: Number(santriId) },
        _count: { status: true },
        _sum: {
          ayatMulai: true,
          ayatSelesai: true
        }
      }),

      // All hafalan with minimal guru info (hindari User penuh/password)
      prisma.hafalan.findMany({
        where: { santriId: Number(santriId) },
        orderBy: { tanggal: 'desc' },
        select: {
          id: true,
          tanggal: true,
          status: true,
          surat: true,
          ayatMulai: true,
          ayatSelesai: true,
          keterangan: true,
          santri: {
            select: {
              HalaqahSantri: {
                select: {
                  halaqah: {
                    select: {
                      guru: { select: { namaLengkap: true } }
                    }
                  }
                },
                take: 1
              }
            }
          }
        }
      }),

      // Attendance statistics
      prisma.absensi.groupBy({
        by: ['status'],
        where: { santriId: Number(santriId) },
        _count: { status: true }
      }),

      // Target progress
      prisma.targetHafalan.findMany({
        where: { santriId: Number(santriId) },
        orderBy: { deadline: 'desc' },
        select: {
          id: true,
          surat: true,
          ayatTarget: true,
          deadline: true,
          status: true
        }
      }),

      // Absensi records
      prisma.absensi.findMany({
        where: { santriId: Number(santriId) },
        orderBy: { tanggal: 'desc' },
        select: { id: true, tanggal: true, status: true }
      }),

      // Ujian santri
      prisma.ujianSantri.findMany({
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
      }),

      // Rapor
      prisma.raportSantri.findMany({
        where: { santriId: Number(santriId) },
        include: { semester: { include: { tahunAjaran: true } } },
        orderBy: { createdAt: 'desc' }
      }),

      // Achievements
      prisma.prestasi.findMany({
        where: { santriId: Number(santriId) },
        orderBy: { tahun: 'desc' }
      }),

      // Ranking hafalan via PostgreSQL (compute + count in one query)
      prisma.$queryRaw<Array<{ id: number; totalAyat: number }>>`
        SELECT 
          u.id,
          COALESCE(SUM(h."ayatSelesai" - h."ayatMulai" + 1), 0)::int AS "totalAyat"
        FROM "User" u
        INNER JOIN "Role" r ON u."roleId" = r.id
        LEFT JOIN "Hafalan" h ON h."santriId" = u.id
        WHERE r.name = 'santri'
        GROUP BY u.id
        ORDER BY "totalAyat" DESC
      `.catch(() => [] as Array<{ id: number; totalAyat: number }>),

      // Monthly progress
      prisma.$queryRaw`
        SELECT
          DATE_TRUNC('month', "tanggal") as month,
          COUNT(*) as hafalan_count,
          SUM("ayatSelesai" - "ayatMulai" + 1) as ayat_count
        FROM "Hafalan"
        WHERE "santriId" = ${Number(santriId)}
          AND "tanggal" >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '6 months')
        GROUP BY DATE_TRUNC('month', "tanggal")
        ORDER BY month DESC
      `.catch(() => [] as Record<string, unknown>[])
    ]);

    const totalAyatHafal = hafalanStats.reduce((sum, stat) => {
      return sum + (stat._sum.ayatSelesai || 0) - (stat._sum.ayatMulai || 0) + stat._count.status;
    }, 0);

    // Get recent hafalan (last 10)
    const recentHafalan = allHafalan.slice(0, 10);

    const totalAbsensi = attendanceStats.reduce((sum, stat) => sum + stat._count.status, 0);
    const presentCount = attendanceStats.find(stat => stat.status === 'masuk')?._count.status || 0;
    const attendanceRate = totalAbsensi > 0 ? (presentCount / totalAbsensi) * 100 : 0;

    // Calculate ranking hafalan
    let rankingHafalan = 1;
    let totalSantri = 0;
    try {
      const rankings = rankingResult;
      totalSantri = rankings.length;
      const rankIdx = rankings.findIndex(r => r.id === Number(santriId));
      rankingHafalan = rankIdx >= 0 ? rankIdx + 1 : totalSantri + 1;
    } catch (dbErr) {
      console.error('Error computing hafalan ranking via SQL, falling back to count:', dbErr);
      totalSantri = await prisma.user.count({ where: { role: { name: 'santri' } } });
      rankingHafalan = 1;
    }

    const monthlyProgress: Record<string, unknown>[] = Array.isArray(monthlyProgressResult)
      ? monthlyProgressResult as Record<string, unknown>[]
      : [];

    console.log('📊 Statistics calculated:', {
      totalAyatHafal,
      rankingHafalan,
      totalSantri,
      hafalanCount: allHafalan.length,
      absensiCount: absensi.length
    });

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
        periode: r.semester?.namaSemester || 'N/A',
        semester: r.semester?.namaSemester || 'N/A',
        tahunAjaran: r.semester?.tahunAjaran?.namaLengkap || 'N/A',
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
      error: 'Failed to fetch santri details'
    }, { status: 500 });
  }
}