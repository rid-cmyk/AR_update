'use client'

import { useState, useEffect } from 'react'
import { Card, Typography, Button, Spin, Alert, Space, Row, Col, Select } from 'antd'
import { 
  BookOutlined, 
  LeftOutlined, 
  RightOutlined, 
  ZoomInOutlined, 
  ZoomOutOutlined 
} from '@ant-design/icons'

const { Title, Text } = Typography
const { Option } = Select

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
}

export function MushafDigital({ 
  juzMulai, 
  juzSampai, 
  tipeUjian, 
  onPageChange,
  onJuzChange,
  currentPage = 1,
  currentJuz,
  className = ''
}: MushafDigitalProps) {
  const [pages, setPages] = useState<MushafPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [activeJuz, setActiveJuz] = useState(currentJuz || juzMulai);

  useEffect(() => {
    const loadPagesFromAPI = async () => {
      setLoading(true);
      try {
        const allPages: MushafPage[] = [];
        
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
        
        if (tipeUjian === 'per-juz') {
          // Mode Per-Juz: Tampilkan seluruh juz dalam satu view
          for (let juz = juzMulai; juz <= juzSampai; juz++) {
            const content = await generateJuzContent(juz);
            
            // Get surat info dari content
            let suratInfo = 'القرآن الكريم'
            let ayatRange = `الجزء ${juz}`
            
            const contentLines = content.split('\n')
            const suratLine = contentLines.find(line => line.includes('﴿') && line.includes('﴾') && !line.includes('بِسْمِ'))
            if (suratLine) {
              const match = suratLine.match(/﴿\s*(.+?)\s*﴾/)
              if (match) {
                suratInfo = match[1]
              }
            }
            
            // Extract ayat range
            const ayatNumbers: number[] = []
            contentLines.forEach(line => {
              const matches = line.matchAll(/﴿(\d+)﴾/g)
              for (const match of matches) {
                ayatNumbers.push(parseInt(match[1]))
              }
            })
            
            if (ayatNumbers.length > 0) {
              const firstAyat = Math.min(...ayatNumbers)
              const lastAyat = Math.max(...ayatNumbers)
              ayatRange = `آية ${firstAyat}-${lastAyat}`
            }
            
            const juzMapping = JUZ_TO_PAGE_MAPPING[juz];
            allPages.push({
              pageNumber: juzMapping?.start || juz,
              juz: juz,
              surah: suratInfo,
              ayatRange: ayatRange,
              content: content
            });
          }
        } else {
          // Mode Per-Halaman: Tampilkan per halaman mushaf
          for (let juz = juzMulai; juz <= juzSampai; juz++) {
            const juzMapping = JUZ_TO_PAGE_MAPPING[juz];
            if (juzMapping) {
              for (let page = juzMapping.start; page <= juzMapping.end; page++) {
                const content = await generatePageContent(page, juz);
                
                // Get surat info dari content
                let suratInfo = 'القرآن الكريم'
                let ayatRange = `الصفحة ${page}`
                
                const contentLines = content.split('\n')
                const suratLine = contentLines.find(line => line.includes('﴿') && line.includes('﴾') && !line.includes('بِسْمِ'))
                if (suratLine) {
                  const match = suratLine.match(/﴿\s*(.+?)\s*﴾/)
                  if (match) {
                    suratInfo = match[1]
                  }
                }
                
                // Extract ayat range
                const ayatNumbers: number[] = []
                contentLines.forEach(line => {
                  const matches = line.matchAll(/﴿(\d+)﴾/g)
                  for (const match of matches) {
                    ayatNumbers.push(parseInt(match[1]))
                  }
                })
                
                if (ayatNumbers.length > 0) {
                  const firstAyat = Math.min(...ayatNumbers)
                  const lastAyat = Math.max(...ayatNumbers)
                  ayatRange = firstAyat === lastAyat ? `آية ${firstAyat}` : `آية ${firstAyat}-${lastAyat}`
                }
                
                allPages.push({
                  pageNumber: page,
                  juz: juz,
                  surah: suratInfo,
                  ayatRange: ayatRange,
                  content: content
                });
              }
            }
          }
        }
        
        setPages(allPages.sort((a, b) => a.pageNumber - b.pageNumber));
        setError(null);
      } catch (err) {
        console.error('Error loading mushaf pages:', err);
        setError('Gagal memuat halaman mushaf');
      } finally {
        setLoading(false);
      }
    };

    loadPagesFromAPI();
  }, [juzMulai, juzSampai, tipeUjian]);

  const generateJuzContent = async (juz: number): Promise<string> => {
    try {
      // Fetch dari API juz - tampilkan seluruh juz
      const response = await fetch(`/api/quran/juz/${juz}`);
      
      const contentType = response.headers.get('content-type')
      if (response.ok && contentType?.includes('application/json')) {
        const result = await response.json();
        if (result.success && result.data.surat) {
          const lines: string[] = []
          
          result.data.surat.forEach((surat: any) => {
            // Tambahkan nama surat
            lines.push(`﴿ ${surat.nama} ﴾`)
            lines.push('')
            
            // Tambahkan bismillah jika ayat pertama dan bukan At-Taubah
            if (surat.ayat[0]?.nomorAyat === 1 && surat.suratId !== 9) {
              lines.push('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ')
              lines.push('')
            }
            
            // Tambahkan semua ayat dalam surat ini
            surat.ayat.forEach((ayat: any) => {
              lines.push(`${ayat.teksArab} ﴿${ayat.nomorAyat}﴾`)
            })
            
            lines.push('') // Spacing antar surat
          })
          
          return lines.join('\n')
        }
      } else {
        console.warn(`API returned non-JSON response for juz ${juz}`)
      }
    } catch (error) {
      console.error('Error fetching juz content:', error);
    }

    return generateFallbackContent(0, juz);
  };

  const generatePageContent = async (pageNumber: number, juz: number): Promise<string> => {
    try {
      // Use mushaf API for accurate page content (handles special pages)
      const response = await fetch(`/api/mushaf?page=${pageNumber}`);
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type')
      if (response.ok && contentType?.includes('application/json')) {
        const result = await response.json();
        if (result.success && result.data) {
          // Mushaf API returns formatted content directly
          return result.data.content;
        }
      } else {
        console.warn(`API returned non-JSON response for page ${pageNumber}`)
      }
    } catch (error) {
      console.error('Error fetching page content:', error);
    }

    return generateFallbackContent(pageNumber, juz);
  };



  const generateFallbackContent = (_pageNumber: number, _juz: number): string => {
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

  const getCurrentPage = () => {
    return pages.find(p => p.pageNumber === currentPage) || pages[0];
  };

  // Update activeJuz when currentPage changes
  useEffect(() => {
    const currentPageData = getCurrentPage();
    if (currentPageData && currentPageData.juz !== activeJuz) {
      setActiveJuz(currentPageData.juz);
    }
  }, [currentPage, pages]);

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
              <div style={{ padding: '24px 32px' }}>
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
                  className="quran-text"
                  style={{ 
                    fontSize: `${zoomLevel}%`,
                    minHeight: 600,
                    lineHeight: '2.5em' // Mushaf Utsmani standard line height
                  }}
                >
                  <Space direction="vertical" size={4} style={{ width: '100%' }}>
                    {currentPageData.content.split('\n').map((line, index) => {
                      const isBismillah = line.includes('بِسْمِ اللَّهِ');
                      const isSurahName = line.includes('﴿') && line.includes('﴾') && !line.includes('بِسْمِ') && !line.match(/﴿\d+﴾/);
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
                      icon={<RightOutlined />}
                      onClick={handlePrevPage}
                      disabled={currentPage <= pages[0]?.pageNumber}
                      size="large"
                      style={{
                        borderRadius: '8px',
                        minWidth: '120px'
                      }}
                    >
                      <span style={{ marginLeft: 8 }}>السابق</span>
                    </Button>
                    
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
                    <span style={{ marginLeft: 8 }}>الجزء السابق</span>
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
                  icon={<RightOutlined />}
                  onClick={handlePrevPage}
                  disabled={currentPage <= pages[0]?.pageNumber}
                  size="large"
                >
                  <span style={{ marginLeft: 8 }}>
                    {tipeUjian === 'per-juz' ? 'الجزء السابق' : 'الصفحة السابقة'}
                  </span>
                </Button>
              </Col>

              <Col>
                <Space size="middle">
                  <Text>{tipeUjian === 'per-juz' ? 'الجزء:' : 'الصفحة:'}</Text>
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
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    من {pages.length}
                  </Text>
                </Space>
              </Col>

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
            </Row>
          </Card>

          {/* Page Info */}
          <div style={{ 
            textAlign: 'center', 
            background: '#fafafa', 
            borderRadius: 8, 
            padding: 12 
          }}>
            <Text type="secondary">
              {tipeUjian === 'per-juz' ? (
                <>
                  عرض الجزء {pages.findIndex(p => p.pageNumber === currentPage) + 1} من {pages.length} جزء
                  {' • '}
                  {currentPageData.ayatRange}
                </>
              ) : (
                <>
                  عرض الصفحة {pages.findIndex(p => p.pageNumber === currentPage) + 1} من {pages.length} صفحة
                  {' • '}
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
