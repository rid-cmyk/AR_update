/**
 * Domain Service: Predictive Analytics & Per-Juz Evaluation Logic
 * Location: lib/services/predictiveAnalytics.ts
 */

export interface JuzKKMItem {
  juz: number;
  score: number;
  isRemedial: boolean;
  status: 'LULUS' | 'REMEDIAL_REQUIRED';
}

export interface PerJuzKKMStatusResult {
  juzScores: JuzKKMItem[];
  remedialJuzList: number[];
  isAllLulus: boolean;
  averageScore: number;
}

export interface SetoranRecord {
  tanggal: Date | string;
  jumlahAyat: number;
  status?: string;
}

export interface HafalanVelocityResult {
  dailyVelocityAyat: number;
  weeklyVelocityAyat: number;
  totalZiyadahAyat: number;
  activeDays: number;
  windowDays: number;
}

export type RiskStatus = 'ON_TRACK' | 'AT_RISK' | 'COMPLETED' | 'INSUFFICIENT_DATA';

export interface CompletionPredictionResult {
  remainingAyat: number;
  estimatedDays: number;
  estimatedCompletionDate: Date | null;
  riskStatus: RiskStatus;
  daysDelayed: number;
}

/**
 * Evaluates per-juz scores against KKM threshold (default 80).
 */
export function calculatePerJuzKKMStatus(
  scores: Record<number, number> | null | undefined,
  kkmThreshold: number = 80
): PerJuzKKMStatusResult {
  if (!scores || typeof scores !== 'object' || Object.keys(scores).length === 0) {
    return {
      juzScores: [],
      remedialJuzList: [],
      isAllLulus: true,
      averageScore: 0,
    };
  }

  const juzNumbers = Object.keys(scores)
    .map(Number)
    .filter((n) => !isNaN(n))
    .sort((a, b) => a - b);

  if (juzNumbers.length === 0) {
    return {
      juzScores: [],
      remedialJuzList: [],
      isAllLulus: true,
      averageScore: 0,
    };
  }

  const juzScores: JuzKKMItem[] = [];
  const remedialJuzList: number[] = [];
  let totalScore = 0;

  for (const juz of juzNumbers) {
    const rawScore = scores[juz];
    const score =
      typeof rawScore === 'number' && !isNaN(rawScore) && isFinite(rawScore)
        ? parseFloat(rawScore.toFixed(2))
        : 0;

    totalScore += score;
    const isRemedial = score < kkmThreshold;

    if (isRemedial) {
      remedialJuzList.push(juz);
    }

    juzScores.push({
      juz,
      score,
      isRemedial,
      status: isRemedial ? 'REMEDIAL_REQUIRED' : 'LULUS',
    });
  }

  const averageScore =
    juzScores.length > 0
      ? parseFloat((totalScore / juzScores.length).toFixed(2))
      : 0;

  return {
    juzScores,
    remedialJuzList,
    isAllLulus: remedialJuzList.length === 0,
    averageScore,
  };
}

/**
 * Calculates student setoran velocity over historical window (default 30 days).
 */
export function calculateHafalanVelocity(
  setoranList: SetoranRecord[] | null | undefined,
  daysWindow: number = 30,
  referenceDate: Date | string = new Date()
): HafalanVelocityResult {
  const windowDays =
    typeof daysWindow === 'number' && !isNaN(daysWindow) && isFinite(daysWindow) && daysWindow > 0
      ? Math.max(1, daysWindow)
      : 30;

  if (!Array.isArray(setoranList) || setoranList.length === 0) {
    return {
      dailyVelocityAyat: 0,
      weeklyVelocityAyat: 0,
      totalZiyadahAyat: 0,
      activeDays: 0,
      windowDays,
    };
  }

  const refDateObj = new Date(referenceDate);
  const refTime = refDateObj.getTime();
  if (isNaN(refTime)) {
    return {
      dailyVelocityAyat: 0,
      weeklyVelocityAyat: 0,
      totalZiyadahAyat: 0,
      activeDays: 0,
      windowDays,
    };
  }

  const startTime = refTime - windowDays * 86400000;

  let totalZiyadahAyat = 0;
  const activeDaysSet = new Set<string>();

  for (const record of setoranList) {
    if (
      !record ||
      typeof record.jumlahAyat !== 'number' ||
      isNaN(record.jumlahAyat) ||
      !isFinite(record.jumlahAyat) ||
      record.jumlahAyat <= 0
    ) {
      continue;
    }

    const recordDateObj = new Date(record.tanggal);
    const recordTime = recordDateObj.getTime();
    if (isNaN(recordTime)) continue;

    // Filter within window [startTime, refTime]
    if (recordTime >= startTime && recordTime <= refTime) {
      // Optional status filter: if status is provided, only count ziyadah
      if (record.status && typeof record.status === 'string') {
        if (record.status.trim().toLowerCase() !== 'ziyadah') {
          continue;
        }
      }

      totalZiyadahAyat += record.jumlahAyat;
      const dateStr = recordDateObj.toISOString().split('T')[0];
      activeDaysSet.add(dateStr);
    }
  }

  const activeDays = activeDaysSet.size;
  const dailyVelocityAyat = parseFloat((totalZiyadahAyat / windowDays).toFixed(2));
  const weeklyVelocityAyat = parseFloat((dailyVelocityAyat * 7).toFixed(2));

  return {
    dailyVelocityAyat,
    weeklyVelocityAyat,
    totalZiyadahAyat,
    activeDays,
    windowDays,
  };
}

