"use client";

import React from "react";
import { Drawer, Radio, Segmented } from "antd";
import {
  BgColorsOutlined,
  FontSizeOutlined,
  CompressOutlined,
  CheckCircleFilled,
} from "@ant-design/icons";
import {
  useMobileTheme,
  AppTheme,
  ArabicFontSize,
  CardDensity,
} from "./MobileThemeProvider";

interface MobileThemeModalProps {
  roleTitle?: string;
}

export default function MobileThemeModal({ roleTitle }: MobileThemeModalProps) {
  const {
    theme,
    setTheme,
    arabicFontSize,
    setArabicFontSize,
    density,
    setDensity,
    isModalOpen,
    setIsModalOpen,
  } = useMobileTheme();

  const isGuru = roleTitle === "Guru";

  const themes: {
    key: AppTheme;
    title: string;
    description: string;
    icon: string;
    previewBg: string;
    previewText: string;
  }[] = [
    {
      key: "dark",
      title: "OLED Dark Mode",
      description: "Gelap elegan, kontras tinggi & hemat baterai OLED",
      icon: "🌙",
      previewBg: "bg-slate-950 border-slate-800",
      previewText: "text-slate-100",
    },
    {
      key: "light",
      title: "Light Clean Mode",
      description: "Putih bersih, nyaman dibaca siang hari",
      icon: "☀️",
      previewBg: "bg-white border-slate-300",
      previewText: "text-slate-900",
    },
    {
      key: "sepia",
      title: "Mushaf Madinah (Sepia)",
      description: "Nuansa emas perkamen yang tenang di mata",
      icon: "📜",
      previewBg: "bg-[#271d10] border-amber-600/40",
      previewText: "text-amber-100",
    },
  ];

  return (
    <Drawer
      title={
        <div className="flex items-center gap-2 text-white">
          <BgColorsOutlined className="text-amber-400" />
          <span className="text-base font-bold">Kustomisasi Visual UI/UX</span>
        </div>
      }
      placement="bottom"
      onClose={() => setIsModalOpen(false)}
      open={isModalOpen}
      height="auto"
      styles={{
        header: {
          backgroundColor: "#0f172a",
          borderBottom: "1px solid #1e293b",
          padding: "16px 20px",
        },
        body: {
          backgroundColor: "#0f172a",
          padding: "20px",
          color: "#e2e8f0",
        },
      }}
    >
      <div className="space-y-6 pb-4">
        {/* 1. Pilih Tema Warna Visual */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              1. Tema Warna Aplikasi
            </span>
            <span className="text-xs text-amber-400 font-medium capitalize">
              {theme}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {themes.map((item) => {
              const selected = theme === item.key;
              return (
                <div
                  key={item.key}
                  onClick={() => setTheme(item.key)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                    selected
                      ? "border-amber-400 bg-amber-400/10 shadow-md"
                      : "border-slate-800 bg-slate-900/60 hover:bg-slate-800/40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                        <span>{item.title}</span>
                      </h4>
                      <p className="text-xs text-slate-400">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  {selected && (
                    <CheckCircleFilled className="text-amber-400 text-lg flex-shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Mode Kepadatan Kartu (Density) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              2. Kepadatan Tata Letak Kartu
            </span>
            <span className="text-xs text-amber-400 font-medium capitalize">
              {density === "spacious" ? "Nyaman" : "Ringkas"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div
              onClick={() => setDensity("spacious")}
              className={`p-3 rounded-2xl border cursor-pointer text-center ${
                density === "spacious"
                  ? "border-amber-400 bg-amber-400/10 text-white font-bold"
                  : "border-slate-800 bg-slate-900/60 text-slate-400"
              }`}
            >
              <div className="text-base mb-0.5">🖼️</div>
              <div className="text-xs">Nyaman (Spacious)</div>
              <div className="text-[10px] text-slate-500">Spasi & padding lega</div>
            </div>

            <div
              onClick={() => setDensity("compact")}
              className={`p-3 rounded-2xl border cursor-pointer text-center ${
                density === "compact"
                  ? "border-amber-400 bg-amber-400/10 text-white font-bold"
                  : "border-slate-800 bg-slate-900/60 text-slate-400"
              }`}
            >
              <div className="text-base mb-0.5">📐</div>
              <div className="text-xs">Ringkas (Compact)</div>
              <div className="text-[10px] text-slate-500">Muat banyak baris</div>
            </div>
          </div>
        </div>

        {/* 3. Pengatur Ukuran Huruf Al-Quran (KHUSUS ROLE GURU) */}
        {isGuru && (
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider">
                <FontSizeOutlined />
                <span>3. Ukuran Huruf Mushaf Al-Quran (Khusus Guru)</span>
              </div>
              <span className="text-xs font-medium text-slate-300 capitalize">
                {arabicFontSize === "xlarge"
                  ? "Sangat Besar"
                  : arabicFontSize === "large"
                  ? "Besar"
                  : "Normal"}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setArabicFontSize("normal")}
                className={`py-2 rounded-xl border text-xs font-semibold ${
                  arabicFontSize === "normal"
                    ? "border-amber-400 bg-amber-500/20 text-white"
                    : "border-slate-800 bg-slate-900 text-slate-400"
                }`}
              >
                A (Normal)
              </button>

              <button
                type="button"
                onClick={() => setArabicFontSize("large")}
                className={`py-2 rounded-xl border text-xs font-semibold ${
                  arabicFontSize === "large"
                    ? "border-amber-400 bg-amber-500/20 text-white"
                    : "border-slate-800 bg-slate-900 text-slate-400"
                }`}
              >
                A+ (Besar)
              </button>

              <button
                type="button"
                onClick={() => setArabicFontSize("xlarge")}
                className={`py-2 rounded-xl border text-xs font-semibold ${
                  arabicFontSize === "xlarge"
                    ? "border-amber-400 bg-amber-500/20 text-white"
                    : "border-slate-800 bg-slate-900 text-slate-400"
                }`}
              >
                A++ (Sgt Besar)
              </button>
            </div>

            {/* Live Preview Arabic Text */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-center">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-2">
                Pratinjau Mushaf Guru
              </span>
              <p
                className={`font-serif text-amber-300 transition-all ${
                  arabicFontSize === "xlarge"
                    ? "text-3xl leading-[2.6]"
                    : arabicFontSize === "large"
                    ? "text-2xl leading-[2.4]"
                    : "text-xl leading-[2.1]"
                }`}
                style={{ direction: "rtl", fontFamily: "'Amiri Quran', serif" }}
              >
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </p>
            </div>
          </div>
        )}

        <div className="text-center pt-2">
          <button
            onClick={() => setIsModalOpen(false)}
            className="w-full py-3 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm shadow-lg shadow-amber-500/20 transition-all"
          >
            Terapkan & Simpan
          </button>
        </div>
      </div>
    </Drawer>
  );
}
