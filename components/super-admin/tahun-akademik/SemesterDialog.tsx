'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Loader2, CalendarIcon } from "lucide-react"

interface Semester {
  id: number
  tahunAjaranId: number
  semesterUrutan: number
  namaSemester: string
  tanggalMulai: string
  tanggalSelesai: string
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  semester: Semester | null
  onSuccess: () => void
}

export function SemesterDialog({ open, onOpenChange, semester, onSuccess }: Props) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  
  const [namaSemester, setNamaSemester] = useState('')
  const [tanggalMulai, setTanggalMulai] = useState('')
  const [tanggalSelesai, setTanggalSelesai] = useState('')

  useEffect(() => {
    if (!open || !semester) return
    setNamaSemester(semester.namaSemester)
    setTanggalMulai(semester.tanggalMulai.split('T')[0])
    setTanggalSelesai(semester.tanggalSelesai.split('T')[0])
  }, [open, semester])

  const handleSubmit = async () => {
    if (!tanggalMulai || !tanggalSelesai) {
      toast({ title: "Error", description: "Tanggal mulai dan selesai harus diisi", variant: "destructive" })
      return
    }

    setLoading(true)
    try {
      const payload = {
        tanggalMulai: new Date(tanggalMulai).toISOString(),
        tanggalSelesai: new Date(tanggalSelesai).toISOString(),
      }

      // TODO: Ensure this API endpoint exists: PUT /api/super-admin/semester/:id
      const response = await fetch(`/api/super-admin/semester/${semester!.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const result = await response.json()

      if (result.success) {
        toast({ title: "Berhasil", description: 'Semester berhasil diperbarui' })
        onSuccess()
      } else {
        throw new Error(result.error || 'Gagal menyimpan Semester')
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Semester</DialogTitle>
          <DialogDescription>
            Sesuaikan tanggal mulai dan tanggal selesai untuk {namaSemester}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Nama Semester</Label>
            <Input value={namaSemester} readOnly className="bg-muted" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tanggalMulai">Tanggal Mulai</Label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="tanggalMulai"
                  type="date"
                  value={tanggalMulai}
                  onChange={(e) => setTanggalMulai(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tanggalSelesai">Tanggal Selesai</Label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="tanggalSelesai"
                  type="date"
                  value={tanggalSelesai}
                  onChange={(e) => setTanggalSelesai(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Batal</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Simpan
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
