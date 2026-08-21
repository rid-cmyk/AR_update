"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button, App, Skeleton, Tag, Input } from "antd";
import {
  TrophyOutlined,
  PlayCircleOutlined,
  UserOutlined,
  BookOutlined,
  CalendarOutlined,
  SearchOutlined,
  FilterOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { LiveExamSplitScreen } from "@/components/guru/ujian/LiveExamSplitScreen";
import { MobileSelectSheet } from "@/components/mobile/MobileSelectSheet";
import { DashboardHeader } from "@/components/ui/dashboard-header";
import {
  MobileCard,
  MobileSectionTitle,
} from "@/components/mobile/dashboard";
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
  status?: string;
  santriNama?: string;
  halaqah?: string;
  jenisUjian?: string;
  santri?: {
    namaLengkap: string;
  };
  templateUjian?: {
    namaTemplate: string;
    jenisUjian: string;
  };
}

const JENIS_LABELS: Record<string, string> = {
  tasmi: "Tasmi'",
  mhq: "MHQ",
  uas: "UAS",
  kenaikan_juz: "Kenaikan Juz",
  ujian_harian: "Ujian Harian",
  ujian_tengah_semester: "Ujian Tengah Semester",
  tahfidz: "Tahfidz",
};

const STATUS_LABELS: Record<string, string> = {
  selesai: "Selesai",
  submitted: "Menunggu Verifikasi",
  diverifikasi: "Menunggu Verifikasi",
  draft: "Draft",
  ditolak: "Ditolak",
};

const getJenisLabel = (raw?: string) =>
  (raw && JENIS_LABELS[raw]) || raw || "Tahfidz";

const getStatusLabel = (raw?: string) =>
  (raw && STATUS_LABELS[raw]) || raw || "-";

const getStatusColor = (raw?: string) => {
  const s = (raw || "").toLowerCase();
  if (s === "selesai") return "success";
  if (s === "ditolak") return "error";
  if (s === "draft") return "warning";
  return "processing";
};

