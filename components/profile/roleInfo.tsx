import React, { ReactNode } from 'react';
import {
  UserOutlined,
  TeamOutlined,
  BookOutlined,
  HomeOutlined,
  IdcardOutlined,
} from '@ant-design/icons';

export interface RoleInfo {
  title: string;
  description: string;
  color: string;
  icon: ReactNode;
  permissions: string[];
}

const ROLE_CONFIG: Record<string, RoleInfo> = {
  super_admin: {
    title: 'Super Administrator',
    description: 'Akses penuh ke seluruh sistem AR-Hafalan',
    color: '#8ecae6',
    icon: <IdcardOutlined />,
    permissions: ['Kelola semua user', 'Backup database', 'System monitoring', 'Reset password'],
  },
  admin: {
    title: 'Administrator',
    description: 'Mengelola sistem pesantren dan data santri',
    color: '#219ebc',
    icon: <TeamOutlined />,
    permissions: ['Kelola halaqah', 'Template ujian', 'Generate raport', 'Verifikasi ujian'],
  },
  guru: {
    title: 'Guru/Ustadz',
    description: 'Mengajar dan menilai hafalan santri',
    color: '#219ebc',
    icon: <BookOutlined />,
    permissions: ['Penilaian ujian', 'Data hafalan', 'Target hafalan', 'Absensi santri'],
  },
  santri: {
    title: 'Santri',
    description: 'Siswa pesantren yang menghafal Al-Quran',
    color: '#13c2c2',
    icon: <UserOutlined />,
    permissions: ['Lihat hafalan', 'Lihat raport', 'Absensi', 'Notifikasi'],
  },
  ortu: {
    title: 'Orang Tua',
    description: 'Memantau perkembangan hafalan anak',
    color: '#ffb703',
    icon: <HomeOutlined />,
    permissions: ['Monitor anak', 'Lihat raport', 'Progres hafalan', 'Komunikasi guru'],
  },
  yayasan: {
    title: 'Yayasan',
    description: 'Mengawasi operasional pesantren',
    color: '#eb2f96',
    icon: <TeamOutlined />,
    permissions: ['Laporan hafalan', 'Grafik progress', 'Monitor aktivitas', 'Rekap absensi'],
  },
};

export function getRoleInfo(userRole: string): RoleInfo {
  return ROLE_CONFIG[userRole.toLowerCase()] || ROLE_CONFIG.santri;
}

export function canEditSelfPasscode(userRole: string): boolean {
  return ['super_admin', 'admin'].includes(userRole.toLowerCase());
}

export function canEditPhoto(userRole: string): boolean {
  return userRole.toLowerCase() !== 'santri';
}