/**
 * Predicts completion date and evaluates deadline risk.
 */
export function predictCompletionAndRisk(
  currentProgressAyat: number,
  targetTotalAyat: number,
  dailyVelocityAyat: number,
  targetDeadline: Date | string | null | undefined,
  referenceDate: Date | string = new Date()
): CompletionPredictionResult {
  const current = Math.max(
    0,
    typeof currentProgressAyat === 'number' && !isNaN(currentProgressAyat)
      ? currentProgressAyat
      : 0
  );
  const target = Math.max(
    0,
    typeof targetTotalAyat === 'number' && !isNaN(targetTotalAyat) ? targetTotalAyat : 0
  );
  const remainingAyat = Math.max(0, target - current);

  let refDateObj = new Date(referenceDate);
  if (isNaN(refDateObj.getTime())) {
    refDateObj = new Date();
  }

  // Scenario 1: Target Already Completed
  if (remainingAyat === 0 || current >= target) {
    return {
      remainingAyat: 0,
      estimatedDays: 0,
      estimatedCompletionDate: refDateObj,
      riskStatus: 'COMPLETED',
      daysDelayed: 0,
    };
  }

  // Scenario 2: Zero or Invalid Velocity
  if (
    typeof dailyVelocityAyat !== 'number' ||
    isNaN(dailyVelocityAyat) ||
    !isFinite(dailyVelocityAyat) ||
    dailyVelocityAyat <= 0
  ) {
    return {
      remainingAyat,
      estimatedDays: Infinity,
      estimatedCompletionDate: null,
      riskStatus: 'INSUFFICIENT_DATA',
      daysDelayed: 0,
    };
  }

  // Scenario 3: Active Progress with Positive Velocity
  const estimatedDays = Math.ceil(remainingAyat / dailyVelocityAyat);

  const MAX_DATE_MS = 8640000000000000;
  const rawCompletionTime = refDateObj.getTime() + estimatedDays * 86400000;
  const isDateOverflow =
    isNaN(rawCompletionTime) || rawCompletionTime > MAX_DATE_MS || estimatedDays > 3650000;
  const completionTime = isDateOverflow ? MAX_DATE_MS : rawCompletionTime;
  const estimatedCompletionDate = new Date(completionTime);

  const hasDeadline =
    targetDeadline !== null && targetDeadline !== undefined && targetDeadline !== '';
  let deadlineDate: Date | null = null;
  if (hasDeadline) {
    const d = new Date(targetDeadline!);
    if (!isNaN(d.getTime())) {
      deadlineDate = d;
    }
  }

  if (deadlineDate) {
    const diffMs = estimatedCompletionDate.getTime() - deadlineDate.getTime();
    const daysDelayed = diffMs > 0 ? Math.ceil(diffMs / 86400000) : 0;
    const riskStatus: RiskStatus = daysDelayed > 0 || isDateOverflow ? 'AT_RISK' : 'ON_TRACK';

    return {
      remainingAyat,
      estimatedDays,
      estimatedCompletionDate,
      riskStatus,
      daysDelayed,
    };
  }

  const riskStatus: RiskStatus = isDateOverflow ? 'AT_RISK' : 'ON_TRACK';
  const daysDelayed = isDateOverflow ? estimatedDays : 0;

  return {
    remainingAyat,
    estimatedDays,
    estimatedCompletionDate,
    riskStatus,
    daysDelayed,
  };
}

