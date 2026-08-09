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
      icon: <HomeOutlined className="text-lg" />,
      activeIcon: <HomeFilled className="text-lg text-brand-teal" />,
    },
    {
      key: "absensi",
      label: "Absensi",
      href: "/m/guru/absensi",
      icon: <CheckSquareOutlined className="text-lg" />,
      activeIcon: <CheckSquareFilled className="text-lg text-brand-teal" />,
    },
    {
      key: "hafalan",
      label: "Hafalan",
      href: "/m/guru/hafalan",
      icon: <BookOutlined className="text-lg" />,
      activeIcon: <BookFilled className="text-lg text-brand-teal" />,
    },
    {
      key: "ujian",
      label: "Ujian",
      href: "/m/guru/ujian",
      icon: <TrophyOutlined className="text-lg" />,
      activeIcon: <TrophyFilled className="text-lg text-brand-teal" />,
    },
    {
      key: "profil",
      label: "Profil",
      href: "/m/guru/profil",
      icon: <UserOutlined className="text-lg" />,
      activeIcon: <UserOutlined className="text-lg text-brand-teal font-bold" />,
    },
  ];

  const santriNavItems: NavItem[] = [
    {
      key: "dashboard",
      label: "Beranda",
      href: "/m/santri/dashboard",
      icon: <HomeOutlined className="text-xl" />,
      activeIcon: <HomeFilled className="text-xl text-brand-teal" />,
    },
    {
      key: "hafalan",
      label: "Hafalan",
      href: "/m/santri/hafalan",
      icon: <BookOutlined className="text-xl" />,
      activeIcon: <BookFilled className="text-xl text-brand-teal" />,
    },
    {
      key: "absensi",
      label: "Absensi",
      href: "/m/santri/absensi",
      icon: <CheckSquareOutlined className="text-xl" />,
      activeIcon: <CheckSquareFilled className="text-xl text-brand-teal" />,
    },
    {
      key: "raport",
      label: "Rapor",
      href: "/m/santri/raport",
      icon: <TrophyOutlined className="text-xl" />,
      activeIcon: <TrophyFilled className="text-xl text-brand-teal" />,
    },
    {
      key: "profil",
      label: "Profil",
      href: "/m/santri/profil",
      icon: <UserOutlined className="text-xl" />,
      activeIcon: <UserOutlined className="text-xl text-brand-teal font-bold" />,
    },
  ];

  const ortuNavItems: NavItem[] = [
    {
      key: "dashboard",
      label: "Beranda",
      href: "/m/ortu/dashboard",
      icon: <HomeOutlined className="text-xl" />,
      activeIcon: <HomeFilled className="text-xl text-brand-teal" />,
    },
    {
      key: "hafalan",
      label: "Hafalan",
      href: "/m/ortu/hafalan",
      icon: <BookOutlined className="text-xl" />,
      activeIcon: <BookFilled className="text-xl text-brand-teal" />,
    },
    {
      key: "absensi",
      label: "Absensi",
      href: "/m/ortu/absensi",
      icon: <CheckSquareOutlined className="text-xl" />,
      activeIcon: <CheckSquareFilled className="text-xl text-brand-teal" />,
    },
    {
      key: "raport",
      label: "Rapor",
      href: "/m/ortu/raport",
      icon: <TrophyOutlined className="text-xl" />,
      activeIcon: <TrophyFilled className="text-xl text-brand-teal" />,
    },
    {
      key: "profil",
      label: "Profil",
      href: "/m/ortu/profil",
      icon: <UserOutlined className="text-xl" />,
      activeIcon: <UserOutlined className="text-xl text-brand-teal font-bold" />,
    },
  ];

  const yayasanNavItems: NavItem[] = [
    {
      key: "dashboard",
      label: "Beranda",
      href: "/m/yayasan/dashboard",
      icon: <HomeOutlined className="text-xl" />,
      activeIcon: <HomeFilled className="text-xl text-brand-teal" />,
    },
    {
      key: "laporan",
      label: "Laporan",
      href: "/m/yayasan/laporan",
      icon: <FileTextOutlined className="text-xl" />,
      activeIcon: <FileTextFilled className="text-xl text-brand-teal" />,
    },
    {
      key: "santri",
      label: "Santri",
      href: "/m/yayasan/santri",
      icon: <TeamOutlined className="text-xl" />,
      activeIcon: <TeamOutlined className="text-xl text-brand-teal font-bold" />,
    },
    {
      key: "raport",
      label: "Rapor",
      href: "/m/yayasan/raport",
      icon: <TrophyOutlined className="text-xl" />,
      activeIcon: <TrophyFilled className="text-xl text-brand-teal" />,
    },
    {
      key: "profil",
      label: "Profil",
      href: "/m/yayasan/profil",
      icon: <UserOutlined className="text-xl" />,
      activeIcon: <UserOutlined className="text-xl text-brand-teal font-bold" />,
    },
  ];

  const adminNavItems: NavItem[] = [
    {
      key: "dashboard",
      label: "Beranda",
      href: "/m/admin/dashboard",
      icon: <HomeOutlined className="text-xl" />,
      activeIcon: <HomeFilled className="text-xl text-brand-teal" />,
    },
    {
      key: "santri",
      label: "Santri",
      href: "/m/admin/santri",
      icon: <TeamOutlined className="text-xl" />,
      activeIcon: <TeamOutlined className="text-xl text-brand-teal font-bold" />,
    },
    {
      key: "hafalan",
      label: "Hafalan",
      href: "/m/admin/hafalan",
      icon: <BookOutlined className="text-xl" />,
      activeIcon: <BookFilled className="text-xl text-brand-teal" />,
    },
    {
      key: "profil",
      label: "Profil",
      href: "/m/admin/profil",
      icon: <UserOutlined className="text-xl" />,
      activeIcon: <UserOutlined className="text-xl text-brand-teal font-bold" />,
    },
  ];

  const superAdminNavItems: NavItem[] = [
    {
      key: "dashboard",
      label: "Beranda",
      href: "/m/super-admin/dashboard",
      icon: <HomeOutlined className="text-xl" />,
      activeIcon: <HomeFilled className="text-xl text-brand-teal" />,
    },
    {
      key: "users",
      label: "Pengguna",
      href: "/m/super-admin/users",
      icon: <TeamOutlined className="text-xl" />,
      activeIcon: <TeamOutlined className="text-xl text-brand-teal font-bold" />,
    },
    {
      key: "profil",
      label: "Profil",
      href: "/m/super-admin/profil",
      icon: <UserOutlined className="text-xl" />,
      activeIcon: <UserOutlined className="text-xl text-brand-teal font-bold" />,
    },
  ];

  // Tentukan daftar menu dan warna aktif berdasarkan prefix URL
  const getNavConfig = () => {
    if (pathname.startsWith("/m/santri")) {
      return { items: santriNavItems, activeColor: "text-brand-teal font-semibold", dotColor: "bg-brand-teal" };
    }
    if (pathname.startsWith("/m/ortu")) {
      return { items: ortuNavItems, activeColor: "text-brand-teal font-semibold", dotColor: "bg-brand-teal" };
    }
    if (pathname.startsWith("/m/yayasan")) {
      return { items: yayasanNavItems, activeColor: "text-brand-teal font-semibold", dotColor: "bg-brand-teal" };
    }
    if (pathname.startsWith("/m/admin")) {
      return { items: adminNavItems, activeColor: "text-brand-teal font-semibold", dotColor: "bg-brand-teal" };
    }
    if (pathname.startsWith("/m/super-admin")) {
      return { items: superAdminNavItems, activeColor: "text-brand-teal font-semibold", dotColor: "bg-brand-teal" };
    }
    return { items: guruNavItems, activeColor: "text-brand-teal font-semibold", dotColor: "bg-brand-teal" };
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
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-navy-900/95 backdrop-blur-xl border-t border-navy-800 pb-safe shadow-2xl gpu-layer">
      <div className="flex items-center justify-around h-13 max-w-lg mx-auto px-1">
        {currentNavItems.map((item) => {
          const active = isCurrentActive(item.href);
          return (
            <Link
              key={item.key}
              href={item.href}
              prefetch={true}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-all tap-active tap-instant ${
                active ? activeColor : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <div className="relative mb-0.5">
                {active ? item.activeIcon : item.icon}
                {active && (
                  <span
                    className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full ${dotColor} shadow-sm`}
                  />
                )}
              </div>
              <span className="text-[10px] tracking-tight font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default React.memo(MobileTabBarComponent);

