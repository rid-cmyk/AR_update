"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Button, Select, App, Skeleton, Tag } from "antd";
import {
  TrophyOutlined,
  PlayCircleOutlined,
  UserOutlined,
  BookOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { LiveExamSplitScreen } from "@/components/guru/ujian/LiveExamSplitScreen";
import {
  buildNilaiDetailLiveExam,
  isPerHalamanKategori,
} from "@/components/guru/ujian/utils/penilaianUtils";

interface SantriHalaqah {
  id: number;
  namaLengkap: string;
  username: string;
}

interface UjianItem {
  id: number;
  nilaiAkhir: number;
  tanggalUjian: string;
  statusUjian: string;
  santri?: {
    namaLengkap: string;
  };
  templateUjian?: {
    namaTemplate: string;
    jenisUjian: string;
  };
}

export default function MobileGuruUjian() {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(true);
  const [santriList, setSantriList] = useState<SantriHalaqah[]>([]);
  const [ujianList, setUjianList] = useState<UjianItem[]>([]);

  // Exam selection form
  const [selectedSantriId, setSelectedSantriId] = useState<number | null>(null);
  const [kategoriUjian, setKategoriUjian] = useState<
    "kenaikan_juz" | "uas" | "mhq" | "tasmi"
  >("kenaikan_juz");
  const [juzDari, setJuzDari] = useState(1);
  const [juzSampai, setJuzSampai] = useState(1);
  const [isLiveExam, setIsLiveExam] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [sRes, uRes] = await Promise.all([
        fetch("/api/guru/santri"),
        fetch("/api/guru/ujian"),
      ]);

      if (sRes.ok) {
        const sJson = await sRes.json();
        if (sJson?.data && Array.isArray(sJson.data)) {
          setSantriList(sJson.data);
          if (sJson.data.length > 0) {
            setSelectedSantriId((prev) => prev ?? sJson.data[0].id);
          }
        }
      }

      if (uRes.ok) {
        const uJson = await uRes.json();
        if (uJson?.data && Array.isArray(uJson.data)) {
          setUjianList(uJson.data);
        }
      }
    } catch (err) {
      console.error("Error loading ujian data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleStartExam = () => {
    if (!selectedSantriId) {
      message.error("Silakan pilih santri di halaqah Anda terlebih dahulu");
      return;
    }
    setIsLiveExam(true);
  };

  const handleFinishExam = async (dataState: Record<string, unknown>) => {
    try {
      // Bangun nilaiDetail flat dari penilaian per-halaman / per-soal (MHQ).
      // Key `juz-<juz>-halaman-<page>` (dan `juz-<juz>-soal-<s>`) dikenali
      // `calculateNilaiPerJuz` di server untuk evaluasi KKM per-juz.
      const nilaiDetail = buildNilaiDetailLiveExam({
        kategoriUjian,
        juzDari,
        juzSampai,
        nilaiPerHalaman: (dataState.nilaiPerHalaman ?? {}) as Record<string, number>,
        nilaiMhq: (dataState.nilaiMhq ?? {}) as Record<string, number>,
        jumlahSoalMhq: 3,
      });

      const tipeUjian = isPerHalamanKategori(kategoriUjian) ? "per-halaman" : "per-juz";

      const statsRaw = (dataState.stats ?? {}) as Record<string, unknown>;

      const res = await fetch("/api/guru/ujian", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: dataState.status === "draft" ? "DRAFT" : "SELESAI",
          jenisUjian: {
            nama: kategoriUjian,
            tipeUjian,
          },
          juzRange: {
            dari: juzDari,
            sampai: juzSampai,
          },
          ujianResults: [
            {
              santriId: selectedSantriId,
              nilaiDetail,
              nilaiAkhir: Number(dataState.nilaiAkhir ?? statsRaw.rataRata ?? 0),
              catatan: (dataState.catatan as string) || "Ujian dilaksanakan via Mobile Apps",
            },
          ],
          metadata: {
            tanggalUjian: new Date().toISOString(),
          },
        }),
      });

      if (res.ok) {
        message.success("Ujian Al-Qur'an selesai dan tersimpan ke database!");
        setIsLiveExam(false);
        fetchData();
      } else {
        const err = await res.json();
        message.error(err.message || "Gagal menyimpan hasil ujian");
      }
    } catch (err) {
      console.error("Error finish exam:", err);
      message.error("Terjadi kesalahan saat menyimpan ujian");
    }
  };

  if (isLiveExam) {
    const santriObj = santriList.find((s) => s.id === selectedSantriId) || {
      id: selectedSantriId || 0,
      namaLengkap: "Santri",
    };

    return (
      <div className="min-h-screen bg-[#f4f9fb]">
        <LiveExamSplitScreen
          santri={{
            id: santriObj.id,
            nama: santriObj.namaLengkap,
          }}
          kategoriUjian={kategoriUjian}
          juzDari={juzDari}
          juzSampai={juzSampai}
          onPause={() => {
            message.info("Ujian dijeda di lokal");
            setIsLiveExam(false);
          }}
          onFinish={handleFinishExam}
          onBack={() => setIsLiveExam(false)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-[#f4f9fb] p-4 space-y-6 pb-24">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-blue-green to-deep-space rounded-3xl p-5 shadow-lg shadow-blue-green/20">
        <span className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-[11px] font-semibold mb-2">
          KKM Per-Juz
        </span>
        <h2 className="text-xl font-bold text-white mb-1">
          Ujian Al-Qur'an Digital
        </h2>
        <p className="text-xs text-white/80 leading-relaxed">
          Uji bacaan & hafalan santri halaqah Anda menggunakan Mushaf Digital & Bottom Sheet interaktif.
        </p>
      </div>

      {/* Form Mulai Ujian */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 space-y-3 shadow-sm">
        <h3 className="text-sm font-bold text-deep-space">Mulai Ujian Baru</h3>

        <div>
          <label className="text-xs text-slate-500 font-semibold block mb-1">
            Pilih Santri (Halaqah Sendiri)
          </label>
          {loading ? (
            <Skeleton.Input active block />
          ) : santriList.length === 0 ? (
            <div className="text-xs text-princeton py-1">
              Belum ada santri di halaqah Anda.
            </div>
          ) : (
            <Select
              value={selectedSantriId || undefined}
              onChange={(val) => setSelectedSantriId(val)}
              className="w-full h-11"
              options={santriList.map((s) => ({
                value: s.id,
                label: s.namaLengkap,
              }))}
            />
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-slate-500 font-semibold block mb-1">
              Kategori Ujian
            </label>
            <Select
              value={kategoriUjian}
              onChange={(val) => setKategoriUjian(val)}
              className="w-full h-11"
              options={[
                { value: "kenaikan_juz", label: "Kenaikan Juz" },
                { value: "uas", label: "Ujian Akhir (UAS)" },
                { value: "mhq", label: "MHQ" },
                { value: "tasmi", label: "Tasmi'" },
              ]}
            />
          </div>

          <div>
            <label className="text-xs text-slate-500 font-semibold block mb-1">
              Rentang Juz
            </label>
            <div className="flex items-center gap-1">
              <Select
                value={juzDari}
                onChange={(val) => {
                  setJuzDari(val);
                  if (val > juzSampai) setJuzSampai(val);
                }}
                className="w-full h-11"
                options={Array.from({ length: 30 }, (_, i) => ({
                  value: i + 1,
                  label: `Juz ${i + 1}`,
                }))}
              />
              <span className="text-slate-400 text-xs">-</span>
              <Select
                value={juzSampai}
                onChange={(val) => setJuzSampai(val)}
                className="w-full h-11"
                options={Array.from({ length: 30 }, (_, i) => ({
                  value: i + 1,
                  label: `Juz ${i + 1}`,
                }))}
              />
            </div>
          </div>
        </div>

        <Button
          type="primary"
          icon={<PlayCircleOutlined />}
          onClick={handleStartExam}
          disabled={!selectedSantriId}
          className="w-full h-12 rounded-2xl bg-blue-green hover:bg-blue-green font-bold text-sm shadow-xl shadow-blue-green/30 border-none mt-2"
        >
          Mulai Ujian Sekarang
        </Button>
      </div>

      {/* Daftar Riwayat Ujian */}
      <div>
        <h3 className="text-sm font-bold text-deep-space mb-3">
          Riwayat Ujian Halaqah
        </h3>

        {loading ? (
          <div className="space-y-3">
            <Skeleton active paragraph={{ rows: 2 }} className="bg-white p-4 rounded-2xl" />
            <Skeleton active paragraph={{ rows: 2 }} className="bg-white p-4 rounded-2xl" />
          </div>
        ) : ujianList.length === 0 ? (
          <div className="p-8 rounded-2xl bg-white border border-slate-200/80 text-center text-slate-400 text-xs shadow-sm">
            Belum ada riwayat ujian Al-Qur'an dari santri halaqah Anda.
          </div>
        ) : (
          <div className="space-y-2.5">
            {ujianList.map((item) => {
              const santriNama = item.santri?.namaLengkap || "Santri";
              const tanggalStr = item.tanggalUjian
                ? new Date(item.tanggalUjian).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : "Baru saja";

              return (
                <div
                  key={item.id}
                  className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-center justify-between shadow-sm"
                >
                  <div className="space-y-1">
                    <div className="text-sm font-bold text-deep-space">
                      {santriNama}
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-2">
                      <span className="text-blue-green font-semibold">
                        {item.templateUjian?.jenisUjian?.toUpperCase() ||
                          "UJIAN"}
                      </span>
                      <span>•</span>
                      <span>{tanggalStr}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-black text-emerald-600">
                      {item.nilaiAkhir}
                    </div>
                    <Tag
                      color={
                        item.statusUjian === "selesai" ? "success" : "processing"
                      }
                      className="text-[10px] m-0"
                    >
                      {item.statusUjian}
                    </Tag>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
