"use client";

import React from "react";
import Link from "next/link";
import { Progress } from "antd";
import {
  TeamOutlined,
  BookOutlined,
  TrophyOutlined,
  RiseOutlined,
  RightOutlined,
  FileTextOutlined,
  BankOutlined,
} from "@ant-design/icons";
import MobileStatCard from "@/components/mobile/MobileStatCard";

export default function MobileYayasanDashboard() {
  const topHalaqah = [
    {
      id: 1,
      nama: "Halaqah Abu Bakar",
      pengampu: "Ust. Hendri Sudianto",
      persentase: 94,
      santri: "25 Santri",
    },
    {
      id: 2,
      nama: "Halaqah Umar bin Khattab",
      pengampu: "Ust. Faisal Rahman",
      persentase: 91,
      santri: "24 Santri",
    },
    {
      id: 3,
      nama: "Halaqah Utsman bin Affan",
      pengampu: "Ust. Abdullah Hakim",
      persentase: 88,
      santri: "26 Santri",
    },
  ];

  return (
    <div className="p-4 space-y-6">
      {/* Banner Executive Pulse Yayasan */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-700 via-indigo-800 to-slate-900 p-6 shadow-lg border border-purple-400/20">
        <div className="relative z-10">
          <span className="inline-block px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-purple-100 text-[11px] font-semibold mb-2">
            Executive Pulse Dashboard
          </span>
          <h2 className="text-2xl font-bold text-white mb-1">
            Yayasan Nurul Quran
          </h2>
          <p className="text-purple-100 text-xs max-w-xs leading-relaxed opacity-90 mb-4">
            Pantau ringkasan performa tahfizh seluruh lembaga secara cepat dan aktual.
          </p>

          <div className="flex items-center gap-2">
            <Link href="/m/yayasan/laporan">
              <button className="bg-white text-purple-900 hover:bg-purple-50 font-semibold rounded-full h-9 px-4 text-xs shadow-md transition-all tap-active flex items-center gap-1.5">
                <FileTextOutlined />
                <span>Laporan Eksekutif</span>
              </button>
            </Link>
            <Link href="/m/yayasan/santri">
              <button className="bg-white/15 text-white border border-white/20 hover:bg-white/25 rounded-full h-9 px-4 text-xs font-semibold backdrop-blur-sm transition-all tap-active flex items-center gap-1.5">
                <TeamOutlined />
                <span>Direktori Santri</span>
              </button>
            </Link>
          </div>
        </div>
        <div className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-purple-400/10 blur-2xl pointer-events-none" />
      </div>

      {/* Grid KPI Utama 2x2 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-200">
            Metrik Utama Lembaga
          </h3>
          <span className="text-xs text-slate-400">Juli 2026</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <MobileStatCard
            title="Total Santri"
            value="342"
            icon={<TeamOutlined />}
            subtitle="+12 santri baru"
            colorScheme="purple"
          />
          <MobileStatCard
            title="Total Hafalan"
            value="1,280 Juz"
            icon={<BookOutlined />}
            subtitle="+85 juz semester ini"
            colorScheme="emerald"
          />
          <MobileStatCard
            title="Kelulusan Target"
            value="89.4%"
            icon={<TrophyOutlined />}
            subtitle="+4.2% YoY"
            colorScheme="amber"
          />
          <MobileStatCard
            title="Total Ustadz"
            value="24"
            icon={<BankOutlined />}
            subtitle="100% aktif mengajar"
            colorScheme="blue"
          />
        </div>
      </div>

      {/* Performa Halaqah Unggulan */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-200">
            Halaqah Berkinerja Tinggi
          </h3>
          <Link
            href="/m/yayasan/laporan"
            className="text-xs text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1"
          >
            <span>Semua Halaqah</span>
            <RightOutlined className="text-[10px]" />
          </Link>
        </div>

        <div className="space-y-3">
          {topHalaqah.map((item) => (
            <div
              key={item.id}
              className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-2"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">{item.nama}</h4>
                  <span className="text-xs text-slate-400">{item.pengampu}</span>
                </div>
                <span className="text-sm font-bold text-purple-400">
                  {item.persentase}% Target
                </span>
              </div>
              <Progress
                percent={item.persentase}
                showInfo={false}
                strokeColor="#c084fc"
                trailColor="#1e293b"
              />
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>{item.santri}</span>
                <span className="text-emerald-400 font-medium">✓ Unggulan</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
