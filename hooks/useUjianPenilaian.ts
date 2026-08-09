import { useState, useMemo } from 'react';

export type KategoriUjian = 'kenaikan_juz' | 'uas' | 'mhq' | 'tasmi';

export interface UseUjianPenilaianOptions {
  kategoriUjian: KategoriUjian;
  juzDari: number;
  juzSampai: number;
  jumlahSoalMhq?: number;
  kkmDefault?: number;
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
  kkmDefault = 80,
}: UseUjianPenilaianOptions) {
  // A. State Kenaikan Juz & UAS: map juz -> score (0-100)
  const [nilaiPerJuz, setNilaiPerJuz] = useState<Record<number, number>>(() => {
    const init: Record<number, number> = {};
    for (let i = juzDari; i <= juzSampai; i++) {
      init[i] = 85;
    }
    return init;
  });

  // B. State MHQ: map `${juz}-${soalIndex}` -> score
  const [nilaiMhq, setNilaiMhq] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    for (let j = juzDari; j <= juzSampai; j++) {
      for (let s = 1; s <= jumlahSoalMhq; s++) {
        init[`${j}-${s}`] = 90;
      }
    }
    return init;
  });

  // C. State Tasmi': map `${juz}-${type}` -> reduction value
  const [potonganTasmi, setPotonganTasmi] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    for (let j = juzDari; j <= juzSampai; j++) {
      init[`${j}-h-2`] = 0;
      init[`${j}-h-1`] = 0;
      init[`${j}-h-05`] = 0;
    }
    return init;
  });

  // Catatan Guru Evaluator
  const [catatan, setCatatan] = useState<string>('');

  // Perhitungan statistik otomatis
  const stats = useMemo(() => {
    const totalJuz = Math.max(1, juzSampai - juzDari + 1);
    let total = 0;
    let rataRata = 0;

    if (kategoriUjian === 'kenaikan_juz' || kategoriUjian === 'uas') {
      let sum = 0;
      for (let i = juzDari; i <= juzSampai; i++) {
        sum += Number(nilaiPerJuz[i] || 0);
      }
      total = sum;
      rataRata = Number((sum / totalJuz).toFixed(1));
    } else if (kategoriUjian === 'mhq') {
      let sum = 0;
      let totalSoal = 0;
      for (let j = juzDari; j <= juzSampai; j++) {
        for (let s = 1; s <= jumlahSoalMhq; s++) {
          sum += Number(nilaiMhq[`${j}-${s}`] || 0);
          totalSoal++;
        }
      }
      total = sum;
      rataRata = totalSoal > 0 ? Number((sum / totalSoal).toFixed(1)) : 0;
    } else if (kategoriUjian === 'tasmi') {
      let totalPotongan = 0;
      Object.values(potonganTasmi).forEach((val) => {
        totalPotongan += Number(val || 0);
      });
      const nilaiAkhir = Math.max(0, 100 - totalPotongan);
      total = nilaiAkhir;
      rataRata = nilaiAkhir;
    }

    const predikat = getPredikat(rataRata);

    // Evaluasi KKM Per-Juz
    const statusKkmPerJuz: Record<number, { nilai: number; lulus: boolean }> = {};
    for (let j = juzDari; j <= juzSampai; j++) {
      const val = Number(nilaiPerJuz[j] || 0);
      statusKkmPerJuz[j] = {
        nilai: val,
        lulus: val >= kkmDefault,
      };
    }

    return {
      total,
      rataRata,
      predikat,
      statusKkmPerJuz,
    };
  }, [kategoriUjian, juzDari, juzSampai, nilaiPerJuz, nilaiMhq, potonganTasmi, jumlahSoalMhq, kkmDefault]);

  return {
    nilaiPerJuz,
    setNilaiPerJuz,
    nilaiMhq,
    setNilaiMhq,
    potonganTasmi,
    setPotonganTasmi,
    catatan,
    setCatatan,
    stats,
  };
}
