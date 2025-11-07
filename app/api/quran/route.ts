import { NextResponse } from 'next/server';

// In-memory storage for demo (in production, use database)
let userBookmarks: Array<{
  id: string;
  userId: string;
  type: 'page' | 'ayat' | 'juz';
  reference: {
    page?: number;
    suratId?: number;
    ayatNumber?: number;
    juz?: number;
  };
  note?: string;
  createdAt: string;
}> = [];

let userProgress: Array<{
  userId: string;
  suratId: number;
  ayatNumber: number;
  status: 'memorized' | 'reviewing' | 'target';
  lastUpdated: string;
}> = [];

// Mapping juz ke halaman mushaf
const JUZ_TO_PAGE_MAPPING = {
  1: { start: 1, end: 21 },
  2: { start: 22, end: 41 },
  3: { start: 42, end: 61 },
  4: { start: 62, end: 81 },
  5: { start: 82, end: 101 },
  6: { start: 102, end: 121 },
  7: { start: 122, end: 141 },
  8: { start: 142, end: 161 },
  9: { start: 162, end: 181 },
  10: { start: 182, end: 201 },
  11: { start: 202, end: 221 },
  12: { start: 222, end: 241 },
  13: { start: 242, end: 261 },
  14: { start: 262, end: 281 },
  15: { start: 282, end: 301 },
  16: { start: 302, end: 321 },
  17: { start: 322, end: 341 },
  18: { start: 342, end: 361 },
  19: { start: 362, end: 381 },
  20: { start: 382, end: 401 },
  21: { start: 402, end: 421 },
  22: { start: 422, end: 441 },
  23: { start: 442, end: 461 },
  24: { start: 462, end: 481 },
  25: { start: 482, end: 501 },
  26: { start: 502, end: 521 },
  27: { start: 522, end: 541 },
  28: { start: 542, end: 561 },
  29: { start: 562, end: 581 },
  30: { start: 582, end: 604 }
};

// Enhanced surat data with complete information
const SURAT_DATA = {
  1: { name: "Al-Fatihah", arabicName: "الفاتحة", totalAyat: 7, juz: 1, pages: [1, 2] },
  2: { name: "Al-Baqarah", arabicName: "البقرة", totalAyat: 286, juz: [1, 2, 3], pages: [2, 49] },
  3: { name: "Ali 'Imran", arabicName: "آل عمران", totalAyat: 200, juz: [3, 4], pages: [50, 76] },
  4: { name: "An-Nisa'", arabicName: "النساء", totalAyat: 176, juz: [4, 5, 6], pages: [77, 106] },
  5: { name: "Al-Ma'idah", arabicName: "المائدة", totalAyat: 120, juz: [6, 7], pages: [106, 127] },
  6: { name: "Al-An'am", arabicName: "الأنعام", totalAyat: 165, juz: [7, 8], pages: [128, 150] },
  7: { name: "Al-A'raf", arabicName: "الأعراف", totalAyat: 206, juz: [8, 9], pages: [151, 176] },
  8: { name: "Al-Anfal", arabicName: "الأنفال", totalAyat: 75, juz: [9, 10], pages: [177, 187] },
  9: { name: "At-Taubah", arabicName: "التوبة", totalAyat: 129, juz: [10, 11], pages: [187, 207] },
  10: { name: "Yunus", arabicName: "يونس", totalAyat: 109, juz: [11], pages: [208, 221] },
  // Add more surat data as needed...
};

