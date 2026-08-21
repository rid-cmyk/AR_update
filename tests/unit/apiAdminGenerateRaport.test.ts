import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/super-admin/generate-raport/route';
import { withAuth } from '@/lib/api-helpers';
import { prisma } from '@/lib/database/prisma';
import { calculatePredikat } from '@/lib/utils/hafalanAssessment';
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

vi.mock('@/lib/database/prisma', () => ({
  prisma: {
    user: { findUnique: vi.fn() },
    templateRaport: { findUnique: vi.fn() },
    tahunAjaran: { findUnique: vi.fn() },
    ujianSantri: { findMany: vi.fn(), groupBy: vi.fn() },
    systemSetting: { findUnique: vi.fn() },
    raportSantri: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
  }
}));

vi.mock('@/lib/utils/hafalanAssessment', () => ({
  calculatePredikat: vi.fn((nilai) => (nilai >= 90 ? 'Mumtaz' : 'Jayyid')),
}));

const mockRequest = (body: any) => 
  new NextRequest('http://localhost/api/super-admin/generate-raport', {
    method: 'POST',
    body: JSON.stringify(body)
  });

describe('POST /api/super-admin/generate-raport', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if unauthorized', async () => {
    vi.mocked(withAuth).mockResolvedValueOnce({ user: null, error: 'Unauthorized' } as any);
    
    const req = mockRequest({});
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('should return 400 if missing fields', async () => {
    vi.mocked(withAuth).mockResolvedValueOnce({ user: { id: '1' } } as any);
    
    const req = mockRequest({ santriId: 1 }); // missing templateRaportId and tahunAjaranId
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('should return 404 if santri, template, or tahun ajaran not found', async () => {
    vi.mocked(withAuth).mockResolvedValueOnce({ user: { id: '1' } } as any);
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null);
    
    const req = mockRequest({ santriId: 1, templateRaportId: 1, tahunAjaranId: 1 });
    const res = await POST(req);
    expect(res.status).toBe(404);
  });

  it('should generate raport successfully (create new)', async () => {
    vi.mocked(withAuth).mockResolvedValueOnce({ user: { id: '1' } } as any);
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({ id: 1 } as any);
    vi.mocked(prisma.templateRaport.findUnique).mockResolvedValueOnce({ id: 1 } as any);
    vi.mocked(prisma.tahunAjaran.findUnique).mockResolvedValueOnce({ id: 1 } as any);
    
    // Mock ujianData
    vi.mocked(prisma.ujianSantri.findMany).mockResolvedValueOnce([
      { id: 1, nilaiAkhir: 80, jenisUjianLabel: 'Ujian 1', pengaturan: {} } as any,
      { id: 2, nilaiAkhir: 90, jenisUjianLabel: 'Ujian 2', pengaturan: {} } as any
    ]);
    
    vi.mocked(prisma.ujianSantri.groupBy).mockResolvedValueOnce([
      { santriId: 1, _avg: { nilaiAkhir: 85 } } as any,
      { santriId: 2, _avg: { nilaiAkhir: 95 } } as any
    ]);

    vi.mocked(prisma.systemSetting.findUnique).mockResolvedValueOnce(null); // use default kkm 70
    vi.mocked(prisma.raportSantri.findUnique).mockResolvedValueOnce(null); // not existing, will create

    vi.mocked(prisma.raportSantri.create).mockResolvedValueOnce({ id: 10 } as any);
    vi.mocked(prisma.raportSantri.update).mockResolvedValueOnce({ id: 10 } as any);

    const req = mockRequest({ santriId: 1, templateRaportId: 1, tahunAjaranId: 1 });
    const res = await POST(req);
    
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.nilaiRataRata).toBe(85); // (80+90)/2
    expect(data.ranking).toBe(2); // santri 2 has 95, santri 1 has 85, so rank 2
    expect(data.statusKelulusan).toContain('Lulus');
    expect(data.raportId).toBe(10);
    expect(prisma.raportSantri.create).toHaveBeenCalled();
    expect(prisma.raportSantri.update).toHaveBeenCalled(); // to update grafikData
  });
});
