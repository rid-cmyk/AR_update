'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit, Trash2, Eye, Settings } from 'lucide-react'
import { TemplateUjianDialog } from '@/components/admin/template-ujian/TemplateUjianDialog'
import { KomponenPenilaianDialog } from '@/components/admin/template-ujian/KomponenPenilaianDialog'
import { useToast } from '@/hooks/use-toast'

interface TemplateUjian {
  id: number
  namaTemplate: string
  jenisUjian: string
  deskripsi?: string
  isActive: boolean
  tahunAkademik: string
  komponenPenilaian: KomponenPenilaian[]
  _count: {
    ujian: number
  }
}

interface KomponenPenilaian {
  id: number
  namaKomponen: string
  bobotNilai: number
  nilaiMaksimal: number
  deskripsi?: string
  urutan: number
}

export default function TemplateUjianPage() {
  const [templates, setTemplates] = useState<TemplateUjian[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateUjian | null>(null)
  const [showTemplateDialog, setShowTemplateDialog] = useState(false)
  const [showKomponenDialog, setShowKomponenDialog] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/admin/template-ujian')
      if (response.ok) {
        const data = await response.json()
        setTemplates(data)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal memuat data template ujian",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTemplate = async (id: number) => {
    if (!confirm('Yakin ingin menghapus template ini?')) return

    try {
      const response = await fetch(`/api/admin/template-ujian/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast({
          title: "Berhasil",
          description: "Template ujian berhasil dihapus"
        })
        fetchTemplates()
      } else {
        throw new Error('Gagal menghapus template')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menghapus template ujian",
        variant: "destructive"
      })
    }
  }

  const handleToggleStatus = async (id: number, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/template-ujian/${id}/toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive })
      })

      if (response.ok) {
        toast({
          title: "Berhasil",
          description: `Template ${!isActive ? 'diaktifkan' : 'dinonaktifkan'}`
        })
        fetchTemplates()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal mengubah status template",
        variant: "destructive"
      })
    }
  }

  const getJenisUjianLabel = (jenis: string) => {
    const labels: Record<string, string> = {
      tasmi: "Tasmi'",
      mhq: "MHQ",
      uas: "UAS",
      kenaikan_juz: "Kenaikan Juz",
      tahfidz: "Tahfidz",
      lainnya: "Lainnya"
    }
    return labels[jenis] || jenis
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div style={{ 
      padding: "32px", 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '20px',
        padding: '32px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(10px)',
        marginBottom: '24px'
      }}>
        <div className="flex justify-between items-center">
          <div>
            <h1 style={{ 
              fontSize: '36px', 
              fontWeight: '800',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '8px'
            }}>
              📋 Template Ujian
            </h1>
            <p style={{ 
              color: '#4a5568', 
              fontSize: '18px',
              fontWeight: '500',
              margin: 0
            }}>
              Kelola template ujian dan komponen penilaian dengan mudah
            </p>
          </div>
          <Button 
            onClick={() => setShowTemplateDialog(true)}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              borderRadius: '12px',
              height: '48px',
              padding: '0 24px',
              fontSize: '16px',
              fontWeight: '600',
              boxShadow: '0 8px 20px rgba(102, 126, 234, 0.3)'
            }}
          >
            <Plus className="h-5 w-5 mr-2" />
            Tambah Template
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {templates.map((template) => (
          <Card 
            key={template.id}
            style={{
              borderRadius: '16px',
              border: 'none',
              background: 'rgba(255, 255, 255, 0.95)',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
              backdropFilter: 'blur(10px)',
              overflow: 'hidden'
            }}
          >
            <CardHeader style={{ 
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white',
              padding: '24px'
            }}>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-3" style={{ color: 'white', fontSize: '20px', fontWeight: '700' }}>
                    📋 {template.namaTemplate}
                    <Badge 
                      variant={template.isActive ? "default" : "secondary"}
                      style={{
                        background: template.isActive ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                        color: 'white',
                        border: '1px solid rgba(255,255,255,0.3)',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}
                    >
                      {template.isActive ? "✅ Aktif" : "❌ Nonaktif"}
                    </Badge>
                  </CardTitle>
                  <div className="flex gap-3 mt-3">
                    <Badge 
                      variant="outline"
                      style={{
                        background: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        border: '1px solid rgba(255,255,255,0.3)',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}
                    >
                      🎯 {getJenisUjianLabel(template.jenisUjian)}
                    </Badge>
                    <Badge 
                      variant="outline"
                      style={{
                        background: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        border: '1px solid rgba(255,255,255,0.3)',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}
                    >
                      📅 {template.tahunAkademik}
                    </Badge>
                    <Badge 
                      variant="outline"
                      style={{
                        background: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        border: '1px solid rgba(255,255,255,0.3)',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}
                    >
                      📊 {template._count.ujian} ujian
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedTemplate(template)
                      setShowKomponenDialog(true)
                    }}
                    style={{
                      background: 'rgba(255,255,255,0.2)',
                      border: '1px solid rgba(255,255,255,0.3)',
                      color: 'white',
                      borderRadius: '8px'
                    }}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedTemplate(template)
                      setShowTemplateDialog(true)
                    }}
                    style={{
                      background: 'rgba(255,255,255,0.2)',
                      border: '1px solid rgba(255,255,255,0.3)',
                      color: 'white',
                      borderRadius: '8px'
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleStatus(template.id, template.isActive)}
                    style={{
                      background: 'rgba(255,255,255,0.2)',
                      border: '1px solid rgba(255,255,255,0.3)',
                      color: 'white',
                      borderRadius: '8px'
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteTemplate(template.id)}
                    disabled={template._count.ujian > 0}
                    style={{
                      background: template._count.ujian > 0 ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)',
                      border: '1px solid rgba(255,255,255,0.3)',
                      color: template._count.ujian > 0 ? 'rgba(255,255,255,0.5)' : 'white',
                      borderRadius: '8px'
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent style={{ padding: '24px' }}>
              {template.deskripsi && (
                <p style={{ 
                  fontSize: '14px', 
                  color: '#6b7280', 
                  marginBottom: '20px',
                  fontStyle: 'italic'
                }}>
                  📝 {template.deskripsi}
                </p>
              )}
              
              <div style={{ marginTop: '16px' }}>
                <h4 style={{ 
                  fontWeight: '700', 
                  fontSize: '16px', 
                  color: '#1a202c',
                  marginBottom: '12px'
                }}>
                  🎯 Komponen Penilaian:
                </h4>
                <div className="grid gap-3">
                  {template.komponenPenilaian
                    .sort((a, b) => a.urutan - b.urutan)
                    .map((komponen) => (
                      <div
                        key={komponen.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '16px',
                          background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                          borderRadius: '12px',
                          border: '1px solid rgba(0,0,0,0.05)'
                        }}
                      >
                        <span style={{ 
                          fontWeight: '600', 
                          color: '#1a202c',
                          fontSize: '14px'
                        }}>
                          📊 {komponen.namaKomponen}
                        </span>
                        <div className="flex items-center gap-3">
                          <Badge 
                            variant="secondary"
                            style={{
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              color: 'white',
                              border: 'none',
                              fontSize: '12px',
                              fontWeight: '600'
                            }}
                          >
                            {komponen.bobotNilai}%
                          </Badge>
                          <span style={{ 
                            fontSize: '12px', 
                            color: '#6b7280',
                            fontWeight: '500'
                          }}>
                            Max: {komponen.nilaiMaksimal}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
                {template.komponenPenilaian.length === 0 && (
                  <div style={{
                    textAlign: 'center',
                    padding: '32px',
                    background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
                    borderRadius: '12px',
                    border: '1px solid rgba(0,0,0,0.05)'
                  }}>
                    <p style={{ 
                      fontSize: '14px', 
                      color: '#6b7280',
                      fontStyle: 'italic',
                      margin: 0
                    }}>
                      ⚠️ Belum ada komponen penilaian
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {templates.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">
                Belum ada template ujian. Klik tombol "Tambah Template" untuk membuat template baru.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <TemplateUjianDialog
        open={showTemplateDialog}
        onOpenChange={setShowTemplateDialog}
        template={selectedTemplate}
        onSuccess={() => {
          fetchTemplates()
          setSelectedTemplate(null)
        }}
      />

      <KomponenPenilaianDialog
        open={showKomponenDialog}
        onOpenChange={setShowKomponenDialog}
        template={selectedTemplate}
        onSuccess={() => {
          fetchTemplates()
        }}
      />
    </div>
  )
}