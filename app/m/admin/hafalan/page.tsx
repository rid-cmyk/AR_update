"use client";

import React, { useEffect, useState } from "react";
import { CalendarOutlined } from "@ant-design/icons";

interface HafalanItem {
  id: number;
  santriName: string;
  surah: string;
  juz: number;
  ayat: string;
  nilai: string;
  tanggal: string;
}

export default function MobileAdminHafalan() {
  const [hafalanList, setHafalanList] = useState<HafalanItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/hafalan")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setHafalanList(data);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="p-4 space-y-4">
      {/* Header Halaman */}
      <div>
        <h2 className="text-lg font-bold text-white">Rekap Hafalan</h2>
        <p className="text-xs text-slate-400">Riwayat setoran hafalan seluruh santri</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400 text-sm">Memuat data hafalan...</div>
      ) : hafalanList.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-sm">Belum ada data setoran hafalan</div>
      ) : (
        <div className="space-y-3">
          {hafalanList.map((item) => (
            <div
              key={item.id}
              className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sky-400">Juz {item.juz} • {item.surah}</span>
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <CalendarOutlined /> {new Date(item.tanggal).toLocaleDateString('id-ID')}
                </span>
              </div>
              <h4 className="text-sm font-semibold text-white">{item.santriName || "Santri"}</h4>
              <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800">
                <span>Ayat: {item.ayat}</span>
                <span className="font-semibold text-emerald-400">Nilai: {item.nilai}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
