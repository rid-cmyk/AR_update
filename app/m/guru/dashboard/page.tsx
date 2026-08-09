"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Avatar, Button, Skeleton } from "antd";
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

interface HalaqahData {
  id: number;
  namaHalaqah: string;
  jumlahSantri: number;
}

interface HafalanItem {
  id: number;
  santri?: {
    namaLengkap?: string;
  };
  surat?: string;
  ayatMulai?: number;
  ayatSelesai?: number;
  jenis?: string;
  status?: string;
  tanggal?: string;
  juz?: number;
}

interface JadwalItem {
  id: number;
  hari: string;
  jamMulai: string;
  jamSelesai: string;
  halaqah?: {
    namaHalaqah: string;
  };
}

export default function MobileGuruDashboard() {
  const [loading, setLoading] = useState(true);
  const [totalSantri, setTotalSantri] = useState(0);
  const [totalHalaqah, setTotalHalaqah] = useState(0);
  const [halaqahList, setHalaqahList] = useState<HalaqahData[]>([]);
  const [recentSetoran, setRecentSetoran] = useState<HafalanItem[]>([]);
  const [jadwalList, setJadwalList] = useState<JadwalItem[]>([]);

  useEffect(() => {
    let isMounted = true;

    async function fetchDashboardData() {
      try {
        setLoading(true);
        const [dashRes, hafRes, jadRes] = await Promise.all([
          fetch("/api/guru/dashboard"),
          fetch("/api/guru/hafalan?limit=5"),
          fetch("/api/guru/jadwal"),
        ]);

        if (isMounted && dashRes.ok) {
          const dashJson = await dashRes.json();
          if (dashJson?.data) {
            setTotalSantri(dashJson.data.totalSantri || 0);
            setTotalHalaqah(dashJson.data.totalHalaqah || 0);
            setHalaqahList(dashJson.data.halaqah || []);
          }
        }

        if (isMounted && hafRes.ok) {
          const hafJson = await hafRes.json();
          if (hafJson?.data && Array.isArray(hafJson.data)) {
            setRecentSetoran(hafJson.data);
          }
        }

        if (isMounted && jadRes.ok) {
          const jadJson = await jadRes.json();
          if (jadJson?.data && Array.isArray(jadJson.data)) {
            setJadwalList(jadJson.data);
          }
        }
      } catch (err) {
        console.error("Gagal memuat data dashboard guru:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  const quickActions = [
    {
      title: "Absensi",
      subtitle: "Halaqah Sendiri",
      href: "/m/guru/absensi",
      icon: <CheckCircleOutlined className="text-2xl text-emerald-400" />,
      bg: "bg-emerald-500/10 border-emerald-500/20",
    },
    {
      title: "Hafalan",
      subtitle: "Setoran Baru",
      href: "/m/guru/hafalan",
      icon: <BookOutlined className="text-2xl text-brand-teal" />,
      bg: "bg-brand-teal/10 border-brand-teal/20",
    },
    {
      title: "Ujian",
      subtitle: "Ujian Al-Qur'an",
      href: "/m/guru/ujian",
      icon: <TrophyOutlined className="text-2xl text-amber-400" />,
      bg: "bg-amber-500/10 border-amber-500/20",
    },
    {
      title: "Jadwal",
      subtitle: "Hari Ini",
      href: "/m/guru/jadwal",
      icon: <CalendarOutlined className="text-2xl text-brand-teal" />,
      bg: "bg-brand-teal/10 border-brand-teal/20",
    },
  ];

  return (
    <div className="p-4 space-y-6 pb-20">
      {/* Banner Sambutan Guru */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-green via-navy-800 to-navy-900 p-6 shadow-lg border border-brand-teal/20">
        <div className="relative z-10">
          <span className="inline-block px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-slate-100 text-[11px] font-semibold mb-2">
            {halaqahList.length > 0
              ? `Halaqah ${halaqahList[0].namaHalaqah}`
              : "Halaqah Tahfizh"}
          </span>
          <h2 className="text-2xl font-bold text-white mb-1">
            Ahlan wa Sahlan, Ustadz!
          </h2>
          <p className="text-slate-100 text-xs max-w-xs leading-relaxed opacity-90 mb-4">
            Pantau perkembangan hafalan santri halaqah Anda dan catat absensi harian secara aktual.
          </p>
          <div className="flex items-center gap-2">
            <Link href="/m/guru/hafalan">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                className="bg-white text-navy-900 hover:bg-slate-100 border-none font-semibold rounded-full h-9 px-4 text-xs shadow-md"
              >
                Setoran Baru
              </Button>
            </Link>
            <Link href="/m/guru/absensi">
              <Button className="bg-white/15 text-white border-white/20 hover:bg-white/25 rounded-full h-9 px-4 text-xs font-semibold backdrop-blur-sm">
                Absen Hari Ini
              </Button>
            </Link>
          </div>
        </div>
        <div className="absolute -right-8 -bottom-8 w-44 h-44 rounded-full bg-brand-teal/20 blur-2xl pointer-events-none" />
      </div>

      {/* Grid Statistik 2x2 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-200">Statistik Halaqah Sendiri</h3>
          <span className="text-xs text-slate-400">Aktual Database</span>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            <Skeleton active paragraph={{ rows: 2 }} className="bg-navy-900/50 p-4 rounded-2xl" />
            <Skeleton active paragraph={{ rows: 2 }} className="bg-navy-900/50 p-4 rounded-2xl" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <MobileStatCard
              title="Total Santri"
              value={totalSantri}
              icon={<TeamOutlined />}
              subtitle={`${totalHalaqah} Halaqah Anda`}
              colorScheme="blue"
            />
            <MobileStatCard
              title="Setoran Hari Ini"
              value={recentSetoran.length}
              icon={<BookOutlined />}
              subtitle="Setoran Masuk"
              colorScheme="emerald"
            />
            <MobileStatCard
              title="Halaqah Anda"
              value={totalHalaqah}
              icon={<CheckCircleOutlined />}
              subtitle="Ditugaskan Admin"
              colorScheme="amber"
            />
            <MobileStatCard
              title="Jadwal Mengajar"
              value={jadwalList.length}
              icon={<CalendarOutlined />}
              subtitle="Jadwal Halaqah"
              colorScheme="purple"
            />
          </div>
        )}
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
              <div className="w-12 h-12 rounded-xl bg-navy-900/60 flex items-center justify-center flex-shrink-0">
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
            className="text-xs text-brand-teal hover:text-brand-teal font-medium flex items-center gap-1"
          >
            <span>Lihat Semua</span>
            <RightOutlined className="text-[10px]" />
          </Link>
        </div>

        {recentSetoran.length === 0 ? (
          <div className="p-6 rounded-2xl bg-navy-900/40 border border-navy-800 text-center text-slate-400 text-xs">
            Belum ada data setoran dari santri di halaqah Anda.
          </div>
        ) : (
          <div className="space-y-2.5">
            {recentSetoran.map((item) => {
              const santriNama = item.santri?.namaLengkap || "Santri";
              const suratAyat =
                item.surat && item.ayatMulai && item.ayatSelesai
                  ? `${item.surat} (${item.ayatMulai}-${item.ayatSelesai})`
                  : item.surat || "Setoran Hafalan";
              const statusText = item.jenis || item.status || "Lancar";
              const tanggalText = item.tanggal
                ? new Date(item.tanggal).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                  })
                : "Baru saja";

              return (
                <MobileListItem
                  key={item.id}
                  title={santriNama}
                  subtitle={suratAyat}
                  avatar={
                    <Avatar
                      style={{ backgroundColor: "#023047" }}
                      className="font-bold border border-brand-teal/30"
                    >
                      {santriNama.charAt(0)}
                    </Avatar>
                  }
                  rightContent={
                    <div className="text-right">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold mb-1 ${
                          statusText === "Lancar"
                            ? "bg-emerald-500/15 text-emerald-400"
                            : "bg-amber-500/15 text-amber-400"
                        }`}
                      >
                        {statusText}
                      </span>
                      <div className="text-[10px] text-slate-400 flex items-center justify-end gap-1">
                        <ClockCircleOutlined />
                        <span>{tanggalText}</span>
                      </div>
                    </div>
                  }
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
