"use client";

import React from "react";

export interface RaportDataProps {
  lembaga?: {
    nama: string;
    alamat: string;
    logo?: string;
  };
  santri: {
    id: number;
    namaLengkap: string;
    nis?: string;
    username?: string;
    halaqah?: string;
    guru?: string;
  };
  akademik: {
    semester: string;
    tahunAjaran: string;
    tanggalCetak?: string;
  };
  hafalan: {
    totalAyatHafal: number;
    targetAyat: number;
    persentaseTarget: number;
    rataRataNilaiUjian: number;
    ranking?: number;
    predikatAkhir: string; // "Mumtaz (A)", "Jayyid Jiddan (B)", etc.
  };
  rincianPenilaian: Array<{
    aspek: string;
    nilai: number;
    predikat: string;
  }>;
  absensi: {
    hadir: number;
    sakit: number;
    izin: number;
    alpa: number;
  };
  catatanGuru?: string;
}

export const RaportDocument: React.FC<{ data: RaportDataProps }> = ({ data }) => {
  const defaultLembaga = {
    nama: "LEMBAGA TAHFIZH AL-QURAN AL-HUDA",
    alamat: "Jl. Pendidikan Islam No. 99, Kota Baru — Jawa Barat, Indonesia",
    ...data.lembaga,
  };

  const rincian = data.rincianPenilaian.length > 0 ? data.rincianPenilaian : [
    { aspek: "Tajwid & Makhorijul Huruf", nilai: 92, predikat: "Mumtaz (A)" },
    { aspek: "Fashahah & Irama Bacaan", nilai: 88, predikat: "Mumtaz (A-)" },
    { aspek: "Kelancaran Hafalan (Hifzh)", nilai: 86, predikat: "Jayyid Jiddan (B+)" },
    { aspek: "Adab & Kedisiplinan Halaqah", nilai: 96, predikat: "Mumtaz (A+)" },
  ];

  return (
    <div className="raport-print-container bg-white text-slate-900 p-8 max-w-[850px] mx-auto shadow-sm border border-slate-200 font-sans">
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .raport-print-container,
          .raport-print-container * {
            visibility: visible;
          }
          .raport-print-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            max-w: 100% !important;
            border: none !important;
            box-shadow: none !important;
            padding: 20px !important;
          }
          .no-print {
            display: none !important;
          }
          table {
            page-break-inside: avoid;
          }
          .signature-section {
            page-break-inside: avoid;
          }
        }
      `}</style>

      {/* KOP SURAT LEMBAGA */}
      <div className="border-b-4 border-double border-slate-800 pb-4 mb-6 text-center">
        <h1 className="text-xl font-bold tracking-wider uppercase text-slate-900">
          {defaultLembaga.nama}
        </h1>
        <p className="text-xs text-slate-600 mt-1">{defaultLembaga.alamat}</p>
        <p className="text-xs font-semibold text-emerald-800 mt-1">
          LAPORAN HASIL EVALUASI TAHFIZH AL-QURAN
        </p>
      </div>

      {/* IDENTITAS SANTRI */}
      <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm mb-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
        <div className="flex justify-between">
          <span className="font-semibold text-slate-600">Nama Santri</span>
          <span className="font-bold text-slate-900">{data.santri.namaLengkap}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold text-slate-600">Semester</span>
          <span className="font-bold text-slate-900">{data.akademik.semester}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold text-slate-600">NIS / Username</span>
          <span className="font-bold text-slate-900">
            {data.santri.nis || data.santri.username || "20250001"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold text-slate-600">Tahun Ajaran</span>
          <span className="font-bold text-slate-900">{data.akademik.tahunAjaran}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold text-slate-600">Halaqah</span>
          <span className="font-bold text-slate-900">{data.santri.halaqah || "Halaqah Utama"}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold text-slate-600">Guru Pembimbing</span>
          <span className="font-bold text-slate-900">{data.santri.guru || "Ustadz Pembimbing"}</span>
        </div>
      </div>

      {/* RANGKUMAN CAPAIAN HAFALAN */}
      <div className="mb-6">
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-800 border-l-4 border-emerald-600 pl-2 mb-3">
          A. Rangkuman Capaian Hafalan
        </h2>
        <div className="grid grid-cols-4 gap-4 bg-emerald-50/60 p-4 rounded-lg border border-emerald-200 text-center">
          <div>
            <div className="text-xs text-slate-500">Total Ayat Hafal</div>
            <div className="text-lg font-bold text-emerald-900">
              {data.hafalan.totalAyatHafal} <span className="text-xs font-normal">ayat</span>
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Target Tercapai</div>
            <div className="text-lg font-bold text-emerald-900">
              {data.hafalan.persentaseTarget}%
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Rata-Rata Ujian</div>
            <div className="text-lg font-bold text-emerald-900">
              {data.hafalan.rataRataNilaiUjian}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Predikat Akhir</div>
            <div className="text-lg font-bold text-emerald-700">
              {data.hafalan.predikatAkhir}
            </div>
          </div>
        </div>
      </div>

      {/* RINCIAN ASPEK PENILAIAN */}
      <div className="mb-6">
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-800 border-l-4 border-emerald-600 pl-2 mb-3">
          B. Rincian Aspek Penilaian
        </h2>
        <table className="w-full text-sm border-collapse border border-slate-300">
          <thead>
            <tr className="bg-slate-100 text-slate-700 font-semibold">
              <th className="border border-slate-300 px-3 py-2 text-left w-12">No</th>
              <th className="border border-slate-300 px-3 py-2 text-left">Aspek Penilaian Tahfizh</th>
              <th className="border border-slate-300 px-3 py-2 text-center w-24">Nilai (0-100)</th>
              <th className="border border-slate-300 px-3 py-2 text-center w-36">Predikat</th>
            </tr>
          </thead>
          <tbody>
            {rincian.map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-50/50">
                <td className="border border-slate-300 px-3 py-2 text-center">{idx + 1}</td>
                <td className="border border-slate-300 px-3 py-2 font-medium">{item.aspek}</td>
                <td className="border border-slate-300 px-3 py-2 text-center font-bold">{item.nilai}</td>
                <td className="border border-slate-300 px-3 py-2 text-center text-emerald-700 font-semibold">
                  {item.predikat}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ABSENSI & CATATAN GURU */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="col-span-1">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-800 border-l-4 border-emerald-600 pl-2 mb-3">
            C. Kehadiran
          </h2>
          <table className="w-full text-sm border-collapse border border-slate-300">
            <tbody>
              <tr>
                <td className="border border-slate-300 px-3 py-1.5 font-medium">Hadir</td>
                <td className="border border-slate-300 px-3 py-1.5 text-center font-bold">
                  {data.absensi.hadir} hari
                </td>
              </tr>
              <tr>
                <td className="border border-slate-300 px-3 py-1.5 font-medium">Sakit</td>
                <td className="border border-slate-300 px-3 py-1.5 text-center">
                  {data.absensi.sakit} hari
                </td>
              </tr>
              <tr>
                <td className="border border-slate-300 px-3 py-1.5 font-medium">Izin</td>
                <td className="border border-slate-300 px-3 py-1.5 text-center">
                  {data.absensi.izin} hari
                </td>
              </tr>
              <tr>
                <td className="border border-slate-300 px-3 py-1.5 font-medium">Alpa / Tanpa Keterangan</td>
                <td className="border border-slate-300 px-3 py-1.5 text-center text-red-600 font-semibold">
                  {data.absensi.alpa} hari
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="col-span-2">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-800 border-l-4 border-emerald-600 pl-2 mb-3">
            D. Catatan Pembinaan Ustadz / Guru
          </h2>
          <div className="border border-slate-300 bg-slate-50/50 p-4 rounded-lg min-h-[105px] text-sm italic text-slate-700 leading-relaxed">
            &ldquo;{data.catatanGuru || 
              "Alhamdulillah, ananda menunjukkan kesungguhan yang baik dalam menghafal Al-Quran. Pertahankan konsistensi muroja'ah di rumah."}&rdquo;
          </div>
        </div>
      </div>

      {/* TANDA TANGAN RESMI */}
      <div className="signature-section grid grid-cols-3 gap-4 text-center text-xs text-slate-800 pt-6 mt-6 border-t border-slate-200">
        <div>
          <p className="mb-14">Mengetahui,<br />Orang Tua / Wali Santri</p>
          <p className="font-bold underline">( ............................................ )</p>
        </div>
        <div>
          <p className="mb-14">
            Kota Baru, {data.akademik.tanggalCetak || "28 Juli 2026"}
            <br />
            Wali Halaqah / Guru
          </p>
          <p className="font-bold underline">{data.santri.guru || "Ustadz Pembimbing"}</p>
        </div>
        <div>
          <p className="mb-14">Mengesahkan,<br />Kepala Tahfizh Lembaga</p>
          <p className="font-bold underline">Ustadz H. Ahmad Ridwan, Lc., M.A.</p>
        </div>
      </div>
    </div>
  );
};

export default RaportDocument;
