import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from '@/app/api/guru/hafalan/route';
import { getAuthUser, getGuruSantriIds } from '@/lib/auth';
import { isGuruAuthorizedForSantri } from '@/lib/services/authorization-guard';
import { notifyHafalan } from '@/lib/services/whatsapp-notifier';
import { prisma } from '@/lib/database/prisma';
import { NextRequest } from 'next/server';

vi.mock('@/lib/auth', () => ({
  getAuthUser: vi.fn(),
  getGuruSantriIds: vi.fn(),
  hasRole: vi.fn(() => true),
}));

vi.mock('@/lib/services/authorization-guard', () => ({
  isGuruAuthorizedForSantri: vi.fn(),
}));

vi.mock('@/lib/services/whatsapp-notifier', () => ({
  notifyHafalan: vi.fn(() => Promise.resolve()),
}));

vi.mock('@/lib/database/prisma', () => ({
  prisma: {
    hafalan: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
  },
}));

const mockGetRequest = (url: string) => new NextRequest(url);
const mockPostRequest = (body: any) => new NextRequest('http://localhost/api/guru/hafalan', { 
  method: 'POST', 
  body: JSON.stringify(body) 
});

describe('API Guru Hafalan', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET', () => {
    it('should return 401 if unauthorized', async () => {
      vi.mocked(getAuthUser).mockResolvedValueOnce({ user: null, error: 'Unauthorized' } as any);
      const res = await GET(mockGetRequest('http://localhost/api/guru/hafalan'));
      expect(res.status).toBe(401);
    });

    it('should return empty data if guru has no santri', async () => {
      vi.mocked(getAuthUser).mockResolvedValueOnce({ user: { id: 1, role: { name: 'guru' } } } as any);
      vi.mocked(getGuruSantriIds).mockResolvedValueOnce([]); 
      
      const res = await GET(mockGetRequest('http://localhost/api/guru/hafalan'));
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toEqual([]);
    });

    it('should fetch hafalan correctly', async () => {
      vi.mocked(getAuthUser).mockResolvedValueOnce({ user: { id: 1, role: { name: 'guru' } } } as any);
      vi.mocked(getGuruSantriIds).mockResolvedValueOnce([10, 11]);
      vi.mocked(prisma.hafalan.findMany).mockResolvedValueOnce([{ id: 1, santriId: 10, surat: 'Al-Mulk' }] as any);

      const res = await GET(mockGetRequest('http://localhost/api/guru/hafalan?surat=Al-Mulk'));
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data[0].surat).toBe('Al-Mulk');
    });
  });

  describe('POST', () => {
    it('should return 403 IDOR blocked if not authorized for santri', async () => {
      vi.mocked(getAuthUser).mockResolvedValueOnce({ user: { id: 1, role: { name: 'guru' } } } as any);
      vi.mocked(isGuruAuthorizedForSantri).mockResolvedValueOnce(false); 
      
      const req = mockPostRequest({ santriId: 99, surat: 'Al-Baqarah', ayatMulai: 1, ayatSelesai: 5, status: 'ziyadah', tanggal: '2023-01-01' });
      const res = await POST(req);
      expect(res.status).toBe(403);
    });

    it('should return 400 for invalid body (bad status)', async () => {
      vi.mocked(getAuthUser).mockResolvedValueOnce({ user: { id: 1, role: { name: 'guru' } } } as any);

      const req = mockPostRequest({ santriId: 10, surat: 'Al-Mulk', ayatMulai: 1, ayatSelesai: 10, status: 'invalid', tanggal: '2023-01-01' });
      const res = await POST(req);
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toBeTruthy();
      expect(body.code).toBe('bad_request');
      expect(prisma.hafalan.create).not.toHaveBeenCalled();
    });

    it('should return 400 for ayatSelesai < ayatMulai', async () => {
      vi.mocked(getAuthUser).mockResolvedValueOnce({ user: { id: 1, role: { name: 'guru' } } } as any);

      const req = mockPostRequest({ santriId: 10, surat: 'Al-Mulk', ayatMulai: 10, ayatSelesai: 5, status: 'ziyadah', tanggal: '2023-01-01' });
      const res = await POST(req);
      expect(res.status).toBe(400);
      expect(prisma.hafalan.create).not.toHaveBeenCalled();
    });

    it('should save hafalan and trigger whatsapp notification', async () => {
      vi.mocked(getAuthUser).mockResolvedValueOnce({ 
        user: { id: 1, namaLengkap: 'Guru Fulan', role: { name: 'guru' } } 
      } as any);
      vi.mocked(isGuruAuthorizedForSantri).mockResolvedValueOnce(true);
      vi.mocked(prisma.hafalan.create).mockResolvedValueOnce({ id: 1, santriId: 10, surat: 'Al-Mulk', ayatMulai: 1, ayatSelesai: 10, status: 'ziyadah' } as any);

      const req = mockPostRequest({ santriId: 10, surat: 'Al-Mulk', ayatMulai: 1, ayatSelesai: 10, status: 'ziyadah', tanggal: '2023-01-01' });
      const res = await POST(req);
      expect(res.status).toBe(200);
      
      expect(prisma.hafalan.create).toHaveBeenCalled();
      expect(notifyHafalan).toHaveBeenCalledWith(
        10, 'ziyadah', 
        expect.objectContaining({ namaSurat: 'Al-Mulk', namaGuru: 'Guru Fulan' })
      );
    });
  });
});
