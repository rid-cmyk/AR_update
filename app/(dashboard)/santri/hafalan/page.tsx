import { DashboardHeader } from '@/components/ui/dashboard-header';
import { getAuthUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getSantriHafalanDashboard } from '@/lib/data/santri-hafalan';
import { HafalanProgressChart, HafalanDetailAction, TabNavigation } from '@/components/santri/hafalan/HafalanClientComponents';
import { BookOutlined, ClockCircleOutlined, FireOutlined, AimOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

export default async function SantriHafalanServerPage({
  searchParams
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const { user } = await getAuthUser();
  if (!user || user.role.name !== 'santri') {
    redirect('/unauthorized');
  }

  const params = await searchParams;
  const currentTab = params.tab || 'dashboard';

  const data = await getSantriHafalanDashboard(user.id);
  const { recentHafalan, targets, chartData, overview } = data;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'lulus':
      case 'completed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'ziyadah':
      case 'active': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'murojaah': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="p-4 max-w-7xl mx-auto space-y-6">
      <DashboardHeader
        badge={
          <span className="inline-flex items-center gap-1.5">
            <BookOutlined className="text-xs" />
            Tahfidz
          </span>
        }
        title="Capaian Hafalan"
        subtitle="Pantau kemajuan, target, dan riwayat hafalan Anda dalam satu tempat."
      />

      {/* Tabs */}
      <TabNavigation />

      {currentTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-xl">
                <BookOutlined />
              </div>
              <div>
                <div className="text-sm text-slate-500">Total Hafalan</div>
                <div className="text-2xl font-bold text-slate-800">{overview.totalHafalan}</div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl">
                <FireOutlined />
              </div>
              <div>
                <div className="text-sm text-slate-500">Ayat Ziyadah</div>
                <div className="text-2xl font-bold text-slate-800">{overview.totalAyatZiyadah}</div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center text-xl">
                <ClockCircleOutlined />
              </div>
              <div>
                <div className="text-sm text-slate-500">Ayat Murojaah</div>
                <div className="text-2xl font-bold text-slate-800">{overview.totalAyatMurajaah}</div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xl">
                <AimOutlined />
              </div>
              <div>
                <div className="text-sm text-slate-500">Target Selesai</div>
                <div className="text-2xl font-bold text-slate-800">{overview.completedTargets} / {overview.completedTargets + overview.activeTargets}</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart Area */}
            <div className="lg:col-span-2 bg-white p-5 rounded-xl shadow-sm border border-slate-100">
              <h2 className="text-lg font-bold text-slate-800 mb-4">Grafik Kemajuan (10 Hari Terakhir)</h2>
              <HafalanProgressChart data={chartData} />
            </div>

            {/* Target List */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
              <h2 className="text-lg font-bold text-slate-800 mb-4">Target Aktif</h2>
              <div className="space-y-4">
                {targets.filter((t: any) => t.status === 'active').length === 0 ? (
                  <div className="text-center py-8 text-slate-500 text-sm border border-dashed border-slate-200 rounded-lg">
                    Tidak ada target aktif saat ini.
                  </div>
                ) : (
                  targets.filter((t: any) => t.status === 'active').map((target: any) => {
                    const progress = target.targetAyat > 0 ? Math.round((target.currentAyat / target.targetAyat) * 100) : 0;
                    return (
                      <div key={target.id} className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-slate-800 text-sm">{target.judul}</h3>
                          <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded border border-red-200">
                            {dayjs(target.deadline).format('DD MMM YYYY')}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mb-3">{target.deskripsi}</p>
                        <div className="w-full bg-slate-200 rounded-full h-1.5 mb-1">
                          <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${progress}%` }}></div>
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-500">
                          <span>{target.currentAyat} ayat</span>
                          <span>{target.targetAyat} ayat</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {currentTab === 'history' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="p-4 font-semibold text-slate-600">Tanggal</th>
                  <th className="p-4 font-semibold text-slate-600">Surat & Ayat</th>
                  <th className="p-4 font-semibold text-slate-600">Keterangan</th>
                  <th className="p-4 font-semibold text-slate-600">Status</th>
                  <th className="p-4 font-semibold text-slate-600 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentHafalan.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">Belum ada riwayat setoran.</td>
                  </tr>
                ) : (
                  recentHafalan.map((hafalan: any) => (
                    <tr key={hafalan.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 text-slate-700">{dayjs(hafalan.tanggal).format('DD MMM YYYY')}</td>
                      <td className="p-4 font-medium text-slate-800">
                        {hafalan.surat} <span className="text-slate-500 text-xs ml-1">(Ayat {hafalan.ayatMulai}-{hafalan.ayatSelesai})</span>
                      </td>
                      <td className="p-4 text-slate-600 truncate max-w-[200px]" title={hafalan.keterangan || '-'}>
                        {hafalan.keterangan || '-'}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs border ${getStatusColor(hafalan.status)}`}>
                          {hafalan.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <HafalanDetailAction hafalan={hafalan} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}