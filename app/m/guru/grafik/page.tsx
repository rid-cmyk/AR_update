"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Input, Select, Button, Spin, Empty } from "antd";
import {
  SearchOutlined,
  BarChartOutlined,
  UserOutlined,
  AreaChartOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import MobileBottomSheet from "@/components/mobile/MobileBottomSheet";
import StudentAnalyticsTab from "@/components/analytics/StudentAnalyticsTab";

interface HalaqahItem {
  id: number;
  namaHalaqah: string;
  jumlahSantri: number;
  santri?: Array<{
    id: number;
    namaLengkap: string;
    username: string;
  }>;
}

interface SantriItem {
  id: number;
  namaLengkap: string;
  username: string;
  totalAyat?: number;
}

export default function MobileGuruGrafik() {
  const [halaqahList, setHalaqahList] = useState<HalaqahItem[]>([]);
  const [selectedHalaqah, setSelectedHalaqah] = useState<number | null>(null);
  const [santriList, setSantriList] = useState<SantriItem[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // Selected santri for predictive analytics modal / inline view
  const [selectedSantriId, setSelectedSantriId] = useState<number | null>(null);
  const [selectedSantriName, setSelectedSantriName] = useState<string>("");
  const [isSheetOpen, setIsSheetOpen] = useState<boolean>(false);

  // Fetch halaqah list for guru
  const fetchHalaqah = useCallback(async () => {
    try {
      const res = await fetch("/api/guru/dashboard");
      if (res.ok) {
        const data = await res.json();
        const list: HalaqahItem[] = data.halaqah || [];
        setHalaqahList(list);
        if (list.length > 0 && !selectedHalaqah) {
          setSelectedHalaqah(list[0].id);
        }
      }
    } catch (err) {
      console.error("Error fetching halaqah list:", err);
    }
  }, [selectedHalaqah]);

  // Fetch santri list in selected halaqah
  const fetchSantri = useCallback(async (halaqahId: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/guru/grafik/top-santri?halaqahId=${halaqahId}`);
      if (res.ok) {
        const data = await res.json();
        const list: SantriItem[] = data.data || [];
        setSantriList(list);
        if (list.length > 0 && !selectedSantriId) {
          setSelectedSantriId(list[0].id);
          setSelectedSantriName(list[0].namaLengkap);
        }
      } else {
        setSantriList([]);
      }
    } catch (err) {
      console.error("Error fetching santri list:", err);
      setSantriList([]);
    } finally {
      setLoading(false);
    }
  }, [selectedSantriId]);

  useEffect(() => {
    fetchHalaqah();
  }, [fetchHalaqah]);

  useEffect(() => {
    if (selectedHalaqah) {
      fetchSantri(selectedHalaqah);
    }
  }, [selectedHalaqah, fetchSantri]);

  const openAnalyticsBottomSheet = (santri: SantriItem) => {
    setSelectedSantriId(santri.id);
    setSelectedSantriName(santri.namaLengkap);
    setIsSheetOpen(true);
  };

  const filteredSantri = santriList.filter(
    (s) =>
      s.namaLengkap.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-[#f4f9fb] p-4 space-y-4 pb-24">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-green to-deep-space rounded-2xl p-4 text-white space-y-1 shadow-lg shadow-blue-green/20">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2 m-0">
            <AreaChartOutlined className="text-sky-blue" /> Analitik Hafalan &amp; KKM
          </h2>
          <span className="text-[10px] bg-white/20 text-white border border-white/30 px-2 py-0.5 rounded-full font-semibold">
            Guru Mobile
          </span>
        </div>
        <p className="text-xs text-white/80 m-0">
          Grafik perkembangan nilai per-juz, estimasi waktu ketuntasan, &amp; remedial.
        </p>
      </div>

      {/* Halaqah Selector */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-3 space-y-2 shadow-sm">
        <label className="text-xs font-semibold text-slate-500 block">
          Pilih Halaqah
        </label>
        <Select
          className="w-full h-10"
          value={selectedHalaqah}
          onChange={(val) => {
            setSelectedHalaqah(val);
            setSelectedSantriId(null);
          }}
          options={halaqahList.map((h) => ({
            value: h.id,
            label: `${h.namaHalaqah} (${h.jumlahSantri} santri)`,
          }))}
          placeholder="Pilih Halaqah..."
        />
      </div>

      {/* Search Input */}
      <div className="relative">
        <Input
          prefix={<SearchOutlined className="text-slate-500 mr-1" />}
          placeholder="Cari santri dalam halaqah..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-white border-slate-200 rounded-2xl h-11 text-deep-space placeholder:text-slate-400 shadow-sm"
        />
      </div>

      {/* Santri Card Selection List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-deep-space">
            Daftar Santri ({filteredSantri.length})
          </span>
          <span className="text-[11px] text-blue-green">Tekan kartu untuk analitik</span>
        </div>

        {loading ? (
          <div className="py-8 text-center bg-white rounded-2xl border border-slate-200/80">
            <Spin size="default" />
            <p className="text-xs text-slate-400 mt-2">Memuat daftar santri...</p>
          </div>
        ) : filteredSantri.length === 0 ? (
          <div className="py-8 text-center bg-white rounded-2xl border border-slate-200/80">
            <Empty description="Tidak ada santri ditemukan" />
          </div>
        ) : (
          <div className="space-y-2">
            {filteredSantri.map((santri) => {
              const isSelected = selectedSantriId === santri.id;
              return (
                <div
                  key={santri.id}
                  onClick={() => openAnalyticsBottomSheet(santri)}
                  className={`border rounded-2xl p-3.5 flex items-center justify-between cursor-pointer transition-all shadow-sm ${
                    isSelected
                      ? "bg-sky-blue/20 border-sky-blue shadow-md shadow-sky-blue/10"
                      : "bg-white border-slate-200/80 hover:border-sky-blue/60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-sky-blue/20 text-blue-green border border-sky-blue/30 flex items-center justify-center font-bold text-sm">
                      {santri.namaLengkap.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-deep-space m-0">
                        {santri.namaLengkap}
                      </h4>
                      <p className="text-xs text-slate-500 m-0 mt-0.5">
                        @{santri.username}{" "}
                        {santri.totalAyat ? (
                          <span className="text-blue-green">
                            • {santri.totalAyat} ayat
                          </span>
                        ) : null}
                      </p>
                    </div>
                  </div>

                  <Button
                    type={isSelected ? "primary" : "default"}
                    size="small"
                    icon={<BarChartOutlined />}
                    className="rounded-xl text-xs flex items-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      openAnalyticsBottomSheet(santri);
                    }}
                  >
                    Analitik
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Responsive Santri Analytics Section (Inline view for active selected santri) */}
      {selectedSantriId ? (
        <div className="pt-4 border-t border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-deep-space m-0">
              Analitik Detail: {selectedSantriName}
            </h3>
            <Button
              size="small"
              type="text"
              icon={<AreaChartOutlined />}
              onClick={() => setIsSheetOpen(true)}
              className="text-blue-green text-xs p-0"
            >
              Mode Bottom Sheet
            </Button>
          </div>

          <StudentAnalyticsTab
            santriId={selectedSantriId}
            santriName={selectedSantriName}
          />
        </div>
      ) : null}

      {/* Mobile Bottom Sheet Modal for Thumb-Zone Accessibility */}
      <MobileBottomSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        title={`Analitik: ${selectedSantriName}`}
      >
        {selectedSantriId ? (
          <StudentAnalyticsTab
            santriId={selectedSantriId}
            santriName={selectedSantriName}
          />
        ) : null}
      </MobileBottomSheet>
    </div>
  );
}
