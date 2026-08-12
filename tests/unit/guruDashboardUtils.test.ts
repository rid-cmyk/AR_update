import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  computeAbsensiPieData,
  computePerfBarData,
  getTargetMeta,
  filterActiveTargets,
  filterCompletedTargets,
} from '@/lib/utils/guruDashboardUtils';

describe('computeAbsensiPieData', () => {
  it('membuat data pie hadir/tidak hadir dengan warna', () => {
    expect(computeAbsensiPieData(7, 3)).toEqual([
      { name: 'Hadir', value: 7, color: '#219ebc' },
      { name: 'Tidak Hadir', value: 3, color: '#fb8500' },
    ]);
  });
});

describe('computePerfBarData', () => {
  const base = {
    totalSantri: 0,
    totalHafalanToday: 0,
    absensiRate: 0,
    targetTertunda: 0,
    absensiHadir: 0,
    absensiTidakHadir: 0,
    hafalanRate: 0,
  };

  it('menghitung 4 bar data', () => {
    const data = computePerfBarData({ ...base, hafalanRate: 80, absensiRate: 90 });
    expect(data).toHaveLength(4);
    expect(data[0]).toEqual({ name: 'Hafalan Rate', value: 80, fill: '#219ebc' });
    expect(data[1]).toEqual({ name: 'Absensi Rate', value: 90, fill: '#219ebc' });
  });

  it('persentase dibatasi maksimal 100', () => {
    const data = computePerfBarData({ ...base, totalSantri: 0, targetTertunda: 0 });
    expect(data[2].value).toBeLessThanOrEqual(100);
    expect(data[3].value).toBeLessThanOrEqual(100);
  });

  it('target selesai menurun saat banyak target tertunda', () => {
    const banyakTertunda = computePerfBarData({ ...base, totalSantri: 10, targetTertunda: 8 });
    const sedikitTertunda = computePerfBarData({ ...base, totalSantri: 10, targetTertunda: 2 });
    expect(banyakTertunda[2].value).toBeLessThan(sedikitTertunda[2].value);
  });
});

describe('getTargetMeta', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('menandai deadline di masa lalu sebagai overdue', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-12T00:00:00'));
    expect(getTargetMeta('2026-08-01T00:00:00').isOverdue).toBe(true);
    expect(getTargetMeta('2026-08-20T00:00:00').isOverdue).toBe(false);
  });

  it('memformat tanggal ke locale Indonesia', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-12T00:00:00'));
    const { deadlineStr } = getTargetMeta('2026-08-20T00:00:00');
    expect(deadlineStr).toMatch(/20/i);
    expect(deadlineStr).toMatch(/agu/i);
  });
});

describe('filter target', () => {
  const targets = [
    { id: 1, surat: 'Al-Fatihah', ayatTarget: 7, deadline: '2026-08-01', status: 'proses' },
    { id: 2, surat: 'Al-Ikhlas', ayatTarget: 4, deadline: '2026-08-01', status: 'selesai' },
    { id: 3, surat: 'An-Nas', ayatTarget: 6, deadline: '2026-08-01', status: 'belum' },
  ];

  it('filterActiveTargets mengembalikan target belum selesai', () => {
    expect(filterActiveTargets(targets).map((t) => t.id)).toEqual([1, 3]);
  });

  it('filterCompletedTargets mengembalikan target selesai', () => {
    expect(filterCompletedTargets(targets).map((t) => t.id)).toEqual([2]);
  });

  it('menangani array kosong', () => {
    expect(filterActiveTargets([])).toEqual([]);
    expect(filterCompletedTargets([])).toEqual([]);
  });
});
