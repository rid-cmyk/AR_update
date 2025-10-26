'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

interface TahunAkademik {
  id: number
  tahunAkademik: string
  tanggalMulai: string
  tanggalSelesai: string
  isActive: boolean
  semester: string
}

interface TahunAkademikDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tahunAkademik?: TahunAkademik | null
  onSuccess: () => void
}

export function TahunAkademikDialog({
  open,
  onOpenChange,
  tahunAkademik,
  onSuccess
}: TahunAkademikDialogProps) {
  const [formData, setFormData] = useState({
    tahunAkademik: '',
    tanggalMulai: undefined as Date | undefined,
    tanggalSelesai: undefined as Date | undefined,
    isActive: false,
    semester: 'S1'
  })
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (tahunAkademik) {
      setFormData({
        tahunAkademik: tahunAkademik.tahunAkademik,
        tanggalMulai: new Date(tahunAkademik.tanggalMulai),
        tanggalSelesai: new Date(tahunAkademik.tanggalSelesai),
        isActive: tahunAkademik.isActive,
        semester: tahunAkademik.semester
      })
    } else {
      // Generate default tahun akademik
      const currentYear = new Date().getFullYear()
      const nextYear = currentYear + 1
      setFormData({
        tahunAkademik: `${currentYear}/${nextYear}`,
        tanggalMulai: undefined,
        tanggalSelesai: undefined,
        isActive: false,
        semester: 'S1'
      })
    }
  }, [tahunAkademik])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validasi
      if (!formData.tahunAkademik || !formData.tanggalMulai || !formData.tanggalSelesai) {
        throw new Error('Semua field wajib diisi')
      }

      if (formData.tanggalMulai >= formData.tanggalSelesai) {
        throw new Error('Tanggal mulai harus lebih awal dari tanggal selesai')
      }

      // Parse tahun dari string tahunAkademik (contoh: "2024/2025")
      const [tahunMulaiStr, tahunSelesaiStr] = formData.tahunAkademik.split('/')
      const tahunMulai = parseInt(tahunMulaiStr)
      const tahunSelesai = parseInt(tahunSelesaiStr)

      if (isNaN(tahunMulai) || isNaN(tahunSelesai)) {
        throw new Error('Format tahun akademik tidak valid. Gunakan format YYYY/YYYY')
      }

      const url = tahunAkademik 
        ? `/api/admin/tahun-akademik/${tahunAkademik.id}`
        : '/api/admin/tahun-akademik'
      
      const method = tahunAkademik ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify({
          tahunMulai,
          tahunSelesai,
          semester: formData.semester,
          tanggalMulai: formData.tanggalMulai.toISOString(),
          tanggalSelesai: formData.tanggalSelesai.toISOString()
        })
      })

      if (response.ok) {
        toast({
          title: "Berhasil",
          description: `Tahun akademik berhasil ${tahunAkademik ? 'diperbarui' : 'dibuat'}`
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
        description: error.message || "Gagal menyimpan tahun akademik",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const generateTahunAkademik = () => {
    if (formData.tanggalMulai) {
      const startYear = formData.tanggalMulai.getFullYear()
      const endYear = formData.tanggalSelesai?.getFullYear() || startYear + 1
      const generated = `${startYear}/${endYear}`
      setFormData(prev => ({ ...prev, tahunAkademik: generated }))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {tahunAkademik ? 'Edit Tahun Akademik' : 'Tambah Tahun Akademik'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tahunAkademik">Tahun Akademik</Label>
            <div className="flex gap-2">
              <Input
                id="tahunAkademik"
                value={formData.tahunAkademik}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  tahunAkademik: e.target.value
                }))}
                placeholder="2024/2025"
                required
              />
              <Button
                type="button"
                variant="outline"
                onClick={generateTahunAkademik}
                disabled={!formData.tanggalMulai}
              >
                Auto
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="semester">Semester</Label>
            <Select
              value={formData.semester}
              onValueChange={(value) => setFormData(prev => ({
                ...prev,
                semester: value
              }))}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih semester" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="S1">Semester 1</SelectItem>
                <SelectItem value="S2">Semester 2</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tanggal Mulai</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.tanggalMulai && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.tanggalMulai ? (
                      format(formData.tanggalMulai, "dd MMM yyyy", { locale: id })
                    ) : (
                      <span>Pilih tanggal</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.tanggalMulai}
                    onSelect={(date) => setFormData(prev => ({
                      ...prev,
                      tanggalMulai: date
                    }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Tanggal Selesai</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.tanggalSelesai && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.tanggalSelesai ? (
                      format(formData.tanggalSelesai, "dd MMM yyyy", { locale: id })
                    ) : (
                      <span>Pilih tanggal</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.tanggalSelesai}
                    onSelect={(date) => setFormData(prev => ({
                      ...prev,
                      tanggalSelesai: date
                    }))}
                    disabled={(date) => 
                      formData.tanggalMulai ? date <= formData.tanggalMulai : false
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
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
            <Label htmlFor="isActive">Aktifkan Tahun Akademik</Label>
          </div>

          {formData.isActive && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                <strong>Perhatian:</strong> Mengaktifkan tahun akademik ini akan menonaktifkan tahun akademik yang sedang aktif.
              </p>
            </div>
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
            <Button type="submit" disabled={loading}>
              {loading ? 'Menyimpan...' : (tahunAkademik ? 'Perbarui' : 'Simpan')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}