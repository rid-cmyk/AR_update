"use client";

import React, { useEffect, useState } from "react";
import { Avatar, Button, message } from "antd";
import { UserOutlined, LogoutOutlined, LockOutlined, SafetyCertificateOutlined } from "@ant-design/icons";

interface AdminUser {
  id: number;
  namaLengkap: string;
  username: string;
  role: { name: string };
}

export default function MobileAdminProfil() {
  const [user, setUser] = useState<AdminUser | null>(null);

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
      {/* Profil Card Header */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-sky-950 border border-slate-800 rounded-3xl p-5 flex items-center gap-4 shadow-lg">
        <Avatar
          size={64}
          style={{ backgroundColor: "#0284c7" }}
          icon={<UserOutlined />}
          className="border-2 border-sky-400/30 flex-shrink-0"
        />
        <div className="min-w-0">
          <span className="inline-block px-2.5 py-0.5 rounded-full bg-sky-500/15 text-sky-400 text-[11px] font-semibold mb-1">
            Administrator
          </span>
          <h2 className="text-lg font-bold text-white truncate">
            {user?.namaLengkap || "Admin User"}
          </h2>
          <p className="text-xs text-slate-400 truncate">@{user?.username || "admin"}</p>
        </div>
      </div>

      {/* Detail Informasi */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pengaturan Akun</h3>
        
        <div className="flex items-center justify-between p-3 bg-slate-800/40 rounded-xl">
          <div className="flex items-center gap-3">
            <SafetyCertificateOutlined className="text-sky-400 text-lg" />
            <span className="text-sm font-medium text-slate-200">Hak Akses Administrator</span>
          </div>
          <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">Aktif</span>
        </div>

        <div className="flex items-center justify-between p-3 bg-slate-800/40 rounded-xl">
          <div className="flex items-center gap-3">
            <LockOutlined className="text-sky-400 text-lg" />
            <span className="text-sm font-medium text-slate-200">Keamanan Sesi JWT</span>
          </div>
          <span className="text-xs font-semibold text-slate-400">Terproteksi</span>
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
