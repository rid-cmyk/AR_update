"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";

export interface Notifikasi {
  id: number;
  judul: string;
  pesan: string;
  tipe: "hafalan" | "target" | "pengumuman" | "jadwal" | "prestasi" | "sistem";
  prioritas: "tinggi" | "sedang" | "rendah";
  status: "unread" | "read";
  tanggal: string;
  pengirim: string;
  aksi?: {
    label: string;
    url: string;
  };
  metadata?: {
    targetId?: number;
    hafalanId?: number;
    pengumumanId?: number;
  };
  fullContent?: string;
  targetAudience?: string;
  tanggalKadaluarsa?: string;
}

export interface NotifikasiConfig {
  /** URL tujuan per tipe notifikasi (role-specific), misal { hafalan: '/guru/hafalan' } */
  actionUrlMap: Record<string, string>;
}

interface ApiNotifikasi {
  id: number;
  type: string;
  pesan: string;
  isRead: boolean;
  tanggal: string;
  refId: number | null;
  metadata?: {
    judul?: string;
    isi?: string;
    fullContent?: string;
    creator?: string;
    targetAudience?: string;
    tanggalKadaluarsa?: string;
  };
}

const TIPE_MAP: Record<string, Notifikasi["tipe"]> = {
  pengumuman: "pengumuman",
  hafalan: "hafalan",
  target: "target",
  absensi: "jadwal",
  rapot: "prestasi",
  user: "sistem",
};

const ACTION_LABEL_MAP: Record<string, string> = {
  hafalan: "Lihat Hafalan",
  target: "Lihat Target",
  absensi: "Lihat Absensi",
};

function getNotifikasiTitle(type: string): string {
  switch (type) {
    case "pengumuman": return "Pengumuman Baru";
    case "hafalan": return "Update Hafalan";
    case "target": return "Target Hafalan";
    case "absensi": return "Update Absensi";
    default: return "Notifikasi";
  }
}

function getPriorityFromType(type: string): Notifikasi["prioritas"] {
  switch (type) {
    case "pengumuman": return "tinggi";
    case "target": return "tinggi";
    case "hafalan": return "sedang";
    default: return "rendah";
  }
}

function getNotifikasiAction(type: string, url: string | undefined): Notifikasi["aksi"] {
  if (type === "pengumuman") return { label: "Baca Detail", url: "#" };
  if (!ACTION_LABEL_MAP[type] || !url) return undefined;
  return { label: ACTION_LABEL_MAP[type], url };
}

export function transformNotifikasiList(
  apiItems: ApiNotifikasi[],
  actionUrlMap: Record<string, string>
): Notifikasi[] {
  return (apiItems || []).map((item) => {
    const meta = item.metadata;
    const type = item.type || "";
    return {
      id: item.id,
      judul: meta?.judul || getNotifikasiTitle(type),
      pesan: meta?.isi || item.pesan,
      tipe: TIPE_MAP[type] || "sistem",
      prioritas: getPriorityFromType(type),
      status: item.isRead ? "read" : "unread",
      tanggal: item.tanggal,
      pengirim: meta?.creator || "Sistem",
      fullContent: meta?.fullContent || item.pesan,
      targetAudience: meta?.targetAudience,
      tanggalKadaluarsa: meta?.tanggalKadaluarsa,
      aksi: getNotifikasiAction(type, actionUrlMap[type]),
      metadata: {
        targetId: type === "target" ? item.refId : undefined,
        hafalanId: type === "hafalan" ? item.refId : undefined,
        pengumumanId: type === "pengumuman" ? item.refId : undefined,
      },
    } as Notifikasi;
  });
}

/**
 * Hook terpusat untuk halaman daftar notifikasi (guru/ortu/yayasan).
 * Semua state, fetch, transform, filter, dan handler notifikasi berada di sini
 * agar konsisten dan tidak terduplikasi antar role.
 */
