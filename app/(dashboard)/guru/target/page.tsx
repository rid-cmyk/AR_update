import { getAuthUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getGuruTarget, getSantriOptionsForGuru } from '@/lib/data/target';
import { TargetActionButtons, TargetRowActions, TargetSummaryWrapper } from '@/components/guru/target/TargetClientComponents';
import dayjs from 'dayjs';
import 'dayjs/locale/id';

dayjs.locale('id');

const getStatusColor = (status: string) => {
  switch (status) {
    case "selesai": return "bg-green-100 text-green-700 border-green-200";
    case "proses": return "bg-orange-100 text-orange-700 border-orange-200";
    case "belum": return "bg-blue-100 text-blue-700 border-blue-200";
    default: return "bg-slate-100 text-slate-700 border-slate-200";
  }
};

export default async function TargetHafalanServerPage({
  searchParams
}: {
  searchParams: Promise<{ santriName?: string, status?: string }>
}) {
  const { user } = await getAuthUser();
  if (!user || user.role.name !== 'guru') {
    redirect('/unauthorized');
  }

  const params = await searchParams;
  const guruId = user.id;

  // Fetch data from DB
  const [targetList, santriOptions] = await Promise.all([
    getGuruTarget(guruId, params),
    getSantriOptionsForGuru(guruId)
  ]);

  // Group targets for summary calculation (running on server)
  const getTargetSummaryBySantri = () => {
    const summary: Record<number, any> = {};

    targetList.forEach(target => {
      if (!target.santri || !target.santri.id) return;
      const santriId = target.santri.id;
      if (!summary[santriId]) {
        summary[santriId] = {
          santri: target.santri,
          totalTarget: 0,
          belumCount: 0,
          prosesCount: 0,
          selesaiCount: 0,
          lastTarget: target,
          targetList: [],
          avgProgress: 0
        };
      }
      
      summary[santriId].totalTarget++;
      summary[santriId].targetList.push(target);
      
      if (target.status === 'belum') summary[santriId].belumCount++;
      else if (target.status === 'proses') summary[santriId].prosesCount++;
      else summary[santriId].selesaiCount++;
      
      if (new Date(target.deadline) > new Date(summary[santriId].lastTarget.deadline)) {
        summary[santriId].lastTarget = target;
      }
    });

    Object.values(summary).forEach(s => {
      const totalProgress = s.targetList.reduce((sum: number, t: any) => sum + (t.progress || 0), 0);
      s.avgProgress = s.targetList.length > 0 ? Math.round(totalProgress / s.targetList.length) : 0;
    });

    return Object.values(summary);
  };

  const summaries = getTargetSummaryBySantri();

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <header className="flex justify-between items-center bg-white p-5 rounded-xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Target Hafalan</h1>
          <p className="text-sm text-slate-500">Rendered on Server (Zero-Waterfall)</p>
        </div>
        <div className="flex gap-4 items-center">
          <TargetActionButtons santriOptions={santriOptions} />
        </div>
      </header>

      {/* Summary Cards rendered via wrapper if needed or pure server */}
      <TargetSummaryWrapper targets={targetList.length} summaries={summaries} />

      <main className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-x-auto mt-6">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-[#10b981] text-white">
            <tr>
              <th className="p-4 font-semibold">Nama Santri</th>
              <th className="p-4 font-semibold">Target Surat</th>
              <th className="p-4 font-semibold">Deadline & Status</th>
              <th className="p-4 font-semibold text-center">Progress</th>
              <th className="p-4 font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {targetList.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500">
                  Tidak ada target hafalan.
                </td>
              </tr>
            ) : (
              targetList.map(target => (
                <tr key={target.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold">
                        {target.santri?.namaLengkap?.[0] || '?'}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">{target.santri?.namaLengkap || 'Unknown'}</div>
                        <div className="text-sm text-gray-500">@{target.santri?.username || 'No username'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-gray-800">{target.surat}</div>
                    <div className="text-sm text-gray-500">{target.ayatTarget} ayat target</div>
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-gray-800 mb-1">
                      {dayjs(target.deadline).format("DD MMM YYYY")}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(target.status)}`}>
                      {target.status === 'belum' ? '⏳ Belum' : target.status === 'proses' ? '🔄 Proses' : '✅ Selesai'}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <div className="w-24 mx-auto">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="h-2.5 rounded-full" 
                          style={{ 
                            width: `${target.progress}%`,
                            backgroundColor: target.progress >= 80 ? '#219ebc' : target.progress >= 50 ? '#ffb703' : '#fb8500' 
                          }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{target.progress}%</div>
                    </div>
                  </td>
                  <td className="p-4">
                    <TargetRowActions target={target} santriOptions={santriOptions} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </main>
    </div>
  );
}