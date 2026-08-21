'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { App } from 'antd'
import {
  Eye,
  User,
  Calendar,
  BookOpen,
  Clock,
  Target,
  Download,
  RotateCcw,
  Loader2,
  ClipboardCheck,
  MessageSquare,
  Info,
  FileText,
} from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

const formatSafeDate = (dateString: string | undefined, formatString: string = "dd MMM yyyy HH:mm"): string => {
  if (!dateString) return 'N/A'

  try {
    const date = new Date(dateString)
    return isNaN(date.getTime()) ? 'Invalid Date' : format(date, formatString, { locale: id })
  } catch {
    return 'Invalid Date'
  }
}

const getInitial = (name?: string) => {
  const trimmed = (name || '').trim()
  return trimmed ? trimmed[0].toUpperCase() : '?'
}

const getPredikat = (nilai: number | null) => {
  if (nilai == null) return 'Belum dinilai'
  if (nilai >= 80) return 'Sangat Baik'
  if (nilai >= 70) return 'Baik'
  if (nilai >= 60) return 'Cukup'
  return 'Perlu Perbaikan'
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'selesai': return 'Selesai'
    case 'diverifikasi':
    case 'submitted': return 'Menunggu Verifikasi'
    case 'draft': return 'Draft'
    case 'ditolak': return 'Ditolak'
    default: return status
  }
}

interface UjianDetail {
  id: number
  nilaiAkhir: number | null
  catatanGuru: string
  tanggalUjian: string
  statusUjian: string
  juzDari?: number
  juzSampai?: number
  santriId?: number
  createdAt: string
  santriNama?: string
  halaqah?: string
  santri?: {
    namaLengkap: string
    username: string
    halaqah?: {
      namaHalaqah: string
    }
  }
  templateUjian: {
    namaTemplate: string
    jenisUjian: string
  }
  nilaiDetail?: Record<string, number>
  pengaturan?: Record<string, any>
}

interface DetailUjianDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ujian: UjianDetail | null
}

function InfoTile({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ElementType
  label: string
  value: string
  sub?: string
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
      <div className="w-9 h-9 shrink-0 rounded-lg bg-white border border-slate-200 text-blue-600 flex items-center justify-center">
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-800 truncate">{value}</p>
        <p className="text-xs text-slate-500 truncate">
          {label}
          {sub ? ` • ${sub}` : ''}
        </p>
      </div>
    </div>
  )
}

