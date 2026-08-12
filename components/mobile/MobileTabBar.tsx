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
import { useHideOnScroll } from "@/hooks/useHideOnScroll";

interface NavItem {
  key: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  activeIcon: React.ReactNode;
}

function MobileTabBarComponent() {
  const pathname = usePathname() || "";
  const hidden = useHideOnScroll();

  const guruNavItems: NavItem[] = [
    {
      key: "dashboard",
      label: "Beranda",
      href: "/m/guru/dashboard",
      icon: <HomeOutlined className="text-lg" />,
      activeIcon: <HomeFilled className="text-lg text-blue-green" />,
    },
    {
      key: "absensi",
      label: "Absensi",
      href: "/m/guru/absensi",
      icon: <CheckSquareOutlined className="text-lg" />,
      activeIcon: <CheckSquareFilled className="text-lg text-blue-green" />,
    },
    {
      key: "hafalan",
      label: "Hafalan",
      href: "/m/guru/hafalan",
      icon: <BookOutlined className="text-lg" />,
      activeIcon: <BookFilled className="text-lg text-blue-green" />,
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
  ];

  const santriNavItems: NavItem[] = [
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
  ];

  const ortuNavItems: NavItem[] = [
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
  ];

  const yayasanNavItems: NavItem[] = [
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
  ];

  const adminNavItems: NavItem[] = [
    {
      key: "dashboard",
      label: "Beranda",
      href: "/m/admin/dashboard",
      icon: <HomeOutlined className="text-xl" />,
      activeIcon: <HomeFilled className="text-xl text-blue-green" />,
    },
    {
      key: "santri",
      label: "Santri",
      href: "/m/admin/santri",
      icon: <TeamOutlined className="text-xl" />,
      activeIcon: <TeamOutlined className="text-xl text-blue-green font-bold" />,
    },
    {
      key: "hafalan",
      label: "Hafalan",
      href: "/m/admin/hafalan",
      icon: <BookOutlined className="text-xl" />,
      activeIcon: <BookFilled className="text-xl text-blue-green" />,
    },
    {
      key: "profil",
      label: "Profil",
      href: "/m/admin/profil",
      icon: <UserOutlined className="text-xl" />,
      activeIcon: <UserOutlined className="text-xl text-blue-green font-bold" />,
    },
  ];

  const superAdminNavItems: NavItem[] = [
    {
      key: "dashboard",
      label: "Beranda",
      href: "/m/super-admin/dashboard",
      icon: <HomeOutlined className="text-xl" />,
      activeIcon: <HomeFilled className="text-xl text-blue-green" />,
    },
    {
      key: "users",
      label: "Pengguna",
      href: "/m/super-admin/users",
      icon: <TeamOutlined className="text-xl" />,
      activeIcon: <TeamOutlined className="text-xl text-blue-green font-bold" />,
    },
    {
      key: "profil",
      label: "Profil",
      href: "/m/super-admin/profil",
      icon: <UserOutlined className="text-xl" />,
      activeIcon: <UserOutlined className="text-xl text-blue-green font-bold" />,
    },
  ];

  // Tentukan daftar menu dan warna aktif berdasarkan prefix URL
  const getNavConfig = () => {
    if (pathname.startsWith("/m/santri")) {
      return { items: santriNavItems, activeColor: "text-blue-green font-semibold", dotColor: "bg-blue-green" };
    }
    if (pathname.startsWith("/m/ortu")) {
      return { items: ortuNavItems, activeColor: "text-blue-green font-semibold", dotColor: "bg-blue-green" };
    }
    if (pathname.startsWith("/m/yayasan")) {
      return { items: yayasanNavItems, activeColor: "text-blue-green font-semibold", dotColor: "bg-blue-green" };
    }
    if (pathname.startsWith("/m/admin")) {
      return { items: adminNavItems, activeColor: "text-blue-green font-semibold", dotColor: "bg-blue-green" };
    }
    if (pathname.startsWith("/m/super-admin")) {
      return { items: superAdminNavItems, activeColor: "text-blue-green font-semibold", dotColor: "bg-blue-green" };
    }
    return { items: guruNavItems, activeColor: "text-blue-green font-semibold", dotColor: "bg-blue-green" };
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
    <nav
      style={{ bottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))" }}
      className="fixed inset-x-0 z-40 pointer-events-none transition-transform duration-300 ease-out gpu-layer"
      data-hidden={hidden}
    >
      <div className="mx-auto w-[calc(100%-1.5rem)] max-w-md">
        <div
          className={`flex items-center justify-around h-14 rounded-full bg-white/95 backdrop-blur-xl border border-slate-200 shadow-lg shadow-slate-300/50 px-1 pointer-events-auto transition-transform duration-300 ease-out ${
            hidden ? "translate-y-[calc(100%+1rem)]" : "translate-y-0"
          }`}
        >
          {currentNavItems.map((item) => {
            const active = isCurrentActive(item.href);
            return (
              <Link
                key={item.key}
                href={item.href}
                prefetch={true}
                className={`flex flex-col items-center justify-center flex-1 rounded-full py-1 transition-all tap-active tap-instant ${
                  active ? activeColor : "text-slate-400 hover:text-slate-600"
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
      </div>
    </nav>
  );
}

export default React.memo(MobileTabBarComponent);

