import React from "react";
import Link from "next/link";
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
  LockOutlined,
} from "@ant-design/icons";

const itemStyle: React.CSSProperties = { margin: "4px 8px", borderRadius: 8 };

export const getOrtuMenu = (navigate: (path: string) => void): MenuProps["items"] => [
  {
    key: "ortu-1",
    icon: <HomeOutlined className="text-base" />,
    label: <Link href="/ortu/dashboard" prefetch={true} className="w-full inline-block">Dashboard Anak</Link>,
    onClick: () => navigate("/ortu/dashboard"),
    style: itemStyle,
  },
  {
    key: "ortu-2",
    icon: <BookOutlined className="text-base" />,
    label: <Link href="/ortu/hafalan" prefetch={true} className="w-full inline-block">Progres Hafalan</Link>,
    onClick: () => navigate("/ortu/hafalan"),
    style: itemStyle,
  },
  {
    key: "ortu-3",
    icon: <CheckCircleOutlined className="text-base" />,
    label: <Link href="/ortu/absensi" prefetch={true} className="w-full inline-block">Absensi Anak</Link>,
    onClick: () => navigate("/ortu/absensi"),
    style: itemStyle,
  },
  {
    key: "ortu-4",
    icon: <AimOutlined className="text-base" />,
    label: <Link href="/ortu/target" prefetch={true} className="w-full inline-block">Target Hafalan</Link>,
    onClick: () => navigate("/ortu/target"),
    style: itemStyle,
  },
  {
    key: "ortu-5",
    icon: <FileDoneOutlined className="text-base" />,
    label: <Link href="/ortu/raport" prefetch={true} className="w-full inline-block">Raport & Prestasi</Link>,
    onClick: () => navigate("/ortu/raport"),
    style: itemStyle,
  },
  {
    key: "ortu-6",
    icon: <NotificationOutlined className="text-base" />,
    label: <Link href="/ortu/notifikasi" prefetch={true} className="w-full inline-block">Notifikasi</Link>,
    onClick: () => navigate("/ortu/notifikasi"),
    style: itemStyle,
  },
  {
    key: "ortu-7",
    icon: <FileTextOutlined className="text-base" />,
    label: <Link href="/ortu/pengumuman" prefetch={true} className="w-full inline-block">Pengumuman</Link>,
    onClick: () => navigate("/ortu/pengumuman"),
    style: itemStyle,
  },
];

export const getYayasanMenu = (navigate: (path: string) => void): MenuProps["items"] => [
  {
    key: "yayasan-1",
    icon: <HomeOutlined className="text-base" />,
    label: <Link href="/yayasan/dashboard" prefetch={true} className="w-full inline-block">Dashboard</Link>,
    onClick: () => navigate("/yayasan/dashboard"),
    style: itemStyle,
  },
  {
    key: "yayasan-2",
    icon: <BookOutlined className="text-base" />,
    label: <Link href="/yayasan/laporan" prefetch={true} className="w-full inline-block">Laporan</Link>,
    onClick: () => navigate("/yayasan/laporan"),
    style: itemStyle,
  },
  {
    key: "yayasan-3",
    icon: <TeamOutlined className="text-base" />,
    label: <Link href="/yayasan/santri" prefetch={true} className="w-full inline-block">Data Santri</Link>,
    onClick: () => navigate("/yayasan/santri"),
    style: itemStyle,
  },
  {
    key: "yayasan-4",
    icon: <FileDoneOutlined className="text-base" />,
    label: <Link href="/yayasan/raport" prefetch={true} className="w-full inline-block">Raport Tahfidz</Link>,
    onClick: () => navigate("/yayasan/raport"),
    style: itemStyle,
  },
  {
    key: "yayasan-5",
    icon: <NotificationOutlined className="text-base" />,
    label: <Link href="/yayasan/notifikasi" prefetch={true} className="w-full inline-block">Notifikasi</Link>,
    onClick: () => navigate("/yayasan/notifikasi"),
    style: itemStyle,
  },
];

