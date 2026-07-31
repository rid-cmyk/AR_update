"use client";

import React, { useEffect, useState } from "react";
import { UserOutlined, SearchOutlined } from "@ant-design/icons";

interface UserItem {
  id: number;
  namaLengkap: string;
  username: string;
  role: { name: string };
}

export default function MobileSuperAdminUsers() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setUsers(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredUsers = users.filter(
    (u) =>
      u.namaLengkap?.toLowerCase().includes(search.toLowerCase()) ||
      u.username?.toLowerCase().includes(search.toLowerCase()) ||
      u.role?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 space-y-4">
      {/* Header Halaman */}
      <div>
        <h2 className="text-lg font-bold text-white">Manajemen Pengguna</h2>
        <p className="text-xs text-slate-400">Daftar seluruh akun dan role pengguna dalam sistem</p>
      </div>

      {/* Input Pencarian */}
      <div className="relative">
        <SearchOutlined className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
        <input
          type="text"
          placeholder="Cari user berdasarkan nama/role..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
        />
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400 text-sm">Memuat daftar pengguna...</div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-sm">Tidak ada user ditemukan</div>
      ) : (
        <div className="space-y-2">
          {filteredUsers.map((u) => (
            <div
              key={u.id}
              className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center flex-shrink-0 font-bold">
                  <UserOutlined />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-semibold text-white truncate">{u.namaLengkap}</h4>
                  <p className="text-xs text-slate-400 truncate">@{u.username}</p>
                </div>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex-shrink-0 capitalize">
                {u.role?.name?.replace("_", " ") || "user"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
