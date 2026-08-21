import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/guru/absensi/route';
import { withAuth } from '@/lib/api-helpers';
import { prisma } from '@/lib/database/prisma';
import { NextRequest } from 'next/server';

vi.mock('@/lib/api-helpers', () => ({
  withAuth: vi.fn(),
  ApiResponse: {
    success: vi.fn((data, status = 200) => {
      return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
    }),
    error: vi.fn((message, status = 400) => {
      return new Response(JSON.stringify({ error: message }), { status, headers: { 'Content-Type': 'application/json' } });
    }),
    unauthorized: vi.fn((msg = 'Unauthorized') => {
      return new Response(JSON.stringify({ error: msg }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }),
    forbidden: vi.fn((msg = 'Forbidden') => {
      return new Response(JSON.stringify({ error: msg }), { status: 403, headers: { 'Content-Type': 'application/json' } });
    }),
    notFound: vi.fn((msg = 'Not found') => {
      return new Response(JSON.stringify({ error: msg }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }),
    serverError: vi.fn((msg = 'Internal server error') => {
      return new Response(JSON.stringify({ error: msg }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }),
  }
}));

vi.mock('@/lib/database/prisma', () => {
  const mockPrisma = {
    user: { findUnique: vi.fn() },
    jadwal: { findFirst: vi.fn() },
    absensi: {
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    auditLog: { create: vi.fn() },
    halaqahSantri: { findFirst: vi.fn().mockResolvedValue({ id: 1 }) },
    $transaction: vi.fn(async (cb) => {
      if (typeof cb === 'function') {
        return cb(mockPrisma);
      }
      return Promise.all(cb);
    }),
  };
  return { prisma: mockPrisma };
});

function mockGuruUser() {
  vi.mocked(withAuth).mockResolvedValue({
    user: { id: 7, namaLengkap: 'Guru Uji', role: { name: 'guru' } },
    error: null,
  } as any);
}

function mockJadwalValid() {
  vi.mocked(prisma.jadwal.findFirst).mockResolvedValue({
    id: 1,
    jamMulai: new Date('2026-08-01T08:00:00'),
    jamSelesai: new Date('2026-08-01T09:00:00'),
    hari: 'Sabtu',
    halaqah: { santri: [{ santriId: 100 }] },
  } as any);
}

describe('Absensi API Route (bulk + status sakit)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGuruUser();
  });

  it('returns 401 when no auth token present', async () => {
    vi.mocked(withAuth).mockResolvedValueOnce({ user: null, error: 'No authentication token found' });

    const req = new NextRequest('http://localhost/api/guru/absensi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ santriId: 100, jadwalId: 1, tanggal: '2026-08-01', status: 'masuk' }),
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('rejects an invalid status that is not in the enum', async () => {
    mockJadwalValid();

    const req = new NextRequest('http://localhost/api/guru/absensi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ santriId: 100, jadwalId: 1, tanggal: '2026-08-01', status: 'bolos' }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('Status harus masuk, izin, sakit, atau alpha');
    expect(prisma.absensi.create).not.toHaveBeenCalled();
  });

  it('accepts status "sakit" for a single entry (formerly invalid enum)', async () => {
    mockJadwalValid();
    vi.mocked(prisma.absensi.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.absensi.create).mockResolvedValue({ id: 10 } as any);

    const req = new NextRequest('http://localhost/api/guru/absensi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ santriId: 100, jadwalId: 1, tanggal: '2026-08-01', status: 'sakit' }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(prisma.absensi.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'sakit', santriId: 100, jadwalId: 1 }),
      })
    );
  });

  it('supports bulk array payload and persists every entry (mobile contract)', async () => {
    mockJadwalValid();
    vi.mocked(prisma.absensi.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.absensi.create).mockImplementation((({ data }: any) =>
      Promise.resolve({ id: data.santriId } as any)
    ) as any);

    const req = new NextRequest('http://localhost/api/guru/absensi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([
        { santriId: 100, jadwalId: 1, tanggal: '2026-08-01', status: 'masuk' },
        { santriId: 101, jadwalId: 1, tanggal: '2026-08-01', status: 'sakit' },
        { santriId: 102, jadwalId: 1, tanggal: '2026-08-01', status: 'alpha' },
      ]),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data).toHaveLength(3);
    expect(prisma.absensi.create).toHaveBeenCalledTimes(3);
  });

  it('returns 400 when bulk payload is an empty array', async () => {
    const req = new NextRequest('http://localhost/api/guru/absensi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([]),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 400 when a bulk entry is missing required fields', async () => {
    mockJadwalValid();

    const req = new NextRequest('http://localhost/api/guru/absensi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([
        { santriId: 100, jadwalId: 1, tanggal: '2026-08-01', status: 'masuk' },
        { santriId: 101, jadwalId: 1, status: 'masuk' },
      ]),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('Data tidak lengkap');
  });
});
