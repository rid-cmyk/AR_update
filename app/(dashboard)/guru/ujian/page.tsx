'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FormPenilaianUjianDialog } from '@/components/guru/ujian/FormPenilaianUjianDialog'
import { DetailUjianDialog } from '@/components/guru/ujian/DetailUjianDialog'
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
        ujian.santri.namaLengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ujian.santri.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ujian.santri.halaqah.namaHalaqah.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ujian.templateUjian.namaTemplate.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (filterJenis && filterJenis !== 'all') {
      filtered = filtered.filter(ujian => ujian.templateUjian.jenisUjian === filterJenis)
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
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Memuat data ujian...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Manajemen Ujian</h1>
          <p className="text-muted-foreground">Kelola ujian hafalan santri</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Ujian Baru
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Cari santri..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <Select value={filterJenis || undefined} onValueChange={(value) => setFilterJenis(value || '')}>
                <SelectTrigger>
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Jenis Ujian" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Jenis</SelectItem>
                  <SelectItem value="tasmi">Tasmi'</SelectItem>
                  <SelectItem value="mhq">MHQ</SelectItem>
                  <SelectItem value="uas">UAS</SelectItem>
                  <SelectItem value="kenaikan_juz">Kenaikan Juz</SelectItem>
                  <SelectItem value="tahfidz">Tahfidz</SelectItem>
                  <SelectItem value="lainnya">Lainnya</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-48">
              <Select value={filterStatus || undefined} onValueChange={(value) => setFilterStatus(value || '')}>
                <SelectTrigger>
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="submitted">Menunggu Verifikasi</SelectItem>
                  <SelectItem value="selesai">Selesai</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Ujian</p>
                <p className="text-2xl font-bold">{ujianList.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Rata-rata Nilai</p>
                <p className="text-2xl font-bold">
                  {ujianList.length > 0 
                    ? Math.round(ujianList.reduce((sum, ujian) => sum + ujian.nilaiAkhir, 0) / ujianList.length)
                    : 0
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <User className="w-8 h-8 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Santri Diuji</p>
                <p className="text-2xl font-bold">
                  {new Set(ujianList.map(ujian => ujian.santri.username)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Bulan Ini</p>
                <p className="text-2xl font-bold">
                  {ujianList.filter(ujian => 
                    new Date(ujian.tanggalUjian).getMonth() === new Date().getMonth() &&
                    new Date(ujian.tanggalUjian).getFullYear() === new Date().getFullYear()
                  ).length}
                </p>
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
            <Card key={ujian.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-semibold">{ujian.santri.namaLengkap}</h3>
                      <Badge variant="outline">@{ujian.santri.username}</Badge>
                      <Badge variant="secondary">{ujian.santri.halaqah.namaHalaqah}</Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Template Ujian</p>
                        <p className="font-medium">{ujian.templateUjian.namaTemplate}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Jenis Ujian</p>
                        <p className="font-medium">{getJenisUjianLabel(ujian.templateUjian.jenisUjian)}</p>
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
                      {ujian.nilaiUjian.length} komponen dinilai
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
      <FormPenilaianUjianDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleSubmitUjian}
      />

      {/* Detail Dialog */}
      <DetailUjianDialog
        open={isDetailDialogOpen}
        onOpenChange={setIsDetailDialogOpen}
        ujian={selectedUjian as any}
      />
    </div>
  )
}