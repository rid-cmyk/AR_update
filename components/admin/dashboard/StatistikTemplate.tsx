'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar, 
  BookOpen, 
  FileText, 
  Settings,
  TrendingUp,
  Users,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

interface StatistikData {
  tahunAkademik: {
    total: number
    aktif: number
    nonaktif: number
  }
  templateUjian: {
    total: number
    aktif: number
    perJenis: Record<string, number>
  }
  templateRaport: {
    total: number
    aktif: number
    withGrafik: number
    withRanking: number
  }
  ujianTerbuat: {
    total: number
    bulanIni: number
    rataRataNilai: number
  }
  raportGenerated: {
    total: number
    bulanIni: number
    tingkatKelulusan: number
  }
}

export function StatistikTemplate() {
  const [statistik, setStatistik] = useState<StatistikData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchStatistik()
  }, [])

  const fetchStatistik = async () => {
    setIsLoading(true)
    try {
      // Simulasi data - dalam implementasi nyata akan fetch dari API
      const mockData: StatistikData = {
        tahunAkademik: {
          total: 5,
          aktif: 1,
          nonaktif: 4
        },
        templateUjian: {
          total: 12,
          aktif: 8,
          perJenis: {
            tasmi: 3,
            mhq: 2,
            uas: 2,
            kenaikan_juz: 1
          }
        },
        templateRaport: {
          total: 6,
          aktif: 4,
          withGrafik: 5,
          withRanking: 4
        },
        ujianTerbuat: {
          total: 156,
          bulanIni: 23,
          rataRataNilai: 84.5
        },
        raportGenerated: {
          total: 89,
          bulanIni: 12,
          tingkatKelulusan: 91.2
        }
      }
      
      setTimeout(() => {
        setStatistik(mockData)
        setIsLoading(false)
      }, 1000)
    } catch (error) {
      console.error('Error fetching statistik:', error)
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-16 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!statistik) {
    return (
      <div className="text-center py-8 text-gray-500">
        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p>Gagal memuat statistik</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Template Statistics */}
      <div>
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Statistik Template</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">Tahun Akademik</p>
                  <p className="text-2xl font-bold text-blue-800">{statistik.tahunAkademik.total}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className="bg-green-100 text-green-800 text-xs">
                      {statistik.tahunAkademik.aktif} Aktif
                    </Badge>
                  </div>
                </div>
                <div className="p-3 bg-blue-200 rounded-full">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-600 text-sm font-medium">Template Ujian</p>
                  <p className="text-2xl font-bold text-emerald-800">{statistik.templateUjian.total}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className="bg-green-100 text-green-800 text-xs">
                      {statistik.templateUjian.aktif} Aktif
                    </Badge>
                  </div>
                </div>
                <div className="p-3 bg-emerald-200 rounded-full">
                  <BookOpen className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-violet-50 to-violet-100 border-violet-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-violet-600 text-sm font-medium">Template Raport</p>
                  <p className="text-2xl font-bold text-violet-800">{statistik.templateRaport.total}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className="bg-green-100 text-green-800 text-xs">
                      {statistik.templateRaport.aktif} Aktif
                    </Badge>
                  </div>
                </div>
                <div className="p-3 bg-violet-200 rounded-full">
                  <FileText className="w-6 h-6 text-violet-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-indigo-600 text-sm font-medium">Kriteria MHQ</p>
                  <p className="text-2xl font-bold text-indigo-800">4</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className="bg-blue-100 text-blue-800 text-xs">
                      Default
                    </Badge>
                  </div>
                </div>
                <div className="p-3 bg-indigo-200 rounded-full">
                  <Settings className="w-6 h-6 text-indigo-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Usage Statistics */}
      <div>
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Statistik Penggunaan</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-600 text-sm font-medium">Ujian Dibuat</p>
                  <p className="text-2xl font-bold text-orange-800">{statistik.ujianTerbuat.total}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3 h-3 text-green-600" />
                    <span className="text-xs text-green-600">+{statistik.ujianTerbuat.bulanIni} bulan ini</span>
                  </div>
                </div>
                <div className="p-3 bg-orange-200 rounded-full">
                  <CheckCircle className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-teal-600 text-sm font-medium">Rata-rata Nilai</p>
                  <p className="text-2xl font-bold text-teal-800">{statistik.ujianTerbuat.rataRataNilai}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Badge className="bg-green-100 text-green-800 text-xs">
                      Sangat Baik
                    </Badge>
                  </div>
                </div>
                <div className="p-3 bg-teal-200 rounded-full">
                  <TrendingUp className="w-6 h-6 text-teal-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium">Raport Generated</p>
                  <p className="text-2xl font-bold text-purple-800">{statistik.raportGenerated.total}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3 h-3 text-green-600" />
                    <span className="text-xs text-green-600">+{statistik.raportGenerated.bulanIni} bulan ini</span>
                  </div>
                </div>
                <div className="p-3 bg-purple-200 rounded-full">
                  <FileText className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">Tingkat Kelulusan</p>
                  <p className="text-2xl font-bold text-green-800">{statistik.raportGenerated.tingkatKelulusan}%</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Badge className="bg-green-100 text-green-800 text-xs">
                      Excellent
                    </Badge>
                  </div>
                </div>
                <div className="p-3 bg-green-200 rounded-full">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Template Breakdown */}
      <div>
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Breakdown Template Ujian</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(statistik.templateUjian.perJenis).map(([jenis, jumlah]) => {
            const jenisLabels: Record<string, string> = {
              tasmi: "Tasmi'",
              mhq: 'MHQ',
              uas: 'UAS',
              kenaikan_juz: 'Kenaikan Juz'
            }
            
            return (
              <Card key={jenis} className="border-slate-200 hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-slate-800">{jumlah}</p>
                  <p className="text-sm text-slate-600">{jenisLabels[jenis]}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}