"use client";

import React, { useState } from "react";
import { Button, message } from "antd";
import {
  CheckOutlined,
  CloseOutlined,
  ClockCircleOutlined,
  MedicineBoxOutlined,
  SaveOutlined,
  UserOutlined,
} from "@ant-design/icons";

type StatusAbsensi = "HADIR" | "IZIN" | "SAKIT" | "ALPA";

interface SantriAbsen {
  id: number;
  nama: string;
  status: StatusAbsensi;
  keterangan?: string;
}

export default function MobileGuruAbsensi() {
  const [selectedHalaqah, setSelectedHalaqah] = useState("Halaqah Abu Bakar");
  const [isSaving, setIsSaving] = useState(false);

  const [santriList, setSantriList] = useState<SantriAbsen[]>([
    { id: 1, nama: "Ahmad Zaki", status: "HADIR" },
    { id: 2, nama: "Fatimah Azzahra", status: "HADIR" },
    { id: 3, nama: "Muhammad Yusuf", status: "HADIR" },
    { id: 4, nama: "Zaynab Binti Ali", status: "IZIN" },
    { id: 5, nama: "Umar Al-Farooq", status: "HADIR" },
    { id: 6, nama: "Khadijah Al-Kubra", status: "HADIR" },
    { id: 7, nama: "Ali bin Abi Thalib", status: "SAKIT" },
  ]);

  const handleStatusChange = (id: number, status: StatusAbsensi) => {
    setSantriList((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status } : s))
    );
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      message.success("Absensi berhasil disimpan dan disinkronisasikan!");
    }, 800);
  };

  const hadirCount = santriList.filter((s) => s.status === "HADIR").length;
  const izinCount = santriList.filter((s) => s.status === "IZIN").length;
  const sakitCount = santriList.filter((s) => s.status === "SAKIT").length;
  const alpaCount = santriList.filter((s) => s.status === "ALPA").length;

  return (
    <div className="p-4 space-y-4">
      {/* Header HALAQAH Selector */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Halaqah Aktif
          </span>
          <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 font-medium">
            Hari Ini
          </span>
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {["Halaqah Abu Bakar", "Halaqah Umar"].map((item) => (
            <button
              key={item}
              onClick={() => setSelectedHalaqah(item)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex-shrink-0 ${
                selectedHalaqah === item
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* Ringkasan Kehadiran */}
      <div className="grid grid-cols-4 gap-2 text-center">
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-2.5">
          <div className="text-xs text-emerald-400 font-medium mb-0.5">Hadir</div>
          <div className="text-lg font-bold text-white">{hadirCount}</div>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-2.5">
          <div className="text-xs text-blue-400 font-medium mb-0.5">Izin</div>
          <div className="text-lg font-bold text-white">{izinCount}</div>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-2.5">
          <div className="text-xs text-amber-400 font-medium mb-0.5">Sakit</div>
          <div className="text-lg font-bold text-white">{sakitCount}</div>
        </div>
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-2.5">
          <div className="text-xs text-rose-400 font-medium mb-0.5">Alpa</div>
          <div className="text-lg font-bold text-white">{alpaCount}</div>
        </div>
      </div>

      {/* Daftar Santri dengan Satu-Tangan Switch */}
      <div className="space-y-2.5">
        <h3 className="text-sm font-bold text-slate-300">
          Daftar Santri ({santriList.length})
        </h3>
        {santriList.map((santri) => (
          <div
            key={santri.id}
            className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 flex flex-col gap-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-bold text-xs">
                  {santri.nama.charAt(0)}
                </div>
                <span className="text-sm font-semibold text-white">
                  {santri.nama}
                </span>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  santri.status === "HADIR"
                    ? "bg-emerald-500/15 text-emerald-400"
                    : santri.status === "IZIN"
                    ? "bg-blue-500/15 text-blue-400"
                    : santri.status === "SAKIT"
                    ? "bg-amber-500/15 text-amber-400"
                    : "bg-rose-500/15 text-rose-400"
                }`}
              >
                {santri.status}
              </span>
            </div>

            {/* Switch Tombol Satu-Tangan (4 Opsi) */}
            <div className="grid grid-cols-4 gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800/80">
              <button
                type="button"
                onClick={() => handleStatusChange(santri.id, "HADIR")}
                className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                  santri.status === "HADIR"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <CheckOutlined className="text-[10px]" />
                <span>Hadir</span>
              </button>
              <button
                type="button"
                onClick={() => handleStatusChange(santri.id, "IZIN")}
                className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                  santri.status === "IZIN"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <ClockCircleOutlined className="text-[10px]" />
                <span>Izin</span>
              </button>
              <button
                type="button"
                onClick={() => handleStatusChange(santri.id, "SAKIT")}
                className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                  santri.status === "SAKIT"
                    ? "bg-amber-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <MedicineBoxOutlined className="text-[10px]" />
                <span>Sakit</span>
              </button>
              <button
                type="button"
                onClick={() => handleStatusChange(santri.id, "ALPA")}
                className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                  santri.status === "ALPA"
                    ? "bg-rose-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <CloseOutlined className="text-[10px]" />
                <span>Alpa</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Sticky Tombol Simpan */}
      <div className="sticky bottom-20 pt-2 z-30">
        <Button
          type="primary"
          icon={<SaveOutlined />}
          loading={isSaving}
          onClick={handleSave}
          className="w-full h-12 rounded-2xl bg-blue-600 hover:bg-blue-500 font-bold text-sm shadow-xl shadow-blue-500/25 border-none"
        >
          Simpan Absensi Hari Ini
        </Button>
      </div>
    </div>
  );
}
