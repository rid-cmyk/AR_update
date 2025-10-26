'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit, Trash2, CheckCircle, Calendar } from 'lucide-react'
import { TahunAkademikDialog } from '@/components/admin/tahun-akademik/TahunAkademikDialog'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

interface TahunAkademik {
  id: number
  tahunAkademik: string
  tanggalMulai: string
  tanggalSelesai: string
  isActive: boolean
  semester: string
  createdAt: string
  creator: {
    namaLengkap: string
  }
}

export default function TahunAkademikPage() {
  const [tahunAkademik, setTahunAkademik] = useState<TahunAkademik[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTahun, setSelectedTahun] = useState<TahunAkademik | null>(null)
  const [showDialog, setShowDialog] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchTahunAkademik()
  }, [])

  const fetchTahunAkademik = async () => {
    try {
      const response = await fetch('/api/admin/tahun-akademik')
      if (response.ok) {
        const data = await response.json()
        setTahunAkademik(data)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal memuat data tahun akademik",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus tahun akademik ini?')) return

    try {
      const response = await fetch(`/api/admin/tahun-akademik/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast({
          title: "Berhasil",
          description: "Tahun akademik berhasil dihapus"
        })
        fetchTahunAkademik()
      } else {
        const error = await response.json()
        throw new Error(error.message || 'Gagal menghapus tahun akademik')
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Gagal menghapus tahun akademik",
        variant: "destructive"
      })
    }
  }

  const handleSetActive = async (id: number) => {
    try {
      const response = await fetch(`/api/admin/tahun-akademik/${id}/activate`, {
        method: 'PATCH'
      })

      if (response.ok) {
        toast({
          title: "Berhasil",
          description: "Tahun akademik berhasil diaktifkan"
        })
        fetchTahunAkademik()
      } else {
        const error = await response.json()
        throw new Error(error.message || 'Gagal mengaktifkan tahun akademik')
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Gagal mengaktifkan tahun akademik",
        variant: "destructive"
      })
    }
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMMM yyyy', { locale: id })
  }

  const getSemesterLabel = (semester: string) => {
    return semester === 'S1' ? 'Semester 1' : 'Semester 2'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Tahun Akademik</h1>
          <p className="text-muted-foreground">
            Kelola pengaturan tahun akademik dan semester
          </p>
        </div>
        <Button onClick={() => setShowDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Tahun Akademik
        </Button>
      </div>

      <div className="grid gap-4">
        {tahunAkademik.map((tahun) => (
          <Card key={tahun.id} className={tahun.isActive ? 'ring-2 ring-primary' : ''}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {tahun.tahunAkademik}
                    <Badge variant={tahun.isActive ? "default" : "secondary"}>
                      {tahun.isActive ? "Aktif" : "Nonaktif"}
                    </Badge>
                    <Badge variant="outline">
                      {getSemesterLabel(tahun.semester)}
                    </Badge>
                  </CardTitle>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(tahun.tanggalMulai)} - {formatDate(tahun.tanggalSelesai)}</span>
                    </div>
                    <span>Dibuat oleh: {tahun.creator.namaLengkap}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {!tahun.isActive && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetActive(tahun.id)}
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedTahun(tahun)
                      setShowDialog(true)
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(tahun.id)}
                    disabled={tahun.isActive}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="font-medium text-muted-foreground">Periode</p>
                  <p>{formatDate(tahun.tanggalMulai)} s/d {formatDate(tahun.tanggalSelesai)}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Status</p>
                  <p>{tahun.isActive ? 'Sedang Berlangsung' : 'Tidak Aktif'}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Dibuat</p>
                  <p>{formatDate(tahun.createdAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {tahunAkademik.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">
                Belum ada tahun akademik. Klik tombol "Tambah Tahun Akademik" untuk membuat tahun akademik baru.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <TahunAkademikDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        tahunAkademik={selectedTahun}
        onSuccess={() => {
          fetchTahunAkademik()
          setSelectedTahun(null)
        }}
      />
    </div>
  )
}