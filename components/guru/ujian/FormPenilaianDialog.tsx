'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, Calculator } from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

interface Ujian {
  id: number
  jenis: string
  nilaiAkhir: number
  tanggal: string
  keterangan?: string
  status: string
  santri: {
    namaLengkap: string
    username: string
  }
  halaqah: {
    namaHalaqah: string
  }
  templateUjian: {
    id: number
    namaTemplate: string
    jenisUjian: string
  }
  nilaiUjian: Array<{
    id: number
    nilai: number
    catatan?: string
    komponenPenilaian: {
      id: number
      namaKomponen: string
      bobotNilai: number
      nilaiMaksimal: number
    }
  }>
}

interface TemplateUjian {
  id: number
  namaTemplate: string
  jenisUjian: string
  komponenPenilaian: Array<{
    id: number
    namaKomponen: string
    bobotNilai: number
    nilaiMaksimal: number
    deskripsi?: string
    urutan: number
  }>
}

interface Santri {
  id: number
  namaLengkap: string
  username: string
}

interface FormPenilaianDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ujian?: Ujian | null
  onSuccess: () => void
}

export function FormPenilaianDialog({
  open,
  onOpenChange,
  ujian,
  onSuccess
}: FormPenilaianDialogProps) {
  const [formData, setFormData] = useState({
    templateUjianId: '',
    santriId: '',
    tanggal: undefined as Date | undefined,
    keterangan: ''
  })
  const [nilaiKomponen, setNilaiKomponen] = useState<Record<number, { nilai: number; catatan: string }>>({})
  const [templates, setTemplates] = useState<TemplateUjian[]>([])
  const [santriList, setSantriList] = useState<Santri[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateUjian | null>(null)
  const [nilaiAkhir, setNilaiAkhir] = useState(0)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      fetchTemplates()
      fetchSantri()
    }
  }, [open])

  useEffect(() => {
    if (ujian) {
      setFormData({
        templateUjianId: ujian.templateUjian.id.toString(),
        santriId: ujian.santri.username,
        tanggal: new Date(ujian.tanggal),
        keterangan: ujian.keterangan || ''
      })

      // Set nilai komponen dari ujian yang ada
      const nilaiMap: Record<number, { nilai: number; catatan: string }> = {}
      ujian.nilaiUjian.forEach(nilai => {
        nilaiMap[nilai.komponenPenilaian.id] = {
          nilai: nilai.nilai,
          catatan: nilai.catatan || ''
        }
      })
      setNilaiKomponen(nilaiMap)
      setNilaiAkhir(ujian.nilaiAkhir)

      // Set selected template
      const template = templates.find(t => t.id === ujian.templateUjian.id)
      if (template) {
        setSelectedTemplate(template)
      }
    } else {
      resetForm()
    }
  }, [ujian, templates])

  useEffect(() => {
    calculateNilaiAkhir()
  }, [nilaiKomponen, selectedTemplate])

  const resetForm = () => {
    setFormData({
      templateUjianId: '',
      santriId: '',
      tanggal: undefined,
      keterangan: ''
    })
    setNilaiKomponen({})
    setSelectedTemplate(null)
    setNilaiAkhir(0)
  }

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/guru/template-ujian')
      if (response.ok) {
        const data = await response.json()
        setTemplates(data)
      }
    } catch (error) {
      console.error('Error fetching templates:', error)
    }
  }

  const fetchSantri = async () => {
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

  const handleTemplateChange = (templateId: string) => {
    const template = templates.find(t => t.id === parseInt(templateId))
    setSelectedTemplate(template || null)
    setFormData(prev => ({ ...prev, templateUjianId: templateId }))
    
    // Reset nilai komponen
    if (template) {
      const newNilaiKomponen: Record<number, { nilai: number; catatan: string }> = {}
      template.komponenPenilaian.forEach(komponen => {
        newNilaiKomponen[komponen.id] = { nilai: 0, catatan: '' }
      })
      setNilaiKomponen(newNilaiKomponen)
    }
  }

  const handleNilaiChange = (komponenId: number, nilai: number) => {
    setNilaiKomponen(prev => ({
      ...prev,
      [komponenId]: {
        ...prev[komponenId],
        nilai: Math.max(0, Math.min(nilai, selectedTemplate?.komponenPenilaian.find(k => k.id === komponenId)?.nilaiMaksimal || 100))
      }
    }))
  }

  const handleCatatanChange = (komponenId: number, catatan: string) => {
    setNilaiKomponen(prev => ({
      ...prev,
      [komponenId]: {
        ...prev[komponenId],
        catatan
      }
    }))
  }

  const calculateNilaiAkhir = () => {
    if (!selectedTemplate) return

    let totalNilai = 0
    let totalBobot = 0

    selectedTemplate.komponenPenilaian.forEach(komponen => {
      const nilai = nilaiKomponen[komponen.id]?.nilai || 0
      const bobotNilai = (nilai / komponen.nilaiMaksimal) * komponen.bobotNilai
      totalNilai += bobotNilai
      totalBobot += komponen.bobotNilai
    })

    const nilaiAkhirCalculated = totalBobot > 0 ? Math.round(totalNilai) : 0
    setNilaiAkhir(nilaiAkhirCalculated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validasi
      if (!formData.templateUjianId || !formData.santriId || !formData.tanggal) {
        throw new Error('Template ujian, santri, dan tanggal wajib diisi')
      }

      if (!selectedTemplate) {
        throw new Error('Template ujian tidak valid')
      }

      // Validasi nilai komponen
      const missingNilai = selectedTemplate.komponenPenilaian.some(
        komponen => !nilaiKomponen[komponen.id] || nilaiKomponen[komponen.id].nilai === undefined
      )

      if (missingNilai) {
        throw new Error('Semua komponen penilaian harus diisi')
      }

      const url = ujian 
        ? `/api/guru/ujian/${ujian.id}`
        : '/api/guru/ujian'
      
      const method = ujian ? 'PUT' : 'POST'

      const requestData = {
        templateUjianId: parseInt(formData.templateUjianId),
        santriId: formData.santriId,
        tanggal: formData.tanggal.toISOString(),
        keterangan: formData.keterangan,
        nilaiKomponen: Object.entries(nilaiKomponen).map(([komponenId, data]) => ({
          komponenPenilaianId: parseInt(komponenId),
          nilai: data.nilai,
          catatan: data.catatan
        }))
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      })

      if (response.ok) {
        toast({
          title: "Berhasil",
          description: `Ujian berhasil ${ujian ? 'diperbarui' : 'dibuat'}`
        })
        onSuccess()
        onOpenChange(false)
      } else {
        const error = await response.json()
        throw new Error(error.message || 'Terjadi kesalahan')
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Gagal menyimpan ujian",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {ujian ? 'Edit Penilaian Ujian' : 'Form Penilaian Ujian Baru'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Form Dasar */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informasi Ujian</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="templateUjian">Template Ujian</Label>
                  <Select
                    value={formData.templateUjianId}
                    onValueChange={handleTemplateChange}
                    required
                    disabled={!!ujian}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih template ujian" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id.toString()}>
                          {template.namaTemplate} - {getJenisUjianLabel(template.jenisUjian)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="santri">Santri</Label>
                  <Select
                    value={formData.santriId}
                    onValueChange={(value) => setFormData(prev => ({
                      ...prev,
                      santriId: value
                    }))}
                    required
                    disabled={!!ujian}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih santri" />
                    </SelectTrigger>
                    <SelectContent>
                      {santriList.map((santri) => (
                        <SelectItem key={santri.id} value={santri.username}>
                          {santri.namaLengkap} ({santri.username})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tanggal Ujian</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.tanggal && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.tanggal ? (
                          format(formData.tanggal, "dd MMM yyyy", { locale: id })
                        ) : (
                          <span>Pilih tanggal</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.tanggal}
                        onSelect={(date) => setFormData(prev => ({
                          ...prev,
                          tanggal: date
                        }))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>Nilai Akhir</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={nilaiAkhir}
                      readOnly
                      className="font-bold text-lg"
                    />
                    <Calculator className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="keterangan">Keterangan (Opsional)</Label>
                <Textarea
                  id="keterangan"
                  value={formData.keterangan}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    keterangan: e.target.value
                  }))}
                  placeholder="Catatan tambahan tentang ujian..."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Komponen Penilaian */}
          {selectedTemplate && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Komponen Penilaian</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Template: {selectedTemplate.namaTemplate}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedTemplate.komponenPenilaian
                  .sort((a, b) => a.urutan - b.urutan)
                  .map((komponen) => (
                    <Card key={komponen.id} className="border-l-4 border-l-primary">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-medium">{komponen.namaKomponen}</h4>
                            {komponen.deskripsi && (
                              <p className="text-sm text-muted-foreground">
                                {komponen.deskripsi}
                              </p>
                            )}
                          </div>
                          <Badge variant="secondary">
                            Bobot: {komponen.bobotNilai}%
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`nilai-${komponen.id}`}>
                              Nilai (Max: {komponen.nilaiMaksimal})
                            </Label>
                            <Input
                              id={`nilai-${komponen.id}`}
                              type="number"
                              min="0"
                              max={komponen.nilaiMaksimal}
                              value={nilaiKomponen[komponen.id]?.nilai || 0}
                              onChange={(e) => handleNilaiChange(
                                komponen.id,
                                parseFloat(e.target.value) || 0
                              )}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`catatan-${komponen.id}`}>
                              Catatan (Opsional)
                            </Label>
                            <Input
                              id={`catatan-${komponen.id}`}
                              value={nilaiKomponen[komponen.id]?.catatan || ''}
                              onChange={(e) => handleCatatanChange(
                                komponen.id,
                                e.target.value
                              )}
                              placeholder="Catatan penilaian..."
                            />
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-3">
                          <div className="flex justify-between text-sm text-muted-foreground mb-1">
                            <span>Progress</span>
                            <span>
                              {Math.round(((nilaiKomponen[komponen.id]?.nilai || 0) / komponen.nilaiMaksimal) * 100)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all"
                              style={{
                                width: `${Math.min(((nilaiKomponen[komponen.id]?.nilai || 0) / komponen.nilaiMaksimal) * 100, 100)}%`
                              }}
                            ></div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Batal
            </Button>
            <Button type="submit" disabled={loading || !selectedTemplate}>
              {loading ? 'Menyimpan...' : (ujian ? 'Perbarui' : 'Simpan')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}