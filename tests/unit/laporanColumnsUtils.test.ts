import { describe, it, expect } from 'vitest';
import React from 'react';
import {
  sortByString,
  sortByNumber,
  progressStatus,
  renderBold,
  renderNilai,
  renderDate,
  renderStatusTag,
  renderStatusBadge,
} from '@/lib/utils/laporanColumnsUtils';
import { getColumns } from '@/app/(dashboard)/super-admin/laporan/components/LaporanColumns';

describe('sortByString', () => {
  it('mengurutkan naik berdasarkan key', () => {
    const sorter = sortByString('nama');
    expect(sorter({ nama: 'b' }, { nama: 'a' })).toBeGreaterThan(0);
    expect(sorter({ nama: 'a' }, { nama: 'b' })).toBeLessThan(0);
    expect(sorter({ nama: 'a' }, { nama: 'a' })).toBe(0);
  });

  it('menangani nilai hilang/null', () => {
    const sorter = sortByString('nama');
    expect(sorter({}, { nama: 'a' })).toBeLessThan(0);
    expect(sorter({ nama: 'a' }, {})).toBeGreaterThan(0);
  });
});

describe('sortByNumber', () => {
  it('mengurutkan angka naik', () => {
    const sorter = sortByNumber('total');
    expect(sorter({ total: 3 }, { total: 10 })).toBeLessThan(0);
    expect(sorter({ total: 10 }, { total: 3 })).toBeGreaterThan(0);
  });

  it('menangani nilai hilang sebagai 0', () => {
    const sorter = sortByNumber('total');
    expect(sorter({}, { total: 5 })).toBeLessThan(0);
  });
});

describe('progressStatus', () => {
  it('mengembalikan success/normal/exception sesuai threshold', () => {
    expect(progressStatus(90, 80, 60)).toBe('success');
    expect(progressStatus(80, 80, 60)).toBe('success');
    expect(progressStatus(70, 80, 60)).toBe('normal');
    expect(progressStatus(59, 80, 60)).toBe('exception');
  });
});

describe('render helpers', () => {
  it('renderBold menghasilkan elemen strong', () => {
    const el = renderBold('teks') as React.ReactElement;
    expect(el.type).toBe('strong');
  });

  it('renderNilai memberi warna sesuai ambang nilai', () => {
    const tinggi = renderNilai(85) as React.ReactElement;
    const sedang = renderNilai(70) as React.ReactElement;
    const rendah = renderNilai(50) as React.ReactElement;
    expect((tinggi.props as any).color).toBe('green');
    expect((sedang.props as any).color).toBe('orange');
    expect((rendah.props as any).color).toBe('red');
  });

  it('renderNilai dengan 1 desimal memformat nilai', () => {
    const el = renderNilai(85, 1) as React.ReactElement;
    expect((el.props as any).children).toBe('85.0');
  });

  it('renderDate memformat ke DD/MM/YYYY', () => {
    expect(renderDate('2026-08-11T00:00:00')).toBe('11/08/2026');
  });

  it('renderStatusTag memakai warna fallback default', () => {
    const dikenal = renderStatusTag('verified', { verified: 'success' }) as React.ReactElement;
    const tidakDikenal = renderStatusTag('unknown', { verified: 'success' }) as React.ReactElement;
    expect((dikenal.props as any).color).toBe('success');
    expect((tidakDikenal.props as any).color).toBe('default');
  });

  it('renderStatusBadge memakai status fallback default', () => {
    const el = renderStatusBadge('NilaiX', { Hijau: 'success' }) as React.ReactElement;
    expect((el.props as any).status).toBe('default');
  });
});

describe('getColumns', () => {
  const cases: Record<string, string[]> = {
    halaqah: ['Halaqah', 'Guru Pembimbing', 'Santri', 'Total Hafalan', 'Total Ujian', 'Attendance Rate', 'Hafalan Rate'],
    santri: ['Nama Santri', 'Halaqah', 'Total Hafalan', 'Total Ujian', 'Target Aktif', 'Attendance Rate', 'Last Activity'],
    guru: ['Nama Guru', 'Halaqah', 'Total Santri', 'Permission', 'Avg Attendance'],
    ujian: ['Santri', 'Halaqah', 'Jenis Ujian', 'Template', 'Nilai Akhir', 'Status', 'Tanggal', 'Verifier'],
    target: ['Santri', 'Halaqah', 'Surat', 'Target Ayat', 'Deadline', 'Status', 'Progress'],
    tahfidz: ['Nama Santri', 'Halaqah', 'Guru', 'Total Hafalan', 'Total Ayat', 'Kehadiran', 'Target', 'Prestasi', 'Nilai Akhir', 'Status'],
  };

  it('menghasilkan kolom sesuai tipe laporan', () => {
    for (const [type, expectedTitles] of Object.entries(cases)) {
      const columns = getColumns(type);
      expect(columns.map((c: any) => c.title)).toEqual(expectedTitles);
    }
  });

  it('mengembalikan array kosong untuk tipe tak dikenal', () => {
    expect(getColumns('tak-dikenal')).toEqual([]);
  });

  it('kolom angka punya sorter yang bekerja', () => {
    const columns = getColumns('guru') as any[];
    const col = columns.find((c: any) => c.title === 'Total Santri');
    expect(col.sorter({ totalSantri: 1 }, { totalSantri: 5 })).toBeLessThan(0);
  });
});
