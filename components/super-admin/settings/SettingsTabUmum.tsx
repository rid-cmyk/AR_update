import React from "react";
import { Input, Select, Switch, Divider } from "antd";

const { Option } = Select;
const { TextArea } = Input;

export interface SettingsTabUmumProps {
  namaLembaga: string;
  setNamaLembaga: (v: string) => void;
  alamatLembaga: string;
  setAlamatLembaga: (v: string) => void;
  tahunAjaran: string;
  setTahunAjaran: (v: string) => void;
  semesterAktif: string;
  setSemesterAktif: (v: string) => void;
  notifikasiWa: boolean;
  setNotifikasiWa: (v: boolean) => void;
}

export function SettingsTabUmum({
  namaLembaga,
  setNamaLembaga,
  alamatLembaga,
  setAlamatLembaga,
  tahunAjaran,
  setTahunAjaran,
  semesterAktif,
  setSemesterAktif,
  notifikasiWa,
  setNotifikasiWa,
}: SettingsTabUmumProps) {
  return (
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
  );
}
