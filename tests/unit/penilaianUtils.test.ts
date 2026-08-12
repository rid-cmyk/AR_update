import { describe, it, expect } from 'vitest';
import {
  buildPertanyaanPerJuzState,
  buildNilaiDetailFromPertanyaan,
  isPertanyaanPerJuzLengkap,
  calculateNilaiAkhir,
  getCompletionStatus,
  aggregatePerJuz,
  buildNilaiDetailLiveExam,
  isPerHalamanKategori,
} from '@/components/guru/ujian/utils/penilaianUtils';

const komponenPenilaian = [
  { nama: 'Tajwid', bobot: 40 },
  { nama: 'Fasahah', bobot: 30 },
  { nama: 'Kelancaran', bobot: 30 },
];

describe('buildPertanyaanPerJuzState', () => {
  it('membuat struktur kosong { juz: { pertanyaan: { komponen: 0 } } }', () => {
    const state = buildPertanyaanPerJuzState(1, 2, 3, komponenPenilaian);

    expect(Object.keys(state)).toHaveLength(2);
    expect(state[1]).toBeDefined();
    expect(state[2]).toBeDefined();

    for (let juz = 1; juz <= 2; juz++) {
      for (let p = 1; p <= 3; p++) {
        expect(state[juz][p]).toEqual({
          Tajwid: 0,
          Fasahah: 0,
          Kelancaran: 0,
        });
      }
    }
  });

  it('mengosongkan objek komponen bila tidak ada komponen', () => {
    const state = buildPertanyaanPerJuzState(1, 1, 2, []);
    expect(state[1][1]).toEqual({});
    expect(state[1][2]).toEqual({});
  });

  it('mendukung rentang juz parsial', () => {
    const state = buildPertanyaanPerJuzState(5, 5, 1, komponenPenilaian);
    expect(Object.keys(state)).toEqual(['5']);
    expect(state[5][1].Tajwid).toBe(0);
  });
});

describe('buildNilaiDetailFromPertanyaan', () => {
  it('mengubah nilai pertanyaan per juz ke nilaiDetail flat', () => {
    const input = {
      1: {
        1: { Tajwid: 80, Fasahah: 90, Kelancaran: 100 },
      },
    };
    const { nilaiDetail } = buildNilaiDetailFromPertanyaan(input);

    expect(nilaiDetail).toEqual({
      'juz-1-p1-tajwid': 80,
      'juz-1-p1-fasahah': 90,
      'juz-1-p1-kelancaran': 100,
    });
  });

  it('menghitung nilai akhir rata-rata dari nilai > 0', () => {
    const input = {
      1: {
        1: { Tajwid: 80, Fasahah: 90, Kelancaran: 100 },
        2: { Tajwid: 70, Fasahah: 0, Kelancaran: 0 },
      },
    };
    const { nilaiAkhir } = buildNilaiDetailFromPertanyaan(input);
    expect(nilaiAkhir).toBe(85); // (80+90+100+70)/4
  });

  it('mengembalikan nilaiAkhir 0 bila semua nilai 0', () => {
    const input = {
      1: {
        1: { Tajwid: 0, Fasahah: 0, Kelancaran: 0 },
      },
    };
    const { nilaiAkhir, nilaiDetail } = buildNilaiDetailFromPertanyaan(input);
    expect(nilaiAkhir).toBe(0);
    expect(nilaiDetail['juz-1-p1-tajwid']).toBe(0);
  });

  it('menangani input kosong', () => {
    const { nilaiDetail, nilaiAkhir } = buildNilaiDetailFromPertanyaan({});
    expect(nilaiDetail).toEqual({});
    expect(nilaiAkhir).toBe(0);
  });
});

describe('isPertanyaanPerJuzLengkap', () => {
  const ujianData = {
    juzRange: { dari: 1, sampai: 2 },
    jumlahPertanyaanPerJuz: 2,
    jenisUjian: {
      komponenPenilaian,
    },
  };

  it('true bila semua komponen semua pertanyaan terisi', () => {
    const nilai = buildPertanyaanPerJuzState(1, 2, 2, komponenPenilaian);
    for (const juz of [1, 2]) {
      for (const p of [1, 2]) {
        for (const k of komponenPenilaian) nilai[juz][p][k.nama] = 75;
      }
    }
    expect(isPertanyaanPerJuzLengkap(ujianData, 2, nilai)).toBe(true);
  });

  it('false bila ada komponen bernilai 0', () => {
    const nilai = buildPertanyaanPerJuzState(1, 2, 2, komponenPenilaian);
    nilai[2][1].Kelancaran = 0;
    expect(isPertanyaanPerJuzLengkap(ujianData, 2, nilai)).toBe(false);
  });

  it('false bila ada pertanyaan yang belum terisi struktur', () => {
    const nilai = buildPertanyaanPerJuzState(1, 2, 2, komponenPenilaian);
    delete nilai[1][2];
    expect(isPertanyaanPerJuzLengkap(ujianData, 2, nilai)).toBe(false);
  });

  it('false bila juzRange tidak ada', () => {
    const nilai = buildPertanyaanPerJuzState(1, 1, 1, komponenPenilaian);
    expect(isPertanyaanPerJuzLengkap({}, 1, nilai)).toBe(false);
  });
});

