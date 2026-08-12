export interface TargetDetail {
  id: number;
  surat: string;
  ayatTarget: number;
  deadline: string;
  status: string;
}

export interface SantriHalaqah {
  id: number;
  namaLengkap: string;
  username: string;
  targets: TargetDetail[];
}

export interface JadwalHalaqah {
  id: number;
  hari: string;
  waktuMulai: string;
  waktuSelesai: string;
  materi?: string;
}

export interface HalaqahData {
  id: number;
  namaHalaqah: string;
  deskripsi?: string;
  jumlahSantri: number;
  santri: SantriHalaqah[];
  jadwal?: JadwalHalaqah[];
}

export interface DashboardData {
  halaqah: HalaqahData[];
  totalHalaqah: number;
  totalSantri: number;
}

export interface OverviewStats {
  totalSantri: number;
  totalHafalanToday: number;
  absensiRate: number;
  targetTertunda: number;
  absensiHadir: number;
  absensiTidakHadir: number;
  hafalanRate: number;
}
