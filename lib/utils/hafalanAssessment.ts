/**
 * Standardized Hafalan Assessment and Grading Utilities
 */

export type GradeLetter = 'A' | 'B' | 'C' | 'D' | 'E' | '-';
export type KelulusanStatus = 'Lulus' | 'Tidak Lulus' | 'Belum Ujian';

/**
 * Calculate grade letter (A-E) from numerical score (0-100)
 */
export function calculateGradeLetter(nilai: number | null | undefined): GradeLetter {
  if (nilai == null) return '-';
  if (nilai >= 90) return 'A';
  if (nilai >= 80) return 'B';
  if (nilai >= 70) return 'C';
  if (nilai >= 60) return 'D';
  return 'E';
}

export const GRADE_COLORS: Record<GradeLetter, string> = {
  A: '#52c41a', // Green
  B: '#1890ff', // Blue
  C: '#faad14', // Yellow-Gold
  D: '#fa8c16', // Orange
  E: '#ff4d4f', // Red
  '-': '#d9d9d9', // Grey
};

/**
 * Get standardized Ant Design color hex for a given score
 */
export function calculateGradeColor(nilai: number | null | undefined): string {
  const letter = calculateGradeLetter(nilai);
  return GRADE_COLORS[letter] ?? GRADE_COLORS['-'];
}

/**
 * Determine kelulusan status based on score and optional passing grade (default 70)
 */
export function calculateKelulusanStatus(
  nilaiAkhir: number | null | undefined,
  passingGrade: number = 70
): KelulusanStatus {
  if (nilaiAkhir == null) return 'Belum Ujian';
  return nilaiAkhir >= passingGrade ? 'Lulus' : 'Tidak Lulus';
}

/**
 * Get traditional Arabic/Indonesian honorific predikat for a score
 */
export function calculatePredikat(nilaiAkhir: number | null | undefined): string {
  if (nilaiAkhir == null) return 'Belum Ada Predikat';
  if (nilaiAkhir >= 90) return 'Mumtaz (Istimewa)';
  if (nilaiAkhir >= 80) return 'Jayyid Jiddan (Sangat Baik)';
  if (nilaiAkhir >= 70) return 'Jayyid (Baik)';
  if (nilaiAkhir >= 60) return 'Maqbul (Cukup)';
  return 'Rasib (Kurang)';
}

/**
 * Validate Quran ayat bounds for Ziyadah or Murajaah
 */
export function validateAyatRange(
  ayatMulai: number,
  ayatSelesai: number
): { valid: boolean; error?: string; totalAyat?: number } {
  if (ayatMulai < 1) {
    return { valid: false, error: 'Ayat mulai harus minimal 1' };
  }
  if (ayatSelesai < ayatMulai) {
    return { valid: false, error: 'Ayat selesai tidak boleh lebih kecil dari ayat mulai' };
  }
  return {
    valid: true,
    totalAyat: ayatSelesai - ayatMulai + 1,
  };
}

export interface UjianKKMEvaluation {
  nilaiAkhir: number;
  kkm: number;
  isLulusKKM: boolean;
  statusKelulusan: 'LULUS' | 'REMEDIAL_REQUIRED' | 'TIDAK_LULUS';
  rekomendasiRemedial: boolean;
  predikat: string;
}

/**
 * Evaluate exam score against dynamic KKM threshold and remedial override
 */
export function evaluateUjianKKM(
  nilaiAkhir: number | null | undefined,
  kkm: number = 70,
  overrideRemedial: boolean = false
): UjianKKMEvaluation {
  const nilai = nilaiAkhir ?? 0;
  const isLulusKKM = nilai >= kkm;

  let statusKelulusan: 'LULUS' | 'REMEDIAL_REQUIRED' | 'TIDAK_LULUS';
  let rekomendasiRemedial = false;

  if (isLulusKKM) {
    statusKelulusan = 'LULUS';
  } else if (overrideRemedial) {
    statusKelulusan = 'TIDAK_LULUS';
  } else {
    statusKelulusan = 'REMEDIAL_REQUIRED';
    rekomendasiRemedial = true;
  }

  return {
    nilaiAkhir: nilai,
    kkm,
    isLulusKKM,
    statusKelulusan,
    rekomendasiRemedial,
    predikat: calculatePredikat(nilai),
  };
}

export interface JuzEvaluation {
  nilai: number;
  status: 'LULUS' | 'REMEDIAL_REQUIRED' | 'TIDAK_LULUS';
  kkm: number;
  predikat: string;
  isRemedial: boolean;
}

export interface PerJuzEvaluationResult {
  nilaiPerJuz: Record<number, JuzEvaluation>;
  juzRemedialList: number[];
  isAllJuzLulus: boolean;
  nilaiAkhirGabungan: number;
  predikatAkhir: string;
}

/**
 * Calculate scores and KKM compliance independently per juz for multi-juz exams
 */
export function calculateNilaiPerJuz(
  nilaiDetail: Record<string, any> | null | undefined,
  juzDari: number,
  juzSampai: number,
  kkm: number = 70,
  overrideRemedial: boolean = false
): PerJuzEvaluationResult {
  const detail = nilaiDetail || {};
  const nilaiPerJuz: Record<number, JuzEvaluation> = {};
  const juzRemedialList: number[] = [];
  const allNilai: number[] = [];

  for (let juz = juzDari; juz <= juzSampai; juz++) {
    const valuesForJuz: number[] = [];

    // Match keys formatted like `juz-30-p1-kelancaran` or `juz_30_p1_tajwid`
    for (const [key, val] of Object.entries(detail)) {
      if (typeof val === 'number') {
        const regex = new RegExp(`^juz[-_]${juz}[-_]`, 'i');
        if (regex.test(key)) {
          valuesForJuz.push(val);
        }
      }
    }

    // Direct mapping fallback (e.g., { "29": 85, "30": 55 })
    if (valuesForJuz.length === 0 && typeof detail[String(juz)] === 'number') {
      valuesForJuz.push(detail[String(juz)]);
    }

    const avgNilai = valuesForJuz.length > 0
      ? Math.round(valuesForJuz.reduce((sum, n) => sum + n, 0) / valuesForJuz.length)
      : 0;

    const evalResult = evaluateUjianKKM(avgNilai, kkm, overrideRemedial);

    nilaiPerJuz[juz] = {
      nilai: avgNilai,
      status: evalResult.statusKelulusan,
      kkm,
      predikat: evalResult.predikat,
      isRemedial: false,
    };

    allNilai.push(avgNilai);

    if (evalResult.statusKelulusan === 'REMEDIAL_REQUIRED') {
      juzRemedialList.push(juz);
    }
  }

  const nilaiAkhirGabungan = allNilai.length > 0
    ? Math.round(allNilai.reduce((sum, n) => sum + n, 0) / allNilai.length)
    : 0;

  const isAllJuzLulus = juzRemedialList.length === 0;

  return {
    nilaiPerJuz,
    juzRemedialList,
    isAllJuzLulus,
    nilaiAkhirGabungan,
    predikatAkhir: calculatePredikat(nilaiAkhirGabungan),
  };
}
