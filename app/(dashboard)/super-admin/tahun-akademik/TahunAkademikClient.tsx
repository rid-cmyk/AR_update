'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit, Trash2, CheckCircle, Calendar, ChevronDown, ChevronRight, BookOpen } from 'lucide-react'
import { TahunAkademikDialog } from '@/components/super-admin/tahun-akademik/TahunAkademikDialog'
import { SemesterDialog } from '@/components/super-admin/tahun-akademik/SemesterDialog'
import AdminHeaderCard from '@/components/super-admin/layout/AdminHeaderCard'
import { useToast } from '@/hooks/use-toast'

interface Semester {
  id: number
  tahunAjaranId: number
  semesterUrutan: number
  namaSemester: string
  tanggalMulai: string
  tanggalSelesai: string
  isActive: boolean
}

interface TahunAjaran {
  id: number
  tahunMulai: number
  tahunSelesai: number
  namaLengkap: string
  tanggalMulai: string
  tanggalSelesai: string
  isActive: boolean
  semesters: Semester[]
  _count?: {
    templateUjian: number
    templateRaport: number
    ujianSantri: number
    raportSantri: number
  }
}

interface Props {
  initialTahunAkademik: TahunAjaran[]
}

export default function TahunAkademikClient({ initialTahunAkademik }: Props) {
  const [data, setData] = useState<TahunAjaran[]>(initialTahunAkademik)
  const [expandedTahun, setExpandedTahun] = useState<number[]>([])
  
  const [showTahunDialog, setShowTahunDialog] = useState(false)
  const [selectedTahun, setSelectedTahun] = useState<TahunAjaran | null>(null)

  const [showSemesterDialog, setShowSemesterDialog] = useState(false)
  const [selectedSemester, setSelectedSemester] = useState<Semester | null>(null)
  
  const { toast } = useToast()

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch('/api/super-admin/tahun-akademik')
      if (response.ok) {
        const result = await response.json()
        if (result.success) setData(result.data)
      }
    } catch {
      toast({ title: "Error", description: "Gagal memuat data", variant: "destructive" })
    }
  }, [toast])

  const toggleExpand = (id: number) => {
    setExpandedTahun(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const handleDeleteTahun = async (id: number) => {
    if (!confirm('Hapus Tahun Ajaran ini dan semua semesternya?')) return
    try {
      const res = await fetch(`/api/super-admin/tahun-akademik/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast({ title: "Berhasil", description: "Tahun Ajaran dihapus" })
        fetchData()
      } else {
        const err = await res.json()
        throw new Error(err.message || 'Gagal menghapus')
      }
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" })
    }
  }

  const handleSetActiveSemester = async (id: number) => {
    try {
      const res = await fetch(`/api/super-admin/semester/${id}/active`, { method: 'POST' })
      if (res.ok) {
        toast({ title: "Berhasil", description: "Semester diaktifkan" })
        fetchData()
      } else {
        const err = await res.json()
        throw new Error(err.message || 'Gagal mengaktifkan')
      }
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" })
    }
  }

  return (
    <div className="space-y-6">
      <AdminHeaderCard
        title="Tahun Akademik & Semester"
        subtitle="Kelola Tahun Ajaran dan pengaturan tanggal per semester"
        actions={
          <Button onClick={() => { setSelectedTahun(null); setShowTahunDialog(true) }}>
            <Plus className="w-4 h-4 mr-2" />
            Tambah Tahun Ajaran
          </Button>
        }
      />

      <div className="space-y-4">
        {data.map((tahun) => (
          <Card key={tahun.id} className="overflow-hidden">
            <CardHeader 
              className={`cursor-pointer transition-colors hover:bg-muted/50 ${expandedTahun.includes(tahun.id) ? 'bg-muted/20' : ''}`}
              onClick={() => toggleExpand(tahun.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {expandedTahun.includes(tahun.id) ? (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  )}
                  <CardTitle className="text-lg">{tahun.namaLengkap}</CardTitle>
                  <Badge variant={tahun.isActive ? "default" : "secondary"}>
                    {tahun.isActive ? "Ada Semester Aktif" : "Nonaktif"}
                  </Badge>
                </div>
                <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                  <Button variant="outline" size="sm" onClick={() => { setSelectedTahun(tahun); setShowTahunDialog(true) }}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDeleteTahun(tahun.id)} disabled={tahun.isActive}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            {expandedTahun.includes(tahun.id) && (
              <CardContent className="pt-4 border-t bg-muted/10">
                <div className="space-y-3">
                  {tahun.semesters?.map((sem) => (
                    <div key={sem.id} className={`flex items-center justify-between p-3 rounded-lg border bg-card ${sem.isActive ? 'border-primary ring-1 ring-primary/20' : ''}`}>
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-primary/10 rounded-full text-primary">
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{sem.namaSemester}</span>
                            {sem.isActive && <Badge variant="default" className="text-[10px] px-1 py-0 h-4">Aktif Saat Ini</Badge>}
                          </div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(sem.tanggalMulai).toLocaleDateString('id-ID')} - {new Date(sem.tanggalSelesai).toLocaleDateString('id-ID')}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {!sem.isActive && (
                          <Button variant="outline" size="sm" onClick={() => handleSetActiveSemester(sem.id)} title="Jadikan Semester Aktif">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          </Button>
                        )}
                        <Button variant="outline" size="sm" onClick={() => { setSelectedSemester(sem); setShowSemesterDialog(true) }}>
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {(!tahun.semesters || tahun.semesters.length === 0) && (
                    <div className="text-center p-4 text-muted-foreground text-sm border border-dashed rounded-lg">
                      Belum ada semester.
                    </div>
                  )}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      <TahunAkademikDialog
        open={showTahunDialog}
        onOpenChange={setShowTahunDialog}
        tahunAjaran={selectedTahun}
        onSuccess={() => { setShowTahunDialog(false); fetchData() }}
      />

      <SemesterDialog
        open={showSemesterDialog}
        onOpenChange={setShowSemesterDialog}
        semester={selectedSemester}
        onSuccess={() => { setShowSemesterDialog(false); fetchData() }}
      />
    </div>
  )
}