export const getSantriMenu = (navigate: (path: string) => void): MenuProps["items"] => [
  {
    key: "santri-1",
    icon: <HomeOutlined className="text-base" />,
    label: <Link href="/santri/dashboard" prefetch={true} className="w-full inline-block">Dashboard</Link>,
    onClick: () => navigate("/santri/dashboard"),
    style: itemStyle,
  },
  {
    key: "santri-2",
    icon: <BookOutlined className="text-base" />,
    label: <Link href="/santri/hafalan" prefetch={true} className="w-full inline-block">Hafalan Saya</Link>,
    onClick: () => navigate("/santri/hafalan"),
    style: itemStyle,
  },
  {
    key: "santri-3",
    icon: <CalendarOutlined className="text-base" />,
    label: <Link href="/santri/absensi" prefetch={true} className="w-full inline-block">Absensi Saya</Link>,
    onClick: () => navigate("/santri/absensi"),
    style: itemStyle,
  },
  {
    key: "santri-4",
    icon: <FileDoneOutlined className="text-base" />,
    label: <Link href="/santri/raport" prefetch={true} className="w-full inline-block">Raport Saya</Link>,
    onClick: () => navigate("/santri/raport"),
    style: itemStyle,
  },
  {
    key: "santri-5",
    icon: <CalendarOutlined className="text-base" />,
    label: <Link href="/santri/jadwal" prefetch={true} className="w-full inline-block">Jadwal</Link>,
    onClick: () => navigate("/santri/jadwal"),
    style: itemStyle,
  },
  {
    key: "santri-6",
    icon: <BarChartOutlined className="text-base" />,
    label: <Link href="/santri/progress-juz" prefetch={true} className="w-full inline-block">Progress Juz</Link>,
    onClick: () => navigate("/santri/progress-juz"),
    style: itemStyle,
  },
];

export const getGuruMenu = (navigate: (path: string) => void): MenuProps["items"] => [
  {
    key: "guru-1",
    icon: <HomeOutlined className="text-base" />,
    label: <Link href="/guru/dashboard" prefetch={true} className="w-full inline-block">Dashboard</Link>,
    onClick: () => navigate("/guru/dashboard"),
    style: itemStyle,
  },
  {
    key: "guru-2",
    icon: <BookOutlined className="text-base" />,
    label: <Link href="/guru/hafalan" prefetch={true} className="w-full inline-block">Data Hafalan</Link>,
    onClick: () => navigate("/guru/hafalan"),
    style: itemStyle,
  },
  {
    key: "guru-3",
    icon: <AimOutlined className="text-base" />,
    label: <Link href="/guru/target" prefetch={true} className="w-full inline-block">Target Hafalan</Link>,
    onClick: () => navigate("/guru/target"),
    style: itemStyle,
  },
  {
    key: "guru-4",
    icon: <CheckCircleOutlined className="text-base" />,
    label: <Link href="/guru/absensi" prefetch={true} className="w-full inline-block">Absensi</Link>,
    onClick: () => navigate("/guru/absensi"),
    style: itemStyle,
  },
  {
    key: "guru-5",
    icon: <FileDoneOutlined className="text-base" />,
    label: <Link href="/guru/ujian" prefetch={true} className="w-full inline-block">Penilaian Ujian</Link>,
    onClick: () => navigate("/guru/ujian"),
    style: itemStyle,
  },
  {
    key: "guru-6",
    icon: <CalendarOutlined className="text-base" />,
    label: <Link href="/guru/jadwal" prefetch={true} className="w-full inline-block">Jadwal Mengajar</Link>,
    onClick: () => navigate("/guru/jadwal"),
    style: itemStyle,
  },
  {
    key: "guru-7",
    icon: <TrophyOutlined className="text-base" />,
    label: <Link href="/guru/prestasi" prefetch={true} className="w-full inline-block">Prestasi Santri</Link>,
    onClick: () => navigate("/guru/prestasi"),
    style: itemStyle,
  },
  {
    key: "guru-9",
    icon: <BarChartOutlined className="text-base" />,
    label: <Link href="/guru/grafik" prefetch={true} className="w-full inline-block">Grafik Progress</Link>,
    onClick: () => navigate("/guru/grafik"),
    style: itemStyle,
  },
  {
    key: "guru-10",
    icon: <ProfileOutlined className="text-base" />,
    label: <Link href="/guru/raport" prefetch={true} className="w-full inline-block">Raport Hafalan</Link>,
    onClick: () => navigate("/guru/raport"),
    style: itemStyle,
  },
  {
    key: "guru-11",
    icon: <FileTextOutlined className="text-base" />,
    label: <Link href="/guru/laporan" prefetch={true} className="w-full inline-block">Laporan</Link>,
    onClick: () => navigate("/guru/laporan"),
    style: itemStyle,
  },
  {
    key: "guru-12",
    icon: <NotificationOutlined className="text-base" />,
    label: <Link href="/guru/pengumuman" prefetch={true} className="w-full inline-block">Pengumuman</Link>,
    onClick: () => navigate("/guru/pengumuman"),
    style: itemStyle,
  },
];

