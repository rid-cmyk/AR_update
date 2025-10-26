'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight, Book, BookOpen } from 'lucide-react'

interface MushafDigitalProps {
  juzDari: number
  juzSampai: number
  onPageChange?: (page: number) => void
  currentPage?: number
}

// Data struktur juz dan halaman (lengkap 30 juz)
const JUZ_DATA = [
  { juz: 1, halamanMulai: 1, halamanSelesai: 20, surat: ['Al-Fatihah', 'Al-Baqarah'] },
  { juz: 2, halamanMulai: 21, halamanSelesai: 40, surat: ['Al-Baqarah'] },
  { juz: 3, halamanMulai: 41, halamanSelesai: 60, surat: ['Al-Baqarah', 'Ali Imran'] },
  { juz: 4, halamanMulai: 61, halamanSelesai: 80, surat: ['Ali Imran', 'An-Nisa'] },
  { juz: 5, halamanMulai: 81, halamanSelesai: 100, surat: ['An-Nisa'] },
  { juz: 6, halamanMulai: 101, halamanSelesai: 120, surat: ['An-Nisa', 'Al-Maidah'] },
  { juz: 7, halamanMulai: 121, halamanSelesai: 140, surat: ['Al-Maidah', 'Al-An\'am'] },
  { juz: 8, halamanMulai: 141, halamanSelesai: 160, surat: ['Al-An\'am', 'Al-A\'raf'] },
  { juz: 9, halamanMulai: 161, halamanSelesai: 180, surat: ['Al-A\'raf', 'Al-Anfal'] },
  { juz: 10, halamanMulai: 181, halamanSelesai: 200, surat: ['Al-Anfal', 'At-Taubah'] },
  { juz: 11, halamanMulai: 201, halamanSelesai: 220, surat: ['At-Taubah', 'Yunus'] },
  { juz: 12, halamanMulai: 221, halamanSelesai: 240, surat: ['Yunus', 'Hud'] },
  { juz: 13, halamanMulai: 241, halamanSelesai: 260, surat: ['Hud', 'Yusuf'] },
  { juz: 14, halamanMulai: 261, halamanSelesai: 280, surat: ['Yusuf', 'Ar-Ra\'d'] },
  { juz: 15, halamanMulai: 281, halamanSelesai: 300, surat: ['Ar-Ra\'d', 'Ibrahim'] },
  { juz: 16, halamanMulai: 301, halamanSelesai: 320, surat: ['Ibrahim', 'Al-Hijr'] },
  { juz: 17, halamanMulai: 321, halamanSelesai: 340, surat: ['Al-Hijr', 'An-Nahl'] },
  { juz: 18, halamanMulai: 341, halamanSelesai: 360, surat: ['An-Nahl', 'Al-Isra'] },
  { juz: 19, halamanMulai: 361, halamanSelesai: 380, surat: ['Al-Isra', 'Al-Kahf'] },
  { juz: 20, halamanMulai: 381, halamanSelesai: 400, surat: ['Al-Kahf', 'Maryam'] },
  { juz: 21, halamanMulai: 401, halamanSelesai: 420, surat: ['Maryam', 'Taha'] },
  { juz: 22, halamanMulai: 421, halamanSelesai: 440, surat: ['Taha', 'Al-Anbiya'] },
  { juz: 23, halamanMulai: 441, halamanSelesai: 460, surat: ['Al-Anbiya', 'Al-Hajj'] },
  { juz: 24, halamanMulai: 461, halamanSelesai: 480, surat: ['Al-Hajj', 'Al-Mu\'minun'] },
  { juz: 25, halamanMulai: 481, halamanSelesai: 500, surat: ['Al-Mu\'minun', 'An-Nur'] },
  { juz: 26, halamanMulai: 501, halamanSelesai: 520, surat: ['An-Nur', 'Al-Furqan'] },
  { juz: 27, halamanMulai: 521, halamanSelesai: 540, surat: ['Al-Furqan', 'Ash-Shu\'ara'] },
  { juz: 28, halamanMulai: 541, halamanSelesai: 560, surat: ['Ash-Shu\'ara', 'An-Naml'] },
  { juz: 29, halamanMulai: 561, halamanSelesai: 580, surat: ['An-Naml', 'Al-Qasas'] },
  { juz: 30, halamanMulai: 581, halamanSelesai: 604, surat: ['Al-Qasas', 'An-Nas'] }
]