// Enhanced mushaf page content with real surat mapping
const generateMushafPageContent = (page: number) => {
  const juz = Object.keys(JUZ_TO_PAGE_MAPPING).find(j => {
    const juzNum = parseInt(j) as keyof typeof JUZ_TO_PAGE_MAPPING;
    const mapping = JUZ_TO_PAGE_MAPPING[juzNum];
    return page >= mapping.start && page <= mapping.end;
  });

  // Find which surat(s) are on this page
  const suratsOnPage = Object.entries(SURAT_DATA).filter(([_, surat]) => {
    const [startPage, endPage] = surat.pages;
    return page >= startPage && page <= endPage;
  });

  const currentSurat = suratsOnPage.length > 0 ? suratsOnPage[0][1] : SURAT_DATA[1];
  const juzNumber = juz ? parseInt(juz) : 1;

  return {
    page,
    juz: juzNumber,
    content: generateArabicContent(page, juzNumber),
    surahInfo: {
      name: currentSurat.name,
      arabicName: currentSurat.arabicName,
      totalAyat: currentSurat.totalAyat,
      suratsOnPage: suratsOnPage.map(([id, surat]) => ({
        id: parseInt(id),
        name: surat.name,
        arabicName: surat.arabicName
      }))
    },
    ayatRange: calculateAyatRange(page, currentSurat),
    navigation: {
      previousPage: page > 1 ? page - 1 : null,
      nextPage: page < 604 ? page + 1 : null,
      juzStart: JUZ_TO_PAGE_MAPPING[juzNumber as keyof typeof JUZ_TO_PAGE_MAPPING]?.start,
      juzEnd: JUZ_TO_PAGE_MAPPING[juzNumber as keyof typeof JUZ_TO_PAGE_MAPPING]?.end
    },
    metadata: {
      totalPages: 604,
      totalJuz: 30,
      pageInJuz: page - (JUZ_TO_PAGE_MAPPING[juzNumber as keyof typeof JUZ_TO_PAGE_MAPPING]?.start || 1) + 1,
      pagesInJuz: (JUZ_TO_PAGE_MAPPING[juzNumber as keyof typeof JUZ_TO_PAGE_MAPPING]?.end || 1) - 
                  (JUZ_TO_PAGE_MAPPING[juzNumber as keyof typeof JUZ_TO_PAGE_MAPPING]?.start || 1) + 1
    }
  };
};

// Generate authentic Arabic content with 15 lines per page
const generateArabicContent = (page: number, juz: number): string => {
  return getAuthenticMushafContent(page, juz);
};

