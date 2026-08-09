import Image from 'next/image';
import { getGuruHalaqah, getPrestasiByHalaqah } from '@/lib/data/prestasi';
import PrestasiHalaqahFilter from '@/components/guru/prestasi/PrestasiHalaqahFilter';
import PrestasiActionButtons from '@/components/guru/prestasi/PrestasiActionButtons';
import PrestasiRowActions from '@/components/guru/prestasi/PrestasiRowActions';
import trophyIcon from '@/public/icons/trophy.svg';
import { Tag } from 'antd'; // AntD components that don't need context can be imported if they don't break Server Components, but Tag might need 'use client'. We'll use Tailwind tags instead for pure server component!

import { getAuthUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

const getKategoriColor = (kategori: string | null) => {
  switch (kategori?.toLowerCase()) {
    case "akademik": return "bg-blue-100 text-blue-700 border-blue-200";
    case "tahfidz": return "bg-green-100 text-green-700 border-green-200";
    case "olahraga": return "bg-orange-100 text-orange-700 border-orange-200";
    case "seni": return "bg-purple-100 text-purple-700 border-purple-200";
    case "kepemimpinan": return "bg-red-100 text-red-700 border-red-200";
    default: return "bg-slate-100 text-slate-700 border-slate-200";
  }
};

export default async function PrestasiServerPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ halaqahId?: string }> 
}) {
  const { user } = await getAuthUser();
  if (!user || user.role.name !== 'guru') {
    redirect('/unauthorized');
  }

  const guruId = user.id;
  const halaqahList = await getGuruHalaqah(guruId);
  
  // Baca ID halaqah dari URL atau gunakan yang pertama sebagai default
  const params = await searchParams;
  const currentHalaqahId = params.halaqahId ? parseInt(params.halaqahId) : halaqahList[0]?.id;
  
  const currentHalaqahData = halaqahList.find(h => h.id === currentHalaqahId) || halaqahList[0];

  // Fetch data langsung tanpa jeda loading beruntun
  const prestasiList: any[] = currentHalaqahId ? await getPrestasiByHalaqah(currentHalaqahId) : [];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <header className="flex justify-between items-center bg-white p-5 rounded-xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-4">
          <Image src={trophyIcon} alt="Prestasi" width={40} height={40} priority />
          <div>
            <h1 className="text-xl font-bold text-slate-800">Data Prestasi</h1>
            <p className="text-sm text-slate-500">Rendered on Server (Zero-Waterfall)</p>
          </div>
        </div>
        <div className="flex gap-4 items-center">
          <PrestasiHalaqahFilter options={halaqahList} defaultValue={currentHalaqahId} />
          <PrestasiActionButtons halaqahId={currentHalaqahId} halaqahData={currentHalaqahData} />
        </div>
      </header>

      {/* Tabel dirender langsung oleh Server, tidak butuh JS klien untuk menampilkannya */}
      <main className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="p-4 font-semibold text-slate-600">Santri</th>
              <th className="p-4 font-semibold text-slate-600">Nama Prestasi</th>
              <th className="p-4 font-semibold text-slate-600">Kategori</th>
              <th className="p-4 font-semibold text-slate-600 text-center">Tahun</th>
              <th className="p-4 font-semibold text-slate-600 max-w-xs">Keterangan</th>
              <th className="p-4 font-semibold text-slate-600">Status</th>
              <th className="p-4 font-semibold text-slate-600">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {prestasiList.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-500">
                  Tidak ada data prestasi untuk halaqah ini.
                </td>
              </tr>
            ) : (
              prestasiList.map(prestasi => (
                <tr key={prestasi.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-medium text-slate-800">{prestasi.santri.namaLengkap}</td>
                  <td className="p-4 text-slate-700">{prestasi.namaPrestasi}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs border ${getKategoriColor(prestasi.kategori)}`}>
                      {prestasi.kategori || "Umum"}
                    </span>
                  </td>
                  <td className="p-4 text-center text-slate-600">{prestasi.tahun}</td>
                  <td className="p-4 text-slate-600 truncate max-w-xs" title={prestasi.keterangan || "-"}>
                    {prestasi.keterangan || "-"}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${prestasi.validated ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                      {prestasi.validated ? "Tervalidasi" : "Belum Validasi"}
                    </span>
                  </td>
                  <td className="p-4">
                    <PrestasiRowActions 
                      prestasi={prestasi} 
                      halaqahId={currentHalaqahId} 
                      halaqahData={currentHalaqahData}
                    />
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
