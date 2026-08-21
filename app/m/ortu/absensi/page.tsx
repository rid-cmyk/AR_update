"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Skeleton, Spin } from "antd";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import { useOrtuChildDashboard } from "@/hooks/useOrtuChildDashboard";
import { DashboardHeader } from "@/components/ui/dashboard-header";
import { MobileCard, MobileSectionTitle } from "@/components/mobile/dashboard";

interface AbsensiRecord {
  id: number;
  tanggal: string;
  status: string;
  keterangan?: string | null;
  jadwal?: {
    hari?: string;
    jamMulai?: string;
    jamSelesai?: string;
    halaqah?: {
      namaHalaqah?: string;
    };
  };
}

export default function MobileOrtuAbsensi() {
  const [loadingAbsensi, setLoadingAbsensi] = useState(false);
  const [summary, setSummary] = useState<{
    totalHadir: number;
    totalIzin: number;
    totalAlpha: number;
    totalHari: number;
  }>({ totalHadir: 0, totalIzin: 0, totalAlpha: 0, totalHari: 0 });
  const [records, setRecords] = useState<AbsensiRecord[]>([]);

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

  const fetchAbsensiSummary = useCallback(async (anakId: number) => {
    try {
      setLoadingAbsensi(true);
      const res = await fetch(`/api/ortu/absensi-summary?anakId=${anakId}`);
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setSummary(
            json.data.summary || {
              totalHadir: 0,
              totalIzin: 0,
              totalAlpha: 0,
              totalHari: 0,
            }
          );
          setRecords(json.data.recentAbsensi || []);
        }
      }
    } catch (err) {
      console.error("Error fetching absensi summary:", err);
    } finally {
      setLoadingAbsensi(false);
    }
  }, []);

  useEffect(() => {
    if (selectedSantriId) {
      fetchAbsensiSummary(selectedSantriId);
    }
  }, [selectedSantriId, fetchAbsensiSummary]);

  const totalPertemuan =
    summary.totalHari ||
    summary.totalHadir + summary.totalIzin + summary.totalAlpha ||
    1;
  const persenHadir = Math.round((summary.totalHadir / totalPertemuan) * 100);

  const selectedChild = children.find((c) => c.id === selectedSantriId);

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-[#f4f9fb] p-4 space-y-4 pb-24">
      {/* Header Banner */}
      <DashboardHeader
        badge={
          <span className="inline-flex items-center gap-1.5">
            <CheckCircleOutlined />
            Ortu Portal
          </span>
        }
        title="Absensi Ananda"
        subtitle="Pantau kehadiran dan persentase kehadiran ananda di halaqah."
      />

      {/* Child Switcher Pills */}
      {children.length > 0 && (
        <MobileCard className="p-3 space-y-2">
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
        </MobileCard>
      )}

      {/* Banner Rekap Kehadiran */}
      <MobileCard className="space-y-1">
        <span className="text-[11px] font-semibold text-blue-green uppercase tracking-wider">
          Statistik Kehadiran {selectedChild?.namaLengkap || "Ananda"}
        </span>
        <h3 className="text-base font-bold text-deep-space mt-0.5">
          {persenHadir}% Kehadiran Efektif
        </h3>
        <p className="text-xs text-slate-500">
          Dari {totalPertemuan} pertemuan halaqah tercatat
        </p>

        <div className="grid grid-cols-4 gap-2 mt-4 text-center">
          <MobileCard className="p-2">
            <div className="mx-auto mb-1 h-1 w-5 rounded-full bg-emerald-500/70" />
            <div className="text-[11px] text-emerald-600 font-medium">Hadir</div>
            <div className="text-base font-bold text-deep-space">{summary.totalHadir}</div>
          </MobileCard>
          <MobileCard className="p-2">
            <div className="mx-auto mb-1 h-1 w-5 rounded-full bg-blue-green/70" />
            <div className="text-[11px] text-blue-green font-medium">Izin</div>
            <div className="text-base font-bold text-deep-space">{summary.totalIzin}</div>
          </MobileCard>
          <MobileCard className="p-2">
            <div className="mx-auto mb-1 h-1 w-5 rounded-full bg-amber-flame/70" />
            <div className="text-[11px] text-princeton font-medium">Sakit</div>
            <div className="text-base font-bold text-deep-space">0</div>
          </MobileCard>
          <MobileCard className="p-2">
            <div className="mx-auto mb-1 h-1 w-5 rounded-full bg-rose-500/70" />
            <div className="text-[11px] text-rose-500 font-medium">Alpa</div>
            <div className="text-base font-bold text-deep-space">{summary.totalAlpha}</div>
          </MobileCard>
        </div>
      </MobileCard>

      {/* Log Kehadiran */}
      <div className="space-y-2.5">
        <MobileSectionTitle
          title={`Riwayat Absensi ${selectedChild?.namaLengkap || "Ananda"}`}
          icon={<CalendarOutlined />}
        />
        {loadingAbsensi ? (
          <Skeleton active paragraph={{ rows: 3 }} />
        ) : records.length > 0 ? (
          records.map((item) => (
            <MobileCard
              key={item.id}
              className="p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                    item.status === "masuk" || item.status === "hadir"
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-amber-50 text-princeton"
                  }`}
                >
                  {item.status === "masuk" || item.status === "hadir" ? "H" : "I"}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-deep-space">
                    {new Date(item.tanggal).toLocaleDateString("id-ID", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <ClockCircleOutlined />
                      {item.jadwal?.jamMulai || "06:00"} WIB
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <EnvironmentOutlined />
                      {item.jadwal?.halaqah?.namaHalaqah || "Halaqah Tahfizh"}
                    </span>
                  </div>
                </div>
              </div>
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full ${
                  item.status === "masuk" || item.status === "hadir"
                    ? "bg-emerald-50 text-emerald-600 border border-emerald-500/30"
                    : "bg-amber-50 text-princeton border border-amber-500/30"
                }`}
              >
                {item.status === "masuk" ? "HADIR" : item.status.toUpperCase()}
              </span>
            </MobileCard>
          ))
        ) : (
          <MobileCard className="py-8 text-center text-slate-400 text-xs">
            Belum ada riwayat absensi tercatat untuk ananda.
          </MobileCard>
        )}
      </div>
    </div>
  );
}
