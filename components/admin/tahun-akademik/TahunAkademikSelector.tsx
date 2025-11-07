'use client'

import { useState, useEffect } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Calendar, CheckCircle, Clock, Users, FileText, BookOpen } from 'lucide-react'

interface TahunAkademik {
  id: number
  tahunMulai: number
  tahunSelesai: number
  semester: 'S1' | 'S2'
  namaLengkap: string
  tanggalMulai: string
  tanggalSelesai: string
  isActive: boolean
  _count?: {
    templateUjian: number
    templateRaport: number
    ujianSantri: number
    raportSantri: number
  }
}

interface TahunAkademikSelectorProps {
  onTahunAkademikChange?: (tahunAkademik: TahunAkademik | null) => void
  showStats?: boolean
  allowChange?: boolean
}

export function TahunAkademikSelector({ 
  onTahunAkademikChange, 
  showStats = true,
  allowChange = true 
}: TahunAkademikSelectorProps) {
  const [tahunAkademikList, setTahunAkademikList] = useState<TahunAkademik[]>([])
  const [activeTahunAkademik, setActiveTahunAkademik] = useState<TahunAkademik | null>(null)
  const [selectedTahunAkademik, setSelectedTahunAkademik] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [isChanging, setIsChanging] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchTahunAkademik()
    fetchActiveTahunAkademik()
  }, [])

  const fetchTahunAkademik = async () => {
    try {
      const response = await fetch('/api/admin/tahun-akademik')
      const result = await response.json()

      if (result.success) {
        setTahunAkademikList(result.data)
      }
    } catch (error) {
      console.error('Error fetching tahun akademik:', error)
    }
  }

  const fetchActiveTahunAkademik = async () => {
    try {
      const response = await fetch('/api/admin/tahun-akademik/active')
      const result = await response.json()

      if (result.success && result.data.active) {
        setActiveTahunAkademik(result.data.active)
        setSelectedTahunAkademik(result.data.active.id.toString())
        onTahunAkademikChange?.(result.data.active)
      }
    } catch (error) {
      console.error('Error fetching active tahun akademik:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTahunAkademikChange = async (tahunAjaranId: string) => {
    if (!allowChange) return

    setIsChanging(true)
    try {
      const response = await fetch('/api/admin/tahun-akademik/active', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tahunAjaranId: parseInt(tahunAjaranId)
        })
      })

      const result = await response.json()

      if (result.success) {
        setActiveTahunAkademik(result.data)
        setSelectedTahunAkademik(tahunAjaranId)
        onTahunAkademikChange?.(result.data)
        
        toast({
          title: 'Berhasil',
          description: result.message
        })

        // Refresh data
        await fetchTahunAkademik()
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Gagal mengubah tahun akademik aktif',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error changing active tahun akademik:', error)
      toast({
        title: 'Error',
        description: 'Terjadi kesalahan saat mengubah tahun akademik aktif',
        variant: 'destructive'
      })
    } finally {
      setIsChanging(false)
    }
  }

  const getSemesterIcon = (semester: string) => {
    return semester === 'S1' ? '🌞' : '❄️'
  }

  const formatDateRange = (mulai: string, selesai: string) => {
    const startDate = new Date(mulai).toLocaleDateString('id-ID', { 
      day: 'numeric', 
      month: 'short' 
    })
    const endDate = new Date(selesai).toLocaleDateString('id-ID', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    })
    return `${startDate} - ${endDate}`
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="ml-2">Memuat tahun akademik...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Tahun Akademik Aktif
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Pilih Tahun Akademik</label>
          <Select
            value={selectedTahunAkademik}
            onValueChange={handleTahunAkademikChange}
            disabled={!allowChange || isChanging}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih tahun akademik..." />
            </SelectTrigger>
            <SelectContent>
              {tahunAkademikList.map((tahunAkademik) => (
                <SelectItem key={tahunAkademik.id} value={tahunAkademik.id.toString()}>
                  <div className="flex items-center gap-2">
                    <span>{getSemesterIcon(tahunAkademik.semester)}</span>
                    <span>{tahunAkademik.namaLengkap}</span>
                    {tahunAkademik.isActive && (
                      <Badge variant="default" className="ml-2">
                        Aktif
                      </Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Active Tahun Akademik Info */}
        {activeTahunAkademik && (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">{getSemesterIcon(activeTahunAkademik.semester)}</span>
                <span className="font-semibold text-blue-900">
                  {activeTahunAkademik.namaLengkap}
                </span>
                <Badge variant="default" className="bg-blue-500">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Aktif
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-blue-700">
              <Clock className="w-4 h-4" />
              <span>
                {formatDateRange(activeTahunAkademik.tanggalMulai, activeTahunAkademik.tanggalSelesai)}
              </span>
            </div>
          </div>
        )}

        {/* Statistics */}
        {showStats && activeTahunAkademik?._count && (
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-900">Template Ujian</p>
                  <p className="text-lg font-bold text-green-700">
                    {activeTahunAkademik._count.templateUjian}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-purple-900">Template Raport</p>
                  <p className="text-lg font-bold text-purple-700">
                    {activeTahunAkademik._count.templateRaport}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-orange-600" />
                <div>
                  <p className="text-sm font-medium text-orange-900">Ujian Santri</p>
                  <p className="text-lg font-bold text-orange-700">
                    {activeTahunAkademik._count.ujianSantri}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                <div>
                  <p className="text-sm font-medium text-indigo-900">Raport Santri</p>
                  <p className="text-lg font-bold text-indigo-700">
                    {activeTahunAkademik._count.raportSantri}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* No Active Warning */}
        {!activeTahunAkademik && (
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-center gap-2 text-yellow-800">
              <Clock className="w-4 h-4" />
              <span className="text-sm">
                Tidak ada tahun akademik yang aktif. Silakan pilih atau buat tahun akademik baru.
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}