export function DetailUjianDialog({
  open,
  onOpenChange,
  ujian,
}: DetailUjianDialogProps) {
  const router = useRouter()
  const { message } = App.useApp()
  const [startingRemedial, setStartingRemedial] = useState(false)

  const handleStartRemedial = async () => {
    if (!ujian) return
    setStartingRemedial(true)
    try {
      const res = await fetch(`/api/guru/ujian/${ujian.id}/remedial`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Gagal membuat ujian remedial')
      }
      const remedial = await res.json()
      const jenis = ujian.templateUjian?.jenisUjian || 'kenaikan_juz'
      const kkm = Number(ujian.pengaturan?.kkm) || 70
      const params = new URLSearchParams({
        mode: 'remedial',
        id: String(remedial.id),
        santri: String(remedial.santriId || ujian.santriId),
        nama: remedial.santri?.namaLengkap || ujian.santriNama || 'Santri',
        jenis,
        dari: String(remedial.juzDari || ujian.juzDari || 1),
        sampai: String(remedial.juzSampai || ujian.juzSampai || 1),
        kkm: String(kkm),
      })
      onOpenChange(false)
      router.push(`/ujian?${params.toString()}`)
    } catch (err: any) {
      message.error(err?.message || 'Gagal membuat ujian remedial')
    } finally {
      setStartingRemedial(false)
    }
  }

  const renderNilaiDetail = () => {
    const detail = ujian?.nilaiDetail
    const pengaturan = ujian?.pengaturan
    const nilaiPerJuz = pengaturan?.nilaiPerJuz as Record<string, { nilai: number; predikat: string; status: string; isRemedial?: boolean }> | undefined
    const juzRemedialList = Array.isArray(pengaturan?.juzRemedialList) ? pengaturan.juzRemedialList : []
    const rekomendasiRemedial = Boolean(pengaturan?.rekomendasiRemedial)

    if (!detail && !nilaiPerJuz) return null

    return (
      <div className="space-y-6">
        {rekomendasiRemedial && juzRemedialList.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-900 flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <div className="font-bold flex items-center gap-2">
                <span>⚠️ Perlu Remedial Per-Juz</span>
              </div>
              <Button
                size="sm"
                onClick={handleStartRemedial}
                disabled={startingRemedial}
                className="shrink-0"
              >
                {startingRemedial ? (
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                  <RotateCcw className="w-4 h-4 mr-1" />
                )}
                Mulai Ujian Remedial
              </Button>
            </div>
            <p className="text-sm">
              Terdapat {juzRemedialList.length} juz di bawah KKM ({pengaturan?.kkm || 70}): <span className="font-bold">Juz {juzRemedialList.join(', ')}</span>.
            </p>
          </div>
        )}

        {nilaiPerJuz && Object.keys(nilaiPerJuz).length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {Object.entries(nilaiPerJuz).map(([juzKey, item]) => (
              <div key={juzKey} className={`text-sm p-4 rounded-2xl border ${
                item.status === 'LULUS'
                  ? 'bg-emerald-50/50 border-emerald-200'
                  : 'bg-amber-50/70 border-amber-300'
              }`}>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-slate-700">Juz {juzKey}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                    item.status === 'LULUS' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                  }`}>
                    {item.status === 'LULUS' ? 'Lulus' : 'Remedial'}
                  </span>
                </div>
                <div className="text-2xl font-bold text-slate-900 tabular-nums">{item.nilai}</div>
                <div className="text-xs text-slate-600 font-medium">{item.predikat}</div>
              </div>
            ))}
          </div>
        )}

        {detail && Object.keys(detail).length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-slate-700">Rincian Pertanyaan / Aspek Penilaian:</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-64 overflow-y-auto">
              {Object.entries(detail).map(([key, nilai]) => (
                <div key={key} className="text-sm bg-gray-50 p-2 rounded">
                  <div className="font-medium text-xs text-gray-600 break-words">{key}</div>
                  <div className="text-lg font-bold">{nilai}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  if (!ujian) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Data ujian tidak ditemukan</p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  const nilai = ujian.nilaiAkhir
  const halaqah = ujian.santri?.halaqah?.namaHalaqah || ujian.halaqah
  const jenis = ujian.templateUjian?.jenisUjian || ''
  const juzText = ujian.juzDari && ujian.juzSampai ? `Juz ${ujian.juzDari} - ${ujian.juzSampai}` : 'Semua Juz'
  const kkm = Number(ujian.pengaturan?.kkm) || 70

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-0 gap-0 rounded-3xl">
        <DialogHeader className="sr-only">
          <DialogTitle>Detail Ujian</DialogTitle>
        </DialogHeader>

        {/* Banner */}
        <div className="relative overflow-hidden rounded-t-3xl bg-gradient-to-br from-sky-blue via-blue-green to-deep-space p-6 sm:p-8 text-white">
          <div className="pointer-events-none absolute -top-14 -right-8 h-52 w-52 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-20 -right-2 h-64 w-64 rounded-full bg-white/5" />
          <div className="pointer-events-none absolute -top-10 -left-8 h-40 w-40 rounded-full bg-white/5" />

          <div className="relative">
            <div className="flex items-center justify-between gap-3 mb-6">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wider backdrop-blur-sm">
                <Eye className="h-3.5 w-3.5" />
                Detail Ujian
              </span>
              <Button
                variant="outline"
                size="sm"
                className="bg-white/15 border-white/30 text-white hover:bg-white/25 hover:text-white rounded-full"
              >
                <Download className="w-4 h-4 mr-1" />
                Export
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-14 h-14 shrink-0 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-2xl font-extrabold">
                  {getInitial(ujian.santri?.namaLengkap || ujian.santriNama)}
                </div>
                <div className="min-w-0">
                  <h2 className="text-xl sm:text-2xl font-extrabold truncate">
                    {ujian.santri?.namaLengkap || ujian.santriNama || 'Nama Santri'}
                  </h2>
                  <p className="text-sm text-white/85 truncate">
                    @{ujian.santri?.username || 'username'}
                    {halaqah ? ` • ${halaqah}` : ''}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge className="bg-white/20 border-white/25 text-white">
                      {getStatusLabel(ujian.statusUjian)}
                    </Badge>
                    <Badge className="bg-white/20 border-white/25 text-white uppercase">
                      {jenis || 'Tahfidz'}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="text-left sm:text-right shrink-0">
                <div className="text-xs text-white/70 uppercase tracking-wider font-semibold">Nilai Akhir</div>
                <div className="text-4xl sm:text-5xl font-extrabold tabular-nums leading-none mt-1">
                  {nilai ?? '—'}
                </div>
                <div className="text-xs text-white/85 font-medium mt-1.5">{getPredikat(nilai)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <InfoTile
              icon={BookOpen}
              label="Template"
              value={ujian.templateUjian?.namaTemplate || 'Ujian Tahfidz'}
              sub={juzText}
            />
            <InfoTile
              icon={Calendar}
              label="Tanggal Ujian"
              value={formatSafeDate(ujian.tanggalUjian, 'dd MMM yyyy')}
              sub={formatSafeDate(ujian.tanggalUjian, 'HH:mm')}
            />
            <InfoTile icon={Target} label="KKM" value={String(kkm)} sub="Per-Juz" />
            <InfoTile
              icon={Clock}
              label="Dibuat"
              value={formatSafeDate(ujian.createdAt, 'dd MMM yyyy HH:mm')}
              sub="Waktu input"
            />
          </div>

          <section className="space-y-3">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4 text-blue-600" />
              Detail Penilaian
            </h3>
            {renderNilaiDetail() ?? (
              <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-6 text-center text-sm text-slate-500">
                Belum ada data penilaian untuk ujian ini.
              </div>
            )}
          </section>

          {ujian.catatanGuru && (
            <section className="rounded-2xl border border-amber-100 bg-amber-50/60 p-4">
              <h3 className="text-sm font-semibold text-amber-900 mb-1.5 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Catatan Guru
              </h3>
              <p className="text-sm text-amber-800 leading-relaxed whitespace-pre-line">{ujian.catatanGuru}</p>
            </section>
          )}

          <section className="space-y-3">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-600" />
              Informasi Tambahan
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="text-slate-500 w-24">Halaqah</span>
                <span className="font-medium text-slate-800">{halaqah || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="text-slate-500 w-24">Jenis Ujian</span>
                <span className="font-medium text-slate-800 uppercase">{jenis || 'Tahfidz'}</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="text-slate-500 w-24">ID Ujian</span>
                <span className="font-medium text-slate-800">#{ujian.id}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="text-slate-500 w-24">Status</span>
                <span className="font-medium text-slate-800">{getStatusLabel(ujian.statusUjian)}</span>
              </div>
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  )
}
