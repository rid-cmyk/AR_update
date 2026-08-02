"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Card,
  Button,
  Tag,
  InputNumber,
  Input,
  Select,
  Progress,
  message,
  Tabs,
  Badge,
} from "antd";
import {
  PauseCircleOutlined,
  CheckCircleOutlined,
  BookOutlined,
  UserOutlined,
  CalculatorOutlined,
  ArrowLeftOutlined,
  ReadOutlined,
} from "@ant-design/icons";
import { MushafDigital } from "./MushafDigital";

const { TextArea } = Input;
const { Option } = Select;

export interface LiveExamSplitScreenProps {
  santri: {
    id: number;
    nama: string;
    kelas?: string;
  };
  kategoriUjian: "kenaikan_juz" | "uas" | "mhq" | "tasmi";
  juzDari: number;
  juzSampai: number;
  jumlahSoalMhq?: number;
  onPause: (dataState: any) => void;
  onFinish: (dataState: any) => void;
  onBack?: () => void;
}

// Map Juz to start page in Mushaf
const JUZ_START_PAGE: Record<number, number> = {
  1: 1, 2: 22, 3: 42, 4: 62, 5: 82, 6: 102, 7: 122, 8: 142, 9: 162, 10: 182,
  11: 202, 12: 222, 13: 242, 14: 262, 15: 282, 16: 302, 17: 322, 18: 342, 19: 362, 20: 382,
  21: 402, 22: 422, 23: 442, 24: 462, 25: 482, 26: 502, 27: 522, 28: 542, 29: 562, 30: 582,
};

