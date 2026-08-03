"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Input, Progress, Button, Spin } from "antd";
import {
  SearchOutlined,
  ClockCircleOutlined,
  BookOutlined,
  TrophyOutlined,
  AreaChartOutlined,
  UserOutlined,
  UpOutlined,
} from "@ant-design/icons";
import StudentAnalyticsTab from "@/components/analytics/StudentAnalyticsTab";
import MobileBottomSheet from "@/components/mobile/MobileBottomSheet";

interface ChildItem {
  id: number;
  namaLengkap: string;
  username: string;
  halaqah?: {
    namaHalaqah: string;
  } | null;
}

export default function MobileOrtuHafalan() {
  const [childrenList, setChildrenList] = useState<ChildItem[]>([
    { id: 1, namaLengkap: "Ahmad Zaki", username: "ahmadzaki" },
    { id: 2, namaLengkap: "Fatimah Azzahra", username: "fatimah" },
  ]);
  const [selectedSantriId, setSelectedSantriId] = useState<number | null>(1);
  const [activeTab, setActiveTab] = useState<"ANALYTICS" | "RIWAYAT">("ANALYTICS");
  const [searchQuery, setSearchQuery] = useState("");
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch children list for ortu
  const fetchChildren = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/ortu/anak");
      if (res.ok) {
        const json = await res.json();
        if (json.data && json.data.length > 0) {
          setChildrenList(json.data);
          setSelectedSantriId((prev) => {
            const exists = json.data.some((c: ChildItem) => c.id === prev);
            return exists ? prev : json.data[0].id;
          });
        }
      }
    } catch (err) {
      console.error("Error fetching children list:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChildren();
  }, [fetchChildren]);

  const riwayatAnak = [
    {
      id: 1,
      surat: "Al-Baqarah",
      ayat: "Ayat 141 - 145",
      waktu: "28 Juli 2026",
      nilai: "Lancar",
      juz: "Juz 2",
      catatan: "Kelancaran sangat baik, pertahankan ghunnah pada ayat 143.",
      ustadz: "Ust. Hendri Sudianto",
    },
    {
      id: 2,
      surat: "Al-Baqarah",
      ayat: "Ayat 135 - 140",
      waktu: "25 Juli 2026",
      nilai: "Lancar",
      juz: "Juz 2",
      catatan: "Mumtaz, mukhraj huruf shaad dan dhaad sudah tepat.",
      ustadz: "Ust. Hendri Sudianto",
    },
    {
      id: 3,
      surat: "Al-Baqarah",
      ayat: "Ayat 125 - 134",
      waktu: "22 Juli 2026",
      nilai: "Sedang",
      juz: "Juz 2",
      catatan: "Perlu diulang sedikit di ayat 130 bagian akhir.",
      ustadz: "Ust. Hendri Sudianto",
    },
    {
      id: 4,
      surat: "Al-Baqarah",
      ayat: "Ayat 110 - 124",
      waktu: "19 Juli 2026",
      nilai: "Lancar",
      juz: "Juz 2",
      catatan: "Lancar alhamdulillah.",
      ustadz: "Ust. Hendri Sudianto",
    },
  ];

  const filtered = riwayatAnak.filter((item) =>
    item.surat.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedChild = childrenList.find((c) => c.id === selectedSantriId);

  return (
    <div className="p-4 space-y-4 min-h-screen pb-20">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-900/90 to-slate-900 border border-amber-800/60 rounded-2xl p-4 text-white space-y-1">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2 m-0">
            <AreaChartOutlined className="text-amber-400" /> Analitik &amp; Hafalan Ananda
          </h2>
          <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full font-semibold">
            Ortu Portal
          </span>
        </div>
        <p className="text-xs text-slate-300 m-0">
          Pantau grafik nilai per-juz, estimasi waktu khatam, &amp; remedial.
        </p>
      </div>

      {/* Child Switcher Pills */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400">Pilih Ananda:</span>
          {loading && <Spin size="small" />}
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {childrenList.map((child) => {
            const isSelected = selectedSantriId === child.id;
            return (
              <button
                key={child.id}
                type="button"
                onClick={() => setSelectedSantriId(child.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isSelected
                    ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25 border border-amber-400"
                    : "bg-slate-950 text-slate-400 border border-slate-800 hover:text-white"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                    isSelected ? "bg-slate-950 text-amber-400" : "bg-slate-800 text-slate-300"
                  }`}
                >
                  {child.namaLengkap.charAt(0)}
                </div>
                <span>{child.namaLengkap}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mode View Switcher (Analitik Prediktif vs Riwayat Setoran) */}
      <div className="grid grid-cols-2 p-1 bg-slate-900 rounded-2xl border border-slate-800">
        <button
          onClick={() => setActiveTab("ANALYTICS")}
          className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "ANALYTICS"
              ? "bg-amber-500 text-slate-950 shadow-sm"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <AreaChartOutlined /> Analitik &amp; KKM
        </button>
        <button
          onClick={() => setActiveTab("RIWAYAT")}
          className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "RIWAYAT"
              ? "bg-amber-500 text-slate-950 shadow-sm"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <BookOutlined /> Riwayat Setoran
        </button>
      </div>

      {/* Main Tab Content */}
      {activeTab === "ANALYTICS" ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-400">
              Analitik: {selectedChild?.namaLengkap || "Ananda"}
            </span>
            <Button
              size="small"
              type="text"
              icon={<UpOutlined />}
              onClick={() => setIsBottomSheetOpen(true)}
              className="text-amber-400 text-xs p-0"
            >
              Bottom Sheet
            </Button>
          </div>

          {selectedSantriId ? (
            <StudentAnalyticsTab
              santriId={selectedSantriId}
              santriName={selectedChild?.namaLengkap}
            />
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center text-slate-400 text-xs">
              Pilih ananda untuk melihat analitik prediktif.
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Target & Progress Hafalan Ananda */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
              <span>Target Hafalan {selectedChild?.namaLengkap || "Ananda"} (Juz 2)</span>
              <span className="text-amber-400">80%</span>
            </div>
            <Progress percent={80} showInfo={false} strokeColor="#f59e0b" trailColor="#1e293b" />
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span>16 halaman selesai</span>
              <span>Target selesainya: 10 Agustus 2026</span>
            </div>
          </div>

          {/* Search Bar */}
          <Input
            prefix={<SearchOutlined className="text-slate-500 mr-1" />}
            placeholder="Cari surat atau catatan setoran..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-slate-900 border-slate-800 rounded-2xl h-11 text-white placeholder:text-slate-500"
          />

          {/* Daftar Kartu Riwayat */}
          <div className="space-y-3">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      Surat {item.surat}
                    </h4>
                    <span className="text-xs text-amber-400 font-medium">
                      {item.ayat} ({item.juz})
                    </span>
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

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                  <div className="flex items-center gap-1">
                    <ClockCircleOutlined />
                    <span>{item.waktu}</span>
                  </div>
                  <span>{item.ustadz}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Mobile Bottom Sheet Modal */}
      <MobileBottomSheet
        open={isBottomSheetOpen}
        onClose={() => setIsBottomSheetOpen(false)}
        title={`Analitik: ${selectedChild?.namaLengkap || "Ananda"}`}
      >
        {selectedSantriId ? (
          <StudentAnalyticsTab
            santriId={selectedSantriId}
            santriName={selectedChild?.namaLengkap}
          />
        ) : null}
      </MobileBottomSheet>
    </div>
  );
}

