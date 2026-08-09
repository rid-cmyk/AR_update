"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Input, Progress, Button, Spin, Empty, Skeleton } from "antd";
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
import { useOrtuChildDashboard } from "@/hooks/useOrtuChildDashboard";

interface HafalanRecord {
  id: number;
  surat: string;
  ayatMulai: number;
  ayatSelesai: number;
  tanggal: string;
  penilaian?: string | null;
  status: string;
  juz: number;
  catatan?: string | null;
}

export default function MobileOrtuHafalan() {
  const [activeTab, setActiveTab] = useState<"ANALYTICS" | "RIWAYAT">("ANALYTICS");
  const [searchQuery, setSearchQuery] = useState("");
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [records, setRecords] = useState<HafalanRecord[]>([]);
  const [progressData, setProgressData] = useState<{
    progress: number;
    totalAyat: number;
    totalSurat: number;
  }>({ progress: 0, totalAyat: 0, totalSurat: 0 });

  const {
    children,
    childNames,
    loading,
    selectedChild: selectedChildName,
    setSelectedChild,
  } = useOrtuChildDashboard<Record<string, never>>({
    transformAnak: (anak: any) => ({
      data: {},
      child: { id: anak.id, namaLengkap: anak.namaLengkap, username: anak.username },
    }),
    initialData: {},
    defaultSelectedChild: "",
  });

  const selectedSantriId = children.find((c) => c.namaLengkap === selectedChildName)?.id ?? null;

  useEffect(() => {
    if (childNames.length > 0 && !selectedChildName) {
      setSelectedChild(childNames[0]);
    }
  }, [childNames, selectedChildName, setSelectedChild]);

  const fetchHafalanProgress = useCallback(async (anakId: number) => {
    try {
      setLoadingRecords(true);
      const res = await fetch(`/api/ortu/hafalan-progress?anakId=${anakId}`);
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setRecords(json.data.recentHafalan || []);
          setProgressData({
            progress: json.data.progress || 0,
            totalAyat: json.data.totalAyat || 0,
            totalSurat: json.data.totalSurat || 0,
          });
        }
      }
    } catch (err) {
      console.error("Error fetching hafalan progress:", err);
    } finally {
      setLoadingRecords(false);
    }
  }, []);

  useEffect(() => {
    if (selectedSantriId) {
      fetchHafalanProgress(selectedSantriId);
    }
  }, [selectedSantriId, fetchHafalanProgress]);

  const filtered = records.filter((item) =>
    item.surat.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.catatan && item.catatan.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const selectedChild = children.find((c) => c.id === selectedSantriId);

  return (
    <div className="p-4 space-y-4 min-h-screen pb-20">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-navy-800 to-navy-900 border border-navy-800 rounded-2xl p-4 text-white space-y-1">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2 m-0">
            <AreaChartOutlined className="text-brand-teal" /> Analitik &amp; Hafalan Ananda
          </h2>
          <span className="text-[10px] bg-brand-teal/20 text-brand-teal border border-brand-teal/30 px-2 py-0.5 rounded-full font-semibold">
            Ortu Portal
          </span>
        </div>
        <p className="text-xs text-slate-300 m-0">
          Pantau grafik nilai per-juz, estimasi waktu khatam, &amp; remedial.
        </p>
      </div>

      {/* Child Switcher Pills */}
      <div className="bg-navy-900 border border-navy-800 rounded-2xl p-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400">Pilih Ananda:</span>
          {loading && <Spin size="small" />}
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {children.map((child) => {
            const isSelected = selectedSantriId === child.id;
            return (
              <button
                key={child.id}
                type="button"
                onClick={() => setSelectedChild(child.namaLengkap)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isSelected
                    ? "bg-brand-teal text-navy-950 shadow-md shadow-brand-teal/25 border border-brand-teal"
                    : "bg-navy-950 text-slate-400 border border-navy-800 hover:text-white"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                    isSelected ? "bg-navy-950 text-brand-teal" : "bg-navy-700 text-slate-300"
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

      {/* Segmented Control / Tabs */}
      <div className="grid grid-cols-2 gap-2 bg-navy-900 p-1.5 rounded-2xl border border-navy-800">
        <button
          type="button"
          onClick={() => setActiveTab("ANALYTICS")}
          className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "ANALYTICS"
              ? "bg-brand-teal/20 text-brand-teal border border-brand-teal/30"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <AreaChartOutlined /> Analitik Prediktif
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("RIWAYAT")}
          className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "RIWAYAT"
              ? "bg-brand-teal/20 text-brand-teal border border-brand-teal/30"
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
              className="text-brand-teal text-xs p-0"
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
            <div className="bg-navy-900 border border-navy-800 rounded-2xl p-6 text-center text-slate-400 text-xs">
              Pilih ananda untuk melihat analitik prediktif.
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Target & Progress Hafalan Ananda */}
          <div className="bg-navy-900 border border-navy-800 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
              <span>Target Hafalan {selectedChild?.namaLengkap || "Ananda"}</span>
              <span className="text-amber-400">{progressData.progress}%</span>
            </div>
            <Progress percent={progressData.progress} showInfo={false} strokeColor="#fb8500" trailColor="#013a5e" />
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span>{progressData.totalAyat} Ayat Dihafal</span>
              <span>{progressData.totalSurat} Surat Selesai</span>
            </div>
          </div>

          {/* Search Bar */}
          <Input
            prefix={<SearchOutlined className="text-slate-500 mr-1" />}
            placeholder="Cari surat atau catatan setoran..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-navy-900 border-navy-800 rounded-2xl h-11 text-white placeholder:text-slate-500"
          />

          {/* Daftar Kartu Riwayat */}
          <div className="space-y-3">
            {loadingRecords ? (
              <Skeleton active paragraph={{ rows: 3 }} />
            ) : filtered.length > 0 ? (
              filtered.map((item) => (
                <div
                  key={item.id}
                  className="bg-navy-900/80 border border-navy-800/80 rounded-2xl p-4 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">
                        Surat {item.surat}
                      </h4>
                      <span className="text-xs text-slate-400 font-medium">
                        Ayat {item.ayatMulai} - {item.ayatSelesai} (Juz {item.juz})
                      </span>
                    </div>
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        item.penilaian === "mumtaz" || item.penilaian === "jayyid_jiddan" || item.status === "lancar"
                          ? "bg-emerald-500/15 text-emerald-400"
                          : "bg-amber-500/15 text-amber-400"
                      }`}
                    >
                      {item.penilaian ? item.penilaian.toUpperCase() : item.status.toUpperCase()}
                    </span>
                  </div>

                  {item.catatan && (
                    <div className="bg-navy-950/70 rounded-xl p-3 border border-navy-800 text-xs text-slate-300 italic">
                      &ldquo;{item.catatan}&rdquo;
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                    <div className="flex items-center gap-1">
                      <ClockCircleOutlined />
                      <span>{new Date(item.tanggal).toLocaleDateString("id-ID")}</span>
                    </div>
                    <span>Terverifikasi</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-xs text-slate-400 bg-navy-900/60 rounded-2xl border border-navy-800">
                Belum ada riwayat setoran hafalan tercatat.
              </div>
            )}
          </div>
        </>
      )}

      {/* Expandable Bottom Sheet Ala Grab */}
      <MobileBottomSheet
        isOpen={isBottomSheetOpen}
        onClose={() => setIsBottomSheetOpen(false)}
        title={`Analitik Mendalam: ${selectedChild?.namaLengkap || "Ananda"}`}
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-300">
            Berikut adalah tampilan lengkap grafik evaluasi dan tren kenaikan juz
            ananda dalam mode persisten ala Grab.
          </p>
          {selectedSantriId && (
            <StudentAnalyticsTab
              santriId={selectedSantriId}
              santriName={selectedChild?.namaLengkap}
            />
          )}
        </div>
      </MobileBottomSheet>
    </div>
  );
}
