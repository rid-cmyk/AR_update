'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Plus, Trash2, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

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
  isActive: boolean
  tahunAkademik: string
  komponenPenilaian: KomponenPenilaian[]
  _count: { ujian: number }
}

interface TemplateUjianDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  template: TemplateUjian | null
  onSuccess: () => void
}

const JENIS_UJIAN_OPTIONS = [
  { value: 'tasmi', label: "Tasmi'" },
  { value: 'mhq', label: 'MHQ' },
  { value: 'uas', label: 'UAS' },
  { value: 'kenaikan_juz', label: 'Kenaikan Juz' },
  { value: 'tahfidz', label: 'Tahfidz' },
  { value: 'lainnya', label: 'Lainnya' },
]

const defaultTahunAkademik = () => {
  const year = new Date().getFullYear()
  return `${year}/${year + 1} - S1`
}

interface KomponenForm {
  key: string
  namaKomponen: string
  bobotNilai: string
  nilaiMaksimal: string
}

function createEmptyKomponen(urutan: number): KomponenForm {
  return {
    key: crypto.randomUUID?.() ?? Math.random().toString(36).slice(2),
    namaKomponen: '',
    bobotNilai: '',
    nilaiMaksimal: '',
    urutan,
  } as KomponenForm & { urutan: number }
}

