'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Eye, 
  User, 
  Calendar, 
  BookOpen, 
  Calculator,
  FileText,
  Download,
  Edit,
  Trash2,
  Clock
} from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

interface UjianDetail {
  id: number
  nilaiAkhir: number
  catatanGuru: string
  tanggalUjian: string
  statusUjian: string
  juzDari?: number
  juzSampai?: number
  createdAt: string
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
    urutan?: number
    komponenPenilaian?: {
      namaKomponen: string
      bobotNilai: number
      nilaiMaksimal: number
    }
  }>
}

interface DetailUjianDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ujian: UjianDetail | null
}

const kategoriLabels: Record<string, string> = {
  tasmi: "Tasmi'",
  mhq: 'MHQ (Muraaja\'ah Hafalan)',
  uas: 'UAS',
  kenaikan_juz: 'Kenaikan Juz'
}

const statusColors: Record<string, string> = {
  SELESAI: 'bg-green-100 text-green-800',
  BERLANGSUNG: 'bg-yellow-100 text-yellow-800',
  DIJADWALKAN: 'bg-blue-100 text-blue-800'
}

export function DetailUjianDialog({ 
  open, 
  onOpenChange, 
  ujian
}: DetailUjianDialogProps) {



  const renderNilaiDetail = () => {
    if (!ujian || !ujian.nilaiUjian) return null

    if (ujian.templateUjian.jenisUjian === 'mhq') {
      // For MHQ, show komponen penilaian
      return (
        <div className="space-y-3">
          <h4 className="font-medium">Detail Nilai per Komponen:</h4>
          <div className="space-y-2">
            {ujian.nilaiUjian.map((nilai, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium">{nilai.komponenPenilaian?.namaKomponen || `Komponen ${index + 1}`}</p>
                  {nilai.komponenPenilaian && (
                    <p className="text-sm text-gray-600">
                      Bobot: {nilai.komponenPenilaian.bobotNilai}% | Max: {nilai.komponenPenilaian.nilaiMaksimal}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">{nilai.nilaiRaw}</p>
                  <p className="text-sm text-gray-600">Terbobot: {nilai.nilaiTerbobot}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    } else if (ujian.templateUjian.jenisUjian === 'uas') {
      // For UAS, show per halaman
      return (
        <div className="space-y-3">
          <h4 className="font-medium">Detail Nilai per Halaman:</h4>
          <div className="grid grid-cols-5 gap-2 max-h-64 overflow-y-auto">
            {ujian.nilaiUjian
              .sort((a, b) => (a.urutan || 0) - (b.urutan || 0))
              .map((nilai, index) => (
                <div key={index} className="text-sm bg-gray-50 p-2 rounded text-center">
                  <div className="font-medium text-xs text-gray-600">
                    {nilai.catatan || `Hal ${index + 1}`}
                  </div>
                  <div className="text-lg font-bold">{nilai.nilaiRaw}</div>
                </div>
              ))}
          </div>
        </div>
      )
    }

    return null
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
                    <h2 className="text-xl font-bold">{ujian.santri.namaLengkap}</h2>
                    <p className="text-gray-600">@{ujian.santri.username}</p>
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
                    <p className="font-medium">{format(new Date(ujian.tanggalUjian), "dd MMM yyyy", { locale: id })}</p>
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
                  <p>{ujian.santri.halaqah?.namaHalaqah || 'N/A'}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Dibuat:</span>
                  <p>{format(new Date(ujian.createdAt), "dd MMM yyyy HH:mm", { locale: id })}</p>
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