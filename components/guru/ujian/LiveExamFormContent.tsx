import React from "react";
import { InputNumber, Input } from "antd";

const { TextArea } = Input;

export interface LiveExamFormContentProps {
  juzList: number[];
  activeJuz: number;
  setActiveJuz: (j: number) => void;
  kategoriUjian: string;
  nilaiPerJuz: Record<number, number>;
  setNilaiPerJuz: (v: Record<number, number>) => void;
  nilaiMhq: Record<string, number>;
  setNilaiMhq: (v: Record<string, number>) => void;
  jumlahSoalMhq: number;
  potonganTasmi: Record<string, number>;
  setPotonganTasmi: (v: Record<string, number>) => void;
  catatan: string;
  setCatatan: (c: string) => void;
}

export function LiveExamFormContent({
  juzList,
  activeJuz,
  setActiveJuz,
  kategoriUjian,
  nilaiPerJuz,
  setNilaiPerJuz,
  nilaiMhq,
  setNilaiMhq,
  jumlahSoalMhq,
  potonganTasmi,
  setPotonganTasmi,
  catatan,
  setCatatan,
}: LiveExamFormContentProps) {
  return (
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
}
