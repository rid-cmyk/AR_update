import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  calculatePerJuzKKMStatus,
  calculateHafalanVelocity,
  predictCompletionAndRisk,
} from '@/lib/services/predictiveAnalytics';
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

describe('Predictive Analytics E2E & Integration Test Suite (Tiers 1-5)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // =========================================================================
  // TIER 1: PER-JUZ KKM STATUS & REMEDIAL FLAGGING (< 80) ACROSS ALL 30 JUZ
  // =========================================================================
  describe('Tier 1: Per-Juz KKM Status & Remedial Flagging Across All 30 Juz', () => {
    it('evaluates all 30 juz correctly when 1-15 are LULUS (>=80) and 16-30 are REMEDIAL (<80)', () => {
      const scores30: Record<number, number> = {};
      for (let juz = 1; juz <= 30; juz++) {
        scores30[juz] = juz <= 15 ? 80 + (juz % 15) : 79.5 - (juz - 16);
      }

      const result = calculatePerJuzKKMStatus(scores30, 80);

      expect(result.juzScores).toHaveLength(30);
      expect(result.isAllLulus).toBe(false);

      // Verify remedial list contains exactly juz 16 through 30
      const expectedRemedial = Array.from({ length: 15 }, (_, i) => i + 16);
      expect(result.remedialJuzList).toEqual(expectedRemedial);

      // Verify juz 1-15 are LULUS
      for (let j = 1; j <= 15; j++) {
        const juzItem = result.juzScores.find((item) => item.juz === j);
        expect(juzItem).toBeDefined();
        expect(juzItem?.isRemedial).toBe(false);
        expect(juzItem?.status).toBe('LULUS');
        expect(juzItem?.score).toBeGreaterThanOrEqual(80);
      }

      // Verify juz 16-30 are REMEDIAL_REQUIRED
      for (let j = 16; j <= 30; j++) {
        const juzItem = result.juzScores.find((item) => item.juz === j);
        expect(juzItem).toBeDefined();
        expect(juzItem?.isRemedial).toBe(true);
        expect(juzItem?.status).toBe('REMEDIAL_REQUIRED');
        expect(juzItem?.score).toBeLessThan(80);
      }
    });

    it('evaluates 30 juz where all scores equal exact KKM threshold (80.0) as 100% LULUS', () => {
      const scores30: Record<number, number> = {};
      for (let juz = 1; juz <= 30; juz++) {
        scores30[juz] = 80.0;
      }

      const result = calculatePerJuzKKMStatus(scores30, 80);

      expect(result.juzScores).toHaveLength(30);
      expect(result.isAllLulus).toBe(true);
      expect(result.remedialJuzList).toEqual([]);
      expect(result.averageScore).toBe(80.0);
      expect(result.juzScores.every((j) => j.status === 'LULUS')).toBe(true);
    });

    it('evaluates 30 juz where all scores are 79.9 as 100% REMEDIAL_REQUIRED', () => {
      const scores30: Record<number, number> = {};
      for (let juz = 1; juz <= 30; juz++) {
        scores30[juz] = 79.9;
      }

      const result = calculatePerJuzKKMStatus(scores30, 80);

      expect(result.juzScores).toHaveLength(30);
      expect(result.isAllLulus).toBe(false);
      expect(result.remedialJuzList).toHaveLength(30);
      expect(result.remedialJuzList).toEqual(Array.from({ length: 30 }, (_, i) => i + 1));
      expect(result.averageScore).toBe(79.9);
    });

    it('calculates exact overall average score across all 30 juz with floating point values', () => {
      const scores30: Record<number, number> = {};
      let total = 0;
      for (let juz = 1; juz <= 30; juz++) {
        const s = 70 + (juz * 0.5); // 70.5, 71.0, ..., 85.0
        scores30[juz] = s;
        total += s;
      }

      const result = calculatePerJuzKKMStatus(scores30, 80);

      const expectedAvg = parseFloat((total / 30).toFixed(2));
      expect(result.averageScore).toBe(expectedAvg);
    });
  });

  // =========================================================================
  // TIER 2: BOUNDARY CONDITIONS & EDGE CASES
  // =========================================================================
  describe('Tier 2: Boundary Conditions & Extreme Parameters', () => {
    const refDate = new Date('2026-08-01T00:00:00Z');

    it('handles zero velocity (0 setoran history) -> INSUFFICIENT_DATA and null completion date', () => {
      const velocity = calculateHafalanVelocity([], 30, refDate);
      expect(velocity.dailyVelocityAyat).toBe(0);
      expect(velocity.weeklyVelocityAyat).toBe(0);
      expect(velocity.activeDays).toBe(0);

      const prediction = predictCompletionAndRisk(0, 1000, velocity.dailyVelocityAyat, '2026-12-31', refDate);
      expect(prediction.remainingAyat).toBe(1000);
      expect(prediction.estimatedDays).toBe(Infinity);
      expect(prediction.estimatedCompletionDate).toBeNull();
      expect(prediction.riskStatus).toBe('INSUFFICIENT_DATA');
      expect(prediction.daysDelayed).toBe(0);
    });

    it('handles maximum target size of 6,236 ayat (total Al-Qur\'an ayat count)', () => {
      // 0 current progress, 6236 target ayat, 20 daily velocity -> 312 days needed
      const prediction = predictCompletionAndRisk(0, 6236, 20, '2027-10-01T00:00:00Z', refDate);

      expect(prediction.remainingAyat).toBe(6236);
      expect(prediction.estimatedDays).toBe(312); // ceil(6236 / 20) = 312
      expect(prediction.estimatedCompletionDate).not.toBeNull();
      expect(prediction.riskStatus).toBe('ON_TRACK');

      // Fully completed 6236 target
      const completedPrediction = predictCompletionAndRisk(6236, 6236, 20, '2026-12-31', refDate);
      expect(completedPrediction.remainingAyat).toBe(0);
      expect(completedPrediction.estimatedDays).toBe(0);
      expect(completedPrediction.riskStatus).toBe('COMPLETED');
      expect(completedPrediction.daysDelayed).toBe(0);
    });

    it('flags AT_RISK with correct daysDelayed when target deadline was in the past', () => {
      const pastDeadline = '2026-07-01T00:00:00Z'; // 1 month prior to reference date
      const prediction = predictCompletionAndRisk(500, 1000, 10, pastDeadline, refDate);

      expect(prediction.remainingAyat).toBe(500);
      expect(prediction.estimatedDays).toBe(50); // completion date: Sep 20, 2026
      expect(prediction.riskStatus).toBe('AT_RISK');
      expect(prediction.daysDelayed).toBeGreaterThan(70); // ~81 days after July 1
    });

    it('handles deadline set to today (same as reference date)', () => {
      const deadlineToday = refDate.toISOString();

      // Case A: Remaining ayat > 0 and velocity > 0 -> Needs >= 1 day -> AT_RISK
      const predIncomplete = predictCompletionAndRisk(90, 100, 10, deadlineToday, refDate);
      expect(predIncomplete.remainingAyat).toBe(10);
      expect(predIncomplete.estimatedDays).toBe(1);
      expect(predIncomplete.riskStatus).toBe('AT_RISK');
      expect(predIncomplete.daysDelayed).toBe(1);

      // Case B: Target already reached -> COMPLETED
      const predComplete = predictCompletionAndRisk(100, 100, 10, deadlineToday, refDate);
      expect(predComplete.remainingAyat).toBe(0);
      expect(predComplete.estimatedDays).toBe(0);
      expect(predComplete.riskStatus).toBe('COMPLETED');
      expect(predComplete.daysDelayed).toBe(0);
    });

    it('handles empty score records ({}) safely without throwing errors', () => {
      const result = calculatePerJuzKKMStatus({});

      expect(result.juzScores).toEqual([]);
      expect(result.remedialJuzList).toEqual([]);
      expect(result.isAllLulus).toBe(true);
      expect(result.averageScore).toBe(0);
    });
  });

  // =========================================================================
  // TIER 3: CROSS-FEATURE INTERACTIONS & INTEGRATION
  // =========================================================================
  describe('Tier 3: Cross-Feature Interactions (API Auth, Zero N+1 Query, Scoping, SWR)', () => {
    it('returns 401 Unauthorized when API request has no valid session token', async () => {
      vi.mocked(getAuthUser).mockResolvedValue({
        user: null,
        error: 'Token invalid or expired',
      });

      const req = new Request('http://localhost/api/analytics/predictive?santriId=10');
      const res = await GET(req);
      const body = await res.json();

      expect(res.status).toBe(401);
      expect(body.success).toBe(false);
      expect(body.error).toBe('Unauthorized');
    });

    it('executes Zero-N+1 single Prisma query for API data retrieval', async () => {
      vi.mocked(getAuthUser).mockResolvedValue({
        user: {
          id: 5,
          username: 'guru1',
          namaLengkap: 'Ustadz Ahmad',
          role: { name: 'guru' },
        },
        error: null,
      });

      vi.mocked(prisma.user.findFirst).mockResolvedValue({
        id: 10,
        namaLengkap: 'Santri Budi',
        username: 'santri10',
        foto: null,
        HalaqahSantri: [
          {
            halaqah: {
              id: 1,
              namaHalaqah: 'Halaqah Subuh',
              guru: { id: 5, namaLengkap: 'Ustadz Ahmad' },
            },
          },
        ],
        Hafalan: [
          {
            id: 1,
            tanggal: new Date('2026-07-28T00:00:00Z'),
            surat: 'Al-Baqarah',
            ayatMulai: 1,
            ayatSelesai: 20,
            status: 'ziyadah',
          },
        ],
        TargetHafalan: [
          {
            id: 1,
            surat: 'Al-Baqarah',
            ayatTarget: 286,
            deadline: new Date('2026-12-31T00:00:00Z'),
            status: 'proses',
          },
        ],
        ujianSantri: [
          {
            id: 101,
            tanggalUjian: new Date('2026-07-01T00:00:00Z'),
            nilaiAkhir: 85,
            nilaiDetail: { '1': 85 },
            juzDari: 1,
            juzSampai: 1,
            jenisUjianLabel: 'UAS Juz 1',
          },
        ],
      } as any);

      const req = new Request('http://localhost/api/analytics/predictive?santriId=10');
      const res = await GET(req);
      const body = await res.json();

      // Zero-N+1 verification: exactly one findFirst query executed
      expect(prisma.user.findFirst).toHaveBeenCalledTimes(1);

      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data.santri.namaLengkap).toBe('Santri Budi');
      expect(body.data.perJuzKKM.juzScores[0].juz).toBe(1);
    });

    it('enforces role-based data scoping for Ortu (child relationship) and Guru (halaqah permission)', async () => {
      // 1. Ortu Role
      vi.mocked(getAuthUser).mockResolvedValue({
        user: { id: 100, username: 'ortu100', namaLengkap: 'Pak Ortu', role: { name: 'ortu' } },
        error: null,
      });

      vi.mocked(prisma.user.findFirst).mockResolvedValue(null); // Parent asking for unlinked child

      const reqOrtu = new Request('http://localhost/api/analytics/predictive?santriId=999');
      const resOrtu = await GET(reqOrtu);
      expect(resOrtu.status).toBe(404);
      expect(prisma.user.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            id: 999,
            anak: { some: { orangTuaId: 100 } },
          }),
        })
      );

      // 2. Guru Role
      vi.mocked(getAuthUser).mockResolvedValue({
        user: { id: 200, username: 'guru200', namaLengkap: 'Ustadz Ali', role: { name: 'guru' } },
        error: null,
      });

      const reqGuru = new Request('http://localhost/api/analytics/predictive?santriId=888');
      await GET(reqGuru);
      expect(prisma.user.findFirst).toHaveBeenLastCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            id: 888,
            OR: [
              { HalaqahSantri: { some: { halaqah: { guruId: 200 } } } },
              {
                HalaqahSantri: {
                  some: {
                    halaqah: {
                      permissions: {
                        some: { guruId: 200, canHafalan: true, isActive: true },
                      },
                    },
                  },
                },
              },
            ],
          }),
        })
      );
    });

    it('simulates SWR state reactivity workflow when cache revalidation occurs', async () => {
      // Simulating SWR state machine transitions: null -> loading -> initial data -> mutate -> revalidated data
      const mockInitialSantri = {
        id: 10,
        namaLengkap: 'Santri SWR',
        username: 'santri_swr',
        foto: null,
        HalaqahSantri: [],
        Hafalan: [{ id: 1, tanggal: new Date(), surat: 'Al-Fatihah', ayatMulai: 1, ayatSelesai: 7, status: 'ziyadah' }],
        TargetHafalan: [{ id: 1, surat: 'Al-Baqarah', ayatTarget: 286, deadline: new Date('2026-12-31'), status: 'proses' }],
        ujianSantri: [],
      };

      vi.mocked(getAuthUser).mockResolvedValue({
        user: { id: 10, username: 'santri_swr', namaLengkap: 'Santri SWR', role: { name: 'santri' } },
        error: null,
      });

      vi.mocked(prisma.user.findFirst).mockResolvedValue(mockInitialSantri as any);

      // Initial SWR fetch
      const req1 = new Request('http://localhost/api/analytics/predictive');
      const res1 = await GET(req1);
      const body1 = await res1.json();
      expect(body1.data.velocity.totalZiyadahAyat).toBe(7);

      // Simulating new setoran added in DB
      const mockUpdatedSantri = {
        ...mockInitialSantri,
        Hafalan: [
          ...mockInitialSantri.Hafalan,
          { id: 2, tanggal: new Date(), surat: 'Al-Baqarah', ayatMulai: 1, ayatSelesai: 50, status: 'ziyadah' },
        ],
      };
      vi.mocked(prisma.user.findFirst).mockResolvedValue(mockUpdatedSantri as any);

      // SWR Revalidation fetch
      const req2 = new Request('http://localhost/api/analytics/predictive');
      const res2 = await GET(req2);
      const body2 = await res2.json();

      expect(body2.data.velocity.totalZiyadahAyat).toBe(57);
      expect(body2.data.prediction.remainingAyat).toBe(229); // 286 - 57 = 229
    });
  });

  // =========================================================================
  // TIER 4: REAL-WORLD APPLICATION SCENARIOS
  // =========================================================================
  describe('Tier 4: Real-World Application Scenarios', () => {
    it('handles Guru selecting different santri across halaqah dynamically', async () => {
      vi.mocked(getAuthUser).mockResolvedValue({
        user: { id: 50, username: 'guru_utama', namaLengkap: 'Ustadz Utama', role: { name: 'guru' } },
        error: null,
      });

      // Santri A: High achiever
      const santriA = {
        id: 101,
        namaLengkap: 'Santri A (Al-Fatihah)',
        username: 'santria',
        foto: null,
        HalaqahSantri: [{ halaqah: { id: 1, namaHalaqah: 'Halaqah A', guru: { id: 50, namaLengkap: 'Ustadz Utama' } } }],
        Hafalan: [{ id: 1, tanggal: new Date('2026-07-28'), surat: 'Al-Baqarah', ayatMulai: 1, ayatSelesai: 100, status: 'ziyadah' }],
        TargetHafalan: [{ id: 1, surat: 'Al-Baqarah', ayatTarget: 286, deadline: new Date('2026-12-31'), status: 'proses' }],
        ujianSantri: [{ id: 1, tanggalUjian: new Date(), nilaiAkhir: 95, nilaiDetail: { '1': 95 }, juzDari: 1, juzSampai: 1, jenisUjianLabel: 'UAS' }],
      };

      // Santri B: Remedial candidate
      const santriB = {
        id: 102,
        namaLengkap: 'Santri B (Al-Fatihah)',
        username: 'santrib',
        foto: null,
        HalaqahSantri: [{ halaqah: { id: 1, namaHalaqah: 'Halaqah A', guru: { id: 50, namaLengkap: 'Ustadz Utama' } } }],
        Hafalan: [{ id: 2, tanggal: new Date('2026-07-28'), surat: 'An-Naba', ayatMulai: 1, ayatSelesai: 10, status: 'ziyadah' }],
        TargetHafalan: [{ id: 2, surat: 'An-Naba', ayatTarget: 40, deadline: new Date('2026-08-05'), status: 'proses' }],
        ujianSantri: [{ id: 2, tanggalUjian: new Date(), nilaiAkhir: 65, nilaiDetail: { '30': 65 }, juzDari: 30, juzSampai: 30, jenisUjianLabel: 'UAS' }],
      };

      // Select Santri A
      vi.mocked(prisma.user.findFirst).mockResolvedValue(santriA as any);
      const resA = await GET(new Request('http://localhost/api/analytics/predictive?santriId=101'));
      const bodyA = await resA.json();

      expect(bodyA.data.santri.namaLengkap).toBe('Santri A (Al-Fatihah)');
      expect(bodyA.data.perJuzKKM.isAllLulus).toBe(true);
      expect(bodyA.data.prediction.riskStatus).toBe('ON_TRACK');

      // Select Santri B
      vi.mocked(prisma.user.findFirst).mockResolvedValue(santriB as any);
      const resB = await GET(new Request('http://localhost/api/analytics/predictive?santriId=102'));
      const bodyB = await resB.json();

      expect(bodyB.data.santri.namaLengkap).toBe('Santri B (Al-Fatihah)');
      expect(bodyB.data.perJuzKKM.isAllLulus).toBe(false);
      expect(bodyB.data.perJuzKKM.remedialJuzList).toEqual([30]);
    });

    it('handles Ortu switching between multiple children with distinct progress profiles', async () => {
      vi.mocked(getAuthUser).mockResolvedValue({
        user: { id: 80, username: 'ortu_multichild', namaLengkap: 'Ibu Rahma', role: { name: 'ortu' } },
        error: null,
      });

      // Child 1 (Older child - Juz 30 completed)
      const child1 = {
        id: 201,
        namaLengkap: 'Kakak (Santri 1)',
        username: 'kakak201',
        foto: null,
        HalaqahSantri: [],
        Hafalan: Array.from({ length: 10 }, (_, i) => ({
          id: i + 1,
          tanggal: new Date(Date.now() - i * 86400000),
          surat: 'An-Naba',
          ayatMulai: 1,
          ayatSelesai: 20,
          status: 'ziyadah',
        })),
        TargetHafalan: [{ id: 1, surat: 'Juz 30', ayatTarget: 564, deadline: new Date('2026-12-31'), status: 'proses' }],
        ujianSantri: [{ id: 1, tanggalUjian: new Date(), nilaiAkhir: 90, nilaiDetail: { '30': 90 }, juzDari: 30, juzSampai: 30, jenisUjianLabel: 'MHQ' }],
      };

      // Child 2 (Younger child - slow progress)
      const child2 = {
        id: 202,
        namaLengkap: 'Adik (Santri 2)',
        username: 'adik202',
        foto: null,
        HalaqahSantri: [],
        Hafalan: [{ id: 1, tanggal: new Date(Date.now() - 25 * 86400000), surat: 'An-Nas', ayatMulai: 1, ayatSelesai: 6, status: 'ziyadah' }],
        TargetHafalan: [{ id: 2, surat: 'Juz 30', ayatTarget: 564, deadline: new Date('2026-08-10'), status: 'proses' }],
        ujianSantri: [],
      };

      // Switch to Child 1
      vi.mocked(prisma.user.findFirst).mockResolvedValue(child1 as any);
      const resChild1 = await GET(new Request('http://localhost/api/analytics/predictive?santriId=201'));
      const body1 = await resChild1.json();
      expect(body1.data.santri.namaLengkap).toBe('Kakak (Santri 1)');
      expect(body1.data.velocity.totalZiyadahAyat).toBe(200);
      expect(body1.data.prediction.riskStatus).toBe('ON_TRACK');

      // Switch to Child 2
      vi.mocked(prisma.user.findFirst).mockResolvedValue(child2 as any);
      const resChild2 = await GET(new Request('http://localhost/api/analytics/predictive?santriId=202'));
      const body2 = await resChild2.json();
      expect(body2.data.santri.namaLengkap).toBe('Adik (Santri 2)');
      expect(body2.data.velocity.totalZiyadahAyat).toBe(6);
      expect(body2.data.prediction.riskStatus).toBe('AT_RISK');
    });

    it('recalculates velocity dynamically when new setoran entries are logged', () => {
      const refDate = '2026-08-01T00:00:00Z';
      const initialSetoran = [
        { tanggal: '2026-07-20T00:00:00Z', jumlahAyat: 10, status: 'ziyadah' },
      ];

      // Initial calculation: 10 ayat in 30 days window -> 0.33 ayat/day
      const velInitial = calculateHafalanVelocity(initialSetoran, 30, refDate);
      expect(velInitial.dailyVelocityAyat).toBe(0.33);

      // Add 4 additional setoran entries of 30 ayat each
      const updatedSetoran = [
        ...initialSetoran,
        { tanggal: '2026-07-25T00:00:00Z', jumlahAyat: 30, status: 'ziyadah' },
        { tanggal: '2026-07-26T00:00:00Z', jumlahAyat: 30, status: 'ziyadah' },
        { tanggal: '2026-07-27T00:00:00Z', jumlahAyat: 30, status: 'ziyadah' },
        { tanggal: '2026-07-28T00:00:00Z', jumlahAyat: 30, status: 'ziyadah' },
      ];

      // Updated calculation: 130 ayat in 30 days window -> 4.33 ayat/day
      const velUpdated = calculateHafalanVelocity(updatedSetoran, 30, refDate);
      expect(velUpdated.dailyVelocityAyat).toBe(4.33);
      expect(velUpdated.weeklyVelocityAyat).toBe(30.31); // 4.33 * 7
      expect(velUpdated.totalZiyadahAyat).toBe(130);
      expect(velUpdated.activeDays).toBe(5);
    });
  });

  // =========================================================================
  // TIER 5: WHITE-BOX ADVERSARIAL COVERAGE HARDENING
  // =========================================================================
  describe('Tier 5: White-Box Adversarial Coverage Hardening', () => {
    it('handles malformed DB records in nilaiDetail (null values, arbitrary objects, invalid string numbers)', () => {
      const scoresMap = {
        1: null as any,
        2: undefined as any,
        3: 'not-a-number' as any,
        4: { invalid: true } as any,
        5: 85,
      };

      const result = calculatePerJuzKKMStatus(scoresMap, 80);

      // All invalid entries default to score 0 and flagged as remedial
      expect(result.juzScores).toHaveLength(5);
      const score5 = result.juzScores.find((j) => j.juz === 5);
      expect(score5?.score).toBe(85);
      expect(score5?.isRemedial).toBe(false);

      const score1 = result.juzScores.find((j) => j.juz === 1);
      expect(score1?.score).toBe(0);
      expect(score1?.isRemedial).toBe(true);

      expect(isNaN(result.averageScore)).toBe(false);
      expect(result.averageScore).toBe(17.0); // 85 / 5 = 17.0
    });

    it('handles un-trimmed, whitespace, and mixed-case status strings safely in setoran list', () => {
      const refDate = '2026-08-01T00:00:00Z';
      const setoranWithDirtyStatuses = [
        { tanggal: '2026-07-28T00:00:00Z', jumlahAyat: 10, status: '   ziyadah   ' },
        { tanggal: '2026-07-27T00:00:00Z', jumlahAyat: 15, status: 'ZIYADAH\n' },
        { tanggal: '2026-07-26T00:00:00Z', jumlahAyat: 20, status: '\tZiyadah\r' },
        { tanggal: '2026-07-25T00:00:00Z', jumlahAyat: 50, status: 'MUROJAAH' }, // should be ignored
        { tanggal: '2026-07-24T00:00:00Z', jumlahAyat: 100, status: '  murojaah  ' }, // should be ignored
      ];

      const velocity = calculateHafalanVelocity(setoranWithDirtyStatuses, 30, refDate);

      expect(velocity.totalZiyadahAyat).toBe(45); // 10 + 15 + 20
      expect(velocity.activeDays).toBe(3);
    });

    it('handles date parsing edge cases (invalid date strings, far future, epoch 0) without throwing', () => {
      const refDate = '2026-08-01T00:00:00Z';
      const corruptSetoran = [
        { tanggal: 'invalid-date-string-xyz', jumlahAyat: 50, status: 'ziyadah' },
        { tanggal: '1970-01-01T00:00:00Z', jumlahAyat: 100, status: 'ziyadah' }, // outside 30-day window
        { tanggal: '2026-07-30T00:00:00Z', jumlahAyat: 25, status: 'ziyadah' }, // valid
      ];

      const velocity = calculateHafalanVelocity(corruptSetoran, 30, refDate);

      expect(velocity.totalZiyadahAyat).toBe(25);
      expect(velocity.activeDays).toBe(1);

      // Prediction date parsing edge cases
      const predInvalidDate = predictCompletionAndRisk(500, 1000, 10, 'invalid-deadline-string', refDate);
      expect(predInvalidDate.riskStatus).toBe('ON_TRACK');
      expect(predInvalidDate.estimatedCompletionDate).not.toBeNull();
      expect(isNaN(predInvalidDate.estimatedCompletionDate!.getTime())).toBe(false);

      const predNullDeadline = predictCompletionAndRisk(500, 1000, 10, null, refDate);
      expect(predNullDeadline.riskStatus).toBe('ON_TRACK');
    });

    it('guards against NaN, Infinity, -Infinity, and negative numbers in velocity and prediction parameters', () => {
      const refDate = new Date('2026-08-01T00:00:00Z');

      // Negative/NaN currentProgressAyat or targetTotalAyat
      const predNaN = predictCompletionAndRisk(NaN, NaN, 10, '2026-12-31', refDate);
      expect(predNaN.remainingAyat).toBe(0);
      expect(predNaN.estimatedDays).toBe(0);
      expect(predNaN.riskStatus).toBe('COMPLETED');

      // Infinity / -Infinity velocity
      const predInf = predictCompletionAndRisk(100, 1000, Infinity, '2026-12-31', refDate);
      expect(predInf.riskStatus).toBe('INSUFFICIENT_DATA');

      const predNegInf = predictCompletionAndRisk(100, 1000, -Infinity, '2026-12-31', refDate);
      expect(predNegInf.riskStatus).toBe('INSUFFICIENT_DATA');

      // Hafalan velocity with NaN/Infinity daysWindow
      const velNaNWindow = calculateHafalanVelocity([{ tanggal: '2026-07-28', jumlahAyat: 30, status: 'ziyadah' }], NaN, refDate);
      expect(velNaNWindow.windowDays).toBe(30);
      expect(velNaNWindow.dailyVelocityAyat).toBe(1.0);
    });

    it('handles API route error codes 401, 403, 404, and 500 cleanly with structured JSON responses', async () => {
      // 1. 401 Unauthorized
      vi.mocked(getAuthUser).mockResolvedValue({ user: null, error: 'No token' });
      const res401 = await GET(new Request('http://localhost/api/analytics/predictive?santriId=1'));
      expect(res401.status).toBe(401);
      const json401 = await res401.json();
      expect(json401).toEqual({ success: false, error: 'Unauthorized' });

      // 2. 403 Forbidden Role
      vi.mocked(getAuthUser).mockResolvedValue({ user: { id: 1, role: { name: 'unauthorized_role' } } as any, error: null });
      const res403Role = await GET(new Request('http://localhost/api/analytics/predictive?santriId=1'));
      expect(res403Role.status).toBe(403);
      const json403Role = await res403Role.json();
      expect(json403Role).toEqual({ success: false, error: 'Forbidden: Role not allowed' });

      // 3. 403 Forbidden Santri Cross-Access
      vi.mocked(getAuthUser).mockResolvedValue({ user: { id: 10, role: { name: 'santri' } } as any, error: null });
      const res403Santri = await GET(new Request('http://localhost/api/analytics/predictive?santriId=99'));
      expect(res403Santri.status).toBe(403);
      const json403Santri = await res403Santri.json();
      expect(json403Santri.error).toContain('Santri hanya dapat mengakses data analitik milik sendiri');

      // 4. 404 Not Found
      vi.mocked(getAuthUser).mockResolvedValue({ user: { id: 1, role: { name: 'admin' } } as any, error: null });
      vi.mocked(prisma.user.findFirst).mockResolvedValue(null);
      const res404 = await GET(new Request('http://localhost/api/analytics/predictive?santriId=99999'));
      expect(res404.status).toBe(404);
      const json404 = await res404.json();
      expect(json404.error).toContain('Santri tidak ditemukan');

      // 5. 500 Internal Server Error
      vi.mocked(getAuthUser).mockResolvedValue({ user: { id: 1, role: { name: 'admin' } } as any, error: null });
      vi.mocked(prisma.user.findFirst).mockRejectedValue(new Error('Fatal DB Crash'));
      const res500 = await GET(new Request('http://localhost/api/analytics/predictive?santriId=1'));
      expect(res500.status).toBe(500);
      const json500 = await res500.json();
      expect(json500).toEqual({
        success: false,
        error: 'Internal server error',
      });
      expect(json500.details).toBeUndefined();
    });
  });
});
