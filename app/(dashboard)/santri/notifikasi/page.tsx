"use client";

import { useEffect, useState } from "react";
import { Card, List, Badge, Typography, Tag, Empty, Spin, Button, Divider } from "antd";
import { BellOutlined, CheckCircleOutlined, ClockCircleOutlined, BookOutlined, UserOutlined, TrophyOutlined } from "@ant-design/icons";
import AdminHeaderCard from "@/components/admin/layout/AdminHeaderCard";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/id";

dayjs.extend(relativeTime);
dayjs.locale("id");

const { Title, Text } = Typography;

interface Notification {
  id: number;
  pesan: string;
  tanggal: string;
  type: 'user' | 'hafalan' | 'rapot' | 'absensi' | 'pengumuman';
  refId?: number;
}

interface Pengumuman {
  id: number;
  judul: string;
  isi: string;
  tanggal: string;
  targetAudience: string;
  creator: {
    namaLengkap: string;
  };
  dibacaOleh: Array<{
    userId: number;
    dibacaPada: string;
  }>;
}

export default function NotifikasiSantri() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [pengumuman, setPengumuman] = useState<Pengumuman[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [notifRes, pengumumanRes] = await Promise.all([
          fetch('/api/santri/notifications'),
          fetch('/api/santri/pengumuman')
        ]);

        if (notifRes.ok) {
          const notifData = await notifRes.json();
          setNotifications(notifData.data || []);
        }

        if (pengumumanRes.ok) {
          const pengumumanData = await pengumumanRes.json();
          setPengumuman(pengumumanData.data || []);
        }

      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'hafalan':
        return <BookOutlined style={{ color: '#1890ff' }} />;
      case 'rapot':
        return <TrophyOutlined style={{ color: '#52c41a' }} />;
      case 'absensi':
        return <CheckCircleOutlined style={{ color: '#fa8c16' }} />;
      case 'pengumuman':
        return <BellOutlined style={{ color: '#722ed1' }} />;
      default:
        return <UserOutlined style={{ color: '#666' }} />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'hafalan':
        return '#1890ff';
      case 'rapot':
        return '#52c41a';
      case 'absensi':
        return '#fa8c16';
      case 'pengumuman':
        return '#722ed1';
      default:
        return '#666';
    }
  };

  const markPengumumanAsRead = async (pengumumanId: number) => {
    try {
      await fetch(`/api/santri/pengumuman/${pengumumanId}/read`, {
        method: 'POST'
      });
      
      // Update local state
      setPengumuman(prev => 
        prev.map(p => 
          p.id === pengumumanId 
            ? { ...p, dibacaOleh: [...p.dibacaOleh, { userId: 0, dibacaPada: new Date().toISOString() }] }
            : p
        )
      );
    } catch (error) {
      console.error('Error marking pengumuman as read:', error);
    }
  };

  if (loading) {
    return (
      <>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <Spin size="large" />
          <Text type="secondary">Memuat notifikasi...</Text>
        </div>
      </>
    );
  }

  return (
    <>
      <div style={{ padding: "24px 0", maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <AdminHeaderCard
          title="Notifikasi & Pengumuman"
          subtitle="Lihat semua notifikasi dan pengumuman terbaru untuk Anda"
          tags={[
            { label: "Notifikasi", icon: <BellOutlined /> },
            { label: "Online", icon: <ClockCircleOutlined /> }
          ]}
        />

        {/* Pengumuman Section */}
        <Card
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <BellOutlined style={{ color: '#722ed1' }} />
              <span>📢 Pengumuman</span>
              <Badge count={pengumuman.filter(p => p.dibacaOleh.length === 0).length} />
            </div>
          }
          style={{ marginBottom: '24px' }}
        >
          {pengumuman.length > 0 ? (
            <List
              dataSource={pengumuman}
              renderItem={(item) => {
                const isRead = item.dibacaOleh.length > 0;
                return (
                  <List.Item
                    style={{
                      padding: '16px',
                      background: isRead ? '#f9f9f9' : '#fff',
                      borderLeft: isRead ? '4px solid #d9d9d9' : '4px solid #722ed1',
                      marginBottom: '8px',
                      borderRadius: '8px'
                    }}
                    actions={[
                      !isRead && (
                        <Button
                          type="link"
                          size="small"
                          onClick={() => markPengumumanAsRead(item.id)}
                        >
                          Tandai Dibaca
                        </Button>
                      )
                    ].filter(Boolean)}
                  >
                    <List.Item.Meta
                      avatar={
                        <div style={{
                          width: 48,
                          height: 48,
                          borderRadius: '12px',
                          background: isRead ? '#d9d9d9' : '#722ed1',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white'
                        }}>
                          <BellOutlined />
                        </div>
                      }
                      title={
                        <div>
                          <Text strong style={{ fontSize: '16px' }}>
                            {item.judul}
                          </Text>
                          {!isRead && (
                            <Badge
                              status="processing"
                              text="Baru"
                              style={{ marginLeft: '8px' }}
                            />
                          )}
                        </div>
                      }
                      description={
                        <div>
                          <Text style={{ color: '#666', marginBottom: '8px', display: 'block' }}>
                            {item.isi}
                          </Text>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text style={{ fontSize: '12px', color: '#999' }}>
                              <ClockCircleOutlined style={{ marginRight: '4px' }} />
                              {dayjs(item.tanggal).fromNow()}
                            </Text>
                            <Text style={{ fontSize: '12px', color: '#999' }}>
                              Dari: {item.creator.namaLengkap}
                            </Text>
                          </div>
                        </div>
                      }
                    />
                  </List.Item>
                );
              }}
            />
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Belum ada pengumuman"
            />
          )}
        </Card>

        <Divider />

        {/* Notifications Section */}
        <Card
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <BellOutlined style={{ color: '#1890ff' }} />
              <span>🔔 Notifikasi Sistem</span>
              <Badge count={notifications.length} />
            </div>
          }
        >
          {notifications.length > 0 ? (
            <List
              dataSource={notifications}
              renderItem={(item) => (
                <List.Item
                  style={{
                    padding: '16px',
                    borderLeft: `4px solid ${getNotificationColor(item.type)}`,
                    marginBottom: '8px',
                    borderRadius: '8px',
                    background: '#fafafa'
                  }}
                >
                  <List.Item.Meta
                    avatar={
                      <div style={{
                        width: 48,
                        height: 48,
                        borderRadius: '12px',
                        background: getNotificationColor(item.type),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white'
                      }}>
                        {getNotificationIcon(item.type)}
                      </div>
                    }
                    title={
                      <div>
                        <Text strong style={{ fontSize: '15px' }}>
                          {item.pesan}
                        </Text>
                        <Tag
                          color={getNotificationColor(item.type)}
                          style={{ marginLeft: '8px', fontSize: '11px' }}
                        >
                          {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                        </Tag>
                      </div>
                    }
                    description={
                      <Text style={{ fontSize: '12px', color: '#999' }}>
                        <ClockCircleOutlined style={{ marginRight: '4px' }} />
                        {dayjs(item.tanggal).fromNow()}
                      </Text>
                    }
                  />
                </List.Item>
              )}
            />
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Belum ada notifikasi sistem"
            />
          )}
        </Card>
      </div>
    </>
  );
}