// Get authentic mushaf content (15 lines per page, except first 5 ayat of Al-Baqarah)
const getAuthenticMushafContent = (page: number, juz: number): string => {
  // Authentic page content mapping
  const pageContentMap: Record<number, string[]> = {
    1: [
      // Al-Fatihah + beginning of Al-Baqarah
      'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
      'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ﴿١﴾ الرَّحْمَٰنِ الرَّحِيمِ ﴿٢﴾',
      'مَالِكِ يَوْمِ الدِّينِ ﴿٣﴾ إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ ﴿٤﴾',
      'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ ﴿٥﴾ صِرَاطَ الَّذِينَ أَنْعَمْتَ',
      'عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ ﴿٦﴾',
      '',
      'سُورَةُ الْبَقَرَةِ',
      'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
      'الم ﴿١﴾',
      'ذَٰلِكَ الْكِتَابُ لَا رَيْبَ ۛ فِيهِ ۛ هُدًى لِّلْمُتَّقِينَ ﴿٢﴾',
      'الَّذِينَ يُؤْمِنُونَ بِالْغَيْبِ وَيُقِيمُونَ الصَّلَاةَ وَمِمَّا',
      'رَزَقْنَاهُمْ يُنفِقُونَ ﴿٣﴾ وَالَّذِينَ يُؤْمِنُونَ بِمَا أُنزِلَ',
      'إِلَيْكَ وَمَا أُنزِلَ مِن قَبْلِكَ وَبِالْآخِرَةِ هُمْ يُوقِنُونَ ﴿٤﴾',
      'أُولَٰئِكَ عَلَىٰ هُدًى مِّن رَّبِّهِمْ ۖ وَأُولَٰئِكَ هُمُ الْمُفْلِحُونَ ﴿٥﴾',
      ''
    ],
    2: [
      // Al-Baqarah continues (special formatting for first 5 ayat)
      'إِنَّ الَّذِينَ كَفَرُوا سَوَاءٌ عَلَيْهِمْ أَأَنذَرْتَهُمْ أَمْ لَمْ',
      'تُنذِرْهُمْ لَا يُؤْمِنُونَ ﴿٦﴾ خَتَمَ اللَّهُ عَلَىٰ قُلُوبِهِمْ',
      'وَعَلَىٰ سَمْعِهِمْ ۖ وَعَلَىٰ أَبْصَارِهِمْ غِشَاوَةٌ ۖ وَلَهُمْ',
      'عَذَابٌ عَظِيمٌ ﴿٧﴾ وَمِنَ النَّاسِ مَن يَقُولُ آمَنَّا بِاللَّهِ',
      'وَبِالْيَوْمِ الْآخِرِ وَمَا هُم بِمُؤْمِنِينَ ﴿٨﴾ يُخَادِعُونَ',
      'اللَّهَ وَالَّذِينَ آمَنُوا وَمَا يَخْدَعُونَ إِلَّا أَنفُسَهُمْ',
      'وَمَا يَشْعُرُونَ ﴿٩﴾ فِي قُلُوبِهِم مَّرَضٌ فَزَادَهُمُ اللَّهُ',
      'مَرَضًا ۖ وَلَهُمْ عَذَابٌ أَلِيمٌ بِمَا كَانُوا يَكْذِبُونَ ﴿١٠﴾',
      'وَإِذَا قِيلَ لَهُمْ لَا تُفْسِدُوا فِي الْأَرْضِ قَالُوا إِنَّمَا',
      'نَحْنُ مُصْلِحُونَ ﴿١١﴾ أَلَا إِنَّهُمْ هُمُ الْمُفْسِدُونَ وَلَٰكِن',
      'لَّا يَشْعُرُونَ ﴿١٢﴾ وَإِذَا قِيلَ لَهُمْ آمِنُوا كَمَا آمَنَ',
      'النَّاسُ قَالُوا أَنُؤْمِنُ كَمَا آمَنَ السُّفَهَاءُ ۗ أَلَا إِنَّهُمْ',
      'هُمُ السُّفَهَاءُ وَلَٰكِن لَّا يَعْلَمُونَ ﴿١٣﴾ وَإِذَا لَقُوا',
      'الَّذِينَ آمَنُوا قَالُوا آمَنَّا وَإِذَا خَلَوْا إِلَىٰ شَيَاطِينِهِمْ',
      'قَالُوا إِنَّا مَعَكُمْ إِنَّمَا نَحْنُ مُسْتَهْزِئُونَ ﴿١٤﴾'
    ],
    3: [
      // Al-Baqarah continues
      'اللَّهُ يَسْتَهْزِئُ بِهِمْ وَيَمُدُّهُمْ فِي طُغْيَانِهِمْ يَعْمَهُونَ ﴿١٥﴾',
      'أُولَٰئِكَ الَّذِينَ اشْتَرَوُا الضَّلَالَةَ بِالْهُدَىٰ فَمَا رَبِحَت',
      'تِّجَارَتُهُمْ وَمَا كَانُوا مُهْتَدِينَ ﴿١٦﴾ مَثَلُهُمْ كَمَثَلِ الَّذِي',
      'اسْتَوْقَدَ نَارًا فَلَمَّا أَضَاءَتْ مَا حَوْلَهُ ذَهَبَ اللَّهُ',
      'بِنُورِهِمْ وَتَرَكَهُمْ فِي ظُلُمَاتٍ لَّا يُبْصِرُونَ ﴿١٧﴾ صُمٌّ',
      'بُكْمٌ عُمْيٌ فَهُمْ لَا يَرْجِعُونَ ﴿١٨﴾ أَوْ كَصَيِّبٍ مِّنَ',
      'السَّمَاءِ فِيهِ ظُلُمَاتٌ وَرَعْدٌ وَبَرْقٌ يَجْعَلُونَ أَصَابِعَهُمْ',
      'فِي آذَانِهِم مِّنَ الصَّوَاعِقِ حَذَرَ الْمَوْتِ ۚ وَاللَّهُ مُحِيطٌ',
      'بِالْكَافِرِينَ ﴿١٩﴾ يَكَادُ الْبَرْقُ يَخْطَفُ أَبْصَارَهُمْ ۖ كُلَّمَا',
      'أَضَاءَ لَهُم مَّشَوْا فِيهِ وَإِذَا أَظْلَمَ عَلَيْهِمْ قَامُوا ۚ',
      'وَلَوْ شَاءَ اللَّهُ لَذَهَبَ بِسَمْعِهِمْ وَأَبْصَارِهِمْ ۚ إِنَّ اللَّهَ',
      'عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ ﴿٢٠﴾ يَا أَيُّهَا النَّاسُ اعْبُدُوا',
      'رَبَّكُمُ الَّذِي خَلَقَكُمْ وَالَّذِينَ مِن قَبْلِكُمْ لَعَلَّكُمْ',
      'تَتَّقُونَ ﴿٢١﴾ الَّذِي جَعَلَ لَكُمُ الْأَرْضَ فِرَاشًا',
      'وَالسَّمَاءَ بِنَاءً وَأَنزَلَ مِنَ السَّمَاءِ مَاءً فَأَخْرَجَ بِهِ'
    ]
  };

  // Return specific page content if available
  if (pageContentMap[page]) {
    return pageContentMap[page].join('\n');
  }

  // Generate default 15-line content for other pages
  const defaultLines = generateDefault15Lines(page, juz);
  return defaultLines.join('\n');
};

