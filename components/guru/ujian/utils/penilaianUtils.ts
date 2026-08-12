import { getJuzPages } from '../mushafConstants';

export type LiveExamKategori = 'kenaikan_juz' | 'uas' | 'mhq' | 'tasmi';

export const isPerHalamanKategori = (kategori: string): boolean =>
  kategori === 'kenaikan_juz' || kategori === 'uas' || kategori === 'tasmi';

interface AggregatePerJuzParams {
  kategoriUjian: string;
  juzDari: number;
  juzSampai: number;
  nilaiPerHalaman: Record<string, number>;
  nilaiMhq: Record<string, number>;
  jumlahSoalMhq?: number;
}

/**
 * Agregasi nilai menjadi per-juz (rata-rata halaman utk per-halaman,
 * rata-rata soal utk MHQ). Halaman/soal yang belum diisi (tidak ada key)
 * tidak ikut dihitung. Mengembalikan map juz -> rata-rata (0 bila kosong).
 */
export function aggregatePerJuz({
  kategoriUjian,
  juzDari,
  juzSampai,
  nilaiPerHalaman,
  nilaiMhq,
  jumlahSoalMhq = 3,
}: AggregatePerJuzParams): Record<number, number> {
  const result: Record<number, number> = {};
  const perHalaman = isPerHalamanKategori(kategoriUjian);

  for (let juz = juzDari; juz <= juzSampai; juz++) {
    const values: number[] = [];

    if (perHalaman) {
      for (const page of getJuzPages(juz)) {
        const v = nilaiPerHalaman[`halaman-${page}`];
        if (typeof v === 'number' && !Number.isNaN(v)) values.push(v);
      }
    } else if (kategoriUjian === 'mhq') {
      for (let s = 1; s <= jumlahSoalMhq; s++) {
        const v = nilaiMhq[`${juz}-${s}`];
        if (typeof v === 'number' && !Number.isNaN(v)) values.push(v);
      }
    }

    result[juz] = values.length > 0
      ? Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10
      : 0;
  }

  return result;
}

/**
 * Bangun nilaiDetail flat untuk server (di-eval `calculateNilaiPerJuz`).
 * Key per-halaman: `juz-<juz>-halaman-<page>`, MHQ: `juz-<juz>-soal-<s>`.
 */
export function buildNilaiDetailLiveExam({
  kategoriUjian,
  juzDari,
  juzSampai,
  nilaiPerHalaman,
  nilaiMhq,
  jumlahSoalMhq = 3,
}: AggregatePerJuzParams): Record<string, number> {
  const detail: Record<string, number> = {};

  if (isPerHalamanKategori(kategoriUjian)) {
    for (let juz = juzDari; juz <= juzSampai; juz++) {
      for (const page of getJuzPages(juz)) {
        const v = nilaiPerHalaman[`halaman-${page}`];
        if (typeof v === 'number') detail[`juz-${juz}-halaman-${page}`] = v;
      }
    }
  } else if (kategoriUjian === 'mhq') {
    for (let juz = juzDari; juz <= juzSampai; juz++) {
      for (let s = 1; s <= jumlahSoalMhq; s++) {
        const v = nilaiMhq[`${juz}-${s}`];
        if (typeof v === 'number') detail[`juz-${juz}-soal-${s}`] = v;
      }
    }
  }

  return detail;
}

export const generatePenilaianItems = (ujianData: any) => {
  const items: any[] = [];
  
  if (ujianData.jenisUjian.nama.toLowerCase().includes('mhq')) {
    // MHQ - Per Juz dengan aspek penilaian dari admin
    const juzStart = ujianData.juzRange?.dari || 1;
    const juzEnd = ujianData.juzRange?.sampai || 1;
    
    for (let juz = juzStart; juz <= juzEnd; juz++) {
      // Untuk setiap juz, buat item dengan aspek penilaian
      ujianData.jenisUjian.komponenPenilaian.forEach((komponen: any) => {
        items.push({
          key: `juz-${juz}-${komponen.nama.toLowerCase().replace(/\s+/g, '_')}`,
          label: `Juz ${juz} - ${komponen.nama}`,
          type: 'juz-aspek',
          juz: juz,
          aspek: komponen.nama,
          bobot: komponen.bobot,
          nilaiMaksimal: komponen.nilaiMaksimal || 100,
          number: juz
        });
      });
    }
  } else {
    // Tasmi - Per Halaman (20 halaman per juz)
    const juzPageMapping: Record<number, { start: number; end: number }> = {
      1: { start: 1, end: 21 },
      2: { start: 22, end: 41 },
      3: { start: 42, end: 61 },
      4: { start: 62, end: 81 },
      5: { start: 82, end: 101 },
      6: { start: 102, end: 121 },
      7: { start: 122, end: 141 },
      8: { start: 142, end: 161 },
      9: { start: 162, end: 181 },
      10: { start: 182, end: 201 },
      11: { start: 202, end: 221 },
      12: { start: 222, end: 241 },
      13: { start: 242, end: 261 },
      14: { start: 262, end: 281 },
      15: { start: 282, end: 301 },
      16: { start: 302, end: 321 },
      17: { start: 322, end: 341 },
      18: { start: 342, end: 361 },
      19: { start: 362, end: 381 },
      20: { start: 382, end: 401 },
      21: { start: 402, end: 421 },
      22: { start: 422, end: 441 },
      23: { start: 442, end: 461 },
      24: { start: 462, end: 481 },
      25: { start: 482, end: 501 },
      26: { start: 502, end: 521 },
      27: { start: 522, end: 541 },
      28: { start: 542, end: 561 },
      29: { start: 562, end: 581 },
      30: { start: 582, end: 604 }
    };

    const juzStart = ujianData.juzRange?.dari || 1;
    const juzEnd = ujianData.juzRange?.sampai || 1;
    
    for (let juz = juzStart; juz <= juzEnd; juz++) {
      const juzInfo = juzPageMapping[juz];
      if (juzInfo) {
        // 20 halaman per juz (atau sesuai mapping)
        for (let page = juzInfo.start; page <= juzInfo.end; page++) {
          items.push({
            key: `halaman-${page}`,
            label: `Halaman ${page}`,
            type: 'halaman',
            number: page,
            juz: juz
          });
        }
      }
    }
  }
  
  return items;
};