export function MushafDigital({ juzDari, juzSampai, onPageChange, currentPage = 1 }: MushafDigitalProps) {
  const [selectedPage, setSelectedPage] = useState(currentPage)
  
  // Get all pages in the selected juz range (HANYA juz yang dipilih)
  const getAvailablePages = () => {
    const pages = []
    console.log(`🔍 Mushaf Digital - Loading juz ${juzDari} to ${juzSampai}`)
    
    for (let juz = juzDari; juz <= juzSampai; juz++) {
      const juzInfo = JUZ_DATA.find(j => j.juz === juz)
      if (juzInfo) {
        console.log(`📖 Adding juz ${juz}: pages ${juzInfo.halamanMulai}-${juzInfo.halamanSelesai}`)
        for (let page = juzInfo.halamanMulai; page <= juzInfo.halamanSelesai; page++) {
          pages.push({
            page,
            juz: juz,
            surat: juzInfo.surat
          })
        }
      }
    }
    
    console.log(`✅ Total pages loaded: ${pages.length} (juz ${juzDari}-${juzSampai})`)
    return pages
  }

  const availablePages = getAvailablePages()
  const currentPageInfo = availablePages.find(p => p.page === selectedPage)

  useEffect(() => {
    if (availablePages.length > 0 && !availablePages.find(p => p.page === selectedPage)) {
      setSelectedPage(availablePages[0].page)
    }
  }, [juzDari, juzSampai])

  const handlePageChange = (page: number) => {
    setSelectedPage(page)
    onPageChange?.(page)
  }

  const goToPreviousPage = () => {
    const currentIndex = availablePages.findIndex(p => p.page === selectedPage)
    if (currentIndex > 0) {
      handlePageChange(availablePages[currentIndex - 1].page)
    }
  }

  const goToNextPage = () => {
    const currentIndex = availablePages.findIndex(p => p.page === selectedPage)
    if (currentIndex < availablePages.length - 1) {
      handlePageChange(availablePages[currentIndex + 1].page)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            <span>Mushaf Digital</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              Juz {juzDari}{juzDari !== juzSampai ? ` - ${juzSampai}` : ''}
            </Badge>
            <Badge variant="secondary">
              Halaman {selectedPage}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Page Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPreviousPage}
            disabled={availablePages.findIndex(p => p.page === selectedPage) === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Sebelumnya
          </Button>
          
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {currentPageInfo && (
                <>
                  Juz {currentPageInfo.juz} | {currentPageInfo.surat.join(', ')}
                </>
              )}
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={goToNextPage}
            disabled={availablePages.findIndex(p => p.page === selectedPage) === availablePages.length - 1}
          >
            Selanjutnya
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        {/* Mushaf Display Area */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-8 min-h-[400px] flex items-center justify-center">
          <div className="text-center space-y-4">
            <Book className="w-16 h-16 text-green-600 mx-auto" />
            <div>
              <h3 className="text-xl font-semibold text-green-800">
                Halaman {selectedPage}
              </h3>
              <p className="text-green-600">
                Juz {currentPageInfo?.juz} - {currentPageInfo?.surat.join(', ')}
              </p>
            </div>
            <div className="bg-white/50 rounded-lg p-4 max-w-md">
              <p className="text-sm text-green-700">
                Mushaf digital akan menampilkan halaman Al-Quran sesuai dengan juz yang dipilih untuk ujian.
                Guru dapat menggunakan ini sebagai referensi saat melakukan penilaian.
              </p>
            </div>
          </div>
        </div>

        {/* Page Selector */}
        <div className="flex flex-wrap gap-2 justify-center max-h-32 overflow-y-auto">
          {availablePages.map((pageInfo) => (
            <Button
              key={pageInfo.page}
              variant={pageInfo.page === selectedPage ? "default" : "outline"}
              size="sm"
              onClick={() => handlePageChange(pageInfo.page)}
              className="text-xs"
            >
              {pageInfo.page}
            </Button>
          ))}
        </div>

        <div className="text-center text-xs text-muted-foreground">
          Total {availablePages.length} halaman tersedia untuk ujian ini
        </div>
      </CardContent>
    </Card>
  )
}