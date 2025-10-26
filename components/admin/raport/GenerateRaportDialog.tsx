'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, FileText, Settings } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface GenerateRaportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onGenerate: (params: any) => void
}

interface TahunAkademik {
  id: number
  tahunAkademik: string
  semester: string
  isActive: boolean
}

interface TemplateRaport {
  id: number
  namaTemplate: string
  namaLembaga: string
  isActive: boolean
}

interface Halaqah {
  id: number
  namaHalaqah: string
  santriCount: number
}

export function GenerateRaportDialog({
  open,
  onOpenChange,
  onGenerate
}: GenerateRaportDialogProps) {
  const [formData, setFormData] = useState({
    tahunAkademikId: '',
    templateRaportId: '',
    halaqahIds: [] as number[],
    generateAll: false,
    overwriteExisting: false
  })
  const [tahunAkademikOptions, setTahunAkademikOptions] = useState<TahunAkademik[]>([])
  const [templateOptions, setTemplateOptions] = useState<TemplateRaport[]>([])
  const [halaqahOptions, setHalaqahOptions] = useState<Halaqah[]>([])
  const [selectedTahunAkademik, setSelectedTahunAkademik] = useState<TahunAkademik | null>(null)
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState({
    totalSantri: 0,
    existingRaport: 0,
    newRaport: 0
  })
  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      fetchTahunAkademik()
      fetchTemplateRaport()
    }
  }, [open])

  useEffect(() => {
    if (selectedTahunAkademik) {
      fetchHalaqah()
    }
  }, [selectedTahunAkademik])

  useEffect(() => {
    if (formData.tahunAkademikId && (formData.halaqahIds.length > 0 || formData.generateAll)) {
      fetchPreview()
    }
  }, [formData.tahunAkademikId, formData.halaqahIds, formData.generateAll])

  const fetchTahunAkademik = async () => {
    try {
      const response = await fetch('/api/admin/tahun-akademik')
      if (response.ok) {
        const data = await response.json()
        setTahunAkademikOptions(data)
      }
    } catch (error) {
      console.error('Error fetching tahun akademik:', error)
    }
  }

  const fetchTemplateRaport = async () => {
    try {
      const response = await fetch('/api/admin/template-raport')
      if (response.ok) {
        const data = await response.json()
        setTemplateOptions(data.filter((t: TemplateRaport) => t.isActive))
      }
    } catch (error) {
      console.error('Error fetching template raport:', error)
    }
  }

  const fetchHalaqah = async () => {
    try {
      const response = await fetch(`/api/admin/halaqah?tahunAkademik=${selectedTahunAkademik?.tahunAkademik}&semester=${selectedTahunAkademik?.semester}`)
      if (response.ok) {
        const data = await response.json()
        setHalaqahOptions(data)
      }
    } catch (error) {
      console.error('Error fetching halaqah:', error)
    }
  }

  const fetchPreview = async () => {
    try {
      const params = new URLSearchParams({
        tahunAkademikId: formData.tahunAkademikId,
        generateAll: formData.generateAll.toString()
      })

      if (!formData.generateAll && formData.halaqahIds.length > 0) {
        formData.halaqahIds.forEach(id => params.append('halaqahIds', id.toString()))
      }

      const response = await fetch(`/api/admin/raport/preview?${params}`)
      if (response.ok) {
        const data = await response.json()
        setPreview(data)
      }
    } catch (error) {
      console.error('Error fetching preview:', error)
    }
  }

  const handleTahunAkademikChange = (tahunAkademikId: string) => {
    const tahunAkademik = tahunAkademikOptions.find(ta => ta.id === parseInt(tahunAkademikId))
    setSelectedTahunAkademik(tahunAkademik || null)
    setFormData(prev => ({
      ...prev,
      tahunAkademikId,
      halaqahIds: [],
      generateAll: false
    }))
  }

  const handleHalaqahToggle = (halaqahId: number, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      halaqahIds: checked 
        ? [...prev.halaqahIds, halaqahId]
        : prev.halaqahIds.filter(id => id !== halaqahId)
    }))
  }

  const handleGenerateAllToggle = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      generateAll: checked,
      halaqahIds: checked ? [] : prev.halaqahIds
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validasi
      if (!formData.tahunAkademikId || !formData.templateRaportId) {
        throw new Error('Tahun akademik dan template raport wajib dipilih')
      }

      if (!formData.generateAll && formData.halaqahIds.length === 0) {
        throw new Error('Pilih halaqah atau centang "Generate untuk semua halaqah"')
      }

      const params = {
        tahunAkademikId: parseInt(formData.tahunAkademikId),
        templateRaportId: parseInt(formData.templateRaportId),
        halaqahIds: formData.generateAll ? [] : formData.halaqahIds,
        generateAll: formData.generateAll,
        overwriteExisting: formData.overwriteExisting
      }

      await onGenerate(params)
      onOpenChange(false)
      
      // Reset form
      setFormData({
        tahunAkademikId: '',
        templateRaportId: '',
        halaqahIds: [],
        generateAll: false,
        overwriteExisting: false
      })
      setSelectedTahunAkademik(null)
      setPreview({ totalSantri: 0, existingRaport: 0, newRaport: 0 })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Gagal generate raport",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const getSemesterLabel = (semester: string) => {
    return semester === 'S1' ? 'Semester 1' : 'Semester 2'
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generate Raport Santri
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tahun Akademik */}
          <div className="space-y-2">
            <Label htmlFor="tahunAkademik">Tahun Akademik & Semester</Label>
            <Select
              value={formData.tahunAkademikId}
              onValueChange={handleTahunAkademikChange}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih tahun akademik" />
              </SelectTrigger>
              <SelectContent>
                {tahunAkademikOptions.map((tahun) => (
                  <SelectItem key={tahun.id} value={tahun.id.toString()}>
                    {tahun.tahunAkademik} - {getSemesterLabel(tahun.semester)}
                    {tahun.isActive && <Badge variant="outline" className="ml-2">Aktif</Badge>}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Template Raport */}
          <div className="space-y-2">
            <Label htmlFor="templateRaport">Template Raport</Label>
            <Select
              value={formData.templateRaportId}
              onValueChange={(value) => setFormData(prev => ({
                ...prev,
                templateRaportId: value
              }))}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih template raport" />
              </SelectTrigger>
              <SelectContent>
                {templateOptions.map((template) => (
                  <SelectItem key={template.id} value={template.id.toString()}>
                    {template.namaTemplate} - {template.namaLembaga}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Halaqah Selection */}
          {selectedTahunAkademik && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Pilih Halaqah
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="generateAll"
                    checked={formData.generateAll}
                    onCheckedChange={handleGenerateAllToggle}
                  />
                  <Label htmlFor="generateAll">Generate untuk semua halaqah</Label>
                </div>

                {!formData.generateAll && (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {halaqahOptions.map((halaqah) => (
                      <div key={halaqah.id} className="flex items-center space-x-2 p-2 border rounded">
                        <Checkbox
                          id={`halaqah-${halaqah.id}`}
                          checked={formData.halaqahIds.includes(halaqah.id)}
                          onCheckedChange={(checked) => handleHalaqahToggle(halaqah.id, checked as boolean)}
                        />
                        <Label htmlFor={`halaqah-${halaqah.id}`} className="flex-1">
                          {halaqah.namaHalaqah}
                        </Label>
                        <Badge variant="outline">
                          {halaqah.santriCount} santri
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Options */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Opsi Generate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="overwriteExisting"
                  checked={formData.overwriteExisting}
                  onCheckedChange={(checked) => setFormData(prev => ({
                    ...prev,
                    overwriteExisting: checked as boolean
                  }))}
                />
                <Label htmlFor="overwriteExisting">
                  Timpa raport yang sudah ada
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          {(preview.totalSantri > 0 || preview.existingRaport > 0) && (
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg text-blue-800">Preview Generate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-blue-600">{preview.totalSantri}</p>
                    <p className="text-sm text-blue-800">Total Santri</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-orange-600">{preview.existingRaport}</p>
                    <p className="text-sm text-orange-800">Raport Sudah Ada</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">{preview.newRaport}</p>
                    <p className="text-sm text-green-800">Raport Baru</p>
                  </div>
                </div>
                
                {preview.existingRaport > 0 && !formData.overwriteExisting && (
                  <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded text-sm text-yellow-800">
                    <strong>Perhatian:</strong> Ada {preview.existingRaport} raport yang sudah ada. 
                    Centang "Timpa raport yang sudah ada" jika ingin mengganti raport tersebut.
                  </div>
                )}
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
            <Button 
              type="submit" 
              disabled={loading || preview.newRaport === 0}
            >
              {loading ? 'Generating...' : `Generate ${preview.newRaport} Raport`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}