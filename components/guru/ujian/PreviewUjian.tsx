'use client'

import { Card } from 'antd'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Eye, 
  User, 
  Calendar, 
  BookOpen, 
  Calculator,
  FileText,
  CheckCircle
} from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

interface Santri {
  id: number
  namaLengkap: string
  username: string
  halaqah: {
    namaHalaqah: string
  }
}

interface PreviewUjianProps {
  santri: Santri
  kategoriUjian: string
  juzMulai: number
  juzSelesai: number
  tanggalUjian: Date
  keterangan: string
  nilaiData: any
  nilaiAkhir: number
  onEdit: () => void
  onConfirm: () => void
}

const kategoriLabels: Record<string, string> = {
  tasmi: "Tasmi'",
  mhq: 'MHQ (Muraaja\'ah Hafalan)',
  uas: 'UAS',
  kenaikan_juz: 'Kenaikan Juz'
}

export function PreviewUjian({
  santri,
  kategoriUjian,
  juzMulai,
  juzSelesai,
  tanggalUjian,
  keterangan,
  nilaiData,
  nilaiAkhir,
  onEdit,
  onConfirm
}: PreviewUjianProps) {

  const renderNilaiDetail = () => {
    switch (kategoriUjian) {
      case 'tasmi':
        const totalHalaman = (juzSelesai - juzMulai + 1) * 20
        return (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Detail Nilai per Halaman:</h4>
            <div className="grid grid-cols-4 gap-2 max-h-32 overflow-y-auto">
              {Array.from({ length: totalHalaman }, (_, i) => {
                const halaman = i + 1
                const nilai = nilaiData[`halaman_${halaman}`] || 0
                return (
                  <div key={halaman} className="text-xs bg-gray-50 p-2 rounded">
                    <span className="font-medium">Hal {halaman}:</span> {nilai}
                  </div>
                )
              })}
            </div>
          </div>
        )

      case 'kenaikan_juz':
      case 'uas':
        return (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Detail Nilai per Juz:</h4>
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: juzSelesai - juzMulai + 1 }, (_, i) => {
                const juz = juzMulai + i
                const nilai = nilaiData[`juz_${juz}`] || 0
                return (
                  <div key={juz} className="text-xs bg-gray-50 p-2 rounded">
                    <span className="font-medium">Juz {juz}:</span> {nilai}
                  </div>
                )
              })}
            </div>
          </div>
        )

      case 'mhq':
        const jumlahPertanyaan = nilaiData.jumlahPertanyaan || 3
        const kriteria = ['tajwid', 'sifatul_huruf', 'kejelasan', 'kelancaran']
        return (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Detail Nilai MHQ:</h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {Array.from({ length: juzSelesai - juzMulai + 1 }, (_, i) => {
                const juz = juzMulai + i
                return (
                  <div key={juz} className="bg-gray-50 p-2 rounded">
                    <p className="font-medium text-xs mb-1">Juz {juz}:</p>
                    {Array.from({ length: jumlahPertanyaan }, (_, p) => {
                      const pertanyaan = p + 1
                      return (
                        <div key={pertanyaan} className="ml-2 mb-1">
                          <p className="text-xs font-medium">Pertanyaan {pertanyaan}:</p>
                          <div className="grid grid-cols-4 gap-1 text-xs">
                            {kriteria.map(k => {
                              const nilai = nilaiData[`juz_${juz}_pertanyaan_${pertanyaan}_${k}`] || 0
                              return (
                                <span key={k} className="bg-white p-1 rounded">
                                  {k.charAt(0).toUpperCase()}: {nilai}
                                </span>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const getNilaiColor = (nilai: number) => {
    if (nilai >= 90) return 'text-green-600 bg-green-100'
    if (nilai >= 80) return 'text-blue-600 bg-blue-100'
    if (nilai >= 70) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Eye className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Preview Ujian</h3>
      </div>

      {/* Ringkasan Ujian */}
      <Card className="border-primary/20 bg-primary/5" title={<span className="text-base flex items-center justify-between">
            <span>Ringkasan Ujian</span>
            <div className={`px-3 py-1 rounded-full text-lg font-bold ${getNilaiColor(nilaiAkhir)}`}>
              {nilaiAkhir}
            </div>
          </span>} styles={{ body: { padding: 24 } }}>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="font-medium">{santri.namaLengkap}</p>
                  <p className="text-sm text-gray-600">@{santri.username}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="font-medium">{kategoriLabels[kategoriUjian]}</p>
                  <p className="text-sm text-gray-600">Juz {juzMulai} - {juzSelesai}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="font-medium">{format(tanggalUjian, "EEEE, dd MMMM yyyy", { locale: id })}</p>
                  <p className="text-sm text-gray-600">Tanggal Ujian</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="font-medium">Nilai Akhir: {nilaiAkhir}</p>
                  <p className="text-sm text-gray-600">
                    {nilaiAkhir >= 80 ? 'Sangat Baik' : 
                     nilaiAkhir >= 70 ? 'Baik' : 
                     nilaiAkhir >= 60 ? 'Cukup' : 'Perlu Perbaikan'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {keterangan && (
            <div className="pt-3 border-t">
              <p className="text-sm font-medium text-gray-700 mb-1">Keterangan:</p>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{keterangan}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Detail Nilai */}
      <Card title={<span className="text-base">Detail Penilaian</span>} styles={{ body: { padding: 24 } }}>
        {renderNilaiDetail()}
      </Card>

      {/* Konfirmasi */}
      <Card className="border-green-200 bg-green-50/50">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <div>
              <h4 className="font-semibold text-green-800">Konfirmasi Penyimpanan</h4>
              <p className="text-sm text-green-700">
                Pastikan semua data sudah benar sebelum menyimpan ujian ini.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onEdit} className="flex-1">
              <FileText className="w-4 h-4 mr-2" />
              Edit Ujian
            </Button>
            <Button onClick={onConfirm} className="flex-1 bg-green-600 hover:bg-green-700">
              <CheckCircle className="w-4 h-4 mr-2" />
              Simpan Ujian
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}