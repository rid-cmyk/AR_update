import React from "react";
import { InputNumber, Input } from "antd";
import { getJuzPages } from "./mushafConstants";
import { aggregatePerJuz } from "./utils/penilaianUtils";

const { TextArea } = Input;

export interface LiveExamFormContentProps {
  juzList: number[];
  activeJuz: number;
  setActiveJuz: (j: number) => void;
  kategoriUjian: string;
  nilaiPerHalaman: Record<string, number>;
  setNilaiPerHalaman: (v: Record<string, number>) => void;
  nilaiMhq: Record<string, number>;
  setNilaiMhq: (v: Record<string, number>) => void;
  jumlahSoalMhq: number;
  catatan: string;
  setCatatan: (c: string) => void;
  kkm?: number;
  currentPage: number;
  setCurrentPage: (page: number) => void;
}

export function LiveExamFormContent({
  juzList,
  activeJuz,
  setActiveJuz,
  kategoriUjian,
  nilaiPerHalaman,
  setNilaiPerHalaman,
  nilaiMhq,
  setNilaiMhq,
  jumlahSoalMhq,
  catatan,
  setCatatan,
  kkm = 70,
  currentPage,
  setCurrentPage,
}: LiveExamFormContentProps) {
  const pages = getJuzPages(activeJuz);
  const perJuz = aggregatePerJuz({
    kategoriUjian,
    juzDari: activeJuz,
    juzSampai: activeJuz,
    nilaiPerHalaman,
    nilaiMhq,
    jumlahSoalMhq,
  });
  const nilaiJuz = Math.round(perJuz[activeJuz] ?? 0);

  return (
    <div className="space-y-5">
      {juzList.length > 1 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200 -mx-1 px-1">
          {juzList.map((j) => (
            <button
              key={j}
              onClick={() => setActiveJuz(j)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap ${
                activeJuz === j
                  ? "bg-blue-green text-white shadow-sm shadow-blue-green/20"
                  : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-200"
              }`}
            >
              Juz {j}
            </button>
          ))}
        </div>
      )}

      {(kategoriUjian === "kenaikan_juz" ||
        kategoriUjian === "uas" ||
        kategoriUjian === "tasmi") && (
        <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <div>
                <span className="font-bold text-xs text-deep-space">
                  Penilaian Per Halaman — Juz {activeJuz}
                </span>
                <div className="text-[10px] text-slate-400">
                  Hal. {pages[0]} - {pages[pages.length - 1]}
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[9px] text-slate-400 font-bold uppercase block">
                Rata-rata
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black text-deep-space">
                  {nilaiJuz}
                </span>
                <span
                  className={`text-[9px] px-2 py-0.5 rounded-md font-extrabold ${
                    nilaiJuz >= kkm
                      ? "bg-emerald-500/10 text-emerald-600"
                      : "bg-amber-500/10 text-princeton"
                  }`}
                >
                  {nilaiJuz >= kkm ? "Lulus KKM" : "Remedial"}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-5 sm:grid-cols-6 gap-1.5">
            {pages.map((page) => {
              const itemKey = `halaman-${page}`;
              const val = nilaiPerHalaman[itemKey];
              const isActivePage = currentPage === page;
              return (
                <div
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`rounded-lg border overflow-hidden transition-all cursor-pointer ${
                    isActivePage
                      ? "border-emerald-500 ring-1 ring-emerald-500/30"
                      : "border-slate-200 bg-white hover:border-emerald-300"
                  }`}
                >
                  <div className="text-center text-[9px] font-bold text-slate-400 bg-slate-50 py-0.5">
                    Hal. {page}
                  </div>
                  <InputNumber
                    variant="borderless"
                    min={0}
                    max={100}
                    value={val ?? 0}
                    onChange={(num) =>
                      setNilaiPerHalaman({
                        ...nilaiPerHalaman,
                        [itemKey]: Number(num || 0),
                      })
                    }
                    onClick={(e) => e.stopPropagation()}
                    className="w-full text-center !text-xs font-bold"
                    style={{ height: 30 }}
                    controls={false}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {kategoriUjian === "mhq" && (
        <div className="space-y-3">
          <div className="text-[11px] font-bold text-princeton uppercase tracking-wider flex items-center gap-1.5">
            <span>🎲 Paket Soal Acak MHQ — Juz {activeJuz}</span>
          </div>

          {Array.from({ length: jumlahSoalMhq }, (_, i) => i + 1).map(
            (soalIdx) => {
              const key = `${activeJuz}-${soalIdx}`;
              const val = nilaiMhq[key] ?? 0;
              return (
                <div
                  key={key}
                  className="bg-white p-3 rounded-xl border border-slate-200 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-600">
                      Soal #{soalIdx}: Sambung Ayat
                    </span>
                    <span className="text-xs font-black text-princeton bg-princeton/10 px-2 py-0.5 rounded border border-princeton/20">
                      {val}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={val}
                      onChange={(e) =>
                        setNilaiMhq({
                          ...nilaiMhq,
                          [key]: Number(e.target.value),
                        })
                      }
                      className="flex-1 accent-amber-500 h-1 bg-slate-200 rounded-lg cursor-pointer"
                    />
                    <InputNumber
                      size="small"
                      controls={false}
                      min={0}
                      max={100}
                      value={val}
                      onChange={(num) =>
                        setNilaiMhq({
                          ...nilaiMhq,
                          [key]: Number(num || 0),
                        })
                      }
                      className="w-14 text-center !text-xs font-bold"
                    />
                  </div>
                </div>
              );
            }
          )}
        </div>
      )}

      <div className="space-y-1.5 pt-2 border-t border-slate-200">
        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          Catatan Evaluasi Guru
        </label>
        <TextArea
          rows={2}
          placeholder="Catatan tajwid, fashahah, atau masukan penguji..."
          value={catatan}
          onChange={(e) => setCatatan(e.target.value)}
          className="bg-white text-deep-space border-slate-300 rounded-xl !text-xs"
        />
      </div>
    </div>
  );
}
