'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { App } from 'antd'
import { 
  Eye, 
  User, 
  Calendar, 
  BookOpen, 
  Calculator,
  FileText,
  Download,
  Clock,
  RotateCcw,
  Loader2
} from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

// Helper function for safe date formatting
const formatSafeDate = (dateString: string | undefined, formatString: string = "dd MMM yyyy HH:mm"): string => {
  if (!dateString) return 'N/A'
  
  try {
    const date = new Date(dateString)
    return isNaN(date.getTime()) ? 'Invalid Date' : format(date, formatString, { locale: id })
  } catch {
    return 'Invalid Date'
  }
}

interface UjianDetail {
  id: number
  nilaiAkhir: number
  catatanGuru: string
  tanggalUjian: string
  statusUjian: string
  juzDari?: number
  juzSampai?: number
  santriId?: number
  createdAt: string
  santriNama?: string // Fallback field
  halaqah?: string // Fallback field
  santri?: {
    namaLengkap: string
    username: string
    halaqah?: {
      namaHalaqah: string
    }
  }
  templateUjian: {
    namaTemplate: string
    jenisUjian: string
  }
  nilaiDetail?: Record<string, number>
  pengaturan?: Record<string, any>
}

interface DetailUjianDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ujian: UjianDetail | null
}

export function DetailUjianDialog({ 
  open, 
  onOpenChange, 
  ujian
}: DetailUjianDialogProps) {
  const router = useRouter()
  const { message } = App.useApp()
  const [startingRemedial, setStartingRemedial] = useState(false)

  const handleStartRemedial = async () => {
    if (!ujian) return
    setStartingRemedial(true)
    try {
      const res = await fetch(`/api/guru/ujian/${ujian.id}/remedial`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Gagal membuat ujian remedial')
      }
      const remedial = await res.json()
      const jenis = ujian.templateUjian?.jenisUjian || 'kenaikan_juz'
      const kkm = Number(ujian.pengaturan?.kkm) || 70
      const params = new URLSearchParams({
        mode: 'remedial',
        id: String(remedial.id),
        santri: String(remedial.santriId || ujian.santriId),
        nama: remedial.santri?.namaLengkap || ujian.santriNama || 'Santri',
        jenis,
        dari: String(remedial.juzDari || ujian.juzDari || 1),
        sampai: String(remedial.juzSampai || ujian.juzSampai || 1),
        kkm: String(kkm),
      })
      onOpenChange(false)
      router.push(`/ujian?${params.toString()}`)
    } catch (err: any) {
      message.error(err?.message || 'Gagal membuat ujian remedial')
    } finally {
      setStartingRemedial(false)
    }
  }

  const renderNilaiDetail = () => {
    const detail = ujian?.nilaiDetail
    const pengaturan = ujian?.pengaturan
    const nilaiPerJuz = pengaturan?.nilaiPerJuz as Record<string, { nilai: number; predikat: string; status: string; isRemedial?: boolean }> | undefined
    const juzRemedialList = Array.isArray(pengaturan?.juzRemedialList) ? pengaturan.juzRemedialList : []
    const rekomendasiRemedial = Boolean(pengaturan?.rekomendasiRemedial)

    if (!detail && !nilaiPerJuz) return null

    return (
      <div className="space-y-6">
        {/* Banner Remedial */}
        {rekomendasiRemedial && juzRemedialList.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-900 flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <div className="font-bold flex items-center gap-2">
                <span>⚠️ Perlu Remedial Per-Juz</span>
              </div>
              <Button
                size="sm"
                onClick={handleStartRemedial}
                disabled={startingRemedial}
                className="shrink-0"
              >
                {startingRemedial ? (
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                  <RotateCcw className="w-4 h-4 mr-1" />
                )}
                Mulai Ujian Remedial
              </Button>
            </div>
            <p className="text-sm">
              Terdapat {juzRemedialList.length} juz di bawah KKM ({pengaturan?.kkm || 70}): <span className="font-bold">Juz {juzRemedialList.join(', ')}</span>.
            </p>
          </div>
        )}

        {/* Rekap Nilai Per-Juz */}
        {nilaiPerJuz && Object.keys(nilaiPerJuz).length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-slate-800">Rekap Nilai & Kelulusan Per-Juz:</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {Object.entries(nilaiPerJuz).map(([juzKey, item]) => (
                <div key={juzKey} className={`text-sm p-3 rounded-lg border ${
                  item.status === 'LULUS'
                    ? 'bg-emerald-50/50 border-emerald-200'
                    : 'bg-amber-50/70 border-amber-300'
                }`}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-slate-700">Juz {juzKey}</span>
                    <span className={`text-xs px-2 py-0.5 rounded font-semibold ${
                      item.status === 'LULUS' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                    }`}>
                      {item.status === 'LULUS' ? 'Lulus' : 'Remedial'}
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-slate-900">{item.nilai}</div>
                  <div className="text-xs text-slate-600 font-medium">{item.predikat}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Detail Nilai Raw / Pertanyaan */}
        {detail && Object.keys(detail).length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-slate-700">Rincian Pertanyaan / Aspek Penilaian:</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-64 overflow-y-auto">
              {Object.entries(detail).map(([key, nilai]) => (
                <div key={key} className="text-sm bg-gray-50 p-2 rounded">
                  <div className="font-medium text-xs text-gray-600 break-words">{key}</div>
                  <div className="text-lg font-bold">{nilai}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  const getNilaiColor = (nilai: number) => {
    if (nilai >= 90) return 'text-green-600 bg-green-100'
    if (nilai >= 80) return 'text-blue-600 bg-blue-100'
    if (nilai >= 70) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  if (!ujian) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Data ujian tidak ditemukan</p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Detail Ujian
            </div>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Info */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <User className="w-8 h-8 text-primary" />
                  <div>
                    <h2 className="text-xl font-bold">
                      {ujian.santri?.namaLengkap || ujian.santriNama || 'Nama Santri'}
                    </h2>
                    <p className="text-gray-600">
                      @{ujian.santri?.username || 'username'}
                    </p>
                  </div>
                </div>
                <div className={`px-4 py-2 rounded-full text-2xl font-bold ${getNilaiColor(ujian.nilaiAkhir || 0)}`}>
                  {ujian.nilaiAkhir || 0}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="font-medium">{ujian.templateUjian.namaTemplate}</p>
                    <p className="text-sm text-gray-600">
                      {ujian.juzDari && ujian.juzSampai ? `Juz ${ujian.juzDari} - ${ujian.juzSampai}` : 'Semua Juz'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="font-medium">{formatSafeDate(ujian.tanggalUjian, "dd MMM yyyy")}</p>
                    <p className="text-sm text-gray-600">Tanggal Ujian</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <div>
                    <Badge variant={ujian.statusUjian === 'selesai' ? 'default' : 'secondary'}>
                      {ujian.statusUjian}
                    </Badge>
                    <p className="text-sm text-gray-600">Status</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="font-medium">
                      {(ujian.nilaiAkhir || 0) >= 80 ? 'Sangat Baik' : 
                       (ujian.nilaiAkhir || 0) >= 70 ? 'Baik' : 
                       (ujian.nilaiAkhir || 0) >= 60 ? 'Cukup' : 'Perlu Perbaikan'}
                    </p>
                    <p className="text-sm text-gray-600">Predikat</p>
                  </div>
                </div>
              </div>

              {ujian.catatanGuru && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm font-medium text-gray-700 mb-1">Catatan Guru:</p>
                  <p className="text-sm text-gray-600 bg-white p-3 rounded">{ujian.catatanGuru}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Detail Nilai */}
          <Card>
            <CardHeader>
              <CardTitle>Detail Penilaian</CardTitle>
            </CardHeader>
            <CardContent>
              {renderNilaiDetail()}
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle>Informasi Tambahan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Halaqah:</span>
                  <p>{ujian.santri?.halaqah?.namaHalaqah || ujian.halaqah || 'N/A'}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Dibuat:</span>
                  <p>{formatSafeDate(ujian.createdAt)}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">ID Ujian:</span>
                  <p>#{ujian.id}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Jenis Ujian:</span>
                  <p>{ujian.templateUjian.jenisUjian.toUpperCase()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}