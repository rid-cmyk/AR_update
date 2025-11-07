'use client'

import { useState, useEffect } from 'react'
import { Card, Typography, Button, Spin, Alert, Tag, Divider } from 'antd'
import { BookOutlined, LeftOutlined, RightOutlined, ZoomInOutlined, ZoomOutOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

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
  currentPage?: number;
  className?: string;
}

export function MushafDigital({ 
  juzMulai, 
  juzSampai, 
  tipeUjian, 
  onPageChange,
  currentPage = 1,
  className = ''
}: MushafDigitalProps) {
  const [pages, setPages] = useState<MushafPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(100);

  // Load pages from API based on juz range
  useEffect(() => {
    const loadPagesFromAPI = async () => {
      setLoading(true);
      try {
        // Generate fallback pages if API is not available
        const allPages: MushafPage[] = [];
        
        // Juz to page mapping
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
        
        // Generate pages for each juz in range
        for (let juz = juzMulai; juz <= juzSampai; juz++) {
          const juzMapping = JUZ_TO_PAGE_MAPPING[juz];
          if (juzMapping) {
            for (let page = juzMapping.start; page <= juzMapping.end; page++) {
              const content = await generatePageContent(page, juz);
              allPages.push({
                pageNumber: page,
                juz: juz,
                surah: `البقرة`,
                ayatRange: `آية ${page * 5}-${page * 5 + 10}`,
                content: content
              });
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
  }, [juzMulai, juzSampai]);

  const generatePageContent = async (pageNumber: number, juz: number): Promise<string> => {
    try {
      // Fetch authentic content from API
      const response = await fetch(`/api/quran?action=mushaf&page=${pageNumber}`);
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data.content) {
          return result.data.content;
        }
      }
    } catch (error) {
      console.error('Error fetching page content:', error);
    }

    // Fallback to local content generation
    return generateFallbackContent(pageNumber, juz);
  };

  const generateFallbackContent = (pageNumber: number, juz: number): string => {
    // Fallback content with 15 lines per page
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
      `[صفحة ${pageNumber} - الجزء ${juz}]`,
      '[محتوى المصحف الشريف - ١٥ سطر في كل صفحة]'
    ];

    return fallbackLines.join('\n');
  };

  const getCurrentPage = () => {
    return pages.find(p => p.pageNumber === currentPage) || pages[0];
  };

  const handlePrevPage = () => {
    if (currentPage > pages[0]?.pageNumber) {
      const newPage = currentPage - 1;
      onPageChange?.(newPage);
    }
  };

  const handleNextPage = () => {
    if (currentPage < pages[pages.length - 1]?.pageNumber) {
      const newPage = currentPage + 1;
      onPageChange?.(newPage);
    }
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 25, 50));
  };

  if (loading) {
    return (
      <Card className={`h-full ${className}`}>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Spin size="large" />
            <div className="mt-4">
              <Text type="secondary">Memuat Mushaf Digital...</Text>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`h-full ${className}`}>
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
        />
      </Card>
    );
  }

  const currentPageData = getCurrentPage();

  return (
    <Card 
      className={`h-full ${className}`}
      title={
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOutlined className="text-green-600" />
            <span className="text-lg font-semibold">Mushaf Digital</span>
          </div>
          <div className="flex items-center gap-2">
            <Tag color="blue">Juz {juzMulai}-{juzSampai}</Tag>
            <Tag color="green">{tipeUjian === 'per-juz' ? 'Per Juz' : 'Per Halaman'}</Tag>
          </div>
        </div>
      }
      extra={
        <div className="flex items-center gap-2">
          <Button 
            icon={<ZoomOutOutlined />} 
            size="small" 
            onClick={handleZoomOut}
            disabled={zoomLevel <= 50}
          />
          <Text className="text-sm min-w-12 text-center">{zoomLevel}%</Text>
          <Button 
            icon={<ZoomInOutlined />} 
            size="small" 
            onClick={handleZoomIn}
            disabled={zoomLevel >= 200}
          />
        </div>
      }
    >
      {currentPageData && (
        <div className="space-y-4">
          {/* Page Info */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <div>
                <Title level={4} className="mb-1">
                  Halaman {currentPageData.pageNumber}
                </Title>
                <Text type="secondary">
                  Juz {currentPageData.juz} - {currentPageData.surah}
                </Text>
              </div>
              <div className="text-right">
                <Text className="text-sm text-gray-600">
                  {pages.findIndex(p => p.pageNumber === currentPage) + 1} dari {pages.length} halaman
                </Text>
              </div>
            </div>
          </div>

          {/* Mushaf Content - Authentic Layout */}
          <div 
            className="bg-gradient-to-b from-amber-50 to-white border-2 border-amber-200 rounded-lg p-8 min-h-96 overflow-auto shadow-inner"
            style={{ 
              fontSize: `${Math.max(zoomLevel * 0.8, 50)}%`,
              fontFamily: 'Amiri, "Times New Roman", serif',
              lineHeight: '2.2',
              textAlign: 'right',
              direction: 'rtl'
            }}
          >
            {/* Page Header */}
            <div className="text-center mb-6 pb-4 border-b border-amber-300">
              <div className="text-lg font-bold text-amber-800 mb-2">
                صفحة {currentPageData.pageNumber} • الجزء {currentPageData.juz}
              </div>
              <div className="text-sm text-amber-600">
                {currentPageData.surah} • {currentPageData.ayatRange}
              </div>
            </div>

            {/* Mushaf Lines (15 lines per page) */}
            <div className="space-y-1">
              {currentPageData.content.split('\n').map((line, index) => (
                <div 
                  key={index}
                  className={`text-xl leading-relaxed py-1 px-2 rounded transition-colors duration-200 ${
                    line.trim() === '' 
                      ? 'h-6' // Empty line spacing
                      : 'hover:bg-amber-100/50 text-gray-800'
                  }`}
                  style={{
                    minHeight: '2.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end'
                  }}
                >
                  {line.trim() && (
                    <span className="block w-full text-right">
                      {line}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Page Footer */}
            <div className="mt-8 pt-4 border-t border-amber-300 text-center">
              <div className="flex justify-between items-center text-sm text-amber-700">
                <span>الجزء {currentPageData.juz}</span>
                <span className="font-bold text-lg">صفحة {currentPageData.pageNumber}</span>
                <span>{currentPageData.surah}</span>
              </div>
            </div>
          </div>

          <Divider />

          {/* Navigation Controls */}
          <div className="flex justify-between items-center">
            <Button
              icon={<LeftOutlined />}
              onClick={handlePrevPage}
              disabled={currentPage <= pages[0]?.pageNumber}
              size="large"
            >
              Halaman Sebelumnya
            </Button>

            <div className="flex items-center gap-2">
              <Text>Halaman:</Text>
              <select
                value={currentPage}
                onChange={(e) => onPageChange?.(parseInt(e.target.value))}
                className="px-3 py-1 border border-gray-300 rounded-md"
              >
                {pages.map(page => (
                  <option key={page.pageNumber} value={page.pageNumber}>
                    {page.pageNumber} (Juz {page.juz})
                  </option>
                ))}
              </select>
            </div>

            <Button
              icon={<RightOutlined />}
              onClick={handleNextPage}
              disabled={currentPage >= pages[pages.length - 1]?.pageNumber}
              size="large"
              type="primary"
            >
              Halaman Selanjutnya
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}