import { describe, it, expect } from 'vitest';
import {
  calculateGradeLetter,
  calculateGradeColor,
  calculateKelulusanStatus,
  calculatePredikat,
  validateAyatRange,
  evaluateUjianKKM,
  calculateNilaiPerJuz,
} from '@/lib/utils/hafalanAssessment';

describe('HafalanAssessment', () => {
  describe('calculateGradeLetter', () => {
    it('returns A for scores 90 and above', () => {
      expect(calculateGradeLetter(90)).toBe('A');
      expect(calculateGradeLetter(100)).toBe('A');
      expect(calculateGradeLetter(95.5)).toBe('A');
    });

    it('returns B for scores between 80 and 89.99', () => {
      expect(calculateGradeLetter(80)).toBe('B');
      expect(calculateGradeLetter(89.9)).toBe('B');
    });

    it('returns C for scores between 70 and 79.99', () => {
      expect(calculateGradeLetter(70)).toBe('C');
      expect(calculateGradeLetter(79)).toBe('C');
    });

    it('returns D for scores between 60 and 69.99', () => {
      expect(calculateGradeLetter(60)).toBe('D');
      expect(calculateGradeLetter(69.9)).toBe('D');
    });

    it('returns E for scores below 60', () => {
      expect(calculateGradeLetter(59.9)).toBe('E');
      expect(calculateGradeLetter(0)).toBe('E');
    });

    it('returns dash (-) for null or undefined scores', () => {
      expect(calculateGradeLetter(null)).toBe('-');
      expect(calculateGradeLetter(undefined)).toBe('-');
    });
  });

  describe('calculateGradeColor', () => {
    it('returns correct hex color codes for each grade letter', () => {
      expect(calculateGradeColor(92)).toBe('#52c41a'); // A - green
      expect(calculateGradeColor(85)).toBe('#1890ff'); // B - blue
      expect(calculateGradeColor(75)).toBe('#faad14'); // C - yellow-gold
      expect(calculateGradeColor(65)).toBe('#fa8c16'); // D - orange
      expect(calculateGradeColor(40)).toBe('#ff4d4f'); // E - red
      expect(calculateGradeColor(null)).toBe('#d9d9d9'); // null - grey
    });
  });

  describe('calculateKelulusanStatus', () => {
    it('returns Lulus when score meets or exceeds default passing grade (70)', () => {
      expect(calculateKelulusanStatus(70)).toBe('Lulus');
      expect(calculateKelulusanStatus(85)).toBe('Lulus');
    });

    it('returns Tidak Lulus when score is below passing grade', () => {
      expect(calculateKelulusanStatus(69.9)).toBe('Tidak Lulus');
      expect(calculateKelulusanStatus(50)).toBe('Tidak Lulus');
    });

    it('respects custom passing grade when specified', () => {
      expect(calculateKelulusanStatus(75, 80)).toBe('Tidak Lulus');
      expect(calculateKelulusanStatus(80, 80)).toBe('Lulus');
    });

    it('returns Belum Ujian when score is null or undefined', () => {
      expect(calculateKelulusanStatus(null)).toBe('Belum Ujian');
      expect(calculateKelulusanStatus(undefined)).toBe('Belum Ujian');
    });
  });

  describe('calculatePredikat', () => {
    it('returns traditional Arabic/Indonesian honorifics for each grade bracket', () => {
      expect(calculatePredikat(95)).toBe('Mumtaz (Istimewa)');
      expect(calculatePredikat(85)).toBe('Jayyid Jiddan (Sangat Baik)');
      expect(calculatePredikat(75)).toBe('Jayyid (Baik)');
      expect(calculatePredikat(65)).toBe('Maqbul (Cukup)');
      expect(calculatePredikat(55)).toBe('Rasib (Kurang)');
    });
  });

  describe('validateAyatRange', () => {
    it('returns valid true and totalAyat for correct ayat bounds', () => {
      const result = validateAyatRange(1, 10);
      expect(result).toEqual({
        valid: true,
        totalAyat: 10,
      });

      const singleAyat = validateAyatRange(5, 5);
      expect(singleAyat).toEqual({
        valid: true,
        totalAyat: 1,
      });
    });

    it('returns valid false with descriptive error when ayatMulai is less than 1', () => {
      const result = validateAyatRange(0, 10);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Ayat mulai harus minimal 1');
    });

    it('returns valid false with descriptive error when ayatSelesai is smaller than ayatMulai', () => {
      const result = validateAyatRange(10, 5);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Ayat selesai tidak boleh lebih kecil dari ayat mulai');
    });
  });

  describe('evaluateUjianKKM', () => {
    it('returns LULUS when score meets or exceeds KKM', () => {
      const res = evaluateUjianKKM(85, 70);
      expect(res.isLulusKKM).toBe(true);
      expect(res.statusKelulusan).toBe('LULUS');
      expect(res.rekomendasiRemedial).toBe(false);
      expect(res.predikat).toBe('Jayyid Jiddan (Sangat Baik)');
    });

    it('returns REMEDIAL_REQUIRED and rekomendasiRemedial when score is below KKM', () => {
      const res = evaluateUjianKKM(55, 70);
      expect(res.isLulusKKM).toBe(false);
      expect(res.statusKelulusan).toBe('REMEDIAL_REQUIRED');
      expect(res.rekomendasiRemedial).toBe(true);
      expect(res.predikat).toBe('Rasib (Kurang)');
    });

    it('returns TIDAK_LULUS when overrideRemedial is true for score below KKM', () => {
      const res = evaluateUjianKKM(55, 70, true);
      expect(res.isLulusKKM).toBe(false);
      expect(res.statusKelulusan).toBe('TIDAK_LULUS');
      expect(res.rekomendasiRemedial).toBe(false);
      expect(res.predikat).toBe('Rasib (Kurang)');
    });
  });

  describe('calculateNilaiPerJuz', () => {
    it('evaluates scores independently per juz and identifies remedial target juz', () => {
      const nilaiDetail = {
        'juz-29-p1-kelancaran': 85,
        'juz-29-p1-tajwid': 85,
        'juz-30-p1-kelancaran': 55,
        'juz-30-p1-tajwid': 55,
      };

      const result = calculateNilaiPerJuz(nilaiDetail, 29, 30, 70);
      expect(result.isAllJuzLulus).toBe(false);
      expect(result.juzRemedialList).toEqual([30]);
      expect(result.nilaiPerJuz[29].status).toBe('LULUS');
      expect(result.nilaiPerJuz[29].nilai).toBe(85);
      expect(result.nilaiPerJuz[30].status).toBe('REMEDIAL_REQUIRED');
      expect(result.nilaiPerJuz[30].nilai).toBe(55);
      expect(result.nilaiAkhirGabungan).toBe(70);
      expect(result.predikatAkhir).toBe('Jayyid (Baik)');
    });

    it('returns empty juzRemedialList when all juz meet KKM', () => {
      const nilaiDetail = {
        'juz-29-p1-kelancaran': 90,
        'juz-30-p1-kelancaran': 80,
      };

      const result = calculateNilaiPerJuz(nilaiDetail, 29, 30, 70);
      expect(result.isAllJuzLulus).toBe(true);
      expect(result.juzRemedialList).toEqual([]);
      expect(result.nilaiAkhirGabungan).toBe(85);
      expect(result.predikatAkhir).toBe('Jayyid Jiddan (Sangat Baik)');
    });

    it('aggregates per-halaman keys (`juz-<juz>-halaman-<page>`) into per-juz averages', () => {
      const nilaiDetail = {
        'juz-1-halaman-1': 80,
        'juz-1-halaman-2': 90,
        'juz-1-halaman-3': 70,
        'juz-2-halaman-22': 60,
        'juz-2-halaman-23': 60,
      };

      const result = calculateNilaiPerJuz(nilaiDetail, 1, 2, 70);
      expect(result.nilaiPerJuz[1].nilai).toBe(80); // (80+90+70)/3
      expect(result.nilaiPerJuz[1].status).toBe('LULUS');
      expect(result.nilaiPerJuz[2].nilai).toBe(60);
      expect(result.nilaiPerJuz[2].status).toBe('REMEDIAL_REQUIRED');
      expect(result.juzRemedialList).toEqual([2]);
      expect(result.isAllJuzLulus).toBe(false);
    });

    it('aggregates per-juz soal keys (`juz-<juz>-soal-<s>`) for MHQ', () => {
      const nilaiDetail = {
        'juz-5-soal-1': 90,
        'juz-5-soal-2': 72,
        'juz-5-soal-3': 72,
      };

      const result = calculateNilaiPerJuz(nilaiDetail, 5, 5, 70);
      expect(result.nilaiPerJuz[5].nilai).toBe(78); // (90+72+72)/3
      expect(result.isAllJuzLulus).toBe(true);
      expect(result.juzRemedialList).toEqual([]);
    });
  });
});

