'use client'

import { useState, useEffect } from 'react'
import { message } from 'antd'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card } from 'antd'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  ChevronLeft,
  ChevronRight,
  User,
  BookOpen,
  Settings,
  Calculator,
  Save,
  CalendarIcon,
  FileText,
  Clock
} from 'lucide-react'
import { MushafDigital } from './MushafDigital'
import { PreviewUjian } from './PreviewUjian'
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

interface TahunAjaran {
  id: number
  namaLengkap: string
}

type KategoriUjian = 'tasmi' | 'kenaikan_juz' | 'uas' | 'mhq'

interface UjianData {
  santriId: number
  kategoriUjian: KategoriUjian
  tahunAjaranId: number
  juzMulai: number
  juzSelesai: number
  tanggalUjian: Date
  keterangan: string
  nilaiData: any
}

interface FormPenilaianUjianBaruProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: UjianData) => void
}

const kategoriUjianOptions = [
  { value: 'tasmi', label: "Tasmi'", description: 'Penilaian per halaman' },
  { value: 'kenaikan_juz', label: 'Kenaikan Juz', description: 'Penilaian per juz' },
  { value: 'uas', label: 'UAS', description: 'Penilaian per juz' },
  { value: 'mhq', label: 'MHQ', description: 'Penilaian per pertanyaan dengan 4 kriteria' }
]

const juzOptions = Array.from({ length: 30 }, (_, i) => ({
  value: i + 1,
  label: `Juz ${i + 1}`
}))

