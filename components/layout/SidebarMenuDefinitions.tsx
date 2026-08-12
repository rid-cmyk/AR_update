import React from "react";
import type { MenuProps } from "antd";
import {
  BookOutlined,
  CalendarOutlined,
  AimOutlined,
  FileDoneOutlined,
  BarChartOutlined,
  ProfileOutlined,
  SettingFilled,
  UserOutlined,
  CheckCircleOutlined,
  NotificationOutlined,
  TeamOutlined,
  TrophyOutlined,
  FileTextOutlined,
  HomeOutlined,
  DatabaseOutlined,
  LockOutlined,
} from "@ant-design/icons";

const itemStyle: React.CSSProperties = { margin: "4px 8px", borderRadius: 8 };

export const getOrtuMenu = (navigate: (path: string) => void): MenuProps["items"] => [
  {
    key: "ortu-1",
    icon: <HomeOutlined className="text-base" />,
    label: "Dashboard Anak",
    onClick: () => navigate("/ortu/dashboard"),
    style: itemStyle,
  },
  {
    key: "ortu-2",
    icon: <BookOutlined className="text-base" />,
    label: "Progres Hafalan",
    onClick: () => navigate("/ortu/hafalan"),
    style: itemStyle,
  },
  {
    key: "ortu-3",
    icon: <CheckCircleOutlined className="text-base" />,
    label: "Absensi Anak",
    onClick: () => navigate("/ortu/absensi"),
    style: itemStyle,
  },
  {
    key: "ortu-4",
    icon: <AimOutlined className="text-base" />,
    label: "Target Hafalan",
    onClick: () => navigate("/ortu/target"),
    style: itemStyle,
  },
  {
    key: "ortu-5",
    icon: <FileDoneOutlined className="text-base" />,
    label: "Raport & Prestasi",
    onClick: () => navigate("/ortu/raport"),
    style: itemStyle,
  },
  {
    key: "ortu-6",
    icon: <NotificationOutlined className="text-base" />,
    label: "Notifikasi",
    onClick: () => navigate("/ortu/notifikasi"),
    style: itemStyle,
  },
  {
    key: "ortu-7",
    icon: <FileTextOutlined className="text-base" />,
    label: "Pengumuman",
    onClick: () => navigate("/ortu/pengumuman"),
    style: itemStyle,
  },
];

export const getYayasanMenu = (navigate: (path: string) => void): MenuProps["items"] => [
  {
    key: "yayasan-1",
    icon: <HomeOutlined className="text-base" />,
    label: "Dashboard",
    onClick: () => navigate("/yayasan/dashboard"),
    style: itemStyle,
  },
  {
    key: "yayasan-2",
    icon: <BookOutlined className="text-base" />,
    label: "Laporan",
    onClick: () => navigate("/yayasan/laporan"),
    style: itemStyle,
  },
  {
    key: "yayasan-3",
    icon: <TeamOutlined className="text-base" />,
    label: "Data Santri",
    onClick: () => navigate("/yayasan/santri"),
    style: itemStyle,
  },
  {
    key: "yayasan-4",
    icon: <FileDoneOutlined className="text-base" />,
    label: "Raport Tahfidz",
    onClick: () => navigate("/yayasan/raport"),
    style: itemStyle,
  },
  {
    key: "yayasan-5",
    icon: <NotificationOutlined className="text-base" />,
    label: "Notifikasi",
    onClick: () => navigate("/yayasan/notifikasi"),
    style: itemStyle,
  },
];

export const getSantriMenu = (navigate: (path: string) => void): MenuProps["items"] => [
  {
    key: "santri-1",
    icon: <HomeOutlined className="text-base" />,
    label: "Dashboard",
    onClick: () => navigate("/santri/dashboard"),
    style: itemStyle,
  },
  {
    key: "santri-2",
    icon: <BookOutlined className="text-base" />,
    label: "Hafalan Saya",
    onClick: () => navigate("/santri/hafalan"),
    style: itemStyle,
  },
  {
    key: "santri-3",
    icon: <CalendarOutlined className="text-base" />,
    label: "Absensi Saya",
    onClick: () => navigate("/santri/absensi"),
    style: itemStyle,
  },
  {
    key: "santri-4",
    icon: <FileDoneOutlined className="text-base" />,
    label: "Raport Saya",
    onClick: () => navigate("/santri/raport"),
    style: itemStyle,
  },
  {
    key: "santri-5",
    icon: <CalendarOutlined className="text-base" />,
    label: "Jadwal",
    onClick: () => navigate("/santri/jadwal"),
    style: itemStyle,
  },
  {
    key: "santri-6",
    icon: <BarChartOutlined className="text-base" />,
    label: "Progress Juz",
    onClick: () => navigate("/santri/progress-juz"),
    style: itemStyle,
  },
];

