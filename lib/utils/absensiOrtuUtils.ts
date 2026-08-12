import dayjs, { Dayjs } from "dayjs";

export interface AbsensiData {
  id: number;
  status: string;
  tanggal: string;
  catatan?: string;
  santri: {
    namaLengkap: string;
    username: string;
  };
  jadwal: {
    halaqah: {
      namaHalaqah: string;
    };
  };
}

export interface ChildAttendanceStats {
  namaLengkap: string;
  totalKehadiran: number;
  totalIzin: number;
  totalAlpha: number;
  totalSakit: number;
  totalAbsensi: number;
  persentaseKehadiran: number;
  persentaseAlpha: number;
  streakHadir: number;
  bulanIni: {
    hadir: number;
    izin: number;
    alpha: number;
    sakit: number;
  };
  semesterIni: {
    hadir: number;
    izin: number;
    alpha: number;
    sakit: number;
  };
}

export interface OrtuChildRef {
  id: number;
  namaLengkap: string;
  username: string;
}

const isHadir = (status: string) => status === "masuk" || status === "hadir";

export function computeStatusCounts(absensiList: { status: string }[]) {
  const totalAbsensi = absensiList.length;
  return {
    totalAbsensi,
    totalKehadiran: absensiList.filter(a => isHadir(a.status)).length,
    totalIzin: absensiList.filter(a => a.status === "izin").length,
    totalAlpha: absensiList.filter(a => a.status === "alpha").length,
    totalSakit: absensiList.filter(a => a.status === "sakit").length,
  };
}

export function computeStreakHadir(absensiList: { tanggal: string; status: string }[]): number {
  const sorted = [...absensiList]
    .sort((a, b) => dayjs(b.tanggal).unix() - dayjs(a.tanggal).unix());
  let streak = 0;
  for (const item of sorted) {
    if (isHadir(item.status)) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

function toBulanSakit(counts: ReturnType<typeof computeStatusCounts>) {
  return {
    hadir: counts.totalKehadiran,
    izin: counts.totalIzin,
    alpha: counts.totalAlpha,
    sakit: counts.totalSakit,
  };
}

export function transformAnakAbsensi(anak: any): {
  data: { absensi: AbsensiData[]; stats: ChildAttendanceStats[] };
  child?: OrtuChildRef;
} {
  const absensi: AbsensiData[] = [];
  (anak.Absensi || []).forEach((item: any) => {
    absensi.push({
      id: item.id,
      status: item.status,
      tanggal: item.tanggal,
      catatan: item.catatan,
      santri: {
        namaLengkap: anak.namaLengkap,
        username: anak.username,
      },
      jadwal: item.jadwal,
    });
  });

  const absensiList = anak.Absensi || [];
  const counts = computeStatusCounts(absensiList);
  const persentaseKehadiran = counts.totalAbsensi > 0
    ? Math.round((counts.totalKehadiran / counts.totalAbsensi) * 100)
    : 0;
  const persentaseAlpha = counts.totalAbsensi > 0
    ? Math.round((counts.totalAlpha / counts.totalAbsensi) * 100)
    : 0;

  const currentMonth = dayjs();
  const bulanIniData = absensiList.filter((a: any) =>
    dayjs(a.tanggal).isSame(currentMonth, "month")
  );
  const semesterStart = dayjs().subtract(6, "month");
  const semesterData = absensiList.filter((a: any) =>
    dayjs(a.tanggal).isAfter(semesterStart)
  );

  return {
    data: {
      absensi,
      stats: [
        {
          namaLengkap: anak.namaLengkap,
          ...counts,
          persentaseKehadiran,
          persentaseAlpha,
          streakHadir: computeStreakHadir(absensiList),
          bulanIni: toBulanSakit(computeStatusCounts(bulanIniData)),
          semesterIni: toBulanSakit(computeStatusCounts(semesterData)),
        },
      ],
    },
    child: { id: anak.id, namaLengkap: anak.namaLengkap, username: anak.username },
  };
}

export function computeFilteredStats(
  childStats: ChildAttendanceStats[],
  absensiData: AbsensiData[],
  selectedChild: string,
  selectedMonth: Dayjs
): ChildAttendanceStats[] {
  return childStats
    .filter(child => !selectedChild || child.namaLengkap === selectedChild)
    .map(child => {
      const childAbsensiData = absensiData.filter(item =>
        item.santri.namaLengkap === child.namaLengkap &&
        dayjs(item.tanggal).isSame(selectedMonth, "month")
      );

      const counts = computeStatusCounts(childAbsensiData);
      const persentaseKehadiran = counts.totalAbsensi > 0
        ? Math.round((counts.totalKehadiran / counts.totalAbsensi) * 100)
        : 0;
      const persentaseAlpha = counts.totalAbsensi > 0
        ? Math.round((counts.totalAlpha / counts.totalAbsensi) * 100)
        : 0;

      return {
        namaLengkap: child.namaLengkap,
        ...counts,
        persentaseKehadiran,
        persentaseAlpha,
        streakHadir: computeStreakHadir(childAbsensiData),
        bulanIni: child.bulanIni,
        semesterIni: child.semesterIni,
      };
    });
}
