"use client";

import React, { useEffect, useState } from "react";
import {
  TrophyOutlined,
  DownloadOutlined,
  PrinterOutlined,
} from "@ant-design/icons";
import { Progress, Button, Skeleton } from "antd";
import RaportModalView from "@/components/raport/RaportModalView";

interface HalaqahRaportItem {
  halaqahId: number;
  namaHalaqah: string;
  santriCount: number;
  attendanceRate: number;
  averageHafalanPerSantri: number;
}

export default function MobileYayasanRaport() {
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [rekapHalaqah, setRekapHalaqah] = useState<HalaqahRaportItem[]>([]);
  const [totalSantri, setTotalSantri] = useState(0);
  const [overallRate, setOverallRate] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function fetchRaportData() {
      try {
        setLoading(true);
        const res = await fetch("/api/analytics/global-reports?type=halaqah");
        if (!res.ok) throw new Error("Gagal mengambil data rapor halaqah");
        const data = await res.json();

        if (!isMounted) return;

        if (Array.isArray(data.halaqahStats)) {
          const items: HalaqahRaportItem[] = data.halaqahStats.map(
            (h: any) => ({
              halaqahId: h.halaqahId,
              namaHalaqah: h.namaHalaqah || "Halaqah",
              santriCount: h.santriCount || 0,
              attendanceRate: Math.round(h.attendanceRate || 0),
              averageHafalanPerSantri: Math.round(
                h.averageHafalanPerSantri || 0
              ),
            })
          );

          setRekapHalaqah(items);

          const totalS = items.reduce((sum, i) => sum + i.santriCount, 0);
          setTotalSantri(totalS);

          const avgRate =
            items.length > 0
              ? Math.round(
                  items.reduce((sum, i) => sum + i.attendanceRate, 0) /
                    items.length
                )
              : 0;
          setOverallRate(avgRate);
        }
      } catch (err) {
        console.error("Error fetching Raport Yayasan:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchRaportData();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="p-4 space-y-6">
      {/* Header Rekap Rapor Lembaga */}
      <div className="bg-gradient-to-br from-blue-green via-navy-800 to-navy-900 border border-brand-teal/30 rounded-3xl p-6 text-center space-y-2 shadow-lg">
        <div className="w-14 h-14 rounded-full bg-white/15 backdrop-blur-md mx-auto flex items-center justify-center text-white text-2xl shadow-inner mb-2">
          <TrophyOutlined />
        </div>
        <span className="inline-block px-3 py-0.5 rounded-full bg-white/15 text-slate-100 text-xs font-semibold">
          Rekapitulasi Akhir Semester
        </span>
        <h2 className="text-2xl font-bold text-white">
          {loading ? "..." : `${overallRate}% Capaian Lembaga`}
        </h2>
        <p className="text-xs text-slate-100">
          {loading
            ? "Memuat rekapitulasi kelulusan..."
            : `Rekap performa dari total ${totalSantri.toLocaleString("id-ID")} santri di seluruh halaqah`}
        </p>
      </div>

      {/* Rincian Kelulusan per Halaqah */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-300">
          Tingkat Performa & Kehadiran per Halaqah
        </h3>
        {loading ? (
          <div className="space-y-3" data-testid="skeleton-raport">
            {[...Array(4)].map((_, idx) => (
              <div
                key={idx}
                className="bg-navy-900/80 border border-navy-800 rounded-2xl p-4"
              >
                <Skeleton active paragraph={{ rows: 1 }} />
              </div>
            ))}
          </div>
        ) : rekapHalaqah.length === 0 ? (
          <div className="bg-navy-900/80 border border-navy-800 rounded-2xl p-6 text-center text-slate-400 text-xs">
            Belum ada data halaqah untuk rekap rapor.
          </div>
        ) : (
          rekapHalaqah.map((item) => (
            <div
              key={item.halaqahId}
              className="bg-navy-900/80 border border-navy-800 rounded-2xl p-4 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white">
                  {item.namaHalaqah}
                </span>
                <span className="text-xs font-bold text-brand-teal">
                  {item.attendanceRate}% Capaian
                </span>
              </div>
              <Progress
                percent={item.attendanceRate}
                showInfo={false}
                strokeColor="#219ebc"
                trailColor="#013a5e"
              />
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>{item.santriCount} Santri Terdaftar</span>
                <span>Rata-rata {item.averageHafalanPerSantri} Setoran</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Tombol Unduh Laporan Eksekutif */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          className="w-full h-12 rounded-2xl bg-blue-green hover:bg-blue-green font-bold text-xs shadow-lg shadow-brand-teal/20 border-none"
          onClick={() => setModalOpen(true)}
        >
          Unduh PDF
        </Button>
        <Button
          icon={<PrinterOutlined />}
          className="w-full h-12 rounded-2xl bg-navy-700 hover:bg-navy-700 font-bold text-xs text-white border-none"
          onClick={() => setModalOpen(true)}
        >
          Cetak A4
        </Button>
      </div>

      <RaportModalView
        visible={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Laporan Eksekutif - Yayasan"
      />
    </div>
  );
}