export const getGuruMenu = (navigate: (path: string) => void): MenuProps["items"] => [
  {
    key: "guru-1",
    icon: <HomeOutlined className="text-base" />,
    label: "Dashboard",
    onClick: () => navigate("/guru/dashboard"),
    style: itemStyle,
  },
  {
    key: "guru-2",
    icon: <BookOutlined className="text-base" />,
    label: "Data Hafalan",
    onClick: () => navigate("/guru/hafalan"),
    style: itemStyle,
  },
  {
    key: "guru-3",
    icon: <AimOutlined className="text-base" />,
    label: "Target Hafalan",
    onClick: () => navigate("/guru/target"),
    style: itemStyle,
  },
  {
    key: "guru-4",
    icon: <CheckCircleOutlined className="text-base" />,
    label: "Absensi",
    onClick: () => navigate("/guru/absensi"),
    style: itemStyle,
  },
  {
    key: "guru-5",
    icon: <FileDoneOutlined className="text-base" />,
    label: "Penilaian Ujian",
    onClick: () => navigate("/guru/ujian"),
    style: itemStyle,
  },
  {
    key: "guru-6",
    icon: <CalendarOutlined className="text-base" />,
    label: "Jadwal Mengajar",
    onClick: () => navigate("/guru/jadwal"),
    style: itemStyle,
  },
  {
    key: "guru-7",
    icon: <TrophyOutlined className="text-base" />,
    label: "Prestasi Santri",
    onClick: () => navigate("/guru/prestasi"),
    style: itemStyle,
  },
  {
    key: "guru-9",
    icon: <BarChartOutlined className="text-base" />,
    label: "Grafik Progress",
    onClick: () => navigate("/guru/grafik"),
    style: itemStyle,
  },
  {
    key: "guru-10",
    icon: <ProfileOutlined className="text-base" />,
    label: "Raport Hafalan",
    onClick: () => navigate("/guru/raport"),
    style: itemStyle,
  },
  {
    key: "guru-11",
    icon: <FileTextOutlined className="text-base" />,
    label: "Laporan",
    onClick: () => navigate("/guru/laporan"),
    style: itemStyle,
  },
  {
    key: "guru-12",
    icon: <NotificationOutlined className="text-base" />,
    label: "Pengumuman",
    onClick: () => navigate("/guru/pengumuman"),
    style: itemStyle,
  },
];

export const getAdminMenu = (navigate: (path: string) => void): MenuProps["items"] => [
  {
    key: "admin-1",
    icon: <HomeOutlined className="text-base" />,
    label: "Dashboard",
    onClick: () => navigate("/admin/dashboard"),
    style: itemStyle,
  },
  {
    key: "admin-2",
    icon: <TeamOutlined className="text-base" />,
    label: "Kelola Halaqah",
    onClick: () => navigate("/admin/halaqah"),
    style: itemStyle,
  },
  {
    key: "admin-3",
    icon: <CalendarOutlined className="text-base" />,
    label: "Jadwal Kegiatan",
    onClick: () => navigate("/admin/jadwal"),
    style: itemStyle,
  },
  {
    key: "admin-4",
    icon: <NotificationOutlined className="text-base" />,
    label: "Pengumuman",
    onClick: () => navigate("/admin/pengumuman"),
    style: itemStyle,
  },
  {
    key: "admin-5",
    icon: <FileTextOutlined className="text-base" />,
    label: "Template System",
    style: itemStyle,
    children: [
      {
        key: "admin-5-1",
        label: "Tahun Akademik",
        onClick: () => navigate("/admin/template/tahun-akademik"),
        style: itemStyle,
      },
      {
        key: "admin-5-2",
        label: "Jenis Ujian",
        onClick: () => navigate("/admin/template/jenis-ujian"),
        style: itemStyle,
      },
      {
        key: "admin-5-3",
        label: "Template Raport",
        onClick: () => navigate("/admin/template/raport"),
        style: itemStyle,
      },
    ],
  },
  {
    key: "admin-6",
    icon: <BarChartOutlined className="text-base" />,
    label: "Laporan & Analisis",
    onClick: () => navigate("/admin/laporan"),
    style: itemStyle,
  },
  {
    key: "admin-7",
    icon: <SettingFilled className="text-base" />,
    label: "Pengaturan",
    style: itemStyle,
    children: [
      {
        key: "admin-7-1",
        label: "Umum",
        onClick: () => navigate("/admin/settings/general"),
        style: itemStyle,
      },
      {
        key: "admin-7-2",
        label: "Keamanan",
        onClick: () => navigate("/admin/settings/security"),
        style: itemStyle,
      },
      {
        key: "admin-7-3",
        label: "Sistem",
        onClick: () => navigate("/admin/settings/system"),
        style: itemStyle,
      },
      {
        key: "admin-7-4",
        label: "Notifikasi",
        onClick: () => navigate("/admin/settings/notifications"),
        style: itemStyle,
      },
      {
        key: "admin-7-5",
        label: "Backup",
        onClick: () => navigate("/admin/settings/backup"),
        style: itemStyle,
      },
    ],
  },
  {
    key: "admin-8",
    icon: <LockOutlined className="text-base" />,
    label: "Izin Guru",
    onClick: () => navigate("/admin/guru-permissions"),
    style: itemStyle,
  },
];

export const getSuperAdminMenu = (
  navigate: (path: string) => void
): MenuProps["items"] => [
  {
    key: "super-1",
    icon: <HomeOutlined className="text-base" />,
    label: "Dashboard",
    onClick: () => navigate("/super-admin/dashboard"),
    style: itemStyle,
  },
  {
    key: "super-2",
    icon: <UserOutlined className="text-base" />,
    label: "User Management",
    onClick: () => navigate("/super-admin/users"),
    style: itemStyle,
  },
  {
    key: "super-4",
    icon: <DatabaseOutlined className="text-base" />,
    label: "Database Backup",
    onClick: () => navigate("/super-admin/settings/backup-database"),
    style: itemStyle,
  },
];
