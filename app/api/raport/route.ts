import prisma from '@/lib/database/prisma';
import { NextResponse } from 'next/server';
import { withApiCache, cachedJsonResponse } from '@/lib/api-cache';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const halaqahId = searchParams.get('halaqahId');
    const semester = searchParams.get('semester');
    const tahunAjaran = searchParams.get('tahunAjaran');

    if (!halaqahId || !semester || !tahunAjaran) {
      return NextResponse.json({ error: 'halaqahId, semester, tahunAjaran are required' }, { status: 400 });
    }

    const cacheKey = `raport:${halaqahId}:${semester}:${tahunAjaran}`;
    const raportData = await withApiCache(cacheKey, 300_000, async () => {
      // Resolve TahunAjaran dari rentang tahun (mis. "2024/2025" -> tahunMulai 2024)
      const startYear = parseInt(tahunAjaran.split('/')[0], 10);
      const resolvedSemester = isNaN(startYear)
        ? null
        : await prisma.semester.findFirst({
            where: {
              tahunAjaran: {
                tahunMulai: startYear
              },
              semesterUrutan: semester === 'S1' ? 1 : 2
            },
            select: { id: true }
          });

      if (!resolvedSemester) {
        return [];
      }

      // Get santri in halaqah for the academic year
      const halaqahSantri = await prisma.halaqahSantri.findMany({
        where: {
          halaqahId: Number(halaqahId),
          semesterId: resolvedSemester.id
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

      if (halaqahSantri.length === 0) {
        return [];
      }

      const santriIds = halaqahSantri.map(hs => hs.santriId);

      const [allHafalan, allTargets, allUjian] = await Promise.all([
        prisma.hafalan.findMany({
          where: { santriId: { in: santriIds } },
          select: { santriId: true, ayatMulai: true, ayatSelesai: true }
        }),
        prisma.targetHafalan.findMany({
          where: { santriId: { in: santriIds } },
          select: { santriId: true, ayatTarget: true }
        }),
        prisma.ujianSantri.findMany({
          where: {
            santriId: { in: santriIds },
            statusUjian: { in: ['selesai', 'diverifikasi'] }
          },
          select: { santriId: true, nilaiAkhir: true }
        })
      ]);

      const hafalanBySantri = new Map<number, typeof allHafalan>();
      for (const h of allHafalan) {
        if (!hafalanBySantri.has(h.santriId)) hafalanBySantri.set(h.santriId, []);
        hafalanBySantri.get(h.santriId)!.push(h);
      }

      const targetsBySantri = new Map<number, typeof allTargets>();
      for (const t of allTargets) {
        if (!targetsBySantri.has(t.santriId)) targetsBySantri.set(t.santriId, []);
        targetsBySantri.get(t.santriId)!.push(t);
      }

      const ujianBySantri = new Map<number, typeof allUjian>();
      for (const u of allUjian) {
        if (!ujianBySantri.has(u.santriId)) ujianBySantri.set(u.santriId, []);
        ujianBySantri.get(u.santriId)!.push(u);
      }

      return halaqahSantri.map((hs) => {
        const santriId = hs.santriId;

        // Total ayat hafal
        const hafalan = hafalanBySantri.get(santriId) || [];
        const totalAyatHafal = hafalan.reduce((sum, h) => sum + h.ayatSelesai - h.ayatMulai + 1, 0);

        // Target tercapai
        const targets = targetsBySantri.get(santriId) || [];
        const totalTarget = targets.reduce((sum, t) => sum + t.ayatTarget, 0);
        const targetTercapai = totalTarget > 0 ? Math.round((totalAyatHafal / totalTarget) * 100) : 0;

        // Rata-rata nilai ujian
        const ujian = ujianBySantri.get(santriId) || [];
        const rataRataNilaiUjian = ujian.length > 0
          ? ujian.reduce((sum, u) => sum + (u.nilaiAkhir || 0), 0) / ujian.length
          : 0;

        // Status akhir based on criteria
        let statusAkhir = 'Merah';
        if (targetTercapai >= 80 && rataRataNilaiUjian >= 80) {
          statusAkhir = 'Hijau';
        } else if (targetTercapai >= 60 || rataRataNilaiUjian >= 60) {
          statusAkhir = 'Kuning';
        }

        return {
          santri: hs.santri,
          totalAyatHafal,
          targetTercapai,
          rataRataNilaiUjian: Math.round(rataRataNilaiUjian * 100) / 100,
          statusAkhir
        };
      });
    });

    return cachedJsonResponse(raportData, 200, 300, 600);
  } catch (error) {
    console.error('GET /api/raport error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch raport' },
      { status: 500 }
    );
  }
}