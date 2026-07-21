/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, X } from 'lucide-react'
import { RaportTahfidzTemplate, TemplateRaportData } from './RaportTahfidzTemplate'

interface PreviewRaportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  template: (TemplateRaportData & Record<string, any>) | null
}

export function PreviewRaportDialog({ open, onOpenChange, template }: PreviewRaportDialogProps) {
  if (!template) return null

  const isActive = template.status === 'aktif' || template.isActive === true

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[24cm] w-[95vw] max-h-[94vh] flex flex-col p-0 overflow-hidden bg-slate-100 dark:bg-slate-900 border-none shadow-2xl rounded-xl">
        {/* Sticky Header Bar */}
        <DialogHeader className="no-print sticky top-0 z-30 flex flex-row items-center justify-between px-4 sm:px-6 py-3 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="gap-2 border-slate-300 hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-700 font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <DialogTitle className="text-base font-bold text-slate-800 dark:text-slate-100">
                  Review Template: {template.namaTemplate || 'Rapor Tahfidz'}
                </DialogTitle>
                <Badge variant={isActive ? 'default' : 'secondary'} className="text-xs">
                  {isActive ? 'Aktif' : 'Nonaktif'}
                </Badge>
              </div>
              <DialogDescription className="text-xs text-slate-500 hidden sm:block">
                Pratinjau tampilan dokumen raport santri berbasis template ini
              </DialogDescription>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700"
            title="Tutup Pratinjau"
          >
            <X className="w-5 h-5" />
          </Button>
        </DialogHeader>

        {/* Scrollable Document Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex justify-center">
          <RaportTahfidzTemplate
            template={template}
            onClose={() => onOpenChange(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}


