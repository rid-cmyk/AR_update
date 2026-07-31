"use client";

import React from "react";
import Link from "next/link";
import { Button, Avatar, Progress } from "antd";
import {
  BookOutlined,
  CheckCircleOutlined,
  TrophyOutlined,
  RightOutlined,
  ClockCircleOutlined,
  FireOutlined,
  ReadOutlined,
} from "@ant-design/icons";
import MobileStatCard from "@/components/mobile/MobileStatCard";
import MobileListItem from "@/components/mobile/MobileListItem";

export default function MobileSantriDashboard() {
  const recentSetoran = [
    {
      id: 1,
      surat: "Al-Baqarah (2:141-145)",
      waktu: "Kemarin, 16:30",
      nilai: "Lancar",
      juz: "Juz 2",
      ustadz: "Ust. Hendri Sudianto",
    },
    {
      id: 2,
      surat: "Al-Baqarah (2:135-140)",
      waktu: "3 hari lalu",
      nilai: "Lancar",
      juz: "Juz 2",
      ustadz: "Ust. Hendri Sudianto",
    },
    {
      id: 3,
      surat: "Al-Baqarah (2:125-134)",
      waktu: "5 hari lalu",
      nilai: "Sedang",
      juz: "Juz 2",
      ustadz: "Ust. Hendri Sudianto",
    },
  ];

  return (
    <div className="p-4 space-y-6">
      {/* Banner Utama Santri */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 p-6 shadow-lg border border-emerald-400/20">
        <div className="relative z-10">
          <span className="inline-block px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-emerald-100 text-[11px] font-semibold mb-2">
            Halaqah Abu Bakar
          </span>
          <h2 className="text-2xl font-bold text-white mb-1">
            Ahlan, Ahmad Zaki!
          </h2>
          <p className="text-emerald-100 text-xs max-w-xs leading-relaxed opacity-90 mb-3">
            Target hafalanmu bulan ini tinggal <span className="font-bold text-white">10 halaman lagi</span>. Semangat muroja&apos;ah hari ini!
          </p>

          <div className="bg-slate-900/60 rounded-2xl p-3 mb-4 border border-emerald-400/20">
            <div className="flex items-center justify-between text-xs font-semibold text-white mb-1">
              <span>Hafalan Aktif: Juz 2</span>
              <span>80%</span>
            </div>
            <Progress percent={80} showInfo={false} strokeColor="#34d399" trailColor="rgba(255,255,255,0.15)" />
            <div className="text-[11px] text-emerald-200 mt-1">
              Surat Al-Baqarah — Ayat 145
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
                className="bg-white/15 text-white border-white/20 hover:bg-white/25 rounded-full h-9 px-4 text-xs font-semibold backdrop-blur-sm"
              >
                Lihat Rapor
              </Button>
            </Link>
          </div>
        </div>
        {/* Ornamen latar belakang */}
        <div className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-emerald-400/10 blur-2xl pointer-events-none" />
      </div>

      {/* Grid Statistik Santri 2x2 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-200">Statistik Hafalan</h3>
          <span className="text-xs text-slate-400">Semester Genap</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <MobileStatCard
            title="Total Dihafal"
            value="2 Juz"
            icon={<BookOutlined />}
            subtitle="Juz 30 & Juz 1"
            colorScheme="emerald"
          />
          <MobileStatCard
            title="Target Bulan Ini"
            value="1 Juz"
            icon={<FireOutlined />}
            subtitle="80% Selesai"
            colorScheme="amber"
          />
          <MobileStatCard
            title="Kehadiran"
            value="98%"
            icon={<CheckCircleOutlined />}
            subtitle="24 Hadir, 0 Alpa"
            colorScheme="blue"
          />
          <MobileStatCard
            title="Nilai Tajwid"
            value="Mumtaz"
            icon={<TrophyOutlined />}
            subtitle="Rata-rata: A-"
            colorScheme="purple"
          />
        </div>
      </div>

      {/* Riwayat Setoran Terakhir */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-200">Riwayat Setoran</h3>
          <Link
            href="/m/santri/hafalan"
            className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
          >
            <span>Semua Setoran</span>
            <RightOutlined className="text-[10px]" />
          </Link>
        </div>

        <div className="space-y-2.5">
          {recentSetoran.map((item) => (
            <MobileListItem
              key={item.id}
              title={item.surat}
              subtitle={item.ustadz}
              avatar={
                <Avatar
                  style={{ backgroundColor: "#059669" }}
                  className="font-bold border border-emerald-400/30"
                >
                  {item.juz.replace("Juz ", "")}
                </Avatar>
              }
              rightContent={
                <div className="text-right">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-semibold mb-1 ${
                      item.nilai === "Lancar"
                        ? "bg-emerald-500/15 text-emerald-400"
                        : "bg-amber-500/15 text-amber-400"
                    }`}
                  >
                    {item.nilai}
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
