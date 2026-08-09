"use client"; // Penanda bahwa ini dieksekusi di browser

import React, { useState } from 'react';

// Komponen ini merupakan "Micro-Interactivity" client component
// Tailwind class digunakan langsung, sehingga tidak ada beban runtime CSS-in-JS
export default function ActionButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    // Logika interaksi klien diletakkan di sini (contoh: pemanggilan server action / API)
    // Mensimulasikan network request
    await new Promise(resolve => setTimeout(resolve, 500));
    setLoading(false);
    
    // Sebagai contoh, kita bisa menambahkan alert atau memanggil revalidatePath via Server Action di sini
    console.log(`Hafalan ${id} ditandai selesai.`);
  };

  return (
    <button 
      onClick={handleClick}
      // Memanfaatkan Tailwind CSS yang diekstrak menjadi CSS statis saat build-time
      className="px-3 py-1 bg-teal-600 text-white rounded text-sm hover:bg-teal-700 disabled:opacity-50 transition-colors"
      disabled={loading}
    >
      {loading ? 'Proses...' : 'Tandai Selesai'}
    </button>
  );
}
