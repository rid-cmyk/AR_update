"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Button, Avatar, Progress, Skeleton } from "antd";
import {
  BookOutlined,
  CheckCircleOutlined,
  TrophyOutlined,
  RightOutlined,
  ClockCircleOutlined,
  FireOutlined,
  ReadOutlined,
  NotificationOutlined,
} from "@ant-design/icons";
import MobileStatCard from "@/components/mobile/MobileStatCard";

interface HafalanItem {
  id: number;
  tanggal: string;
  surat: string;
  ayatMulai: number;
  ayatSelesai: number;
  status: string;
  keterangan: string;
}

interface PengumumanItem {
  id: number;
  judul: string;
  tanggal: string;
  keterangan: string;
  penulis: string;
}

export default function MobileSantriDashboard() {
  const [santriName, setSantriName] = useState<string>("Santri");
  const [halaqahName, setHalaqahName] = useState<string>("Halaqah Tahfizh");
  const [loading, setLoading] = useState<boolean>(true);
  const [recentHafalan, setRecentHafalan] = useState<HafalanItem[]>([]);
  const [overview, setOverview] = useState<{
    totalHafalan: number;
    totalAyatZiyadah: number;
    totalAyatMurajaah: number;
    activeTargets: number;
    completedTargets: number;
    totalJuzCompleted: number;
  }>({
    totalHafalan: 0,
    totalAyatZiyadah: 0,
    totalAyatMurajaah: 0,
    activeTargets: 0,
    completedTargets: 0,
    totalJuzCompleted: 0,
  });
  const [pengumuman, setPengumuman] = useState<PengumumanItem[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [meRes, hafRes, pengRes] = await Promise.all([
          fetch("/api/auth/me").catch(() => null),
          fetch("/api/santri/hafalan").catch(() => null),
          fetch("/api/santri/pengumuman").catch(() => null),
        ]);

        if (meRes && meRes.ok) {
          const meJson = await meRes.json();
          if (meJson.user?.namaLengkap) {
            setSantriName(meJson.user.namaLengkap);
          }
        }

        if (hafRes && hafRes.ok) {
          const hafJson = await hafRes.json();
          if (hafJson.data) {
            setRecentHafalan(hafJson.data.recentHafalan || []);
            if (hafJson.data.overview) {
              setOverview(hafJson.data.overview);
            }
          }
        }

        if (pengRes && pengRes.ok) {
          const pengJson = await pengRes.json();
          if (pengJson.data) {
            setPengumuman(pengJson.data);
          }
        }
      } catch (e) {
        console.error("Gagal memuat data santri dashboard:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const progressPercent = Math.min(
    Math.round(((overview.totalAyatZiyadah || 0) / 6236) * 100),
    100
  );

  return (
    <div className="p-4 space-y-6 pb-20">
      {/* Banner Utama Santri */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-green via-navy-800 to-navy-900 p-6 shadow-lg border border-brand-teal/20">
        <div className="relative z-10">
          <span className="inline-block px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-slate-100 text-[11px] font-semibold mb-2">
            {halaqahName}
          </span>
          <h2 className="text-2xl font-bold text-white mb-1">
            Ahlan, {santriName}!
          </h2>
          <p className="text-slate-100 text-xs max-w-xs leading-relaxed opacity-90 mb-3">
            Terus pertahankan keistiqomahan ziyadah dan muroja&apos;ah harianmu.
          </p>

          <div className="bg-navy-900/60 rounded-2xl p-3 mb-4 border border-emerald-400/20">
            <div className="flex items-center justify-between text-xs font-semibold text-white mb-1">
              <span>Capaian Ziyadah</span>
              <span>{progressPercent}%</span>
            </div>
            <Progress percent={progressPercent} showInfo={false} strokeColor="#34d399" trailColor="rgba(255,255,255,0.15)" />
            <div className="text-[11px] text-slate-200 mt-1">
              {overview.totalAyatZiyadah} Ayat Dihafal
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/m/santri/hafalan">
              <Button
                type="primary"
                icon={<ReadOutlined />}
                className="bg-white text-emerald-800 hover:bg-emerald-50 border-none font-semibold rounded-full h-9 px-4 text-xs shadow-md"
              >
                Riwayat Hafalan
              </Button>
            </Link>
            <Link href="/m/santri/raport">
              <Button
                icon={<TrophyOutlined />}
                className="bg-white/15 text-white border-white/20 hover:bg-white/25 rounded-full h-9 px-4 text-xs font-semibold"
              >
                Rapor Tahfizh
              </Button>
            </Link>
          </div>
        </div>
        <div className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-emerald-400/10 blur-2xl pointer-events-none" />
      </div>

      {/* Grid Statistik 2x2 */}
      <div>
        <h3 className="text-sm font-bold text-slate-200 mb-3">
          Statistik Hafalanmu
        </h3>
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            <Skeleton.Button active style={{ height: 80, width: "100%" }} />
            <Skeleton.Button active style={{ height: 80, width: "100%" }} />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <MobileStatCard
              title="Total Juz"
              value={`${overview.totalJuzCompleted} Juz`}
              icon={<BookOutlined />}
              subtitle="Capaian Hafalan"
              colorScheme="emerald"
            />
            <MobileStatCard
              title="Ayat Ziyadah"
              value={`${overview.totalAyatZiyadah}`}
              icon={<CheckCircleOutlined />}
              subtitle="Total Ayat Dihafal"
              colorScheme="blue"
            />
            <MobileStatCard
              title="Ayat Murojaah"
              value={`${overview.totalAyatMurajaah}`}
              icon={<FireOutlined />}
              subtitle="Pengulangan Hafalan"
              colorScheme="amber"
            />
            <MobileStatCard
              title="Target Aktif"
              value={`${overview.activeTargets}`}
              icon={<TrophyOutlined />}
              subtitle="Sedang Berlangsung"
              colorScheme="purple"
            />
          </div>
        )}
      </div>

      {/* Pengumuman Halaqah */}
      <div>
        <h3 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-1.5">
          <NotificationOutlined className="text-emerald-400" />
          <span>Pengumuman Halaqah</span>
        </h3>
        {loading ? (
          <Skeleton active paragraph={{ rows: 2 }} />
        ) : pengumuman.length > 0 ? (
          pengumuman.map((item) => (
            <div
              key={item.id}
              className="bg-navy-900/90 border border-emerald-500/25 rounded-2xl p-4 space-y-2 shadow-sm mb-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400">
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
            Belum ada pengumuman baru untuk halaqahmu.
          </div>
        )}
      </div>

      {/* Setoran Terbaru */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-200">Setoran Terakhirmu</h3>
          <Link
            href="/m/santri/hafalan"
            className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
          >
            <span>Lihat Semua</span>
            <RightOutlined className="text-[10px]" />
          </Link>
        </div>

        {loading ? (
          <Skeleton active paragraph={{ rows: 3 }} />
        ) : recentHafalan.length > 0 ? (
          <div className="space-y-2.5">
            {recentHafalan.map((item) => (
              <div
                key={item.id}
                className="bg-navy-900/80 border border-navy-800 rounded-2xl p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      Surat {item.surat}
                    </h4>
                    <span className="text-xs text-emerald-400">
                      Ayat {item.ayatMulai} - {item.ayatSelesai}
                    </span>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400">
                    {item.status.toUpperCase()}
                  </span>
                </div>
                {item.keterangan && (
                  <div className="bg-navy-950/70 rounded-xl p-3 border border-navy-800 text-xs text-slate-300 italic">
                    &ldquo;{item.keterangan}&rdquo;
                  </div>
                )}
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <div className="flex items-center gap-1">
                    <ClockCircleOutlined />
                    <span>{new Date(item.tanggal).toLocaleDateString("id-ID")}</span>
                  </div>
                  <span>Terverifikasi</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-xs text-slate-400 bg-navy-900/60 rounded-2xl border border-navy-800">
            Belum ada catatan setoran terbaru.
          </div>
        )}
      </div>
    </div>
  );
}
