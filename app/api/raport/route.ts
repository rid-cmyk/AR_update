import prisma from '@/lib/database/prisma';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const halaqahId = searchParams.get('halaqahId');
    const semester = searchParams.get('semester');
    const tahunAjaran = searchParams.get('tahunAjaran');

    if (!halaqahId || !semester || !tahunAjaran) {
      return NextResponse.json({ error: 'halaqahId, semester, tahunAjaran are required' }, { status: 400 });
    }

    // Get santri in halaqah
    const halaqahSantri = await prisma.halaqahSantri.findMany({
      where: {
        halaqahId: Number(halaqahId),
        tahunAkademik: tahunAjaran,
        semester: semester as any
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

    const raportData = await Promise.all(
      halaqahSantri.map(async (hs) => {
        const santriId = hs.santriId;

        // Total ayat hafal
        const hafalan = await prisma.hafalan.findMany({
          where: { santriId }
        });
        const totalAyatHafal = hafalan.reduce((sum, h) => sum + h.ayatSelesai - h.ayatMulai + 1, 0);

        // Target tercapai
        const targets = await prisma.targetHafalan.findMany({
          where: { santriId }
        });
        const totalTarget = targets.reduce((sum, t) => sum + t.ayatTarget, 0);
        const targetTercapai = totalTarget > 0 ? Math.round((totalAyatHafal / totalTarget) * 100) : 0;

        // Rata-rata nilai ujian
        const ujian = await prisma.ujian.findMany({
          where: {
            santriId,
            halaqahId: Number(halaqahId)
          }
        });
        const rataRataNilaiUjian = ujian.length > 0
          ? ujian.reduce((sum, u) => sum + u.nilai, 0) / ujian.length
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
      })
    );

    return NextResponse.json(raportData);
  } catch (error) {
    console.error('GET /api/raport error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch raport' },
      { status: 500 }
    );
  }
}