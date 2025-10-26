'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Download, Printer } from 'lucide-react'

interface TemplateRaport {
  id: number
  namaTemplate: string
  namaLembaga: string
  logoLembaga?: string
  alamatLembaga?: string
  headerKopSurat?: string
  footerRaport?: string
  tandaTanganKepala?: string
  namaKepala?: string
  jabatanKepala?: string
  formatTampilan: any
  isActive: boolean
  tahunAkademik: string
}

interface PreviewRaportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  template?: TemplateRaport | null
}

export function PreviewRaportDialog({
  open,
  onOpenChange,
  template
}: PreviewRaportDialogProps) {
  if (!template) return null

  const { formatTampilan } = template

  const sampleData = {
    santri: {
      nama: "Ahmad Fauzi",
      nis: "2024001",
      halaqah: "Al-Baqarah",
      semester: "Semester 1",
      tahunAkademik: template.tahunAkademik
    },
    nilaiUjian: [
      { jenis: "Tasmi'", nilai: 85, jumlah: 3 },
      { jenis: "MHQ", nilai: 88, jumlah: 2 },
      { jenis: "UAS", nilai: 90, jumlah: 1 },
      { jenis: "Kenaikan Juz", nilai: 87, jumlah: 2 }
    ],
    nilaiRataRata: 87.5,
    ranking: 5,
    keteranganLulus: "LULUS",
    catatanGuru: "Santri menunjukkan perkembangan yang baik dalam hafalan Al-Quran. Perlu meningkatkan kelancaran dalam beberapa surat."
  }

  const getColorClass = (theme: string) => {
    const colors: Record<string, string> = {
      blue: 'text-blue-600 border-blue-200',
      green: 'text-green-600 border-green-200',
      red: 'text-red-600 border-red-200',
      purple: 'text-purple-600 border-purple-200',
      gray: 'text-gray-600 border-gray-200'
    }
    return colors[theme] || colors.blue
  }

  const getFontSizeClass = (size: string) => {
    const sizes: Record<string, string> = {
      small: 'text-sm',
      medium: 'text-base',
      large: 'text-lg'
    }
    return sizes[size] || sizes.medium
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle>Preview Template - {template.namaTemplate}</DialogTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              <Button variant="outline" size="sm">
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className={`bg-white p-8 border rounded-lg ${getFontSizeClass(formatTampilan.fontSize)}`}>
          {/* Header */}
          {formatTampilan.showHeader && template.headerKopSurat && (
            <div className={`text-center mb-6 pb-4 border-b-2 ${getColorClass(formatTampilan.colorTheme)}`}>
              <div className="flex items-center justify-center gap-4">
                {formatTampilan.showLogo && template.logoLembaga && (
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-xs text-gray-500">LOGO</span>
                  </div>
                )}
                <div>
                  <h1 className="text-2xl font-bold">{template.namaLembaga}</h1>
                  {template.alamatLembaga && (
                    <p className="text-sm text-gray-600">{template.alamatLembaga}</p>
                  )}
                  <div className="mt-2 text-sm">{template.headerKopSurat}</div>
                </div>
              </div>
            </div>
          )}

          {/* Title */}
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold">RAPORT HAFALAN AL-QUR'AN</h2>
            <p className="text-sm text-gray-600 mt-1">
              {sampleData.santri.semester} - {sampleData.santri.tahunAkademik}
            </p>
          </div>

          {/* Data Santri */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p><span className="font-medium">Nama Santri:</span> {sampleData.santri.nama}</p>
                  <p><span className="font-medium">NIS:</span> {sampleData.santri.nis}</p>
                </div>
                <div>
                  <p><span className="font-medium">Halaqah:</span> {sampleData.santri.halaqah}</p>
                  <p><span className="font-medium">Semester:</span> {sampleData.santri.semester}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabel Nilai */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <h3 className="font-bold mb-4">REKAP NILAI UJIAN</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className={`bg-gray-50 ${getColorClass(formatTampilan.colorTheme)}`}>
                      <th className="border border-gray-300 p-2 text-left">Jenis Ujian</th>
                      <th className="border border-gray-300 p-2 text-center">Jumlah Ujian</th>
                      <th className="border border-gray-300 p-2 text-center">Nilai Rata-rata</th>
                      <th className="border border-gray-300 p-2 text-center">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sampleData.nilaiUjian.map((nilai, index) => (
                      <tr key={index}>
                        <td className="border border-gray-300 p-2">{nilai.jenis}</td>
                        <td className="border border-gray-300 p-2 text-center">{nilai.jumlah}</td>
                        <td className="border border-gray-300 p-2 text-center">{nilai.nilai}</td>
                        <td className="border border-gray-300 p-2 text-center">
                          <Badge variant={nilai.nilai >= 80 ? "default" : "secondary"}>
                            {nilai.nilai >= 80 ? "Baik" : "Cukup"}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Ringkasan */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <h4 className="font-bold mb-2">RINGKASAN NILAI</h4>
                <div className="space-y-2">
                  <p><span className="font-medium">Nilai Rata-rata:</span> {sampleData.nilaiRataRata}</p>
                  {formatTampilan.showRanking && (
                    <p><span className="font-medium">Ranking:</span> {sampleData.ranking}</p>
                  )}
                  <p><span className="font-medium">Keterangan:</span> 
                    <Badge variant={sampleData.keteranganLulus === "LULUS" ? "default" : "destructive"} className="ml-2">
                      {sampleData.keteranganLulus}
                    </Badge>
                  </p>
                </div>
              </CardContent>
            </Card>

            {formatTampilan.showGrafik && (
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-bold mb-2">GRAFIK PERKEMBANGAN</h4>
                  <div className="h-24 bg-gray-100 rounded flex items-center justify-center">
                    <span className="text-sm text-gray-500">[Grafik Perkembangan]</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Catatan Guru */}
          {formatTampilan.showCatatanGuru && sampleData.catatanGuru && (
            <Card className="mb-6">
              <CardContent className="p-4">
                <h4 className="font-bold mb-2">CATATAN GURU PEMBIMBING</h4>
                <p className="text-sm">{sampleData.catatanGuru}</p>
              </CardContent>
            </Card>
          )}

          {/* Tanda Tangan */}
          {formatTampilan.showTandaTangan && (
            <div className="flex justify-end mt-8">
              <div className="text-center">
                <p className="mb-1">Mengetahui,</p>
                <p className="font-medium">{template.jabatanKepala || "Kepala Tahfidz"}</p>
                
                {template.tandaTanganKepala && (
                  <div className="w-24 h-16 bg-gray-100 rounded my-4 mx-auto flex items-center justify-center">
                    <span className="text-xs text-gray-500">TTD</span>
                  </div>
                )}
                
                <div className="border-t border-black pt-1 mt-12">
                  <p className="font-medium">{template.namaKepala || "[Nama Kepala]"}</p>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          {formatTampilan.showFooter && template.footerRaport && (
            <div className={`text-center mt-8 pt-4 border-t ${getColorClass(formatTampilan.colorTheme)} text-sm`}>
              {template.footerRaport}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}