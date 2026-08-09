'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Loader2, CalendarIcon } from "lucide-react"

interface TahunAjaran {
  id: number
  tahunMulai: number
  tahunSelesai: number
  namaLengkap: string
  tanggalMulai: string
  tanggalSelesai: string
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  tahunAjaran: TahunAjaran | null
  onSuccess: () => void
}

export function TahunAkademikDialog({ open, onOpenChange, tahunAjaran, onSuccess }: Props) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  
  const [tahunMulai, setTahunMulai] = useState('')
  const [tahunSelesai, setTahunSelesai] = useState('')
  const [namaLengkap, setNamaLengkap] = useState('')
  const [tanggalMulai, setTanggalMulai] = useState('')
  const [tanggalSelesai, setTanggalSelesai] = useState('')

  const isEdit = tahunAjaran !== null

  useEffect(() => {
    if (!open) return
    if (tahunAjaran) {
      setTahunMulai(String(tahunAjaran.tahunMulai))
      setTahunSelesai(String(tahunAjaran.tahunSelesai))
      setNamaLengkap(tahunAjaran.namaLengkap)
      setTanggalMulai(tahunAjaran.tanggalMulai ? tahunAjaran.tanggalMulai.split('T')[0] : '')
      setTanggalSelesai(tahunAjaran.tanggalSelesai ? tahunAjaran.tanggalSelesai.split('T')[0] : '')
    } else {
      const year = new Date().getFullYear()
      setTahunMulai(String(year))
      setTahunSelesai(String(year + 1))
      setNamaLengkap(`${year}/${year + 1}`)
      setTanggalMulai(`${year}-07-01`)
      setTanggalSelesai(`${year + 1}-06-30`)
    }
  }, [open, tahunAjaran])

  useEffect(() => {
    const tMulai = parseInt(tahunMulai)
    const tSelesai = parseInt(tahunSelesai)
    if (!isNaN(tMulai) && !isNaN(tSelesai)) {
      setNamaLengkap(`${tMulai}/${tSelesai}`)
    }
  }, [tahunMulai, tahunSelesai])

  const handleTahunMulaiChange = (value: string) => {
    setTahunMulai(value)
    const year = parseInt(value)
    if (!isNaN(year) && !isEdit) {
      setTahunSelesai(String(year + 1))
      setTanggalMulai(`${year}-07-01`)
      setTanggalSelesai(`${year + 1}-06-30`)
    }
  }

  const handleSubmit = async () => {
    if (!tahunMulai || !tahunSelesai || !tanggalMulai || !tanggalSelesai) {
      toast({ title: "Error", description: "Semua field harus diisi", variant: "destructive" })
      return
    }

    setLoading(true)
    try {
      const payload = {
        tahunMulai: parseInt(tahunMulai),
        tahunSelesai: parseInt(tahunSelesai),
        namaLengkap,
        tanggalMulai: new Date(tanggalMulai).toISOString(),
        tanggalSelesai: new Date(tanggalSelesai).toISOString(),
      }

      const url = isEdit
        ? `/api/admin/tahun-akademik/${tahunAjaran.id}`
        : '/api/admin/tahun-akademik'
      const method = isEdit ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const result = await response.json()

      if (result.success) {
        toast({ title: "Berhasil", description: isEdit ? 'Tahun Ajaran diperbarui' : 'Tahun Ajaran dibuat' })
        onSuccess()
      } else {
        throw new Error(result.error || 'Gagal menyimpan Tahun Ajaran')
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Tahun Ajaran' : 'Tambah Tahun Ajaran'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Edit nama dan rentang Tahun Ajaran' : 'Buat Tahun Ajaran baru. Secara otomatis akan dibuatkan Semester 1 & 2.'}
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
              />
            </div>
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
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Batal</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? 'Simpan' : 'Buat'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
