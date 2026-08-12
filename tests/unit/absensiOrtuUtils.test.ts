import { describe, it, expect } from 'vitest';
import dayjs from 'dayjs';
import {
  computeStatusCounts,
  computeStreakHadir,
  transformAnakAbsensi,
  computeFilteredStats,
  AbsensiData,
  ChildAttendanceStats,
} from '@/lib/utils/absensiOrtuUtils';

function makeAnak() {
  return {
    id: 1,
    namaLengkap: 'Ahmad Santri',
    username: 'ahmad',
    Absensi: [
      { id: 1, status: 'masuk', tanggal: dayjs().format('YYYY-MM-DD'), catatan: 'tepat waktu' },
      { id: 2, status: 'izin', tanggal: dayjs().subtract(1, 'day').format('YYYY-MM-DD') },
      { id: 3, status: 'alpha', tanggal: dayjs().subtract(2, 'day').format('YYYY-MM-DD') },
      { id: 4, status: 'sakit', tanggal: dayjs().subtract(3, 'day').format('YYYY-MM-DD') },
      { id: 5, status: 'hadir', tanggal: dayjs().subtract(4, 'day').format('YYYY-MM-DD') },
    ],
  };
}

describe('computeStatusCounts', () => {
  it('menghitung jumlah setiap status absensi', () => {
    const counts = computeStatusCounts([
      { status: 'masuk' },
      { status: 'hadir' },
      { status: 'izin' },
      { status: 'alpha' },
      { status: 'sakit' },
    ]);
    expect(counts).toEqual({
      totalAbsensi: 5,
      totalKehadiran: 2,
      totalIzin: 1,
      totalAlpha: 1,
      totalSakit: 1,
    });
  });
});

describe('computeStreakHadir', () => {
  it('menghitung streak kehadiran beruntun dari yang terbaru', () => {
    const streak = computeStreakHadir([
      { tanggal: '2026-08-05', status: 'alpha' },
      { tanggal: '2026-08-06', status: 'masuk' },
      { tanggal: '2026-08-07', status: 'masuk' },
    ]);
    expect(streak).toBe(2);
  });

  it('mengembalikan 0 jika catatan terbaru bukan hadir', () => {
    const streak = computeStreakHadir([
      { tanggal: '2026-08-06', status: 'masuk' },
      { tanggal: '2026-08-07', status: 'izin' },
    ]);
    expect(streak).toBe(0);
  });
});

describe('transformAnakAbsensi', () => {
  it('mentransformasi anak menjadi absensi + stats dengan hitungan benar', () => {
    const result = transformAnakAbsensi(makeAnak());

    expect(result.child).toEqual({ id: 1, namaLengkap: 'Ahmad Santri', username: 'ahmad' });
    expect(result.data.absensi).toHaveLength(5);
    expect(result.data.absensi[0]).toMatchObject({
      id: 1,
      status: 'masuk',
      catatan: 'tepat waktu',
      santri: { namaLengkap: 'Ahmad Santri', username: 'ahmad' },
    });

    const stats = result.data.stats[0];
    expect(stats.namaLengkap).toBe('Ahmad Santri');
    expect(stats.totalAbsensi).toBe(5);
    expect(stats.totalKehadiran).toBe(2);
    expect(stats.totalIzin).toBe(1);
    expect(stats.totalAlpha).toBe(1);
    expect(stats.totalSakit).toBe(1);
    expect(stats.persentaseKehadiran).toBe(40);
    expect(stats.persentaseAlpha).toBe(20);
    expect(stats.streakHadir).toBe(1);

    const inThisMonth = makeAnak().Absensi.filter((a: any) =>
      dayjs(a.tanggal).isSame(dayjs(), 'month')
    );
    expect(stats.bulanIni.hadir).toBe(
      inThisMonth.filter((a: any) => a.status === 'masuk' || a.status === 'hadir').length
    );
    expect(stats.semesterIni.hadir).toBe(2);
  });

  it('menangani anak tanpa absensi (kosong)', () => {
    const result = transformAnakAbsensi({ id: 2, namaLengkap: 'Budi', username: 'budi', Absensi: [] });
    expect(result.data.absensi).toHaveLength(0);
    expect(result.data.stats[0].totalAbsensi).toBe(0);
    expect(result.data.stats[0].persentaseKehadiran).toBe(0);
    expect(result.data.stats[0].streakHadir).toBe(0);
  });
});

