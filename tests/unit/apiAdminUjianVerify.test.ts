import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PATCH } from '@/app/api/super-admin/ujian/[id]/verify/route';
import { withAuth } from '@/lib/api-helpers';
import { UjianService } from '@/lib/services/ujian.service';
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
  },
}));

vi.mock('@/lib/services/ujian.service', () => ({
  UjianService: {
    verify: vi.fn(),
  }
}));

const mockRequest = (body: any) =>
  new NextRequest('http://localhost/api/super-admin/ujian/1/verify', {
    method: 'PATCH',
    body: JSON.stringify(body)
  });

describe('PATCH /api/super-admin/ujian/[id]/verify', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if unauthorized', async () => {
    vi.mocked(withAuth).mockResolvedValueOnce({ user: null, error: 'Unauthorized' } as any);

    const req = mockRequest({ action: 'verify' });
    const res = await PATCH(req, { params: Promise.resolve({ id: '1' }) });
    expect(res.status).toBe(401);
  });

  it('should return 404 if ujian not found', async () => {
    vi.mocked(withAuth).mockResolvedValueOnce({ user: { id: '1', role: { name: 'super_admin' } }, error: null } as any);
    vi.mocked(UjianService.verify).mockRejectedValueOnce(new Error('Ujian tidak ditemukan'));

    const req = mockRequest({ action: 'verify' });
    const res = await PATCH(req, { params: Promise.resolve({ id: '1' }) });
    expect(res.status).toBe(404);
  });

  it('should verify ujian successfully', async () => {
    vi.mocked(withAuth).mockResolvedValueOnce({ user: { id: '1', role: { name: 'super_admin' } } } as any);
    vi.mocked(UjianService.verify).mockResolvedValueOnce({
      id: 1,
      statusUjian: 'diverifikasi',
      santri: { namaLengkap: 'Budi' },
    } as any);

    const req = mockRequest({ action: 'verify', keterangan: 'Lulus' });
    const res = await PATCH(req, { params: Promise.resolve({ id: '1' }) });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.statusUjian).toBe('diverifikasi');
    expect(UjianService.verify).toHaveBeenCalled();
  });

  it('should reject ujian successfully', async () => {
    vi.mocked(withAuth).mockResolvedValueOnce({ user: { id: '1', role: { name: 'super_admin' } } } as any);
    vi.mocked(UjianService.verify).mockResolvedValueOnce({
      id: 1,
      statusUjian: 'ditolak',
      santri: { namaLengkap: 'Budi' },
    } as any);

    const req = mockRequest({ action: 'reject' });
    const res = await PATCH(req, { params: Promise.resolve({ id: '1' }) });

    expect(res.status).toBe(200);
    expect(UjianService.verify).toHaveBeenCalled();
  });
});
