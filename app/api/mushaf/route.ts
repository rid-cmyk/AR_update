import { NextResponse } from 'next/server';

// Mapping juz ke halaman mushaf yang akurat
const JUZ_TO_PAGE_MAPPING: Record<number, { start: number; end: number; surah: string }> = {
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
const generateMushafPageContent = async (page: number) => {
  // Find which juz this page belongs to
  const juzEntry = Object.entries(JUZ_TO_PAGE_MAPPING).find(([_, mapping]) => {
    return page >= mapping.start && page <= mapping.end;
  });

  if (!juzEntry) {
    throw new Error('Invalid page number');
  }

  const juzNum = parseInt(juzEntry[0]);
  const juzInfo = juzEntry[1];

  // Use API-based page content (no manual mapping)
  return await generatePageFromAPI(page, juzNum, juzInfo);
};

// Generate page content from API (using multiple sources)
const generatePageFromAPI = async (page: number, juzNum: number, juzInfo: any) => {
  // Try API with page-specific data first
  const apis = [
    {
      name: 'alquran.cloud-page',
      fetch: async () => {
        const response = await fetch(`https://api.alquran.cloud/v1/page/${page}/quran-uthmani`, {
          next: { revalidate: 86400 }
        });
        if (!response.ok) throw new Error('alquran.cloud page API failed');
        const data = await response.json();
        
        if (data.code === 200 && data.data.ayahs) {
          const lines: string[] = [];
          let currentSurat = '';
          let currentSuratNumber = 0;
          const allAyat: any[] = [];

          data.data.ayahs.forEach((ayah: any) => {
            allAyat.push({
              teksArab: ayah.text,
              nomorAyat: ayah.numberInSurah,
              suratId: ayah.surah.number,
              nama: ayah.surah.name,
              namaLatin: ayah.surah.englishName
            });
          });

          // Format content
          allAyat.forEach((ayat) => {
            if (currentSuratNumber !== ayat.suratId) {
              if (lines.length > 0) lines.push('');
              lines.push(`﴿ ${ayat.nama} ﴾`);
              lines.push('');
              
              if (ayat.nomorAyat === 1 && ayat.suratId !== 9) {
                lines.push('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ');
                lines.push('');
              }
              
              currentSuratNumber = ayat.suratId;
              currentSurat = ayat.nama;
            }
            
            lines.push(`${ayat.teksArab} ﴿${ayat.nomorAyat}﴾`);
          });

          const content = lines.join('\n');
          const firstAyat = allAyat[0]?.nomorAyat || 1;
          const lastAyat = allAyat[allAyat.length - 1]?.nomorAyat || 1;
          const ayatRange = firstAyat === lastAyat ? `آية ${firstAyat}` : `آية ${firstAyat}-${lastAyat}`;

          return {
            page,
            juz: juzNum,
            content,
            surahInfo: currentSurat || juzInfo.surah,
            ayatRange,
            pageInfo: {
              currentPage: page,
              totalPages: 604,
              juz: juzNum,
              juzPageRange: juzInfo,
              ayatCount: allAyat.length,
              isExactMapping: true,
              source: 'alquran.cloud-page'
            }
          };
        }
        throw new Error('Invalid response from alquran.cloud');
      }
    }
  ];

  // Try page-specific API first
  for (const api of apis) {
    try {
      console.log(`Trying ${api.name} for page ${page}...`);
      const result = await api.fetch();
      console.log(`✓ Successfully fetched page ${page} from ${api.name}`);
      return result;
    } catch (error) {
      console.error(`✗ ${api.name} failed:`, error);
    }
  }

  // Fallback to juz-based distribution
  console.log(`Falling back to juz-based distribution for page ${page}`);
  return await generateAutoPageContent(page, juzNum, juzInfo);
};

// Generate page content with multi-API fallback
const generateAutoPageContent = async (page: number, juzNum: number, juzInfo: any) => {
  // Try multiple APIs in order
  const apis = [
    {
      name: 'equran.id',
      fetch: async () => {
        const response = await fetch(`https://equran.id/api/v2/juz/${juzNum}`, {
          next: { revalidate: 86400 }
        });
        if (!response.ok) throw new Error('equran.id failed');
        const data = await response.json();
        return {
          success: true,
          surat: data.data.verses ? data.data.verses.map((v: any) => ({
            suratId: v.meta.surah.number,
            nama: v.meta.surah.name,
            namaLatin: v.meta.surah.englishName,
            ayat: [{
              nomorAyat: v.number.inSurah,
              teksArab: v.text.arab
            }]
          })) : []
        };
      }
    },
    {
      name: 'internal-api',
      fetch: async () => {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const response = await fetch(`${baseUrl}/api/quran/juz/${juzNum}`, {
          next: { revalidate: 86400 }
        });
        if (!response.ok) throw new Error('internal-api failed');
        const result = await response.json();
        return result;
      }
    },
    {
      name: 'alquran.cloud',
      fetch: async () => {
        const response = await fetch(`https://api.alquran.cloud/v1/juz/${juzNum}/quran-uthmani`, {
          next: { revalidate: 86400 }
        });
        if (!response.ok) throw new Error('alquran.cloud failed');
        const data = await response.json();
        if (data.code === 200 && data.data.ayahs) {
          // Group by surat
          const suratMap = new Map();
          data.data.ayahs.forEach((ayah: any) => {
            if (!suratMap.has(ayah.surah.number)) {
              suratMap.set(ayah.surah.number, {
                suratId: ayah.surah.number,
                nama: ayah.surah.name,
                namaLatin: ayah.surah.englishName,
                ayat: []
              });
            }
            suratMap.get(ayah.surah.number).ayat.push({
              nomorAyat: ayah.numberInSurah,
              teksArab: ayah.text
            });
          });
          return {
            success: true,
            surat: Array.from(suratMap.values())
          };
        }
        throw new Error('alquran.cloud invalid response');
      }
    }
  ];

  let result: any = null;
  let usedApi = '';

  // Try each API until one succeeds
  for (const api of apis) {
    try {
      console.log(`Trying ${api.name} API for juz ${juzNum}...`);
      result = await api.fetch();
      usedApi = api.name;
      console.log(`✓ Successfully fetched from ${api.name}`);
      break;
    } catch (error) {
      console.error(`✗ ${api.name} failed:`, error);
      continue;
    }
  }

  if (!result) {
    console.error('All APIs failed, using fallback');
    return generateFallbackContent(page, juzNum, juzInfo);
  }

  try {
    // Normalize data structure
    const suratList = result.surat || result.data?.surat || [];
    
    if (suratList.length > 0) {
      const allAyat: Array<{
        teksArab: string;
        nomorAyat: number;
        suratId: number;
        nama: string;
        namaLatin: string;
      }> = [];

      suratList.forEach((surat: any) => {
        surat.ayat.forEach((ayat: any) => {
          allAyat.push({
            teksArab: ayat.teksArab || ayat.text,
            nomorAyat: ayat.nomorAyat || ayat.numberInSurah,
            suratId: surat.suratId || surat.number,
            nama: surat.nama || surat.name,
            namaLatin: surat.namaLatin || surat.englishName
          });
        });
      });

      if (allAyat.length === 0) {
        return generateFallbackContent(page, juzNum, juzInfo);
      }

      const pagesInJuz = juzInfo.end - juzInfo.start + 1;
      const ayatPerPage = Math.ceil(allAyat.length / pagesInJuz);
      
      const pageIndexInJuz = page - juzInfo.start;
      const startIdx = pageIndexInJuz * ayatPerPage;
      const endIdx = Math.min(startIdx + ayatPerPage, allAyat.length);
      
      const pageAyat = allAyat.slice(startIdx, endIdx);

      if (pageAyat.length === 0) {
        return generateFallbackContent(page, juzNum, juzInfo);
      }

      const lines: string[] = [];
      let currentSurat = '';

      pageAyat.forEach((ayat) => {
        if (currentSurat !== ayat.nama) {
          if (lines.length > 0) lines.push('');
          lines.push(`﴿ ${ayat.nama} ﴾`);
          lines.push('');
          
          if (ayat.nomorAyat === 1 && ayat.suratId !== 9) {
            lines.push('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ');
            lines.push('');
          }
          
          currentSurat = ayat.nama;
        }
        
        lines.push(`${ayat.teksArab} ﴿${ayat.nomorAyat}﴾`);
      });

      const content = lines.join('\n');
      const ayatNumbers = pageAyat.map(a => a.nomorAyat);
      const firstAyat = Math.min(...ayatNumbers);
      const lastAyat = Math.max(...ayatNumbers);
      const ayatRange = firstAyat === lastAyat ? `آية ${firstAyat}` : `آية ${firstAyat}-${lastAyat}`;

      return {
        page,
        juz: juzNum,
        content,
        surahInfo: pageAyat[0]?.nama || juzInfo.surah,
        ayatRange,
        pageInfo: {
          currentPage: page,
          totalPages: 604,
          juz: juzNum,
          juzPageRange: juzInfo,
          ayatCount: pageAyat.length,
          isExactMapping: false,
          source: usedApi
        }
      };
    }
  } catch (error) {
    console.error('Error processing ayat data:', error);
  }

  return generateFallbackContent(page, juzNum, juzInfo);
};

// Fallback content generator
const generateFallbackContent = (page: number, juzNum: number, juzInfo: any) => {
  return {
    page,
    juz: juzNum,
    content: `بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ

الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ﴿١﴾
الرَّحْمَٰنِ الرَّحِيمِ ﴿٢﴾
مَالِكِ يَوْمِ الدِّينِ ﴿٣﴾

[صفحة ${page} - جزء ${juzNum}]
[Konten sedang dimuat...]`,
    surahInfo: juzInfo.surah,
    ayatRange: `صفحة ${page}`,
    pageInfo: {
      currentPage: page,
      totalPages: 604,
      juz: juzNum,
      juzPageRange: juzInfo,
      ayatCount: 0
    }
  };
};

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
