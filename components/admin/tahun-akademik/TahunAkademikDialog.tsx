'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { CalendarIcon, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface TahunAkademik {
  id: number
  tahunMulai: number
  tahunSelesai: number
  semester: 'S1' | 'S2'
  namaLengkap: string
  tanggalMulai: string
  tanggalSelesai: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  creator?: { namaLengkap: string }
  _count?: { templateUjian: number; templateRaport: number; ujianSantri: number; raportSantri: number }
}

interface TahunAkademikDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tahunAkademik: TahunAkademik | null
  onSuccess: () => void
}

export function TahunAkademikDialog({ open, onOpenChange, tahunAkademik, onSuccess }: TahunAkademikDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [tahunMulai, setTahunMulai] = useState('')
  const [tahunSelesai, setTahunSelesai] = useState('')
  const [semester, setSemester] = useState<'S1' | 'S2'>('S1')
  const [namaLengkap, setNamaLengkap] = useState('')
  const [tanggalMulai, setTanggalMulai] = useState('')
  const [tanggalSelesai, setTanggalSelesai] = useState('')

  const isEdit = tahunAkademik !== null

  useEffect(() => {
    if (!open) return
    if (tahunAkademik) {
      setTahunMulai(String(tahunAkademik.tahunMulai))
      setTahunSelesai(String(tahunAkademik.tahunSelesai))
      setSemester(tahunAkademik.semester)
      setNamaLengkap(tahunAkademik.namaLengkap)
      setTanggalMulai(tahunAkademik.tanggalMulai.split('T')[0])
      setTanggalSelesai(tahunAkademik.tanggalSelesai.split('T')[0])
    } else {
      const year = new Date().getFullYear()
      setTahunMulai(String(year))
      setTahunSelesai(String(year + 1))
      setSemester('S1')
      setNamaLengkap(`${year}/${year + 1} - Semester 1`)
      setTanggalMulai('')
      setTanggalSelesai('')
    }
  }, [open, tahunAkademik])

  useEffect(() => {
    const tMulai = parseInt(tahunMulai)
    const tSelesai = parseInt(tahunSelesai)
    if (!isNaN(tMulai) && !isNaN(tSelesai)) {
      const semesterLabel = semester === 'S1' ? 'Semester 1' : 'Semester 2'
      setNamaLengkap(`${tMulai}/${tSelesai} - ${semesterLabel}`)
    }
  }, [tahunMulai, tahunSelesai, semester])

  const handleTahunMulaiChange = (value: string) => {
    setTahunMulai(value)
    const year = parseInt(value)
    if (!isNaN(year) && !isEdit) {
      setTahunSelesai(String(year + 1))
    }
  }

  const handleSubmit = async () => {
    if (!tahunMulai || !tahunSelesai || !tanggalMulai || !tanggalSelesai) {
      toast({
        title: "Error",
        description: "Semua field harus diisi",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      const payload = {
        tahunMulai: parseInt(tahunMulai),
        tahunSelesai: parseInt(tahunSelesai),
        semester,
        namaLengkap,
        tanggalMulai: new Date(tanggalMulai).toISOString(),
        tanggalSelesai: new Date(tanggalSelesai).toISOString(),
      }

      const url = isEdit
        ? `/api/admin/tahun-akademik/${tahunAkademik.id}`
        : '/api/admin/tahun-akademik'
      const method = isEdit ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Berhasil",
          description: isEdit ? 'Tahun akademik berhasil diperbarui' : 'Tahun akademik berhasil dibuat'
        })
        onSuccess()
        onOpenChange(false)
      } else {
        throw new Error(result.message || 'Gagal menyimpan tahun akademik')
      }
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Gagal menyimpan tahun akademik",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Tahun Akademik' : 'Tambah Tahun Akademik'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Edit data tahun akademik yang sudah ada' : 'Buat tahun akademik baru untuk digunakan di sistem'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tahunMulai">Tahun Mulai</Label>
              <Input
                id="tahunMulai"
                type="number"
                value={tahunMulai}
                onChange={(e) => handleTahunMulaiChange(e.target.value)}
                placeholder="Contoh: 2024"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tahunSelesai">Tahun Selesai</Label>
              <Input
                id="tahunSelesai"
                type="number"
                value={tahunSelesai}
                onChange={(e) => setTahunSelesai(e.target.value)}
                placeholder="Contoh: 2025"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="semester">Semester</Label>
            <Select value={semester} onValueChange={(value) => setSemester(value as 'S1' | 'S2')}>
              <SelectTrigger id="semester">
                <SelectValue placeholder="Pilih semester" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="S1">Semester 1 (Ganjil)</SelectItem>
                <SelectItem value="S2">Semester 2 (Genap)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="namaLengkap">Nama Lengkap</Label>
            <Input
              id="namaLengkap"
              value={namaLengkap}
              readOnly
              className="bg-muted cursor-not-allowed"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tanggalMulai">Tanggal Mulai</Label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="tanggalMulai"
                  type="date"
                  value={tanggalMulai}
                  onChange={(e) => setTanggalMulai(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tanggalSelesai">Tanggal Selesai</Label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="tanggalSelesai"
                  type="date"
                  value={tanggalSelesai}
                  onChange={(e) => setTanggalSelesai(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Batal
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? 'Simpan' : 'Buat'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
