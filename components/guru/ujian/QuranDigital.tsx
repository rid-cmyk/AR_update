'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  ChevronLeft, 
  ChevronRight, 
  BookOpen, 
  ZoomIn, 
  ZoomOut,
  RotateCcw,
  Info
} from 'lucide-react'

interface QuranDigitalProps {
  juzMulai: number
  juzSampai: number
  tipeUjian: 'per-halaman' | 'per-juz'
  currentPage: number
  onPageChange: (page: number) => void
  className?: string
}

interface SuratInfo {
  nomor: number
  nama: string
  namaLatin: string
  jumlahAyat: number
}

export function QuranDigital({
  juzMulai,
  juzSampai,
  tipeUjian,
  currentPage,
  onPageChange,
  className = ''
}: QuranDigitalProps) {
  const [zoomLevel, setZoomLevel] = useState(100)
  const [suratInfo, setSuratInfo] = useState<SuratInfo | null>(null)
  const [ayatRange, setAyatRange] = useState<string>('')
  const [loading, setLoading] = useState(false)

  // Juz to page mapping for Quran
  const JUZ_TO_PAGE_MAPPING: Record<number, { start: number; end: number }> = {
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
  }

  // Get page range for the selected juz range
  const getPageRange = () => {
    const startPage = JUZ_TO_PAGE_MAPPING[juzMulai]?.start || 1
    const endPage = JUZ_TO_PAGE_MAPPING[juzSampai]?.end || 21
    return { start: startPage, end: endPage }
  }

  const pageRange = getPageRange()

  // Get current juz for the page
  const getCurrentJuz = (page: number) => {
    for (const [juz, range] of Object.entries(JUZ_TO_PAGE_MAPPING)) {
      if (page >= range.start && page <= range.end) {
        return parseInt(juz)
      }
    }
    return 1
  }

  // Fetch Quran data for current page
  useEffect(() => {
    fetchQuranData()
  }, [currentPage])

  const fetchQuranData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/quran?action=mushaf&page=${currentPage}`)
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          // Set surat info (simplified for demo)
          setSuratInfo({
            nomor: 1,
            nama: 'الفاتحة',
            namaLatin: 'Al-Fatihah',
            jumlahAyat: 7
          })
          setAyatRange('1-7')
        }
      }
    } catch (error) {
      console.error('Error fetching Quran data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePrevPage = () => {
    if (currentPage > pageRange.start) {
      onPageChange(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    if (currentPage < pageRange.end) {
      onPageChange(currentPage + 1)
    }
  }

  const handleZoomIn = () => {
    if (zoomLevel < 200) {
      setZoomLevel(prev => Math.min(prev + 25, 200))
    }
  }

  const handleZoomOut = () => {
    if (zoomLevel > 50) {
      setZoomLevel(prev => Math.max(prev - 25, 50))
    }
  }

  const resetZoom = () => {
    setZoomLevel(100)
  }

  // Generate page options for dropdown
  const pageOptions = []
  for (let i = pageRange.start; i <= pageRange.end; i++) {
    pageOptions.push(i)
  }

  return (
    <Card className={`h-full flex flex-col ${className}`}>
      <CardHeader className="pb-4 border-b bg-gradient-to-r from-green-50 to-emerald-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-green-800">
            <BookOpen className="w-5 h-5" />
            Al-Quran Digital - MHQ
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              Juz {getCurrentJuz(currentPage)}
            </Badge>
            <Badge variant="outline" className="border-green-300 text-green-700">
              Halaman {currentPage}
            </Badge>
          </div>
        </div>
        
        {/* Navigation Controls */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevPage}
              disabled={currentPage <= pageRange.start}
              className="border-green-300 text-green-700 hover:bg-green-50"
            >
              <ChevronLeft className="w-4 h-4" />
              Sebelumnya
            </Button>
            
            <Select value={currentPage.toString()} onValueChange={(value) => onPageChange(parseInt(value))}>
              <SelectTrigger className="w-32 border-green-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageOptions.map(page => (
                  <SelectItem key={page} value={page.toString()}>
                    Hal. {page}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPage >= pageRange.end}
              className="border-green-300 text-green-700 hover:bg-green-50"
            >
              Selanjutnya
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Zoom Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomOut}
              disabled={zoomLevel <= 50}
              className="border-green-300 text-green-700 hover:bg-green-50"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            
            <span className="text-sm font-medium text-green-700 min-w-[60px] text-center">
              {zoomLevel}%
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomIn}
              disabled={zoomLevel >= 200}
              className="border-green-300 text-green-700 hover:bg-green-50"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={resetZoom}
              className="border-green-300 text-green-700 hover:bg-green-50"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 p-0 overflow-hidden">
        {/* Quran Page Display */}
        <div className="h-full flex flex-col">
          {/* Surat Info */}
          {suratInfo && (
            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Info className="w-5 h-5 text-green-600" />
                  <div>
                    <h3 className="font-bold text-green-800">
                      {suratInfo.nama} ({suratInfo.namaLatin})
                    </h3>
                    <p className="text-sm text-green-600">
                      Ayat {ayatRange} • {suratInfo.jumlahAyat} ayat
                    </p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-700">
                  Halaman {currentPage} dari {pageRange.end}
                </Badge>
              </div>
            </div>
          )}
          
          {/* Quran Text Display */}
          <div className="flex-1 overflow-auto bg-gradient-to-b from-green-25 to-white">
            <div 
              className="p-8 text-center"
              style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
            >
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Bismillah */}
                  <div className="text-center mb-8">
                    <p className="text-4xl font-arabic text-green-800 leading-relaxed">
                      بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                    </p>
                  </div>
                  
                  {/* Quran Text */}
                  <div className="space-y-6 max-w-4xl mx-auto">
                    <div className="p-6 bg-white rounded-xl shadow-sm border border-green-100">
                      <p className="text-3xl font-arabic text-right leading-loose text-green-900" dir="rtl">
                        الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ﴿١﴾
                      </p>
                    </div>
                    
                    <div className="p-6 bg-white rounded-xl shadow-sm border border-green-100">
                      <p className="text-3xl font-arabic text-right leading-loose text-green-900" dir="rtl">
                        الرَّحْمَٰنِ الرَّحِيمِ ﴿٢﴾
                      </p>
                    </div>
                    
                    <div className="p-6 bg-white rounded-xl shadow-sm border border-green-100">
                      <p className="text-3xl font-arabic text-right leading-loose text-green-900" dir="rtl">
                        مَالِكِ يَوْمِ الدِّينِ ﴿٣﴾
                      </p>
                    </div>
                    
                    <div className="p-6 bg-white rounded-xl shadow-sm border border-green-100">
                      <p className="text-3xl font-arabic text-right leading-loose text-green-900" dir="rtl">
                        إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ ﴿٤﴾
                      </p>
                    </div>
                    
                    <div className="p-6 bg-white rounded-xl shadow-sm border border-green-100">
                      <p className="text-3xl font-arabic text-right leading-loose text-green-900" dir="rtl">
                        اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ ﴿٥﴾
                      </p>
                    </div>
                    
                    <div className="p-6 bg-white rounded-xl shadow-sm border border-green-100">
                      <p className="text-3xl font-arabic text-right leading-loose text-green-900" dir="rtl">
                        صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ ﴿٦﴾
                      </p>
                    </div>
                  </div>
                  
                  {/* Page Footer */}
                  <div className="mt-12 pt-6 border-t border-green-200">
                    <div className="flex justify-between items-center text-sm text-green-600">
                      <span>Juz {getCurrentJuz(currentPage)}</span>
                      <span className="font-bold">الصفحة {currentPage}</span>
                      <span>{suratInfo?.namaLatin}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}