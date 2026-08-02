'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, Typography, Button, Spin, Alert, Space, Row, Col, Select, message } from 'antd'
import { 
  BookOutlined, 
  LeftOutlined, 
  RightOutlined, 
  ZoomInOutlined, 
  ZoomOutOutlined 
} from '@ant-design/icons'

const { Title, Text } = Typography
const { Option } = Select

const toArabicDigits = (num: number) => num.toString().replace(/\d/g, (d: any) => '٠١٢٣٤٥٦٧٨٩'[d]);
const toEnglishDigits = (str: string) => str.replace(/[٠-٩]/g, (d: any) => '0123456789'['٠١٢٣٤٥٦٧٨٩'.indexOf(d)]);

const JUZ_TO_PAGE_MAPPING: Record<number, { start: number; end: number }> = {
  1: { start: 1, end: 21 }, 2: { start: 22, end: 41 }, 3: { start: 42, end: 61 },
  4: { start: 62, end: 81 }, 5: { start: 82, end: 101 }, 6: { start: 102, end: 121 },
  7: { start: 122, end: 141 }, 8: { start: 142, end: 161 }, 9: { start: 162, end: 181 },
  10: { start: 182, end: 201 }, 11: { start: 202, end: 221 }, 12: { start: 222, end: 241 },
  13: { start: 242, end: 261 }, 14: { start: 262, end: 281 }, 15: { start: 282, end: 301 },
  16: { start: 302, end: 321 }, 17: { start: 322, end: 341 }, 18: { start: 342, end: 361 },
  19: { start: 362, end: 381 }, 20: { start: 382, end: 401 }, 21: { start: 402, end: 421 },
  22: { start: 422, end: 441 }, 23: { start: 442, end: 461 }, 24: { start: 462, end: 481 },
  25: { start: 482, end: 501 }, 26: { start: 502, end: 521 }, 27: { start: 522, end: 541 },
  28: { start: 542, end: 561 }, 29: { start: 562, end: 581 }, 30: { start: 582, end: 604 }
};

interface MushafPage {
  pageNumber: number;
  juz: number;
  surah: string;
  ayatRange: string;
  imageUrl?: string;
  content: string;
}

interface MushafDigitalProps {
  juzMulai: number;
  juzSampai: number;
  tipeUjian: 'per-juz' | 'per-halaman';
  onPageChange?: (pageNumber: number) => void;
  onJuzChange?: (juz: number) => void;
  currentPage?: number;
  currentJuz?: number;
  className?: string;
  showAcakHalaman?: boolean;
  kategoriUjian?: string;
}

