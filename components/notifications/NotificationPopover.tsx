"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Badge, Button, Popover, List, Typography, Empty, Spin, Modal, Tag, Space, message, Tooltip } from "antd";
import { BellOutlined, DeleteOutlined, CheckCircleOutlined, ClockCircleOutlined, CloseOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

interface NotificationItem {
  id: string | number;
  pesan: string;
  tanggal: string;
  type: string;
  isRead: boolean;
  metadata?: {
    judul?: string;
    isi?: string;
    fullContent?: string;
    creator?: string;
    targetAudience?: string;
    tanggalKadaluarsa?: string;
  };
}

import useSWR from "swr";

const notifFetcher = (url: string) => fetch(url).then(r => r.json());

export default function NotificationPopover() {
  const { data, mutate, isValidating } = useSWR('/api/notifikasi?limit=20', notifFetcher, {
    refreshInterval: 45000,
    dedupingInterval: 15000,
    revalidateOnFocus: false
  });

  const notifications: NotificationItem[] = data?.data || [];
  const unreadCount: number = data?.unreadCount || 0;
  const loading = isValidating && !data;
  const [open, setOpen] = useState(false);
  const [selectedNotif, setSelectedNotif] = useState<NotificationItem | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);

  const markAsRead = async (item: NotificationItem) => {
    if (item.isRead) return;
    try {
      const res = await fetch(`/api/notifikasi/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_read" }),
      });
      if (res.ok) {
        mutate();
      }
    } catch {
      console.error("Failed to mark as read");
    }
  };

  const deleteNotification = async (item: NotificationItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      const res = await fetch(`/api/notifikasi/${item.id}`, { method: "DELETE" });
      if (res.ok) {
        mutate();
        message.success("Notifikasi dihapus");
      }
    } catch {
      message.error("Gagal menghapus notifikasi");
    }
  };

  const deleteAllNotifications = async () => {
    if (notifications.length === 0) return;
    Modal.confirm({
      title: "Hapus Semua Notifikasi",
      icon: <ExclamationCircleOutlined />,
      content: "Apakah Anda yakin ingin menghapus semua notifikasi?",
      okText: "Ya, Hapus Semua",
      cancelText: "Batal",
      okButtonProps: { danger: true },
      onOk: async () => {
        let deleted = 0;
        for (const n of notifications) {
          try {
            const res = await fetch(`/api/notifikasi/${n.id}`, { method: "DELETE" });
            if (res.ok) deleted++;
          } catch {
            // skip
          }
        }
        mutate();
        message.success(`${deleted} notifikasi berhasil dihapus`);
      },
    });
  };

  const handleItemClick = (item: NotificationItem) => {
    markAsRead(item);
    setSelectedNotif(item);
    setDetailVisible(true);
  };

  const getTargetColor = (target?: string) => {
    const colors: Record<string, string> = {
      semua: "blue", guru: "green", santri: "orange",
      ortu: "purple", admin: "red", yayasan: "cyan",
    };
    return colors[target || ""] || "default";
  };

  const getTargetLabel = (target?: string) => {
    const labels: Record<string, string> = {
      semua: "Semua", guru: "Guru", santri: "Santri",
      ortu: "Orang Tua", admin: "Admin", yayasan: "Yayasan",
    };
    return labels[target || ""] || target || "";
  };

  const content = (
    <div style={{ width: 380, maxHeight: 480, display: "flex", flexDirection: "column" }}>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "12px 16px", borderBottom: "1px solid #f0f0f0",
      }}>
        <Typography.Text strong style={{ fontSize: 15 }}>
          Notifikasi {unreadCount > 0 && `(${unreadCount})`}
        </Typography.Text>
        <Space size="small">
          {notifications.length > 0 && (
            <Button size="small" danger onClick={deleteAllNotifications} icon={<DeleteOutlined />}>
              Hapus Semua
            </Button>
          )}
          <Button size="small" type="text" icon={<CloseOutlined />} onClick={() => setOpen(false)} />
        </Space>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <Spin />
          </div>
        ) : notifications.length === 0 ? (
          <Empty
            description="Tidak ada notifikasi"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            style={{ padding: "40px 0" }}
          />
        ) : (
          <List
            dataSource={notifications}
            renderItem={(item) => (
              <List.Item
                onClick={() => handleItemClick(item)}
                style={{
                  cursor: "pointer",
                  padding: "10px 16px",
                  background: item.isRead ? "transparent" : "#e6f7ff",
                  borderLeft: item.isRead ? "3px solid transparent" : "3px solid #1890ff",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "#f5f5f5"}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = item.isRead ? "transparent" : "#e6f7ff";
                }}
                actions={[
                  <Tooltip key="delete" title="Hapus">
                    <Button
                      type="text"
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={(e) => deleteNotification(item, e)}
                    />
                  </Tooltip>,
                ]}
              >
                <div style={{ width: "100%", minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                    {item.type === "pengumuman" ? (
                      <Tag color={getTargetColor(item.metadata?.targetAudience)} style={{ flexShrink: 0, fontSize: 10, lineHeight: "16px", padding: "0 4px" }}>
                        {getTargetLabel(item.metadata?.targetAudience)}
                      </Tag>
                    ) : (
                      <CheckCircleOutlined style={{ color: "#52c41a", marginTop: 3, flexShrink: 0 }} />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 13,
                        fontWeight: item.isRead ? 400 : 600,
                        color: item.isRead ? "#666" : "#000",
                        lineHeight: 1.4,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}>
                        {item.metadata?.judul || item.pesan}
                      </div>
                      <div style={{
                        fontSize: 11,
                        color: "#999",
                        marginTop: 2,
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                      }}>
                        <ClockCircleOutlined />
                        {dayjs(item.tanggal).format("DD/MM/YYYY HH:mm")}
                      </div>
                    </div>
                  </div>
                </div>
              </List.Item>
            )}
          />
        )}
      </div>
    </div>
  );

  return (
    <>
      <Popover
        content={content}
        trigger="click"
        open={open}
        onOpenChange={setOpen}
        placement="bottomRight"
        arrow={false}
        styles={{
          body: {
            padding: 0,
            borderRadius: 12,
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            overflow: "hidden",
          },
        }}
      >
        <Badge count={unreadCount} size="small" offset={[-2, 2]}>
          <Button
            type="text"
            icon={<BellOutlined />}
            style={{
              fontSize: 16,
              width: 44,
              height: 44,
              color: "#fff",
              borderRadius: 12,
              background: "rgba(255, 255, 255, 0.12)",
              border: "1px solid rgba(255, 255, 255, 0.25)",
            }}
          />
        </Badge>
      </Popover>

      <Modal
        title={
          <Space>
            {selectedNotif?.type === "pengumuman" ? (
              <Tag color={getTargetColor(selectedNotif?.metadata?.targetAudience)}>
                {getTargetLabel(selectedNotif?.metadata?.targetAudience)}
              </Tag>
            ) : (
              <CheckCircleOutlined style={{ color: "#52c41a" }} />
            )}
            <span>Detail Notifikasi</span>
          </Space>
        }
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={
          <Space>
            {selectedNotif && (
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={() => {
                  if (selectedNotif) {
                    deleteNotification(selectedNotif);
                    setDetailVisible(false);
                  }
                }}
              >
                Hapus
              </Button>
            )}
            <Button type="primary" onClick={() => setDetailVisible(false)}>
              Tutup
            </Button>
          </Space>
        }
        width={600}
      >
        {selectedNotif && (
          <div>
            <Typography.Title level={4} style={{ marginTop: 0 }}>
              {selectedNotif.metadata?.judul || selectedNotif.pesan}
            </Typography.Title>

            <div style={{ marginBottom: 16 }}>
              <Space>
                <ClockCircleOutlined style={{ color: "#999" }} />
                <span style={{ color: "#666" }}>
                  {dayjs(selectedNotif.tanggal).format("DD MMMM YYYY, HH:mm")}
                </span>
                {selectedNotif.metadata?.creator && (
                  <>
                    <span style={{ color: "#ccc" }}>|</span>
                    <span style={{ color: "#666" }}>Oleh: {selectedNotif.metadata.creator}</span>
                  </>
                )}
              </Space>
            </div>

            <div style={{
              padding: 16,
              background: "#f6ffed",
              borderRadius: 8,
              border: "1px solid #b7eb8f",
              lineHeight: 1.8,
              whiteSpace: "pre-wrap",
            }}>
              {selectedNotif.metadata?.fullContent || selectedNotif.metadata?.isi || selectedNotif.pesan}
            </div>

            {selectedNotif.metadata?.tanggalKadaluarsa && (
              <div style={{ marginTop: 12, color: "#fa8c16", fontSize: 13 }}>
                <ClockCircleOutlined style={{ marginRight: 4 }} />
                Berlaku hingga: {dayjs(selectedNotif.metadata.tanggalKadaluarsa).format("DD MMMM YYYY")}
              </div>
            )}

            <div style={{ marginTop: 12 }}>
              <Tag color={selectedNotif.isRead ? "default" : "green"}>
                {selectedNotif.isRead ? "Sudah dibaca" : "Belum dibaca"}
              </Tag>
              <Tag color="blue">{selectedNotif.type === "pengumuman" ? "Pengumuman" : "Sistem"}</Tag>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
