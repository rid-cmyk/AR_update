"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Plus, Trash2, Loader2, GripVertical } from "lucide-react"

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

interface KomponenPenilaianDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  template: TemplateUjian | null
  onSuccess: () => void
}

interface KomponenFormItem {
  key: string
  namaKomponen: string
  bobotNilai: number
  nilaiMaksimal: number
}

export { KomponenPenilaianDialog }
export default function KomponenPenilaianDialog({
  open,
  onOpenChange,
  template,
  onSuccess,
}: KomponenPenilaianDialogProps) {
  const [items, setItems] = useState<KomponenFormItem[]>([])
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      if (template) {
        setItems(
          template.komponenPenilaian
            .sort((a, b) => a.urutan - b.urutan)
            .map((k) => ({
              key: `existing-${k.id}`,
              namaKomponen: k.namaKomponen,
              bobotNilai: k.bobotNilai,
              nilaiMaksimal: k.nilaiMaksimal,
            }))
        )
      } else {
        setItems([])
      }
    }
  }, [open, template])

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        key: `new-${Date.now()}`,
        namaKomponen: "",
        bobotNilai: 0,
        nilaiMaksimal: 100,
      },
    ])
  }

  const removeItem = (key: string) => {
    setItems((prev) => prev.filter((item) => item.key !== key))
  }

  const updateItem = (key: string, field: keyof KomponenFormItem, value: string | number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.key === key ? { ...item, [field]: value } : item
      )
    )
  }

  const totalBobot = items.reduce((sum, item) => sum + (item.bobotNilai || 0), 0)
  const isValid = items.length > 0 && items.every((item) => item.namaKomponen.trim() && item.bobotNilai > 0) && totalBobot <= 100

  const handleSave = async () => {
    if (!template || !isValid) return
    setSaving(true)

    try {
      const payload = items.map((item, index) => ({
        namaKomponen: item.namaKomponen,
        bobotNilai: item.bobotNilai,
        nilaiMaksimal: item.nilaiMaksimal,
        urutan: index + 1,
      }))

      const res = await fetch(`/api/admin/template-ujian/${template.id}/komponen`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ komponenPenilaian: payload }),
      })

      if (res.ok) {
        toast({ title: "Berhasil", description: "Komponen penilaian berhasil diperbarui" })
        onSuccess()
        onOpenChange(false)
      } else {
        const err = await res.json()
        throw new Error(err.error || "Gagal menyimpan komponen")
      }
    } catch (e) {
      toast({
        title: "Error",
        description: e instanceof Error ? e.message : "Gagal menyimpan komponen",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Komponen Penilaian</DialogTitle>
          <DialogDescription>
            {template
              ? `Atur komponen penilaian untuk "${template.namaTemplate}"`
              : "Pilih template terlebih dahulu"}
          </DialogDescription>
        </DialogHeader>

        {!template ? (
          <div className="text-center py-8 text-muted-foreground">
            Silakan pilih template ujian terlebih dahulu.
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item, index) => (
              <div
                key={item.key}
                className="flex items-start gap-3 p-4 rounded-lg border bg-card"
              >
                <div className="flex items-center gap-2 pt-2 text-muted-foreground">
                  <GripVertical className="h-4 w-4" />
                  <span className="text-sm font-medium w-5">{index + 1}</span>
                </div>
                <div className="flex-1 grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor={`nama-${item.key}`}>Nama Komponen</Label>
                    <Input
                      id={`nama-${item.key}`}
                      value={item.namaKomponen}
                      onChange={(e) => updateItem(item.key, "namaKomponen", e.target.value)}
                      placeholder="Contoh: Tajwid"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`bobot-${item.key}`}>Bobot (%)</Label>
                    <Input
                      id={`bobot-${item.key}`}
                      type="number"
                      min={0}
                      max={100}
                      value={item.bobotNilai}
                      onChange={(e) => updateItem(item.key, "bobotNilai", parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`max-${item.key}`}>Nilai Maksimal</Label>
                    <Input
                      id={`max-${item.key}`}
                      type="number"
                      min={0}
                      max={1000}
                      value={item.nilaiMaksimal}
                      onChange={(e) => updateItem(item.key, "nilaiMaksimal", parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="mt-6 text-destructive shrink-0"
                  onClick={() => removeItem(item.key)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}

            <Button variant="outline" className="w-full" onClick={addItem}>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Komponen
            </Button>

            <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
              <span className="text-sm font-medium">Total Bobot:</span>
              <span className={`text-sm font-bold ${totalBobot > 100 ? "text-destructive" : totalBobot === 100 ? "text-green-600" : "text-amber-600"}`}>
                {totalBobot}%
                {totalBobot > 100 && " (melebihi 100%)"}
                {totalBobot < 100 && ` (sisa ${100 - totalBobot}%)`}
              </span>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Batal
              </Button>
              <Button onClick={handleSave} disabled={!isValid || saving}>
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Simpan
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