export const calculateNilaiAkhir = (santriPenilaian: any) => {
  if (!santriPenilaian?.nilai) return 0;
  const nilaiList = Object.values(santriPenilaian.nilai).filter((n: any) => n > 0);
  if (nilaiList.length === 0) return 0;
  return Math.round(nilaiList.reduce((sum: number, nilai: any) => sum + (nilai as number), 0) / nilaiList.length);
}

export const getCompletionStatus = (santriPenilaian: any, totalItems: number) => {
  if (!santriPenilaian?.nilai) return 0;
  const completedItems = Object.keys(santriPenilaian.nilai).filter(key => 
    santriPenilaian.nilai[key] > 0
  ).length;
  return totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
}

type NilaiPertanyaanPerJuz = Record<number, Record<number, Record<string, number>>>;

// Inisialisasi state nilai pertanyaan per juz: { juz: { pertanyaan: { komponenNama: 0 } } }
export const buildPertanyaanPerJuzState = (
  juzDari: number,
  juzSampai: number,
  jumlahPertanyaan: number,
  komponenPenilaian: { nama: string }[]
): NilaiPertanyaanPerJuz => {
  const state: NilaiPertanyaanPerJuz = {};
  for (let juz = juzDari; juz <= juzSampai; juz++) {
    state[juz] = {};
    for (let p = 1; p <= jumlahPertanyaan; p++) {
      state[juz][p] = {};
      komponenPenilaian.forEach(k => {
        state[juz][p][k.nama] = 0;
      });
    }
  }
  return state;
};

// Konversi nilai pertanyaan per juz ke format nilaiDetail + nilaiAkhir rata-rata
export const buildNilaiDetailFromPertanyaan = (
  nilaiPertanyaanPerJuz: NilaiPertanyaanPerJuz
): { nilaiDetail: Record<string, number>; nilaiAkhir: number } => {
  const nilaiDetail: Record<string, number> = {};
  const allNilai: number[] = [];

  Object.entries(nilaiPertanyaanPerJuz).forEach(([juz, pertanyaanData]) => {
    Object.entries(pertanyaanData).forEach(([pertanyaan, komponenData]) => {
      Object.entries(komponenData).forEach(([komponen, nilai]) => {
        const key = `juz-${juz}-p${pertanyaan}-${komponen.toLowerCase().replace(/\s+/g, '_')}`;
        nilaiDetail[key] = nilai;
        if (nilai > 0) {
          allNilai.push(nilai);
        }
      });
    });
  });

  const nilaiAkhir = allNilai.length > 0
    ? Math.round(allNilai.reduce((sum, n) => sum + n, 0) / allNilai.length)
    : 0;

  return { nilaiDetail, nilaiAkhir };
};

// Cek kelengkapan mode pertanyaan per juz: semua komponen semua pertanyaan harus > 0
export const isPertanyaanPerJuzLengkap = (
  ujianData: any,
  jumlahPertanyaan: number,
  nilaiPertanyaanPerJuz: NilaiPertanyaanPerJuz
): boolean => {
  if (!ujianData?.juzRange) return false;
  for (let juz = ujianData.juzRange.dari; juz <= ujianData.juzRange.sampai; juz++) {
    for (let p = 1; p <= jumlahPertanyaan; p++) {
      const komponenData = nilaiPertanyaanPerJuz[juz]?.[p];
      if (!komponenData) return false;

      const allFilled = ujianData.jenisUjian.komponenPenilaian.every(
        (komponen: { nama: string }) => (komponenData[komponen.nama] || 0) > 0
      );
      if (!allFilled) return false;
    }
  }
  return true;
};
