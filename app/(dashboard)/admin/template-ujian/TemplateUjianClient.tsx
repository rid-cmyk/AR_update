'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { TemplateUjianDialog } from '@/components/admin/template-ujian/TemplateUjianDialog'
import { KomponenPenilaianDialog } from '@/components/admin/template-ujian/KomponenPenilaianDialog'
import TemplateUjianCard from '@/components/admin/template-ujian/TemplateUjianCard'
import { useToast } from '@/hooks/use-toast'
import AdminHeaderCard from '@/components/admin/layout/AdminHeaderCard'
import { TemplateUjian } from '@/components/admin/template-ujian/templateUjianTypes'

interface TemplateUjianClientProps {
  initialTemplates: TemplateUjian[]
}

const ADD_TEMPLATE_BUTTON_STYLE = {
  background: 'rgba(255, 255, 255, 0.2)',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  borderRadius: 12,
  backdropFilter: 'blur(10px)',
  color: 'white',
  fontWeight: 600,
  height: 48,
  padding: '0 24px',
  fontSize: 16
} as const

export default function TemplateUjianClient({ initialTemplates }: TemplateUjianClientProps) {
  const [templates, setTemplates] = useState<TemplateUjian[]>(initialTemplates)
  const [loading, setLoading] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateUjian | null>(null)
  const [showTemplateDialog, setShowTemplateDialog] = useState(false)
  const [showKomponenDialog, setShowKomponenDialog] = useState(false)
  const { toast } = useToast()

  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/template-ujian')
      if (response.ok) {
        const data = await response.json()
        setTemplates(data.data || data)
      }
    } catch {
      toast({
        title: "Error",
        description: "Gagal memuat data template ujian",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

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
    } catch {
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
    } catch {
      toast({
        title: "Error",
        description: "Gagal mengubah status template",
        variant: "destructive"
      })
    }
  }

  if (loading && templates.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <>
      <div style={{ padding: '0 4px' }}>
        <AdminHeaderCard
          title="Template Ujian"
          subtitle="Kelola template ujian dan komponen penilaian dengan mudah"
          actions={
            <Button
              onClick={() => setShowTemplateDialog(true)}
              style={ADD_TEMPLATE_BUTTON_STYLE}
            >
              <Plus className="h-5 w-5 mr-2" />
              Tambah Template
            </Button>
          }
        />

        <div className="grid gap-6">
          {templates.map((template) => (
            <TemplateUjianCard
              key={template.id}
              template={template}
              onEdit={() => {
                setSelectedTemplate(template)
                setShowTemplateDialog(true)
              }}
              onKomponen={() => {
                setSelectedTemplate(template)
                setShowKomponenDialog(true)
              }}
              onToggle={() => handleToggleStatus(template.id, template.isActive)}
              onDelete={() => handleDeleteTemplate(template.id)}
            />
          ))}

          {templates.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">
                  Belum ada template ujian. Klik tombol &quot;Tambah Template&quot; untuk membuat template baru.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <TemplateUjianDialog
        open={showTemplateDialog}
        onOpenChange={setShowTemplateDialog}
        template={selectedTemplate as any}
        onSuccess={() => {
          fetchTemplates()
          setSelectedTemplate(null)
        }}
      />

      <KomponenPenilaianDialog
        open={showKomponenDialog}
        onOpenChange={setShowKomponenDialog}
        template={selectedTemplate as any}
        onSuccess={() => {
          fetchTemplates()
        }}
      />
    </>
  )
}