describe('calculateNilaiAkhir & getCompletionStatus (lindungi perilaku lama)', () => {
  it('calculateNilaiAkhir rata-rata nilai > 0', () => {
    expect(calculateNilaiAkhir({ nilai: { a: 80, b: 90, c: 100, d: 0 } })).toBe(90);
    expect(calculateNilaiAkhir({ nilai: { a: 0, b: 0 } })).toBe(0);
    expect(calculateNilaiAkhir(undefined)).toBe(0);
  });

  it('getCompletionStatus menghitung persentase item terisi', () => {
    const santri = { nilai: { a: 80, b: 90, c: 0 } };
    expect(getCompletionStatus(santri, 3)).toBe(67);
    expect(getCompletionStatus(santri, 0)).toBe(0);
    expect(getCompletionStatus(undefined, 3)).toBe(0);
  });
});

describe('isPerHalamanKategori', () => {
  it('kenaikan_juz, uas, dan tasmi dinilai per halaman', () => {
    expect(isPerHalamanKategori('kenaikan_juz')).toBe(true);
    expect(isPerHalamanKategori('uas')).toBe(true);
    expect(isPerHalamanKategori('tasmi')).toBe(true);
  });

  it('mhq dinilai per-juz/soal (bukan per halaman)', () => {
    expect(isPerHalamanKategori('mhq')).toBe(false);
  });

  it('kategori tidak dikenal default bukan per halaman', () => {
    expect(isPerHalamanKategori('tahfidz')).toBe(false);
  });
});

describe('aggregatePerJuz', () => {
  it('menghitung rata-rata halaman per juz untuk kenaikan_juz', () => {
    const result = aggregatePerJuz({
      kategoriUjian: 'kenaikan_juz',
      juzDari: 1,
      juzSampai: 2,
      nilaiPerHalaman: {
        'halaman-1': 80,
        'halaman-2': 90,
        'halaman-3': 70,
        'halaman-22': 60,
        'halaman-23': 60,
      },
      nilaiMhq: {},
    });
    expect(result[1]).toBe(80); // (80+90+70)/3
    expect(result[2]).toBe(60); // (60+60)/2
  });

  it('halaman yang belum diisi (tanpa key) tidak ikut dihitung', () => {
    const result = aggregatePerJuz({
      kategoriUjian: 'kenaikan_juz',
      juzDari: 1,
      juzSampai: 1,
      nilaiPerHalaman: { 'halaman-1': 100, 'halaman-2': 80 },
      nilaiMhq: {},
    });
    expect(result[1]).toBe(90);
  });

  it('juz tanpa nilai menghasilkan 0', () => {
    const result = aggregatePerJuz({
      kategoriUjian: 'kenaikan_juz',
      juzDari: 1,
      juzSampai: 3,
      nilaiPerHalaman: { 'halaman-1': 100 },
      nilaiMhq: {},
    });
    expect(result[1]).toBe(100);
    expect(result[2]).toBe(0);
    expect(result[3]).toBe(0);
  });

  it('mhq dihitung dari rata-rata soal per juz', () => {
    const result = aggregatePerJuz({
      kategoriUjian: 'mhq',
      juzDari: 5,
      juzSampai: 5,
      nilaiPerHalaman: {},
      nilaiMhq: { '5-1': 90, '5-2': 72, '5-3': 72 },
      jumlahSoalMhq: 3,
    });
    expect(result[5]).toBe(78);
  });
});

describe('buildNilaiDetailLiveExam', () => {
  it('membangun key per-halaman `juz-<juz>-halaman-<page>` untuk kategori per halaman', () => {
    const detail = buildNilaiDetailLiveExam({
      kategoriUjian: 'tasmi',
      juzDari: 1,
      juzSampai: 1,
      nilaiPerHalaman: { 'halaman-1': 80, 'halaman-2': 90 },
      nilaiMhq: {},
    });
    expect(detail).toEqual({
      'juz-1-halaman-1': 80,
      'juz-1-halaman-2': 90,
    });
  });

  it('membangun key per-soal `juz-<juz>-soal-<s>` untuk MHQ', () => {
    const detail = buildNilaiDetailLiveExam({
      kategoriUjian: 'mhq',
      juzDari: 3,
      juzSampai: 3,
      nilaiPerHalaman: {},
      nilaiMhq: { '3-1': 85, '3-2': 75, '3-3': 95 },
      jumlahSoalMhq: 3,
    });
    expect(detail).toEqual({
      'juz-3-soal-1': 85,
      'juz-3-soal-2': 75,
      'juz-3-soal-3': 95,
    });
  });

  it('mengembalikan objek kosong bila tidak ada nilai', () => {
    const detail = buildNilaiDetailLiveExam({
      kategoriUjian: 'kenaikan_juz',
      juzDari: 1,
      juzSampai: 2,
      nilaiPerHalaman: {},
      nilaiMhq: {},
    });
    expect(detail).toEqual({});
  });
});
