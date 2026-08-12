import { describe, it, expect } from 'vitest';
import {
  buildHafalanSummaryBySantri,
  buildHafalanPayload,
  type Hafalan,
} from '@/lib/utils/hafalanUtils';

const hafalan = (partial: Partial<Hafalan> = {}): Hafalan => ({
  id: 1,
  santriId: 1,
  santri: { id: 1, namaLengkap: 'Ahmad', username: 'ahmad' },
  surat: 'Al-Baqarah',
  ayatMulai: 1,
  ayatSelesai: 5,
  status: 'ziyadah',
  tanggal: '2025-01-01T08:00:00.000Z',
  ...partial,
});

describe('buildHafalanSummaryBySantri', () => {
  it('mengelompokkan hafalan per santri dengan hitungan total/ziyadah/murojaah', () => {
    const list = [
      hafalan({ id: 1, status: 'ziyadah' }),
      hafalan({ id: 2, status: 'murojaah' }),
      hafalan({ id: 3, status: 'ziyadah' }),
    ];

    const summaries = buildHafalanSummaryBySantri(list);

    expect(summaries).toHaveLength(1);
    expect(summaries[0]).toMatchObject({
      totalHafalan: 3,
      ziyadahCount: 2,
      murojaahCount: 1,
    });
    expect(summaries[0].hafalanList).toHaveLength(3);
  });

  it('melewatkan hafalan yang tidak punya data santri', () => {
    const list = [
      hafalan(),
      hafalan({ id: 4, santriId: undefined, santri: { id: 0, namaLengkap: '', username: '' } }),
    ];
    const summaries = buildHafalanSummaryBySantri(list);
    expect(summaries).toHaveLength(1);
  });

  it('menggunakan tanggal terbaru sebagai lastHafalan', () => {
    const list = [
      hafalan({ id: 1, tanggal: '2025-01-01T08:00:00.000Z', surat: 'Al-Baqarah' }),
      hafalan({ id: 2, tanggal: '2025-02-01T08:00:00.000Z', surat: 'Ali Imran' }),
      hafalan({ id: 3, tanggal: '2025-01-15T08:00:00.000Z', surat: 'An-Nisa' }),
    ];

    const summaries = buildHafalanSummaryBySantri(list);
    expect(summaries[0].lastHafalan.id).toBe(2);
    expect(summaries[0].lastHafalan.surat).toBe('Ali Imran');
  });

  it('mengelompokkan beberapa santri secara terpisah', () => {
    const list = [
      hafalan({ id: 1, santriId: 1, santri: { id: 1, namaLengkap: 'Ahmad', username: 'ahmad' } }),
      hafalan({ id: 2, santriId: 2, santri: { id: 2, namaLengkap: 'Budi', username: 'budi' } }),
    ];

    const summaries = buildHafalanSummaryBySantri(list);
    expect(summaries).toHaveLength(2);
  });

  it('mengembalikan array kosong untuk list kosong', () => {
    expect(buildHafalanSummaryBySantri([])).toEqual([]);
  });
});

describe('buildHafalanPayload', () => {
  it('memetakan nilai form ke payload API (status dari field status)', () => {
    const payload = buildHafalanPayload(
      {
        santriId: 7,
        surat: 'Al-Fatihah',
        ayatMulai: 1,
        ayatSelesai: 7,
        status: 'ziyadah',
      },
      '2025-06-01'
    );

    expect(payload).toEqual({
      santriId: 7,
      surat: 'Al-Fatihah',
      ayatMulai: 1,
      ayatSelesai: 7,
      status: 'ziyadah',
      tanggal: '2025-06-01',
      keterangan: null,
    });
  });

  it('menjaga keterangan bila diisi dan status murojaah', () => {
    const payload = buildHafalanPayload(
      {
        santriId: 3,
        surat: 'Al-Ikhlas',
        ayatMulai: 1,
        ayatSelesai: 4,
        status: 'murojaah',
        keterangan: 'Perbaiki makhraj',
      },
      '2025-06-02'
    );

    expect(payload.keterangan).toBe('Perbaiki makhraj');
    expect(payload.status).toBe('murojaah');
  });
});
