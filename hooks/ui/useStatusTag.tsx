"use client";

import React from "react";
import { Tag } from "antd";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import type { ReactNode } from "react";

export interface StatusTagConfigItem {
  color: string;
  icon?: ReactNode;
  text: string;
}

export type StatusTagConfig = Record<string, StatusTagConfigItem>;

export const HAFALAN_STATUS_TAGS: StatusTagConfig = {
  selesai: { color: "green", icon: <CheckCircleOutlined />, text: "Selesai" },
  proses: { color: "blue", icon: <ClockCircleOutlined />, text: "Proses" },
  pending: { color: "orange", icon: <ClockCircleOutlined />, text: "Pending" },
};

export const ABSENSI_STATUS_TAGS: StatusTagConfig = {
  hadir: { color: "green", icon: <CheckCircleOutlined />, text: "Hadir" },
  sakit: { color: "orange", icon: <CloseCircleOutlined />, text: "Sakit" },
  izin: { color: "blue", icon: <ClockCircleOutlined />, text: "Izin" },
  alpha: { color: "red", icon: <CloseCircleOutlined />, text: "Alpha" },
};

export const TARGET_STATUS_TAGS: StatusTagConfig = {
  selesai: { color: "green", icon: <CheckCircleOutlined />, text: "Selesai" },
  aktif: { color: "blue", icon: <ClockCircleOutlined />, text: "Aktif" },
  tertunda: { color: "orange", icon: <ClockCircleOutlined />, text: "Tertunda" },
};

/**
 * Hook yang mengembalikan fungsi render Tag status (warna + ikon + teks).
 * Status tak dikenal memakai `fallbackKey` (bila ada) agar perilaku halaman
 * lama terjaga (mis. absensi fallback ke "alpha", hafalan fallback ke "pending").
 */
export function useStatusTag(config: StatusTagConfig, fallbackKey?: string) {
  const renderTag = (status: string) => {
    const key = config[status]
      ? status
      : fallbackKey && config[fallbackKey]
        ? fallbackKey
        : status;
    const cfg = config[key] ?? { color: "default", text: status };
    return (
      <Tag color={cfg.color} icon={cfg.icon}>
        {cfg.text}
      </Tag>
    );
  };
  renderTag.displayName = "StatusTag";
  return renderTag;
}
