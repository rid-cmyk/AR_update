"use client";

import React from "react";
import { App, Button } from "antd";
import {
  PauseCircleOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { MushafDigital } from "./MushafDigital";
import { LiveExamFormContent } from "./LiveExamFormContent";
import { useUjianPenilaian, useBottomSheet, useMushafNav } from "@/hooks";
import { buildNilaiDetailLiveExam } from "./utils/penilaianUtils";

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
  kkm?: number;
  isRemedial?: boolean;
  onPause: (dataState: any) => void;
  onFinish: (dataState: any) => void;
  onBack?: () => void;
}

export function LiveExamSplitScreen({
  santri,
  kategoriUjian,
  juzDari,
  juzSampai,
  jumlahSoalMhq = 3,
  kkm = 70,
  isRemedial = false,
  onPause,
  onFinish,
  onBack,
}: LiveExamSplitScreenProps) {
  // Custom Hook 1: Navigation & Mushaf Page Mapping
  const { activeJuz, setActiveJuz, currentPage, setCurrentPage } = useMushafNav(juzDari);

  // Custom Hook 2: Bottom Sheet Persistent State (Mobile Adaptive Dual-Mode)
  const { sheetState, setSheetState } = useBottomSheet("half");

  // Custom Hook 3: Penilaian Per Halaman / Per Soal (MHQ), KKM Evaluation, & Predikat
  const {
    nilaiPerHalaman,
    setNilaiPerHalaman,
    nilaiMhq,
    setNilaiMhq,
    catatan,
    setCatatan,
    stats,
  } = useUjianPenilaian({
    kategoriUjian,
    juzDari,
    juzSampai,
    jumlahSoalMhq,
    kkm,
  });

  const { message } = App.useApp();

  const buildDataState = (status: "draft" | "selesai") => ({
    santri,
    kategoriUjian,
    juzDari,
    juzSampai,
    nilaiPerHalaman,
    nilaiMhq,
    catatan,
    stats,
    nilaiDetail: buildNilaiDetailLiveExam({
      kategoriUjian,
      juzDari,
      juzSampai,
      nilaiPerHalaman,
      nilaiMhq,
      jumlahSoalMhq,
    }),
    nilaiAkhir: stats.rataRata,
    status,
  });

  const handlePauseExam = () => {
    message.info("Sesi ujian disimpan sebagai Draft. Anda dapat melanjutkannya kapan saja.");
    onPause(buildDataState("draft"));
  };

  const handleFinishExam = () => {
    message.success("Ujian Selesai! Nilai resmi telah disimpan.");
    onFinish(buildDataState("selesai"));
  };

  // Generate Juz list array
  const juzList: number[] = [];
  for (let i = juzDari; i <= juzSampai; i++) {
    juzList.push(i);
  }

  const renderFormContent = () => (
    <LiveExamFormContent
      juzList={juzList}
      activeJuz={activeJuz}
      setActiveJuz={setActiveJuz}
      kategoriUjian={kategoriUjian}
      nilaiPerHalaman={nilaiPerHalaman}
      setNilaiPerHalaman={setNilaiPerHalaman}
      nilaiMhq={nilaiMhq}
      setNilaiMhq={setNilaiMhq}
      jumlahSoalMhq={jumlahSoalMhq}
      catatan={catatan}
      setCatatan={setCatatan}
      kkm={kkm}
      currentPage={currentPage}
      setCurrentPage={setCurrentPage}
    />
  );

  return (
    <div className="flex flex-col h-full min-h-[85vh] bg-[#f4f9fb] text-deep-space font-sans rounded-2xl overflow-hidden border border-slate-200 shadow-2xl relative">
      {/* Mobile Header — minimal & modern */}
      <div className="lg:hidden flex items-center justify-between gap-3 px-4 py-3 bg-white/95 backdrop-blur border-b border-slate-200 sticky top-0 z-20">
        <div className="flex items-center gap-2.5 min-w-0">
          {onBack && (
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={onBack}
              type="text"
              className="!text-slate-500 shrink-0"
            />
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 whitespace-nowrap">
                Live
              </span>
              {isRemedial && (
                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-500/10 text-princeton border border-amber-500/20 whitespace-nowrap">
                  Remedial
                </span>
              )}
              <span className="text-[10px] text-slate-500 font-bold truncate">
                {kategoriUjian.toUpperCase()} • Juz {juzDari}-{juzSampai}
              </span>
            </div>
            <h2 className="text-sm font-extrabold text-deep-space truncate">
              {santri.nama}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span
            className="px-2.5 py-1 rounded-lg text-[10px] font-black bg-emerald-500/10 text-emerald-600 border border-emerald-500/30"
            title={`Rata-rata: ${stats.rataRata}`}
          >
            {stats.predikat}
          </span>
          <Button
            icon={<PauseCircleOutlined />}
            onClick={handlePauseExam}
            size="small"
            aria-label="Jeda ujian"
            className="!rounded-xl !text-princeton !border-slate-200 !bg-white"
          />
          <Button
            type="primary"
            icon={<CheckCircleOutlined />}
            onClick={handleFinishExam}
            size="small"
            className="!rounded-xl !border-none !bg-emerald-600 !font-bold"
          >
            Selesai
          </Button>
        </div>
      </div>

      {/* Desktop Header — full stats */}
      <div className="hidden lg:flex flex-wrap items-center justify-between px-6 py-4 bg-white border-b border-slate-200 gap-4">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={onBack}
              type="text"
              className="text-slate-500 hover:text-deep-space"
            />
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                Live Exam Mode
              </span>
              {isRemedial && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-princeton border border-amber-500/20">
                  Remedial
                </span>
              )}
              <span className="text-xs text-slate-500 font-medium">
                • {kategoriUjian.toUpperCase()} • Juz {juzDari} - {juzSampai}
              </span>
            </div>
            <h2 className="text-lg font-extrabold text-deep-space mt-0.5">
              Santri: <span className="text-emerald-600">{santri.nama}</span>
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-[#f4f9fb] px-4 py-2 rounded-xl border border-slate-200 flex items-center gap-4">
            <div className="text-right">
              <div className="text-[10px] text-slate-500 font-bold uppercase">
                Total Nilai
              </div>
              <div className="text-base font-black text-deep-space">
                {stats.total}
              </div>
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <div className="text-right">
              <div className="text-[10px] text-slate-500 font-bold uppercase">
                Rata-Rata
              </div>
              <div className="text-base font-black text-emerald-600">
                {stats.rataRata}
              </div>
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <div>
              <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-emerald-500/10 text-emerald-600 border border-emerald-500/30">
                {stats.predikat}
              </span>
            </div>
          </div>

          <Button
            icon={<PauseCircleOutlined />}
            onClick={handlePauseExam}
            className="h-10 rounded-xl bg-white text-princeton border-slate-200 hover:bg-slate-50 font-bold"
          >
            Jeda
          </Button>

          <Button
            type="primary"
            icon={<CheckCircleOutlined />}
            onClick={handleFinishExam}
            className="h-10 px-5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 border-none hover:from-emerald-500 hover:to-teal-500 font-extrabold shadow-lg shadow-emerald-600/20"
          >
            Selesaikan Ujian
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden relative">
        <div className="hidden lg:block lg:col-span-5 bg-white border-r border-slate-200 p-6 overflow-y-auto max-h-[82vh]">
          {renderFormContent()}
        </div>

        <div className="col-span-12 lg:col-span-7 bg-[#f4f9fb] p-2 sm:p-4 overflow-y-auto max-h-[82vh] pb-24 lg:pb-4 relative">
          <MushafDigital
            currentPage={currentPage}
            onPageChange={(p) => setCurrentPage(p)}
            juzMulai={juzDari}
            juzSampai={juzSampai}
            currentJuz={activeJuz}
            onJuzChange={(j) => setActiveJuz(j)}
          />
        </div>
      </div>

      <div
        onClick={() => setSheetState("collapsed")}
        className={`lg:hidden fixed inset-0 bg-black/60 backdrop-blur-xs z-30 transition-opacity duration-300 ${
          sheetState === "full"
            ? "opacity-100 pointer-events-auto"
            : sheetState === "half"
            ? "opacity-40 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      />

      <div
        className={`lg:hidden fixed inset-x-0 bottom-0 z-40 bg-white border-t border-slate-200 rounded-t-3xl shadow-2xl transition-all duration-300 flex flex-col overflow-hidden ${
          sheetState === "collapsed"
            ? "h-[76px]"
            : sheetState === "half"
            ? "h-[75vh]"
            : "h-[92vh]"
        }`}
      >
        <div className="px-4 pt-2 pb-2.5 bg-white/95 border-b border-slate-200 flex flex-col items-center select-none">
          <div
            onClick={() =>
              setSheetState(
                sheetState === "collapsed"
                  ? "half"
                  : sheetState === "half"
                  ? "full"
                  : "collapsed"
              )
            }
            className="w-12 h-1.5 bg-slate-300 hover:bg-slate-400 rounded-full my-1 cursor-pointer transition-colors"
          />

          <div className="w-full flex items-center justify-between mt-1">
            <div
              onClick={() =>
                setSheetState(sheetState === "collapsed" ? "half" : "collapsed")
              }
              className="flex items-center gap-2 cursor-pointer"
            >
              <span className="text-xs font-bold text-slate-500">
                Juz {activeJuz} • Skor:
              </span>
              <span className="text-lg font-black text-emerald-600">
                {stats.rataRata}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSheetState("collapsed");
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  sheetState === "collapsed"
                    ? "bg-blue-green text-white"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                ▼ Tutup
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSheetState("half");
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  sheetState === "half"
                    ? "bg-blue-green text-white"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                ■ 75%
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSheetState("full");
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  sheetState === "full"
                    ? "bg-blue-green text-white"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                ▲ 100%
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {renderFormContent()}
          <div className="pt-4 border-t border-slate-200">
            <Button
              block
              onClick={() => setSheetState("collapsed")}
              className="h-11 rounded-xl bg-white text-blue-green border-slate-200 font-bold"
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
