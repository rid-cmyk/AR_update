import { DashboardHeader } from '@/components/ui/dashboard-header';
import { getAuthUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getSantriProgressData } from '@/lib/data/santri-progress';
import { JuzDetailButton } from '@/components/santri/progress-juz/ProgressJuzClientComponents';
import dayjs from 'dayjs';
import { TrophyOutlined, AimOutlined, ClockCircleOutlined, BookOutlined } from '@ant-design/icons'; // safe to use for icons

const getProgressColor = (progress: number) => {
  if (progress >= 100) return "#219ebc";
  if (progress >= 75) return "#219ebc";
  if (progress >= 50) return "#ffb703";
  if (progress >= 25) return "#ffb703";
  return "#fb8500";
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'selesai': return 'success';
    case 'proses': return 'processing';
    case 'belum': return 'default';
    default: return 'default';
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'selesai': return "bg-green-100 text-green-700 border-green-200";
    case 'proses': return "bg-orange-100 text-orange-700 border-orange-200";
    case 'belum': return "bg-blue-100 text-blue-700 border-blue-200";
    default: return "bg-slate-100 text-slate-700 border-slate-200";
  }
};

export default async function ProgressJuzServerPage() {
  const { user } = await getAuthUser();
  if (!user || user.role.name !== 'santri') {
    redirect('/unauthorized');
  }

  const { juzProgress, statistics, recentHafalan, targets } = await getSantriProgressData(user.id);

  return (
    <div className="p-4 max-w-7xl mx-auto space-y-6">
      <DashboardHeader
        badge={
          <span className="inline-flex items-center gap-1.5">
            <TrophyOutlined className="text-xs" />
            Capaian Tahfidz
          </span>
        }
        title="Progress Hafalan per Juz"
        subtitle="Pantau kemajuan hafalan dan estimasi waktu ketuntasan setiap juz Anda."
      />

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl">
            <TrophyOutlined />
          </div>
          <div>
            <div className="text-sm text-slate-500">Juz Selesai</div>
            <div className="text-2xl font-bold text-slate-800">{statistics.completedJuz}</div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-xl">
            <AimOutlined />
          </div>
          <div>
            <div className="text-sm text-slate-500">Sedang Proses</div>
            <div className="text-2xl font-bold text-slate-800">{statistics.inProgressJuz}</div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xl">
            <ClockCircleOutlined />
          </div>
          <div>
            <div className="text-sm text-slate-500">Target Aktif</div>
            <div className="text-2xl font-bold text-slate-800">{statistics.activeTargets}</div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xl">
            <BookOutlined />
          </div>
          <div>
            <div className="text-sm text-slate-500">Rata-rata Progress</div>
            <div className="text-2xl font-bold text-slate-800">{statistics.averageProgress}%</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Juz Table */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 p-5 overflow-hidden">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Detail Progress 30 Juz</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="p-3 font-semibold text-slate-600">Juz</th>
                  <th className="p-3 font-semibold text-slate-600 text-center">Ayat Hafal</th>
                  <th className="p-3 font-semibold text-slate-600 w-1/3">Progress</th>
                  <th className="p-3 font-semibold text-slate-600">Target</th>
                  <th className="p-3 font-semibold text-slate-600 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {juzProgress.map(juz => (
                  <tr key={juz.juz} className="hover:bg-slate-50">
                    <td className="p-3">
                      <div className="font-bold text-slate-800">Juz {juz.juz}</div>
                    </td>
                    <td className="p-3 text-center text-slate-600">
                      {juz.hafalAyat} / {juz.totalAyat}
                    </td>
                    <td className="p-3">
                      <div className="w-full max-w-[150px]">
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full" 
                            style={{ 
                              width: `${juz.progress}%`,
                              backgroundColor: getProgressColor(juz.progress)
                            }}
                          ></div>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-1">{juz.progress}% Selesai</div>
                      </div>
                    </td>
                    <td className="p-3">
                      {juz.hasTarget ? (
                        <div>
                          <div className="text-xs text-slate-600 font-medium">
                            {dayjs(juz.targetDeadline).format("DD MMM YYYY")}
                          </div>
                          <span className={`px-2 py-0.5 mt-1 inline-block rounded text-[10px] border ${getStatusBadge(juz.targetStatus || 'belum')}`}>
                            {juz.targetStatus?.toUpperCase()}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">-</span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <JuzDetailButton 
                        juz={juz} 
                        getProgressColor={getProgressColor} 
                        getStatusColor={getStatusColor} 
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Hafalan Terakhir</h2>
            <div className="space-y-4">
              {recentHafalan.length === 0 ? (
                <div className="text-sm text-slate-500 text-center py-4">Belum ada aktivitas hafalan</div>
              ) : (
                recentHafalan.map(hafalan => (
                  <div key={hafalan.id} className="relative pl-4 border-l-2 border-blue-500">
                    <div className="font-semibold text-slate-800">{hafalan.surat}</div>
                    <div className="text-sm text-slate-600">Ayat {hafalan.ayatMulai} - {hafalan.ayatSelesai}</div>
                    <div className="text-xs text-slate-400 mt-1">{dayjs(hafalan.tanggal).format("DD MMM YYYY HH:mm")}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Target Mendatang</h2>
            <div className="space-y-3">
              {targets.length === 0 ? (
                <div className="text-sm text-slate-500 text-center py-4">Tidak ada target aktif</div>
              ) : (
                targets.map(target => (
                  <div key={target.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div>
                      <div className="font-bold text-slate-800">Target Juz {target.juz}</div>
                      <div className="text-xs text-slate-500 flex items-center mt-1">
                        <ClockCircleOutlined className="mr-1" />
                        {dayjs(target.deadline).format("DD MMM YYYY")}
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded text-[10px] font-semibold border ${getStatusBadge(target.status)}`}>
                      {target.status.toUpperCase()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}