'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, BookOpen, User, Trophy, Book, FileText } from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { MushafDigital } from './MushafDigital'

interface Santri {
  id: number
  namaLengkap: string
  username: string
  halaqah: {
    namaHalaqah: string
  }
}

interface JenisUjian {
  id: string
  nama: string
  deskripsi?: string
  hasTemplate?: boolean
  disabled?: boolean
}

interface KomponenPenilaian {
  id: number
  namaKomponen: string
  bobotNilai: number
  nilaiMaksimal: number
  deskripsi?: string
  urutan: number
}

interface TemplateUjian {
  id: number
  namaTemplate: string
  jenisUjian: string
  deskripsi?: string
  komponenPenilaian: KomponenPenilaian[]
}

interface FormPenilaianUjianDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: any) => void
}

export function FormPenilaianUjianDialog({
  open,
  onOpenChange,
  onSubmit
}: FormPenilaianUjianDialogProps) {
  const [step, setStep] = useState(1)
  const [santriList, setSantriList] = useState<Santri[]>([])
  const [jenisUjianList, setJenisUjianList] = useState<JenisUjian[]>([])
  const [templateList, setTemplateList] = useState<TemplateUjian[]>([])
  const [loading, setLoading] = useState(false)
  
  // Form data
  const [selectedSantri, setSelectedSantri] = useState<string>('')
  const [selectedJenisUjian, setSelectedJenisUjian] = useState<string>('')
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateUjian | null>(null)
  const [juzDari, setJuzDari] = useState<number>(1)
  const [juzSampai, setJuzSampai] = useState<number>(1)
  const [tanggalUjian, setTanggalUjian] = useState<Date>(new Date()) // Otomatis hari ini
  const [keterangan, setKeterangan] = useState('')
  
  // Nilai untuk MHQ (komponen penilaian)
  const [nilaiKomponen, setNilaiKomponen] = useState<Record<number, number>>({})
  
  // Nilai untuk UAS (per halaman)
  const [nilaiHalaman, setNilaiHalaman] = useState<Record<number, number>>({})
  
  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      fetchInitialData()
      resetForm()
    }
  }, [open])

  const fetchInitialData = async () => {
    try {
      setLoading(true)
      
      // Fetch santri dari halaqah guru
      const santriRes = await fetch('/api/guru/santri')
      if (santriRes.ok) {
        const santriData = await santriRes.json()
        console.log('🔍 Frontend - Santri API Response:', santriData)
        console.log('🔍 Frontend - Santri Data:', santriData.data)
        
        setSantriList(santriData.data || [])
        
        if (santriData.data && santriData.data.length > 0) {
          console.log('✅ Frontend - Santri loaded:', santriData.data.length, 'santri')
          toast({
            title: 'Success',
            description: `${santriData.data.length} santri ditemukan`,
            variant: 'default'
          })
        } else {
          console.log('❌ Frontend - No santri found')
          toast({
            title: 'Info',
            description: santriData.message || 'Tidak ada santri di halaqah Anda',
            variant: 'default'
          })
        }
      } else {
        console.log('❌ Frontend - API call failed:', santriRes.status)
        const errorData = await santriRes.json()
        console.log('❌ Frontend - Error details:', errorData)
      }

      // Fetch jenis ujian
      const jenisRes = await fetch('/api/admin/jenis-ujian')
      if (jenisRes.ok) {
        const jenisData = await jenisRes.json()
        console.log('🔍 Frontend - Jenis Ujian Response:', jenisData)
        
        setJenisUjianList(jenisData.data || [])
        
        if (!jenisData.data || jenisData.data.length === 0) {
          console.log('❌ Frontend - No jenis ujian with templates found')
          toast({
            title: 'Info',
            description: jenisData.message || 'Belum ada jenis ujian dengan template aktif. Hubungi admin untuk menambahkan template ujian.',
            variant: 'default'
          })
        } else {
          console.log('✅ Frontend - Jenis ujian loaded:', jenisData.data.length, 'jenis')
          toast({
            title: 'Success',
            description: `${jenisData.data.length} jenis ujian tersedia`,
            variant: 'default'
          })
        }
      } else {
        console.log('❌ Frontend - Jenis ujian API failed:', jenisRes.status)
      }
    } catch (error) {
      console.error('Error fetching initial data:', error)
      toast({
        title: 'Error',
        description: 'Gagal memuat data awal',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchTemplateUjian = async (jenisUjian: string) => {
    try {
      const response = await fetch(`/api/admin/template-ujian?jenisUjian=${jenisUjian}`)
      if (response.ok) {
        const data = await response.json()
        console.log('🔍 Frontend - Template Ujian Response:', data)
        
        setTemplateList(data.data || [])
        
        if (!data.data || data.data.length === 0) {
          console.log('❌ Frontend - No template ujian found for:', jenisUjian)
          toast({
            title: 'Info',
            description: `Belum ada template ujian untuk jenis "${jenisUjian}". Hubungi admin untuk menambahkan template ujian.`,
            variant: 'default'
          })
        } else {
          console.log('✅ Frontend - Template ujian loaded:', data.data.length, 'template')
        }
      } else {
        console.log('❌ Frontend - Template ujian API failed:', response.status)
      }
    } catch (error) {
      console.error('Error fetching template ujian:', error)
    }
  }

  const resetForm = () => {
    setStep(1)
    setSelectedSantri('')
    setSelectedJenisUjian('')
    setSelectedTemplate(null)
    setJuzDari(1)
    setJuzSampai(1)
    setTanggalUjian(new Date())
    setKeterangan('')
    setNilaiKomponen({})
    setNilaiHalaman({})
  }

  const handleJenisUjianChange = async (jenisUjian: string) => {
    setSelectedJenisUjian(jenisUjian)
    setSelectedTemplate(null)
    
    // Langsung fetch dan set template pertama yang aktif
    try {
      const response = await fetch(`/api/admin/template-ujian?jenisUjian=${jenisUjian}`)
      if (response.ok) {
        const data = await response.json()
        console.log('🔍 Frontend - Template Ujian Response:', data)
        
        setTemplateList(data.data || [])
        
        if (data.data && data.data.length > 0) {
          // Auto-select template pertama
          const firstTemplate = data.data[0]
          setSelectedTemplate(firstTemplate)
          console.log('✅ Auto-selected template:', firstTemplate.namaTemplate)
          
          toast({
            title: 'Success',
            description: `Template "${firstTemplate.namaTemplate}" dipilih otomatis`,
            variant: 'default'
          })
        } else {
          console.log('❌ No template found for:', jenisUjian)
          toast({
            title: 'Error',
            description: `Tidak ada template untuk jenis ujian "${jenisUjian}"`,
            variant: 'destructive'
          })
        }
      }
    } catch (error) {
      console.error('Error fetching template ujian:', error)
    }
  }

  const handleTemplateChange = (templateId: string) => {
    const template = templateList.find(t => t.id === parseInt(templateId))
    setSelectedTemplate(template || null)
    
    // Reset nilai
    setNilaiKomponen({})
    setNilaiHalaman({})
  }

  const generateHalamanUAS = () => {
    const totalJuz = juzSampai - juzDari + 1
    const totalHalaman = totalJuz * 20 // 20 halaman per juz
    return Array.from({ length: totalHalaman }, (_, i) => i + 1)
  }

  const handleSubmit = async () => {
    try {
      setLoading(true)

      // Validasi
      if (!selectedSantri || !selectedJenisUjian || !selectedTemplate) {
        toast({
          title: 'Error',
          description: 'Mohon lengkapi semua data yang diperlukan',
          variant: 'destructive'
        })
        return
      }

      let nilaiData = []

      if (selectedJenisUjian === 'mhq') {
        // Untuk MHQ, gunakan komponen penilaian
        nilaiData = selectedTemplate.komponenPenilaian.map(komponen => ({
          komponenPenilaianId: komponen.id,
          nilaiRaw: nilaiKomponen[komponen.id] || 0,
          catatan: ''
        }))
      } else if (selectedJenisUjian === 'uas') {
        // Untuk UAS, buat komponen per halaman
        const halamanList = generateHalamanUAS()
        nilaiData = halamanList.map((halaman, index) => ({
          komponenPenilaianId: null, // Akan dibuat otomatis di backend
          nilaiRaw: nilaiHalaman[halaman] || 0,
          catatan: `Halaman ${halaman}`,
          urutan: index + 1
        }))
      }

      const ujianData = {
        santriId: parseInt(selectedSantri),
        templateUjianId: selectedTemplate.id,
        tanggalUjian: tanggalUjian.toISOString(),
        keterangan,
        juzDari,
        juzSampai,
        nilaiUjian: nilaiData
      }

      await onSubmit(ujianData)
      onOpenChange(false)
      resetForm()
    } catch (error) {
      console.error('Error submitting ujian:', error)
      toast({
        title: 'Error',
        description: 'Gagal menyimpan data ujian',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <User className="w-12 h-12 text-primary mx-auto mb-4" />
        <h3 className="text-lg font-semibold">Pilih Santri</h3>
        <p className="text-sm text-muted-foreground">Pilih santri yang akan diuji</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label>Santri</Label>
          <Select value={selectedSantri} onValueChange={setSelectedSantri}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih santri dari halaqah Anda" />
            </SelectTrigger>
            <SelectContent>
              {santriList.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  <p>Tidak ada santri di halaqah Anda</p>
                  <p className="text-xs">Hubungi admin untuk penugasan halaqah</p>
                </div>
              ) : (
                santriList.map((santri) => (
                  <SelectItem key={santri.id} value={santri.id.toString()}>
                    <div className="flex items-center gap-2">
                      <span>{santri.namaLengkap}</span>
                      <Badge variant="outline">@{santri.username}</Badge>
                    </div>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        {selectedSantri && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <User className="w-8 h-8 text-primary" />
                <div>
                  <p className="font-medium">
                    {santriList.find(s => s.id.toString() === selectedSantri)?.namaLengkap}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Halaqah: {santriList.find(s => s.id.toString() === selectedSantri)?.halaqah.namaHalaqah}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="flex justify-end">
        <Button 
          onClick={() => setStep(2)} 
          disabled={!selectedSantri}
        >
          Lanjut
        </Button>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <BookOpen className="w-12 h-12 text-primary mx-auto mb-4" />
        <h3 className="text-lg font-semibold">Pilih Jenis Ujian</h3>
        <p className="text-sm text-muted-foreground">Tentukan jenis ujian yang akan dilakukan</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label>Jenis Ujian</Label>
          <Select value={selectedJenisUjian} onValueChange={handleJenisUjianChange}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih jenis ujian" />
            </SelectTrigger>
            <SelectContent>
              {jenisUjianList.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  <p>Belum ada jenis ujian</p>
                  <p className="text-xs">Hubungi admin untuk menambahkan jenis ujian</p>
                </div>
              ) : (
                jenisUjianList.map((jenis) => (
                  <SelectItem 
                    key={jenis.id} 
                    value={jenis.id}
                    disabled={jenis.disabled}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className={jenis.disabled ? 'text-muted-foreground' : ''}>
                        {jenis.nama}
                      </span>
                      {jenis.disabled && (
                        <span className="text-xs text-red-500 ml-2">
                          Belum ada template
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>



        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Juz Dari</Label>
            <Select value={juzDari.toString()} onValueChange={(value) => setJuzDari(parseInt(value))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 30 }, (_, i) => i + 1).map((juz) => (
                  <SelectItem key={juz} value={juz.toString()}>
                    Juz {juz}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Juz Sampai</Label>
            <Select value={juzSampai.toString()} onValueChange={(value) => setJuzSampai(parseInt(value))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 30 }, (_, i) => i + 1)
                  .filter(juz => juz >= juzDari)
                  .map((juz) => (
                    <SelectItem key={juz} value={juz.toString()}>
                      Juz {juz}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label>Tanggal Ujian (Otomatis Hari Ini)</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !tanggalUjian && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {tanggalUjian ? format(tanggalUjian, "dd MMMM yyyy", { locale: id }) : "Pilih tanggal"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={tanggalUjian}
                onSelect={(date) => date && setTanggalUjian(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <p className="text-xs text-muted-foreground mt-1">
            Tanggal ujian otomatis diset ke hari ini. Anda bisa mengubahnya jika diperlukan.
          </p>
        </div>

        <div>
          <Label>Keterangan</Label>
          <Textarea
            placeholder="Catatan tambahan untuk ujian ini..."
            value={keterangan}
            onChange={(e) => setKeterangan(e.target.value)}
            rows={3}
          />
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep(1)}>
          Kembali
        </Button>
        <Button 
          onClick={() => setStep(3)} 
          disabled={!selectedJenisUjian || !selectedTemplate}
        >
          Lanjut ke Penilaian
        </Button>
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Trophy className="w-12 h-12 text-primary mx-auto mb-4" />
        <h3 className="text-lg font-semibold">Input Nilai</h3>
        <p className="text-sm text-muted-foreground">
          {selectedJenisUjian === 'mhq' 
            ? 'Masukkan nilai untuk setiap komponen penilaian'
            : 'Masukkan nilai untuk setiap halaman'
          }
        </p>
      </div>

      {/* Mushaf Digital */}
      <MushafDigital 
        juzDari={juzDari} 
        juzSampai={juzSampai}
      />

      {selectedTemplate && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="w-5 h-5" />
              {selectedTemplate.namaTemplate}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Jenis Ujian</p>
                <p className="font-medium">{selectedJenisUjian.toUpperCase()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Cakupan</p>
                <p className="font-medium">Juz {juzDari} - {juzSampai}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedJenisUjian === 'mhq' && selectedTemplate && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Komponen Penilaian</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedTemplate.komponenPenilaian
              .sort((a, b) => a.urutan - b.urutan)
              .map((komponen) => (
                <div key={komponen.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{komponen.namaKomponen}</p>
                      {komponen.deskripsi && (
                        <p className="text-xs text-muted-foreground">{komponen.deskripsi}</p>
                      )}
                    </div>
                    <Badge variant="outline">
                      Bobot: {komponen.bobotNilai}% | Max: {komponen.nilaiMaksimal}
                    </Badge>
                  </div>
                  <Input
                    type="number"
                    placeholder={`Nilai (0-${komponen.nilaiMaksimal})`}
                    min={0}
                    max={komponen.nilaiMaksimal}
                    value={nilaiKomponen[komponen.id] || ''}
                    onChange={(e) => setNilaiKomponen(prev => ({
                      ...prev,
                      [komponen.id]: parseInt(e.target.value) || 0
                    }))}
                  />
                </div>
              ))}
          </CardContent>
        </Card>
      )}

      {selectedJenisUjian === 'uas' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Nilai Per Halaman</CardTitle>
            <p className="text-sm text-muted-foreground">
              Total {generateHalamanUAS().length} halaman ({juzSampai - juzDari + 1} juz × 20 halaman)
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-3 max-h-96 overflow-y-auto">
              {generateHalamanUAS().map((halaman) => (
                <div key={halaman} className="space-y-1">
                  <Label className="text-xs">Hal. {halaman}</Label>
                  <Input
                    type="number"
                    placeholder="0-100"
                    min={0}
                    max={100}
                    value={nilaiHalaman[halaman] || ''}
                    onChange={(e) => setNilaiHalaman(prev => ({
                      ...prev,
                      [halaman]: parseInt(e.target.value) || 0
                    }))}
                    className="text-sm"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep(2)}>
          Kembali
        </Button>
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? 'Menyimpan...' : 'Simpan Ujian'}
        </Button>
      </div>
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Book className="w-5 h-5" />
            Ujian Baru - Step {step} dari 3
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </div>
      </DialogContent>
    </Dialog>
  )
}