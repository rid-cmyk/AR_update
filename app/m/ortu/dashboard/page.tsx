"use client";

import React from "react";
import Link from "next/link";
import { Avatar } from "antd";
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
import MobileListItem from "@/components/mobile/MobileListItem";

export default function MobileOrtuDashboard() {
  const pengumuman = [
    {
      id: 1,
      judul: "Ujian Tahfizh Akhir Semester Genap",
      tanggal: "28 Juli 2026",
      keterangan:
        "Mohon dukungan Bapak/Ibu untuk mendampingi muroja'ah putra-putri di rumah menjelang ujian hafalan pada tanggal 5 Agustus 2026.",
      penulis: "Ust. Hendri Sudianto",
    },
  ];

  const recentSetoranAnak = [
    {
      id: 1,
      surat: "Al-Baqarah (2:141-145)",
      waktu: "Kemarin, 16:30 WIB",
      nilai: "Lancar",
      juz: "Juz 2",
      catatan: "Kelancaran sangat baik, pertahankan ghunnah pada ayat 143.",
      ustadz: "Ust. Hendri Sudianto",
    },
    {
      id: 2,
      surat: "Al-Baqarah (2:135-140)",
      waktu: "3 hari lalu",
      nilai: "Lancar",
      juz: "Juz 2",
      catatan: "Mumtaz, mukhraj huruf shaad dan dhaad sudah tepat.",
      ustadz: "Ust. Hendri Sudianto",
    },
  ];

  return (
    <div className="p-4 space-y-6">
      {/* Banner Utama Wali Santri */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-600 via-orange-600 to-slate-900 p-6 shadow-lg border border-amber-400/20">
        <div className="relative z-10">
          <span className="inline-block px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-amber-100 text-[11px] font-semibold mb-2">
            Pantauan Orang Tua / Wali
          </span>
          <h2 className="text-2xl font-bold text-white mb-1">
            Ahlan, Bpk. H. Ahmad Sulaiman
          </h2>
          <p className="text-amber-100 text-xs max-w-xs leading-relaxed opacity-90 mb-3">
            Pantau selalu perkembangan hafalan dan kehadiran ananda di halaqah secara aktual dari ponsel Anda.
          </p>

          <div className="flex items-center gap-2">
            <Link href="/m/ortu/hafalan">
              <button className="bg-white text-amber-900 hover:bg-amber-50 font-semibold rounded-full h-9 px-4 text-xs shadow-md transition-all tap-active">
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
        <div className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-amber-400/10 blur-2xl pointer-events-none" />
      </div>

      {/* Grid Statistik Monitoring 2x2 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-200">
            Capaian Ananda (Ahmad Zaki)
          </h3>
          <span className="text-xs text-slate-400">Semester Genap</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <MobileStatCard
            title="Total Dihafal"
            value="2 Juz"
            icon={<BookOutlined />}
            subtitle="Juz 30 & Juz 1"
            colorScheme="amber"
          />
          <MobileStatCard
            title="Kehadiran"
            value="100%"
            icon={<CheckCircleOutlined />}
            subtitle="24 Hadir, 0 Alpa"
            colorScheme="emerald"
          />
          <MobileStatCard
            title="Setoran Minggu Ini"
            value="4 Kali"
            icon={<HeartOutlined />}
            subtitle="Konsisten"
            colorScheme="blue"
          />
          <MobileStatCard
            title="Nilai Tajwid"
            value="Mumtaz"
            icon={<TrophyOutlined />}
            subtitle="Predikat: A-"
            colorScheme="purple"
          />
        </div>
      </div>

      {/* Papan Pengumuman Halaqah / Ustadz */}
      <div>
        <h3 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-1.5">
          <NotificationOutlined className="text-amber-400" />
          <span>Pengumuman Halaqah</span>
        </h3>
        {pengumuman.map((item) => (
          <div
            key={item.id}
            className="bg-slate-900/90 border border-amber-500/25 rounded-2xl p-4 space-y-2 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400">
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
        ))}
      </div>

      {/* Setoran Hafalan Terakhir Anak */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-200">
            Setoran Terakhir Ananda
          </h3>
          <Link
            href="/m/ortu/hafalan"
            className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1"
          >
            <span>Selengkapnya</span>
            <RightOutlined className="text-[10px]" />
          </Link>
        </div>

        <div className="space-y-2.5">
          {recentSetoranAnak.map((item) => (
            <div
              key={item.id}
              className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-2"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">{item.surat}</h4>
                  <span className="text-xs text-amber-400">{item.juz}</span>
                </div>
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    item.nilai === "Lancar"
                      ? "bg-emerald-500/15 text-emerald-400"
                      : "bg-amber-500/15 text-amber-400"
                  }`}
                >
                  {item.nilai}
                </span>
              </div>
              <div className="bg-slate-950/70 rounded-xl p-3 border border-slate-800 text-xs text-slate-300 italic">
                &ldquo;{item.catatan}&rdquo;
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <div className="flex items-center gap-1">
                  <ClockCircleOutlined />
                  <span>{item.waktu}</span>
                </div>
                <span>{item.ustadz}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
