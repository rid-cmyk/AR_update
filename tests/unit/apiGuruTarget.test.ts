import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from '@/app/api/guru/target/route';
import { withAuth } from '@/lib/api-helpers';
import { prisma } from '@/lib/database/prisma';
import { notifyTarget } from '@/lib/services/whatsapp-notifier';
import { NextRequest } from 'next/server';

vi.mock('@/lib/database/prisma', () => ({
  prisma: {
    user: { findUnique: vi.fn() },
    halaqahSantri: { findMany: vi.fn(), findFirst: vi.fn() },
    targetHafalan: { findMany: vi.fn(), count: vi.fn(), findFirst: vi.fn(), create: vi.fn() },
    notifikasi: { create: vi.fn() },
    auditLog: { create: vi.fn() }
  }
}));

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
vi.mock('@/lib/services/whatsapp-notifier', () => ({ notifyTarget: vi.fn(() => Promise.resolve()) }));

const mockGetRequest = (url: string) => new NextRequest(url);
const mockPostRequest = (body: any) => new NextRequest('http://localhost/api/guru/target', { method: 'POST', body: JSON.stringify(body) });

describe('API Guru Target', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(withAuth).mockResolvedValue({ user: { id: 1, namaLengkap: 'Guru A', role: { name: 'guru' } }, error: null } as any);
  });

  describe('GET', () => {
    it('should return 401 if no token', async () => {
      vi.mocked(withAuth).mockResolvedValueOnce({ user: null, error: 'No authentication token found' });
      const res = await GET(mockGetRequest('http://localhost/api/guru/target'));
      expect(res.status).toBe(401);
    });
  });

  describe('POST', () => {
    it('should create target and send WA notification', async () => {
      vi.mocked(prisma.halaqahSantri.findFirst).mockResolvedValue({ santriId: 10 } as any);
      vi.mocked(prisma.targetHafalan.findFirst).mockResolvedValue(null); 
      vi.mocked(prisma.targetHafalan.create).mockResolvedValue({ id: 1, santriId: 10, surat: 'Al-Mulk', santri: { namaLengkap: 'Santri 1' } } as any);

      const res = await POST(mockPostRequest({ santriId: '10', surat: 'Al-Mulk', ayatTarget: '30', deadline: '2023-12-31' }));
      expect(res.status).toBe(200);
      
      expect(prisma.targetHafalan.create).toHaveBeenCalled();
      expect(notifyTarget).toHaveBeenCalledWith(10, "created", expect.objectContaining({ namaSurat: 'Al-Mulk', namaGuru: 'Guru A' }));
    });
  });
});
