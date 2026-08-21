'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Edit, Trash2, Eye, Settings } from 'lucide-react'
import { TemplateUjian, getJenisUjianLabel } from './templateUjianTypes'

const BADGE_WHITE = {
  background: 'rgba(255,255,255,0.2)',
  color: 'white',
  border: '1px solid rgba(255,255,255,0.3)',
  fontSize: '12px',
  fontWeight: '600'
} as const

const ACTION_BUTTON_STYLE = {
  background: 'rgba(255,255,255,0.2)',
  border: '1px solid rgba(255,255,255,0.3)',
  color: 'white',
  borderRadius: '8px'
} as const

interface TemplateUjianCardProps {
  template: TemplateUjian
  onEdit: () => void
  onKomponen: () => void
  onToggle: () => void
  onDelete: () => void
}

export default function TemplateUjianCard({
  template,
  onEdit,
  onKomponen,
  onToggle,
  onDelete
}: TemplateUjianCardProps) {
  const { komponenPenilaian } = template
  const ujianCount = template._count?.ujianSantri || 0
  const isUsed = ujianCount > 0

  return (
    <Card
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
        background: '#f093fb',
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
                  ...BADGE_WHITE,
                  background: template.isActive ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'
                }}
              >
                {template.isActive ? "✅ Aktif" : "❌ Nonaktif"}
              </Badge>
            </CardTitle>
            <div className="flex gap-3 mt-3">
              <Badge variant="outline" style={BADGE_WHITE}>
                🎯 {getJenisUjianLabel(template.jenisUjian)}
              </Badge>
              <Badge variant="outline" style={BADGE_WHITE}>
                📅 {template.tahunAjaran?.namaLengkap || "Semua"}
              </Badge>
              <Badge variant="outline" style={BADGE_WHITE}>
                📊 {ujianCount} ujian
              </Badge>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onKomponen} style={ACTION_BUTTON_STYLE}>
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={onEdit} style={ACTION_BUTTON_STYLE}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={onToggle} style={ACTION_BUTTON_STYLE}>
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onDelete}
              disabled={isUsed}
              style={{
                ...ACTION_BUTTON_STYLE,
                background: isUsed ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)',
                color: isUsed ? 'rgba(255,255,255,0.5)' : 'white'
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
            {[...komponenPenilaian]
              .sort((a, b) => a.urutan - b.urutan)
              .map((komponen) => (
                <div
                  key={komponen.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '16px',
                    background: '#a8edea',
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
                        background: '#023047',
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
          {komponenPenilaian.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '32px',
              background: '#ffecd2',
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
  )
}
