"use client";

import React from "react";
import { Select, Input, Button } from "antd";
import {
  SaveOutlined,
  CloseOutlined,
} from "@ant-design/icons";

interface HafalanFormContentProps {
  santriList: Array<{ id: number; namaLengkap: string }>;
  selectedSantriId: number | null;
  onSantriChange: (id: number | undefined) => void;
  jenisSetoran: "Ziyadah" | "Murojaah";
  onJenisChange: (jenis: "Ziyadah" | "Murojaah") => void;
  suratInput: string;
  onSuratChange: (value: string) => void;
  ayatStart: string;
  onAyatStartChange: (value: string) => void;
  ayatEnd: string;
  onAyatEndChange: (value: string) => void;
  nilai: "Lancar" | "Sedang" | "Perlu Ulang";
  onNilaiChange: (value: "Lancar" | "Sedang" | "Perlu Ulang") => void;
  catatan: string;
  onCatatanChange: (value: string) => void;
  isSubmitting: boolean;
  onSubmit: () => void;
  onClose: () => void;
  title?: string;
}

const SURAT_OPTIONS = [
  { value: "Al-Baqarah", label: "2. Al-Baqarah" },
  { value: "Ali 'Imran", label: "3. Ali 'Imran" },
  { value: "An-Nisa", label: "4. An-Nisa" },
  { value: "Al-Kahfi", label: "18. Al-Kahfi" },
  { value: "Yasin", label: "36. Yasin" },
  { value: "Al-Mulk", label: "67. Al-Mulk" },
  { value: "An-Naba", label: "78. An-Naba" },
];

const JENIS_OPTIONS = ["Ziyadah", "Murojaah"] as const;
const NILAI_OPTIONS = ["Lancar", "Sedang", "Perlu Ulang"] as const;

export function HafalanFormContent({
  santriList,
  selectedSantriId,
  onSantriChange,
  jenisSetoran,
  onJenisChange,
  suratInput,
  onSuratChange,
  ayatStart,
  onAyatStartChange,
  ayatEnd,
  onAyatEndChange,
  nilai,
  onNilaiChange,
  catatan,
  onCatatanChange,
  isSubmitting,
  onSubmit,
  onClose,
  title = "Setoran Hafalan",
}: HafalanFormContentProps) {
  return (
    <div className="space-y-4 pb-8">
      <div>
        <label className="text-xs font-semibold text-slate-400 block mb-1.5">
          Pilih Santri (Halaqah Sendiri)
        </label>
        <Select
          value={selectedSantriId || undefined}
          onChange={(val) => onSantriChange(val)}
          className="w-full min-h-[44px]"
          options={santriList.map((s) => ({
            value: s.id,
            label: s.namaLengkap,
          }))}
          style={{ fontSize: "14px" }}
        />
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-400 block mb-1.5">
          Jenis Setoran
        </label>
        <div className="grid grid-cols-2 gap-2.5">
          {JENIS_OPTIONS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => onJenisChange(item)}
              className={`min-h-[44px] rounded-xl text-sm font-semibold transition-all duration-150 ${
                jenisSetoran === item
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20 active:scale-[0.98]"
                  : "bg-navy-950 text-slate-400 border border-navy-800 hover:text-white hover:border-navy-700 active:bg-navy-900"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-400 block mb-1.5">
          Pilih Surat
        </label>
        <Select
          value={suratInput}
          onChange={onSuratChange}
          className="w-full min-h-[44px]"
          options={SURAT_OPTIONS}
          style={{ fontSize: "14px" }}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1.5">
            Dari Ayat
          </label>
          <Input
            value={ayatStart}
            onChange={(e) => onAyatStartChange(e.target.value)}
            type="number"
            className="min-h-[44px] bg-navy-950 border-navy-800 text-white text-sm"
            inputMode="numeric"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1.5">
            Sampai Ayat
          </label>
          <Input
            value={ayatEnd}
            onChange={(e) => onAyatEndChange(e.target.value)}
            type="number"
            className="min-h-[44px] bg-navy-950 border-navy-800 text-white text-sm"
            inputMode="numeric"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-400 block mb-1.5">
          Kualitas Hafalan
        </label>
        <div className="grid grid-cols-3 gap-2">
          {NILAI_OPTIONS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => onNilaiChange(item as "Lancar" | "Sedang" | "Perlu Ulang")}
              className={`min-h-[44px] rounded-xl text-xs font-semibold transition-all duration-150 ${
                nilai === item
                  ? "bg-blue-green text-white shadow-md shadow-brand-teal/20 active:scale-[0.98]"
                  : "bg-navy-950 text-slate-400 border border-navy-800 hover:text-white hover:border-navy-700 active:bg-navy-900"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-400 block mb-1.5">
          Catatan Guru (Tajwid / Mukhraj)
        </label>
        <Input.TextArea
          rows={3}
          value={catatan}
          onChange={(e) => onCatatanChange(e.target.value)}
          placeholder="Contoh: Perhatikan ghunnah pada ayat ke-5..."
          className="min-h-[44px] bg-navy-950 border-navy-800 text-white rounded-xl placeholder:text-slate-600 text-sm resize-none"
        />
      </div>

      <div className="pt-2 flex gap-2.5">
        <Button
          type="default"
          icon={<CloseOutlined />}
          onClick={onClose}
          className="flex-1 min-h-[48px] rounded-2xl bg-navy-800/80 hover:bg-navy-800 text-slate-200 font-semibold text-sm border border-navy-700 active:bg-navy-900"
        >
          Batal
        </Button>
        <Button
          type="primary"
          icon={<SaveOutlined />}
          loading={isSubmitting}
          onClick={onSubmit}
          className="flex-1 min-h-[48px] rounded-2xl bg-gradient-to-r from-blue-green to-brand-teal hover:from-blue-green/90 hover:to-brand-teal/90 text-white font-semibold text-sm shadow-xl shadow-brand-teal/25 border-none active:scale-[0.98]"
        >
          Simpan Setoran
        </Button>
      </div>
    </div>
  );
}

export default HafalanFormContent;