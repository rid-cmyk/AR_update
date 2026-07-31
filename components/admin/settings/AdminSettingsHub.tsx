"use client";

import React, { useState } from "react";
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                  {/* CARD 1: Identitas Lembaga */}
                  <div className="bg-slate-50/70 border border-slate-200 p-6 rounded-2xl space-y-4 shadow-sm">
                    <div className="border-b border-slate-200 pb-3">
                      <h3 className="text-base font-bold text-slate-800 m-0">Identitas Lembaga Tahfizh</h3>
                      <p className="text-xs text-slate-500 m-0">Nama pesantren, alamat surat, dan identitas resmi</p>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Nama Lembaga / Pesantren
                        </label>
                        <Input
                          value={namaLembaga}
                          onChange={(e) => setNamaLembaga(e.target.value)}
                          className="h-10 rounded-xl font-medium"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Alamat Lengkap Lembaga
                        </label>
                        <TextArea
                          rows={3}
                          value={alamatLembaga}
                          onChange={(e) => setAlamatLembaga(e.target.value)}
                          className="rounded-xl font-medium"
                        />
                      </div>
                    </div>
                  </div>

                  {/* CARD 2: Parameter Akademik & Notifikasi */}
                  <div className="bg-slate-50/70 border border-slate-200 p-6 rounded-2xl space-y-4 shadow-sm">
                    <div className="border-b border-slate-200 pb-3">
                      <h3 className="text-base font-bold text-slate-800 m-0">Tahun Ajaran & Notifikasi</h3>
                      <p className="text-xs text-slate-500 m-0">Tahun akademik aktif yang berlaku di seluruh dasbor</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Tahun Ajaran Aktif
                        </label>
                        <Select
                          value={tahunAjaran}
                          onChange={(val) => setTahunAjaran(val)}
                          className="w-full"
                          size="large"
                        >
                          <Option value="2024/2025">2024/2025</Option>
                          <Option value="2025/2026">2025/2026</Option>
                          <Option value="2026/2027">2026/2027</Option>
                        </Select>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Semester Aktif
                        </label>
                        <Select
                          value={semesterAktif}
                          onChange={(val) => setSemesterAktif(val)}
                          className="w-full"
                          size="large"
                        >
                          <Option value="Ganjil">Ganjil</Option>
                          <Option value="Genap">Genap</Option>
                        </Select>
                      </div>
                    </div>

                    <Divider className="my-3" />

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-bold text-slate-800">
                          Notifikasi WhatsApp Wali Santri
                        </div>
                        <div className="text-xs text-slate-500">
                          Kirim pesan WA otomatis saat guru merilis nilai ujian
                        </div>
                      </div>
                      <Switch
                        checked={notifikasiWa}
                        onChange={(val) => setNotifikasiWa(val)}
                        className="bg-slate-300"
                      />
                    </div>
                  </div>
                </div>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                  {/* CARD 1: Kapasitas Halaqah */}
                  <div className="bg-slate-50/70 border border-slate-200 p-6 rounded-2xl space-y-4 shadow-sm">
                    <div className="border-b border-slate-200 pb-3">
                      <h3 className="text-base font-bold text-slate-800 m-0">Batasan Kelompok Halaqah</h3>
                      <p className="text-xs text-slate-500 m-0">Kapasitas dan rasio guru terhadap santri tahfizh</p>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Batas Maksimal Santri per Halaqah
                        </label>
                        <InputNumber
                          min={5}
                          max={50}
                          value={maxSantriPerHalaqah}
                          onChange={(val) => setMaxSantriPerHalaqah(Number(val || 25))}
                          className="w-32 text-center font-bold"
                          size="large"
                        />
                        <span className="text-xs text-slate-500 ml-2">santri / ustadz</span>
                      </div>
                    </div>
                  </div>

                  {/* CARD 2: Pendaftaran & Plotting */}
                  <div className="bg-slate-50/70 border border-slate-200 p-6 rounded-2xl space-y-5 shadow-sm">
                    <div className="border-b border-slate-200 pb-3">
                      <h3 className="text-base font-bold text-slate-800 m-0">Otomatisasi Plotting</h3>
                      <p className="text-xs text-slate-500 m-0">Atur pendaftaran santri baru ke kelompok halaqah</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-bold text-slate-800">
                          Pendaftaran Halaqah Mandiri
                        </div>
                        <div className="text-xs text-slate-500">
                          Izinkan santri memilih ustadz pembimbing sendiri
                        </div>
                      </div>
                      <Switch
                        checked={pendaftaranMandiri}
                        onChange={(val) => setPendaftaranMandiri(val)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-bold text-slate-800">
                          Plotting Halaqah Otomatis
                        </div>
                        <div className="text-xs text-slate-500">
                          Seimbangkan jumlah santri pada tiap halaqah baru
                        </div>
                      </div>
                      <Switch
                        checked={autoPlotHalaqah}
                        onChange={(val) => setAutoPlotHalaqah(val)}
                      />
                    </div>
                  </div>
                </div>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                  {/* CARD 1: KKM & Bobot */}
                  <div className="bg-slate-50/70 border border-slate-200 p-6 rounded-2xl space-y-4 shadow-sm">
                    <div className="border-b border-slate-200 pb-3">
                      <h3 className="text-base font-bold text-slate-800 m-0">KKM & Standar Kelulusan</h3>
                      <p className="text-xs text-slate-500 m-0">Batas kelulusan (KKM) minimum nilai ujian tahfizh</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Batas KKM Minimum (0-100)
                        </label>
                        <InputNumber
                          min={50}
                          max={90}
                          value={kkmDefault}
                          onChange={(val) => setKkmDefault(Number(val || 70))}
                          className="w-full text-center font-bold"
                          size="large"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Default Jumlah Soal MHQ
                        </label>
                        <InputNumber
                          min={1}
                          max={10}
                          value={defaultSoalMhq}
                          onChange={(val) => setDefaultSoalMhq(Number(val || 3))}
                          className="w-full text-center font-bold"
                          size="large"
                        />
                      </div>
                    </div>

                    <Divider className="my-3" />

                    <div>
                      <div className="text-xs font-bold text-slate-700 mb-2">
                        Standar Bobot Penilaian (% Total = 100%)
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[11px] text-slate-500 block">Bobot Kelancaran</label>
                          <InputNumber
                            min={10}
                            max={90}
                            value={bobotKelancaran}
                            onChange={(val) => setBobotKelancaran(Number(val || 50))}
                            className="w-full font-bold"
                            addonAfter="%"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-slate-500 block">Bobot Tajwid & Fashahah</label>
                          <InputNumber
                            min={10}
                            max={90}
                            value={bobotTajwid}
                            onChange={(val) => setBobotTajwid(Number(val || 50))}
                            className="w-full font-bold"
                            addonAfter="%"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CARD 2: Otomatisasi Verifikasi */}
                  <div className="bg-slate-50/70 border border-slate-200 p-6 rounded-2xl space-y-5 shadow-sm">
                    <div className="border-b border-slate-200 pb-3">
                      <h3 className="text-base font-bold text-slate-800 m-0">Alur Verifikasi Nilai</h3>
                      <p className="text-xs text-slate-500 m-0">Aturan persetujuan nilai sebelum dirilis ke raport</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-bold text-slate-800">
                          Auto-Verifikasi Nilai Ujian
                        </div>
                        <div className="text-xs text-slate-500">
                          Rilis langsung nilai ujian guru tanpa persetujuan manual kepala tahfizh
                        </div>
                      </div>
                      <Switch
                        checked={autoVerifikasiUjian}
                        onChange={(val) => setAutoVerifikasiUjian(val)}
                      />
                    </div>
                  </div>
                </div>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                  {/* CARD 1: Hak Akses Guru & Wali */}
                  <div className="bg-slate-50/70 border border-slate-200 p-6 rounded-2xl space-y-5 shadow-sm">
                    <div className="border-b border-slate-200 pb-3">
                      <h3 className="text-base font-bold text-slate-800 m-0">Hak Akses Pembimbing</h3>
                      <p className="text-xs text-slate-500 m-0">Batas kewenangan pengampu pada dasbor</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-bold text-slate-800">
                          Izinkan Guru Edit Nilai Selesai
                        </div>
                        <div className="text-xs text-slate-500">
                          Guru dapat merevisi nilai ujian dalam 24 jam setelah selesai
                        </div>
                      </div>
                      <Switch
                        checked={allowGuruEditNilai}
                        onChange={(val) => setAllowGuruEditNilai(val)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-bold text-slate-800">
                          Akses Salinan Rapor Wali Santri
                        </div>
                        <div className="text-xs text-slate-500">
                          Orang tua dapat mengunduh PDF rapor secara mandiri dari dasbor
                        </div>
                      </div>
                      <Switch
                        checked={publicRaporAccess}
                        onChange={(val) => setPublicRaporAccess(val)}
                      />
                    </div>
                  </div>

                  {/* CARD 2: Keamanan Sistem */}
                  <div className="bg-slate-50/70 border border-slate-200 p-6 rounded-2xl space-y-5 shadow-sm">
                    <div className="border-b border-slate-200 pb-3">
                      <h3 className="text-base font-bold text-slate-800 m-0">Keamanan Akun</h3>
                      <p className="text-xs text-slate-500 m-0">Perlindungan sesi dan login ganda</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-bold text-slate-800">
                          Autentikasi Dua-Faktor (2FA) Admin
                        </div>
                        <div className="text-xs text-slate-500">
                          Wajibkan kode keamanan email untuk Admin/Super Admin
                        </div>
                      </div>
                      <Switch
                        checked={twoFactorAuth}
                        onChange={(val) => setTwoFactorAuth(val)}
                      />
                    </div>
                  </div>
                </div>
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
