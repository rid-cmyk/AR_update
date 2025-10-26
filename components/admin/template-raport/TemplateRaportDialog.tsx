'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Upload, X } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

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

interface TemplateRaportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  template?: TemplateRaport | null
  onSuccess: () => void
}

export function TemplateRaportDialog({
  open,
  onOpenChange,
  template,
  onSuccess
}: TemplateRaportDialogProps) {
  const [formData, setFormData] = useState({
    namaTemplate: '',
    namaLembaga: '',
    alamatLembaga: '',
    headerKopSurat: '',
    footerRaport: '',
    namaKepala: '',
    jabatanKepala: '',
    isActive: true,
    tahunAkademik: '',
    formatTampilan: {
      showLogo: true,
      showHeader: true,
      showFooter: true,
      showTandaTangan: true,
      showRanking: true,
      showGrafik: true,
      showCatatanGuru: true,
      colorTheme: 'blue',
      fontSize: 'medium'
    }
  })
  const [files, setFiles] = useState({
    logoLembaga: null as File | null,
    tandaTanganKepala: null as File | null
  })
  const [loading, setLoading] = useState(false)
  const [tahunAkademikOptions, setTahunAkademikOptions] = useState<string[]>([])
  const { toast } = useToast()

  useEffect(() => {
    if (template) {
      setFormData({
        namaTemplate: template.namaTemplate,
        namaLembaga: template.namaLembaga,
        alamatLembaga: template.alamatLembaga || '',
        headerKopSurat: template.headerKopSurat || '',
        footerRaport: template.footerRaport || '',
        namaKepala: template.namaKepala || '',
        jabatanKepala: template.jabatanKepala || '',
        isActive: template.isActive,
        tahunAkademik: template.tahunAkademik,
        formatTampilan: template.formatTampilan || {
          showLogo: true,
          showHeader: true,
          showFooter: true,
          showTandaTangan: true,
          showRanking: true,
          showGrafik: true,
          showCatatanGuru: true,
          colorTheme: 'blue',
          fontSize: 'medium'
        }
      })
    } else {
      setFormData({
        namaTemplate: '',
        namaLembaga: '',
        alamatLembaga: '',
        headerKopSurat: '',
        footerRaport: '',
        namaKepala: '',
        jabatanKepala: '',
        isActive: true,
        tahunAkademik: '',
        formatTampilan: {
          showLogo: true,
          showHeader: true,
          showFooter: true,
          showTandaTangan: true,
          showRanking: true,
          showGrafik: true,
          showCatatanGuru: true,
          colorTheme: 'blue',
          fontSize: 'medium'
        }
      })
    }
    setFiles({ logoLembaga: null, tandaTanganKepala: null })
  }, [template])

  useEffect(() => {
    if (open) {
      fetchTahunAkademik()
    }
  }, [open])

  const fetchTahunAkademik = async () => {
    try {
      const response = await fetch('/api/admin/tahun-akademik')
      if (response.ok) {
        const data = await response.json()
        setTahunAkademikOptions(data.map((ta: any) => ta.tahunAkademik))
      }
    } catch (error) {
      console.error('Error fetching tahun akademik:', error)
    }
  }

  const handleFileChange = (type: 'logoLembaga' | 'tandaTanganKepala', file: File | null) => {
    setFiles(prev => ({ ...prev, [type]: file }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formDataToSend = new FormData()
      
      // Append form data
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'formatTampilan') {
          formDataToSend.append(key, JSON.stringify(value))
        } else {
          formDataToSend.append(key, value.toString())
        }
      })

      // Append files
      if (files.logoLembaga) {
        formDataToSend.append('logoLembaga', files.logoLembaga)
      }
      if (files.tandaTanganKepala) {
        formDataToSend.append('tandaTanganKepala', files.tandaTanganKepala)
      }

      const url = template 
        ? `/api/admin/template-raport/${template.id}`
        : '/api/admin/template-raport'
      
      const method = template ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        body: formDataToSend
      })

      if (response.ok) {
        toast({
          title: "Berhasil",
          description: `Template raport berhasil ${template ? 'diperbarui' : 'dibuat'}`
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
        description: error.message || "Gagal menyimpan template raport",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {template ? 'Edit Template Raport' : 'Tambah Template Raport'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="basic" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Informasi Dasar</TabsTrigger>
              <TabsTrigger value="lembaga">Data Lembaga</TabsTrigger>
              <TabsTrigger value="files">File & Media</TabsTrigger>
              <TabsTrigger value="format">Format Tampilan</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="namaTemplate">Nama Template</Label>
                  <Input
                    id="namaTemplate"
                    value={formData.namaTemplate}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      namaTemplate: e.target.value
                    }))}
                    placeholder="Contoh: Template Raport Semester 1"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tahunAkademik">Tahun Akademik</Label>
                  <Select
                    value={formData.tahunAkademik}
                    onValueChange={(value) => setFormData(prev => ({
                      ...prev,
                      tahunAkademik: value
                    }))}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih tahun akademik" />
                    </SelectTrigger>
                    <SelectContent>
                      {tahunAkademikOptions.map((tahun) => (
                        <SelectItem key={tahun} value={tahun}>
                          {tahun}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData(prev => ({
                    ...prev,
                    isActive: checked
                  }))}
                />
                <Label htmlFor="isActive">Template Aktif</Label>
              </div>
            </TabsContent>

            <TabsContent value="lembaga" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="namaLembaga">Nama Lembaga</Label>
                <Input
                  id="namaLembaga"
                  value={formData.namaLembaga}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    namaLembaga: e.target.value
                  }))}
                  placeholder="Nama pondok pesantren atau lembaga"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="alamatLembaga">Alamat Lembaga</Label>
                <Textarea
                  id="alamatLembaga"
                  value={formData.alamatLembaga}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    alamatLembaga: e.target.value
                  }))}
                  placeholder="Alamat lengkap lembaga"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="namaKepala">Nama Kepala Tahfidz</Label>
                  <Input
                    id="namaKepala"
                    value={formData.namaKepala}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      namaKepala: e.target.value
                    }))}
                    placeholder="Nama kepala tahfidz"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jabatanKepala">Jabatan</Label>
                  <Input
                    id="jabatanKepala"
                    value={formData.jabatanKepala}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      jabatanKepala: e.target.value
                    }))}
                    placeholder="Contoh: Kepala Tahfidz"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="headerKopSurat">Header Kop Surat</Label>
                <Textarea
                  id="headerKopSurat"
                  value={formData.headerKopSurat}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    headerKopSurat: e.target.value
                  }))}
                  placeholder="Teks header yang akan muncul di bagian atas raport"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="footerRaport">Footer Raport</Label>
                <Textarea
                  id="footerRaport"
                  value={formData.footerRaport}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    footerRaport: e.target.value
                  }))}
                  placeholder="Teks footer yang akan muncul di bagian bawah raport"
                  rows={2}
                />
              </div>
            </TabsContent>

            <TabsContent value="files" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Logo Lembaga</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Label htmlFor="logoLembaga">Upload Logo</Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                        <input
                          type="file"
                          id="logoLembaga"
                          accept="image/*"
                          onChange={(e) => handleFileChange('logoLembaga', e.target.files?.[0] || null)}
                          className="hidden"
                        />
                        <label htmlFor="logoLembaga" className="cursor-pointer">
                          <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                          <p className="text-sm text-gray-600">
                            {files.logoLembaga ? files.logoLembaga.name : 'Klik untuk upload logo'}
                          </p>
                        </label>
                        {files.logoLembaga && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleFileChange('logoLembaga', null)}
                            className="mt-2"
                          >
                            <X className="h-4 w-4 mr-1" />
                            Hapus
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Tanda Tangan</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Label htmlFor="tandaTanganKepala">Upload Tanda Tangan</Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                        <input
                          type="file"
                          id="tandaTanganKepala"
                          accept="image/*"
                          onChange={(e) => handleFileChange('tandaTanganKepala', e.target.files?.[0] || null)}
                          className="hidden"
                        />
                        <label htmlFor="tandaTanganKepala" className="cursor-pointer">
                          <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                          <p className="text-sm text-gray-600">
                            {files.tandaTanganKepala ? files.tandaTanganKepala.name : 'Klik untuk upload tanda tangan'}
                          </p>
                        </label>
                        {files.tandaTanganKepala && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleFileChange('tandaTanganKepala', null)}
                            className="mt-2"
                          >
                            <X className="h-4 w-4 mr-1" />
                            Hapus
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="format" className="space-y-4">
              <div className="grid grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Komponen Tampilan</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { key: 'showLogo', label: 'Tampilkan Logo' },
                      { key: 'showHeader', label: 'Tampilkan Header' },
                      { key: 'showFooter', label: 'Tampilkan Footer' },
                      { key: 'showTandaTangan', label: 'Tampilkan Tanda Tangan' },
                      { key: 'showRanking', label: 'Tampilkan Ranking' },
                      { key: 'showGrafik', label: 'Tampilkan Grafik' },
                      { key: 'showCatatanGuru', label: 'Tampilkan Catatan Guru' }
                    ].map(({ key, label }) => (
                      <div key={key} className="flex items-center space-x-2">
                        <Switch
                          id={key}
                          checked={formData.formatTampilan[key]}
                          onCheckedChange={(checked) => setFormData(prev => ({
                            ...prev,
                            formatTampilan: {
                              ...prev.formatTampilan,
                              [key]: checked
                            }
                          }))}
                        />
                        <Label htmlFor={key}>{label}</Label>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Pengaturan Desain</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="colorTheme">Tema Warna</Label>
                      <Select
                        value={formData.formatTampilan.colorTheme}
                        onValueChange={(value) => setFormData(prev => ({
                          ...prev,
                          formatTampilan: {
                            ...prev.formatTampilan,
                            colorTheme: value
                          }
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="blue">Biru</SelectItem>
                          <SelectItem value="green">Hijau</SelectItem>
                          <SelectItem value="red">Merah</SelectItem>
                          <SelectItem value="purple">Ungu</SelectItem>
                          <SelectItem value="gray">Abu-abu</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fontSize">Ukuran Font</Label>
                      <Select
                        value={formData.formatTampilan.fontSize}
                        onValueChange={(value) => setFormData(prev => ({
                          ...prev,
                          formatTampilan: {
                            ...prev.formatTampilan,
                            fontSize: value
                          }
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="small">Kecil</SelectItem>
                          <SelectItem value="medium">Sedang</SelectItem>
                          <SelectItem value="large">Besar</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end space-x-2 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Menyimpan...' : (template ? 'Perbarui' : 'Simpan')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}