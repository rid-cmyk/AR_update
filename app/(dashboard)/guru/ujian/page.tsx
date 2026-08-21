import { DashboardHeader } from '@/components/ui/dashboard-header';
import { getAuthUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getGuruUjianList } from '@/lib/data/ujian';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, User, Trophy, BookOpen, Plus, Layers, ArrowUpCircle, GraduationCap, Award, Mic, type LucideIcon } from 'lucide-react';
import { UjianFilterBar, UjianCardActions } from '@/components/guru/ujian/UjianClientComponents';

const STATUS_COLORS = {
  submitted: 'default',
  diverifikasi: 'default',
  selesai: 'secondary',
  draft: 'outline',
  ditolak: 'destructive'
};

const STATUS_LABELS = {
  submitted: 'Menunggu Verifikasi',
  diverifikasi: 'Menunggu Verifikasi',
  selesai: 'Selesai',
  draft: 'Draft',
  ditolak: 'Ditolak'
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getNilaiColor = (nilai: number) => {
  if (nilai >= 85) return 'text-green-600';
  if (nilai >= 70) return 'text-blue-600';
  if (nilai >= 60) return 'text-yellow-600';
  return 'text-red-600';
};

const JENIS_META: Record<string, { icon: LucideIcon; chip: string }> = {
  kenaikan_juz: { icon: ArrowUpCircle, chip: 'bg-blue-50 text-blue-700' },
  uas: { icon: GraduationCap, chip: 'bg-violet-50 text-violet-700' },
  mhq: { icon: Award, chip: 'bg-amber-50 text-amber-700' },
  tasmi: { icon: Mic, chip: 'bg-emerald-50 text-emerald-700' },
  tahfidz: { icon: BookOpen, chip: 'bg-sky-50 text-sky-700' },
};

const getJenisMeta = (key?: string) =>
  JENIS_META[key as string] ?? { icon: BookOpen, chip: 'bg-slate-100 text-slate-700' };

const getInitial = (name?: string) => {
  const trimmed = (name || '').trim();
  return trimmed ? trimmed[0].toUpperCase() : '?';
};

export default async function UjianServerPage({
  searchParams
}: {
  searchParams: Promise<{ search?: string, jenis?: string, status?: string }>
}) {
  const { user } = await getAuthUser();
  if (!user || user.role.name !== 'guru') {
    redirect('/unauthorized');
  }

  const params = await searchParams;
  const guruId = user.id;

  const ujianList = await getGuruUjianList(guruId, params.search, params.jenis, params.status);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <DashboardHeader
        badge={
          <span className="inline-flex items-center gap-1.5">
            <Trophy className="h-3.5 w-3.5" />
            KKM Per-Juz
          </span>
        }
        title="Riwayat Ujian"
        subtitle="Kelola dan pantau hasil ujian tahfidz santri halaqah Anda."
      >
        <a href="/ujian">
          <Button className="bg-white text-deep-space shadow-lg hover:bg-sky-blue rounded-xl h-11 px-6">
            <Plus className="w-4 h-4 mr-2" />
            Buat Ujian Baru
          </Button>
        </a>
      </DashboardHeader>

      <UjianFilterBar />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ujianList.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted-foreground bg-white rounded-xl border border-slate-100">
            Tidak ada data ujian yang ditemukan.
          </div>
        ) : (
          ujianList.map((ujian) => {
            const jenisMeta = getJenisMeta(ujian.templateUjian?.jenisUjian);
            const IconJenis = jenisMeta.icon;
            const nilai = ujian.nilaiAkhir;
            const juzRange = ujian.juzRange && ujian.juzRange !== '-' ? `Juz ${ujian.juzRange}` : null;
            return (
              <Card key={ujian.id} className="group rounded-2xl border-slate-100 hover:shadow-lg hover:-translate-y-0.5 transition-all overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 shrink-0 rounded-full bg-gradient-to-br from-sky-blue to-blue-green text-white flex items-center justify-center text-lg font-bold">
                        {getInitial(ujian.santriNama)}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-slate-800 truncate">{ujian.santriNama}</h3>
                        <div className="flex items-center text-xs text-muted-foreground gap-1 mt-0.5">
                          <User className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{ujian.halaqah || 'Tanpa Halaqah'}</span>
                        </div>
                      </div>
                    </div>
                    <Badge variant={STATUS_COLORS[ujian.statusUjian as keyof typeof STATUS_COLORS] as any} className="shrink-0">
                      {STATUS_LABELS[ujian.statusUjian as keyof typeof STATUS_LABELS] || ujian.statusUjian}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mb-5">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${jenisMeta.chip}`}>
                      <IconJenis className="w-3.5 h-3.5" />
                      {ujian.jenisUjian || 'Ujian Tahfidz'}
                    </span>
                    {juzRange && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                        <Layers className="w-3.5 h-3.5" />
                        {juzRange}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(ujian.tanggalUjian)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                    <div>
                      <div className="text-xs text-muted-foreground font-medium">Nilai Akhir</div>
                      <div className={`text-2xl font-extrabold tabular-nums ${nilai == null ? 'text-slate-400' : getNilaiColor(nilai)}`}>
                        {nilai ?? '—'}
                      </div>
                    </div>
                    <UjianCardActions ujian={ujian} />
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}