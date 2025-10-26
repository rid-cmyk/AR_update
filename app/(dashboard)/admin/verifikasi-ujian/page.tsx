'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CheckCircle, XCircle, Eye, Clock, AlertCircle, User, Calendar } from 'lucide-react'
import { DetailUjianDialog } from '@/components/guru/ujian/DetailUjianDialog'
import { VerifikasiUjianDialog } from '@/components/admin/verifikasi-ujian/VerifikasiUjianDialog'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

interface Ujian {
  id: number
  nilaiAkhir: number
  tanggalUjian: string
  keterangan?: string
  status: string
  catatanVerifikasi?: string
  verifiedAt?: string
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
  creator: {
    namaLengkap: string
  }
  verifier?: {
    namaLengkap: string
  }
}

export default function VerifikasiUjianPage() {
  const [ujianList, setUjianList] = useState<Ujian[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUjian, setSelectedUjian] = useState<Ujian | null>(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [showVerifikasiDialog, setShowVerifikasiDialog] = useState(false)
  const [filter, setFilter] = useState({
    status: 'submitted',
    search: '',
    jenisUjian: 'all'
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchUjian()
  }, [])

  const fetchUjian = async () => {
    try {
      const response = await fetch('/api/admin/verifikasi-ujian')
      if (response.ok) {
        const data = await response.json()
        setUjianList(data)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal memuat data ujian",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleVerifikasi = async (ujianId: number, status: 'verified' | 'rejected', catatan?: string) => {
    try {
      const response = await fetch(`/api/admin/verifikasi-ujian/${ujianId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, catatan })
      })

      if (response.ok) {
        toast({
          title: "Berhasil",
          description: `Ujian berhasil ${status === 'verified' ? 'diverifikasi' : 'ditolak'}`
        })
        fetchUjian()
        setShowVerifikasiDialog(false)
      } else {
        throw new Error('Gagal memverifikasi ujian')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal memverifikasi ujian",
        variant: "destructive"
      })
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted':
        return <Clock className="h-4 w-4 text-blue-500" />
      case 'verified':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      submitted: 'Menunggu Verifikasi',
      verified: 'Terverifikasi',
      rejected: 'Ditolak'
    }
    return labels[status] || status
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'default'
      case 'verified':
        return 'default'
      case 'rejected':
        return 'destructive'
      default:
        return 'secondary'
    }
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

  const filteredUjian = ujianList.filter(ujian => {
    if (filter.status !== 'all' && ujian.status !== filter.status) return false
    if (filter.jenisUjian !== 'all' && ujian.templateUjian.jenisUjian !== filter.jenisUjian) return false
    if (filter.search && 
        !ujian.santri.namaLengkap.toLowerCase().includes(filter.search.toLowerCase()) &&
        !ujian.santri.username.toLowerCase().includes(filter.search.toLowerCase()) &&
        !ujian.creator.namaLengkap.toLowerCase().includes(filter.search.toLowerCase()) &&
        !ujian.templateUjian.namaTemplate.toLowerCase().includes(filter.search.toLowerCase())
    ) return false
    return true
  })

  const pendingCount = ujianList.filter(u => u.status === 'submitted').length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div style={{ 
      padding: "32px", 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '20px',
        padding: '32px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(10px)',
        marginBottom: '24px'
      }}>
        <div className="flex justify-between items-center">
          <div>
            <h1 style={{ 
              fontSize: '36px', 
              fontWeight: '800',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '8px'
            }}>
              ✅ Verifikasi Ujian
            </h1>
            <p style={{ 
              color: '#4a5568', 
              fontSize: '18px',
              fontWeight: '500',
              margin: 0
            }}>
              Verifikasi ujian yang disubmit oleh guru dengan mudah
            </p>
          </div>
          {pendingCount > 0 && (
            <Badge 
              variant="destructive" 
              style={{
                fontSize: '16px',
                padding: '12px 20px',
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontWeight: '700',
                boxShadow: '0 8px 20px rgba(240, 147, 251, 0.3)'
              }}
            >
              🔔 {pendingCount} ujian menunggu verifikasi
            </Badge>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card style={{
        borderRadius: '16px',
        border: 'none',
        background: 'rgba(255, 255, 255, 0.95)',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(10px)',
        marginBottom: '24px'
      }}>
        <CardContent className="p-6">
          <div className="grid grid-cols-4 gap-4">
            <div>
              <Input
                placeholder="🔍 Cari santri atau guru..."
                value={filter.search}
                onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
                style={{
                  borderRadius: '12px',
                  border: '2px solid #e2e8f0',
                  padding: '12px 16px',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              />
            </div>
            <div>
              <Select
                value={filter.status}
                onValueChange={(value) => setFilter(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="submitted">Menunggu Verifikasi</SelectItem>
                  <SelectItem value="verified">Terverifikasi</SelectItem>
                  <SelectItem value="rejected">Ditolak</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select
                value={filter.jenisUjian}
                onValueChange={(value) => setFilter(prev => ({ ...prev, jenisUjian: value }))}
              >
                <SelectTrigger>
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
            <div className="flex items-center">
              <Badge variant="outline">
                {filteredUjian.length} ujian
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* List Ujian */}
      <div className="grid gap-6">
        {filteredUjian.map((ujian) => (
          <Card 
            key={ujian.id} 
            style={{
              borderRadius: '16px',
              border: ujian.status === 'submitted' ? '3px solid #4facfe' : 'none',
              background: 'rgba(255, 255, 255, 0.95)',
              boxShadow: ujian.status === 'submitted' 
                ? '0 15px 35px rgba(79, 172, 254, 0.2)' 
                : '0 10px 30px rgba(0, 0, 0, 0.1)',
              backdropFilter: 'blur(10px)',
              overflow: 'hidden'
            }}
          >
            <CardHeader style={{
              background: ujian.status === 'submitted' 
                ? 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
                : ujian.status === 'verified'
                ? 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
                : 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
              color: ujian.status === 'submitted' ? 'white' : '#1a202c',
              padding: '24px'
            }}>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-3" style={{ 
                    color: ujian.status === 'submitted' ? 'white' : '#1a202c',
                    fontSize: '20px',
                    fontWeight: '700'
                  }}>
                    {getStatusIcon(ujian.status)}
                    👨‍🎓 {ujian.santri.namaLengkap}
                    <Badge 
                      variant={getStatusVariant(ujian.status)}
                      style={{
                        background: ujian.status === 'submitted' 
                          ? 'rgba(255,255,255,0.2)' 
                          : ujian.status === 'verified'
                          ? 'rgba(34, 197, 94, 0.2)'
                          : 'rgba(239, 68, 68, 0.2)',
                        color: ujian.status === 'submitted' 
                          ? 'white' 
                          : ujian.status === 'verified'
                          ? '#059669'
                          : '#dc2626',
                        border: '1px solid rgba(255,255,255,0.3)',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}
                    >
                      {getStatusLabel(ujian.status)}
                    </Badge>
                  </CardTitle>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline">
                      {getJenisUjianLabel(ujian.templateUjian.jenisUjian)}
                    </Badge>
                    <Badge variant="outline">
                      {ujian.santri.halaqah.namaHalaqah}
                    </Badge>
                    <Badge variant="outline">
                      {format(new Date(ujian.tanggalUjian), 'dd MMM yyyy', { locale: id })}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedUjian(ujian)
                      setShowDetailDialog(true)
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  {ujian.status === 'submitted' && (
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedUjian(ujian)
                        setShowVerifikasiDialog(true)
                      }}
                    >
                      Verifikasi
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="font-medium text-muted-foreground">Guru</p>
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span>{ujian.creator.namaLengkap}</span>
                  </div>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Template</p>
                  <p>{ujian.templateUjian.namaTemplate}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Nilai Akhir</p>
                  <p className="text-lg font-bold">{ujian.nilaiAkhir}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Komponen</p>
                  <p>{ujian.nilaiUjian.length} aspek penilaian</p>
                </div>
              </div>
              
              {ujian.verifier && ujian.verifiedAt && (
                <div className="mt-4 p-3 bg-muted rounded text-sm">
                  <p><strong>Diverifikasi oleh:</strong> {ujian.verifier.namaLengkap}</p>
                  <p><strong>Waktu:</strong> {format(new Date(ujian.verifiedAt), 'dd MMM yyyy HH:mm', { locale: id })}</p>
                </div>
              )}

              {ujian.keterangan && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
                  <p><strong>Keterangan:</strong> {ujian.keterangan}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {filteredUjian.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">
                {filter.status === 'submitted' 
                  ? 'Tidak ada ujian yang menunggu verifikasi.'
                  : 'Tidak ada ujian yang sesuai dengan filter.'
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <DetailUjianDialog
        open={showDetailDialog}
        onOpenChange={setShowDetailDialog}
        ujian={selectedUjian as any}
      />

      <VerifikasiUjianDialog
        open={showVerifikasiDialog}
        onOpenChange={setShowVerifikasiDialog}
        ujian={selectedUjian}
        onVerifikasi={handleVerifikasi}
      />
    </div>
  )
}