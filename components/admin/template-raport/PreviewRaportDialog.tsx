'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'

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
  _count: { raport: number }
}

interface PreviewRaportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  template: TemplateRaport | null
}

export function PreviewRaportDialog({ open, onOpenChange, template }: PreviewRaportDialogProps) {
  if (!template) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>{template.namaTemplate}</DialogTitle>
              <DialogDescription>
                Preview template raport
              </DialogDescription>
            </div>
            <Badge variant={template.isActive ? 'default' : 'secondary'}>
              {template.isActive ? 'Aktif' : 'Nonaktif'}
            </Badge>
          </div>
        </DialogHeader>
        <div className="overflow-y-auto max-h-[calc(90vh-120px)] pr-4 space-y-6">
          {/* Header Section */}
          <div className="rounded-lg border">
            <div className="bg-primary/10 px-4 py-2 rounded-t-lg border-b">
              <h3 className="font-semibold text-sm text-primary">Header</h3>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center text-muted-foreground text-xs">
                  Logo
                </div>
                <div>
                  <p className="font-medium">{template.namaLembaga}</p>
                  {template.alamatLembaga && (
                    <p className="text-sm text-muted-foreground">{template.alamatLembaga}</p>
                  )}
                </div>
              </div>
              {template.headerKopSurat && (
                <div className="border-t pt-3">
                  <p className="text-sm font-medium mb-1">Header Kop Surat:</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{template.headerKopSurat}</p>
                </div>
              )}
            </div>
          </div>

          {/* Content Section */}
          <div className="rounded-lg border">
            <div className="bg-blue-50 dark:bg-blue-950/30 px-4 py-2 rounded-t-lg border-b">
              <h3 className="font-semibold text-sm text-blue-700 dark:text-blue-400">Konten</h3>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <p className="text-sm font-medium">Nama Template</p>
                <p className="text-sm text-muted-foreground">{template.namaTemplate}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Tahun Akademik</p>
                <p className="text-sm text-muted-foreground">{template.tahunAkademik || '-'}</p>
              </div>
              {template.formatTampilan && (
                <div className="border-t pt-3">
                  <p className="text-sm font-medium mb-1">Format Tampilan:</p>
                  <pre className="text-xs bg-muted p-2 rounded-md overflow-x-auto">
                    {JSON.stringify(template.formatTampilan, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>

          {/* Footer Section */}
          <div className="rounded-lg border">
            <div className="bg-green-50 dark:bg-green-950/30 px-4 py-2 rounded-t-lg border-b">
              <h3 className="font-semibold text-sm text-green-700 dark:text-green-400">Footer</h3>
            </div>
            <div className="p-4 space-y-3">
              {template.footerRaport && (
                <div>
                  <p className="text-sm font-medium mb-1">Footer Raport:</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{template.footerRaport}</p>
                </div>
              )}
              <div className="border-t pt-3">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-sm font-medium">Tanda Tangan</p>
                    {template.namaKepala ? (
                      <>
                        <div className="mt-8 mb-1">
                          <div className="w-32 border-b border-foreground" />
                        </div>
                        <p className="text-sm font-medium">{template.namaKepala}</p>
                        {template.jabatanKepala && (
                          <p className="text-sm text-muted-foreground">{template.jabatanKepala}</p>
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground italic mt-2">Belum diisi</p>
                    )}
                  </div>
                  {template.tandaTanganKepala && (
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">(tanda tangan)</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
