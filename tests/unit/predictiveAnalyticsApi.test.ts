import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '@/app/api/analytics/predictive/route';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/database/prisma';

vi.mock('@/lib/auth', () => ({
  getAuthUser: vi.fn(),
}));

vi.mock('@/lib/database/prisma', () => ({
  prisma: {
    user: {
      findFirst: vi.fn(),
    },
  },
}));

describe('Predictive Analytics API Route Handler (Zero N+1)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('1. Authentication & Authorization Guard', () => {
    it('returns 401 when request is unauthenticated (no token or getAuthUser error)', async () => {
      vi.mocked(getAuthUser).mockResolvedValue({
        user: null,
        error: 'No authentication token found',
      });

      const req = new Request('http://localhost/api/analytics/predictive?santriId=10');
      const res = await GET(req);
      const body = await res.json();

      expect(res.status).toBe(401);
      expect(body).toEqual({ success: false, error: 'Unauthorized' });
    });

    it('returns 403 when user role is not allowed', async () => {
      vi.mocked(getAuthUser).mockResolvedValue({
        user: {
          id: 99,
          username: 'unauthorized_user',
          namaLengkap: 'Unknown User',
          role: { name: 'guest' },
        },
        error: null,
      });

      const req = new Request('http://localhost/api/analytics/predictive?santriId=10');
      const res = await GET(req);
      const body = await res.json();

      expect(res.status).toBe(403);
      expect(body).toEqual({ success: false, error: 'Forbidden: Role not allowed' });
    });

    it('returns 403 when santri attempts to request analytics for a different santriId', async () => {
      vi.mocked(getAuthUser).mockResolvedValue({
        user: {
          id: 10,
          username: 'santri1',
          namaLengkap: 'Ahmad Santri',
          role: { name: 'santri' },
        },
        error: null,
      });

      const req = new Request('http://localhost/api/analytics/predictive?santriId=99');
      const res = await GET(req);
      const body = await res.json();

      expect(res.status).toBe(403);
      expect(body).toEqual({
        success: false,
        error: 'Santri hanya dapat mengakses data analitik milik sendiri',
      });
    });

    it('returns 400 when a non-santri role omits santriId parameter', async () => {
      vi.mocked(getAuthUser).mockResolvedValue({
        user: {
          id: 1,
          username: 'ustadz1',
          namaLengkap: 'Ustadz Abdullah',
          role: { name: 'guru' },
        },
        error: null,
      });

      const req = new Request('http://localhost/api/analytics/predictive');
      const res = await GET(req);
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body).toEqual({ success: false, error: 'Parameter santriId wajib diisi' });
    });

    it('returns 404 when santri is not found or user lacks permission to access student', async () => {
      vi.mocked(getAuthUser).mockResolvedValue({
        user: {
          id: 5,
          username: 'ortu1',
          namaLengkap: 'Bapak Ortu',
          role: { name: 'ortu' },
        },
        error: null,
      });

      vi.mocked(prisma.user.findFirst).mockResolvedValue(null);

      const req = new Request('http://localhost/api/analytics/predictive?santriId=10');
      const res = await GET(req);
      const body = await res.json();

      expect(res.status).toBe(404);
      expect(body).toEqual({
        success: false,
        error: 'Santri tidak ditemukan atau Anda tidak memiliki hak akses',
      });
    });
  });

  describe('2. Single Query & Zero N+1 Data Aggregation', () => {
    it('executes exactly 1 Prisma DB query and aggregates predictions for authorized Santri', async () => {
      vi.mocked(getAuthUser).mockResolvedValue({
        user: {
          id: 10,
          username: 'santri10',
          namaLengkap: 'Ahmad Fulan',
          role: { name: 'santri' },
        },
        error: null,
      });

      const mockSantriDbData = {
        id: 10,
        namaLengkap: 'Ahmad Fulan',
        username: 'santri10',
        foto: null,
        HalaqahSantri: [
          {
            halaqah: {
              id: 2,
              namaHalaqah: 'Halaqah Al-Fatihah',
              guru: {
                id: 1,
                namaLengkap: 'Ustadz Abdullah',
              },
            },
          },
        ],
        Hafalan: [
          {
            id: 101,
            tanggal: new Date('2026-08-01T08:00:00Z'),
            surat: 'Al-Baqarah',
            ayatMulai: 1,
            ayatSelesai: 10,
            status: 'ziyadah',
          },
          {
            id: 102,
            tanggal: new Date('2026-07-30T08:00:00Z'),
            surat: 'Al-Baqarah',
            ayatMulai: 11,
            ayatSelesai: 20,
            status: 'ziyadah',
          },
        ],
        TargetHafalan: [
          {
            id: 5,
            surat: 'Al-Baqarah',
            ayatTarget: 286,
            deadline: new Date('2026-12-31T00:00:00Z'),
            status: 'proses',
          },
        ],
        ujianSantri: [
          {
            id: 1,
            tanggalUjian: new Date('2026-07-15T00:00:00Z'),
            nilaiAkhir: 85,
            nilaiDetail: { '30': 85, '1': 75 },
            juzDari: 1,
            juzSampai: 1,
            jenisUjianLabel: 'UAS Juz 1 & 30',
          },
        ],
      };

      vi.mocked(prisma.user.findFirst).mockResolvedValue(mockSantriDbData as any);

      const req = new Request('http://localhost/api/analytics/predictive');
      const res = await GET(req);
      const body = await res.json();

      // Zero N+1 query assertion: findFirst called exactly once
      expect(prisma.user.findFirst).toHaveBeenCalledTimes(1);

      expect(res.status).toBe(200);
      expect(body.success).toBe(true);

      const data = body.data;
      expect(data.santri.id).toBe(10);
      expect(data.santri.namaLengkap).toBe('Ahmad Fulan');
      expect(data.santri.halaqah).toEqual([
        {
          id: 2,
          namaHalaqah: 'Halaqah Al-Fatihah',
          guruNama: 'Ustadz Abdullah',
        },
      ]);

      expect(data.activeTarget).toEqual({
        id: 5,
        surat: 'Al-Baqarah',
        ayatTarget: 286,
        deadline: '2026-12-31T00:00:00.000Z',
        status: 'proses',
      });

      // Per Juz KKM check: Juz 1 score 75 (< 80 KKM) -> remedial required
      expect(data.perJuzKKM.remedialJuzList).toEqual([1]);
      expect(data.perJuzKKM.isAllLulus).toBe(false);

      // Velocity check: 20 total ayat over 30 days
      expect(data.velocity.totalZiyadahAyat).toBe(20);
      expect(data.velocity.dailyVelocityAyat).toBeGreaterThan(0);

      // Prediction check
      expect(data.prediction.remainingAyat).toBe(266); // 286 - 20 = 266
      expect(data.prediction.riskStatus).toBeDefined();
    });

    it('enforces parent-child linkage in single query for Ortu role', async () => {
      vi.mocked(getAuthUser).mockResolvedValue({
        user: {
          id: 50,
          username: 'ortu50',
          namaLengkap: 'Bapak Ahmad',
          role: { name: 'ortu' },
        },
        error: null,
      });

      vi.mocked(prisma.user.findFirst).mockResolvedValue({
        id: 10,
        namaLengkap: 'Anak Ahmad',
        username: 'santri10',
        foto: null,
        HalaqahSantri: [],
        Hafalan: [],
        TargetHafalan: [],
        ujianSantri: [],
      } as any);

      const req = new Request('http://localhost/api/analytics/predictive?santriId=10');
      const res = await GET(req);
      const body = await res.json();

      expect(prisma.user.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            id: 10,
            role: { name: 'santri' },
            anak: {
              some: { orangTuaId: 50 },
            },
          }),
        })
      );
      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
    });

    it('enforces halaqah & permissions condition in single query for Guru role', async () => {
      vi.mocked(getAuthUser).mockResolvedValue({
        user: {
          id: 20,
          username: 'guru20',
          namaLengkap: 'Ustadz Ali',
          role: { name: 'guru' },
        },
        error: null,
      });

      vi.mocked(prisma.user.findFirst).mockResolvedValue({
        id: 10,
        namaLengkap: 'Santri Ali',
        username: 'santri10',
        foto: null,
        HalaqahSantri: [],
        Hafalan: [],
        TargetHafalan: [],
        ujianSantri: [],
      } as any);

      const req = new Request('http://localhost/api/analytics/predictive?santriId=10');
      const res = await GET(req);

      expect(prisma.user.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            id: 10,
            role: { name: 'santri' },
            OR: [
              { HalaqahSantri: { some: { halaqah: { guruId: 20 } } } },
              {
                HalaqahSantri: {
                  some: {
                    halaqah: {
                      permissions: {
                        some: { guruId: 20, canHafalan: true, isActive: true },
                      },
                    },
                  },
                },
              },
            ],
          }),
        })
      );
      expect(res.status).toBe(200);
    });
  });

  describe('3. Edge Cases & Resilience', () => {
    it('handles santri with no setoran history gracefully (zero velocity & INSUFFICIENT_DATA)', async () => {
      vi.mocked(getAuthUser).mockResolvedValue({
        user: {
          id: 10,
          username: 'santri10',
          namaLengkap: 'Santri Barru',
          role: { name: 'santri' },
        },
        error: null,
      });

      vi.mocked(prisma.user.findFirst).mockResolvedValue({
        id: 10,
        namaLengkap: 'Santri Barru',
        username: 'santri10',
        foto: null,
        HalaqahSantri: [],
        Hafalan: [],
        TargetHafalan: [
          {
            id: 1,
            surat: 'An-Naba',
            ayatTarget: 40,
            deadline: new Date('2026-09-01T00:00:00Z'),
            status: 'proses',
          },
        ],
        ujianSantri: [],
      } as any);

      const req = new Request('http://localhost/api/analytics/predictive');
      const res = await GET(req);
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.data.velocity.dailyVelocityAyat).toBe(0);
      expect(body.data.prediction.riskStatus).toBe('INSUFFICIENT_DATA');
      expect(body.data.prediction.estimatedCompletionDate).toBeNull();
    });

    it('handles internal server errors gracefully (500)', async () => {
      vi.mocked(getAuthUser).mockResolvedValue({
        user: {
          id: 10,
          username: 'santri10',
          namaLengkap: 'Santri Error',
          role: { name: 'santri' },
        },
        error: null,
      });

      vi.mocked(prisma.user.findFirst).mockRejectedValue(new Error('Database connection failed'));

      const req = new Request('http://localhost/api/analytics/predictive');
      const res = await GET(req);
      const body = await res.json();

      expect(res.status).toBe(500);
      expect(body).toEqual({
        success: false,
        error: 'Internal server error',
        details: 'Database connection failed',
      });
    });

    it('handles exams with null values in nilaiDetail without crashing (repro bug)', async () => {
      vi.mocked(getAuthUser).mockResolvedValue({
        user: {
          id: 10,
          username: 'santri10',
          namaLengkap: 'Santri NullDetail',
          role: { name: 'santri' },
        },
        error: null,
      });

      vi.mocked(prisma.user.findFirst).mockResolvedValue({
        id: 10,
        namaLengkap: 'Santri NullDetail',
        username: 'santri10',
        foto: null,
        HalaqahSantri: [],
        Hafalan: [],
        TargetHafalan: [],
        ujianSantri: [
          {
            id: 1,
            tanggalUjian: new Date('2026-07-15T00:00:00Z'),
            nilaiAkhir: 85,
            nilaiDetail: { '1': null },
            juzDari: 1,
            juzSampai: 1,
            jenisUjianLabel: 'UAS Juz 1',
          },
        ],
      } as any);

      const req = new Request('http://localhost/api/analytics/predictive');
      const res = await GET(req);
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
    });

    it('allows super_admin, admin, and yayasan roles to query any santri without halaqah or parent filter', async () => {
      for (const roleName of ['super_admin', 'admin', 'yayasan']) {
        vi.mocked(getAuthUser).mockResolvedValue({
          user: {
            id: 99,
            username: `user_${roleName}`,
            namaLengkap: `Admin ${roleName}`,
            role: { name: roleName },
          },
          error: null,
        });

        vi.mocked(prisma.user.findFirst).mockResolvedValue({
          id: 15,
          namaLengkap: 'Santri X',
          username: 'santri15',
          foto: null,
          HalaqahSantri: [],
          Hafalan: [],
          TargetHafalan: [],
          ujianSantri: [],
        } as any);

        const req = new Request('http://localhost/api/analytics/predictive?santriId=15');
        const res = await GET(req);
        const body = await res.json();

        expect(prisma.user.findFirst).toHaveBeenLastCalledWith(
          expect.objectContaining({
            where: {
              id: 15,
              role: { name: 'santri' },
            },
          })
        );
        expect(res.status).toBe(200);
        expect(body.success).toBe(true);
      }
    });

    it('parses custom query parameters (daysWindow, kkmThreshold) correctly', async () => {
      vi.mocked(getAuthUser).mockResolvedValue({
        user: {
          id: 1,
          username: 'admin1',
          namaLengkap: 'Admin One',
          role: { name: 'admin' },
        },
        error: null,
      });

      vi.mocked(prisma.user.findFirst).mockResolvedValue({
        id: 10,
        namaLengkap: 'Santri Ten',
        username: 'santri10',
        foto: null,
        HalaqahSantri: [],
        Hafalan: [],
        TargetHafalan: [],
        ujianSantri: [
          {
            id: 1,
            tanggalUjian: new Date('2026-07-15T00:00:00Z'),
            nilaiAkhir: 75,
            nilaiDetail: { '1': 75 },
            juzDari: 1,
            juzSampai: 1,
            jenisUjianLabel: 'UAS Juz 1',
          },
        ],
      } as any);

      // KKM threshold = 70. Score 75 >= 70, so isAllLulus should be true and remedialJuzList should be empty.
      const req = new Request('http://localhost/api/analytics/predictive?santriId=10&daysWindow=60&kkmThreshold=70');
      const res = await GET(req);
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.data.perJuzKKM.remedialJuzList).toEqual([]);
      expect(body.data.perJuzKKM.isAllLulus).toBe(true);
      expect(body.data.perJuzKKM.juzScores.find((j: any) => j.juz === 1)?.score).toBe(75);
    });

    it('parses complex nested object and fuzzy key formats in nilaiDetail', async () => {
      vi.mocked(getAuthUser).mockResolvedValue({
        user: {
          id: 10,
          username: 'santri10',
          namaLengkap: 'Santri Nested',
          role: { name: 'santri' },
        },
        error: null,
      });

      vi.mocked(prisma.user.findFirst).mockResolvedValue({
        id: 10,
        namaLengkap: 'Santri Nested',
        username: 'santri10',
        foto: null,
        HalaqahSantri: [],
        Hafalan: [],
        TargetHafalan: [],
        ujianSantri: [
          {
            id: 1,
            tanggalUjian: new Date('2026-07-20T00:00:00Z'),
            nilaiAkhir: 88,
            nilaiDetail: {
              '1': { score: 92 },
              '2': { nilai: 84 },
              'juz_3': 76,
              '4': '85.5',
            },
            juzDari: 1,
            juzSampai: 4,
            jenisUjianLabel: 'UAS Juz 1-4',
          },
        ],
      } as any);

      const req = new Request('http://localhost/api/analytics/predictive');
      const res = await GET(req);
      const body = await res.json();

      expect(res.status).toBe(200);
      const juzMap = new Map(body.data.perJuzKKM.juzScores.map((j: any) => [j.juz, j.score]));
      expect(juzMap.get(1)).toBe(92);
      expect(juzMap.get(2)).toBe(84);
      expect(juzMap.get(3)).toBe(76);
      expect(juzMap.get(4)).toBe(85.5);
    });
  });
});

