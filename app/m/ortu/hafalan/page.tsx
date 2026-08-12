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
    <div className="min-h-[calc(100vh-8rem)] bg-[#f4f9fb] p-4 space-y-4 pb-24">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-green to-deep-space rounded-2xl p-4 text-white space-y-1 shadow-lg shadow-blue-green/20">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2 m-0">
            <AreaChartOutlined className="text-sky-blue" /> Analitik &amp; Hafalan Ananda
          </h2>
          <span className="text-[10px] bg-white/20 text-white border border-white/30 px-2 py-0.5 rounded-full font-semibold">
            Ortu Portal
          </span>
        </div>
        <p className="text-xs text-white/80 m-0">
          Pantau grafik nilai per-juz, estimasi waktu khatam, &amp; remedial.
        </p>
      </div>

      {/* Child Switcher Pills */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-3 space-y-2 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500">Pilih Ananda:</span>
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
                    ? "bg-blue-green text-white shadow-md shadow-blue-green/25 border border-blue-green"
                    : "bg-white text-slate-500 border border-slate-200 hover:text-deep-space"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                    isSelected ? "bg-white text-blue-green" : "bg-slate-100 text-slate-500"
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
      <div className="grid grid-cols-2 gap-2 bg-white p-1.5 rounded-2xl border border-slate-200/80 shadow-sm">
        <button
          type="button"
          onClick={() => setActiveTab("ANALYTICS")}
          className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "ANALYTICS"
              ? "bg-sky-blue/20 text-blue-green border border-sky-blue/30"
              : "text-slate-500 hover:text-deep-space"
          }`}
        >
          <AreaChartOutlined /> Analitik Prediktif
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("RIWAYAT")}
          className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "RIWAYAT"
              ? "bg-sky-blue/20 text-blue-green border border-sky-blue/30"
              : "text-slate-500 hover:text-deep-space"
          }`}
        >
          <BookOutlined /> Riwayat Setoran
        </button>
      </div>

      {/* Main Tab Content */}
      {activeTab === "ANALYTICS" ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-deep-space">
              Analitik: {selectedChild?.namaLengkap || "Ananda"}
            </span>
            <Button
              size="small"
              type="text"
              icon={<UpOutlined />}
              onClick={() => setIsBottomSheetOpen(true)}
              className="text-blue-green text-xs p-0"
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
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 text-center text-slate-400 text-xs shadow-sm">
              Pilih ananda untuk melihat analitik prediktif.
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Target & Progress Hafalan Ananda */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 space-y-2 shadow-sm">
            <div className="flex items-center justify-between text-xs font-semibold text-deep-space">
              <span>Target Hafalan {selectedChild?.namaLengkap || "Ananda"}</span>
              <span className="text-princeton">{progressData.progress}%</span>
            </div>
            <Progress percent={progressData.progress} showInfo={false} strokeColor="#fb8500" trailColor="#dbe7ee" />
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
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
            className="bg-white border-slate-200 rounded-2xl h-11 text-deep-space placeholder:text-slate-400 shadow-sm"
          />

          {/* Daftar Kartu Riwayat */}
          <div className="space-y-3">
            {loadingRecords ? (
              <Skeleton active paragraph={{ rows: 3 }} />
            ) : filtered.length > 0 ? (
              filtered.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-slate-200/80 rounded-2xl p-4 space-y-2.5 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-deep-space">
                        Surat {item.surat}
                      </h4>
                      <span className="text-xs text-slate-500 font-medium">
                        Ayat {item.ayatMulai} - {item.ayatSelesai} (Juz {item.juz})
                      </span>
                    </div>
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        item.penilaian === "mumtaz" || item.penilaian === "jayyid_jiddan" || item.status === "lancar"
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-amber-50 text-princeton"
                      }`}
                    >
                      {item.penilaian ? item.penilaian.toUpperCase() : item.status.toUpperCase()}
                    </span>
                  </div>

                  {item.catatan && (
                    <div className="bg-[#f4f9fb] rounded-xl p-3 border border-slate-100 text-xs text-slate-500 italic">
                      &ldquo;{item.catatan}&rdquo;
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                    <div className="flex items-center gap-1">
                      <ClockCircleOutlined />
                      <span>{new Date(item.tanggal).toLocaleDateString("id-ID")}</span>
                    </div>
                    <span className="text-emerald-600">Terverifikasi</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-xs text-slate-400 bg-white rounded-2xl border border-slate-200/80">
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
          <p className="text-xs text-slate-500">
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
