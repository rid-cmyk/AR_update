"use client";

import React, { useState } from "react";
import { SettingsTabUmum } from "./SettingsTabUmum";
import { SettingsTabHalaqah } from "./SettingsTabHalaqah";
import { SettingsTabUjian } from "./SettingsTabUjian";
import { SettingsTabAkses } from "./SettingsTabAkses";
import {
  Tabs,
  Card,
  Input,
  InputNumber,
  Select,
  Switch,
  Button,
  message,
  Tag,
  Divider,
} from "antd";
import {
  BankOutlined,
  TeamOutlined,
  ReadOutlined,
  SafetyCertificateOutlined,
  SaveOutlined,
  CheckCircleOutlined,
  SettingOutlined,
} from "@ant-design/icons";

const { Option } = Select;
const { TextArea } = Input;

export function AdminSettingsHub() {
  const [loading, setLoading] = useState(false);

  // 1. Umum & Akademik State
  const [namaLembaga, setNamaLembaga] = useState("LEMBAGA TAHFIZH AL-QURAN AL-HUDA");
  const [alamatLembaga, setAlamatLembaga] = useState("Jl. Pendidikan Islam No. 99, Kota Baru — Jawa Barat, Indonesia");
  const [tahunAjaran, setTahunAjaran] = useState("2025/2026");
  const [semesterAktif, setSemesterAktif] = useState("Genap");
  const [notifikasiWa, setNotifikasiWa] = useState(true);

  // 2. Manajemen Halaqah & Guru State
  const [maxSantriPerHalaqah, setMaxSantriPerHalaqah] = useState(25);
  const [pendaftaranMandiri, setPendaftaranMandiri] = useState(false);
  const [autoPlotHalaqah, setAutoPlotHalaqah] = useState(true);

  // 3. Konfigurasi Ujian State
  const [kkmDefault, setKkmDefault] = useState(70);
  const [bobotKelancaran, setBobotKelancaran] = useState(50);
  const [bobotTajwid, setBobotTajwid] = useState(50);
  const [defaultSoalMhq, setDefaultSoalMhq] = useState(3);
  const [autoVerifikasiUjian, setAutoVerifikasiUjian] = useState(false);

  // 4. Hak Akses & Pengguna State
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [allowGuruEditNilai, setAllowGuruEditNilai] = useState(true);
  const [publicRaporAccess, setPublicRaporAccess] = useState(true);

  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      message.loading({ content: "Menyimpan konfigurasi sistem...", key: "save-settings" });

      // Simulate API call persistence
      await new Promise((resolve) => setTimeout(resolve, 800));

      message.success({
        content: "Seluruh pengaturan berhasil disimpan!",
        key: "save-settings",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      message.error({
        content: "Gagal menyimpan konfigurasi",
        key: "save-settings",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-[85vh] bg-slate-50 text-slate-900 font-sans pb-24 relative">
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white p-8 rounded-3xl mb-6 shadow-lg border border-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <SettingOutlined className="text-emerald-400 text-2xl" />
              <h1 className="text-2xl font-black tracking-wide text-white m-0">
                PENGATURAN SISTEM TAHFIZH
              </h1>
              <Tag color="emerald" className="font-bold">ADMIN HUB</Tag>
            </div>
            <p className="text-sm text-slate-300 max-w-2xl m-0">
              Kelola parameter lembaga, tahun akademik, batasan halaqah, KKM ujian hafalan, dan hak akses pengguna dalam satu dasbor terpadu.
            </p>
          </div>
          <div className="hidden md:block">
            <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/15 text-center">
              <div className="text-xs text-slate-300 font-medium">Tahun Akademik</div>
              <div className="text-lg font-extrabold text-emerald-400">
                {tahunAjaran} ({semesterAktif})
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <Tabs
          defaultActiveKey="1"
          size="large"
          tabBarGutter={32}
          items={[
            {
              key: "1",
              label: (
                <span className="flex items-center gap-2 font-bold px-2 py-1">
                  <BankOutlined className="text-emerald-600" />
                  1. Umum & Akademik
                </span>
              ),
              children: (
                <SettingsTabUmum
                  namaLembaga={namaLembaga} setNamaLembaga={setNamaLembaga}
                  alamatLembaga={alamatLembaga} setAlamatLembaga={setAlamatLembaga}
                  tahunAjaran={tahunAjaran} setTahunAjaran={setTahunAjaran}
                  semesterAktif={semesterAktif} setSemesterAktif={setSemesterAktif}
                  notifikasiWa={notifikasiWa} setNotifikasiWa={setNotifikasiWa}
                />
              ),
            },
            {
              key: "2",
              label: (
                <span className="flex items-center gap-2 font-bold px-2 py-1">
                  <TeamOutlined className="text-emerald-600" />
                  2. Manajemen Halaqah & Guru
                </span>
              ),
              children: (
                <SettingsTabHalaqah
                  maxSantriPerHalaqah={maxSantriPerHalaqah} setMaxSantriPerHalaqah={setMaxSantriPerHalaqah}
                  pendaftaranMandiri={pendaftaranMandiri} setPendaftaranMandiri={setPendaftaranMandiri}
                  autoPlotHalaqah={autoPlotHalaqah} setAutoPlotHalaqah={setAutoPlotHalaqah}
                />
              ),
            },
            {
              key: "3",
              label: (
                <span className="flex items-center gap-2 font-bold px-2 py-1">
                  <ReadOutlined className="text-emerald-600" />
                  3. Konfigurasi Ujian
                </span>
              ),
              children: (
                <SettingsTabUjian
                  kkmDefault={kkmDefault} setKkmDefault={setKkmDefault}
                  bobotKelancaran={bobotKelancaran} setBobotKelancaran={setBobotKelancaran}
                  bobotTajwid={bobotTajwid} setBobotTajwid={setBobotTajwid}
                  defaultSoalMhq={defaultSoalMhq} setDefaultSoalMhq={setDefaultSoalMhq}
                  autoVerifikasiUjian={autoVerifikasiUjian} setAutoVerifikasiUjian={setAutoVerifikasiUjian}
                />
              ),
            },
            {
              key: "4",
              label: (
                <span className="flex items-center gap-2 font-bold px-2 py-1">
                  <SafetyCertificateOutlined className="text-emerald-600" />
                  4. Hak Akses & Pengguna
                </span>
              ),
              children: (
                <SettingsTabAkses
                  twoFactorAuth={twoFactorAuth} setTwoFactorAuth={setTwoFactorAuth}
                  allowGuruEditNilai={allowGuruEditNilai} setAllowGuruEditNilai={setAllowGuruEditNilai}
                  publicRaporAccess={publicRaporAccess} setPublicRaporAccess={setPublicRaporAccess}
                />
              ),
            },
          ]}
        />
      </div>

      {/* STICKY SAVE BAR */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 px-8 py-4 shadow-2xl z-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CheckCircleOutlined className="text-emerald-600 text-xl" />
          <div>
            <div className="text-sm font-bold text-slate-800">Perubahan Belum Disimpan</div>
            <div className="text-xs text-slate-500">Klik &quot;Simpan Perubahan&quot; agar konfigurasi berlaku di seluruh dasbor.</div>
          </div>
        </div>
        <Button
          type="primary"
          size="large"
          icon={<SaveOutlined />}
          onClick={handleSaveSettings}
          loading={loading}
          className="h-12 px-8 rounded-2xl bg-emerald-600 hover:bg-emerald-500 border-none font-bold shadow-lg shadow-emerald-600/25 text-sm"
        >
          Simpan Perubahan
        </Button>
      </div>
    </div>
  );
}

export default AdminSettingsHub;
