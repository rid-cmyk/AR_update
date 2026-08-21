"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Input, Button, Spin, Empty } from "antd";
import {
  SearchOutlined,
  BarChartOutlined,
  UserOutlined,
  AreaChartOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import MobileBottomSheet from "@/components/mobile/MobileBottomSheet";
import { MobileSelectSheet } from "@/components/mobile/MobileSelectSheet";
import { DashboardHeader } from "@/components/ui/dashboard-header";
import { MobileCard } from "@/components/mobile/dashboard";
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
      <DashboardHeader
        badge={
          <span className="inline-flex items-center gap-1.5">
            <AreaChartOutlined />
            Guru Mobile
          </span>
        }
        title="Analitik Hafalan & KKM"
        subtitle="Grafik perkembangan nilai per-juz, estimasi waktu ketuntasan, & remedial."
      />

      {/* Halaqah Selector */}
      <MobileCard className="p-3 space-y-2">
        <label className="text-xs font-semibold text-slate-500 block">
          Pilih Halaqah
        </label>
        <MobileSelectSheet
          value={selectedHalaqah}
          onChange={(val) => {
            setSelectedHalaqah(Number(val));
            setSelectedSantriId(null);
          }}
          placeholder="Pilih Halaqah..."
          title="Pilih Halaqah"
          options={halaqahList.map((h) => ({
            value: h.id,
            label: `${h.namaHalaqah} (${h.jumlahSantri} santri)`,
            searchText: h.namaHalaqah,
          }))}
        />
      </MobileCard>

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
          <MobileCard className="py-8 text-center">
            <Spin size="default" />
            <p className="text-xs text-slate-400 mt-2">Memuat daftar santri...</p>
          </MobileCard>
        ) : filteredSantri.length === 0 ? (
          <MobileCard className="py-8 text-center">
            <Empty description="Tidak ada santri ditemukan" />
          </MobileCard>
        ) : (
          <div className="space-y-2">
            {filteredSantri.map((santri) => {
              const isSelected = selectedSantriId === santri.id;
              return (
                <MobileCard
                  key={santri.id}
                  onClick={() => openAnalyticsBottomSheet(santri)}
                  className={`p-3.5 flex items-center justify-between transition-all ${
                    isSelected
                      ? "ring-sky-blue bg-sky-blue/20 shadow-md shadow-sky-blue/10"
                      : "hover:ring-sky-blue/60"
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
                </MobileCard>
              );
            })}
          </div>
        )}
      </div>

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
