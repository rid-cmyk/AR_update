import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  fetchDatabaseInfo,
  fetchBackupHistory,
  exportDatabase,
  importDatabase,
  downloadBlob,
  getCategoryStats,
} from '@/lib/services/databaseBackup';

const jsonResponse = (body: unknown) => ({
  ok: true,
  json: async () => body,
});

describe('fetchDatabaseInfo', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('mengembalikan daftar tabel dari respons', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ tables: [{ name: 'User' }] }));
    vi.stubGlobal('fetch', fetchMock);

    const result = await fetchDatabaseInfo();
    expect(result).toEqual([{ name: 'User' }]);
    expect(fetchMock).toHaveBeenCalledWith('/api/database/info');
  });

  it('melempar error saat respons tidak ok', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));
    await expect(fetchDatabaseInfo()).rejects.toThrow('Failed to fetch database info');
  });
});

describe('fetchBackupHistory', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('mengembalikan riwayat backup dari respons', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ history: [{ id: '1' }] }));
    vi.stubGlobal('fetch', fetchMock);

    const result = await fetchBackupHistory();
    expect(result).toEqual([{ id: '1' }]);
    expect(fetchMock).toHaveBeenCalledWith('/api/database/backup-history');
  });

  it('melempar error saat respons tidak ok', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));
    await expect(fetchBackupHistory()).rejects.toThrow('Failed to fetch backup history');
  });
});

describe('exportDatabase', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('POST /api/database/export dengan body { tables } dan mengembalikan blob', async () => {
    const blob = new Blob(['data']);
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, blob: async () => blob });
    vi.stubGlobal('fetch', fetchMock);

    const result = await exportDatabase(['User', 'Siswa']);
    expect(result).toBe(blob);

    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/database/export');
    expect(options.method).toBe('POST');
    expect(JSON.parse(options.body)).toEqual({ tables: ['User', 'Siswa'] });
  });

  it('melempar error saat respons tidak ok', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));
    await expect(exportDatabase(['User'])).rejects.toThrow('Export failed');
  });
});

describe('importDatabase', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('POST /api/database/import dengan FormData dan mengembalikan jumlah record', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ recordsImported: 42 }));
    vi.stubGlobal('fetch', fetchMock);

    const file = new File(['x'], 'backup.zip', { type: 'application/zip' });
    const result = await importDatabase(file);
    expect(result).toEqual({ recordsImported: 42 });

    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/database/import');
    expect(options.method).toBe('POST');
    expect(options.body).toBeInstanceOf(FormData);
  });

  it('melempar error dengan pesan dari respons saat import gagal', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Import ditolak' }),
    }));

    const file = new File(['x'], 'backup.zip');
    await expect(importDatabase(file)).rejects.toThrow('Import ditolak');
  });
});

describe('getCategoryStats', () => {
  it('menghitung jumlah tabel per kategori dengan warna', () => {
    const tables = [
      { category: 'core' },
      { category: 'core' },
      { category: 'data' },
    ] as any[];

    const stats = getCategoryStats(tables);
    expect(stats).toEqual([
      { category: 'core', count: 2, color: '#1890ff' },
      { category: 'data', count: 1, color: '#52c41a' },
    ]);
  });

  it('memakai warna fallback untuk kategori tak dikenal', () => {
    const stats = getCategoryStats([{ category: 'custom' } as any]);
    expect(stats[0]).toEqual({ category: 'custom', count: 1, color: '#666' });
  });

  it('mengembalikan array kosong bila tidak ada tabel', () => {
    expect(getCategoryStats([])).toEqual([]);
  });
});

describe('downloadBlob', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('membuat elemen <a>, mengunduh, dan melepas URL object', () => {
    const click = vi.fn();
    const revokeObjectURL = vi.fn();
    const anchor = { href: '', download: '', click };

    vi.stubGlobal('window', {
      URL: { createObjectURL: vi.fn(() => 'blob:mock'), revokeObjectURL },
    });
    vi.stubGlobal('document', {
      createElement: vi.fn(() => anchor),
      body: { appendChild: vi.fn(), removeChild: vi.fn() },
    });

    downloadBlob(new Blob(['x']), 'backup.zip');

    expect(anchor.href).toBe('blob:mock');
    expect(anchor.download).toBe('backup.zip');
    expect(click).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:mock');
  });
});
