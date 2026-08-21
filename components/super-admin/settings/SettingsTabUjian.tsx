import React from "react";
import { InputNumber, Switch, Divider } from "antd";

export interface SettingsTabUjianProps {
  kkmDefault: number;
  setKkmDefault: (v: number) => void;
  bobotKelancaran: number;
  setBobotKelancaran: (v: number) => void;
  bobotTajwid: number;
  setBobotTajwid: (v: number) => void;
  defaultSoalMhq: number;
  setDefaultSoalMhq: (v: number) => void;
  autoVerifikasiUjian: boolean;
  setAutoVerifikasiUjian: (v: boolean) => void;
}

export function SettingsTabUjian({
  kkmDefault,
  setKkmDefault,
  bobotKelancaran,
  setBobotKelancaran,
  bobotTajwid,
  setBobotTajwid,
  defaultSoalMhq,
  setDefaultSoalMhq,
  autoVerifikasiUjian,
  setAutoVerifikasiUjian,
}: SettingsTabUjianProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
      {/* CARD 1: KKM & Bobot */}
      <div className="bg-slate-50/70 border border-slate-200 p-6 rounded-2xl space-y-4 shadow-sm">
        <div className="border-b border-slate-200 pb-3">
          <h3 className="text-base font-bold text-slate-800 m-0">KKM & Standar Kelulusan</h3>
          <p className="text-xs text-slate-500 m-0">Batas kelulusan (KKM) minimum nilai ujian tahfizh</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Batas KKM Minimum (0-100)
            </label>
            <InputNumber
              min={50}
              max={90}
              value={kkmDefault}
              onChange={(val) => setKkmDefault(Number(val || 70))}
              className="w-full text-center font-bold"
              size="large"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Default Jumlah Soal MHQ
            </label>
            <InputNumber
              min={1}
              max={10}
              value={defaultSoalMhq}
              onChange={(val) => setDefaultSoalMhq(Number(val || 3))}
              className="w-full text-center font-bold"
              size="large"
            />
          </div>
        </div>

        <Divider className="my-3" />

        <div>
          <div className="text-xs font-bold text-slate-700 mb-2">
            Standar Bobot Penilaian (% Total = 100%)
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] text-slate-500 block">Bobot Kelancaran</label>
              <InputNumber
                min={10}
                max={90}
                value={bobotKelancaran}
                onChange={(val) => setBobotKelancaran(Number(val || 50))}
                className="w-full font-bold"
                addonAfter="%"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-500 block">Bobot Tajwid & Fashahah</label>
              <InputNumber
                min={10}
                max={90}
                value={bobotTajwid}
                onChange={(val) => setBobotTajwid(Number(val || 50))}
                className="w-full font-bold"
                addonAfter="%"
              />
            </div>
          </div>
        </div>
      </div>

      {/* CARD 2: Otomatisasi Verifikasi */}
      <div className="bg-slate-50/70 border border-slate-200 p-6 rounded-2xl space-y-5 shadow-sm">
        <div className="border-b border-slate-200 pb-3">
          <h3 className="text-base font-bold text-slate-800 m-0">Alur Verifikasi Nilai</h3>
          <p className="text-xs text-slate-500 m-0">Aturan persetujuan nilai sebelum dirilis ke raport</p>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-bold text-slate-800">
              Auto-Verifikasi Nilai Ujian
            </div>
            <div className="text-xs text-slate-500">
              Rilis langsung nilai ujian guru tanpa persetujuan manual kepala tahfizh
            </div>
          </div>
          <Switch
            checked={autoVerifikasiUjian}
            onChange={(val) => setAutoVerifikasiUjian(val)}
          />
        </div>
      </div>
    </div>
  );
}
