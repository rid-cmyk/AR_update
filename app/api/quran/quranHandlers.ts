import { NextResponse } from 'next/server';
import { SURAT_DATA } from './quranUtils';

// Handle search functionality
export async function handleSearch(query: string) {
  // Simple search implementation - in production, use proper search engine
  const searchResults = Object.entries(SURAT_DATA)
    .filter(([, surat]) => 
      surat.name.toLowerCase().includes(query.toLowerCase()) ||
      surat.arabicName.includes(query)
    )
    .map(([id, surat]) => ({
      id: parseInt(id),
      name: surat.name,
      arabicName: surat.arabicName,
      totalAyat: surat.totalAyat,
      juz: surat.juz,
      pages: surat.pages,
      matchType: surat.name.toLowerCase().includes(query.toLowerCase()) ? 'name' : 'arabic'
    }));

  return NextResponse.json({
    success: true,
    data: {
      query,
      results: searchResults,
      totalResults: searchResults.length
    }
  });
}

// Handle specific ayat requests
export async function handleAyatRequest(suratId: number, ayatNumber: number) {
  const surat = SURAT_DATA[suratId as keyof typeof SURAT_DATA];
  
  if (!surat) {
    return NextResponse.json(
      { error: 'Surat not found' },
      { status: 404 }
    );
  }

  if (ayatNumber < 1 || ayatNumber > surat.totalAyat) {
    return NextResponse.json(
      { error: `Invalid ayat number. Must be between 1-${surat.totalAyat}` },
      { status: 400 }
    );
  }

  // Calculate which page this ayat is on (simplified)
  const estimatedPage = Math.floor(
    surat.pages[0] + ((ayatNumber - 1) / surat.totalAyat) * (surat.pages[1] - surat.pages[0])
  );

  return NextResponse.json({
    success: true,
    data: {
      suratId,
      suratName: surat.name,
      suratArabicName: surat.arabicName,
      ayatNumber,
      estimatedPage,
      juz: Array.isArray(surat.juz) ? surat.juz[0] : surat.juz,
      navigation: {
        previousAyat: ayatNumber > 1 ? ayatNumber - 1 : null,
        nextAyat: ayatNumber < surat.totalAyat ? ayatNumber + 1 : null,
        totalAyat: surat.totalAyat
      }
    }
  });
}
