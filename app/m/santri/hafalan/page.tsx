"use client";

import React, { useState, useEffect } from "react";
import { Input, Progress, Skeleton } from "antd";
import { DashboardHeader } from "@/components/ui/dashboard-header";
import { MobileCard } from "@/components/mobile/dashboard";
import {
  BookOutlined,
  SearchOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";

interface HafalanRecord {
  id: number;
  tanggal: string;
  surat: string;
  ayatMulai: number;
  ayatSelesai: number;
  status: string;
  keterangan: string;
}

export default function MobileSantriHafalan() {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<HafalanRecord[]>([]);
  const [overview, setOverview] = useState<{
    totalAyatZiyadah?: number;
    totalAyatMurajaah?: number;
  }>({ totalAyatZiyadah: 0, totalAyatMurajaah: 0 });

  useEffect(() => {
    const fetchHafalan = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/santri/hafalan");
        if (res.ok) {
          const json = await res.json();
          if (json.data) {
            setRecords(json.data.recentHafalan || []);
            if (json.data.overview) {
              setOverview(json.data.overview);
            }
          }
        }
      } catch (e) {
        console.error("Gagal memuat riwayat hafalan santri:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchHafalan();
  }, []);

  const progressPercent = Math.min(
    Math.round(((overview.totalAyatZiyadah || 0) / 6236) * 100),
    100
  );

  const filteredRiwayat = records.filter(
    (item) =>
      item.surat.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.keterangan &&
        item.keterangan.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-[#f4f9fb] p-4 space-y-4 pb-24">
      {/* Header Banner */}
      <DashboardHeader
        badge={
          <span className="inline-flex items-center gap-1.5">
            <BookOutlined />
            Tahfidz
          </span>
        }
        title="Riwayat Hafalan"
        subtitle="Pantau catatan setoran ziyadah dan muroja'ah hafalan Al-Qur'anmu."
      />

      {/* Ringkasan Progress Juz */}
      <MobileCard className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-deep-space">
          <span>Progress Keseluruhan Hafalan Al-Qur&apos;an</span>
          <span className="text-blue-green">{progressPercent}%</span>
        </div>
        <Progress
          percent={progressPercent}
          showInfo={false}
          strokeColor="#219ebc"
          trailColor="#dbe7ee"
        />
        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
          <span>{overview.totalAyatZiyadah || 0} Ayat Dihafal</span>
          <span>{overview.totalAyatMurajaah || 0} Ayat Muroja&apos;ah</span>
        </div>
      </MobileCard>

      {/* Search Bar */}
      <Input
        prefix={<SearchOutlined className="text-slate-400 mr-1" />}
        placeholder="Cari surat atau catatan setoran..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="bg-white border-slate-200 rounded-2xl h-11 text-deep-space placeholder:text-slate-400 shadow-sm"
      />

      {/* Daftar Setoran */}
      <div className="space-y-3">
        {loading ? (
          <Skeleton active paragraph={{ rows: 3 }} />
        ) : filteredRiwayat.length > 0 ? (
          filteredRiwayat.map((item) => (
            <MobileCard
              key={item.id}
              className="space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-deep-space">
                    Surat {item.surat}
                  </h4>
                  <span className="text-xs text-blue-green font-medium">
                    Ayat {item.ayatMulai} - {item.ayatSelesai}
                  </span>
                </div>
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    item.status === "ziyadah" || item.status === "lancar"
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-amber-50 text-princeton"
                  }`}
                >
                  {item.status.toUpperCase()}
                </span>
              </div>

              {item.keterangan && (
                <div className="bg-[#f4f9fb] rounded-xl p-3 border border-slate-100 text-xs text-slate-500 italic">
                  &ldquo;{item.keterangan}&rdquo;
                </div>
              )}

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                <div className="flex items-center gap-1">
                  <ClockCircleOutlined />
                  <span>{new Date(item.tanggal).toLocaleDateString("id-ID")}</span>
                </div>
                <span className="text-teal-600">Terverifikasi</span>
              </div>
            </MobileCard>
          ))
        ) : (
          <MobileCard className="py-8 text-center text-slate-400 text-xs">
            Belum ada riwayat setoran hafalan tercatat.
          </MobileCard>
        )}
      </div>
    </div>
  );
}
