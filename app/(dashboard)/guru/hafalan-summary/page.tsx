import Image from 'next/image';
import { getHafalanSummary } from '@/lib/data/hafalan-summary';
import ActionButton from '@/components/guru/dashboard/ActionButton';

// Mengimpor SVG sebagai metadata path statis, BUKAN sebagai React Component inline
import trophyIcon from '@/public/icons/trophy.svg';

export default async function GuruDashboardPage() {
  // Pemanggilan data (tersimpan di server memory selama fase render berkat 'cache' dari React)
  // Pada environment asli, kita mengambil ID guru dari session yang sedang login
  // Di sini disimulasikan menggunakan "guru-123" atau biarkan data tampil dari dummy fallback jika kosong.
  const hafalanData = await getHafalanSummary('guru-123');

  return (
    // Menggunakan Tailwind yang sudah dikompilasi menjadi CSS statis murni
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      
      <header className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        {/* 
          Optimasi SVG: Memanggil SVG lewat <Image /> dari next/image.
          Ini membuat browser merender tag <img> statis, MENCEGAH injeksi ribuan node 
          <path> SVG ke dalam DOM Tree utama, sehingga memori browser tetap rendah
          serta menghindari layout thrashing saat merender halaman berukuran besar.
        */}
        <Image 
          src={trophyIcon} 
          alt="Trophy" 
          width={40} 
          height={40}
          priority // Di-prefetch karena ada di atas (above the fold)
        />
        <div>
          <h1 className="text-xl font-bold text-slate-800">Ringkasan Hafalan</h1>
          <p className="text-sm text-slate-500">Data dirender sepenuhnya di server (Zero-Bundle-Size).</p>
        </div>
      </header>

      <main className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {hafalanData.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <p>Belum ada ringkasan hafalan.</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {hafalanData.map((hafalan) => (
              <li key={hafalan.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                <div>
                  <p className="font-medium text-slate-800">{hafalan.santri?.namaLengkap || 'Santri Tidak Ditemukan'}</p>
                  <p className="text-sm text-slate-500">
                    {(hafalan as any).jumlahBaris} baris disetorkan &bull; <span className="text-teal-600 capitalize">{hafalan.status}</span>
                  </p>
                </div>
                
                {/* 
                  Client Boundary: Hanya bagian tombol ini yang dikirim JavaScript-nya ke browser.
                  Komponen parent (page.tsx) ini tetap menjadi Server Component 100%.
                */}
                <ActionButton id={hafalan.id.toString()} />
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