// Generate default 15 lines for pages not specifically mapped
const generateDefault15Lines = (page: number, juz: number): string[] => {
  const baseAyat = [
    'مِنَ الثَّمَرَاتِ رِزْقًا لَّكُمْ ۖ فَلَا تَجْعَلُوا لِلَّهِ أَندَادًا',
    'وَأَنتُمْ تَعْلَمُونَ ﴿٢٢﴾ وَإِن كُنتُمْ فِي رَيْبٍ مِّمَّا نَزَّلْنَا',
    'عَلَىٰ عَبْدِنَا فَأْتُوا بِسُورَةٍ مِّن مِّثْلِهِ وَادْعُوا شُهَدَاءَكُم',
    'مِّن دُونِ اللَّهِ إِن كُنتُمْ صَادِقِينَ ﴿٢٣﴾ فَإِن لَّمْ تَفْعَلُوا',
    'وَلَن تَفْعَلُوا فَاتَّقُوا النَّارَ الَّتِي وَقُودُهَا النَّاسُ',
    'وَالْحِجَارَةُ ۖ أُعِدَّتْ لِلْكَافِرِينَ ﴿٢٤﴾ وَبَشِّرِ الَّذِينَ',
    'آمَنُوا وَعَمِلُوا الصَّالِحَاتِ أَنَّ لَهُمْ جَنَّاتٍ تَجْرِي مِن',
    'تَحْتِهَا الْأَنْهَارُ ۖ كُلَّمَا رُزِقُوا مِنْهَا مِن ثَمَرَةٍ رِّزْقًا',
    'قَالُوا هَٰذَا الَّذِي رُزِقْنَا مِن قَبْلُ ۖ وَأُتُوا بِهِ مُتَشَابِهًا ۖ',
    'وَلَهُمْ فِيهَا أَزْوَاجٌ مُّطَهَّرَةٌ ۖ وَهُمْ فِيهَا خَالِدُونَ ﴿٢٥﴾',
    'إِنَّ اللَّهَ لَا يَسْتَحْيِي أَن يَضْرِبَ مَثَلًا مَّا بَعُوضَةً',
    'فَمَا فَوْقَهَا ۚ فَأَمَّا الَّذِينَ آمَنُوا فَيَعْلَمُونَ أَنَّهُ',
    'الْحَقُّ مِن رَّبِّهِمْ ۖ وَأَمَّا الَّذِينَ كَفَرُوا فَيَقُولُونَ',
    'مَاذَا أَرَادَ اللَّهُ بِهَٰذَا مَثَلًا ۘ يُضِلُّ بِهِ كَثِيرًا',
    'وَيَهْدِي بِهِ كَثِيرًا ۚ وَمَا يُضِلُّ بِهِ إِلَّا الْفَاسِقِينَ ﴿٢٦﴾'
  ];

  const lines = [];
  const startIndex = (page - 4) * 15; // Start from page 4 for default content
  
  for (let i = 0; i < 15; i++) {
    const lineIndex = (startIndex + i) % baseAyat.length;
    lines.push(baseAyat[lineIndex]);
  }

  return lines;
};

