import React from "react";
import { Switch } from "antd";

export interface SettingsTabAksesProps {
  twoFactorAuth: boolean;
  setTwoFactorAuth: (v: boolean) => void;
  allowGuruEditNilai: boolean;
  setAllowGuruEditNilai: (v: boolean) => void;
  publicRaporAccess: boolean;
  setPublicRaporAccess: (v: boolean) => void;
}

export function SettingsTabAkses({
  twoFactorAuth,
  setTwoFactorAuth,
  allowGuruEditNilai,
  setAllowGuruEditNilai,
  publicRaporAccess,
  setPublicRaporAccess,
}: SettingsTabAksesProps) {
  return (
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
  );
}
