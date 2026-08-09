import React from "react";
import {
  BellOutlined,
  BookOutlined,
  CalendarOutlined,
  CheckOutlined,
  ClockCircleOutlined,
  InfoCircleOutlined,
  SettingOutlined,
  TrophyOutlined,
  ClearOutlined,
} from "@ant-design/icons";

/** Konfigurasi tema warna per role untuk halaman notifikasi */
export interface NotifikasiTheme {
  accent: string;
  accent2: string;
  dotShadow: string;
  filterBg: string;
  filterBorder: string;
  unreadBgFrom: string;
  unreadBgTo: string;
  unreadBorder: string;
  listTitleFrom: string;
  listTitleTo: string;
  listCardBg: string;
  listCardBorder: string;
  statCards: {
    unread: { from: string; to: string; shadow: string };
    today: { from: string; to: string; shadow: string };
    week: { from: string; to: string; shadow: string };
  };
}

export function getTipeIcon(tipe: string): React.ReactNode {
  switch (tipe) {
    case "hafalan": return <BookOutlined />;
    case "target": return <CalendarOutlined />;
    case "pengumuman": return <BellOutlined />;
    case "jadwal": return <ClockCircleOutlined />;
    case "prestasi": return <TrophyOutlined />;
    case "sistem": return <SettingOutlined />;
    default: return <InfoCircleOutlined />;
  }
}

export function getTipeColor(tipe: string): string {
  switch (tipe) {
    case "hafalan": return "#219ebc";
    case "target": return "#219ebc";
    case "pengumuman": return "#ffb703";
    case "jadwal": return "#8ecae6";
    case "prestasi": return "#ffb703";
    case "sistem": return "#13c2c2";
    default: return "#666";
  }
}

export { CheckOutlined, ClearOutlined };