"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Avatar, Skeleton } from "antd";
import {
  BookOutlined,
  CheckCircleOutlined,
  TrophyOutlined,
  RightOutlined,
  ClockCircleOutlined,
  NotificationOutlined,
  HeartOutlined,
} from "@ant-design/icons";
import MobileStatCard from "@/components/mobile/MobileStatCard";

interface ChildData {
  id: number;
  namaLengkap: string;
  username: string;
  foto?: string;
  hafalanProgress?: number;
  attendanceRate?: number;
  totalPrestasi?: number;
  setoranCount?: number;
}

interface ActivityItem {
  id: string;
  santriName: string;
  activityType: string;
  description: string;
  timestamp: string;
}

interface PengumumanItem {
  id: number;
  judul: string;
  tanggal: string;
  keterangan: string;
  penulis: string;
}

export default function MobileOrtuDashboard() {
  const [userName, setUserName] = useState<string>("Bpk/Ibu Wali Santri");
  const [loading, setLoading] = useState<boolean>(true);
  const [children, setChildren] = useState<ChildData[]>([]);
  const [overview, setOverview] = useState<{
    totalChildren: number;
    avgHafalanProgress: number;
    avgAttendanceRate: number;
    totalPrestasi: number;
  }>({
    totalChildren: 0,
    avgHafalanProgress: 0,
    avgAttendanceRate: 0,
    totalPrestasi: 0,
  });
  const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([]);
  const [pengumuman, setPengumuman] = useState<PengumumanItem[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [meRes, dashRes, pengRes] = await Promise.all([
          fetch("/api/auth/me").catch(() => null),
          fetch("/api/ortu/dashboard").catch(() => null),
          fetch("/api/ortu/pengumuman").catch(() => null),
        ]);

        if (meRes && meRes.ok) {
          const meJson = await meRes.json();
          if (meJson.user?.namaLengkap) {
            setUserName(meJson.user.namaLengkap);
          }
        }

        if (dashRes && dashRes.ok) {
          const dashJson = await dashRes.json();
          if (dashJson.data) {
            setChildren(dashJson.data.children || []);
            setOverview(
              dashJson.data.overview || {
                totalChildren: 0,
                avgHafalanProgress: 0,
                avgAttendanceRate: 0,
                totalPrestasi: 0,
              }
            );
            setRecentActivities(dashJson.data.recentActivities || []);
          }
        }

        if (pengRes && pengRes.ok) {
          const pengJson = await pengRes.json();
          if (pengJson.data) {
            setPengumuman(pengJson.data);
          }
        }
      } catch (e) {
        console.error("Gagal memuat data dasbor ortu:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const firstChild = children.length > 0 ? children[0] : null;

  return (
    <div className="p-4 space-y-6">
      {/* Banner Utama Wali Santri */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-green via-navy-800 to-navy-900 p-6 shadow-lg border border-brand-teal/20">
        <div className="relative z-10">
          <span className="inline-block px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-slate-100 text-[11px] font-semibold mb-2">
            Pantauan Orang Tua / Wali
          </span>
          <h2 className="text-2xl font-bold text-white mb-1">
            Ahlan, {userName}
          </h2>
          <p className="text-slate-100 text-xs max-w-xs leading-relaxed opacity-90 mb-3">
            Pantau selalu perkembangan hafalan dan kehadiran ananda di halaqah secara aktual dari ponsel Anda.
          </p>

          <div className="flex items-center gap-2">
            <Link href="/m/ortu/hafalan">
              <button className="bg-white text-navy-900 hover:bg-slate-100 font-semibold rounded-full h-9 px-4 text-xs shadow-md transition-all tap-active">
                Lihat Semua Setoran
              </button>
            </Link>
            <Link href="/m/ortu/raport">
              <button className="bg-white/15 text-white border border-white/20 hover:bg-white/25 rounded-full h-9 px-4 text-xs font-semibold backdrop-blur-sm transition-all tap-active">
                Rapor Ananda
              </button>
            </Link>
          </div>
        </div>
        <div className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-brand-teal/20 blur-2xl pointer-events-none" />
      </div>

      {/* Grid Statistik Monitoring 2x2 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-200">
            {firstChild ? `Capaian Ananda (${firstChild.namaLengkap})` : "Capaian Ananda"}
          </h3>
          <span className="text-xs text-slate-400">Semester Genap</span>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            <Skeleton.Button active style={{ height: 80, width: "100%" }} />
            <Skeleton.Button active style={{ height: 80, width: "100%" }} />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <MobileStatCard
              title="Progress Hafalan"
              value={`${firstChild?.hafalanProgress ?? overview.avgHafalanProgress}%`}
              icon={<BookOutlined />}
              subtitle="Dari Seluruh Target"
              colorScheme="amber"
            />
            <MobileStatCard
              title="Kehadiran"
              value={`${firstChild?.attendanceRate ?? overview.avgAttendanceRate}%`}
              icon={<CheckCircleOutlined />}
              subtitle="Tingkat Kehadiran"
              colorScheme="emerald"
            />
            <MobileStatCard
              title="Setoran Pekan Ini"
              value={`${firstChild?.setoranCount ?? 0} Kali`}
              icon={<HeartOutlined />}
              subtitle="Aktif & Konsisten"
              colorScheme="blue"
            />
            <MobileStatCard
              title="Total Prestasi"
              value={`${firstChild?.totalPrestasi ?? overview.totalPrestasi}`}
              icon={<TrophyOutlined />}
              subtitle="Penghargaan Ananda"
              colorScheme="purple"
            />
          </div>
        )}
      </div>

      {/* Papan Pengumuman Halaqah / Ustadz */}
      <div>
        <h3 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-1.5">
          <NotificationOutlined className="text-brand-teal" />
          <span>Pengumuman Halaqah</span>
        </h3>
        {loading ? (
          <Skeleton active paragraph={{ rows: 2 }} />
        ) : pengumuman.length > 0 ? (
          pengumuman.map((item) => (
            <div
              key={item.id}
              className="bg-navy-900/90 border border-brand-teal/25 rounded-2xl p-4 space-y-2 shadow-sm mb-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-brand-teal">
                  {item.judul}
                </span>
                <span className="text-[11px] text-slate-500">{item.tanggal}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {item.keterangan}
              </p>
              <div className="text-[11px] text-slate-400 text-right font-medium">
                — {item.penulis}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-6 text-xs text-slate-400 bg-navy-900/60 rounded-2xl border border-navy-800">
            Belum ada pengumuman baru untuk halaqah ananda.
          </div>
        )}
      </div>

      {/* Setoran Hafalan Terakhir Anak */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-200">
            Aktivitas Setoran Terakhir
          </h3>
          <Link
            href="/m/ortu/hafalan"
            className="text-xs text-brand-teal hover:text-brand-teal font-medium flex items-center gap-1"
          >
            <span>Selengkapnya</span>
            <RightOutlined className="text-[10px]" />
          </Link>
        </div>

        {loading ? (
          <Skeleton active paragraph={{ rows: 3 }} />
        ) : recentActivities.length > 0 ? (
          <div className="space-y-2.5">
            {recentActivities.map((item) => (
              <div
                key={item.id}
                className="bg-navy-900/80 border border-navy-800 rounded-2xl p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white">{item.description}</h4>
                    <span className="text-xs text-slate-400">{item.santriName}</span>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400">
                    {item.activityType}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <div className="flex items-center gap-1">
                    <ClockCircleOutlined />
                    <span>{new Date(item.timestamp).toLocaleDateString("id-ID")}</span>
                  </div>
                  <span>Terverifikasi</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-xs text-slate-400 bg-navy-900/60 rounded-2xl border border-navy-800">
            Belum ada riwayat setoran terbaru tercatat.
          </div>
        )}
      </div>
    </div>
  );
}
