"use client";

import React, { useState } from "react";
import { Input, Avatar, Tag } from "antd";
import {
  SearchOutlined,
  UserOutlined,
  BookOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";

export default function MobileYayasanSantri() {
  const [searchQuery, setSearchQuery] = useState("");

  const direktoriSantri = [
    {
      id: 1,
      nama: "Ahmad Zaki",
      nis: "20240105",
      halaqah: "Halaqah Abu Bakar",
      pengampu: "Ust. Hendri Sudianto",
      hafalan: "2 Juz",
      status: "Aktif",
    },
    {
      id: 2,
      nama: "Fatimah Azzahra",
      nis: "20240112",
      halaqah: "Halaqah Umar",
      pengampu: "Ust. Faisal Rahman",
      hafalan: "5 Juz",
      status: "Aktif",
    },
    {
      id: 3,
      nama: "Muhammad Yusuf",
      nis: "20240118",
      halaqah: "Halaqah Utsman",
      pengampu: "Ust. Abdullah Hakim",
      hafalan: "11 Juz",
      status: "Aktif",
    },
    {
      id: 4,
      nama: "Zainab Al-Kubro",
      nis: "20240125",
      halaqah: "Halaqah Ali",
      pengampu: "Ustdz. Nurul Huda",
      hafalan: "3 Juz",
      status: "Aktif",
    },
  ];

  const filtered = direktoriSantri.filter(
    (s) =>
      s.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.halaqah.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 space-y-4">
      {/* Search & Header */}
      <div>
        <h3 className="text-sm font-bold text-slate-200 mb-1">
          Direktori Santri Lembaga
        </h3>
        <p className="text-xs text-slate-400 mb-3">
          Total 342 Santri dari 15 Halaqah
        </p>
        <Input
          prefix={<SearchOutlined className="text-slate-500 mr-1" />}
          placeholder="Cari nama santri atau halaqah..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-slate-900 border-slate-800 rounded-2xl h-11 text-white placeholder:text-slate-500"
        />
      </div>

      {/* Daftar Santri */}
      <div className="space-y-2.5">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <Avatar
                size={42}
                style={{ backgroundColor: "#9333ea" }}
                icon={<UserOutlined />}
              />
              <div>
                <h4 className="text-sm font-bold text-white">{item.nama}</h4>
                <div className="text-xs text-purple-400 font-medium">
                  {item.halaqah}
                </div>
                <div className="text-[11px] text-slate-500">
                  NIS: {item.nis} &bull; {item.pengampu}
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-block px-2.5 py-1 rounded-xl bg-purple-500/15 text-purple-300 font-bold text-xs">
                {item.hafalan}
              </span>
              <div className="text-[10px] text-emerald-400 mt-1">
                &bull; {item.status}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
