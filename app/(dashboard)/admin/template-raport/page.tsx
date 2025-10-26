'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit, Trash2, Eye, FileText, Download } from 'lucide-react'
import { TemplateRaportDialog } from '@/components/admin/template-raport/TemplateRaportDialog'
import { PreviewRaportDialog } from '@/components/admin/template-raport/PreviewRaportDialog'
import { useToast } from '@/hooks/use-toast'

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
  _count: {
    raport: number
  }
}

export default function TemplateRaportPage() {
  const [templates, setTemplates] = useState<TemplateRaport[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateRaport | null>(null)
  const [showTemplateDialog, setShowTemplateDialog] = useState(false)
  const [showPreviewDialog, setShowPreviewDialog] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/admin/template-raport')
      if (response.ok) {
        const data = await response.json()
        setTemplates(data)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal memuat data template raport",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTemplate = async (id: number) => {
    if (!confirm('Yakin ingin menghapus template ini?')) return

    try {
      const response = await fetch(`/api/admin/template-raport/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast({
          title: "Berhasil",
          description: "Template raport berhasil dihapus"
        })
        fetchTemplates()
      } else {
        throw new Error('Gagal menghapus template')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menghapus template raport",
        variant: "destructive"
      })
    }
  }

  const handleToggleStatus = async (id: number, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/template-raport/${id}/toggle`, {
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

  const handleExportTemplate = async (id: number) => {
    try {
      const response = await fetch(`/api/admin/template-raport/${id}/export`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `template-raport-${id}.json`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        
        toast({
          title: "Berhasil",
          description: "Template berhasil diekspor"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal mengekspor template",
        variant: "destructive"
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Template Raport</h1>
          <p className="text-muted-foreground">
            Kelola template raport dan format tampilan
          </p>
        </div>
        <Button onClick={() => setShowTemplateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Template
        </Button>
      </div>

      <div className="grid gap-6">
        {templates.map((template) => (
          <Card key={template.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {template.namaTemplate}
                    <Badge variant={template.isActive ? "default" : "secondary"}>
                      {template.isActive ? "Aktif" : "Nonaktif"}
                    </Badge>
                  </CardTitle>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline">
                      {template.namaLembaga}
                    </Badge>
                    <Badge variant="outline">
                      {template.tahunAkademik}
                    </Badge>
                    <Badge variant="outline">
                      {template._count.raport} raport
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedTemplate(template)
                      setShowPreviewDialog(true)
                    }}
                  >
                    <FileText className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExportTemplate(template.id)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedTemplate(template)
                      setShowTemplateDialog(true)
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleStatus(template.id, template.isActive)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteTemplate(template.id)}
                    disabled={template._count.raport > 0}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Informasi Lembaga:</h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Nama:</span> {template.namaLembaga}</p>
                    {template.alamatLembaga && (
                      <p><span className="font-medium">Alamat:</span> {template.alamatLembaga}</p>
                    )}
                    {template.namaKepala && (
                      <p><span className="font-medium">Kepala:</span> {template.namaKepala}</p>
                    )}
                    {template.jabatanKepala && (
                      <p><span className="font-medium">Jabatan:</span> {template.jabatanKepala}</p>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Komponen Template:</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${template.logoLembaga ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span>Logo Lembaga</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${template.headerKopSurat ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span>Header Kop Surat</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${template.tandaTanganKepala ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span>Tanda Tangan</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${template.footerRaport ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span>Footer Raport</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {templates.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">
                Belum ada template raport. Klik tombol "Tambah Template" untuk membuat template baru.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <TemplateRaportDialog
        open={showTemplateDialog}
        onOpenChange={setShowTemplateDialog}
        template={selectedTemplate}
        onSuccess={() => {
          fetchTemplates()
          setSelectedTemplate(null)
        }}
      />

      <PreviewRaportDialog
        open={showPreviewDialog}
        onOpenChange={setShowPreviewDialog}
        template={selectedTemplate}
      />
    </div>
  )
}