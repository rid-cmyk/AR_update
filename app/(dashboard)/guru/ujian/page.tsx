 
'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
import AdminHeaderCard from "@/components/admin/layout/AdminHeaderCard";

interface Ujian {
  id: number
  nilaiAkhir: number
  tanggalUjian: string
  statusUjian: string
  catatanGuru?: string
  // Optional legacy/computed fields
  santriNama?: string
  santriId?: number
  jenisUjian?: string
  tipeUjian?: string
  halaqah?: string
  keterangan?: string
  catatan?: string
  juzRange?: string | { dari: number; sampai: number }
  santri?: {
    namaLengkap: string
    username: string
  }
  templateUjian?: {
    namaTemplate: string
    jenisUjian: string
  }
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
  const [selectedUjian, setSelectedUjian] = useState<Ujian | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterJenis, setFilterJenis] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [hasMounted, setHasMounted] = useState(false)
  const { toast } = useToast()

  const fetchUjianList = useCallback(async () => {
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
  }, [toast])

  const filterUjianList = useCallback(() => {
    let filtered = ujianList

    if (searchTerm) {
      filtered = filtered.filter(ujian =>
        (ujian.santriNama || ujian.santri?.namaLengkap || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ujian.santri?.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ujian.halaqah || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
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
  }, [ujianList, searchTerm, filterJenis, filterStatus])

  useEffect(() => {
    setHasMounted(true)
    fetchUjianList()
  }, [fetchUjianList])

  useEffect(() => {
    filterUjianList()
  }, [filterUjianList])

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
      <>
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Memuat data ujian...</p>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <AdminHeaderCard
        title="Manajemen Ujian"
        subtitle="Kelola ujian hafalan santri"
        actions={
          <Button 
            onClick={() => window.open('/ujian', '_blank')} 
          >
            <Plus className="w-4 h-4 mr-2 inline" />
            Ujian Baru
          </Button>
        }
      />

      {/* Filters */}
      <Card className="border border-sky-200 shadow-sm bg-sky-50">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="flex-1 w-full">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Cari nama santri, jenis ujian..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 text-lg text-slate-500 bg-sky-100 border border-sky-200 focus:border-sky-400 rounded-xl shadow-sm"
                />
              </div>
            </div>
            
            <div className="flex gap-3 w-full lg:w-auto">
              <div className="flex-1 lg:w-48">
                <Select value={filterJenis || undefined} onValueChange={(value) => setFilterJenis(value || '')}>
                  <SelectTrigger className="h-12 border border-sky-200 rounded-xl shadow-sm bg-sky-100">
                    <div className="flex items-center gap-2 text-slate-500">
                      <BookOpen className="w-4 h-4 text-blue-500" />
                      <SelectValue placeholder="Jenis Ujian" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Jenis</SelectItem>
                    <SelectItem value="Tasmi'">Tasmi&apos;</SelectItem>
                    <SelectItem value="MHQ">MHQ</SelectItem>
                    <SelectItem value="UAS">UAS</SelectItem>
                    <SelectItem value="Kenaikan Juz">Kenaikan Juz</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex-1 lg:w-48">
                <Select value={filterStatus || undefined} onValueChange={(value) => setFilterStatus(value || '')}>
                  <SelectTrigger className="h-12 border border-sky-200 rounded-xl shadow-sm bg-sky-100">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Filter className="w-4 h-4 text-blue-500" />
                      <SelectValue placeholder="Status" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="submitted">Menunggu</SelectItem>
                    <SelectItem value="selesai">Selesai</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-100 shadow-sm bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sky-400 text-sm font-medium">Total Ujian</p>
                <p className="text-3xl font-bold mt-1 text-sky-500">{ujianList.length}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl">
                <BookOpen className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-100 shadow-sm bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sky-400 text-sm font-medium">Rata-rata Nilai</p>
                <p className="text-3xl font-bold mt-1 text-sky-500">
                  {ujianList.length > 0 
                    ? Math.round(ujianList.reduce((sum, ujian) => sum + ujian.nilaiAkhir, 0) / ujianList.length)
                    : 0
                  }
                </p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl">
                <Trophy className="w-8 h-8 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-100 shadow-sm bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sky-400 text-sm font-medium">Santri Diuji</p>
                <p className="text-3xl font-bold mt-1 text-sky-500">
                  {new Set(ujianList.map(ujian => ujian.santriNama || ujian.santri?.username)).size}
                </p>
              </div>
              <div className="p-3 bg-purple-50 rounded-xl">
                <User className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-100 shadow-sm bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sky-400 text-sm font-medium">Bulan Ini</p>
                <p className="text-3xl font-bold mt-1 text-sky-500">
                  {ujianList.filter(ujian => 
                    new Date(ujian.tanggalUjian).getMonth() === new Date().getMonth() &&
                    new Date(ujian.tanggalUjian).getFullYear() === new Date().getFullYear()
                  ).length}
                </p>
              </div>
              <div className="p-3 bg-amber-50 rounded-xl">
                <Calendar className="w-8 h-8 text-amber-600" />
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
                <Button onClick={() => window.open('/ujian', '_blank')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Buat Ujian Baru
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredUjian.map((ujian) => (
            <Card key={ujian.id} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 shadow-sm bg-white">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Header Santri */}
                    <div className="flex items-center gap-4 mb-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                        {(ujian.santriNama || ujian.santri?.namaLengkap || 'S')[0]}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-sky-500">{ujian.santriNama || ujian.santri?.namaLengkap}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="inline-flex items-center gap-1 text-xs font-medium bg-gray-100 text-sky-400 px-2.5 py-1 rounded-full">
                            {ujian.halaqah || 'Halaqah Umar'}
                          </span>
                          <span className="inline-flex items-center gap-1 text-xs font-medium bg-gray-100 text-sky-400 px-2.5 py-1 rounded-full">
                            Juz {typeof ujian.juzRange === 'object' ? ujian.juzRange?.sampai : ujian.juzRange || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Detail Ujian */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <BookOpen className="w-5 h-5 text-blue-600" />
                          <p className="text-sm font-medium text-sky-400">Jenis Ujian</p>
                        </div>
                        <p className="font-bold text-sky-500">{ujian.jenisUjian || ujian.templateUjian?.namaTemplate}</p>
                        <span className={`inline-block mt-2 text-xs font-medium px-2.5 py-1 rounded-full ${ujian.tipeUjian === 'per-juz' ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'}`}>
                          {ujian.tipeUjian === 'per-juz' ? 'Per Juz' : 'Per Halaman'}
                        </span>
                      </div>
                      
                      <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <Trophy className={`w-5 h-5 ${getNilaiColor(ujian.nilaiAkhir)}`} />
                          <p className="text-sm font-medium text-sky-400">Nilai Akhir</p>
                        </div>
                        <p className={`text-2xl font-bold ${getNilaiColor(ujian.nilaiAkhir)}`}>
                          {ujian.nilaiAkhir}
                        </p>
                        <p className="text-xs text-sky-300 mt-1">
                          {ujian.tipeUjian === 'per-juz' ? 'Per Juz' : 'Per Halaman'} - Ujian selesai
                        </p>
                      </div>
                      
                      <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="w-5 h-5 text-gray-600" />
                          <p className="text-sm font-medium text-gray-600">Tanggal Ujian</p>
                        </div>
                        <p className="font-bold text-gray-800">
                          {new Date(ujian.tanggalUjian).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                        <p className="text-xs text-sky-300 mt-1">
                          {new Date(ujian.tanggalUjian).toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>

                    {ujian.catatanGuru && (
                      <div className="mb-4">
                        <p className="text-sm text-muted-foreground">Catatan Guru</p>
                        <p className="text-sm">{ujian.catatanGuru}</p>
                      </div>
                    )}
                  </div>

                  <div className="text-right flex flex-col items-end gap-2">
                    <Badge variant={STATUS_COLORS[ujian.statusUjian as keyof typeof STATUS_COLORS] as any}>
                      {getStatusLabel(ujian.statusUjian)}
                    </Badge>
                    <Button 
                      variant="outline" 
                      size="sm"
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

      {/* Detail Dialog */}
      <DetailUjianDialog
        open={isDetailDialogOpen}
        onOpenChange={setIsDetailDialogOpen}
        ujian={selectedUjian as any}
      />
    </div>
    </>
  )
}