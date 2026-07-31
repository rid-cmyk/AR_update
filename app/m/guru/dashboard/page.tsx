"use client";

import React from "react";
import Link from "next/link";
import { Avatar, Button } from "antd";
import {
  TeamOutlined,
  CheckCircleOutlined,
  BookOutlined,
  CalendarOutlined,
  TrophyOutlined,
  RightOutlined,
  ClockCircleOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import MobileStatCard from "@/components/mobile/MobileStatCard";
import MobileListItem from "@/components/mobile/MobileListItem";

export default function MobileGuruDashboard() {
  const quickActions = [
    {
      title: "Absensi",
      subtitle: "Halaqah Pagi",
      href: "/m/guru/absensi",
      icon: <CheckCircleOutlined className="text-2xl text-emerald-400" />,
      bg: "bg-emerald-500/10 border-emerald-500/20",
    },
    {
      title: "Hafalan",
      subtitle: "Setoran Baru",
      href: "/m/guru/hafalan",
      icon: <BookOutlined className="text-2xl text-blue-400" />,
      bg: "bg-blue-500/10 border-blue-500/20",
    },
    {
      title: "Jadwal",
      subtitle: "Hari Ini",
      href: "/m/guru/jadwal",
      icon: <CalendarOutlined className="text-2xl text-amber-400" />,
      bg: "bg-amber-500/10 border-amber-500/20",
    },
    {
      title: "Prestasi",
      subtitle: "Target Juz",
      href: "/m/guru/hafalan",
      icon: <TrophyOutlined className="text-2xl text-purple-400" />,
      bg: "bg-purple-500/10 border-purple-500/20",
    },
  ];

  const recentSetoran = [
    {
      id: 1,
      nama: "Ahmad Zaki",
      surat: "Al-Baqarah (2:141-145)",
      waktu: "10 menit lalu",
      status: "Lancar",
      juz: "Juz 2",
    },
    {
      id: 2,
      nama: "Fatimah Azzahra",
      surat: "Ali 'Imran (3:1-10)",
      waktu: "30 menit lalu",
      status: "Lancar",
      juz: "Juz 3",
    },
    {
      id: 3,
      nama: "Muhammad Yusuf",
      surat: "An-Nisa (4:20-24)",
      waktu: "1 jam lalu",
      status: "Perlu Ulang",
      juz: "Juz 4",
    },
  ];

  return (
    <div className="p-4 space-y-6">
      {/* Banner Sambutan Guru */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-slate-900 p-6 shadow-lg border border-blue-400/20">
        <div className="relative z-10">
          <span className="inline-block px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-blue-100 text-[11px] font-semibold mb-2">
            Halaqah Tahfizh Unggulan
          </span>
          <h2 className="text-2xl font-bold text-white mb-1">
            Ahlan wa Sahlan, Ustadz!
          </h2>
          <p className="text-blue-100 text-xs max-w-xs leading-relaxed opacity-90 mb-4">
            Pantau perkembangan hafalan santri dan catat absensi harian dengan cepat dan mudah.
          </p>
          <div className="flex items-center gap-2">
            <Link href="/m/guru/hafalan">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                className="bg-white text-blue-700 hover:bg-blue-50 border-none font-semibold rounded-full h-9 px-4 text-xs shadow-md"
              >
                Setoran Baru
              </Button>
            </Link>
            <Link href="/m/guru/absensi">
              <Button
                className="bg-white/15 text-white border-white/20 hover:bg-white/25 rounded-full h-9 px-4 text-xs font-semibold backdrop-blur-sm"
              >
                Absen Hari Ini
              </Button>
            </Link>
          </div>
        </div>
        {/* Dekorasi Ornamen Al-Quran latar belakang */}
        <div className="absolute -right-8 -bottom-8 w-44 h-44 rounded-full bg-blue-400/10 blur-2xl pointer-events-none" />
      </div>

      {/* Grid Statistik 2x2 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-200">Statistik Halaqah</h3>
          <span className="text-xs text-slate-400">Semester Genap</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <MobileStatCard
            title="Total Santri"
            value={28}
            icon={<TeamOutlined />}
            subtitle="2 Halaqah Aktif"
            colorScheme="blue"
          />
          <MobileStatCard
            title="Setoran Hari Ini"
            value="14/28"
            icon={<BookOutlined />}
            subtitle="50% Selesai"
            colorScheme="emerald"
          />
          <MobileStatCard
            title="Kehadiran"
            value="96%"
            icon={<CheckCircleOutlined />}
            subtitle="26 Hadir, 2 Izin"
            colorScheme="amber"
          />
          <MobileStatCard
            title="Khatam Juz"
            value="12"
            icon={<TrophyOutlined />}
            subtitle="Bulan Ini"
            colorScheme="purple"
          />
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div>
        <h3 className="text-sm font-bold text-slate-200 mb-3">Aksi Cepat</h3>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action, idx) => (
            <Link
              key={idx}
              href={action.href}
              className={`${action.bg} border rounded-2xl p-4 flex items-center gap-3 transition-all tap-active hover:border-opacity-80`}
            >
              <div className="w-12 h-12 rounded-xl bg-slate-900/60 flex items-center justify-center flex-shrink-0">
                {action.icon}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-white truncate">
                  {action.title}
                </div>
                <div className="text-[11px] text-slate-400 truncate">
                  {action.subtitle}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Setoran Hafalan Terakhir */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-200">Setoran Terakhir</h3>
          <Link
            href="/m/guru/hafalan"
            className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
          >
            <span>Lihat Semua</span>
            <RightOutlined className="text-[10px]" />
          </Link>
        </div>

        <div className="space-y-2.5">
          {recentSetoran.map((item) => (
            <MobileListItem
              key={item.id}
              title={item.nama}
              subtitle={item.surat}
              avatar={
                <Avatar
                  style={{ backgroundColor: "#096dd9" }}
                  className="font-bold border border-blue-400/30"
                >
                  {item.nama.charAt(0)}
                </Avatar>
              }
              rightContent={
                <div className="text-right">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold mb-1 ${
                      item.status === "Lancar"
                        ? "bg-emerald-500/15 text-emerald-400"
                        : "bg-amber-500/15 text-amber-400"
                    }`}
                  >
                    {item.status}
                  </span>
                  <div className="text-[10px] text-slate-400 flex items-center justify-end gap-1">
                    <ClockCircleOutlined />
                    <span>{item.waktu}</span>
                  </div>
                </div>
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}
