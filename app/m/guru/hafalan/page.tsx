"use client";

import React, { useEffect, useState } from "react";
import { Button, Input, message, Skeleton } from "antd";
import {
  BookOutlined,
  CheckCircleOutlined,
  PlusOutlined,
  SearchOutlined,
  SaveOutlined,
  StarFilled,
  UserOutlined,
} from "@ant-design/icons";
import MobileBottomSheet from "@/components/mobile/MobileBottomSheet";
import { MobileSelectSheet } from "@/components/mobile/MobileSelectSheet";
import { DashboardHeader } from "@/components/ui/dashboard-header";
import { MobileCard } from "@/components/mobile/dashboard";
import { MushafDigital } from "@/components/guru/ujian/MushafDigital";

import { useHafalanGuru } from "@/hooks";
import { useQuranSuratList } from "@/hooks/useQuranSuratList";

interface SantriHalaqah {
  id: number;
  namaLengkap: string;
  username: string;
}

interface HafalanRiwayat {
  id: number;
  santriId: number;
  surat: string;
  ayatMulai: number;
  ayatSelesai: number;
  jenis: string;
  status: string;
  keterangan?: string;
  tanggal: string;
  santri?: {
    namaLengkap: string;
  };
}

export default function MobileGuruHafalan() {
  const {
    hafalanList: riwayatList, santriList, loading,
    isModalOpen: isSheetOpen, editingHafalan, filters, setFilters,
    fetchHafalan: fetchHafalanData, saveHafalan,
    openModal: openInputFormInternal, closeModal: setIsSheetOpenFalse,
  } = useHafalanGuru();

  const setIsSheetOpen = (open: boolean) => open ? openInputFormInternal() : setIsSheetOpenFalse();

  const [activeTab, setActiveTab] = useState<"SETORAN" | "MUSHAF">("SETORAN");
  const [searchQuery, setSearchQuery] = useState("");


  const [selectedSantriId, setSelectedSantriId] = useState<number | null>(null);

  const { suratList, loading: suratLoading } = useQuranSuratList();

  // Form states
  const [jenisSetoran, setJenisSetoran] = useState<"Ziyadah" | "Murojaah">("Ziyadah");
  const [suratInput, setSuratInput] = useState("Al-Baqarah");
  const [ayatStart, setAyatStart] = useState("1");
  const [ayatEnd, setAyatEnd] = useState("10");
  const [nilai, setNilai] = useState<"Lancar" | "Sedang" | "Perlu Ulang">("Lancar");
  const [catatan, setCatatan] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitSetoran = async () => {
    if (!selectedSantriId) {
      message.error("Silakan pilih santri terlebih dahulu.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        santriId: selectedSantriId,
        surat: suratInput,
        ayatMulai: parseInt(ayatStart, 10) || 1,
        ayatSelesai: parseInt(ayatEnd, 10) || 10,
        status: jenisSetoran, // Use status as in useHafalanGuru
        keterangan: catatan,
        tanggal: new Date().toISOString(),
      };
      // Map back value status to be readable or align with hook expectation
      await saveHafalan({ ...payload, status: jenisSetoran === 'Ziyadah' ? 'ziyadah' : 'murojaah' });
      setNilai("Lancar");
      setCatatan("");
    } catch (err) {
      console.error("Error submit setoran:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredSantri = santriList.filter((s) =>
    s.namaLengkap.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedSantriObj = santriList.find((s) => s.id === selectedSantriId);

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-[#f4f9fb] p-4 space-y-4 pb-24">
      {/* Header Banner */}
      <DashboardHeader
        badge={
          <span className="inline-flex items-center gap-1.5">
            <BookOutlined />
            Pencatatan Setoran
          </span>
        }
        title="Hafalan Santri"
        subtitle="Catat setoran ziyadah & muroja'ah santri langsung dari Mushaf Digital."
      />

      {/* Tab Header Selector */}
      <MobileCard className="flex p-1">
        <button
          onClick={() => setActiveTab("SETORAN")}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === "SETORAN"
              ? "bg-blue-green text-white shadow-lg shadow-blue-green/20"
              : "text-slate-500 hover:text-deep-space"
          }`}
        >
          <CheckCircleOutlined />
          <span>Setoran Santri</span>
        </button>
        <button
          onClick={() => setActiveTab("MUSHAF")}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === "MUSHAF"
              ? "bg-blue-green text-white shadow-lg shadow-blue-green/20"
              : "text-slate-500 hover:text-deep-space"
          }`}
        >
          <BookOutlined />
          <span>Mushaf Al-Qur'an</span>
        </button>
      </MobileCard>

      {activeTab === "SETORAN" ? (
        <>
          {/* Search bar & Santri dari Halaqah Sendiri */}
          <div className="relative">
            <Input
              placeholder="Cari santri di halaqah Anda..."
              prefix={<SearchOutlined className="text-slate-500 mr-1" />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white border-slate-200 text-deep-space placeholder:text-slate-400 rounded-2xl h-11 text-xs shadow-sm"
            />
          </div>

          <MobileCard className="p-3 flex items-center justify-between">
            <span className="text-xs text-slate-600 font-semibold">
              Santri Halaqah Saya
            </span>
            <span className="text-xs text-blue-green bg-sky-blue/20 px-2.5 py-0.5 rounded-full font-bold">
              {santriList.length} Santri
            </span>
          </MobileCard>

          {loading ? (
            <div className="space-y-3">
              <Skeleton active paragraph={{ rows: 2 }} className="bg-white p-4 rounded-2xl" />
              <Skeleton active paragraph={{ rows: 2 }} className="bg-white p-4 rounded-2xl" />
            </div>
          ) : filteredSantri.length === 0 ? (
            <MobileCard className="py-8 text-center text-slate-400 text-xs">
              Tidak ada santri yang cocok dengan kriteria pencarian di halaqah Anda.
            </MobileCard>
          ) : (
            <div className="space-y-3">
              {filteredSantri.map((santri) => {
                const riwayatSantri = riwayatList.filter(
                  (r) => r.santriId === santri.id
                );
                const lastSetoran =
                  riwayatSantri.length > 0 ? riwayatSantri[0] : null;

                return (
                  <MobileCard
                    key={santri.id}
                    className="flex items-center justify-between transition-all hover:ring-sky-blue/60"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-sky-blue/20 border border-sky-blue/30 text-blue-green flex items-center justify-center font-bold text-sm">
                        {santri.namaLengkap.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-deep-space">
                          {santri.namaLengkap}
                        </h4>
                        <div className="text-xs text-slate-500">
                          {lastSetoran
                            ? `Terakhir: ${lastSetoran.surat} (${lastSetoran.ayatMulai}-${lastSetoran.ayatSelesai})`
                            : "Belum ada setoran"}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (santri.id) {
                          setSelectedSantriId(santri.id);
                        } else if (santriList.length > 0 && !selectedSantriId) {
                          setSelectedSantriId(santriList[0].id);
                        }
                        setNilai("Lancar");
                        setCatatan("");
                        setIsSheetOpen(true);
                      }}
                      className="bg-blue-green/10 hover:bg-blue-green/20 text-blue-green border border-blue-green/30 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all"
                    >
                      <PlusOutlined />
                      <span>Setor</span>
                    </button>
                  </MobileCard>
                );
              })}
            </div>
          )}
        </>
      ) : (
        /* Mushaf Al-Quran Mode + FAB Ziyadah/Murojaah */
        <div className="space-y-4">
          <MobileCard className="p-3 flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-600">
              Mushaf Al-Qur'an Digital (Aktual)
            </span>
            <span className="text-[11px] text-slate-500">
              Juz 1 - 30
            </span>
          </MobileCard>

          <MobileCard className="rounded-3xl p-3 min-h-[60vh]">
            <MushafDigital juzMulai={1} juzSampai={30} tipeUjian="per-juz" />
          </MobileCard>

          {/* Floating Action Button (FAB) "+ Setoran (Ziyadah / Murojaah)" */}
          <button
            onClick={() => {
              setJenisSetoran("Ziyadah");
              if (selectedSantriId || santriList[0]?.id) {
                setSelectedSantriId(selectedSantriId || santriList[0]?.id);
              }
              setNilai("Lancar");
              setCatatan("");
              setIsSheetOpen(true);
            }}
            className="fixed bottom-20 right-4 z-40 bg-gradient-to-r from-blue-green to-deep-space hover:from-blue-green/90 hover:to-deep-space/90 text-white font-bold px-4 py-3 rounded-full shadow-xl shadow-blue-green/30 flex items-center gap-2.5 transition-all transform active:scale-95"
          >
            <PlusOutlined className="text-lg" />
            <span className="text-sm">Isi Ziyadah / Murojaah</span>
          </button>
        </div>
      )}

      {/* Grab-style Bottom Sheet Form Setoran */}
      <MobileBottomSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        title={`Setoran: ${selectedSantriObj?.namaLengkap || "Santri"}`}
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1">
              Pilih Santri (Halaqah Sendiri)
            </label>
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
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1">
              Jenis Setoran
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(["Ziyadah", "Murojaah"] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setJenisSetoran(item)}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    jenisSetoran === item
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
                      : "bg-slate-100 text-slate-500 border border-slate-200 hover:text-deep-space"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1">
              Pilih Surat
            </label>
            <MobileSelectSheet
              value={suratInput}
              onChange={(val) => setSuratInput(String(val))}
              placeholder="Pilih surat..."
              title="Pilih Surat Al-Qur'an"
              loading={suratLoading}
              options={suratList.map((surat) => ({
                value: surat.namaLatin,
                label: `${surat.nomor}. ${surat.namaLatin}`,
                searchText: `${surat.namaLatin} ${surat.nomor}`,
              }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 block mb-1">
                Dari Ayat
              </label>
              <Input
                value={ayatStart}
                onChange={(e) => setAyatStart(e.target.value)}
                type="number"
                className="h-11 bg-white border-slate-200 text-deep-space shadow-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 block mb-1">
                Sampai Ayat
              </label>
              <Input
                value={ayatEnd}
                onChange={(e) => setAyatEnd(e.target.value)}
                type="number"
                className="h-11 bg-white border-slate-200 text-deep-space shadow-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1">
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
                      ? "bg-blue-green text-white shadow-md shadow-blue-green/20"
                      : "bg-slate-100 text-slate-500 border border-slate-200 hover:text-deep-space"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1">
              Catatan Guru (Tajwid / Mukhraj)
            </label>
            <Input.TextArea
              rows={3}
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Contoh: Perhatikan ghunnah pada ayat ke-5..."
              className="bg-white border-slate-200 text-deep-space rounded-xl placeholder:text-slate-400 shadow-sm"
            />
          </div>

          <div className="pt-2">
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={isSubmitting}
              onClick={handleSubmitSetoran}
              className="w-full h-12 rounded-2xl bg-blue-green hover:bg-blue-green font-bold text-sm shadow-xl shadow-blue-green/25 border-none"
            >
              Simpan Setoran
            </Button>
          </div>
        </div>
      </MobileBottomSheet>
    </div>
  );
}
