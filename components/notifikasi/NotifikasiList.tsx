"use client";

import React from "react";
import { Card, Empty, Spin } from "antd";
import type { Notifikasi } from "@/hooks/useNotifikasi";
import { NotifikasiListItem } from "./NotifikasiListItem";
import type { NotifikasiTheme } from "./notifikasiUi";

export interface NotifikasiListProps {
  items: Notifikasi[];
  loading: boolean;
  theme: Pick<
    NotifikasiTheme,
    | "accent"
    | "accent2"
    | "dotShadow"
    | "unreadBgFrom"
    | "unreadBgTo"
    | "unreadBorder"
    | "listTitleFrom"
    | "listTitleTo"
    | "listCardBg"
    | "listCardBorder"
  >;
  onClick: (notifikasi: Notifikasi) => void;
  onMarkRead: (id: number | string) => void;
  onDelete: (id: number) => void;
}

/** Kartu daftar notifikasi dengan judul gradient — dipakai bersama semua role */
export function NotifikasiList({
  items,
  loading,
  theme,
  onClick,
  onMarkRead,
  onDelete,
}: NotifikasiListProps) {
  return (
    <Card
      title={
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              background: `${theme.accent}`,
              boxShadow: `0 0 15px ${theme.dotShadow}`,
            }}
          />
          <span
            style={{
              background: `${theme.listTitleFrom}`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              fontSize: "20px",
              fontWeight: "800",
            }}
          >
            📋 Daftar Notifikasi & Pengumuman
          </span>
        </div>
      }
      style={{
        borderRadius: "20px",
        boxShadow: "0 12px 40px rgba(0, 0, 0, 0.1)",
        border: `1px solid ${theme.listCardBorder}`,
        background: theme.listCardBg,
      }}
    >
      <Spin spinning={loading}>
        {items.length > 0 ? (
          <div style={{ padding: "20px" }}>
            {items.map((item) => (
              <NotifikasiListItem
                key={item.id}
                item={item}
                theme={theme}
                onClick={onClick}
                onMarkRead={onMarkRead}
                onDelete={onDelete}
              />
            ))}
          </div>
        ) : (
          <Empty description="Belum ada notifikasi" />
        )}
      </Spin>
    </Card>
  );
}

export default NotifikasiList;