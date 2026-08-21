import React from "react";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import {
  HomeOutlined,
  HomeFilled,
  CheckSquareOutlined,
  CheckSquareFilled,
  BookOutlined,
  BookFilled,
  CalendarOutlined,
  CalendarFilled,
  UserOutlined,
  TrophyOutlined,
  TrophyFilled,
  TeamOutlined,
  FileTextOutlined,
  FileTextFilled,
} from "@ant-design/icons";

export interface MobileNavItem {
  key: string;
  label: string;
  href: string;
  icon: ReactNode;
  activeIcon: ReactNode;
}

export interface MobileNavConfig {
  items: MobileNavItem[];
  activeColor: string;
  dotColor: string;
}

const NAV_CONFIGS: Record<string, MobileNavConfig> = {
  guru: {
    items: [
      {
        key: "dashboard",
        label: "Beranda",
        href: "/m/guru/dashboard",
        icon: <HomeOutlined className="text-lg" />,
        activeIcon: <HomeFilled className="text-lg text-blue-green" />,
      },
      {
        key: "ujian",
        label: "Ujian",
        href: "/m/guru/ujian",
        icon: <TrophyOutlined className="text-lg" />,
        activeIcon: <TrophyFilled className="text-lg text-blue-green" />,
      },
      {
        key: "profil",
        label: "Profil",
        href: "/m/guru/profil",
        icon: <UserOutlined className="text-lg" />,
        activeIcon: <UserOutlined className="text-lg text-blue-green font-bold" />,
      },
    ],
    activeColor: "text-blue-green font-semibold",
    dotColor: "bg-blue-green",
  },
  santri: {
    items: [
      {
        key: "dashboard",
        label: "Beranda",
        href: "/m/santri/dashboard",
        icon: <HomeOutlined className="text-xl" />,
        activeIcon: <HomeFilled className="text-xl text-blue-green" />,
      },
      {
        key: "hafalan",
        label: "Hafalan",
        href: "/m/santri/hafalan",
        icon: <BookOutlined className="text-xl" />,
        activeIcon: <BookFilled className="text-xl text-blue-green" />,
      },
      {
        key: "absensi",
        label: "Absensi",
        href: "/m/santri/absensi",
        icon: <CheckSquareOutlined className="text-xl" />,
        activeIcon: <CheckSquareFilled className="text-xl text-blue-green" />,
      },
      {
        key: "raport",
        label: "Rapor",
        href: "/m/santri/raport",
        icon: <TrophyOutlined className="text-xl" />,
        activeIcon: <TrophyFilled className="text-xl text-blue-green" />,
      },
      {
        key: "profil",
        label: "Profil",
        href: "/m/santri/profil",
        icon: <UserOutlined className="text-xl" />,
        activeIcon: <UserOutlined className="text-xl text-blue-green font-bold" />,
      },
    ],
    activeColor: "text-blue-green font-semibold",
    dotColor: "bg-blue-green",
  },
  ortu: {
    items: [
      {
        key: "dashboard",
        label: "Beranda",
        href: "/m/ortu/dashboard",
        icon: <HomeOutlined className="text-xl" />,
        activeIcon: <HomeFilled className="text-xl text-blue-green" />,
      },
      {
        key: "hafalan",
        label: "Hafalan",
        href: "/m/ortu/hafalan",
        icon: <BookOutlined className="text-xl" />,
        activeIcon: <BookFilled className="text-xl text-blue-green" />,
      },
      {
        key: "absensi",
        label: "Absensi",
        href: "/m/ortu/absensi",
        icon: <CheckSquareOutlined className="text-xl" />,
        activeIcon: <CheckSquareFilled className="text-xl text-blue-green" />,
      },
      {
        key: "raport",
        label: "Rapor",
        href: "/m/ortu/raport",
        icon: <TrophyOutlined className="text-xl" />,
        activeIcon: <TrophyFilled className="text-xl text-blue-green" />,
      },
      {
        key: "profil",
        label: "Profil",
        href: "/m/ortu/profil",
        icon: <UserOutlined className="text-xl" />,
        activeIcon: <UserOutlined className="text-xl text-blue-green font-bold" />,
      },
    ],
    activeColor: "text-blue-green font-semibold",
    dotColor: "bg-blue-green",
  },
  yayasan: {
    items: [
      {
        key: "dashboard",
        label: "Beranda",
        href: "/m/yayasan/dashboard",
        icon: <HomeOutlined className="text-xl" />,
        activeIcon: <HomeFilled className="text-xl text-blue-green" />,
      },
      {
        key: "laporan",
        label: "Laporan",
        href: "/m/yayasan/laporan",
        icon: <FileTextOutlined className="text-xl" />,
        activeIcon: <FileTextFilled className="text-xl text-blue-green" />,
      },
      {
        key: "santri",
        label: "Santri",
        href: "/m/yayasan/santri",
        icon: <TeamOutlined className="text-xl" />,
        activeIcon: <TeamOutlined className="text-xl text-blue-green font-bold" />,
      },
      {
        key: "raport",
        label: "Rapor",
        href: "/m/yayasan/raport",
        icon: <TrophyOutlined className="text-xl" />,
        activeIcon: <TrophyFilled className="text-xl text-blue-green" />,
      },
      {
        key: "profil",
        label: "Profil",
        href: "/m/yayasan/profil",
        icon: <UserOutlined className="text-xl" />,
        activeIcon: <UserOutlined className="text-xl text-blue-green font-bold" />,
      },
    ],
    activeColor: "text-blue-green font-semibold",
    dotColor: "bg-blue-green",
  },
  super_admin: {
    items: [
      {
        key: "dashboard",
        label: "Beranda",
        href: "/m/super-admin/dashboard",
        icon: <HomeOutlined className="text-xl" />,
        activeIcon: <HomeFilled className="text-xl text-blue-green" />,
      },
      {
        key: "santri",
        label: "Santri",
        href: "/m/super-admin/santri",
        icon: <TeamOutlined className="text-xl" />,
        activeIcon: <TeamOutlined className="text-xl text-blue-green font-bold" />,
      },
      {
        key: "hafalan",
        label: "Hafalan",
        href: "/m/super-admin/hafalan",
        icon: <BookOutlined className="text-xl" />,
        activeIcon: <BookFilled className="text-xl text-blue-green" />,
      },
      {
        key: "profil",
        label: "Profil",
        href: "/m/super-admin/profil",
        icon: <UserOutlined className="text-xl" />,
        activeIcon: <UserOutlined className="text-xl text-blue-green font-bold" />,
      },
    ],
    activeColor: "text-blue-green font-semibold",
    dotColor: "bg-blue-green",
  },
};

export const DEFAULT_NAV_CONFIG = NAV_CONFIGS.guru;

export function getMobileNavConfig(role: string): MobileNavConfig {
  return NAV_CONFIGS[role] || DEFAULT_NAV_CONFIG;
}

export function getRoleFromPathname(pathname: string): string {
  const match = pathname.match(/^\/m\/([^/]+)/);
  return match ? match[1] : "guru";
}

export function useMobileNavItems(role?: string): MobileNavConfig {
  const pathname = usePathname() || "";
  const resolvedRole = role || getRoleFromPathname(pathname);
  return getMobileNavConfig(resolvedRole);
}
