'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, User, Calendar, FileText } from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

interface Ujian {
  id: number
  nilaiAkhir: number
  tanggalUjian: string
  keterangan?: string
  status: string
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
}

interface VerifikasiUjianDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ujian?: Ujian | null
  onVerifikasi: (ujianId: number, status: 'verified' | 'rejected', catatan?: string) => void
}

export function VerifikasiUjianDialog({
  open,
  onOpenChange,
  ujian,
  onVerifikasi
}: VerifikasiUjianDialogProps) {
  const [keterangan, setKeterangan] = useState('')
  const [loading, setLoading] = useState(false)

  if (!ujian) return null

  const handleVerify = async () => {
    setLoading(true)
    await onVerifikasi(ujian.id, 'verify', keterangan)
    setLoading(false)
    setKeterangan('')
    onOpenChange(false)
  }

  const handleReject = async () => {
    if (!keterangan.trim()) {
      alert('Keterangan wajib diisi untuk menolak ujian')
      return
    }
    setLoading(true)
    await onVerifikasi(ujian.id, 'reject', keterangan)
    setLoading(false)
    setKeterangan('')
    onOpenChange(false)
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

  const getNilaiGrade = (nilai: number) => {
    if (nilai >= 90) return { grade: 'A', color: 'text-green-600' }
    if (nilai >= 80) return { grade: 'B', color: 'text-blue-600' }
    if (nilai >= 70) return { grade: 'C', color: 'text-yellow-600' }
    if (nilai >= 60) return { grade: 'D', color: 'text-orange-600' }
    return { grade: 'E', color: 'text-red-600' }
  }

  const nilaiGrade = getNilaiGrade(ujian.nilaiAkhir)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Verifikasi Ujian - {ujian.santri.namaLengkap}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informasi Ujian */}
          <Card>
            <CardHeader>
              <CardTitle>Informasi Ujian</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Santri</p>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{ujian.santri.namaLengkap}</span>
                      <Badge variant="outline">({ujian.santri.username})</Badge>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Guru</p>
                    <p className="font-medium">{ujian.halaqah.guru.namaLengkap}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Halaqah</p>
                    <p className="font-medium">{ujian.halaqah.namaHalaqah}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Jenis Ujian</p>
                    <Badge variant="outline">{getJenisUjianLabel(ujian.jenis)}</Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Template</p>
                    <p className="font-medium">{ujian.templateUjian.namaTemplate}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Tanggal Ujian</p>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{format(new Date(ujian.tanggal), 'dd MMMM yyyy', { locale: id })}</span>
                    </div>
                  </div>
                </div>
              </div>

              {ujian.keterangan && (
                <div className="mt-4 p-3 bg-muted rounded">
                  <p className="text-sm font-medium text-muted-foreground mb-1">Keterangan dari Guru:</p>
                  <p className="text-sm">{ujian.keterangan}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Nilai Akhir */}
          <Card className="bg-primary/5">
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground mb-2">Nilai Akhir</p>
                <div className="flex items-center justify-center gap-3">
                  <span className={`text-4xl font-bold ${nilaiGrade.color}`}>
                    {ujian.nilaiAkhir}
                  </span>
                  <Badge variant="outline" className={`text-lg px-3 py-1 ${nilaiGrade.color}`}>
                    Grade {nilaiGrade.grade}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detail Penilaian */}
          <Card>
            <CardHeader>
              <CardTitle>Detail Penilaian per Komponen</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {ujian.nilaiUjian
                  .sort((a, b) => a.komponenPenilaian.namaKomponen.localeCompare(b.komponenPenilaian.namaKomponen))
                  .map((nilai) => {
                    const persentase = (nilai.nilai / nilai.komponenPenilaian.nilaiMaksimal) * 100
                    const kontribusiNilai = (nilai.nilai / nilai.komponenPenilaian.nilaiMaksimal) * nilai.komponenPenilaian.bobotNilai
                    
                    return (
                      <div key={nilai.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium">{nilai.komponenPenilaian.namaKomponen}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary">
                                Bobot: {nilai.komponenPenilaian.bobotNilai}%
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                Max: {nilai.komponenPenilaian.nilaiMaksimal}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold">{nilai.nilai}</div>
                            <div className="text-sm text-muted-foreground">
                              Kontribusi: {kontribusiNilai.toFixed(1)}
                            </div>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-2">
                          <div className="flex justify-between text-sm text-muted-foreground mb-1">
                            <span>Pencapaian</span>
                            <span>{persentase.toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                persentase >= 80 ? 'bg-green-500' :
                                persentase >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${Math.min(persentase, 100)}%` }}
                            ></div>
                          </div>
                        </div>

                        {nilai.catatan && (
                          <div className="p-2 bg-gray-50 rounded text-sm">
                            <p className="font-medium text-muted-foreground mb-1">Catatan:</p>
                            <p>{nilai.catatan}</p>
                          </div>
                        )}
                      </div>
                    )
                  })}
              </div>
            </CardContent>
          </Card>

          {/* Form Verifikasi */}
          <Card>
            <CardHeader>
              <CardTitle>Verifikasi Ujian</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="keterangan">Keterangan (Opsional untuk Approve, Wajib untuk Reject)</Label>
                <Textarea
                  id="keterangan"
                  value={keterangan}
                  onChange={(e) => setKeterangan(e.target.value)}
                  placeholder="Masukkan keterangan verifikasi..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={loading}
                >
                  Batal
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleReject}
                  disabled={loading}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  {loading ? 'Menolak...' : 'Tolak'}
                </Button>
                <Button
                  onClick={handleVerify}
                  disabled={loading}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {loading ? 'Memverifikasi...' : 'Verifikasi'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}