export function TemplateUjianDialog({ open, onOpenChange, template, onSuccess }: TemplateUjianDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [namaTemplate, setNamaTemplate] = useState('')
  const [jenisUjian, setJenisUjian] = useState('')
  const [tahunAkademik, setTahunAkademik] = useState('')
  const [deskripsi, setDeskripsi] = useState('')
  const [komponenList, setKomponenList] = useState<KomponenForm[]>([])

  const isEdit = template !== null

  useEffect(() => {
    if (!open) return
    if (template) {
      setNamaTemplate(template.namaTemplate)
      setJenisUjian(template.jenisUjian)
      setTahunAkademik(template.tahunAkademik)
      setDeskripsi(template.deskripsi ?? '')
      setKomponenList(
        template.komponenPenilaian
          .sort((a, b) => a.urutan - b.urutan)
          .map((k) => ({
            key: crypto.randomUUID?.() ?? Math.random().toString(36).slice(2),
            namaKomponen: k.namaKomponen,
            bobotNilai: String(k.bobotNilai),
            nilaiMaksimal: String(k.nilaiMaksimal),
          }))
      )
    } else {
      setNamaTemplate('')
      setJenisUjian('')
      setTahunAkademik(defaultTahunAkademik())
      setDeskripsi('')
      setKomponenList([])
    }
  }, [open, template])

  const totalBobot = komponenList.reduce((sum, k) => sum + (parseFloat(k.bobotNilai) || 0), 0)
  const bobotExceeded = totalBobot > 100

  const handleAddKomponen = () => {
    setKomponenList((prev) => [...prev, createEmptyKomponen(prev.length + 1)])
  }

  const handleRemoveKomponen = (key: string) => {
    setKomponenList((prev) => {
      const filtered = prev.filter((k) => k.key !== key)
      return filtered
    })
  }

  const handleKomponenChange = (key: string, field: keyof KomponenForm, value: string) => {
    setKomponenList((prev) =>
      prev.map((k) => (k.key === key ? { ...k, [field]: value } : k))
    )
  }

  const handleSubmit = async () => {
    if (!namaTemplate.trim()) {
      toast({
        title: "Error",
        description: "Nama template harus diisi",
        variant: "destructive",
      })
      return
    }
    if (!jenisUjian) {
      toast({
        title: "Error",
        description: "Jenis ujian harus dipilih",
        variant: "destructive",
      })
      return
    }
    if (bobotExceeded) {
      toast({
        title: "Error",
        description: "Total bobot komponen penilaian tidak boleh melebihi 100%",
        variant: "destructive",
      })
      return
    }

    const komponenPayload = komponenList.map((k, idx) => ({
      namaKomponen: k.namaKomponen,
      bobotNilai: parseFloat(k.bobotNilai) || 0,
      nilaiMaksimal: parseFloat(k.nilaiMaksimal) || 0,
      urutan: idx + 1,
    }))

    const payload = {
      namaTemplate: namaTemplate.trim(),
      jenisUjian,
      tahunAkademik: tahunAkademik || defaultTahunAkademik(),
      deskripsi: deskripsi || undefined,
      komponenPenilaian: komponenPayload,
    }

    setLoading(true)
    try {
      const url = isEdit
        ? `/api/admin/template-ujian/${template.id}`
        : '/api/admin/template-ujian'
      const method = isEdit ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        toast({
          title: "Berhasil",
          description: isEdit
            ? 'Template ujian berhasil diperbarui'
            : 'Template ujian berhasil dibuat',
        })
        onSuccess()
        onOpenChange(false)
      } else {
        throw new Error(result.message || 'Gagal menyimpan template ujian')
      }
    } catch (error: unknown) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : 'Gagal menyimpan template ujian',
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Edit Template Ujian' : 'Tambah Template Ujian'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Edit data template ujian yang sudah ada'
              : 'Buat template ujian baru untuk digunakan di sistem'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-4">
          <div className="space-y-2">
            <Label htmlFor="namaTemplate">
              Nama Template <span className="text-destructive">*</span>
            </Label>
            <Input
              id="namaTemplate"
              value={namaTemplate}
              onChange={(e) => setNamaTemplate(e.target.value)}
              placeholder="Contoh: Tasmi' Bulanan"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="jenisUjian">
              Jenis Ujian <span className="text-destructive">*</span>
            </Label>
            <select
              id="jenisUjian"
              value={jenisUjian}
              onChange={(e) => setJenisUjian(e.target.value)}
              className={cn(
                'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
                !jenisUjian && 'text-muted-foreground'
              )}
              required
            >
              <option value="" disabled>
                Pilih jenis ujian
              </option>
              {JENIS_UJIAN_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tahunAkademik">Tahun Akademik</Label>
            <Input
              id="tahunAkademik"
              value={tahunAkademik}
              onChange={(e) => setTahunAkademik(e.target.value)}
              placeholder={defaultTahunAkademik()}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deskripsi">Deskripsi</Label>
            <textarea
              id="deskripsi"
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              placeholder="Deskripsi template (opsional)"
              className={cn(
                'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
              )}
            />
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <Label className="text-base font-semibold">
                Komponen Penilaian
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddKomponen}
              >
                <Plus className="h-4 w-4 mr-1" />
                Tambah Komponen
              </Button>
            </div>

            {komponenList.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6 italic">
                Belum ada komponen penilaian. Klik &quot;Tambah Komponen&quot; untuk menambahkan.
              </p>
            )}

            <div className="space-y-3">
              {komponenList.map((komponen, idx) => (
                <div
                  key={komponen.key}
                  className={cn(
                    'rounded-lg border p-4 space-y-3',
                    'transition-colors'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">
                      Komponen #{idx + 1}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveKomponen(komponen.key)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Nama Komponen</Label>
                    <Input
                      value={komponen.namaKomponen}
                      onChange={(e) =>
                        handleKomponenChange(komponen.key, 'namaKomponen', e.target.value)
                      }
                      placeholder="Contoh: Hafalan 1 Juz"
                      className="h-9"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-xs">Bobot (%)</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={komponen.bobotNilai}
                        onChange={(e) =>
                          handleKomponenChange(komponen.key, 'bobotNilai', e.target.value)
                        }
                        placeholder="0"
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Nilai Maksimal</Label>
                      <Input
                        type="number"
                        min="0"
                        value={komponen.nilaiMaksimal}
                        onChange={(e) =>
                          handleKomponenChange(komponen.key, 'nilaiMaksimal', e.target.value)
                        }
                        placeholder="0"
                        className="h-9"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {komponenList.length > 0 && (
              <div
                className={cn(
                  'mt-3 flex items-center justify-between rounded-lg border px-4 py-3 text-sm font-medium',
                  bobotExceeded
                    ? 'border-destructive/50 bg-destructive/5 text-destructive'
                    : 'border-border bg-muted/50 text-foreground'
                )}
              >
                <span>Total Bobot</span>
                <span className={cn('font-bold', bobotExceeded && 'text-destructive')}>
                  {totalBobot.toFixed(1)}%
                  {bobotExceeded && ' (melebihi 100%)'}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Batal
          </Button>
          <Button onClick={handleSubmit} disabled={loading || bobotExceeded}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? 'Simpan' : 'Buat'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
