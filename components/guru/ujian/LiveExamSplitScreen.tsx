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

  return (
    <div className="flex flex-col h-full min-h-[85vh] bg-slate-950 text-white font-sans rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
      {/* TOP HEADER CONTROLS */}
      <div className="flex flex-wrap items-center justify-between px-6 py-4 bg-slate-900 border-b border-slate-800 gap-4">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={onBack}
              className="bg-slate-800 text-slate-300 border-none hover:bg-slate-700"
            >
              Kembali
            </Button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-wide text-white">
                LIVE EXAM MODE
              </span>
              <Tag color="cyan" className="font-bold text-xs">
                {kategoriUjian.toUpperCase()}
              </Tag>
              <Tag color="purple" className="font-bold text-xs">
                Juz {juzDari} - {juzSampai}
              </Tag>
            </div>
            <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
              <UserOutlined className="text-emerald-400" />
              <span>Santri: <strong className="text-white">{santri.nama}</strong></span>
              <span>•</span>
              <span>Sinkron Mushaf: <strong className="text-emerald-400">Hal {mushafPage} (Juz {activeJuz})</strong></span>
            </div>
          </div>
        </div>

        {/* LIVE SCORE STATS BADGE */}
        <div className="flex items-center gap-6 bg-slate-950 px-5 py-2.5 rounded-xl border border-slate-800">
          <div className="text-center">
            <div className="text-[10px] uppercase font-bold text-slate-400">Total Nilai</div>
            <div className="text-lg font-black text-emerald-400">{calculatedStats.total}</div>
          </div>
          <div className="h-6 w-px bg-slate-800" />
          <div className="text-center">
            <div className="text-[10px] uppercase font-bold text-slate-400">Rata-Rata</div>
            <div className="text-lg font-black text-white">{calculatedStats.rataRata}</div>
          </div>
          <div className="h-6 w-px bg-slate-800" />
          <div className="text-center">
            <div className="text-[10px] uppercase font-bold text-slate-400">Predikat</div>
            <div className="text-sm font-bold text-emerald-300">{calculatedStats.predikat}</div>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex items-center gap-3">
          <Button
            icon={<PauseCircleOutlined />}
            onClick={handlePauseExam}
            className="h-10 px-5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 font-bold"
          >
            Pause Ujian (Jeda)
          </Button>
          <Button
            type="primary"
            icon={<CheckCircleOutlined />}
            onClick={handleFinishExam}
            className="h-10 px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 border-none font-bold shadow-lg shadow-emerald-500/25"
          >
            Selesaikan Ujian
          </Button>
        </div>
      </div>

      {/* SPLIT SCREEN BODY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden">
        {/* LEFT PANEL: FORM PENILAIAN GURU */}
        <div className="lg:col-span-5 bg-slate-900/50 border-r border-slate-800 p-6 overflow-y-auto max-h-[82vh] space-y-6">
          {/* JUZ SELECTOR TABS */}
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

          {/* DYNAMIC CATEGORY CONTENT */}
          {/* A. KENAIKAN JUZ / UAS */}
          {(kategoriUjian === "kenaikan_juz" || kategoriUjian === "uas") && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <CalculatorOutlined className="text-emerald-400" />
                  Penilaian Kenaikan Juz / UAS
                </h3>
                <span className="text-xs text-slate-400">Rentang Juz {juzDari} - {juzSampai}</span>
              </div>

              {juzList.map((juzNum) => (
                <div
                  key={juzNum}
                  onClick={() => setActiveJuz(juzNum)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    activeJuz === juzNum
                      ? "bg-slate-800/90 border-emerald-500/50 shadow-lg"
                      : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-sm">
                        {juzNum}
                      </span>
                      <div>
                        <div className="text-sm font-bold text-white">Juz {juzNum}</div>
                        <div className="text-[11px] text-slate-400">Hafalan & Kelancaran</div>
                      </div>
                    </div>
                    <Tag color={nilaiPerJuz[juzNum] >= 80 ? "success" : "warning"}>
                      Nilai: {nilaiPerJuz[juzNum]}
                    </Tag>
                  </div>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={nilaiPerJuz[juzNum] || 85}
                      onChange={(e) =>
                        setNilaiPerJuz({ ...nilaiPerJuz, [juzNum]: Number(e.target.value) })
                      }
                      className="w-full accent-emerald-500"
                    />
                    <InputNumber
                      min={0}
                      max={100}
                      value={nilaiPerJuz[juzNum] || 85}
                      onChange={(val) =>
                        setNilaiPerJuz({ ...nilaiPerJuz, [juzNum]: Number(val || 0) })
                      }
                      className="w-20 font-bold text-center"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* B. MHQ (MUSABAQAH HIFZHIL QUR'AN) */}
          {kategoriUjian === "mhq" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ReadOutlined className="text-emerald-400" />
                  Rincian Penilaian MHQ (Juz {activeJuz})
                </h3>
                <span className="text-xs text-slate-400">{jumlahSoalMhq} Pertanyaan / Juz</span>
              </div>

              {Array.from({ length: jumlahSoalMhq }, (_, idx) => idx + 1).map((soalIdx) => {
                const key = `${activeJuz}-${soalIdx}`;
                const val = nilaiMhq[key] || 90;
                return (
                  <div
                    key={soalIdx}
                    className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-white">
                        Pertanyaan #{soalIdx} (Juz {activeJuz})
                      </span>
                      <Tag color="cyan">Skor: {val}</Tag>
                    </div>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={val}
                        onChange={(e) =>
                          setNilaiMhq({ ...nilaiMhq, [key]: Number(e.target.value) })
                        }
                        className="w-full accent-emerald-500"
                      />
                      <InputNumber
                        min={0}
                        max={100}
                        value={val}
                        onChange={(num) =>
                          setNilaiMhq({ ...nilaiMhq, [key]: Number(num || 0) })
                        }
                        className="w-20 font-bold text-center"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* C. TASMI' (20 HALAMAN GRID) */}
          {kategoriUjian === "tasmi" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <BookOutlined className="text-emerald-400" />
                  Tabel Rincian Tasmi&apos; (Juz {activeJuz})
                </h3>
                <span className="text-xs text-slate-400">20 Halaman per Juz</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="text-xs text-slate-400 mb-2">
                  Input <strong>Potongan Kesalahan</strong> per halaman (0 = Sempurna):
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {Array.from({ length: 20 }, (_, i) => i + 1).map((hal) => {
                    const key = `${activeJuz}-${hal}`;
                    const pot = potonganTasmi[key] || 0;
                    return (
                      <div
                        key={hal}
                        className={`p-2 rounded-xl border text-center transition-all ${
                          pot > 0
                            ? "bg-red-950/40 border-red-500/50"
                            : "bg-slate-900 border-slate-800"
                        }`}
                      >
                        <div className="text-[10px] font-bold text-slate-400 mb-1">
                          Hal {hal}
                        </div>
                        <InputNumber
                          min={0}
                          max={10}
                          value={pot}
                          onChange={(val) =>
                            setPotonganTasmi({ ...potonganTasmi, [key]: Number(val || 0) })
                          }
                          className="w-full text-center text-xs font-bold"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* CATATAN PENGUJI */}
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

        {/* RIGHT PANEL: DIGITAL AL-QUR'AN (MUSHAF DIGITAL) */}
        <div className="lg:col-span-7 bg-slate-950 p-4 overflow-y-auto max-h-[82vh]">
          <MushafDigital
            currentPage={mushafPage}
            juzMulai={juzDari}
            juzSampai={juzSampai}
            tipeUjian={kategoriUjian === "tasmi" ? "per-halaman" : "per-juz"}
            currentJuz={activeJuz}
          />
        </div>
      </div>
    </div>
  );
}

export default LiveExamSplitScreen;
