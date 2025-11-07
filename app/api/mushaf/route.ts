import { NextResponse } from 'next/server';

// Mapping juz ke halaman mushaf yang akurat
const JUZ_TO_PAGE_MAPPING = {
  1: { start: 1, end: 21, surah: 'Al-Fatihah - Al-Baqarah' },
  2: { start: 22, end: 41, surah: 'Al-Baqarah' },
  3: { start: 42, end: 61, surah: 'Al-Baqarah - Ali Imran' },
  4: { start: 62, end: 81, surah: 'Ali Imran - An-Nisa' },
  5: { start: 82, end: 101, surah: 'An-Nisa' },
  6: { start: 102, end: 121, surah: 'An-Nisa - Al-Maidah' },
  7: { start: 122, end: 141, surah: 'Al-Maidah - Al-An\'am' },
  8: { start: 142, end: 161, surah: 'Al-An\'am - Al-A\'raf' },
  9: { start: 162, end: 181, surah: 'Al-A\'raf - Al-Anfal' },
  10: { start: 182, end: 201, surah: 'Al-Anfal - At-Taubah' },
  11: { start: 202, end: 221, surah: 'At-Taubah - Yunus' },
  12: { start: 222, end: 241, surah: 'Yunus - Hud' },
  13: { start: 242, end: 261, surah: 'Hud - Yusuf' },
  14: { start: 262, end: 281, surah: 'Yusuf - Ar-Ra\'d' },
  15: { start: 282, end: 301, surah: 'Ar-Ra\'d - Ibrahim' },
  16: { start: 302, end: 321, surah: 'Ibrahim - Al-Hijr' },
  17: { start: 322, end: 341, surah: 'Al-Hijr - An-Nahl' },
  18: { start: 342, end: 361, surah: 'An-Nahl - Al-Isra' },
  19: { start: 362, end: 381, surah: 'Al-Isra - Al-Kahf' },
  20: { start: 382, end: 401, surah: 'Al-Kahf - Maryam' },
  21: { start: 402, end: 421, surah: 'Maryam - Ta-Ha' },
  22: { start: 422, end: 441, surah: 'Ta-Ha - Al-Anbiya' },
  23: { start: 442, end: 461, surah: 'Al-Anbiya - Al-Hajj' },
  24: { start: 462, end: 481, surah: 'Al-Hajj - Al-Mu\'minun' },
  25: { start: 482, end: 501, surah: 'Al-Mu\'minun - An-Nur' },
  26: { start: 502, end: 521, surah: 'An-Nur - Al-Furqan' },
  27: { start: 522, end: 541, surah: 'Al-Furqan - Ash-Shu\'ara' },
  28: { start: 542, end: 561, surah: 'Ash-Shu\'ara - An-Naml' },
  29: { start: 562, end: 581, surah: 'An-Naml - Al-Qasas' },
  30: { start: 582, end: 604, surah: 'Al-Qasas - An-Nas' }
};

// Generate mushaf page content
const generateMushafPageContent = (page: number) => {
  const juz = Object.keys(JUZ_TO_PAGE_MAPPING).find(j => {
    const mapping = JUZ_TO_PAGE_MAPPING[j as any];
    return page >= mapping.start && page <= mapping.end;
  });

  const juzNum = juz ? parseInt(juz) : 1;
  const juzInfo = JUZ_TO_PAGE_MAPPING[juzNum as keyof typeof JUZ_TO_PAGE_MAPPING];

  return {
    page,
    juz: juzNum,
    content: `بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ

الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ
الرَّحْمَٰنِ الرَّحِيمِ
مَالِكِ يَوْمِ الدِّينِ
إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ
اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ
صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ

وَالَّذِينَ يُؤْمِنُونَ بِمَا أُنزِلَ إِلَيْكَ وَمَا أُنزِلَ مِن قَبْلِكَ وَبِالْآخِرَةِ هُمْ يُوقِنُونَ
أُولَٰئِكَ عَلَىٰ هُدًى مِّن رَّبِّهِمْ ۖ وَأُولَٰئِكَ هُمُ الْمُفْلِحُونَ

[صفحة ${page} - جزء ${juzNum}]
[محتوى المصحف لهذه الصفحة...]

إِنَّ الَّذِينَ كَفَرُوا سَوَاءٌ عَلَيْهِمْ أَأَنذَرْتَهُمْ أَمْ لَمْ تُنذِرْهُمْ لَا يُؤْمِنُونَ
خَتَمَ اللَّهُ عَلَىٰ قُلُوبِهِمْ وَعَلَىٰ سَمْعِهِمْ ۖ وَعَلَىٰ أَبْصَارِهِمْ غِشَاوَةٌ ۖ وَلَهُمْ عَذَابٌ عَظِيمٌ`,
    surahInfo: juzInfo.surah,
    ayatRange: `صفحة ${page}`,
    pageInfo: {
      currentPage: page,
      totalPages: 604,
      juz: juzNum,
      juzPageRange: juzInfo
    }
  };
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page');
    const juz = searchParams.get('juz');
    const action = searchParams.get('action');

    // Get specific mushaf page
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
      
      const pageContent = generateMushafPageContent(pageNum);
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
      
      const juzMapping = JUZ_TO_PAGE_MAPPING[juzNum as keyof typeof JUZ_TO_PAGE_MAPPING];
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
        message: 'Mushaf Digital API',
        endpoints: {
          getPage: '/api/mushaf?page={pageNumber}',
          getJuz: '/api/mushaf?juz={juzNumber}',
          getMapping: '/api/mushaf?action=mapping'
        },
        totalPages: 604,
        totalJuz: 30
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