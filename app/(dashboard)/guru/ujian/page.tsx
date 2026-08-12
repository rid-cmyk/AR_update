import { getAuthUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getGuruUjianList } from '@/lib/data/ujian';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, User, Trophy, BookOpen, Plus } from 'lucide-react';
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
      <div className="flex justify-between items-center bg-white p-5 rounded-xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">Riwayat Ujian</h1>
          <p className="text-muted-foreground">Kelola dan pantau hasil ujian santri (Server Rendered)</p>
        </div>
        <a href="/ujian">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Buat Ujian Baru
          </Button>
        </a>
      </div>

      <UjianFilterBar />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ujianList.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted-foreground bg-white rounded-xl border border-slate-100">
            Tidak ada data ujian yang ditemukan.
          </div>
        ) : (
          ujianList.map((ujian) => (
            <Card key={ujian.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-lg line-clamp-1">
                      {ujian.santriNama}
                    </h3>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <User className="w-4 h-4 mr-1" />
                      {ujian.halaqah || 'Tanpa Halaqah'}
                    </div>
                  </div>
                  <Badge variant={STATUS_COLORS[ujian.statusUjian as keyof typeof STATUS_COLORS] as any}>
                    {STATUS_LABELS[ujian.statusUjian as keyof typeof STATUS_LABELS] || ujian.statusUjian}
                  </Badge>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm">
                    <BookOpen className="w-4 h-4 mr-2 text-muted-foreground" />
                    <span>{ujian.jenisUjian || 'Ujian Tahfidz'}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                    <span>{formatDate(ujian.tanggalUjian)}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Trophy className="w-4 h-4 mr-2 text-muted-foreground" />
                    <span>
                      Nilai Akhir: <strong className={getNilaiColor(ujian.nilaiAkhir || 0)}>{ujian.nilaiAkhir}</strong>
                    </span>
                  </div>
                </div>

                <div className="flex justify-end border-t pt-4">
                  <UjianCardActions ujian={ujian} />
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}