export function useNotifikasi(config: NotifikasiConfig) {
  const { actionUrlMap } = config;

  const [notifikasiList, setNotifikasiList] = useState<Notifikasi[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterTipe, setFilterTipe] = useState<string>("all");
  const [selectedNotifikasi, setSelectedNotifikasi] = useState<Notifikasi | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const fetchNotifikasi = useCallback(async () => {
    try {
      setLoading(true);

      const notifRes = await fetch("/api/notifikasi");
      const notifData = notifRes.ok ? await notifRes.json() : { data: [] };

      const transformedNotifications = transformNotifikasiList(notifData.data || [], actionUrlMap);

      setNotifikasiList(transformedNotifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setNotifikasiList([]);
    } finally {
      setLoading(false);
    }
  }, [actionUrlMap]);

  useEffect(() => {
    fetchNotifikasi();
  }, [fetchNotifikasi]);

  const handleMarkAsRead = useCallback(async (id: number | string) => {
    const markReadLocally = () =>
      setNotifikasiList((prev) =>
        prev.map((notif) => (notif.id === id ? { ...notif, status: "read" } : notif))
      );

    try {
      const res = await fetch(`/api/notifikasi/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_read" }),
      });

      if (res.ok) markReadLocally();
    } catch (error) {
      console.error("Error marking notification as read:", error);
      markReadLocally();
    }
  }, []);

  const handleMarkAllAsRead = useCallback(() => {
    setNotifikasiList((prev) => prev.map((notif) => ({ ...notif, status: "read" })));
  }, []);

  const handleDelete = useCallback((id: number) => {
    setNotifikasiList((prev) => prev.filter((notif) => notif.id !== id));
  }, []);

  const handleClearAll = useCallback(() => {
    setNotifikasiList([]);
  }, []);

  const openDetail = useCallback((notifikasi: Notifikasi) => {
    setSelectedNotifikasi(notifikasi);
    setIsDetailModalOpen(true);
  }, []);

  const closeDetail = useCallback(() => {
    setIsDetailModalOpen(false);
    setSelectedNotifikasi(null);
  }, []);

  const handleNotificationClick = useCallback(
    (notifikasi: Notifikasi) => {
      if (notifikasi.status === "unread") {
        handleMarkAsRead(notifikasi.id);
      }

      if (notifikasi.tipe === "pengumuman") {
        openDetail(notifikasi);
      } else if (notifikasi.aksi && notifikasi.aksi.url !== "#") {
        window.location.href = notifikasi.aksi.url;
      }
    },
    [handleMarkAsRead, openDetail]
  );

  const filteredData = useMemo(() => {
    let filtered = notifikasiList;
    if (filterStatus !== "all") {
      filtered = filtered.filter((item) => item.status === filterStatus);
    }
    if (filterTipe !== "all") {
      filtered = filtered.filter((item) => item.tipe === filterTipe);
    }
    return filtered;
  }, [filterStatus, filterTipe, notifikasiList]);

  const unreadCount = notifikasiList.filter((n) => n.status === "unread").length;
  const todayCount = notifikasiList.filter(
    (n) => dayjs(n.tanggal).format("YYYY-MM-DD") === dayjs().format("YYYY-MM-DD")
  ).length;
  const thisWeekCount = notifikasiList.filter((n) =>
    dayjs(n.tanggal).isAfter(dayjs().startOf("week"))
  ).length;

  return {
    notifikasiList,
    loading,
    filterStatus,
    setFilterStatus,
    filterTipe,
    setFilterTipe,
    selectedNotifikasi,
    isDetailModalOpen,
    fetchNotifikasi,
    handleNotificationClick,
    handleMarkAsRead,
    handleMarkAllAsRead,
    handleDelete,
    handleClearAll,
    openDetail,
    closeDetail,
    filteredData,
    unreadCount,
    todayCount,
    thisWeekCount,
  };
}