export function FormPenilaianUjianBaru({ open, onOpenChange, onSubmit }: FormPenilaianUjianBaruProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [santriList, setSantriList] = useState<Santri[]>([])
  const [tahunAjaranList, setTahunAjaranList] = useState<TahunAjaran[]>([])
  const [selectedSantri, setSelectedSantri] = useState<Santri | null>(null)
  const [kategoriUjian, setKategoriUjian] = useState<KategoriUjian | ''>('')
  const [tahunAjaranId, setTahunAjaranId] = useState<number>(0)
  const [juzMulai, setJuzMulai] = useState<number>(1)
  const [juzSelesai, setJuzSelesai] = useState<number>(1)
  const [tanggalUjian, setTanggalUjian] = useState<Date>(new Date())
  const [keterangan, setKeterangan] = useState('')
  const [nilaiData, setNilaiData] = useState<any>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isAutoSaving, setIsAutoSaving] = useState(false)
  const [currentHalaman, setCurrentHalaman] = useState(1)

  const totalSteps = 6

  useEffect(() => {
    if (open) {
      fetchSantriList()
      fetchTahunAjaran()
      resetForm()
    }
  }, [open])

  // Auto-save functionality
  useEffect(() => {
    if (currentStep === 5 && Object.keys(nilaiData).length > 0) {
      const autoSaveTimer = setTimeout(() => {
        autoSaveDraft()
      }, 10000) // Auto-save setiap 10 detik

      return () => clearTimeout(autoSaveTimer)
    }
  }, [nilaiData, currentStep])

  const autoSaveDraft = async () => {
    if (!selectedSantri || !kategoriUjian || isAutoSaving) return

    setIsAutoSaving(true)
    try {
      const draftData = {
        santriId: selectedSantri.id,
        kategoriUjian,
        tahunAjaranId,
        juzMulai,
        juzSelesai,
        tanggalUjian,
        keterangan,
        nilaiData,
        isDraft: true
      }

      // Simpan ke localStorage sebagai backup
      localStorage.setItem('ujian_draft', JSON.stringify(draftData))
      setLastSaved(new Date())
      
    } catch (error) {
      console.error('Error auto-saving:', error)
    } finally {
      setIsAutoSaving(false)
    }
  }

  const fetchSantriList = async () => {
    try {
      const response = await fetch('/api/guru/santri')
      if (response.ok) {
        const data = await response.json()
        setSantriList(data)
      }
    } catch (error) {
      console.error('Error fetching santri:', error)
    }
  }

  const fetchTahunAjaran = async () => {
    try {
      const response = await fetch('/api/admin/tahun-akademik')
      if (response.ok) {
        const data = await response.json()
        setTahunAjaranList(data)
      }
    } catch (error) {
      console.error('Error fetching tahun ajaran:', error)
    }
  }

  const resetForm = () => {
    setCurrentStep(1)
    setSelectedSantri(null)
    setKategoriUjian('')
    setTahunAjaranId(0)
    setJuzMulai(1)
    setJuzSelesai(1)
    setTanggalUjian(new Date())
    setKeterangan('')
    setNilaiData({})
    setIsSubmitting(false)
  }

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return selectedSantri !== null
      case 2:
        return kategoriUjian !== ''
      case 3:
        return tahunAjaranId > 0 && juzMulai > 0 && juzSelesai >= juzMulai
      case 4:
        return tanggalUjian !== null
      case 5:
        return validateNilaiData()
      case 6:
        return true // Preview step is always valid
      default:
        return false
    }
  }

  const validateNilaiData = () => {
    if (!kategoriUjian) return false
    
    switch (kategoriUjian) {
      case 'tasmi':
        // Validasi nilai per halaman
        const totalHalaman = getTotalHalaman()
        for (let i = 1; i <= totalHalaman; i++) {
          if (!nilaiData[`halaman_${i}`] || nilaiData[`halaman_${i}`] < 0 || nilaiData[`halaman_${i}`] > 100) {
            return false
          }
        }
        return true
      
      case 'kenaikan_juz':
      case 'uas':
        // Validasi nilai per juz
        for (let juz = juzMulai; juz <= juzSelesai; juz++) {
          if (!nilaiData[`juz_${juz}`] || nilaiData[`juz_${juz}`] < 0 || nilaiData[`juz_${juz}`] > 100) {
            return false
          }
        }
        return true
      
      case 'mhq':
        // Validasi nilai MHQ dengan 4 kriteria
        const jumlahPertanyaan = nilaiData.jumlahPertanyaan || 0
        if (jumlahPertanyaan <= 0) return false
        
        for (let juz = juzMulai; juz <= juzSelesai; juz++) {
          for (let p = 1; p <= jumlahPertanyaan; p++) {
            const kriteria = ['tajwid', 'sifatul_huruf', 'kejelasan', 'kelancaran']
            for (const k of kriteria) {
              const key = `juz_${juz}_pertanyaan_${p}_${k}`
              if (!nilaiData[key] || nilaiData[key] < 0 || nilaiData[key] > 100) {
                return false
              }
            }
          }
        }
        return true
      
      default:
        return false
    }
  }

  const getTotalHalaman = () => {
    // Estimasi 20 halaman per juz
    return (juzSelesai - juzMulai + 1) * 20
  }

  const calculateNilaiAkhir = () => {
    if (!kategoriUjian) return 0

    switch (kategoriUjian) {
      case 'tasmi':
        const totalHalaman = getTotalHalaman()
        let totalNilaiHalaman = 0
        for (let i = 1; i <= totalHalaman; i++) {
          totalNilaiHalaman += nilaiData[`halaman_${i}`] || 0
        }
        return Math.round(totalNilaiHalaman / totalHalaman)

      case 'kenaikan_juz':
      case 'uas':
        let totalNilaiJuz = 0
        let jumlahJuz = 0
        for (let juz = juzMulai; juz <= juzSelesai; juz++) {
          totalNilaiJuz += nilaiData[`juz_${juz}`] || 0
          jumlahJuz++
        }
        return Math.round(totalNilaiJuz / jumlahJuz)

      case 'mhq':
        const jumlahPertanyaan = nilaiData.jumlahPertanyaan || 0
        const bobotKriteria = { tajwid: 30, sifatul_huruf: 25, kejelasan: 25, kelancaran: 20 }
        let totalNilaiMHQ = 0
        let totalPertanyaan = 0

        for (let juz = juzMulai; juz <= juzSelesai; juz++) {
          for (let p = 1; p <= jumlahPertanyaan; p++) {
            let nilaiPertanyaan = 0
            Object.entries(bobotKriteria).forEach(([kriteria, bobot]) => {
              const nilai = nilaiData[`juz_${juz}_pertanyaan_${p}_${kriteria}`] || 0
              nilaiPertanyaan += (nilai * bobot) / 100
            })
            totalNilaiMHQ += nilaiPertanyaan
            totalPertanyaan++
          }
        }
        return totalPertanyaan > 0 ? Math.round(totalNilaiMHQ / totalPertanyaan) : 0

      default:
        return 0
    }
  }

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    if (!selectedSantri || !kategoriUjian || isSubmitting) return

    setIsSubmitting(true)
    const ujianData: UjianData = {
      santriId: selectedSantri.id,
      kategoriUjian: kategoriUjian as KategoriUjian,
      tahunAjaranId,
      juzMulai,
      juzSelesai,
      tanggalUjian,
      keterangan,
      nilaiData
    }

    try {
      await onSubmit(ujianData)
      onOpenChange(false)
      resetForm()
      message.success('Ujian berhasil disimpan!')
    } catch (error) {
      console.error('Error submitting ujian:', error)
      message.error('Gagal menyimpan ujian')
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Pilih Santri</h3>
            </div>

            <div className="grid gap-3 max-h-96 overflow-y-auto">
              {santriList.map((santri) => (
                <Card
                  key={santri.id}
                  className={`cursor-pointer transition-all ${selectedSantri?.id === santri.id
                    ? 'ring-2 ring-primary bg-primary/5'
                    : 'hover:bg-muted/50'
                    }`}
                  onClick={() => setSelectedSantri(santri)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{santri.namaLengkap}</p>
                        <p className="text-sm text-muted-foreground">@{santri.username}</p>
                      </div>
                      <Badge variant="outline">{santri.halaqah.namaHalaqah}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Pilih Kategori Ujian</h3>
            </div>

            <div className="grid gap-3">
              {kategoriUjianOptions.map((option) => (
                <Card
                  key={option.value}
                  className={`cursor-pointer transition-all ${kategoriUjian === option.value
                    ? 'ring-2 ring-primary bg-primary/5'
                    : 'hover:bg-muted/50'
                    }`}
                  onClick={() => setKategoriUjian(option.value as KategoriUjian)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{option.label}</p>
                        <p className="text-sm text-muted-foreground">{option.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Settings className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Pengaturan Ujian</h3>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Tahun Akademik</Label>
                <Select
                  value={tahunAjaranId.toString()}
                  onValueChange={(value) => setTahunAjaranId(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Tahun Akademik" />
                  </SelectTrigger>
                  <SelectContent>
                    {tahunAjaranList.map((tahun) => (
                      <SelectItem key={tahun.id} value={tahun.id.toString()}>
                        {tahun.namaLengkap}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Juz Mulai</Label>
                  <Select
                    value={juzMulai.toString()}
                    onValueChange={(value) => {
                      const newJuzMulai = parseInt(value)
                      setJuzMulai(newJuzMulai)
                      if (juzSelesai < newJuzMulai) {
                        setJuzSelesai(newJuzMulai)
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {juzOptions.map((juz) => (
                        <SelectItem key={juz.value} value={juz.value.toString()}>
                          {juz.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Juz Selesai</Label>
                  <Select
                    value={juzSelesai.toString()}
                    onValueChange={(value) => setJuzSelesai(parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {juzOptions
                        .filter(juz => juz.value >= juzMulai)
                        .map((juz) => (
                          <SelectItem key={juz.value} value={juz.value.toString()}>
                            {juz.label}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {kategoriUjian === 'mhq' && (
                <div>
                  <Label>Jumlah Pertanyaan per Juz</Label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={nilaiData.jumlahPertanyaan || 3}
                    onChange={(e) => setNilaiData(prev => ({
                      ...prev,
                      jumlahPertanyaan: parseInt(e.target.value) || 3
                    }))}
                  />
                </div>
              )}
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <CalendarIcon className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Tanggal & Keterangan</h3>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Tanggal Ujian</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(tanggalUjian, "PPP", { locale: id })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={tanggalUjian}
                      onSelect={(date) => date && setTanggalUjian(date)}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label>Keterangan</Label>
                <Textarea
                  placeholder="Catatan tambahan untuk ujian ini..."
                  value={keterangan}
                  onChange={(e) => setKeterangan(e.target.value)}
                  rows={4}
                />
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Ringkasan Ujian</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Santri:</span> {selectedSantri?.namaLengkap}
                  </div>
                  <div>
                    <span className="font-medium">Kategori:</span> {kategoriUjianOptions.find(k => k.value === kategoriUjian)?.label}
                  </div>
                  <div>
                    <span className="font-medium">Juz:</span> {juzMulai} - {juzSelesai}
                  </div>
                  <div>
                    <span className="font-medium">Tanggal:</span> {format(tanggalUjian, "dd/MM/yyyy")}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 5:
        return renderPenilaianForm()

      case 6:
        return renderPreviewStep()

      default:
        return null
    }
  }

  const renderPenilaianForm = () => {
    if (!kategoriUjian) return null

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {(() => {
            switch (kategoriUjian) {
              case 'tasmi':
                return renderTasmiForm()
              case 'kenaikan_juz':
              case 'uas':
                return renderJuzForm()
              case 'mhq':
                return renderMHQForm()
              default:
                return null
            }
          })()}
        </div>
        
        <div className="lg:col-span-1">
          <MushafDigital
            juzMulai={juzMulai}
            juzSelesai={juzSelesai}
            halamanAktif={currentHalaman}
            onHalamanChange={setCurrentHalaman}
          />
        </div>
      </div>
    )
  }

  const renderTasmiForm = () => {
    const totalHalaman = getTotalHalaman()
    const halaman = Array.from({ length: totalHalaman }, (_, i) => i + 1)

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Penilaian Tasmi' (Per Halaman)</h3>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Nilai Akhir</p>
            <p className="text-2xl font-bold text-primary">{calculateNilaiAkhir()}</p>
          </div>
        </div>

        <div className="grid gap-4 max-h-96 overflow-y-auto">
          {halaman.map((hal) => (
            <Card key={hal}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Label className="min-w-0 flex-1">Halaman {hal}</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="0-100"
                    className="w-24"
                    value={nilaiData[`halaman_${hal}`] || ''}
                    onChange={(e) => {
                      const nilai = parseInt(e.target.value) || 0
                      setNilaiData(prev => ({
                        ...prev,
                        [`halaman_${hal}`]: Math.min(Math.max(nilai, 0), 100)
                      }))
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const renderJuzForm = () => {
    const juzList = Array.from({ length: juzSelesai - juzMulai + 1 }, (_, i) => juzMulai + i)

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Penilaian {kategoriUjian === 'uas' ? 'UAS' : 'Kenaikan Juz'} (Per Juz)</h3>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Nilai Akhir</p>
            <p className="text-2xl font-bold text-primary">{calculateNilaiAkhir()}</p>
          </div>
        </div>

        <div className="grid gap-4">
          {juzList.map((juz) => (
            <Card key={juz}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Label className="min-w-0 flex-1">Juz {juz}</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="0-100"
                    className="w-24"
                    value={nilaiData[`juz_${juz}`] || ''}
                    onChange={(e) => {
                      const nilai = parseInt(e.target.value) || 0
                      setNilaiData(prev => ({
                        ...prev,
                        [`juz_${juz}`]: Math.min(Math.max(nilai, 0), 100)
                      }))
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const renderMHQForm = () => {
    const juzList = Array.from({ length: juzSelesai - juzMulai + 1 }, (_, i) => juzMulai + i)
    const jumlahPertanyaan = nilaiData.jumlahPertanyaan || 3
    const kriteria = [
      { key: 'tajwid', label: 'Tajwid', bobot: 30 },
      { key: 'sifatul_huruf', label: 'Sifatul Huruf', bobot: 25 },
      { key: 'kejelasan', label: 'Kejelasan Bacaan', bobot: 25 },
      { key: 'kelancaran', label: 'Kelancaran', bobot: 20 }
    ]

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Penilaian MHQ (Per Pertanyaan)</h3>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Nilai Akhir</p>
            <p className="text-2xl font-bold text-primary">{calculateNilaiAkhir()}</p>
          </div>
        </div>

        <div className="space-y-6 max-h-96 overflow-y-auto">
          {juzList.map((juz) => (
            <Card key={juz}>
              <CardHeader>
                <CardTitle className="text-base">Juz {juz}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Array.from({ length: jumlahPertanyaan }, (_, i) => i + 1).map((pertanyaan) => (
                  <Card key={pertanyaan} className="border-dashed">
                    <CardHeader>
                      <CardTitle className="text-sm">Pertanyaan {pertanyaan}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {kriteria.map((k) => (
                        <div key={k.key} className="flex items-center gap-4">
                          <Label className="min-w-0 flex-1 text-sm">
                            {k.label} ({k.bobot}%)
                          </Label>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            placeholder="0-100"
                            className="w-20 text-sm"
                            value={nilaiData[`juz_${juz}_pertanyaan_${pertanyaan}_${k.key}`] || ''}
                            onChange={(e) => {
                              const nilai = parseInt(e.target.value) || 0
                              setNilaiData(prev => ({
                                ...prev,
                                [`juz_${juz}_pertanyaan_${pertanyaan}_${k.key}`]: Math.min(Math.max(nilai, 0), 100)
                              }))
                            }}
                          />
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const renderPreviewStep = () => {
    if (!selectedSantri || !kategoriUjian) return null

    return (
      <PreviewUjian
        santri={selectedSantri}
        kategoriUjian={kategoriUjian}
        juzMulai={juzMulai}
        juzSelesai={juzSelesai}
        tanggalUjian={tanggalUjian}
        keterangan={keterangan}
        nilaiData={nilaiData}
        nilaiAkhir={calculateNilaiAkhir()}
        onEdit={() => setCurrentStep(5)}
        onConfirm={handleSubmit}
      />
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Form Penilaian Ujian Baru
            </div>
            {currentStep === 5 && (
              <div className="flex items-center gap-2 text-sm">
                {isAutoSaving ? (
                  <div className="flex items-center gap-1 text-blue-600">
                    <Clock className="w-4 h-4 animate-spin" />
                    <span>Menyimpan...</span>
                  </div>
                ) : lastSaved ? (
                  <div className="flex items-center gap-1 text-green-600">
                    <Clock className="w-4 h-4" />
                    <span>Tersimpan {format(lastSaved, 'HH:mm')}</span>
                  </div>
                ) : null}
              </div>
            )}
          </DialogTitle>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-6">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div key={i} className="flex items-center">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                ${i + 1 <= currentStep ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}
              `}>
                {i + 1}
              </div>
              {i < totalSteps - 1 && (
                <div className={`
                  w-12 h-1 mx-2
                  ${i + 1 < currentStep ? 'bg-primary' : 'bg-muted'}
                `} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="min-h-[400px]">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Sebelumnya
          </Button>

          <div className="flex gap-2">
            {currentStep === totalSteps ? (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(5)}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Edit Penilaian
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!isStepValid() || isSubmitting}
                  className="flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Ujian'}
                </Button>
              </div>
            ) : currentStep === 5 ? (
              <Button
                onClick={handleNext}
                disabled={!isStepValid()}
                className="flex items-center gap-2"
              >
                Preview & Simpan
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={!isStepValid()}
                className="flex items-center gap-2"
              >
                Selanjutnya
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}