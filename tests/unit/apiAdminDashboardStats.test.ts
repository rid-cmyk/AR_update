import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '@/app/api/super-admin/dashboard-stats/route';
import { withAuth } from '@/lib/api-helpers';
import { prisma } from '@/lib/database/prisma';
import { withApiCache, cachedJsonResponse } from '@/lib/api-cache';

// Mock dependencies
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

vi.mock('@/lib/database/prisma', () => ({
  prisma: {
    templateUjian: { count: vi.fn() },
    templateRaport: { count: vi.fn() },
    ujianSantri: { count: vi.fn() },
    raportSantri: { count: vi.fn() },
    user: { count: vi.fn() },
    halaqah: { findMany: vi.fn() },
  }
}));

vi.mock('@/lib/api-cache', () => ({
  withApiCache: vi.fn((key, ttl, cb) => cb()),
  cachedJsonResponse: vi.fn((data, status, maxAge, swr) => {
    return new Response(JSON.stringify(data), { status });
  }),
}));

const mockRequest = () => new Request('http://localhost:3000/api/super-admin/dashboard-stats');

describe('GET /api/super-admin/dashboard-stats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if unauthorized', async () => {
    vi.mocked(withAuth).mockResolvedValueOnce({ user: null, error: 'Unauthorized' } as any);
    
    const req = mockRequest();
    const res = await GET(req);
    
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe('Unauthorized');
  });

  it('should return stats data if authorized', async () => {
    vi.mocked(withAuth).mockResolvedValueOnce({ user: { id: 1, role: { name: 'super_admin' } } } as any);
    
    vi.mocked(prisma.templateUjian.count).mockResolvedValue(10);
    vi.mocked(prisma.templateRaport.count).mockResolvedValue(5);
    vi.mocked(prisma.ujianSantri.count).mockResolvedValue(20);
    vi.mocked(prisma.raportSantri.count).mockResolvedValue(15);
    vi.mocked(prisma.user.count).mockResolvedValue(50);
    vi.mocked(prisma.halaqah.findMany).mockResolvedValue([]);

    const req = mockRequest();
    const res = await GET(req);
    
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.stats).toBeDefined();
    expect(data.stats.totalTemplate.value).toBe(15);
    expect(data.stats.ujianAktif.value).toBe(20);
  });
});
