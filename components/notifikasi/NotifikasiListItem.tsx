"use client";

import React from "react";
import { Avatar, Button, Dropdown, Modal } from "antd";
import { CheckOutlined, DeleteOutlined, MoreOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import type { Notifikasi } from "@/hooks/useNotifikasi";
import { getTipeColor, getTipeIcon, type NotifikasiTheme } from "./notifikasiUi";

dayjs.extend(relativeTime);

export interface NotifikasiListItemProps {
  item: Notifikasi;
  theme: Pick<
    NotifikasiTheme,
    "accent" | "unreadBgFrom" | "unreadBgTo" | "unreadBorder"
  >;
  onClick: (notifikasi: Notifikasi) => void;
  onMarkRead: (id: number | string) => void;
  onDelete: (id: number) => void;
}

/** Satu kartu notifikasi di daftar — dipakai bersama semua role */
export function NotifikasiListItem({
  item,
  theme,
  onClick,
  onMarkRead,
  onDelete,
}: NotifikasiListItemProps) {
  const isUnread = item.status === "unread";

  const handleDelete = () => {
    Modal.confirm({
      title: "Hapus Notifikasi",
      content: "Apakah Anda yakin ingin menghapus notifikasi ini?",
      okText: "Ya, Hapus",
      cancelText: "Batal",
      okType: "danger",
      onOk: () => onDelete(item.id),
    });
  };

  return (
    <div
      style={{
        padding: "20px",
        marginBottom: "16px",
        borderRadius: "16px",
        background: isUnread
          ? `${theme.unreadBgFrom}`
          : "#fafafa",
        border: isUnread ? `2px solid ${theme.unreadBorder}` : "1px solid #f0f0f0",
        cursor: "pointer",
        transition: "all 0.3s ease",
      }}
      onClick={() => onClick(item)}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
        <Avatar
          style={{
            backgroundColor: getTipeColor(item.tipe),
            color: "white",
          }}
          icon={getTipeIcon(item.tipe)}
          size={56}
        />
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: "18px",
              fontWeight: isUnread ? "bold" : "600",
              color: isUnread ? theme.accent : "#333",
              marginBottom: "8px",
            }}
          >
            {item.judul}
          </div>
          <div style={{ fontSize: "15px", color: "#666", marginBottom: "12px" }}>
            {item.pesan}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "13px", color: "#999" }}>
              {dayjs(item.tanggal).fromNow()}
            </span>
            <Dropdown
              menu={{
                items: [
                  ...(isUnread
                    ? [
                        {
                          key: "read",
                          icon: <CheckOutlined />,
                          label: "Tandai Dibaca",
                          onClick: () => onMarkRead(item.id),
                        },
                      ]
                    : []),
                  {
                    key: "delete",
                    icon: <DeleteOutlined />,
                    label: "Hapus",
                    onClick: handleDelete,
                    danger: true,
                  },
                ],
              }}
              trigger={["click"]}
            >
              <Button type="text" icon={<MoreOutlined />} size="small" />
            </Dropdown>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotifikasiListItem;