import { NextResponse } from 'next/server';
import { JUZ_TO_PAGE_MAPPING, SURAT_DATA, generateMushafPageContent } from './quranUtils';
import { handleSearch, handleAyatRequest } from './quranHandlers';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const suratId = searchParams.get('suratId');
    const page = searchParams.get('page');
    const juz = searchParams.get('juz');
    const action = searchParams.get('action');
    const search = searchParams.get('search');
    const ayat = searchParams.get('ayat');

    // Handle search functionality
    if (action === 'search' && search) {
      return handleSearch(search);
    }

    // Handle ayat-specific requests
    if (action === 'ayat' && suratId && ayat) {
      return handleAyatRequest(parseInt(suratId), parseInt(ayat));
    }

    // Handle mushaf-specific requests
    if (action === 'mushaf') {
      if (page) {
        // Get specific mushaf page
        const pageNum = parseInt(page);
        if (pageNum < 1 || pageNum > 604) {
          return NextResponse.json(
            { error: 'Invalid page number. Must be between 1-604' },
            { status: 400 }
          );
        }

        const pageContent = generateMushafPageContent(pageNum);
        return NextResponse.json({
          success: true,
          data: pageContent
        });
      }

      if (juz) {
        // Get juz page range and detailed info
        const juzNum = parseInt(juz);
        if (juzNum < 1 || juzNum > 30) {
          return NextResponse.json(
            { error: 'Invalid juz number. Must be between 1-30' },
            { status: 400 }
          );
        }

        const juzMapping = JUZ_TO_PAGE_MAPPING[juzNum as keyof typeof JUZ_TO_PAGE_MAPPING];
        const suratsInJuz = Object.entries(SURAT_DATA).filter(([, surat]) => {
          return Array.isArray(surat.juz) ? surat.juz.includes(juzNum) : surat.juz === juzNum;
        });

        return NextResponse.json({
          success: true,
          data: {
            juz: juzNum,
            pageRange: juzMapping,
            totalPages: juzMapping.end - juzMapping.start + 1,
            surats: suratsInJuz.map(([id, surat]) => ({
              id: parseInt(id),
              name: surat.name,
              arabicName: surat.arabicName,
              totalAyat: surat.totalAyat
            })),
            navigation: {
              previousJuz: juzNum > 1 ? juzNum - 1 : null,
              nextJuz: juzNum < 30 ? juzNum + 1 : null
            }
          }
        });
      }

      // Return complete mushaf overview
      return NextResponse.json({
        success: true,
        data: {
          juzMapping: JUZ_TO_PAGE_MAPPING,
          totalPages: 604,
          totalJuz: 30,
          totalSurats: Object.keys(SURAT_DATA).length,
          suratList: Object.entries(SURAT_DATA).map(([id, surat]) => ({
            id: parseInt(id),
            name: surat.name,
            arabicName: surat.arabicName,
            totalAyat: surat.totalAyat,
            juz: surat.juz,
            pages: surat.pages
          }))
        }
      });
    }

    // Handle surat list with enhanced data
    if (action === 'surats') {
      return NextResponse.json({
        success: true,
        data: Object.entries(SURAT_DATA).map(([id, surat]) => ({
          id: parseInt(id),
          name: surat.name,
          arabicName: surat.arabicName,
          totalAyat: surat.totalAyat,
          juz: surat.juz,
          pages: surat.pages,
          pageCount: surat.pages[1] - surat.pages[0] + 1
        }))
      });
    }

    // Original Quran API functionality with fallback to external API
    if (suratId) {
      // Try to get from local data first
      const localSurat = SURAT_DATA[parseInt(suratId) as keyof typeof SURAT_DATA];
      if (localSurat) {
        return NextResponse.json({
          success: true,
          data: {
            id: parseInt(suratId),
            ...localSurat,
            source: 'local'
          }
        });
      }

      // Fallback to external API
      const response = await fetch(`https://equran.id/api/v2/surat/${suratId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch surat data');
      }
      const data = await response.json();
      return NextResponse.json({
        success: true,
        data: { ...data, source: 'external' }
      });
    } else {
      // Get all surat list from external API
      const response = await fetch('https://equran.id/api/v2/surat');
      if (!response.ok) {
        throw new Error('Failed to fetch surat list');
      }
      const data = await response.json();
      // equran.id mengembalikan { code, message, data: SuratInfo[] }.
      // Kembalikan data apa adanya agar hook useQuranSuratList
      // ({ code: 200, data: SuratInfo[] }) langsung cocok.
      return NextResponse.json(
        {
          success: true,
          code: data?.code ?? 200,
          message: data?.message ?? 'success',
          data: Array.isArray(data?.data) ? data.data : []
        },
        {
          headers: {
            'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600'
          }
        }
      );
    }
  } catch (error) {
    console.error('Error fetching Quran data:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch Quran data'
      },
      { status: 500 }
    );
  }
}