export function MushafDigital({ 
  juzMulai, 
  juzSampai, 
  tipeUjian, 
  onPageChange,
  onJuzChange,
  currentPage = 1,
  currentJuz,
  className = '',
  showAcakHalaman,
  kategoriUjian
}: MushafDigitalProps) {
  const isMHQ = showAcakHalaman || kategoriUjian?.toLowerCase().includes('mhq') || false;
  const [pages, setPages] = useState<MushafPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [activeJuz, setActiveJuz] = useState(currentJuz || juzMulai);

  const generateFallbackContent = (): string => {
    const fallbackLines = [
      'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
      'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ﴿١﴾ الرَّحْمَٰنِ الرَّحِيمِ ﴿٢﴾',
      'مَالِكِ يَوْمِ الدِّينِ ﴿٣﴾ إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ ﴿٤﴾',
      'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ ﴿٥﴾ صِرَاطَ الَّذِينَ أَنْعَمْتَ',
      'عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ ﴿٦﴾',
      'وَإِذَا قِيلَ لَهُمْ آمِنُوا كَمَا آمَنَ النَّاسُ قَالُوا',
      'أَنُؤْمِنُ كَمَا آمَنَ السُّفَهَاءُ ۗ أَلَا إِنَّهُمْ هُمُ السُّفَهَاءُ',
      'وَلَٰكِن لَّا يَعْلَمُونَ ﴿١٣﴾ وَإِذَا لَقُوا الَّذِينَ آمَنُوا',
      'قَالُوا آمَنَّا وَإِذَا خَلَوْا إِلَىٰ شَيَاطِينِهِمْ قَالُوا',
      'إِنَّا مَعَكُمْ إِنَّمَا نَحْنُ مُسْتَهْزِئُونَ ﴿١٤﴾ اللَّهُ',
      'يَسْتَهْزِئُ بِهِمْ وَيَمُدُّهُمْ فِي طُغْيَانِهِمْ يَعْمَهُونَ ﴿١٥﴾',
      'أُولَٰئِكَ الَّذِينَ اشْتَرَوُا الضَّلَالَةَ بِالْهُدَىٰ فَمَا',
      'رَبِحَت تِّجَارَتُهُمْ وَمَا كَانُوا مُهْتَدِينَ ﴿١٦﴾',
      'مَثَلُهُمْ كَمَثَلِ الَّذِي اسْتَوْقَدَ نَارًا فَلَمَّا أَضَاءَتْ',
      'مَا حَوْلَهُ ذَهَبَ اللَّهُ بِنُورِهِمْ وَتَرَكَهُمْ فِي ظُلُمَاتٍ'
    ];

    return fallbackLines.join('\n');
  };

  const fetchRealtimePage = useCallback(async (pageNumber: number, juzNum: number): Promise<MushafPage> => {
    try {
      // 1. Langsung ke alquran.cloud API eksternal yang cepat dan stabil untuk mushaf per halaman
      const res = await fetch(`https://api.alquran.cloud/v1/page/${pageNumber}/quran-uthmani`);
      if (res.ok) {
        const data = await res.json();
        if (data.code === 200 && data.data?.ayahs?.length > 0) {
          const lines: string[] = [];
          let currentSuratId = 0;
          let currentSuratName = 'القرآن الكريم';
          const ayatNumbers: number[] = [];

          data.data.ayahs.forEach((ayah: any) => {
            const surah = ayah.surah;
            if (currentSuratId !== surah.number) {
              if (lines.length > 0) lines.push('');
              lines.push(`﴿ ${surah.name} ﴾`);
              lines.push('');
              if (ayah.numberInSurah === 1 && surah.number !== 9 && surah.number !== 1) {
                lines.push('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ');
                lines.push('');
              }
              currentSuratId = surah.number;
              currentSuratName = surah.name;
            }
            lines.push(`${ayah.text} ﴿${toArabicDigits(ayah.numberInSurah)}﴾`);
            ayatNumbers.push(ayah.numberInSurah);
          });

          const firstAyat = Math.min(...ayatNumbers);
          const lastAyat = Math.max(...ayatNumbers);
          const ayatRange = firstAyat === lastAyat ? `آية ${firstAyat}` : `آية ${firstAyat}-${lastAyat}`;

          return {
            pageNumber,
            juz: juzNum,
            surah: currentSuratName,
            ayatRange,
            content: lines.join('\n')
          };
        }
      }

      // 2. Fallback ke endpoint mushaf lokal kita jika alquran.cloud tidak bisa diakses
      const localRes = await fetch(`/api/mushaf?page=${pageNumber}`);
      if (localRes.ok) {
        const localData = await localRes.json();
        if (localData.success && localData.data) {
          return {
            pageNumber,
            juz: juzNum,
            surah: localData.data.surahInfo || 'القرآن الكريم',
            ayatRange: localData.data.ayatRange || `الصفحة ${pageNumber}`,
            content: localData.data.content
          };
        }
      }
    } catch (err) {
      console.error('Error fetching real quran page:', err);
    }

    return {
      pageNumber,
      juz: juzNum,
      surah: 'القرآن الكريم',
      ayatRange: `الصفحة ${pageNumber}`,
      content: generateFallbackContent()
    };
  }, []);

  // Inisialisasi daftar halaman dalam rentang juz terpilih agar Select dan navigasi mencakup seluruh halaman
  useEffect(() => {
    const JUZ_TO_PAGE_MAPPING_LOCAL: Record<number, { start: number; end: number }> = {
      1: { start: 1, end: 21 }, 2: { start: 22, end: 41 }, 3: { start: 42, end: 61 },
      4: { start: 62, end: 81 }, 5: { start: 82, end: 101 }, 6: { start: 102, end: 121 },
      7: { start: 122, end: 141 }, 8: { start: 142, end: 161 }, 9: { start: 162, end: 181 },
      10: { start: 182, end: 201 }, 11: { start: 202, end: 221 }, 12: { start: 222, end: 241 },
      13: { start: 242, end: 261 }, 14: { start: 262, end: 281 }, 15: { start: 282, end: 301 },
      16: { start: 302, end: 321 }, 17: { start: 322, end: 341 }, 18: { start: 342, end: 361 },
      19: { start: 362, end: 381 }, 20: { start: 382, end: 401 }, 21: { start: 402, end: 421 },
      22: { start: 422, end: 441 }, 23: { start: 442, end: 461 }, 24: { start: 462, end: 481 },
      25: { start: 482, end: 501 }, 26: { start: 502, end: 521 }, 27: { start: 522, end: 541 },
      28: { start: 542, end: 561 }, 29: { start: 562, end: 581 }, 30: { start: 582, end: 604 }
    };

    const initialPages: MushafPage[] = [];
    for (let juz = juzMulai; juz <= juzSampai; juz++) {
      const mapping = JUZ_TO_PAGE_MAPPING_LOCAL[juz] || { start: 1, end: 21 };
      for (let p = mapping.start; p <= mapping.end; p++) {
        initialPages.push({
          pageNumber: p,
          juz: juz,
          surah: 'Memuat surah...',
          ayatRange: `Hal. ${p}`,
          content: '...'
        });
      }
    }
    setPages(initialPages);
  }, [juzMulai, juzSampai]);

  // Fetch data Rasm Utsmani nyata secara realtime untuk halaman aktif (currentPage)
  useEffect(() => {
    let isMounted = true;
    const loadRealPage = async () => {
      setLoading(true);
      const JUZ_TO_PAGE_MAPPING_LOCAL: Record<number, { start: number; end: number }> = {
        1: { start: 1, end: 21 }, 2: { start: 22, end: 41 }, 3: { start: 42, end: 61 },
        4: { start: 62, end: 81 }, 5: { start: 82, end: 101 }, 6: { start: 102, end: 121 },
        7: { start: 122, end: 141 }, 8: { start: 142, end: 161 }, 9: { start: 162, end: 181 },
        10: { start: 182, end: 201 }, 11: { start: 202, end: 221 }, 12: { start: 222, end: 241 },
        13: { start: 242, end: 261 }, 14: { start: 262, end: 281 }, 15: { start: 282, end: 301 },
        16: { start: 302, end: 321 }, 17: { start: 322, end: 341 }, 18: { start: 342, end: 361 },
        19: { start: 362, end: 381 }, 20: { start: 382, end: 401 }, 21: { start: 402, end: 421 },
        22: { start: 422, end: 441 }, 23: { start: 442, end: 461 }, 24: { start: 462, end: 481 },
        25: { start: 482, end: 501 }, 26: { start: 502, end: 521 }, 27: { start: 522, end: 541 },
        28: { start: 542, end: 561 }, 29: { start: 562, end: 581 }, 30: { start: 582, end: 604 }
      };
      // Tentukan juz untuk halaman tersebut
      let targetJuz = activeJuz;
      Object.entries(JUZ_TO_PAGE_MAPPING_LOCAL).forEach(([jNum, map]) => {
        if (currentPage >= map.start && currentPage <= map.end) {
          targetJuz = Number(jNum);
        }
      });

      const realPage = await fetchRealtimePage(currentPage, targetJuz);
      if (isMounted) {
        setPages(prev => prev.map(p => p.pageNumber === currentPage ? realPage : p));
        setLoading(false);
      }
    };
    loadRealPage();
    return () => { isMounted = false; };
  }, [currentPage, activeJuz, fetchRealtimePage]);

  const getCurrentPage = useCallback(() => {
    return pages.find(p => p.pageNumber === currentPage) || pages[0];
  }, [currentPage, pages]);

  // Update activeJuz when currentPage changes
  useEffect(() => {
    const currentPageData = getCurrentPage();
    if (currentPageData && currentPageData.juz !== activeJuz) {
      setActiveJuz(currentPageData.juz);
    }
  }, [currentPage, pages, getCurrentPage, activeJuz]);

  const handlePrevPage = () => {
    if (currentPage > pages[0]?.pageNumber) {
      onPageChange?.(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < pages[pages.length - 1]?.pageNumber) {
      onPageChange?.(currentPage + 1);
    }
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 10, 150));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 10, 70));
  };

  const handlePrevJuz = () => {
    if (activeJuz > juzMulai) {
      const newJuz = activeJuz - 1;
      setActiveJuz(newJuz);
      onJuzChange?.(newJuz);
      
      // Navigate to first page of previous juz
      const firstPage = JUZ_TO_PAGE_MAPPING[newJuz]?.start || 1;
      onPageChange?.(firstPage);
    }
  };

  const handleNextJuz = () => {
    if (activeJuz < juzSampai) {
      const newJuz = activeJuz + 1;
      setActiveJuz(newJuz);
      onJuzChange?.(newJuz);
      
      // Navigate to first page of next juz
      const firstPage = JUZ_TO_PAGE_MAPPING[newJuz]?.start || 1;
      onPageChange?.(firstPage);
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <div style={{ textAlign: 'center', padding: '100px 0' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>
            <Text type="secondary">Memuat Mushaf Digital...</Text>
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <Alert message="Error" description={error} type="error" showIcon />
      </Card>
    );
  }

  const currentPageData = getCurrentPage();

  return (
    <div className={className} style={{ height: '100%', overflow: 'auto', padding: '20px' }}>
      {/* Header Controls */}
      <Card 
        style={{ 
          marginBottom: 16,
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          border: '2px solid #e2e8f0',
          borderRadius: '12px'
        }}
        styles={{ body: { padding: 16 } }}
      >
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <Space size="large">
              <div style={{
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                padding: '12px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <BookOutlined style={{ fontSize: 28, color: 'white' }} />
              </div>
              <div>
                <div style={{ 
                  fontWeight: 'bold', 
                  fontSize: 20, 
                  color: '#047857',
                  fontFamily: 'Amiri, serif'
                }}>
                  المصحف الشريف
                </div>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  Al-Quran Digital
                </Text>
              </div>
            </Space>
          </Col>
          
          <Col xs={24} md={16}>
            <Row justify="end" gutter={[12, 12]}>
              <Col>
                <div style={{
                  background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: '2px solid #3b82f6'
                }}>
                  <Text strong style={{ color: '#1e40af', fontSize: 14 }}>
                    📚 الجزء {juzMulai}{juzSampai > juzMulai ? `-${juzSampai}` : ''}
                  </Text>
                </div>
              </Col>
              
              <Col>
                <div style={{
                  background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: '2px solid #10b981'
                }}>
                  <Text strong style={{ color: '#065f46', fontSize: 14 }}>
                    {tipeUjian === 'per-juz' ? '📖 Per Juz' : '📄 Per Halaman'}
                  </Text>
                </div>
              </Col>

              <Col>
                <Space>
                  <Select
                    value={currentPage}
                    onChange={(val) => {
                      onPageChange?.(val);
                    }}
                    style={{ width: 145 }}
                    size="middle"
                    placeholder="Pilih Halaman"
                  >
                    {Array.from(
                      { length: (JUZ_TO_PAGE_MAPPING[activeJuz]?.end || 21) - (JUZ_TO_PAGE_MAPPING[activeJuz]?.start || 1) + 1 },
                      (_, i) => (JUZ_TO_PAGE_MAPPING[activeJuz]?.start || 1) + i
                    ).map((pageNum) => (
                      <Option key={pageNum} value={pageNum}>
                        Hal. {pageNum} (Juz {activeJuz})
                      </Option>
                    ))}
                  </Select>

                  {isMHQ && (
                    <Button
                      type="primary"
                      style={{
                        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                        borderColor: '#d97706',
                        fontWeight: 600
                      }}
                      onClick={() => {
                        const range = JUZ_TO_PAGE_MAPPING[activeJuz] || { start: 1, end: 21 };
                        const randomPage = Math.floor(Math.random() * (range.end - range.start + 1)) + range.start;
                        onPageChange?.(randomPage);
                        message.success(`🎲 Mengacak soal MHQ: Menampilkan Halaman ${randomPage}`);
                      }}
                    >
                      🎲 Acak Halaman
                    </Button>
                  )}
                </Space>
              </Col>
              
              <Col>
                <Space style={{ 
                  background: 'white', 
                  padding: '6px 12px', 
                  borderRadius: 8,
                  border: '2px solid #e5e7eb'
                }}>
                  <Button 
                    icon={<ZoomOutOutlined />} 
                    size="small" 
                    onClick={handleZoomOut}
                    disabled={zoomLevel <= 70}
                    type="text"
                    style={{ color: '#6b7280' }}
                  />
                  <Text style={{ 
                    minWidth: 48, 
                    textAlign: 'center', 
                    fontWeight: 600,
                    color: '#374151',
                    fontSize: 13
                  }}>
                    {zoomLevel}%
                  </Text>
                  <Button 
                    icon={<ZoomInOutlined />} 
                    size="small" 
                    onClick={handleZoomIn}
                    disabled={zoomLevel >= 150}
                    type="text"
                    style={{ color: '#6b7280' }}
                  />
                </Space>
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>

      {currentPageData && (
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          {/* Mushaf Page */}
          <div style={{ position: 'relative' }}>
            <div 
              className="mushaf-border"
              style={{ 
                maxWidth: '100%',
                margin: '0 auto',
                borderRadius: 12,
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
              }}
            >
              {/* Ornamental Top Border */}
              <div style={{
                height: 48,
                background: 'linear-gradient(90deg, #059669 0%, #047857 50%, #059669 100%)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  opacity: 0.2,
                  backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 10px, rgba(255,255,255,0.3) 10px, rgba(255,255,255,0.3) 20px)'
                }}></div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  position: 'relative',
                  zIndex: 1
                }}>
                  <Title level={4} style={{ 
                    color: 'white', 
                    margin: 0,
                    fontFamily: 'Amiri, serif',
                    letterSpacing: 2
                  }}>
                    {tipeUjian === 'per-juz' ? `الجزء ${currentPageData.juz}` : `صفحة ${currentPageData.pageNumber}`}
                  </Title>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="p-3 sm:p-6 md:p-8">
                {/* Page Header Info */}
                <div style={{ 
                  textAlign: 'center', 
                  marginBottom: 20, 
                  paddingBottom: 12,
                  borderBottom: '2px solid rgba(217, 119, 6, 0.2)'
                }}>
                  <Row justify="space-between" align="middle" style={{ marginBottom: 8 }}>
                    <Col>
                      <Text style={{ color: '#d97706', fontWeight: 600 }}>
                        {currentPageData.surah}
                      </Text>
                    </Col>
                    <Col>
                      <Text strong style={{ color: '#d97706', fontSize: 16 }}>
                        الجزء {currentPageData.juz}
                      </Text>
                    </Col>
                    <Col>
                      <Text style={{ color: '#d97706', fontWeight: 600 }}>
                        {currentPageData.ayatRange}
                      </Text>
                    </Col>
                  </Row>
                </div>

                {/* Quran Text Content - 15 Lines Format */}
                <div 
                  className="quran-text overflow-x-auto"
                  style={{ 
                    fontSize: `${zoomLevel}%`,
                    minHeight: 450,
                    lineHeight: '2.5em' // Mushaf Utsmani standard line height
                  }}
                >
                  <Space direction="vertical" size={4} style={{ width: '100%' }}>
                    {currentPageData.content.split('\n').map((line, index) => {
                      const isBismillah = line.includes('بِسْمِ اللَّهِ');
                      const isSurahName = (line.includes('﴿') || line.includes('﴾')) && !line.includes('بِسْمِ') && !line.match(/[﴿﴾][\d٠-٩]+[﴿﴾]/);
                      const isEmptyLine = !line.trim();
                      
                      // Skip empty lines for cleaner display
                      if (isEmptyLine) return null;
                      
                      return (
                        <div 
                          key={index}
                          className={isBismillah ? 'bismillah' : isSurahName ? 'surah-name' : 'quran-line'}
                          style={{
                            minHeight: isBismillah || isSurahName ? 'auto' : 55,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: isBismillah || isSurahName ? 'center' : 'flex-end',
                            padding: isBismillah || isSurahName ? '12px 16px' : '10px 16px',
                            fontSize: isBismillah ? '2em' : isSurahName ? '1.6em' : '1.3em',
                            fontWeight: isBismillah ? 700 : isSurahName ? 600 : 400,
                            color: isBismillah ? '#047857' : isSurahName ? '#d97706' : '#1f2937',
                            textAlign: isBismillah || isSurahName ? 'center' : 'justify',
                            wordSpacing: '0.3em',
                            letterSpacing: '0.02em',
                            borderRadius: 4,
                            transition: 'background-color 0.2s',
                            background: isSurahName ? 'rgba(217, 119, 6, 0.05)' : 'transparent',
                            marginBottom: isBismillah || isSurahName ? '8px' : '2px'
                          }}
                        >
                          {line.trim() && (
                            <span style={{ 
                              display: 'block', 
                              width: '100%',
                              textAlign: isBismillah || isSurahName ? 'center' : 'justify',
                              direction: 'rtl',
                              fontFamily: 'Amiri, "Traditional Arabic", serif'
                            }}>
                              {line}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </Space>
                </div>

                {/* Next Page Button - Center of Page */}
                <div style={{ 
                  marginTop: 32,
                  marginBottom: 16,
                  textAlign: 'center'
                }}>
                  <Space size="middle">
                    <Button
                      icon={<LeftOutlined />}
                      onClick={handleNextPage}
                      disabled={currentPage >= pages[pages.length - 1]?.pageNumber}
                      size="large"
                      type="primary"
                      style={{
                        background: '#059669',
                        borderRadius: '8px',
                        minWidth: '120px'
                      }}
                    >
                      <span style={{ marginRight: 8 }}>التالي</span>
                    </Button>
                    
                    <Button
                      icon={<RightOutlined />}
                      onClick={handlePrevPage}
                      disabled={currentPage <= pages[0]?.pageNumber}
                      size="large"
                      style={{
                        borderRadius: '8px',
                        minWidth: '120px'
                      }}
                    >
                      <span style={{ marginRight: 8 }}>السابق</span>
                    </Button>
                  </Space>
                </div>

                {/* Page Footer */}
                <div style={{ 
                  marginTop: 32, 
                  paddingTop: 16,
                  borderTop: '2px solid rgba(217, 119, 6, 0.3)'
                }}>
                  <Row justify="space-between" align="middle">
                    <Col>
                      <Text style={{ color: '#d97706', fontWeight: 600 }}>
                        الجزء {currentPageData.juz}
                      </Text>
                    </Col>
                    <Col>
                      <Text strong style={{ color: '#78350f', fontSize: 18 }}>
                        {currentPageData.pageNumber}
                      </Text>
                    </Col>
                    <Col>
                      <Text style={{ color: '#d97706', fontWeight: 600 }}>
                        {currentPageData.surah}
                      </Text>
                    </Col>
                  </Row>
                </div>
              </div>

              {/* Ornamental Bottom Border */}
              <div style={{
                height: 12,
                background: 'linear-gradient(90deg, #059669 0%, #047857 50%, #059669 100%)'
              }}></div>
            </div>
          </div>

          {/* Juz Navigation - Show for both per-juz and per-halaman if multiple juz */}
          {juzSampai > juzMulai && (
            <Card 
              style={{ 
                background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                border: '2px solid #0ea5e9',
                marginBottom: 16
              }}
              styles={{ body: { padding: 16 } }}
            >
              <Row justify="space-between" align="middle">
                <Col>
                  <Button
                    icon={<RightOutlined />}
                    onClick={handlePrevJuz}
                    disabled={activeJuz <= juzMulai}
                    size="large"
                    style={{ 
                      background: activeJuz > juzMulai ? '#0ea5e9' : undefined,
                      color: activeJuz > juzMulai ? 'white' : undefined,
                      borderColor: '#0ea5e9'
                    }}
                  >
                    <span style={{ marginRight: 8 }}>الجزء السابق</span>
                  </Button>
                </Col>

                <Col>
                  <Space direction="vertical" align="center" size={0}>
                    <Text strong style={{ fontSize: 16, color: '#0369a1' }}>
                      📚 الجزء {activeJuz}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      من {juzMulai} إلى {juzSampai}
                    </Text>
                  </Space>
                </Col>

                <Col>
                  <Button
                    icon={<LeftOutlined />}
                    onClick={handleNextJuz}
                    disabled={activeJuz >= juzSampai}
                    size="large"
                    type="primary"
                    style={{ 
                      background: activeJuz < juzSampai ? '#0ea5e9' : undefined,
                      borderColor: '#0ea5e9'
                    }}
                  >
                    <span style={{ marginRight: 8 }}>الجزء التالي</span>
                  </Button>
                </Col>
              </Row>
            </Card>
          )}

          {/* Page Navigation Controls */}
          <Card styles={{ body: { padding: 16 } }}>
            <Row justify="space-between" align="middle">
              <Col>
                <Button
                  icon={<LeftOutlined />}
                  onClick={handleNextPage}
                  disabled={currentPage >= pages[pages.length - 1]?.pageNumber}
                  size="large"
                  type="primary"
                  style={{ background: '#059669' }}
                >
                  <span style={{ marginRight: 8 }}>
                    {tipeUjian === 'per-juz' ? 'الجزء التالي' : 'الصفحة التالية'}
                  </span>
                </Button>
              </Col>

              <Col style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                <Select
                  value={currentPage}
                  onChange={(value) => onPageChange?.(value)}
                  style={{ minWidth: 150 }}
                  size="large"
                >
                  {pages.map(page => (
                    <Option key={page.pageNumber} value={page.pageNumber}>
                      {tipeUjian === 'per-juz' ? (
                        `الجزء ${page.juz}`
                      ) : (
                        `${page.pageNumber} (جزء ${page.juz})`
                      )}
                    </Option>
                  ))}
                </Select>
              </Col>

              <Col>
                <Button
                  icon={<RightOutlined />}
                  onClick={handlePrevPage}
                  disabled={currentPage <= pages[0]?.pageNumber}
                  size="large"
                >
                  <span style={{ marginRight: 8 }}>
                    {tipeUjian === 'per-juz' ? 'الجزء السابق' : 'الصفحة السابقة'}
                  </span>
                </Button>
              </Col>
            </Row>
          </Card>

          {/* Page Info */}
          <div style={{ 
            textAlign: 'center', 
            background: '#fafafa', 
            borderRadius: 8, 
            padding: 12 
          }}>
            <div style={{ marginBottom: 8 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {tipeUjian === 'per-juz' ? `من ${pages.length} جزء` : `من ${pages.length} صفحة`}
              </Text>
            </div>
            <Text type="secondary">
              {tipeUjian === 'per-juz' ? (
                <>
                  {currentPageData.ayatRange}
                </>
              ) : (
                <>
                  الجزء {currentPageData.juz}
                </>
              )}
            </Text>
          </div>
        </Space>
      )}
    </div>
  );
}
