'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'

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
  _count: { raport: number }
}

interface TemplateRaportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  template: TemplateRaport | null
  onSuccess: () => void
}

export function TemplateRaportDialog({ open, onOpenChange, template, onSuccess }: TemplateRaportDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [namaTemplate, setNamaTemplate] = useState('')
  const [namaLembaga, setNamaLembaga] = useState('')
  const [alamatLembaga, setAlamatLembaga] = useState('')
  const [namaKepala, setNamaKepala] = useState('')
  const [jabatanKepala, setJabatanKepala] = useState('')
  const [headerKopSurat, setHeaderKopSurat] = useState('')
  const [footerRaport, setFooterRaport] = useState('')
  const [tahunAkademik, setTahunAkademik] = useState('')

  useEffect(() => {
    if (template) {
      setNamaTemplate(template.namaTemplate)
      setNamaLembaga(template.namaLembaga)
      setAlamatLembaga(template.alamatLembaga || '')
      setNamaKepala(template.namaKepala || '')
      setJabatanKepala(template.jabatanKepala || '')
      setHeaderKopSurat(template.headerKopSurat || '')
      setFooterRaport(template.footerRaport || '')
      setTahunAkademik(template.tahunAkademik)
    } else {
      setNamaTemplate('')
      setNamaLembaga('')
      setAlamatLembaga('')
      setNamaKepala('')
      setJabatanKepala('')
      setHeaderKopSurat('')
      setFooterRaport('')
      setTahunAkademik('')
    }
  }, [template, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const body = {
      namaTemplate,
      namaLembaga,
      alamatLembaga,
      namaKepala,
      jabatanKepala,
      headerKopSurat,
      footerRaport,
      tahunAkademik,
    }

    try {
      const url = template
        ? `/api/admin/template-raport/${template.id}`
        : '/api/admin/template-raport'
      const method = template ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!response.ok) throw new Error('Gagal menyimpan template')

      toast({
        title: 'Berhasil',
        description: template
          ? 'Template raport berhasil diperbarui'
          : 'Template raport berhasil dibuat',
      })

      onSuccess()
      onOpenChange(false)
    } catch {
      toast({
        title: 'Error',
        description: 'Gagal menyimpan template raport',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const isEditing = !!template

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Template Raport' : 'Tambah Template Raport'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Perbarui informasi template raport'
              : 'Isi form berikut untuk membuat template raport baru'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="namaTemplate">Nama Template *</Label>
            <Input
              id="namaTemplate"
              value={namaTemplate}
              onChange={(e) => setNamaTemplate(e.target.value)}
              placeholder="Masukkan nama template"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="namaLembaga">Nama Lembaga *</Label>
            <Input
              id="namaLembaga"
              value={namaLembaga}
              onChange={(e) => setNamaLembaga(e.target.value)}
              placeholder="Masukkan nama lembaga"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="alamatLembaga">Alamat Lembaga</Label>
            <Textarea
              id="alamatLembaga"
              value={alamatLembaga}
              onChange={(e) => setAlamatLembaga(e.target.value)}
              placeholder="Masukkan alamat lembaga"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="namaKepala">Nama Kepala</Label>
              <Input
                id="namaKepala"
                value={namaKepala}
                onChange={(e) => setNamaKepala(e.target.value)}
                placeholder="Masukkan nama kepala"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="jabatanKepala">Jabatan Kepala</Label>
              <Input
                id="jabatanKepala"
                value={jabatanKepala}
                onChange={(e) => setJabatanKepala(e.target.value)}
                placeholder="Masukkan jabatan kepala"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="headerKopSurat">Header Kop Surat</Label>
            <Textarea
              id="headerKopSurat"
              value={headerKopSurat}
              onChange={(e) => setHeaderKopSurat(e.target.value)}
              placeholder="Masukkan header kop surat"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="footerRaport">Footer Raport</Label>
            <Textarea
              id="footerRaport"
              value={footerRaport}
              onChange={(e) => setFooterRaport(e.target.value)}
              placeholder="Masukkan footer raport"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tahunAkademik">Tahun Akademik</Label>
            <Input
              id="tahunAkademik"
              value={tahunAkademik}
              onChange={(e) => setTahunAkademik(e.target.value)}
              placeholder="Contoh: 2024/2025"
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Simpan Perubahan' : 'Buat Template'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
