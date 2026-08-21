import { DashboardHeader } from '@/components/ui/dashboard-header';
import { getAuthUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getYayasanSantriList } from '@/lib/data/yayasan-santri';
import { UserOutlined } from '@ant-design/icons';
import YayasanSantriClientComponents from '@/components/yayasan/santri/YayasanSantriClientComponents';

export default async function YayasanSantriServerPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { user } = await getAuthUser();
  if (!user || user.role.name !== 'yayasan') {
    redirect('/unauthorized');
  }

  const params = await searchParams;
  const q = params.q || '';
  const santriList = await getYayasanSantriList(q);

  return (
    <div className="p-4 max-w-7xl mx-auto space-y-6">
      <DashboardHeader
        badge={
          <span className="inline-flex items-center gap-1.5">
            <UserOutlined className="text-xs" />
            Panel Pengawasan
          </span>
        }
        title="Direktori Santri"
        subtitle="Kelola dan pantau data santri seluruh pesantren secara terpusat."
      >
        <YayasanSantriClientComponents.SearchBar initialQuery={q} />
      </DashboardHeader>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-4 font-semibold text-slate-600">Santri</th>
                <th className="p-4 font-semibold text-slate-600">Username</th>
                <th className="p-4 font-semibold text-slate-600">Halaqah</th>
                <th className="p-4 font-semibold text-slate-600">Setoran Terdata</th>
                <th className="p-4 font-semibold text-slate-600 text-center">Inspeksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {santriList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">Data santri tidak ditemukan.</td>
                </tr>
              ) : (
                santriList.map((santri) => (
                  <tr key={santri.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                          <UserOutlined />
                        </div>
                        <span className="font-semibold text-slate-800">{santri.namaLengkap}</span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-600">@{santri.username}</td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs border border-slate-200">
                        {santri.halaqah}
                      </span>
                    </td>
                    <td className="p-4 font-medium text-emerald-600">{santri.totalHafalan} setoran</td>
                    <td className="p-4 text-center">
                      <YayasanSantriClientComponents.InspeksiButton santriId={santri.id} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}