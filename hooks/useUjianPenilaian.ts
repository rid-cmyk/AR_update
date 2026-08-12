import { useState, useMemo } from 'react';
import { aggregatePerJuz } from '@/components/guru/ujian/utils/penilaianUtils';

export type KategoriUjian = 'kenaikan_juz' | 'uas' | 'mhq' | 'tasmi';

export interface UseUjianPenilaianOptions {
  kategoriUjian: KategoriUjian;
  juzDari: number;
  juzSampai: number;
  jumlahSoalMhq?: number;
  kkm?: number;
  initialNilaiPerHalaman?: Record<string, number>;
  initialNilaiMhq?: Record<string, number>;
  initialCatatan?: string;
}

export function getPredikat(nilai: number): string {
  if (nilai >= 90) return 'Mumtaz (A)';
  if (nilai >= 80) return 'Jayyid Jiddan (B)';
  if (nilai >= 70) return 'Jayyid (C)';
  return 'Maqbul (D)';
}

export function useUjianPenilaian({
  kategoriUjian,
  juzDari,
  juzSampai,
  jumlahSoalMhq = 3,
  kkm = 70,
  initialNilaiPerHalaman = {},
  initialNilaiMhq = {},
  initialCatatan = '',
}: UseUjianPenilaianOptions) {
  // A. State Per-Halaman (kenaikan_juz / uas / tasmi): map `halaman-${page}` -> score (0-100)
  const [nilaiPerHalaman, setNilaiPerHalaman] = useState<Record<string, number>>(initialNilaiPerHalaman);

  // B. State MHQ: map `${juz}-${soalIndex}` -> score
  const [nilaiMhq, setNilaiMhq] = useState<Record<string, number>>(initialNilaiMhq);

  // Catatan Guru Evaluator
  const [catatan, setCatatan] = useState<string>(initialCatatan);

  // Perhitungan statistik otomatis (nilai per-juz = rata-rata halaman/soal)
  const stats = useMemo(() => {
    const perJuz = aggregatePerJuz({
      kategoriUjian,
      juzDari,
      juzSampai,
      nilaiPerHalaman,
      nilaiMhq,
      jumlahSoalMhq,
    });

    const totalJuz = Math.max(1, juzSampai - juzDari + 1);
    let sum = 0;

    const statusKkmPerJuz: Record<number, { nilai: number; lulus: boolean }> = {};
    for (let j = juzDari; j <= juzSampai; j++) {
      const val = Math.round(perJuz[j] ?? 0);
      sum += val;
      statusKkmPerJuz[j] = {
        nilai: val,
        lulus: val >= kkm,
      };
    }

    const rataRata = Math.round((sum / totalJuz) * 10) / 10;
    const predikat = getPredikat(rataRata);

    return {
      total: sum,
      rataRata,
      predikat,
      statusKkmPerJuz,
    };
  }, [kategoriUjian, juzDari, juzSampai, nilaiPerHalaman, nilaiMhq, jumlahSoalMhq, kkm]);

  return {
    nilaiPerHalaman,
    setNilaiPerHalaman,
    nilaiMhq,
    setNilaiMhq,
    catatan,
    setCatatan,
    stats,
  };
}
