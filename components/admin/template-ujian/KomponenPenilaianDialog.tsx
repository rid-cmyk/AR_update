'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit, Trash2, GripVertical } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface TemplateUjian {
  id: number
  namaTemplate: string
  jenisUjian: string
  komponenPenilaian: KomponenPenilaian[]
}

interface KomponenPenilaian {
  id: number
  namaKomponen: string
  bobotNilai: number
  nilaiMaksimal: number
  deskripsi?: string
  urutan: number
}

interface KomponenPenilaianDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  template?: TemplateUjian | null
  onSuccess: () => void
}

export function KomponenPenilaianDialog({
  open,
  onOpenChange,
  template,
  onSuccess
}: KomponenPenilaianDialogProps) {
  const [komponenList, setKomponenList] = useState<KomponenPenilaian[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingKomponen, setEditingKomponen] = useState<KomponenPenilaian | null>(null)
  const [formData, setFormData] = useState({
    namaKomponen: '',
    bobotNilai: 0,
    nilaiMaksimal: 100,
    deskripsi: ''
  })
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (template) {
      setKomponenList([...template.komponenPenilaian].sort((a, b) => a.urutan - b.urutan))
    }
  }, [template])

  const resetForm = () => {
    setFormData({
      namaKomponen: '',
      bobotNilai: 0,
      nilaiMaksimal: 100,
      deskripsi: ''
    })
    setEditingKomponen(null)
  }

  const handleAddKomponen = () => {
    resetForm()
    setShowForm(true)
  }

  const handleEditKomponen = (komponen: KomponenPenilaian) => {
    setFormData({
      namaKomponen: komponen.namaKomponen,
      bobotNilai: komponen.bobotNilai,
      nilaiMaksimal: komponen.nilaiMaksimal,
      deskripsi: komponen.deskripsi || ''
    })
    setEditingKomponen(komponen)
    setShowForm(true)
  }

  const handleSubmitKomponen = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!template) return

    setLoading(true)

    try {
      const url = editingKomponen
        ? `/api/admin/template-ujian/${template.id}/komponen/${editingKomponen.id}`
        : `/api/admin/template-ujian/${template.id}/komponen`
      
      const method = editingKomponen ? 'PUT' : 'POST'
      const urutan = editingKomponen ? editingKomponen.urutan : komponenList.length + 1

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          urutan
        })
      })

      if (response.ok) {
        const newKomponen = await response.json()
        
        if (editingKomponen) {
          setKomponenList(prev => prev.map(k => 
            k.id === editingKomponen.id ? newKomponen : k
          ))
        } else {
          setKomponenList(prev => [...prev, newKomponen])
        }

        toast({
          title: "Berhasil",
          description: `Komponen penilaian berhasil ${editingKomponen ? 'diperbarui' : 'ditambahkan'}`
        })
        
        setShowForm(false)
        resetForm()
        onSuccess()
      } else {
        const error = await response.json()
        throw new Error(error.message || 'Terjadi kesalahan')
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Gagal menyimpan komponen penilaian",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteKomponen = async (id: number) => {
    if (!template || !confirm('Yakin ingin menghapus komponen ini?')) return

    try {
      const response = await fetch(`/api/admin/template-ujian/${template.id}/komponen/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setKomponenList(prev => prev.filter(k => k.id !== id))
        toast({
          title: "Berhasil",
          description: "Komponen penilaian berhasil dihapus"
        })
        onSuccess()
      } else {
        throw new Error('Gagal menghapus komponen')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menghapus komponen penilaian",
        variant: "destructive"
      })
    }
  }

  const totalBobot = komponenList.reduce((sum, k) => sum + k.bobotNilai, 0)

  const getDefaultKomponen = (jenisUjian: string) => {
    const defaults: Record<string, Array<{namaKomponen: string, bobotNilai: number}>> = {
      tasmi: [
        { namaKomponen: 'Kelancaran', bobotNilai: 50 },
        { namaKomponen: 'Tajwid & Makhraj', bobotNilai: 50 }
      ],
      mhq: [
        { namaKomponen: 'Kelancaran', bobotNilai: 30 },
        { namaKomponen: 'Ketepatan Ayat', bobotNilai: 30 },
        { namaKomponen: 'Tajwid & Makhraj', bobotNilai: 25 },
        { namaKomponen: 'Penampilan', bobotNilai: 15 }
      ],
      uas: [
        { namaKomponen: 'Kelancaran', bobotNilai: 40 },
        { namaKomponen: 'Ketepatan Ayat', bobotNilai: 30 },
        { namaKomponen: 'Tajwid & Makhraj', bobotNilai: 20 },
        { namaKomponen: 'Adab & Sikap', bobotNilai: 10 }
      ],
      kenaikan_juz: [
        { namaKomponen: 'Kelancaran', bobotNilai: 40 },
        { namaKomponen: 'Ketepatan Ayat', bobotNilai: 30 },
        { namaKomponen: 'Tajwid & Makhraj', bobotNilai: 20 },
        { namaKomponen: 'Adab & Sikap', bobotNilai: 10 }
      ]
    }
    return defaults[jenisUjian] || []
  }

  const handleUseDefault = async () => {
    if (!template) return

    const defaultKomponen = getDefaultKomponen(template.jenisUjian)
    if (defaultKomponen.length === 0) {
      toast({
        title: "Info",
        description: "Tidak ada template default untuk jenis ujian ini",
        variant: "default"
      })
      return
    }

    try {
      const response = await fetch(`/api/admin/template-ujian/${template.id}/komponen/default`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jenisUjian: template.jenisUjian })
      })

      if (response.ok) {
        const newKomponen = await response.json()
        setKomponenList(newKomponen)
        toast({
          title: "Berhasil",
          description: "Template default berhasil diterapkan"
        })
        onSuccess()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menerapkan template default",
        variant: "destructive"
      })
    }
  }

  if (!template) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Komponen Penilaian - {template.namaTemplate}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">
                Total Bobot: <span className={totalBobot === 100 ? 'text-green-600' : 'text-red-600'}>
                  {totalBobot}%
                </span>
              </p>
              {totalBobot !== 100 && (
                <p className="text-xs text-red-600">
                  Total bobot harus 100%
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleUseDefault}
                disabled={komponenList.length > 0}
              >
                Gunakan Template Default
              </Button>
              <Button onClick={handleAddKomponen}>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Komponen
              </Button>
            </div>
          </div>

          {showForm && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {editingKomponen ? 'Edit Komponen' : 'Tambah Komponen'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitKomponen} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="namaKomponen">Nama Komponen</Label>
                      <Input
                        id="namaKomponen"
                        value={formData.namaKomponen}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          namaKomponen: e.target.value
                        }))}
                        placeholder="Contoh: Kelancaran"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bobotNilai">Bobot Nilai (%)</Label>
                      <Input
                        id="bobotNilai"
                        type="number"
                        min="0"
                        max="100"
                        value={formData.bobotNilai}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          bobotNilai: parseFloat(e.target.value) || 0
                        }))}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="nilaiMaksimal">Nilai Maksimal</Label>
                    <Input
                      id="nilaiMaksimal"
                      type="number"
                      min="1"
                      value={formData.nilaiMaksimal}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        nilaiMaksimal: parseFloat(e.target.value) || 100
                      }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deskripsi">Deskripsi (Opsional)</Label>
                    <Textarea
                      id="deskripsi"
                      value={formData.deskripsi}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        deskripsi: e.target.value
                      }))}
                      placeholder="Deskripsi komponen penilaian..."
                      rows={2}
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowForm(false)
                        resetForm()
                      }}
                      disabled={loading}
                    >
                      Batal
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? 'Menyimpan...' : (editingKomponen ? 'Perbarui' : 'Simpan')}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <div className="space-y-2">
            {komponenList.map((komponen, index) => (
              <Card key={komponen.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <h4 className="font-medium">{komponen.namaKomponen}</h4>
                        {komponen.deskripsi && (
                          <p className="text-sm text-muted-foreground">
                            {komponen.deskripsi}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {komponen.bobotNilai}%
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        Max: {komponen.nilaiMaksimal}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditKomponen(komponen)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteKomponen(komponen.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {komponenList.length === 0 && (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground">
                    Belum ada komponen penilaian. Klik "Tambah Komponen" atau "Gunakan Template Default".
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}