export default function MobileGuruUjian() {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(true);
  const [santriList, setSantriList] = useState<SantriHalaqah[]>([]);
  const [ujianList, setUjianList] = useState<UjianItem[]>([]);

  // Riwayat ujian filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterJenis, setFilterJenis] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

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

  const jenisOptions = useMemo(() => {
    const seen = new Map<string, string>();
    ujianList.forEach((item) => {
      const raw = item.templateUjian?.jenisUjian || item.jenisUjian || "Tahfidz";
      if (!seen.has(raw)) seen.set(raw, getJenisLabel(raw));
    });
    return Array.from(seen, ([value, label]) => ({ value, label }));
  }, [ujianList]);

  const statusOptions = useMemo(() => {
    const seen = new Set<string>();
    ujianList.forEach((item) => {
      const s = item.statusUjian || item.status || "";
      if (s) seen.add(s);
    });
    return Array.from(seen, (value) => ({
      value,
      label: getStatusLabel(value),
    }));
  }, [ujianList]);

  const filteredUjianList = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return ujianList.filter((item) => {
      const nama = (
        item.santriNama || item.santri?.namaLengkap || ""
      ).toLowerCase();
      const halaqah = (item.halaqah || "").toLowerCase();
      const jenis = item.templateUjian?.jenisUjian || item.jenisUjian || "Tahfidz";
      const status = item.statusUjian || item.status || "";
      if (q && !nama.includes(q) && !halaqah.includes(q)) return false;
      if (filterJenis !== "all" && jenis !== filterJenis) return false;
      if (filterStatus !== "all" && status !== filterStatus) return false;
      return true;
    });
  }, [ujianList, searchQuery, filterJenis, filterStatus]);

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
      <DashboardHeader
        badge={
          <span className="inline-flex items-center gap-1.5">
            <TrophyOutlined />
            KKM Per-Juz
          </span>
        }
        title="Ujian Al-Qur'an Digital"
        subtitle="Uji bacaan & hafalan santri halaqah Anda menggunakan Mushaf Digital & Bottom Sheet interaktif."
      />

      {/* Form Mulai Ujian */}
      <MobileCard className="space-y-3">
        <MobileSectionTitle title="Mulai Ujian Baru" icon={<TrophyOutlined />} />

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
            <MobileSelectSheet
              value={selectedSantriId}
              onChange={(val) => setSelectedSantriId(Number(val))}
              placeholder="Pilih santri..."
              title="Pilih Santri"
              options={santriList.map((s) => ({
                value: s.id,
                label: s.namaLengkap,
                searchText: `${s.namaLengkap} ${s.username}`,
              }))}
            />
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-slate-500 font-semibold block mb-1">
              Kategori Ujian
            </label>
            <MobileSelectSheet
              value={kategoriUjian}
              onChange={(val) => setKategoriUjian(val as "kenaikan_juz" | "uas" | "mhq" | "tasmi")}
              searchable={false}
              title="Kategori Ujian"
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
              <MobileSelectSheet
                value={juzDari}
                onChange={(val) => {
                  const v = Number(val);
                  setJuzDari(v);
                  if (v > juzSampai) setJuzSampai(v);
                }}
                searchable={false}
                title="Juz Mulai"
                options={Array.from({ length: 30 }, (_, i) => ({
                  value: i + 1,
                  label: `Juz ${i + 1}`,
                }))}
              />
              <span className="text-slate-400 text-xs flex-shrink-0">-</span>
              <MobileSelectSheet
                value={juzSampai}
                onChange={(val) => setJuzSampai(Number(val))}
                searchable={false}
                title="Juz Selesai"
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
      </MobileCard>

      {/* Daftar Riwayat Ujian */}
      <div>
        <MobileSectionTitle title="Riwayat Ujian Halaqah" icon={<BookOutlined />} />

        {loading ? (
          <div className="space-y-3">
            <Skeleton active paragraph={{ rows: 2 }} className="bg-white p-4 rounded-2xl" />
            <Skeleton active paragraph={{ rows: 2 }} className="bg-white p-4 rounded-2xl" />
          </div>
        ) : ujianList.length === 0 ? (
          <MobileCard className="py-10 text-center">
            <div className="w-12 h-12 rounded-2xl bg-sky-blue/10 text-blue-green flex items-center justify-center text-xl mx-auto mb-3">
              <BookOutlined />
            </div>
            <p className="text-sm font-semibold text-slate-600">
              Belum Ada Riwayat Ujian
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Ujian santri halaqah Anda akan tampil di sini.
            </p>
          </MobileCard>
        ) : (
          <div className="space-y-3">
            {/* Filter Riwayat */}
            <MobileCard className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-sky-blue/15 text-blue-green flex items-center justify-center">
                    <FilterOutlined />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-deep-space leading-tight">
                      Filter Riwayat
                    </h4>
                    <p className="text-[11px] text-slate-500 leading-tight">
                      Saring daftar ujian santri
                    </p>
                  </div>
                </div>
                {(searchQuery || filterJenis !== "all" || filterStatus !== "all") && (
                  <span className="text-[11px] font-bold text-blue-green bg-sky-blue/20 px-2.5 py-1 rounded-full">
                    {[searchQuery, filterJenis !== "all", filterStatus !== "all"]
                      .filter(Boolean).length}{" "}
                    filter aktif
                  </span>
                )}
              </div>

              <div className="relative">
                <SearchOutlined className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama santri, halaqah..."
                  className="bg-slate-50 border-slate-200 rounded-xl h-11 text-xs pl-9 pr-9 placeholder:text-slate-400 focus:border-sky-blue"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    aria-label="Hapus pencarian"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 tap-active"
                  >
                    <CloseCircleOutlined />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-slate-500 font-semibold block mb-1">
                    Jenis Ujian
                  </label>
                  <MobileSelectSheet
                    value={filterJenis}
                    onChange={(val) => setFilterJenis(String(val))}
                    searchable={false}
                    title="Jenis Ujian"
                    options={[
                      { value: "all", label: "Semua Jenis" },
                      ...jenisOptions,
                    ]}
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 font-semibold block mb-1">
                    Status
                  </label>
                  <MobileSelectSheet
                    value={filterStatus}
                    onChange={(val) => setFilterStatus(String(val))}
                    searchable={false}
                    title="Status Ujian"
                    options={[
                      { value: "all", label: "Semua Status" },
                      ...statusOptions,
                    ]}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                <span className="text-[11px] text-slate-500">
                  Menampilkan{" "}
                  <b className="text-deep-space">{filteredUjianList.length}</b> dari{" "}
                  {ujianList.length} ujian
                </span>
                {(searchQuery || filterJenis !== "all" || filterStatus !== "all") && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setFilterJenis("all");
                      setFilterStatus("all");
                    }}
                    className="text-[11px] font-semibold text-blue-green tap-active"
                  >
                    Reset Filter
                  </button>
                )}
              </div>
            </MobileCard>

            {filteredUjianList.length === 0 ? (
              <MobileCard className="py-10 text-center">
                <div className="w-12 h-12 rounded-2xl bg-sky-blue/10 text-blue-green flex items-center justify-center text-xl mx-auto mb-3">
                  <SearchOutlined />
                </div>
                <p className="text-sm font-semibold text-slate-600">
                  Tidak Ada Hasil
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Coba ubah kata kunci atau filter.
                </p>
              </MobileCard>
            ) : (
              <div className="space-y-2.5">
                {filteredUjianList.map((item) => {
                  const santriNama = item.santriNama || item.santri?.namaLengkap || "Santri";
                  const tanggalStr = item.tanggalUjian
                    ? new Date(item.tanggalUjian).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "Baru saja";
                  const statusLabel = getStatusLabel(item.statusUjian || item.status);
                  const jenisLabel = getJenisLabel(
                    item.templateUjian?.jenisUjian || item.jenisUjian
                  );

                  return (
                    <MobileCard key={item.id}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-11 h-11 shrink-0 rounded-full bg-gradient-to-br from-sky-blue to-blue-green text-white flex items-center justify-center text-base font-bold">
                            {santriNama.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-sm font-bold text-deep-space truncate">
                              {santriNama}
                            </h4>
                            {item.halaqah && (
                              <p className="text-[11px] text-slate-500 truncate flex items-center gap-1 mt-0.5">
                                <UserOutlined />
                                {item.halaqah}
                              </p>
                            )}
                          </div>
                        </div>
                        <Tag
                          color={getStatusColor(item.statusUjian || item.status)}
                          className="text-[10px] m-0 shrink-0"
                        >
                          {statusLabel}
                        </Tag>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 mt-3">
                        <span className="text-[11px] font-semibold text-blue-green bg-sky-blue/20 px-2.5 py-1 rounded-full">
                          {jenisLabel}
                        </span>
                        <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full flex items-center gap-1">
                          <CalendarOutlined />
                          {tanggalStr}
                        </span>
                      </div>

                      <div className="flex items-center justify-between border-t border-slate-100 mt-3 pt-3">
                        <div>
                          <div className="text-[11px] text-slate-500 font-medium">
                            Nilai Akhir
                          </div>
                          <div className="text-xl font-extrabold text-emerald-600 tabular-nums">
                            {item.nilaiAkhir}
                          </div>
                        </div>
                        <span className="text-[11px] text-slate-400">
                          KKM per-juz
                        </span>
                      </div>
                    </MobileCard>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