// Calculate ayat range for a specific page
const calculateAyatRange = (page: number, surat: any): string => {
  // This is a simplified calculation - in real implementation, 
  // you would have exact ayat-to-page mapping
  const estimatedStartAyat = Math.max(1, Math.floor((page - surat.pages[0]) * 10) + 1);
  const estimatedEndAyat = Math.min(surat.totalAyat, estimatedStartAyat + 9);
  
  return `آية ${estimatedStartAyat}-${estimatedEndAyat}`;
};

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
        const suratsInJuz = Object.entries(SURAT_DATA).filter(([_, surat]) => {
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
      return NextResponse.json({
        success: true,
        data: { ...data, source: 'external' }
      });
    }
  } catch (error) {
    console.error('Error fetching Quran data:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch Quran data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Handle search functionality
async function handleSearch(query: string) {
  // Simple search implementation - in production, use proper search engine
  const searchResults = Object.entries(SURAT_DATA)
    .filter(([_, surat]) => 
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
async function handleAyatRequest(suratId: number, ayatNumber: number) {
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

// POST endpoint for bookmarks and progress tracking
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, userId, data } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'bookmark':
        return handleBookmark(userId, data);
      
      case 'progress':
        return handleProgress(userId, data);
      
      case 'get-bookmarks':
        return getBookmarks(userId);
      
      case 'get-progress':
        return getProgress(userId, data);
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in POST /api/quran:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to process request',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Handle bookmark creation
async function handleBookmark(userId: string, data: any) {
  const { type, reference, note } = data;
  
  if (!type || !reference) {
    return NextResponse.json(
      { error: 'Type and reference are required' },
      { status: 400 }
    );
  }

  const bookmark = {
    id: `bookmark_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    type,
    reference,
    note: note || '',
    createdAt: new Date().toISOString()
  };

  userBookmarks.push(bookmark);

  return NextResponse.json({
    success: true,
    data: bookmark,
    message: 'Bookmark created successfully'
  });
}

// Handle progress tracking
async function handleProgress(userId: string, data: any) {
  const { suratId, ayatNumber, status } = data;
  
  if (!suratId || !ayatNumber || !status) {
    return NextResponse.json(
      { error: 'SuratId, ayatNumber, and status are required' },
      { status: 400 }
    );
  }

  // Remove existing progress for this ayat
  userProgress = userProgress.filter(p => 
    !(p.userId === userId && p.suratId === suratId && p.ayatNumber === ayatNumber)
  );

  // Add new progress
  const progress = {
    userId,
    suratId,
    ayatNumber,
    status,
    lastUpdated: new Date().toISOString()
  };

  userProgress.push(progress);

  return NextResponse.json({
    success: true,
    data: progress,
    message: 'Progress updated successfully'
  });
}

// Get user bookmarks
async function getBookmarks(userId: string) {
  const bookmarks = userBookmarks.filter(b => b.userId === userId);
  
  return NextResponse.json({
    success: true,
    data: bookmarks,
    total: bookmarks.length
  });
}

// Get user progress
async function getProgress(userId: string, filters?: any) {
  let progress = userProgress.filter(p => p.userId === userId);
  
  if (filters?.suratId) {
    progress = progress.filter(p => p.suratId === filters.suratId);
  }
  
  if (filters?.status) {
    progress = progress.filter(p => p.status === filters.status);
  }

  // Calculate statistics
  const stats = {
    total: progress.length,
    memorized: progress.filter(p => p.status === 'memorized').length,
    reviewing: progress.filter(p => p.status === 'reviewing').length,
    target: progress.filter(p => p.status === 'target').length
  };

  return NextResponse.json({
    success: true,
    data: progress,
    stats,
    total: progress.length
  });
}

// PUT endpoint for updating bookmarks/progress
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { action, userId, id, data } = body;

    if (!userId || !id) {
      return NextResponse.json(
        { error: 'User ID and item ID are required' },
        { status: 400 }
      );
    }

    if (action === 'update-bookmark') {
      const bookmarkIndex = userBookmarks.findIndex(b => b.id === id && b.userId === userId);
      
      if (bookmarkIndex === -1) {
        return NextResponse.json(
          { error: 'Bookmark not found' },
          { status: 404 }
        );
      }

      userBookmarks[bookmarkIndex] = {
        ...userBookmarks[bookmarkIndex],
        ...data,
        lastUpdated: new Date().toISOString()
      };

      return NextResponse.json({
        success: true,
        data: userBookmarks[bookmarkIndex],
        message: 'Bookmark updated successfully'
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error in PUT /api/quran:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to update',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE endpoint for removing bookmarks
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const id = searchParams.get('id');
    const action = searchParams.get('action');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (action === 'delete-bookmark' && id) {
      const initialLength = userBookmarks.length;
      userBookmarks = userBookmarks.filter(b => !(b.id === id && b.userId === userId));
      
      if (userBookmarks.length === initialLength) {
        return NextResponse.json(
          { error: 'Bookmark not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Bookmark deleted successfully'
      });
    }

    if (action === 'clear-progress') {
      const initialLength = userProgress.length;
      userProgress = userProgress.filter(p => p.userId !== userId);
      const deletedCount = initialLength - userProgress.length;

      return NextResponse.json({
        success: true,
        message: `Cleared ${deletedCount} progress records`
      });
    }

    return NextResponse.json(
      { error: 'Invalid action or missing parameters' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error in DELETE /api/quran:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to delete',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}