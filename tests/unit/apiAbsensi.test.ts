import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from '@/app/api/absensi/route';
import { withAuth, ApiResponse } from '@/lib/api-helpers';
import { AbsensiService } from '@/lib/services/absensi.service';

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

vi.mock('@/lib/services/absensi.service', () => ({
  AbsensiService: {
    listMultiRole: vi.fn(),
    create: vi.fn(),
  }
}));

const mockGetRequest = (url: string) => new Request(url);
const mockPostRequest = (body: any) => new Request('http://localhost/api/absensi', { method: 'POST', body: JSON.stringify(body) });

describe('GET /api/absensi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if unauthorized', async () => {
    vi.mocked(withAuth).mockResolvedValueOnce({ user: null, error: 'Unauthorized' } as any);
    const req = mockGetRequest('http://localhost/api/absensi?tanggal=2023-01-01');
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it('should require tanggal parameter', async () => {
    vi.mocked(withAuth).mockResolvedValueOnce({ user: { id: 1, role: { name: 'admin' } } } as any);
    vi.mocked(AbsensiService.listMultiRole).mockRejectedValueOnce(new Error('tanggal is required'));
    const req = mockGetRequest('http://localhost/api/absensi');
    const res = await GET(req);
    expect(res.status).toBe(500);
  });

  it('should fetch absensi for a given halaqah and tanggal', async () => {
    vi.mocked(withAuth).mockResolvedValueOnce({ user: { id: 1, role: { name: 'admin' } } } as any);
    vi.mocked(AbsensiService.listMultiRole).mockResolvedValueOnce([{ id: 1, status: 'masuk' }] as any);

    const req = mockGetRequest('http://localhost/api/absensi?tanggal=2023-01-01&halaqahId=1');
    const res = await GET(req);
    
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.length).toBe(1);
    expect(data[0].status).toBe('masuk');
  });
});

describe('POST /api/absensi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create new absensi', async () => {
    vi.mocked(withAuth).mockResolvedValueOnce({ user: { id: 1, role: { name: 'admin' } } } as any);
    vi.mocked(AbsensiService.create).mockResolvedValueOnce({ data: { id: 1, status: 'masuk' } } as any);

    const req = mockPostRequest({ santriId: 1, status: 'masuk', tanggal: '2023-01-01', halaqahId: 1 });
    const res = await POST(req);
    
    expect(res.status).toBe(200);
  });

  it('should update existing absensi', async () => {
    vi.mocked(withAuth).mockResolvedValueOnce({ user: { id: 1, role: { name: 'admin' } } } as any);
    vi.mocked(AbsensiService.create).mockResolvedValueOnce({ data: { id: 1, status: 'izin' } } as any);

    const req = mockPostRequest({ santriId: 1, status: 'izin', tanggal: '2023-01-01', halaqahId: 1 });
    const res = await POST(req);
    
    expect(res.status).toBe(200);
  });

  it('should prevent guru from updating absensi for non-member santri', async () => {
    vi.mocked(withAuth).mockResolvedValueOnce({ user: { id: 2, role: { name: 'guru' } } } as any);
    vi.mocked(AbsensiService.create).mockRejectedValueOnce(new Error('Santri tidak terdaftar di halaqah ini'));

    const req = mockPostRequest({ santriId: 1, status: 'masuk', tanggal: '2023-01-01', halaqahId: 1 });
    const res = await POST(req);
    
    expect(res.status).toBe(403);
  });
});
