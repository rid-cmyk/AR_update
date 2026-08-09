"use client";

import React from "react";
import { Button, Card, Col, Row, Space } from "antd";
import {
  BellOutlined,
  BookOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import type { NotifikasiTheme } from "./notifikasiUi";

export interface NotifikasiFilterProps {
  filterStatus: string;
  onStatusChange: (status: string) => void;
  filterTipe?: string;
  onTipeChange?: (status: string) => void;
  total: number;
  unreadCount: number;
  readCount: number;
  theme: Pick<NotifikasiTheme, "accent" | "filterBg" | "filterBorder">;
  size?: "middle" | "small";
  /** single = satu kolom status; double = kolom status + kategori */
  columns?: "single" | "double";
}

/** Blok filter status (dan opsional kategori) yang dipakai bersama semua role */
export function NotifikasiFilter({
  filterStatus,
  onStatusChange,
  filterTipe,
  onTipeChange,
  total,
  unreadCount,
  readCount,
  theme,
  size = "small",
  columns = "single",
}: NotifikasiFilterProps) {
  const statusButton = (value: string, label: string, count?: number) => (
    <Button
      type={filterStatus === value ? "primary" : "default"}
      size={size}
      onClick={() => onStatusChange(value)}
      style={{ borderRadius: size === "middle" ? "25px" : "20px", minWidth: "120px" }}
    >
      {label}
      {count !== undefined ? ` (${count})` : ""}
    </Button>
  );

  const statusSection = (
    <Space size={size === "middle" ? "middle" : "small"} wrap>
      <span style={{ fontWeight: "bold", color: theme.accent, fontSize: "16px" }}>
        📋 {columns === "double" ? "Status:" : "Filter Status:"}
      </span>
      {statusButton("all", "Semua", total)}
      {statusButton("unread", "Belum Dibaca", unreadCount)}
      {statusButton("read", "Sudah Dibaca", readCount)}
    </Space>
  );

  const tipeButton = (value: string, label: string, icon?: React.ReactNode) => (
    <Button
      type={filterTipe === value ? "primary" : "default"}
      size={size}
      onClick={() => onTipeChange?.(value)}
      style={{ borderRadius: "20px" }}
      icon={icon}
    >
      {label}
    </Button>
  );

  const tipeSection = (
    <Space size="small" wrap>
      <span style={{ fontWeight: "bold", color: theme.accent, fontSize: "14px" }}>
        🏷️ Kategori:
      </span>
      {tipeButton("all", "Semua")}
      {tipeButton("pengumuman", "Pengumuman", <BellOutlined />)}
      {tipeButton("hafalan", "Hafalan", <BookOutlined />)}
      {tipeButton("target", "Target", <CalendarOutlined />)}
      {tipeButton("jadwal", "Absensi", <ClockCircleOutlined />)}
    </Space>
  );

  return (
    <Card
      style={{
        marginBottom: 16,
        borderRadius: "16px",
        background: theme.filterBg,
        border: `1px solid ${theme.filterBorder}`,
      }}
    >
      <Row
        gutter={[16, 16]}
        align="middle"
        justify={columns === "single" ? "center" : undefined}
      >
        {columns === "double" ? (
          <>
            <Col xs={24} md={12} style={{ textAlign: "center" }}>
              {statusSection}
            </Col>
            <Col xs={24} md={12} style={{ textAlign: "center" }}>
              {tipeSection}
            </Col>
          </>
        ) : (
          <Col xs={24} style={{ textAlign: "center" }}>
            {statusSection}
          </Col>
        )}
      </Row>
    </Card>
  );
}

export default NotifikasiFilter;