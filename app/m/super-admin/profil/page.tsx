"use client";

import React, { useEffect, useState } from "react";
import { Avatar, Button, message } from "antd";
import { UserOutlined, LogoutOutlined, CrownOutlined, KeyOutlined, SafetyCertificateOutlined } from "@ant-design/icons";

interface SuperAdminUser {
  id: number;
  namaLengkap: string;
  username: string;
  role: { name: string };
}

export default function MobileSuperAdminProfil() {
  const [user, setUser] = useState<SuperAdminUser | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUser(data.user);
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    try {
      message.loading({ content: "Sedang logout...", key: "logout" });
      await fetch("/api/logout", { method: "POST" });
      window.location.href = "/login";
    } catch {
      message.error({ content: "Gagal logout. Silakan coba lagi.", key: "logout" });
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header Profil Super Admin */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 border border-slate-800 rounded-3xl p-5 flex items-center gap-4 shadow-lg">
        <Avatar
          size={64}
          style={{ backgroundColor: "#4f46e5" }}
          icon={<CrownOutlined />}
          className="border-2 border-indigo-400/30 flex-shrink-0"
        />
        <div className="min-w-0">
          <span className="inline-block px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 text-[11px] font-semibold mb-1">
            Super Administrator
          </span>
          <h2 className="text-lg font-bold text-white truncate">
            {user?.namaLengkap || "Super Admin User"}
          </h2>
          <p className="text-xs text-slate-400 truncate">@{user?.username || "superadmin"}</p>
        </div>
      </div>

      {/* Detail Informasi */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Otoritas Tingkat Tinggi</h3>
        
        <div className="flex items-center justify-between p-3 bg-slate-800/40 rounded-xl">
          <div className="flex items-center gap-3">
            <CrownOutlined className="text-indigo-400 text-lg" />
            <span className="text-sm font-medium text-slate-200">Akses Root / Sistem Penuh</span>
          </div>
          <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">Aktif</span>
        </div>

        <div className="flex items-center justify-between p-3 bg-slate-800/40 rounded-xl">
          <div className="flex items-center gap-3">
            <KeyOutlined className="text-indigo-400 text-lg" />
            <span className="text-sm font-medium text-slate-200">Reset & Kelola Passcode</span>
          </div>
          <span className="text-xs font-semibold text-slate-400">Diizinkan</span>
        </div>
      </div>

      {/* Tombol Logout Merah */}
      <div className="pt-2">
        <Button
          danger
          type="primary"
          icon={<LogoutOutlined />}
          onClick={handleLogout}
          className="w-full h-12 rounded-2xl font-bold text-sm bg-rose-600 hover:bg-rose-700 border-none shadow-lg shadow-rose-950/50"
        >
          Keluar (Logout)
        </Button>
      </div>
    </div>
  );
}
