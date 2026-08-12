import { TargetDetail, OverviewStats } from "@/components/guru/dashboard/guruDashboardTypes";

export function computeAbsensiPieData(absensiHadir: number, absensiTidakHadir: number) {
  return [
    { name: 'Hadir', value: absensiHadir, color: '#219ebc' },
    { name: 'Tidak Hadir', value: absensiTidakHadir, color: '#fb8500' },
  ];
}

export function computePerfBarData(overview: OverviewStats) {
  return [
    { name: 'Hafalan Rate', value: overview.hafalanRate, fill: '#219ebc' },
    { name: 'Absensi Rate', value: overview.absensiRate, fill: '#219ebc' },
    {
      name: 'Target Selesai',
      value: Math.min(100 - Math.round((overview.targetTertunda / Math.max(overview.totalSantri, 1)) * 100), 100),
      fill: '#8ecae6',
    },
    {
      name: 'Aktifitas Hari Ini',
      value: Math.min(Math.round((overview.totalHafalanToday / Math.max(overview.totalSantri, 1)) * 100), 100),
      fill: '#ffb703',
    },
  ];
}

export function getTargetMeta(deadline: string) {
  const date = new Date(deadline);
  const isOverdue = date < new Date();
  const deadlineStr = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  return { isOverdue, deadlineStr };
}

export function filterActiveTargets(targets: TargetDetail[]) {
  return (targets || []).filter((t) => t.status !== 'selesai');
}

export function filterCompletedTargets(targets: TargetDetail[]) {
  return (targets || []).filter((t) => t.status === 'selesai');
}
