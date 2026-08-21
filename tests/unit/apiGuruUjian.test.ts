import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from '@/app/api/guru/ujian/route';
import { getAuthUser, getGuruSantriIds } from '@/lib/auth';
import { prisma } from '@/lib/database/prisma';
import { NextRequest } from 'next/server';

vi.mock('@/lib/auth', () => ({
  getAuthUser: vi.fn(),
  getGuruSantriIds: vi.fn(),
  hasRole: vi.fn(() => true),
}));

vi.mock('@/lib/database/prisma', () => ({
  prisma: {
    ujianSantri: { findMany: vi.fn(), create: vi.fn() },
    halaqahSantri: { findMany: vi.fn() },
    templateUjian: { findFirst: vi.fn(), create: vi.fn() },
    tahunAjaran: { findFirst: vi.fn() },
    systemSetting: { findUnique: vi.fn() },
    $transaction: vi.fn((operations) => Promise.all(operations)),
  }
}));

vi.mock('@/lib/utils/hafalanAssessment', () => ({
  calculateNilaiPerJuz: vi.fn(() => ({
    isAllJuzLulus: true,
    juzRemedialList: [],
    nilaiPerJuz: { 30: 80 },
    predikatAkhir: 'Mumtaz'
  }))
}));

const mockGetRequest = (url: string) => new NextRequest(url);
const mockPostRequest = (body: any) => new NextRequest('http://localhost/api/guru/ujian', { 
  method: 'POST', 
  body: JSON.stringify(body) 
});

describe('API Guru Ujian', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET', () => {
    it('should return 401 if unauthorized', async () => {
      vi.mocked(getAuthUser).mockResolvedValueOnce({ user: null } as any);
      const res = await GET(mockGetRequest('http://localhost/api/guru/ujian'));
      expect(res.status).toBe(401);
    });
  });

  describe('POST', () => {
    it('should reject invalid juz range', async () => {
      vi.mocked(getAuthUser).mockResolvedValueOnce({ user: { id: 1, role: { name: 'guru' } } } as any);
      
      const req = mockPostRequest({
        ujianResults: [{ santriId: 10, nilaiAkhir: 80, nilaiDetail: { 30: 80 } }],
        jenisUjian: { nama: 'Tasmi', tipeUjian: 'per-juz' },
        juzRange: { dari: 30, sampai: 29 } // Invalid
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
    });

    it('should reject if santri is not in guru halaqah', async () => {
      vi.mocked(getAuthUser).mockResolvedValueOnce({ user: { id: 1, role: { name: 'guru' } } } as any);
      vi.mocked(getGuruSantriIds).mockResolvedValueOnce([11]); // Guru only handles 11
      
      const req = mockPostRequest({
        ujianResults: [{ santriId: 10, nilaiAkhir: 80, nilaiDetail: { 30: 80 } }],
        jenisUjian: { nama: 'Tasmi', tipeUjian: 'per-juz' },
        juzRange: { dari: 30, sampai: 30 }
      });
      const res = await POST(req);
      expect(res.status).toBe(403);
    });

    it('should save ujian with correct per-juz calculation', async () => {
      vi.mocked(getAuthUser).mockResolvedValueOnce({ user: { id: 1, role: { name: 'guru' } } } as any);
      vi.mocked(getGuruSantriIds).mockResolvedValueOnce([10]);
      vi.mocked(prisma.tahunAjaran.findFirst).mockResolvedValueOnce({ id: 1 } as any);
      vi.mocked(prisma.templateUjian.findFirst).mockResolvedValueOnce({ id: 1 } as any);
      vi.mocked(prisma.systemSetting.findUnique).mockResolvedValueOnce({ data: { kkmDefault: 70 } } as any);
      vi.mocked(prisma.ujianSantri.create).mockResolvedValue({ id: 100 } as any);

      const req = mockPostRequest({
        ujianResults: [{ santriId: 10, nilaiAkhir: 85, nilaiDetail: { 30: 85 } }],
        jenisUjian: { nama: 'Tasmi', tipeUjian: 'per-juz' },
        juzRange: { dari: 30, sampai: 30 }
      });
      const res = await POST(req);
      expect(res.status).toBe(200);
      expect(prisma.$transaction).toHaveBeenCalled();
    });
  });
});
