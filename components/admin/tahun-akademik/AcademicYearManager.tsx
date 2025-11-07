'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { 
  Calendar,
  Settings,
  RefreshCw,
  CheckCircle,
  Clock,
  BookOpen,
  TrendingUp
} from 'lucide-react'

interface AcademicYear {
  id: number
  tahunMulai: number
  tahunSelesai: number
  semester: 'S1' | 'S2'
  namaLengkap: string
  isActive: boolean
  isCurrent: boolean
}

interface AcademicYearInfo {
  tahunMulai: number
  tahunSelesai: number
  semester: 'S1' | 'S2'
  namaLengkap: string
}

export function AcademicYearManager() {
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([])
  const [currentAcademicYear, setCurrentAcademicYear] = useState<AcademicYearInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [startYear, setStartYear] = useState(2020)
  const [endYear, setEndYear] = useState(2030)
  const { toast } = useToast()

  useEffect(() => {
    fetchAcademicYears()
  }, [])

  const fetchAcademicYears = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/tahun-akademik')
      if (response.ok) {
        const result = await response.json()
        setAcademicYears(result.data || [])
        setCurrentAcademicYear(result.currentAcademicYear)
      } else {
        toast({
          title: 'Error',
          description: 'Gagal mengambil data tahun akademik',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error fetching academic years:', error)
      toast({
        title: 'Error',
        description: 'Terjadi kesalahan saat mengambil data',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const generateAcademicYears = async () => {
    try {
      setIsGenerating(true)
      const response = await fetch('/api/admin/tahun-akademik/auto-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ startYear, endYear })
      })

      const result = await response.json()
      
      if (response.ok) {
        toast({
          title: 'Berhasil',
          description: result.message
        })
        fetchAcademicYears()
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Gagal generate tahun akademik',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error generating academic years:', error)
      toast({
        title: 'Error',
        description: 'Terjadi kesalahan saat generate tahun akademik',
        variant: 'destructive'
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const ensureCurrentAcademicYear = async () => {
    try {
      setIsGenerating(true)
      const response = await fetch('/api/admin/tahun-akademik/auto-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ensureCurrent: true })
      })

      const result = await response.json()
      
      if (response.ok) {
        toast({
          title: 'Berhasil',
          description: result.message
        })
        fetchAcademicYears()
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Gagal memastikan tahun akademik saat ini',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error ensuring current academic year:', error)
      toast({
        title: 'Error',
        description: 'Terjadi kesalahan saat memastikan tahun akademik',
        variant: 'destructive'
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const setActiveAcademicYear = async (tahunAjaranId: number) => {
    try {
      const response = await fetch('/api/admin/tahun-akademik/active', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ tahunAjaranId })
      })

      const result = await response.json()
      
      if (response.ok) {
        toast({
          title: 'Berhasil',
          description: result.message
        })
        fetchAcademicYears()
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Gagal mengubah tahun akademik aktif',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error setting active academic year:', error)
      toast({
        title: 'Error',
        description: 'Terjadi kesalahan saat mengubah tahun akademik aktif',
        variant: 'destructive'
      })
    }
  }

  const getSemesterLabel = (semester: 'S1' | 'S2') => {
    return semester === 'S1' ? 'Semester 1 (Jul-Des)' : 'Semester 2 (Jan-Jun)'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Memuat data tahun akademik...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Current Academic Year Info */}
      {currentAcademicYear && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <Calendar className="w-5 h-5" />
              Tahun Akademik Saat Ini
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-blue-800">
                  {currentAcademicYear.namaLengkap}
                </h3>
                <p className="text-blue-600">
                  {getSemesterLabel(currentAcademicYear.semester)}
                </p>
              </div>
              <Button 
                onClick={ensureCurrentAcademicYear}
                disabled={isGenerating}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isGenerating ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4 mr-2" />
                )}
                Pastikan Aktif
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generate Academic Years */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Generate Tahun Akademik
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startYear">Tahun Mulai</Label>
              <Input
                id="startYear"
                type="number"
                value={startYear}
                onChange={(e) => setStartYear(parseInt(e.target.value))}
                min={2000}
                max={2050}
              />
            </div>
            <div>
              <Label htmlFor="endYear">Tahun Selesai</Label>
              <Input
                id="endYear"
                type="number"
                value={endYear}
                onChange={(e) => setEndYear(parseInt(e.target.value))}
                min={2000}
                max={2050}
              />
            </div>
          </div>
          <Button 
            onClick={generateAcademicYears}
            disabled={isGenerating || startYear >= endYear}
            className="w-full"
          >
            {isGenerating ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <TrendingUp className="w-4 h-4 mr-2" />
            )}
            Generate Tahun Akademik ({startYear} - {endYear})
          </Button>
          <p className="text-sm text-muted-foreground">
            Akan membuat tahun akademik otomatis dengan pembagian semester:
            <br />• Semester 1: Juli - Desember
            <br />• Semester 2: Januari - Juni (tahun berikutnya)
          </p>
        </CardContent>
      </Card>

      {/* Academic Years List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Daftar Tahun Akademik ({academicYears.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {academicYears.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Belum ada tahun akademik</p>
                <p className="text-sm">Generate tahun akademik untuk memulai</p>
              </div>
            ) : (
              academicYears.map((academicYear) => (
                <div
                  key={academicYear.id}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    academicYear.isActive 
                      ? 'border-green-200 bg-green-50' 
                      : academicYear.isCurrent
                      ? 'border-blue-200 bg-blue-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div>
                    <h4 className="font-semibold">{academicYear.namaLengkap}</h4>
                    <p className="text-sm text-muted-foreground">
                      {getSemesterLabel(academicYear.semester)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {academicYear.isCurrent && (
                      <Badge variant="outline" className="border-blue-500 text-blue-700">
                        <Clock className="w-3 h-3 mr-1" />
                        Saat Ini
                      </Badge>
                    )}
                    {academicYear.isActive ? (
                      <Badge className="bg-green-600">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Aktif
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setActiveAcademicYear(academicYear.id)}
                      >
                        Aktifkan
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}