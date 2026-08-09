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
    <div className="p-4 space-y-4 pb-20">
      {/* Child Switcher Pills */}
      {children.length > 0 && (
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
      )}

      {/* Banner Rekap Kehadiran */}
      <div className="bg-navy-900 border border-navy-800 rounded-2xl p-4">
        <span className="text-[11px] font-semibold text-brand-teal uppercase tracking-wider">
          Statistik Kehadiran {selectedChild?.namaLengkap || "Ananda"}
        </span>
        <h3 className="text-base font-bold text-white mt-0.5">
          {persenHadir}% Kehadiran Efektif
        </h3>
        <p className="text-xs text-slate-400">
          Dari {totalPertemuan} pertemuan halaqah tercatat
        </p>

        <div className="grid grid-cols-4 gap-2 mt-4 text-center">
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-2">
            <div className="text-[11px] text-emerald-400 font-medium">Hadir</div>
            <div className="text-base font-bold text-white">{summary.totalHadir}</div>
          </div>
          <div className="bg-brand-teal/10 border border-brand-teal/20 rounded-xl p-2">
            <div className="text-[11px] text-brand-teal font-medium">Izin</div>
            <div className="text-base font-bold text-white">{summary.totalIzin}</div>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-2">
            <div className="text-[11px] text-amber-400 font-medium">Sakit</div>
            <div className="text-base font-bold text-white">0</div>
          </div>
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-2">
            <div className="text-[11px] text-rose-400 font-medium">Alpa</div>
            <div className="text-base font-bold text-white">{summary.totalAlpha}</div>
          </div>
        </div>
      </div>

      {/* Log Kehadiran */}
      <div className="space-y-2.5">
        <h3 className="text-sm font-bold text-slate-300">
          Riwayat Absensi {selectedChild?.namaLengkap || "Ananda"}
        </h3>
        {loadingAbsensi ? (
          <Skeleton active paragraph={{ rows: 3 }} />
        ) : records.length > 0 ? (
          records.map((item) => (
            <div
              key={item.id}
              className="bg-navy-900/80 border border-navy-800 rounded-2xl p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                    item.status === "masuk" || item.status === "hadir"
                      ? "bg-emerald-500/15 text-emerald-400"
                      : "bg-amber-500/15 text-amber-400"
                  }`}
                >
                  {item.status === "masuk" || item.status === "hadir" ? "H" : "I"}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">
                    {new Date(item.tanggal).toLocaleDateString("id-ID", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
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
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                }`}
              >
                {item.status === "masuk" ? "HADIR" : item.status.toUpperCase()}
              </span>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-xs text-slate-400 bg-navy-900/60 rounded-2xl border border-navy-800">
            Belum ada riwayat absensi tercatat untuk ananda.
          </div>
        )}
      </div>
    </div>
  );
}
