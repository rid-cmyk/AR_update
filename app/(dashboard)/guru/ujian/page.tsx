'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { UjianManager } from '@/components/guru/ujian/UjianManager'
import { DetailUjianDialog } from '@/components/guru/ujian/DetailUjianDialog'
import LayoutApp from '@/components/layout/LayoutApp'
import { 
  Plus, 
  Search, 
  Filter,
  BookOpen,
  Calendar,
  User,
  Trophy,
  Eye
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Ujian {
  id: number
  nilaiAkhir: number
  catatanGuru: string
  tanggalUjian: string
  statusUjian: string
  santri: {
    namaLengkap: string
    username: string
    halaqah: {
      namaHalaqah: string
    }
  }
  templateUjian: {
    namaTemplate: string
    jenisUjian: string
  }
  nilaiUjian: Array<{
    nilaiRaw: number
    nilaiTerbobot: number
    catatan?: string
    komponenPenilaian: {
      namaKomponen: string
      bobotNilai: number
      nilaiMaksimal: number
    }
  }>
}

const getJenisUjianLabel = (jenis: string) => {
  const labels: Record<string, string> = {
    tasmi: "Tasmi'",
    mhq: "MHQ", 
    uas: "UAS",
    kenaikan_juz: "Kenaikan Juz",
    tahfidz: "Tahfidz",
    lainnya: "Lainnya"
  }
  return labels[jenis] || jenis
}

const STATUS_COLORS = {
  submitted: 'default',
  selesai: 'secondary',
  draft: 'outline'
}

const STATUS_LABELS = {
  submitted: 'Menunggu Verifikasi',
  selesai: 'Selesai',
  draft: 'Draft'
}

export default function UjianPage() {
  const [ujianList, setUjianList] = useState<Ujian[]>([])
  const [filteredUjian, setFilteredUjian] = useState<Ujian[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedUjian, setSelectedUjian] = useState<Ujian | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterJenis, setFilterJenis] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchUjianList()
  }, [])

  useEffect(() => {
    filterUjianList()
  }, [ujianList, searchTerm, filterJenis, filterStatus])

  const fetchUjianList = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/guru/ujian')
      if (response.ok) {
        const result = await response.json()
        setUjianList(result.data)
      } else {
        toast({
          title: 'Error',
          description: 'Gagal mengambil data ujian',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error fetching ujian:', error)
      toast({
        title: 'Error',
        description: 'Terjadi kesalahan saat mengambil data',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filterUjianList = () => {
    let filtered = ujianList

    if (searchTerm) {
      filtered = filtered.filter(ujian =>
        (ujian.santriNama || ujian.santri?.namaLengkap || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ujian.santri?.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ujian.santri?.halaqah?.namaHalaqah || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ujian.jenisUjian || ujian.templateUjian?.namaTemplate || '').toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (filterJenis && filterJenis !== 'all') {
      filtered = filtered.filter(ujian => (ujian.jenisUjian || ujian.templateUjian?.jenisUjian) === filterJenis)
    }

    if (filterStatus && filterStatus !== 'all') {
      filtered = filtered.filter(ujian => ujian.statusUjian === filterStatus)
    }

    setFilteredUjian(filtered)
  }

  const handleSubmitUjian = async (data: any) => {
    try {
      const response = await fetch('/api/guru/ujian', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        toast({
          title: 'Berhasil',
          description: 'Data ujian berhasil disimpan'
        })
        fetchUjianList()
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description: error.error || 'Gagal menyimpan data ujian',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error submitting ujian:', error)
      toast({
        title: 'Error',
        description: 'Terjadi kesalahan saat menyimpan data',
        variant: 'destructive'
      })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getNilaiColor = (nilai: number) => {
    if (nilai >= 85) return 'text-green-600'
    if (nilai >= 70) return 'text-blue-600'
    if (nilai >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getStatusLabel = (statusUjian: string) => {
    return STATUS_LABELS[statusUjian as keyof typeof STATUS_LABELS] || statusUjian
  }

  if (isLoading) {
    return (
      <LayoutApp>
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Memuat data ujian...</p>
            </div>
          </div>
        </div>
      </LayoutApp>
    )
  }

  return (
    <LayoutApp>
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <BookOpen className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-4xl font-bold tracking-tight">Manajemen Ujian</h1>
                <p className="text-blue-100 text-lg">Halaqah Umar - Kelola ujian hafalan santri</p>
              </div>
            </div>
          </div>
          <Button 
            onClick={() => setIsDialogOpen(true)} 
            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border-white/30 text-white shadow-lg transition-all duration-300 hover:scale-105 flex items-center gap-2 px-6 py-3 text-lg"
            size="lg"
          >
            <Plus className="w-5 h-5" />
            Ujian Baru
          </Button>
        </div>
        {/* Decorative elements */}
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="flex-1 w-full">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="🔍 Cari nama santri, jenis ujian..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 text-lg border-2 border-gray-200 focus:border-blue-500 rounded-xl shadow-sm"
                />
              </div>
            </div>
            
            <div className="flex gap-3 w-full lg:w-auto">
              <div className="flex-1 lg:w-48">
                <Select value={filterJenis || undefined} onValueChange={(value) => setFilterJenis(value || '')}>
                  <SelectTrigger className="h-12 border-2 border-gray-200 rounded-xl shadow-sm">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-blue-500" />
                      <SelectValue placeholder="Jenis Ujian" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">📚 Semua Jenis</SelectItem>
                    <SelectItem value="Tasmi'">📄 Tasmi'</SelectItem>
                    <SelectItem value="MHQ">🏆 MHQ</SelectItem>
                    <SelectItem value="UAS">📝 UAS</SelectItem>
                    <SelectItem value="Kenaikan Juz">⬆️ Kenaikan Juz</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex-1 lg:w-48">
                <Select value={filterStatus || undefined} onValueChange={(value) => setFilterStatus(value || '')}>
                  <SelectTrigger className="h-12 border-2 border-gray-200 rounded-xl shadow-sm">
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4 text-green-500" />
                      <SelectValue placeholder="Status" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">✅ Semua Status</SelectItem>
                    <SelectItem value="draft">📝 Draft</SelectItem>
                    <SelectItem value="submitted">⏳ Menunggu</SelectItem>
                    <SelectItem value="selesai">✅ Selesai</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600"></div>
          <CardContent className="relative p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Ujian</p>
                <p className="text-3xl font-bold mt-1">{ujianList.length}</p>
              </div>
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <BookOpen className="w-8 h-8" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-600"></div>
          <CardContent className="relative p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Rata-rata Nilai</p>
                <p className="text-3xl font-bold mt-1">
                  {ujianList.length > 0 
                    ? Math.round(ujianList.reduce((sum, ujian) => sum + ujian.nilaiAkhir, 0) / ujianList.length)
                    : 0
                  }
                </p>
              </div>
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <Trophy className="w-8 h-8" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-violet-600"></div>
          <CardContent className="relative p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Santri Diuji</p>
                <p className="text-3xl font-bold mt-1">
                  {new Set(ujianList.map(ujian => ujian.santriNama || ujian.santri?.username)).size}
                </p>
              </div>
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <User className="w-8 h-8" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-500"></div>
          <CardContent className="relative p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Bulan Ini</p>
                <p className="text-3xl font-bold mt-1">
                  {ujianList.filter(ujian => 
                    new Date(ujian.tanggalUjian).getMonth() === new Date().getMonth() &&
                    new Date(ujian.tanggalUjian).getFullYear() === new Date().getFullYear()
                  ).length}
                </p>
              </div>
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <Calendar className="w-8 h-8" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ujian List */}
      <div className="grid gap-4">
        {filteredUjian.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Belum ada ujian</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || filterJenis 
                  ? 'Tidak ada ujian yang sesuai dengan filter'
                  : 'Mulai buat ujian pertama untuk santri'
                }
              </p>
              {!searchTerm && !filterJenis && (
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Buat Ujian Baru
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredUjian.map((ujian) => (
            <Card key={ujian.id} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg bg-gradient-to-r from-white to-gray-50">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Header Santri */}
                    <div className="flex items-center gap-4 mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg">
                        {(ujian.santriNama || ujian.santri?.namaLengkap || 'S')[0]}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-800">{ujian.santriNama || ujian.santri?.namaLengkap}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200">
                            🏛️ {ujian.halaqah || ujian.santri?.halaqah?.namaHalaqah || 'Halaqah Umar'}
                          </Badge>
                          <Badge className="bg-green-100 text-green-700 hover:bg-green-200">
                            📚 Juz {ujian.juzRange?.sampai || 'N/A'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    {/* Detail Ujian */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                      <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                        <div className="flex items-center gap-2 mb-2">
                          <BookOpen className="w-5 h-5 text-purple-600" />
                          <p className="text-sm font-medium text-purple-700">Jenis Ujian</p>
                        </div>
                        <p className="font-bold text-gray-800">{ujian.jenisUjian || ujian.templateUjian?.namaTemplate}</p>
                        <Badge className={`mt-2 ${ujian.tipeUjian === 'per-juz' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                          {ujian.tipeUjian === 'per-juz' ? '📚 Per Juz' : '📄 Per Halaman'}
                        </Badge>
                      </div>
                      
                      <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
                        <div className="flex items-center gap-2 mb-2">
                          <Trophy className="w-5 h-5 text-green-600" />
                          <p className="text-sm font-medium text-green-700">Nilai Akhir</p>
                        </div>
                        <p className={`text-2xl font-bold ${getNilaiColor(ujian.nilaiAkhir)}`}>
                          {ujian.nilaiAkhir}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {ujian.nilaiUjian?.length || (ujian.tipeUjian === 'per-juz' ? 'Per Juz' : 'Per Halaman')} 
                          {ujian.nilaiUjian?.length ? ' komponen dinilai' : ' - Ujian selesai'}
                        </p>
                      </div>
                      
                      <div className="p-4 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl border border-orange-100">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="w-5 h-5 text-orange-600" />
                          <p className="text-sm font-medium text-orange-700">Tanggal Ujian</p>
                        </div>
                        <p className="font-bold text-gray-800">
                          {new Date(ujian.tanggalUjian).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(ujian.tanggalUjian).toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Tanggal Ujian</p>
                        <p className="font-medium">{formatDate(ujian.tanggalUjian)}</p>
                      </div>
                    </div>

                    {ujian.catatanGuru && (
                      <div className="mb-4">
                        <p className="text-sm text-muted-foreground">Catatan Guru</p>
                        <p className="text-sm">{ujian.catatanGuru}</p>
                      </div>
                    )}
                  </div>

                  <div className="text-right">
                    <div className="mb-2">
                      <Badge variant={STATUS_COLORS[ujian.statusUjian as keyof typeof STATUS_COLORS] as any}>
                        {getStatusLabel(ujian.statusUjian)}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Nilai Akhir</p>
                      <p className={`text-2xl font-bold ${getNilaiColor(ujian.nilaiAkhir)}`}>
                        {ujian.nilaiAkhir}
                      </p>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {ujian.nilaiUjian?.length || (ujian.tipeUjian === 'per-juz' ? 'Per Juz' : 'Per Halaman')} 
                      {ujian.nilaiUjian?.length ? ' komponen dinilai' : ' - Ujian selesai'}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => {
                        setSelectedUjian(ujian)
                        setIsDetailDialogOpen(true)
                      }}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Detail
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Form Dialog */}
      {isDialogOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm">
          <div className="h-full w-full overflow-auto">
            <div className="min-h-full flex items-start justify-center p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl my-8 overflow-hidden">
                <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between z-10">
                  <h2 className="text-xl font-bold text-gray-800">Buat Ujian Baru</h2>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setIsDialogOpen(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕ Tutup
                  </Button>
                </div>
                <div className="max-h-[80vh] overflow-auto">
                  <UjianManager 
                    onComplete={(data) => {
                      handleSubmitUjian(data)
                      setIsDialogOpen(false)
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail Dialog */}
      <DetailUjianDialog
        open={isDetailDialogOpen}
        onOpenChange={setIsDetailDialogOpen}
        ujian={selectedUjian as any}
      />
    </div>
    </LayoutApp>
  )
}