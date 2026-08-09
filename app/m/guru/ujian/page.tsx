"use client";

import React, { useEffect, useState } from "react";
import { Button, Select, message, Skeleton, Tag } from "antd";
import {
  TrophyOutlined,
  PlayCircleOutlined,
  UserOutlined,
  BookOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { LiveExamSplitScreen } from "@/components/guru/ujian/LiveExamSplitScreen";

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

  const fetchData = async () => {
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
          if (sJson.data.length > 0 && !selectedSantriId) {
            setSelectedSantriId(sJson.data[0].id);
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
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStartExam = () => {
    if (!selectedSantriId) {
      message.error("Silakan pilih santri di halaqah Anda terlebih dahulu");
      return;
    }
    setIsLiveExam(true);
  };

  const handleFinishExam = async (dataState: Record<string, unknown>) => {
    try {
      const selectedSantri = santriList.find((s) => s.id === selectedSantriId);
      const res = await fetch("/api/guru/ujian", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          santriId: selectedSantriId,
          jenisUjian: kategoriUjian,
          juzDari,
          juzSampai,
          nilaiPerJuz: dataState.nilaiPerJuz || {},
          nilaiAkhir: dataState.nilaiAkhir || 85,
          catatan: "Ujian dilaksanakan via Mobile Apps",
          tanggalUjian: new Date().toISOString(),
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
      <div className="min-h-screen bg-navy-950 text-white">
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
    <div className="p-4 space-y-6 pb-24">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-blue-green to-navy-800 rounded-3xl p-5 border border-brand-teal/20 shadow-lg">
        <span className="inline-block px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-slate-100 text-[11px] font-semibold mb-2">
          KKM Per-Juz
        </span>
        <h2 className="text-xl font-bold text-white mb-1">
          Ujian Al-Qur'an Digital
        </h2>
        <p className="text-xs text-slate-100 opacity-90 leading-relaxed">
          Uji bacaan & hafalan santri halaqah Anda menggunakan Mushaf Digital & Bottom Sheet interaktif.
        </p>
      </div>

      {/* Form Mulai Ujian */}
      <div className="bg-navy-900 border border-navy-800 rounded-2xl p-4 space-y-3">
        <h3 className="text-sm font-bold text-white">Mulai Ujian Baru</h3>

        <div>
          <label className="text-xs text-slate-400 font-semibold block mb-1">
            Pilih Santri (Halaqah Sendiri)
          </label>
          {loading ? (
            <Skeleton.Input active block />
          ) : santriList.length === 0 ? (
            <div className="text-xs text-amber-400 py-1">
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
            <label className="text-xs text-slate-400 font-semibold block mb-1">
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
            <label className="text-xs text-slate-400 font-semibold block mb-1">
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
          className="w-full h-12 rounded-2xl bg-blue-green hover:bg-blue-green font-bold text-sm shadow-xl shadow-brand-teal/30 border-none mt-2"
        >
          Mulai Ujian Sekarang
        </Button>
      </div>

      {/* Daftar Riwayat Ujian */}
      <div>
        <h3 className="text-sm font-bold text-slate-200 mb-3">
          Riwayat Ujian Halaqah
        </h3>

        {loading ? (
          <div className="space-y-3">
            <Skeleton active paragraph={{ rows: 2 }} className="bg-navy-900/50 p-4 rounded-2xl" />
            <Skeleton active paragraph={{ rows: 2 }} className="bg-navy-900/50 p-4 rounded-2xl" />
          </div>
        ) : ujianList.length === 0 ? (
          <div className="p-8 rounded-2xl bg-navy-900/40 border border-navy-800 text-center text-slate-400 text-xs">
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
                  className="bg-navy-900/90 border border-navy-800 rounded-2xl p-4 flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <div className="text-sm font-bold text-white">
                      {santriNama}
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-2">
                      <span className="text-brand-teal font-semibold">
                        {item.templateUjian?.jenisUjian?.toUpperCase() ||
                          "UJIAN"}
                      </span>
                      <span>•</span>
                      <span>{tanggalStr}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-black text-emerald-400">
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
