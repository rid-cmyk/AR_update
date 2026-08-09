"use client";

import React, { useState, useEffect } from "react";
import { Input, Progress, Skeleton } from "antd";
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
    <div className="p-4 space-y-4 pb-20">
      {/* Ringkasan Progress Juz */}
      <div className="bg-navy-900 border border-navy-800 rounded-2xl p-4 space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
          <span>Progress Keseluruhan Hafalan Al-Qur&apos;an</span>
          <span className="text-emerald-400">{progressPercent}%</span>
        </div>
        <Progress
          percent={progressPercent}
          showInfo={false}
          strokeColor="#10b981"
          trailColor="#013a5e"
        />
        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
          <span>{overview.totalAyatZiyadah || 0} Ayat Dihafal</span>
          <span>{overview.totalAyatMurajaah || 0} Ayat Muroja&apos;ah</span>
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

      {/* Daftar Setoran */}
      <div className="space-y-3">
        {loading ? (
          <Skeleton active paragraph={{ rows: 3 }} />
        ) : filteredRiwayat.length > 0 ? (
          filteredRiwayat.map((item) => (
            <div
              key={item.id}
              className="bg-navy-900/80 border border-navy-800/80 rounded-2xl p-4 space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">
                    Surat {item.surat}
                  </h4>
                  <span className="text-xs text-emerald-400 font-medium">
                    Ayat {item.ayatMulai} - {item.ayatSelesai}
                  </span>
                </div>
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    item.status === "ziyadah" || item.status === "lancar"
                      ? "bg-emerald-500/15 text-emerald-400"
                      : "bg-amber-500/15 text-amber-400"
                  }`}
                >
                  {item.status.toUpperCase()}
                </span>
              </div>

              {item.keterangan && (
                <div className="bg-navy-950/70 rounded-xl p-3 border border-navy-800 text-xs text-slate-300 italic">
                  &ldquo;{item.keterangan}&rdquo;
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
    </div>
  );
}
