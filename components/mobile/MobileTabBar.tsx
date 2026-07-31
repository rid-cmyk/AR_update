"use client";

import React from "react";
import Link from "next/link";
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

interface NavItem {
  key: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  activeIcon: React.ReactNode;
}

function MobileTabBarComponent() {
  const pathname = usePathname() || "";

  const guruNavItems: NavItem[] = [
    {
      key: "dashboard",
      label: "Beranda",
      href: "/m/guru/dashboard",
      icon: <HomeOutlined className="text-xl" />,
      activeIcon: <HomeFilled className="text-xl text-blue-500" />,
    },
    {
      key: "absensi",
      label: "Absensi",
      href: "/m/guru/absensi",
      icon: <CheckSquareOutlined className="text-xl" />,
      activeIcon: <CheckSquareFilled className="text-xl text-blue-500" />,
    },
    {
      key: "hafalan",
      label: "Hafalan",
      href: "/m/guru/hafalan",
      icon: <BookOutlined className="text-xl" />,
      activeIcon: <BookFilled className="text-xl text-blue-500" />,
    },
    {
      key: "jadwal",
      label: "Jadwal",
      href: "/m/guru/jadwal",
      icon: <CalendarOutlined className="text-xl" />,
      activeIcon: <CalendarFilled className="text-xl text-blue-500" />,
    },
    {
      key: "profil",
      label: "Profil",
      href: "/m/guru/profil",
      icon: <UserOutlined className="text-xl" />,
      activeIcon: <UserOutlined className="text-xl text-blue-500 font-bold" />,
    },
  ];

  const santriNavItems: NavItem[] = [
    {
      key: "dashboard",
      label: "Beranda",
      href: "/m/santri/dashboard",
      icon: <HomeOutlined className="text-xl" />,
      activeIcon: <HomeFilled className="text-xl text-emerald-500" />,
    },
    {
      key: "hafalan",
      label: "Hafalan",
      href: "/m/santri/hafalan",
      icon: <BookOutlined className="text-xl" />,
      activeIcon: <BookFilled className="text-xl text-emerald-500" />,
    },
    {
      key: "absensi",
      label: "Absensi",
      href: "/m/santri/absensi",
      icon: <CheckSquareOutlined className="text-xl" />,
      activeIcon: <CheckSquareFilled className="text-xl text-emerald-500" />,
    },
    {
      key: "raport",
      label: "Rapor",
      href: "/m/santri/raport",
      icon: <TrophyOutlined className="text-xl" />,
      activeIcon: <TrophyFilled className="text-xl text-emerald-500" />,
    },
    {
      key: "profil",
      label: "Profil",
      href: "/m/santri/profil",
      icon: <UserOutlined className="text-xl" />,
      activeIcon: <UserOutlined className="text-xl text-emerald-500 font-bold" />,
    },
  ];

  const ortuNavItems: NavItem[] = [
    {
      key: "dashboard",
      label: "Beranda",
      href: "/m/ortu/dashboard",
      icon: <HomeOutlined className="text-xl" />,
      activeIcon: <HomeFilled className="text-xl text-amber-500" />,
    },
    {
      key: "hafalan",
      label: "Hafalan",
      href: "/m/ortu/hafalan",
      icon: <BookOutlined className="text-xl" />,
      activeIcon: <BookFilled className="text-xl text-amber-500" />,
    },
    {
      key: "absensi",
      label: "Absensi",
      href: "/m/ortu/absensi",
      icon: <CheckSquareOutlined className="text-xl" />,
      activeIcon: <CheckSquareFilled className="text-xl text-amber-500" />,
    },
    {
      key: "raport",
      label: "Rapor",
      href: "/m/ortu/raport",
      icon: <TrophyOutlined className="text-xl" />,
      activeIcon: <TrophyFilled className="text-xl text-amber-500" />,
    },
    {
      key: "profil",
      label: "Profil",
      href: "/m/ortu/profil",
      icon: <UserOutlined className="text-xl" />,
      activeIcon: <UserOutlined className="text-xl text-amber-500 font-bold" />,
    },
  ];

  const yayasanNavItems: NavItem[] = [
    {
      key: "dashboard",
      label: "Beranda",
      href: "/m/yayasan/dashboard",
      icon: <HomeOutlined className="text-xl" />,
      activeIcon: <HomeFilled className="text-xl text-purple-500" />,
    },
    {
      key: "laporan",
      label: "Laporan",
      href: "/m/yayasan/laporan",
      icon: <FileTextOutlined className="text-xl" />,
      activeIcon: <FileTextFilled className="text-xl text-purple-500" />,
    },
    {
      key: "santri",
      label: "Santri",
      href: "/m/yayasan/santri",
      icon: <TeamOutlined className="text-xl" />,
      activeIcon: <TeamOutlined className="text-xl text-purple-500 font-bold" />,
    },
    {
      key: "raport",
      label: "Rapor",
      href: "/m/yayasan/raport",
      icon: <TrophyOutlined className="text-xl" />,
      activeIcon: <TrophyFilled className="text-xl text-purple-500" />,
    },
    {
      key: "profil",
      label: "Profil",
      href: "/m/yayasan/profil",
      icon: <UserOutlined className="text-xl" />,
      activeIcon: <UserOutlined className="text-xl text-purple-500 font-bold" />,
    },
  ];

  const adminNavItems: NavItem[] = [
    {
      key: "dashboard",
      label: "Beranda",
      href: "/m/admin/dashboard",
      icon: <HomeOutlined className="text-xl" />,
      activeIcon: <HomeFilled className="text-xl text-sky-500" />,
    },
    {
      key: "santri",
      label: "Santri",
      href: "/m/admin/santri",
      icon: <TeamOutlined className="text-xl" />,
      activeIcon: <TeamOutlined className="text-xl text-sky-500 font-bold" />,
    },
    {
      key: "hafalan",
      label: "Hafalan",
      href: "/m/admin/hafalan",
      icon: <BookOutlined className="text-xl" />,
      activeIcon: <BookFilled className="text-xl text-sky-500" />,
    },
    {
      key: "profil",
      label: "Profil",
      href: "/m/admin/profil",
      icon: <UserOutlined className="text-xl" />,
      activeIcon: <UserOutlined className="text-xl text-sky-500 font-bold" />,
    },
  ];

  const superAdminNavItems: NavItem[] = [
    {
      key: "dashboard",
      label: "Beranda",
      href: "/m/super-admin/dashboard",
      icon: <HomeOutlined className="text-xl" />,
      activeIcon: <HomeFilled className="text-xl text-indigo-500" />,
    },
    {
      key: "users",
      label: "Pengguna",
      href: "/m/super-admin/users",
      icon: <TeamOutlined className="text-xl" />,
      activeIcon: <TeamOutlined className="text-xl text-indigo-500 font-bold" />,
    },
    {
      key: "profil",
      label: "Profil",
      href: "/m/super-admin/profil",
      icon: <UserOutlined className="text-xl" />,
      activeIcon: <UserOutlined className="text-xl text-indigo-500 font-bold" />,
    },
  ];

  // Tentukan daftar menu dan warna aktif berdasarkan prefix URL
  const getNavConfig = () => {
    if (pathname.startsWith("/m/santri")) {
      return { items: santriNavItems, activeColor: "text-emerald-400 font-semibold", dotColor: "bg-emerald-400" };
    }
    if (pathname.startsWith("/m/ortu")) {
      return { items: ortuNavItems, activeColor: "text-amber-400 font-semibold", dotColor: "bg-amber-400" };
    }
    if (pathname.startsWith("/m/yayasan")) {
      return { items: yayasanNavItems, activeColor: "text-purple-400 font-semibold", dotColor: "bg-purple-400" };
    }
    if (pathname.startsWith("/m/admin")) {
      return { items: adminNavItems, activeColor: "text-sky-400 font-semibold", dotColor: "bg-sky-400" };
    }
    if (pathname.startsWith("/m/super-admin")) {
      return { items: superAdminNavItems, activeColor: "text-indigo-400 font-semibold", dotColor: "bg-indigo-400" };
    }
    return { items: guruNavItems, activeColor: "text-blue-500 font-semibold", dotColor: "bg-blue-500" };
  };

  const { items: currentNavItems, activeColor, dotColor } = getNavConfig();

  const isCurrentActive = (itemHref: string) => {
    if (pathname === itemHref) return true;
    // Cek apakah pathname dimulai dengan href (kecuali dashboard agar tidak me-match semua)
    if (!itemHref.endsWith("/dashboard") && pathname.startsWith(itemHref)) {
      return true;
    }
    return false;
  };

  return (
    <nav className="fixed bottom-4 left-4 right-4 z-40 bg-slate-900/85 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl gpu-layer">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {currentNavItems.map((item) => {
          const active = isCurrentActive(item.href);
          return (
            <Link
              key={item.key}
              href={item.href}
              prefetch={true}
              className={`flex flex-col items-center justify-center flex-1 py-1.5 transition-all tap-active tap-instant ${
                active ? activeColor : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <div className="relative mb-1">
                {active ? item.activeIcon : item.icon}
                {active && (
                  <span
                    className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full ${dotColor} shadow-sm`}
                  />
                )}
              </div>
              <span className="text-[11px] tracking-tight font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default React.memo(MobileTabBarComponent);

