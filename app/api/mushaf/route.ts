import { NextResponse } from 'next/server';

import { JUZ_TO_PAGE_MAPPING, generateMushafPageContent, generateFallbackContent } from './mushafHelpers';
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page');
    const juz = searchParams.get('juz');
    const action = searchParams.get('action');

    // Get specific mushaf page with real Quran content
    if (page) {
      const pageNum = parseInt(page);
      if (pageNum < 1 || pageNum > 604) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Invalid page number. Must be between 1-604' 
          },
          { status: 400 }
        );
      }
      
      const pageContent = await generateMushafPageContent(pageNum);
      return NextResponse.json({
        success: true,
        data: pageContent
      });
    }
    
    // Get juz page range
    if (juz) {
      const juzNum = parseInt(juz);
      if (juzNum < 1 || juzNum > 30) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Invalid juz number. Must be between 1-30' 
          },
          { status: 400 }
        );
      }
      
      const juzMapping = JUZ_TO_PAGE_MAPPING[juzNum];
      return NextResponse.json({
        success: true,
        data: {
          juz: juzNum,
          pageRange: juzMapping,
          totalPages: juzMapping.end - juzMapping.start + 1,
          pages: Array.from(
            { length: juzMapping.end - juzMapping.start + 1 }, 
            (_, i) => juzMapping.start + i
          )
        }
      });
    }
    
    // Get juz mapping overview
    if (action === 'mapping') {
      return NextResponse.json({
        success: true,
        data: {
          juzMapping: JUZ_TO_PAGE_MAPPING,
          totalPages: 604,
          totalJuz: 30,

          summary: Object.entries(JUZ_TO_PAGE_MAPPING).map(([juzNum, info]) => ({
            juz: parseInt(juzNum),
            pageRange: `${info.start}-${info.end}`,
            totalPages: info.end - info.start + 1,
            surah: info.surah
          }))
        }
      });
    }

    // Default: return mushaf info
    return NextResponse.json({
      success: true,
      data: {
        message: 'Mushaf Digital API - Rasm Utsmani',
        endpoints: {
          getPage: '/api/mushaf?page={pageNumber}',
          getJuz: '/api/mushaf?juz={juzNumber}',
          getMapping: '/api/mushaf?action=mapping'
        },
        totalPages: 604,
        totalJuz: 30,
        note: 'Semua halaman menggunakan API alquran.cloud dengan data per-halaman yang akurat'
      }
    });

  } catch (error) {
    console.error('Error fetching mushaf data:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch mushaf data' 
      },
      { status: 500 }
    );
  }
}
