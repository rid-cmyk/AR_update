// 🎯 API Konversi: Target Juz → Rencana Surat
// Endpoint: GET /api/konversi/target-surat

import { NextRequest, NextResponse } from 'next/server';
import { convertJuzToSuratTarget } from '@/utils/hafalan-converter';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const juzParam = searchParams.get('juz');
    
    if (!juzParam) {
      return NextResponse.json(
        { error: 'Parameter juz diperlukan. Contoh: ?juz=1,2,3' },
        { status: 400 }
      );
    }

    // Parse juz numbers
    const targetJuz = juzParam.split(',').map(j => {
      const juzNumber = parseInt(j.trim());
      if (isNaN(juzNumber) || juzNumber < 1 || juzNumber > 30) {
        throw new Error(`Juz ${j} tidak valid. Harus antara 1-30`);
      }
      return juzNumber;
    });

    // Konversi juz ke target surat
    const suratTarget = convertJuzToSuratTarget(targetJuz);

    // Hitung statistik
    const totalSurat = suratTarget.length;
    const totalAyatTarget = suratTarget.reduce((sum, s) => sum + s.ayatHafal, 0);
    const suratLengkap = suratTarget.filter(s => s.progress === 100).length;
    const suratSebagian = suratTarget.filter(s => s.progress > 0 && s.progress < 100).length;

    const result = {
      success: true,
      data: {
        targetJuz: targetJuz.sort(),
        suratTarget,
        statistik: {
          totalJuz: targetJuz.length,
          totalSurat,
          totalAyatTarget,
          suratLengkap,
          suratSebagian,
          estimasiWaktu: `${Math.ceil(totalAyatTarget / 10)} hari` // Asumsi 10 ayat per hari
        },
        rencanaHafalan: generateRencanaHafalan(suratTarget),
        lastGenerated: new Date().toISOString()
      }
    };

    return NextResponse.json(result);

  } catch (error) {
    console.error('❌ Error in target-surat API:', error);
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Terjadi kesalahan server' },
      { status: 400 }
    );
  }
}

/**
 * Generate rencana hafalan berdasarkan target surat
 */
function generateRencanaHafalan(suratTarget: any[]) {
  return suratTarget.map((surat, index) => {
    let rencana = '';
    
    if (surat.progress === 100) {
      rencana = `Hafal lengkap surat ${surat.surat} (${surat.totalAyat} ayat)`;
    } else {
      rencana = `Hafal surat ${surat.surat} ayat 1-${surat.ayatHafal} dari ${surat.totalAyat} ayat`;
    }
    
    return {
      urutan: index + 1,
      surat: surat.surat,
      target: `Ayat 1-${surat.ayatHafal}`,
      totalAyat: surat.ayatHafal,
      juzTerkait: surat.juzTerkait,
      rencana,
      prioritas: surat.juzTerkait.length === 1 ? 'tinggi' : 'sedang' // Surat yang hanya ada di 1 juz prioritas tinggi
    };
  }).sort((a, b) => {
    // Urutkan berdasarkan prioritas dan juz terkecil
    if (a.prioritas !== b.prioritas) {
      return a.prioritas === 'tinggi' ? -1 : 1;
    }
    return Math.min(...a.juzTerkait) - Math.min(...b.juzTerkait);
  });
}