describe('computeFilteredStats', () => {
  const childStats: ChildAttendanceStats[] = [
    {
      namaLengkap: 'Ahmad Santri',
      totalKehadiran: 10,
      totalIzin: 2,
      totalAlpha: 1,
      totalSakit: 1,
      totalAbsensi: 14,
      persentaseKehadiran: 71,
      persentaseAlpha: 7,
      streakHadir: 3,
      bulanIni: { hadir: 5, izin: 1, alpha: 0, sakit: 0 },
      semesterIni: { hadir: 10, izin: 2, alpha: 1, sakit: 1 },
    },
    {
      namaLengkap: 'Budi Santri',
      totalKehadiran: 8,
      totalIzin: 1,
      totalAlpha: 1,
      totalSakit: 0,
      totalAbsensi: 10,
      persentaseKehadiran: 80,
      persentaseAlpha: 10,
      streakHadir: 2,
      bulanIni: { hadir: 3, izin: 0, alpha: 1, sakit: 0 },
      semesterIni: { hadir: 8, izin: 1, alpha: 1, sakit: 0 },
    },
  ];

  const absensiData: AbsensiData[] = [
    {
      id: 1,
      status: 'masuk',
      tanggal: dayjs().format('YYYY-MM-DD'),
      santri: { namaLengkap: 'Ahmad Santri', username: 'ahmad' },
      jadwal: { halaqah: { namaHalaqah: 'Halaqah Umar' } },
    },
    {
      id: 2,
      status: 'izin',
      tanggal: dayjs().startOf('month').format('YYYY-MM-DD'),
      santri: { namaLengkap: 'Ahmad Santri', username: 'ahmad' },
      jadwal: { halaqah: { namaHalaqah: 'Halaqah Umar' } },
    },
    {
      id: 3,
      status: 'alpha',
      tanggal: dayjs().subtract(1, 'month').startOf('month').format('YYYY-MM-DD'),
      santri: { namaLengkap: 'Ahmad Santri', username: 'ahmad' },
      jadwal: { halaqah: { namaHalaqah: 'Halaqah Umar' } },
    },
    {
      id: 4,
      status: 'hadir',
      tanggal: dayjs().format('YYYY-MM-DD'),
      santri: { namaLengkap: 'Budi Santri', username: 'budi' },
      jadwal: { halaqah: { namaHalaqah: 'Halaqah Ali' } },
    },
  ];

  it('menghitung ulang stats bulan terpilih dan memfilter per anak', () => {
    const filtered = computeFilteredStats(childStats, absensiData, 'Ahmad Santri', dayjs());

    expect(filtered).toHaveLength(1);
    expect(filtered[0].namaLengkap).toBe('Ahmad Santri');
    expect(filtered[0].totalAbsensi).toBe(2);
    expect(filtered[0].totalKehadiran).toBe(1);
    expect(filtered[0].totalIzin).toBe(1);
    expect(filtered[0].persentaseKehadiran).toBe(50);
    expect(filtered[0].streakHadir).toBe(1);
  });

  it('tanpa filter anak, menghitung stats semua anak', () => {
    const filtered = computeFilteredStats(childStats, absensiData, '', dayjs());
    expect(filtered).toHaveLength(2);
    expect(filtered[0].totalAbsensi).toBe(2);
    expect(filtered[1].totalAbsensi).toBe(1);
  });
});
