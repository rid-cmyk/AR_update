import React from "react";
import { InputNumber, Switch } from "antd";

export interface SettingsTabHalaqahProps {
  maxSantriPerHalaqah: number;
  setMaxSantriPerHalaqah: (v: number) => void;
  pendaftaranMandiri: boolean;
  setPendaftaranMandiri: (v: boolean) => void;
  autoPlotHalaqah: boolean;
  setAutoPlotHalaqah: (v: boolean) => void;
}

export function SettingsTabHalaqah({
  maxSantriPerHalaqah,
  setMaxSantriPerHalaqah,
  pendaftaranMandiri,
  setPendaftaranMandiri,
  autoPlotHalaqah,
  setAutoPlotHalaqah,
}: SettingsTabHalaqahProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
      {/* CARD 1: Kapasitas Halaqah */}
      <div className="bg-slate-50/70 border border-slate-200 p-6 rounded-2xl space-y-4 shadow-sm">
        <div className="border-b border-slate-200 pb-3">
          <h3 className="text-base font-bold text-slate-800 m-0">Batasan Kelompok Halaqah</h3>
          <p className="text-xs text-slate-500 m-0">Kapasitas dan rasio guru terhadap santri tahfizh</p>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Batas Maksimal Santri per Halaqah
            </label>
            <InputNumber
              min={5}
              max={50}
              value={maxSantriPerHalaqah}
              onChange={(val) => setMaxSantriPerHalaqah(Number(val || 25))}
              className="w-32 text-center font-bold"
              size="large"
            />
            <span className="text-xs text-slate-500 ml-2">santri / ustadz</span>
          </div>
        </div>
      </div>

      {/* CARD 2: Pendaftaran & Plotting */}
      <div className="bg-slate-50/70 border border-slate-200 p-6 rounded-2xl space-y-5 shadow-sm">
        <div className="border-b border-slate-200 pb-3">
          <h3 className="text-base font-bold text-slate-800 m-0">Otomatisasi Plotting</h3>
          <p className="text-xs text-slate-500 m-0">Atur pendaftaran santri baru ke kelompok halaqah</p>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-bold text-slate-800">
              Pendaftaran Halaqah Mandiri
            </div>
            <div className="text-xs text-slate-500">
              Izinkan santri memilih ustadz pembimbing sendiri
            </div>
          </div>
          <Switch
            checked={pendaftaranMandiri}
            onChange={(val) => setPendaftaranMandiri(val)}
          />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-bold text-slate-800">
              Plotting Halaqah Otomatis
            </div>
            <div className="text-xs text-slate-500">
              Seimbangkan jumlah santri pada tiap halaqah baru
            </div>
          </div>
          <Switch
            checked={autoPlotHalaqah}
            onChange={(val) => setAutoPlotHalaqah(val)}
          />
        </div>
      </div>
    </div>
  );
}