export const getSuperAdminMenu = (
  navigate: (path: string) => void
): MenuProps["items"] => [
  {
    key: "super-1",
    icon: <HomeOutlined className="text-base" />,
    label: <Link href="/super-admin/dashboard" prefetch={true} className="w-full inline-block">Dashboard</Link>,
    onClick: () => navigate("/super-admin/dashboard"),
    style: itemStyle,
  },
  {
    key: "super-2",
    icon: <UserOutlined className="text-base" />,
    label: <Link href="/super-admin/users" prefetch={true} className="w-full inline-block">User Management</Link>,
    onClick: () => navigate("/super-admin/users"),
    style: itemStyle,
  },
  {
    key: "super-halaqah",
    icon: <TeamOutlined className="text-base" />,
    label: <Link href="/super-admin/halaqah" prefetch={true} className="w-full inline-block">Kelola Halaqah</Link>,
    onClick: () => navigate("/super-admin/halaqah"),
    style: itemStyle,
  },
  {
    key: "super-jadwal",
    icon: <CalendarOutlined className="text-base" />,
    label: <Link href="/super-admin/jadwal" prefetch={true} className="w-full inline-block">Jadwal Kegiatan</Link>,
    onClick: () => navigate("/super-admin/jadwal"),
    style: itemStyle,
  },
  {
    key: "super-pengumuman",
    icon: <NotificationOutlined className="text-base" />,
    label: <Link href="/super-admin/pengumuman" prefetch={true} className="w-full inline-block">Pengumuman</Link>,
    onClick: () => navigate("/super-admin/pengumuman"),
    style: itemStyle,
  },
  {
    key: "super-template",
    icon: <FileTextOutlined className="text-base" />,
    label: "Template System",
    style: itemStyle,
    children: [
      {
        key: "super-template-1",
        label: <Link href="/super-admin/tahun-akademik" prefetch={true} className="w-full inline-block">Tahun Akademik</Link>,
        onClick: () => navigate("/super-admin/tahun-akademik"),
        style: itemStyle,
      },
      {
        key: "super-template-2",
        label: <Link href="/super-admin/jenis-ujian" prefetch={true} className="w-full inline-block">Jenis Ujian</Link>,
        onClick: () => navigate("/super-admin/jenis-ujian"),
        style: itemStyle,
      },
      {
        key: "super-template-3",
        label: <Link href="/super-admin/template-raport" prefetch={true} className="w-full inline-block">Template Raport</Link>,
        onClick: () => navigate("/super-admin/template-raport"),
        style: itemStyle,
      },
      {
        key: "super-template-4",
        label: <Link href="/super-admin/template-ujian" prefetch={true} className="w-full inline-block">Template Ujian</Link>,
        onClick: () => navigate("/super-admin/template-ujian"),
        style: itemStyle,
      },
    ],
  },
  {
    key: "super-laporan",
    icon: <BarChartOutlined className="text-base" />,
    label: <Link href="/super-admin/laporan" prefetch={true} className="w-full inline-block">Laporan & Analisis</Link>,
    onClick: () => navigate("/super-admin/laporan"),
    style: itemStyle,
  },
  {
    key: "super-settings",
    icon: <SettingFilled className="text-base" />,
    label: "Pengaturan",
    style: itemStyle,
    children: [
      {
        key: "super-settings-1",
        label: <Link href="/super-admin/settings/general" prefetch={true} className="w-full inline-block">Umum</Link>,
        onClick: () => navigate("/super-admin/settings/general"),
        style: itemStyle,
      },
      {
        key: "super-settings-2",
        label: <Link href="/super-admin/settings/security" prefetch={true} className="w-full inline-block">Keamanan</Link>,
        onClick: () => navigate("/super-admin/settings/security"),
        style: itemStyle,
      },
      {
        key: "super-settings-3",
        label: <Link href="/super-admin/settings/system" prefetch={true} className="w-full inline-block">Sistem</Link>,
        onClick: () => navigate("/super-admin/settings/system"),
        style: itemStyle,
      },
      {
        key: "super-settings-4",
        label: <Link href="/super-admin/settings/notifications" prefetch={true} className="w-full inline-block">Notifikasi</Link>,
        onClick: () => navigate("/super-admin/settings/notifications"),
        style: itemStyle,
      },
      {
        key: "super-4",
        label: <Link href="/super-admin/settings/backup-database" prefetch={true} className="w-full inline-block">Database Backup</Link>,
        onClick: () => navigate("/super-admin/settings/backup-database"),
        style: itemStyle,
      },
    ],
  },
  {
    key: "super-guru-permissions",
    icon: <LockOutlined className="text-base" />,
    label: <Link href="/super-admin/guru-permissions" prefetch={true} className="w-full inline-block">Izin Guru</Link>,
    onClick: () => navigate("/super-admin/guru-permissions"),
    style: itemStyle,
  },
];
