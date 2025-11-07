'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'

interface TemplateUjian {
  id: number
  namaTemplate: string
  jenisUjian: string
  deskripsi?: string
  isActive: boolean
  tahunAkademik: string
}

interface TemplateUjianDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  template?: TemplateUjian | null
  onSuccess: () => void
}

export function TemplateUjianDialog({
  open,
  onOpenChange,
  template,
  onSuccess
}: TemplateUjianDialogProps) {
  const [formData, setFormData] = useState({
    namaTemplate: '',
    jenisUjian: '',
    deskripsi: '',
    isActive: true,
    tahunAkademik: ''
  })
  const [loading, setLoading] = useState(false)
  const [tahunAkademikOptions, setTahunAkademikOptions] = useState<string[]>([])
  const { toast } = useToast()

  useEffect(() => {
    if (template) {
      setFormData({
        namaTemplate: template.namaTemplate,
        jenisUjian: template.jenisUjian,
        deskripsi: template.deskripsi || '',
        isActive: template.isActive,
        tahunAkademik: template.tahunAkademik
      })
    } else {
      setFormData({
        namaTemplate: '',
        jenisUjian: '',
        deskripsi: '',
        isActive: true,
        tahunAkademik: ''
      })
    }
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
        const result = await response.json()
        const data = result.success ? result.data : result
        setTahunAkademikOptions(data.map((ta: any) => ta.tahunAkademik))
      }
    } catch (error) {
      console.error('Error fetching tahun akademik:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = template 
        ? `/api/admin/template-ujian/${template.id}`
        : '/api/admin/template-ujian'
      
      const method = template ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast({
          title: "Berhasil",
          description: `Template ujian berhasil ${template ? 'diperbarui' : 'dibuat'}`
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
        description: error.message || "Gagal menyimpan template ujian",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const jenisUjianOptions = [
    { value: 'tasmi', label: "Tasmi'" },
    { value: 'mhq', label: 'MHQ (Musabaqah Hifdzil Qur\'an)' },
    { value: 'uas', label: 'UAS (Ujian Akhir Semester)' },
    { value: 'kenaikan_juz', label: 'Ujian Kenaikan Juz' },
    { value: 'tahfidz', label: 'Tahfidz' },
    { value: 'lainnya', label: 'Lainnya' }
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-lg"
        style={{
          borderRadius: '20px',
          border: 'none',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
          backdropFilter: 'blur(20px)'
        }}
      >
        <DialogHeader style={{ padding: '24px 24px 0 24px' }}>
          <DialogTitle style={{
            fontSize: '24px',
            fontWeight: '800',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textAlign: 'center',
            marginBottom: '8px'
          }}>
            {template ? '✏️ Edit Template Ujian' : '➕ Tambah Template Ujian'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} style={{ padding: '0 24px 24px 24px' }}>
          <div style={{ display: 'grid', gap: '20px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
              borderRadius: '16px',
              padding: '20px',
              border: '1px solid rgba(0,0,0,0.05)'
            }}>
              <Label 
                htmlFor="namaTemplate"
                style={{ 
                  fontSize: '14px', 
                  fontWeight: '700', 
                  color: '#1a202c',
                  display: 'block',
                  marginBottom: '8px'
                }}
              >
                📋 Nama Template
              </Label>
              <Input
                id="namaTemplate"
                value={formData.namaTemplate}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  namaTemplate: e.target.value
                }))}
                placeholder="Contoh: Template Tasmi' Semester 1"
                required
                style={{
                  borderRadius: '12px',
                  border: '2px solid rgba(255,255,255,0.8)',
                  background: 'rgba(255,255,255,0.9)',
                  fontSize: '14px',
                  fontWeight: '500',
                  padding: '12px 16px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                }}
              />
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
              borderRadius: '16px',
              padding: '20px',
              border: '1px solid rgba(0,0,0,0.05)'
            }}>
              <Label 
                htmlFor="jenisUjian"
                style={{ 
                  fontSize: '14px', 
                  fontWeight: '700', 
                  color: '#1a202c',
                  display: 'block',
                  marginBottom: '8px'
                }}
              >
                🎯 Jenis Ujian
              </Label>
              <Select
                value={formData.jenisUjian}
                onValueChange={(value) => setFormData(prev => ({
                  ...prev,
                  jenisUjian: value
                }))}
                required
              >
                <SelectTrigger style={{
                  borderRadius: '12px',
                  border: '2px solid rgba(255,255,255,0.8)',
                  background: 'rgba(255,255,255,0.9)',
                  fontSize: '14px',
                  fontWeight: '500',
                  padding: '12px 16px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  height: '48px'
                }}>
                  <SelectValue placeholder="Pilih jenis ujian" />
                </SelectTrigger>
                <SelectContent style={{
                  borderRadius: '12px',
                  border: 'none',
                  background: 'rgba(255,255,255,0.95)',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                  backdropFilter: 'blur(10px)'
                }}>
                  {jenisUjianOptions.map((option) => (
                    <SelectItem 
                      key={option.value} 
                      value={option.value}
                      style={{
                        fontSize: '14px',
                        fontWeight: '500',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        margin: '4px'
                      }}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)',
              borderRadius: '16px',
              padding: '20px',
              border: '1px solid rgba(0,0,0,0.05)'
            }}>
              <Label 
                htmlFor="tahunAkademik"
                style={{ 
                  fontSize: '14px', 
                  fontWeight: '700', 
                  color: '#1a202c',
                  display: 'block',
                  marginBottom: '8px'
                }}
              >
                📅 Tahun Akademik
              </Label>
              <Select
                value={formData.tahunAkademik}
                onValueChange={(value) => setFormData(prev => ({
                  ...prev,
                  tahunAkademik: value
                }))}
                required
              >
                <SelectTrigger style={{
                  borderRadius: '12px',
                  border: '2px solid rgba(255,255,255,0.8)',
                  background: 'rgba(255,255,255,0.9)',
                  fontSize: '14px',
                  fontWeight: '500',
                  padding: '12px 16px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  height: '48px'
                }}>
                  <SelectValue placeholder="Pilih tahun akademik" />
                </SelectTrigger>
                <SelectContent style={{
                  borderRadius: '12px',
                  border: 'none',
                  background: 'rgba(255,255,255,0.95)',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                  backdropFilter: 'blur(10px)'
                }}>
                  {tahunAkademikOptions.map((tahun) => (
                    <SelectItem 
                      key={tahun} 
                      value={tahun}
                      style={{
                        fontSize: '14px',
                        fontWeight: '500',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        margin: '4px'
                      }}
                    >
                      {tahun}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)',
              borderRadius: '16px',
              padding: '20px',
              border: '1px solid rgba(0,0,0,0.05)'
            }}>
              <Label 
                htmlFor="deskripsi"
                style={{ 
                  fontSize: '14px', 
                  fontWeight: '700', 
                  color: '#1a202c',
                  display: 'block',
                  marginBottom: '8px'
                }}
              >
                📝 Deskripsi (Opsional)
              </Label>
              <Textarea
                id="deskripsi"
                value={formData.deskripsi}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  deskripsi: e.target.value
                }))}
                placeholder="Deskripsi template ujian..."
                rows={3}
                style={{
                  borderRadius: '12px',
                  border: '2px solid rgba(255,255,255,0.8)',
                  background: 'rgba(255,255,255,0.9)',
                  fontSize: '14px',
                  fontWeight: '500',
                  padding: '12px 16px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  resize: 'none'
                }}
              />
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
              borderRadius: '16px',
              padding: '20px',
              border: '1px solid rgba(0,0,0,0.05)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData(prev => ({
                  ...prev,
                  isActive: checked
                }))}
                style={{
                  background: formData.isActive ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#ccc'
                }}
              />
              <Label 
                htmlFor="isActive"
                style={{ 
                  fontSize: '14px', 
                  fontWeight: '700', 
                  color: '#1a202c',
                  cursor: 'pointer'
                }}
              >
                {formData.isActive ? '✅ Template Aktif' : '❌ Template Nonaktif'}
              </Label>
            </div>
          </div>

          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            gap: '12px',
            marginTop: '24px',
            paddingTop: '20px',
            borderTop: '2px solid rgba(0,0,0,0.05)'
          }}>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              style={{
                borderRadius: '12px',
                border: '2px solid rgba(0,0,0,0.1)',
                background: 'rgba(255,255,255,0.8)',
                color: '#6b7280',
                fontSize: '14px',
                fontWeight: '600',
                padding: '12px 24px',
                height: '48px',
                flex: 1
              }}
            >
              ❌ Batal
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !formData.namaTemplate || !formData.jenisUjian || !formData.tahunAkademik}
              style={{
                borderRadius: '12px',
                border: 'none',
                background: loading || !formData.namaTemplate || !formData.jenisUjian || !formData.tahunAkademik 
                  ? '#ccc' 
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                fontSize: '14px',
                fontWeight: '700',
                padding: '12px 24px',
                height: '48px',
                boxShadow: loading || !formData.namaTemplate || !formData.jenisUjian || !formData.tahunAkademik 
                  ? 'none' 
                  : '0 8px 20px rgba(102, 126, 234, 0.3)',
                flex: 1,
                cursor: loading || !formData.namaTemplate || !formData.jenisUjian || !formData.tahunAkademik 
                  ? 'not-allowed' 
                  : 'pointer'
              }}
            >
              {loading ? '⏳ Menyimpan...' : (template ? '💾 Perbarui' : '💾 Simpan')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}