export function LiveExamSplitScreen({
  santri,
  kategoriUjian,
  juzDari,
  juzSampai,
  jumlahSoalMhq = 3,
  onPause,
  onFinish,
  onBack,
}: LiveExamSplitScreenProps) {
  // State for active Juz tab
  const [activeJuz, setActiveJuz] = useState<number>(juzDari);
  const [sheetState, setSheetState] = useState<'collapsed' | 'half' | 'full'>('collapsed');

  // State for Mushaf digital current page, auto synced when activeJuz changes
  const [mushafPage, setMushafPage] = useState<number>(JUZ_START_PAGE[juzDari] || 1);

  // Sync mushaf page whenever activeJuz changes!
  useEffect(() => {
    const startPage = JUZ_START_PAGE[activeJuz] || 1;
    setMushafPage(startPage);
  }, [activeJuz]);

  // A. State for Kenaikan Juz & UAS: map of juz -> number (0-100)
  const [nilaiPerJuz, setNilaiPerJuz] = useState<Record<number, number>>(() => {
    const init: Record<number, number> = {};
    for (let i = juzDari; i <= juzSampai; i++) {
      init[i] = 85; // default starting score
    }
    return init;
  });

  // B. State for MHQ: map of `${juz}-${soalIndex}` -> number
  const [nilaiMhq, setNilaiMhq] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    for (let j = juzDari; j <= juzSampai; j++) {
      for (let s = 1; s <= jumlahSoalMhq; s++) {
        init[`${j}-${s}`] = 90;
      }
    }
    return init;
  });

  // C. State for Tasmi': map of `${juz}-${pageOffset}` (1..20) -> potongan (0..)
  const [potonganTasmi, setPotonganTasmi] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    for (let j = juzDari; j <= juzSampai; j++) {
      for (let p = 1; p <= 20; p++) {
        init[`${j}-${p}`] = 0;
      }
    }
    return init;
  });

  // Catatan Guru
  const [catatan, setCatatan] = useState<string>("");

  // Automated Calculations
  const calculatedStats = useMemo(() => {
    const totalJuz = Math.max(1, juzSampai - juzDari + 1);

    if (kategoriUjian === "kenaikan_juz" || kategoriUjian === "uas") {
      let sum = 0;
      for (let i = juzDari; i <= juzSampai; i++) {
        sum += Number(nilaiPerJuz[i] || 0);
      }
      const rata = Number((sum / totalJuz).toFixed(1));
      return { total: sum, rataRata: rata, predikat: getPredikat(rata) };
    }

    if (kategoriUjian === "mhq") {
      let sum = 0;
      let totalSoal = 0;
      for (let j = juzDari; j <= juzSampai; j++) {
        for (let s = 1; s <= jumlahSoalMhq; s++) {
          sum += Number(nilaiMhq[`${j}-${s}`] || 0);
          totalSoal++;
        }
      }
      const rata = totalSoal > 0 ? Number((sum / totalSoal).toFixed(1)) : 0;
      return { total: sum, rataRata: rata, predikat: getPredikat(rata) };
    }

    if (kategoriUjian === "tasmi") {
      // Calculate total potongan for activeJuz or across all juz
      let totalPotongan = 0;
      for (let j = juzDari; j <= juzSampai; j++) {
        for (let p = 1; p <= 20; p++) {
          totalPotongan += Number(potonganTasmi[`${j}-${p}`] || 0);
        }
      }
      const nilaiAkhir = Math.max(0, 100 - totalPotongan);
      return { total: nilaiAkhir, rataRata: nilaiAkhir, predikat: getPredikat(nilaiAkhir) };
    }

    return { total: 0, rataRata: 0, predikat: "Maqbul" };
  }, [kategoriUjian, juzDari, juzSampai, nilaiPerJuz, nilaiMhq, potonganTasmi, jumlahSoalMhq]);

  function getPredikat(val: number) {
    if (val >= 90) return "Mumtaz (A)";
    if (val >= 80) return "Jayyid Jiddan (B)";
    if (val >= 70) return "Jayyid (C)";
    return "Maqbul (D)";
  }

  const handlePauseExam = () => {
    message.info("Sesi ujian disimpan sebagai Draft. Anda dapat melanjutkannya kapan saja.");
    onPause({
      santri,
      kategoriUjian,
      juzDari,
      juzSampai,
      nilaiPerJuz,
      nilaiMhq,
      potonganTasmi,
      catatan,
      stats: calculatedStats,
      status: "draft",
    });
  };

  const handleFinishExam = () => {
    message.success("Ujian Selesai! Nilai resmi telah disimpan.");
    onFinish({
      santri,
      kategoriUjian,
      juzDari,
      juzSampai,
      nilaiPerJuz,
      nilaiMhq,
      potonganTasmi,
      catatan,
      stats: calculatedStats,
      status: "selesai",
    });
  };

  // Generate Juz list array
  const juzList = useMemo(() => {
    const list: number[] = [];
    for (let i = juzDari; i <= juzSampai; i++) {
      list.push(i);
    }
    return list;
  }, [juzDari, juzSampai]);

  const renderFormContent = () => (
    <div className="space-y-6">
      {juzList.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800">
          {juzList.map((j) => (
            <button
              key={j}
              onClick={() => setActiveJuz(j)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeJuz === j
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700"
              }`}
            >
              Juz {j}
            </button>
          ))}
        </div>
      )}

      {(kategoriUjian === "kenaikan_juz" || kategoriUjian === "uas") && (
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="font-bold text-sm text-slate-200">
                Juz {activeJuz} - Hafalan & Kelancaran
              </span>
            </div>
            <span
              className={`text-xs px-2.5 py-1 rounded-lg font-extrabold ${
                (nilaiPerJuz[activeJuz] || 0) >= 80
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
              }`}
            >
              {(nilaiPerJuz[activeJuz] || 0) >= 80 ? "Lulus KKM" : "Remedial"}
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Kelancaran, Tajwid & Fashahah</span>
              <span className="font-bold text-white text-base">
                {nilaiPerJuz[activeJuz] || 85}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <input
                type="range"
                min={50}
                max={100}
                value={nilaiPerJuz[activeJuz] || 85}
                onChange={(e) =>
                  setNilaiPerJuz({
                    ...nilaiPerJuz,
                    [activeJuz]: Number(e.target.value),
                  })
                }
                className="w-full accent-emerald-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
              <InputNumber
                min={0}
                max={100}
                value={nilaiPerJuz[activeJuz] || 85}
                onChange={(val) =>
                  setNilaiPerJuz({
                    ...nilaiPerJuz,
                    [activeJuz]: Number(val || 0),
                  })
                }
                className="w-20 text-center font-bold"
              />
            </div>
          </div>
        </div>
      )}

      {kategoriUjian === "mhq" && (
        <div className="space-y-4">
          <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
            <span>🎲 Paket Soal Acak MHQ — Juz {activeJuz}</span>
          </div>

          {Array.from({ length: jumlahSoalMhq }, (_, i) => i + 1).map(
            (soalIdx) => {
              const key = `${activeJuz}-${soalIdx}`;
              const val = nilaiMhq[key] || 90;
              return (
                <div
                  key={key}
                  className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300">
                      Soal #{soalIdx}: Sambung Ayat / Tebak Surah
                    </span>
                    <span className="text-xs font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      Skor: {val}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={50}
                      max={100}
                      value={val}
                      onChange={(e) =>
                        setNilaiMhq({
                          ...nilaiMhq,
                          [key]: Number(e.target.value),
                        })
                      }
                      className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                    />
                    <InputNumber
                      min={0}
                      max={100}
                      value={val}
                      onChange={(num) =>
                        setNilaiMhq({
                          ...nilaiMhq,
                          [key]: Number(num || 0),
                        })
                      }
                      className="w-16 text-center text-xs font-bold"
                    />
                  </div>
                </div>
              );
            }
          )}
        </div>
      )}

      {kategoriUjian === "tasmi" && (
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-slate-200">
              Pengurangan Kesalahan Tasmi' (Juz {activeJuz})
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2">
            <div className="bg-slate-900 p-2.5 rounded-xl border border-rose-500/20 text-center">
              <div className="text-[10px] text-rose-400 font-bold uppercase">
                Lupa Ayat (-2)
              </div>
              <InputNumber
                min={0}
                max={20}
                value={potonganTasmi[`${activeJuz}-h-2`] || 0}
                onChange={(val) =>
                  setPotonganTasmi({
                    ...potonganTasmi,
                    [`${activeJuz}-h-2`]: Number(val || 0),
                  })
                }
                className="w-full mt-1 text-center font-bold"
              />
            </div>

            <div className="bg-slate-900 p-2.5 rounded-xl border border-amber-500/20 text-center">
              <div className="text-[10px] text-amber-400 font-bold uppercase">
                Dibantu (-1)
              </div>
              <InputNumber
                min={0}
                max={20}
                value={potonganTasmi[`${activeJuz}-h-1`] || 0}
                onChange={(val) =>
                  setPotonganTasmi({
                    ...potonganTasmi,
                    [`${activeJuz}-h-1`]: Number(val || 0),
                  })
                }
                className="w-full mt-1 text-center font-bold"
              />
            </div>

            <div className="bg-slate-900 p-2.5 rounded-xl border border-blue-500/20 text-center">
              <div className="text-[10px] text-blue-400 font-bold uppercase">
                Tajwid (-0.5)
              </div>
              <InputNumber
                min={0}
                max={20}
                value={potonganTasmi[`${activeJuz}-h-05`] || 0}
                onChange={(val) =>
                  setPotonganTasmi({
                    ...potonganTasmi,
                    [`${activeJuz}-h-05`]: Number(val || 0),
                  })
                }
                className="w-full mt-1 text-center font-bold"
              />
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2 pt-2 border-t border-slate-800">
        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          Catatan Evaluasi Guru
        </label>
        <TextArea
          rows={3}
          placeholder="Tuliskan catatan tajwid, fashahah, atau masukan penguji untuk santri..."
          value={catatan}
          onChange={(e) => setCatatan(e.target.value)}
          className="bg-slate-950 text-white border-slate-800 rounded-xl"
        />
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full min-h-[85vh] bg-slate-950 text-white font-sans rounded-2xl overflow-hidden border border-slate-800 shadow-2xl relative">
      <div className="flex flex-wrap items-center justify-between px-6 py-4 bg-slate-900 border-b border-slate-800 gap-4">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={onBack}
              type="text"
              className="text-slate-400 hover:text-white"
            />
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Live Exam Mode
              </span>
              <span className="text-xs text-slate-400 font-medium">
                • {kategoriUjian.toUpperCase()} • Juz {juzDari} - {juzSampai}
              </span>
            </div>
            <h2 className="text-lg font-extrabold text-white mt-0.5">
              Santri: <span className="text-emerald-400">{santri.nama}</span>
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 flex items-center gap-4">
            <div className="text-right">
              <div className="text-[10px] text-slate-400 font-bold uppercase">
                Total Nilai
              </div>
              <div className="text-base font-black text-white">
                {calculatedStats.total}
              </div>
            </div>
            <div className="h-6 w-px bg-slate-800" />
            <div className="text-right">
              <div className="text-[10px] text-slate-400 font-bold uppercase">
                Rata-Rata
              </div>
              <div className="text-base font-black text-emerald-400">
                {calculatedStats.rataRata}
              </div>
            </div>
            <div className="h-6 w-px bg-slate-800" />
            <div>
              <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {calculatedStats.predikat}
              </span>
            </div>
          </div>

          <Button
            icon={<PauseCircleOutlined />}
            onClick={() => onPause?.({ ...calculatedStats, santri, kategoriUjian, juzDari, juzSampai, nilaiPerJuz, nilaiMhq, potonganTasmi, catatan })}
            className="h-10 rounded-xl bg-slate-800 text-amber-400 border-slate-700 hover:bg-slate-700 font-bold"
          >
            Jeda
          </Button>

          <Button
            type="primary"
            icon={<CheckCircleOutlined />}
            onClick={() => onFinish?.({ ...calculatedStats, santri, kategoriUjian, juzDari, juzSampai, nilaiPerJuz, nilaiMhq, potonganTasmi, catatan })}
            className="h-10 px-5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 border-none hover:from-emerald-500 hover:to-teal-500 font-extrabold shadow-lg shadow-emerald-600/20"
          >
            Selesaikan Ujian
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden relative">
        <div className="hidden lg:block lg:col-span-5 bg-slate-900/50 border-r border-slate-800 p-6 overflow-y-auto max-h-[82vh]">
          {renderFormContent()}
        </div>

        <div className="col-span-12 lg:col-span-7 bg-slate-950 p-2 sm:p-4 overflow-y-auto max-h-[82vh] pb-24 lg:pb-4 relative">
          <MushafDigital
            currentPage={mushafPage}
            juzMulai={juzDari}
            juzSampai={juzSampai}
            tipeUjian={kategoriUjian === "tasmi" ? "per-halaman" : "per-juz"}
            currentJuz={activeJuz}
          />
        </div>
      </div>

      <div
        onClick={() => setSheetState('collapsed')}
        className={`lg:hidden fixed inset-0 bg-black/60 backdrop-blur-xs z-30 transition-opacity duration-300 ${
          sheetState === 'full'
            ? 'opacity-100 pointer-events-auto'
            : sheetState === 'half'
            ? 'opacity-40 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
      />

      <div
        className={`lg:hidden fixed inset-x-0 bottom-0 z-40 bg-slate-900 border-t border-slate-700 rounded-t-3xl shadow-2xl transition-all duration-300 flex flex-col overflow-hidden ${
          sheetState === 'collapsed'
            ? 'h-[76px]'
            : sheetState === 'half'
            ? 'h-[55vh]'
            : 'h-[92vh]'
        }`}
      >
        <div className="px-4 pt-2 pb-2.5 bg-slate-900/95 border-b border-slate-800 flex flex-col items-center select-none">
          <div
            onClick={() =>
              setSheetState(
                sheetState === 'collapsed'
                  ? 'half'
                  : sheetState === 'half'
                  ? 'full'
                  : 'collapsed'
              )
            }
            className="w-12 h-1.5 bg-slate-600 hover:bg-slate-500 rounded-full my-1 cursor-pointer transition-colors"
          />

          <div className="w-full flex items-center justify-between mt-1">
            <div
              onClick={() =>
                setSheetState(sheetState === 'collapsed' ? 'half' : 'collapsed')
              }
              className="flex items-center gap-2 cursor-pointer"
            >
              <span className="text-xs font-bold text-slate-400">
                Juz {activeJuz} • Skor:
              </span>
              <span className="text-lg font-black text-emerald-400">
                {calculatedStats.rataRata}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSheetState('collapsed');
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  sheetState === 'collapsed'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                ▼ Tutup
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSheetState('half');
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  sheetState === 'half'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                ■ 50%
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSheetState('full');
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  sheetState === 'full'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                ▲ 100%
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {renderFormContent()}
          <div className="pt-4 border-t border-slate-800">
            <Button
              block
              onClick={() => setSheetState('collapsed')}
              className="h-11 rounded-xl bg-slate-800 text-emerald-400 border-slate-700 font-bold"
            >
              ▼ Simpan & Kembali Menyimak Mushaf
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LiveExamSplitScreen;
