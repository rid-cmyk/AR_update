"use client";

import React, { useState } from "react";
import { Button, Input, Select, message } from "antd";
import {
  BookOutlined,
  CheckCircleOutlined,
  PlusOutlined,
  SearchOutlined,
  SaveOutlined,
  StarFilled,
  SyncOutlined,
  UserOutlined,
} from "@ant-design/icons";
import MobileBottomSheet from "@/components/mobile/MobileBottomSheet";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { useMobileTheme } from "@/components/mobile/theme/MobileThemeProvider";

interface SantriHafalan {
  id: number;
  nama: string;
  juz: string;
  lastSurat: string;
  lastAyat: string;
  status: "Lancar" | "Sedang" | "Perlu Ulang";
}

export default function MobileGuruHafalan() {
  const { isOnline } = usePWAInstall();
  const { arabicFontSize } = useMobileTheme();

  const getArabicSizeClass = () => {
    if (arabicFontSize === "xlarge") return "text-4xl leading-[2.8]";
    if (arabicFontSize === "large") return "text-3xl leading-[2.5]";
    return "text-2xl leading-[2.2]";
  };

  const [activeTab, setActiveTab] = useState<"SETORAN" | "MUSHAF">("SETORAN");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedSantri, setSelectedSantri] = useState<SantriHafalan | null>(null);

  // Form states
  const [suratInput, setSuratInput] = useState("Al-Baqarah");
  const [ayatStart, setAyatStart] = useState("1");
  const [ayatEnd, setAyatEnd] = useState("10");
  const [nilai, setNilai] = useState<"Lancar" | "Sedang" | "Perlu Ulang">("Lancar");
  const [catatan, setCatatan] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [santriList, setSantriList] = useState<SantriHafalan[]>([
    {
      id: 1,
      nama: "Ahmad Zaki",
      juz: "Juz 2",
      lastSurat: "Al-Baqarah",
      lastAyat: "Ayat 145",
      status: "Lancar",
    },
    {
      id: 2,
      nama: "Fatimah Azzahra",
      juz: "Juz 3",
      lastSurat: "Ali 'Imran",
      lastAyat: "Ayat 10",
      status: "Lancar",
    },
    {
      id: 3,
      nama: "Muhammad Yusuf",
      juz: "Juz 4",
      lastSurat: "An-Nisa",
      lastAyat: "Ayat 24",
      status: "Perlu Ulang",
    },
    {
      id: 4,
      nama: "Zaynab Binti Ali",
      juz: "Juz 29",
      lastSurat: "Al-Mulk",
      lastAyat: "Ayat 30",
      status: "Lancar",
    },
  ]);

  const openInputForm = (santri: SantriHafalan) => {
    setSelectedSantri(santri);
    setSuratInput(santri.lastSurat);
    setNilai("Lancar");
    setCatatan("");
    setIsSheetOpen(true);
  };

  const handleSubmitSetoran = () => {
    if (!selectedSantri) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSheetOpen(false);
      setSantriList((prev) =>
        prev.map((s) =>
          s.id === selectedSantri.id
            ? {
                ...s,
                lastSurat: suratInput,
                lastAyat: `Ayat ${ayatEnd}`,
                status: nilai,
              }
            : s
        )
      );
      if (isOnline) {
        message.success(`Setoran ${selectedSantri.nama} berhasil disimpan ke server!`);
      } else {
        message.warning(`Mode Offline: Setoran ${selectedSantri.nama} disimpan di lokal dan akan disinkronisasi otomatis.`);
      }
    }, 700);
  };

  const filteredSantri = santriList.filter((s) =>
    s.nama.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 space-y-4">
      {/* Tab Switcher */}
      <div className="grid grid-cols-2 p-1 bg-slate-900 rounded-2xl border border-slate-800">
        <button
          onClick={() => setActiveTab("SETORAN")}
          className={`py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "SETORAN"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Input Setoran
        </button>
        <button
          onClick={() => setActiveTab("MUSHAF")}
          className={`py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "MUSHAF"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Mushaf Al-Quran
        </button>
      </div>

      {activeTab === "SETORAN" ? (
        <>
          {/* Cari Santri */}
          <div className="relative">
            <Input
              prefix={<SearchOutlined className="text-slate-500 mr-1" />}
              placeholder="Cari nama santri dalam halaqah..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-900 border-slate-800 rounded-2xl h-11 text-white placeholder:text-slate-500"
            />
          </div>

          {/* Daftar Kartu Santri */}
          <div className="space-y-2.5">
            {filteredSantri.map((santri) => (
              <div
                key={santri.id}
                onClick={() => openInputForm(santri)}
                className="bg-slate-900/80 border border-slate-800/80 hover:border-blue-500/50 rounded-2xl p-4 flex items-center justify-between cursor-pointer tap-active transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-sm">
                    {santri.nama.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{santri.nama}</h4>
                    <p className="text-xs text-slate-400">
                      Terakhir: <span className="text-slate-200">{santri.lastSurat}</span> ({santri.lastAyat})
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                      santri.status === "Lancar"
                        ? "bg-emerald-500/15 text-emerald-400"
                        : "bg-amber-500/15 text-amber-400"
                    }`}
                  >
                    {santri.status}
                  </span>
                  <PlusOutlined className="text-blue-400 text-xs font-bold" />
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Sheet Input Hafalan */}
          <MobileBottomSheet
            open={isSheetOpen}
            onClose={() => setIsSheetOpen(false)}
            title={`Setoran: ${selectedSantri?.nama || ""}`}
          >
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">
                  Pilih Surat
                </label>
                <Select
                  value={suratInput}
                  onChange={setSuratInput}
                  className="w-full h-11"
                  options={[
                    { value: "Al-Baqarah", label: "2. Al-Baqarah" },
                    { value: "Ali 'Imran", label: "3. Ali 'Imran" },
                    { value: "An-Nisa", label: "4. An-Nisa" },
                    { value: "Al-Kahfi", label: "18. Al-Kahfi" },
                    { value: "Yasin", label: "36. Yasin" },
                    { value: "Al-Mulk", label: "67. Al-Mulk" },
                    { value: "An-Naba", label: "78. An-Naba" },
                  ]}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">
                    Dari Ayat
                  </label>
                  <Input
                    value={ayatStart}
                    onChange={(e) => setAyatStart(e.target.value)}
                    type="number"
                    className="h-11 bg-slate-950 border-slate-800 text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">
                    Sampai Ayat
                  </label>
                  <Input
                    value={ayatEnd}
                    onChange={(e) => setAyatEnd(e.target.value)}
                    type="number"
                    className="h-11 bg-slate-950 border-slate-800 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">
                  Kualitas Hafalan
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["Lancar", "Sedang", "Perlu Ulang"] as const).map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setNilai(item)}
                      className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                        nilai === item
                          ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                          : "bg-slate-950 text-slate-400 border border-slate-800 hover:text-white"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">
                  Catatan Guru (Tajwid / Mukhraj)
                </label>
                <Input.TextArea
                  rows={3}
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  placeholder="Contoh: Perhatikan ghunnah pada ayat ke-5..."
                  className="bg-slate-950 border-slate-800 text-white rounded-xl placeholder:text-slate-600"
                />
              </div>

              <div className="pt-2">
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  loading={isSubmitting}
                  onClick={handleSubmitSetoran}
                  className="w-full h-12 rounded-2xl bg-blue-600 hover:bg-blue-500 font-bold text-sm shadow-xl shadow-blue-500/25 border-none"
                >
                  Simpan Setoran
                </Button>
              </div>
            </div>
          </MobileBottomSheet>
        </>
      ) : (
        /* Mushaf Al-Quran Mode */
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center space-y-4">
          <div className="inline-block px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
            ✓ Offline Cached (Siap Pakai di Masjid)
          </div>
          <h3 className="text-lg font-bold text-white">
            Surat Al-Mulk (67) — Ayat 1-5
          </h3>
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800/80 shadow-inner">
            <p className={`quran-text ${getArabicSizeClass()} text-emerald-300 mb-6`}>
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </p>
            <p className={`quran-text ${getArabicSizeClass()} text-slate-200 text-right`}>
              تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ ﴿١﴾ الَّذِي خَلَقَ الْمَوْتَ وَالْحَيَاةَ لِيَبْلُوَكُمْ أَيُّكُمْ أَحْسَنُ عَمَلًا ۚ وَهُوَ الْعَزِيزُ الْغَفُورُ ﴿٢﴾
            </p>
          </div>
          <p className="text-xs text-slate-400">
            Geser kiri/kanan untuk berpindah ayat atau surat.
          </p>
        </div>
      )}
    </div>
  );
}
