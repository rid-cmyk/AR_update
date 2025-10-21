"use client";

import { useEffect, useState } from "react";
import {
  Card,
  List,
  Button,
  Badge,
  Avatar,
  Typography,
  Empty,
  Tag,
} from "antd";
import {
  BellOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  BookOutlined,
  UserOutlined,
} from "@ant-design/icons";
import LayoutApp from "@/components/layout/LayoutApp";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import calendar from "dayjs/plugin/calendar";

dayjs.extend(relativeTime);
dayjs.extend(calendar);

const { Title, Text } = Typography;

interface Notifikasi {
  id: number;
  pesan: string;
  tanggal: string;
  type: "user" | "hafalan" | "target" | "absensi" | "pengumuman";
  isRead: boolean;
  refId?: number;
}

export default function NotifikasiPage() {
  const [notifikasiList, setNotifikasiList] = useState<Notifikasi[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch notifikasi
  const fetchNotifikasi = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/pengumuman?audience=guru");
      if (res.ok) {
        const data = await res.json();
        // Transform pengumuman to notifikasi format
        const transformedData = data.map((p: any) => ({
          id: p.id,
          pesan: p.judul,
          tanggal: p.tanggal,
          type: "pengumuman" as const,
          isRead: p.isRead,
          refId: p.id
        }));
        setNotifikasiList(transformedData);
      }
    } catch (error) {
      console.error("Error fetching notifikasi:", error);
    } finally {
      setLoading(false);
    }
  };

  // Mark as read
  const markAsRead = async (id: number) => {
    try {
      const res = await fetch(`/api/notifikasi/${id}/read`, { method: "PUT" });
      if (res.ok) {
        setNotifikasiList(prev =>
          prev.map(notif =>
            notif.id === id ? { ...notif, isRead: true } : notif
          )
        );
      }
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const res = await fetch("/api/pengumuman/mark-all-read", { method: "PUT" });
      if (res.ok) {
        setNotifikasiList(prev =>
          prev.map(notif => ({ ...notif, isRead: true }))
        );
      }
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  // Handle notification click
  const handleNotificationClick = (notifikasi: Notifikasi) => {
    if (!notifikasi.isRead) {
      markAsRead(notifikasi.id);
    }

    // Navigate based on type
    switch (notifikasi.type) {
      case "hafalan":
        // Navigate to hafalan page
        break;
      case "target":
        // Navigate to target page
        break;
      case "absensi":
        // Navigate to absensi page
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    fetchNotifikasi();
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "hafalan":
        return <BookOutlined style={{ color: "#52c41a" }} />;
      case "target":
        return <CheckCircleOutlined style={{ color: "#1890ff" }} />;
      case "absensi":
        return <ClockCircleOutlined style={{ color: "#faad14" }} />;
      case "user":
        return <UserOutlined style={{ color: "#722ed1" }} />;
      case "pengumuman":
        return <BellOutlined style={{ color: "#fa541c" }} />;
      default:
        return <BellOutlined />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "hafalan":
        return "green";
      case "target":
        return "blue";
      case "absensi":
        return "orange";
      case "user":
        return "purple";
      case "pengumuman":
        return "red";
      default:
        return "default";
    }
  };

  const unreadCount = notifikasiList.filter(n => !n.isRead).length;

  // Group notifications by date
  const groupedNotifications = notifikasiList.reduce((groups, notif) => {
    const date = dayjs(notif.tanggal).format("YYYY-MM-DD");
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(notif);
    return groups;
  }, {} as Record<string, Notifikasi[]>);

  return (
    <LayoutApp>
      <div style={{ padding: "24px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <Title level={2}>
            <BellOutlined style={{ marginRight: 12 }} />
            Notifikasi
            {unreadCount > 0 && (
              <Badge count={unreadCount} style={{ marginLeft: 12 }} />
            )}
          </Title>
          {unreadCount > 0 && (
            <Button type="primary" onClick={markAllAsRead}>
              Tandai Semua Dibaca
            </Button>
          )}
        </div>

        {notifikasiList.length === 0 ? (
          <Card>
            <Empty
              image={<BellOutlined style={{ fontSize: 64, color: "#d9d9d9" }} />}
              description="Belum ada notifikasi"
            />
          </Card>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {Object.entries(groupedNotifications)
              .sort(([a], [b]) => dayjs(b).valueOf() - dayjs(a).valueOf())
              .map(([date, notifications]) => (
                <Card key={date} title={dayjs(date).calendar(null, {
                  sameDay: '[Hari Ini]',
                  lastDay: '[Kemarin]',
                  lastWeek: '[7 Hari Terakhir]',
                  sameElse: 'DD/MM/YYYY'
                })}>
                  <List
                    dataSource={notifications}
                    renderItem={(item) => (
                      <List.Item
                        style={{
                          padding: "12px 0",
                          cursor: "pointer",
                          backgroundColor: item.isRead ? "transparent" : "#f6ffed",
                          borderRadius: 4,
                          marginBottom: 8,
                        }}
                        onClick={() => handleNotificationClick(item)}
                        actions={[
                          <Tag key="type" color={getTypeColor(item.type)}>
                            {item.type}
                          </Tag>
                        ]}
                      >
                        <List.Item.Meta
                          avatar={
                            <Avatar
                              icon={getNotificationIcon(item.type)}
                              style={{
                                backgroundColor: item.isRead ? "#f0f0f0" : "#b7eb8f"
                              }}
                            />
                          }
                          title={
                            <div>
                              <Text strong={!item.isRead}>{item.pesan}</Text>
                              {!item.isRead && <Badge dot style={{ marginLeft: 8 }} />}
                            </div>
                          }
                          description={
                            <Text type="secondary">
                              {dayjs(item.tanggal).fromNow()}
                            </Text>
                          }
                        />
                      </List.Item>
                    )}
                  />
                </Card>
              ))}
          </div>
        )}
      </div>
    </LayoutApp>
  );
}