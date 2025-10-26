'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Download, Printer, User, Calendar, FileText, TrendingUp } from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

interface Raport {
  id: number
  semester: string
  tahunAkademik: string
  santriId: number
  nilaiRataRata?: number
  totalNilaiAkhir?: number
  ranking?: number
  keteranganLulus?: string
  catatanGuru?: string
  status: string
  generatedAt?: string
  printedAt?: string
  santri: {
    namaLengkap: string
    username: string
  }
  templateRaport?: {
    namaTemplate: string
    namaLembaga: string
    logoLembaga?: string
    alamatLembaga?: string
    headerKopSurat?: string
    footerRaport?: string
    namaKepala?: string
    jabatanKepala?: string
    formatTampilan: any
  }
  details: Array<{
    jenisUjian: string
    nilaiUjian: number
    jumlahUjian: number
    nilaiRataRata: number
    catatan?: string
  }>
  ujian: Array<{
    jenis: string
    nilaiAkhir: number
    tanggal: string
    status: string
  }>
}

interface PreviewRaportSantriDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  raport?: Raport | null
}

export function PreviewRaportSantriDialog({
  open,
  onOpenChange,
  raport
}: PreviewRaportSantriDialogProps) {
  if (!raport) return null

  const { templateRaport, formatTampilan } = raport.templateRaport || { formatTampilan: {} }

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

  const getSemesterLabel = (semester: string) => {
    return semester === 'S1' ? 'Semester 1' : 'Semester 2'
  }

  const getNilaiGrade = (nilai: number) => {
    if (nilai >= 90) return { grade: 'A', color: 'text-green-600', bg: 'bg-green-50' }
    if (nilai >= 80) return { grade: 'B', color: 'text-blue-600', bg: 'bg-blue-50' }
    if (nilai >= 70) return { grade: 'C', color: 'text-yellow-600', bg: 'bg-yellow-50' }
    if (nilai >= 60) return { grade: 'D', color: 'text-orange-600', bg: 'bg-orange-50' }
    return { grade: 'E', color: 'text-red-600', bg: 'bg-red-50' }
  }

  const nilaiGrade = getNilaiGrade(raport.nilaiRataRata || 0)

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
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Preview Raport - {raport.santri.namaLengkap}
            </DialogTitle>
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

        <div className={`bg-white border rounded-lg ${getFontSizeClass(formatTampilan?.fontSize || 'medium')}`}>
          {/* Header */}
          {formatTampilan?.showHeader && templateRaport?.headerKopSurat && (
            <div className={`text-center p-6 border-b-2 ${getColorClass(formatTampilan?.colorTheme || 'blue')}`}>
              <div className="flex items-center justify-center gap-4">
                {formatTampilan?.showLogo && templateRaport?.logoLembaga && (
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-xs text-gray-500">LOGO</span>
                  </div>
                )}
                <div>
                  <h1 className="text-2xl font-bold">{templateRaport?.namaLembaga}</h1>
                  {templateRaport?.alamatLembaga && (
                    <p className="text-sm text-gray-600">{templateRaport.alamatLembaga}</p>
                  )}
                  <div className="mt-2 text-sm">{templateRaport?.headerKopSurat}</div>
                </div>
              </div>
            </div>
          )}

          <div className="p-6 space-y-6">
            {/* Title */}
            <div className="text-center">
              <h2 className="text-xl font-bold">RAPORT HAFALAN AL-QUR'AN</h2>
              <p className="text-sm text-gray-600 mt-1">
                {getSemesterLabel(raport.semester)} - {raport.tahunAkademik}
              </p>
            </div>

            {/* Data Santri */}
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Nama Santri:</span>
                      <span>{raport.santri.namaLengkap}</span>
                    </div>
                    <div>
                      <span className="font-medium">NIS:</span>
                      <span className="ml-2">{raport.santri.username}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <span className="font-medium">Semester:</span>
                      <span className="ml-2">{getSemesterLabel(raport.semester)}</span>
                    </div>
                    <div>
                      <span className="font-medium">Tahun Akademik:</span>
                      <span className="ml-2">{raport.tahunAkademik}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabel Nilai */}
            <Card>
              <CardHeader>
                <CardTitle>REKAP NILAI UJIAN</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className={`bg-gray-50 ${getColorClass(formatTampilan?.colorTheme || 'blue')}`}>
                        <th className="border border-gray-300 p-3 text-left">Jenis Ujian</th>
                        <th className="border border-gray-300 p-3 text-center">Jumlah Ujian</th>
                        <th className="border border-gray-300 p-3 text-center">Nilai Rata-rata</th>
                        <th className="border border-gray-300 p-3 text-center">Keterangan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {raport.details.map((detail, index) => (
                        <tr key={index}>
                          <td className="border border-gray-300 p-3">{getJenisUjianLabel(detail.jenisUjian)}</td>
                          <td className="border border-gray-300 p-3 text-center">{detail.jumlahUjian}</td>
                          <td className="border border-gray-300 p-3 text-center font-bold">{detail.nilaiRataRata}</td>
                          <td className="border border-gray-300 p-3 text-center">
                            <Badge variant={detail.nilaiRataRata >= 80 ? "default" : "secondary"}>
                              {detail.nilaiRataRata >= 80 ? "Baik" : detail.nilaiRataRata >= 60 ? "Cukup" : "Kurang"}
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
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    RINGKASAN NILAI
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Nilai Rata-rata:</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-xl font-bold ${nilaiGrade.color}`}>
                        {raport.nilaiRataRata || 0}
                      </span>
                      <Badge variant="outline" className={nilaiGrade.color}>
                        Grade {nilaiGrade.grade}
                      </Badge>
                    </div>
                  </div>
                  
                  {formatTampilan?.showRanking && raport.ranking && (
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Ranking:</span>
                      <Badge variant="outline">{raport.ranking}</Badge>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Keterangan:</span>
                    <Badge variant={raport.keteranganLulus === "LULUS" ? "default" : "destructive"}>
                      {raport.keteranganLulus || "BELUM DITENTUKAN"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {formatTampilan?.showGrafik && (
                <Card>
                  <CardHeader>
                    <CardTitle>GRAFIK PERKEMBANGAN</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-32 bg-gray-100 rounded flex items-center justify-center">
                      <span className="text-sm text-gray-500">[Grafik Perkembangan Nilai]</span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Detail Ujian */}
            <Card>
              <CardHeader>
                <CardTitle>DETAIL UJIAN</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {raport.ujian.map((ujian, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{getJenisUjianLabel(ujian.jenis)}</span>
                        <span className="text-sm text-muted-foreground">
                          ({format(new Date(ujian.tanggal), 'dd MMM yyyy', { locale: id })})
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{ujian.nilaiAkhir}</span>
                        <Badge variant={ujian.status === 'verified' ? 'default' : 'secondary'}>
                          {ujian.status === 'verified' ? 'Verified' : ujian.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Catatan Guru */}
            {formatTampilan?.showCatatanGuru && raport.catatanGuru && (
              <Card>
                <CardHeader>
                  <CardTitle>CATATAN GURU PEMBIMBING</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed">{raport.catatanGuru}</p>
                </CardContent>
              </Card>
            )}

            {/* Tanda Tangan */}
            {formatTampilan?.showTandaTangan && (
              <div className="flex justify-end mt-8">
                <div className="text-center">
                  <p className="mb-1">Mengetahui,</p>
                  <p className="font-medium">{templateRaport?.jabatanKepala || "Kepala Tahfidz"}</p>
                  
                  {templateRaport?.tandaTanganKepala && (
                    <div className="w-24 h-16 bg-gray-100 rounded my-4 mx-auto flex items-center justify-center">
                      <span className="text-xs text-gray-500">TTD</span>
                    </div>
                  )}
                  
                  <div className="border-t border-black pt-1 mt-12">
                    <p className="font-medium">{templateRaport?.namaKepala || "[Nama Kepala]"}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Footer */}
            {formatTampilan?.showFooter && templateRaport?.footerRaport && (
              <div className={`text-center mt-8 pt-4 border-t ${getColorClass(formatTampilan?.colorTheme || 'blue')} text-sm`}>
                {templateRaport.footerRaport}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}