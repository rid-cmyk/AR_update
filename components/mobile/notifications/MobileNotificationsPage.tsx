"use client";

import React, { useState } from "react";
import { Avatar, Empty, Spin } from "antd";
import {
  BellOutlined,
  BookOutlined,
  CalendarOutlined,
  TrophyOutlined,
  InfoCircleOutlined,
  ClockCircleOutlined,
  CheckOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/id";
import { useNotifikasi } from "@/hooks/useNotifikasi";

dayjs.extend(relativeTime);
dayjs.locale("id");

const MOBILE_ACTION_URL_MAP: Record<string, string> = {};

const getTipeIcon = (tipe: string) => {
  switch (tipe) {
    case "hafalan":
      return <BookOutlined />;
    case "target":
      return <CalendarOutlined />;
    case "pengumuman":
      return <BellOutlined />;
    case "jadwal":
      return <ClockCircleOutlined />;
    case "prestasi":
      return <TrophyOutlined />;
    default:
      return <InfoCircleOutlined />;
  }
};

const getTipeColor = (tipe: string) => {
  switch (tipe) {
    case "hafalan":
      return "#219ebc";
    case "target":
      return "#219ebc";
    case "pengumuman":
      return "#ffb703";
    case "jadwal":
      return "#8ecae6";
    case "prestasi":
      return "#fbbf24";
    default:
      return "#64748b";
  }
};

export default function MobileNotificationsPage({ roleTitle = "Guru" }: { roleTitle?: string }) {
  const [expandedId, setExpandedId] = useState<number | string | null>(null);

  const {
    notifikasiList,
    loading,
    filterStatus,
    setFilterStatus,
    filteredData,
    unreadCount,
    handleMarkAsRead,
    fetchNotifikasi,
  } = useNotifikasi({ actionUrlMap: MOBILE_ACTION_URL_MAP });

  const handleClick = (id: number | string, tipe: string) => {
    handleMarkAsRead(id);
    if (tipe === "pengumuman") {
      setExpandedId((prev) => (prev === id ? null : id));
    }
  };

  const filterTabs: { key: string; label: string; count: number }[] = [
    { key: "all", label: "Semua", count: notifikasiList.length },
    { key: "unread", label: "Belum Dibaca", count: unreadCount },
  ];

  return (
    <div className="p-4 space-y-5 pb-24">
      {/* Banner Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-800 via-navy-900 to-navy-950 p-5 border border-navy-700">
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-green to-sky-blue flex items-center justify-center shadow-lg shadow-blue-green/30">
            <BellOutlined className="text-white text-xl" />
          </div>
          <div className="min-w-0">
            <h2 className="text-white font-bold text-base leading-tight">
              Notifikasi
            </h2>
            <p className="text-xs text-slate-400 truncate">
              {roleTitle} • {unreadCount} belum dibaca
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={fetchNotifikasi}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 transition-colors tap-active"
          title="Muat Ulang"
          aria-label="Muat Ulang"
        >
          <ReloadOutlined className="text-sm" />
        </button>
        <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-brand-teal/20 blur-2xl pointer-events-none" />
      </div>

      {/* Filter Status */}
      <div className="grid grid-cols-2 gap-2.5">
        {filterTabs.map((tab) => {
          const active = filterStatus === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setFilterStatus(tab.key)}
              className={`py-2.5 rounded-2xl border text-xs font-semibold transition-all tap-active ${
                active
                  ? "border-brand-teal bg-brand-teal/15 text-brand-teal"
                  : "border-navy-800 bg-navy-900/60 text-slate-400 hover:bg-navy-700/50"
              }`}
            >
              {tab.label}{" "}
              <span
                className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${
                  active
                    ? "bg-brand-teal/25 text-brand-teal"
                    : "bg-navy-800 text-slate-400"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Daftar Notifikasi */}
      <Spin spinning={loading}>
        {filteredData.length === 0 ? (
          <div className="py-10 rounded-3xl bg-navy-900/40 border border-navy-800">
            <Empty
              description={
                <span className="text-slate-400 text-xs">
                  {loading
                    ? "Memuat notifikasi..."
                    : filterStatus === "unread"
                    ? "Tidak ada notifikasi belum dibaca. Mantap!"
                    : "Belum ada notifikasi."}
                </span>
              }
            />
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredData.map((item) => {
              const isUnread = item.status === "unread";
              const isExpanded = expandedId === item.id;
              const showFull =
                isExpanded && item.fullContent && item.fullContent !== item.pesan;

              return (
                <div
                  key={item.id}
                  onClick={() => handleClick(item.id, item.tipe)}
                  className={`rounded-2xl border p-3.5 cursor-pointer transition-all tap-active ${
                    isUnread
                      ? "border-brand-teal/30 bg-navy-900/80"
                      : "border-navy-800 bg-navy-900/40"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative flex-shrink-0">
                      <Avatar
                        size={42}
                        style={{ backgroundColor: getTipeColor(item.tipe) }}
                        icon={getTipeIcon(item.tipe)}
                        className="shadow-md"
                      />
                      {isUnread && (
                        <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-brand-teal ring-2 ring-navy-900" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h4
                          className={`text-[13px] truncate ${
                            isUnread
                              ? "text-white font-bold"
                              : "text-slate-300 font-medium"
                          }`}
                        >
                          {item.judul}
                        </h4>
                        {isUnread && (
                          <span className="px-1.5 py-0.5 rounded-full bg-brand-teal/20 text-brand-teal text-[9px] font-semibold flex-shrink-0">
                            BARU
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-400 leading-relaxed mt-1">
                        {showFull ? item.fullContent : item.pesan}
                      </p>

                      {showFull && (
                        <div className="mt-2 pt-2 border-t border-navy-800 text-[11px] text-slate-500">
                          Dari: {item.pengirim}
                        </div>
                      )}

                      <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-500">
                        <ClockCircleOutlined className="text-[11px]" />
                        <span>{dayjs(item.tanggal).fromNow()}</span>
                        <span className="text-slate-700">•</span>
                        <span className="truncate">{item.pengirim}</span>
                        {isUnread && (
                          <span className="ml-auto flex items-center gap-1 text-brand-teal font-medium">
                            <CheckOutlined className="text-[10px]" />
                            Baca
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Spin>
    </div>
  );
}
