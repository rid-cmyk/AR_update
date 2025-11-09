"use client";

import { useEffect, useState } from "react";
import {
  Card,
  List,
  Avatar,
  Badge,
  Empty,
  Button,
  Space,
  Tag,
  Modal,
  Typography,
  Spin,
} from "antd";
import {
  NotificationOutlined,
  EyeOutlined,
  CalendarOutlined,
  UserOutlined,
  BellOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

interface Pengumuman {
  id: number;
  judul: string;
  isi: string;
  tanggal: string;
  tanggalKadaluarsa?: string;
  targetAudience: string;
  creator: {
    id: number;
    namaLengkap: string;
    role: {
      name: string;
    };
  };
  isRead: boolean;
  createdAt: string;
}

interface PengumumanWidgetProps {
  userRole: 'admin' | 'guru' | 'santri' | 'ortu' | 'yayasan';
  maxItems?: number;
  showUnreadOnly?: boolean;
  title?: string;
  height?: number;
}

export default function PengumumanWidget({ 
  userRole, 
  maxItems = 5, 
  showUnreadOnly = false,
  title = "Pengumuman Terbaru",
  height = 400
}: PengumumanWidgetProps) {
  const [pengumuman, setPengumuman] = useState<Pengumuman[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPengumuman, setSelectedPengumuman] = useState<Pengumuman | null>(null);

  // Get API endpoint based on user role
  const getApiEndpoint = () => {
    switch (userRole) {
      case 'admin':
        return '/api/pengumuman';
      case 'guru':
        return '/api/guru/pengumuman';
      case 'santri':
        return '/api/santri/pengumuman';
      case 'ortu':
        return '/api/ortu/pengumuman';
      case 'yayasan':
        return '/api/yayasan/pengumuman';
      default:
        return '/api/pengumuman';
    }
  };

  // Fetch data
  const fetchPengumuman = async () => {
    try {
      setLoading(true);
      const endpoint = getApiEndpoint();
      const url = showUnreadOnly ? `${endpoint}?unreadOnly=true` : endpoint;
      
      const res = await fetch(url);
      const data = await res.json();
      
      // Handle both success and error responses gracefully
      if (data.success !== false) {
        const pengumumanData = data.data || data;
        const items = Array.isArray(pengumumanData) ? pengumumanData : [];
        
        // Limit items
        setPengumuman(items.slice(0, maxItems));
      } else {
        // API returned error but with 200 status
        console.warn("⚠️ Pengumuman returned error:", data.error);
        setPengumuman([]);
      }
    } catch (error: any) {
      console.error("❌ Error fetching pengumuman:", error);
      setPengumuman([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPengumuman();
  }, [userRole, maxItems, showUnreadOnly]);

  const handleRead = async (pengumuman: Pengumuman) => {
    setSelectedPengumuman(pengumuman);
    setIsModalOpen(true);

    // Mark as read if not already read
    if (!pengumuman.isRead) {
      try {
        const res = await fetch(`/api/pengumuman/${pengumuman.id}/read`, {
          method: "POST",
        });
        
        if (res.ok) {
          // Update local state
          setPengumuman(prev => 
            prev.map(p => 
              p.id === pengumuman.id ? { ...p, isRead: true } : p
            )
          );
        }
      } catch (error) {
        console.error("Error marking as read:", error);
      }
    }
  };

  const getTargetColor = (target: string) => {
    const colors: { [key: string]: string } = {
      'semua': 'blue',
      'guru': 'green',
      'santri': 'orange',
      'ortu': 'purple',
      'admin': 'red',
      'yayasan': 'cyan'
    };
    return colors[target] || 'default';
  };

  const getTargetLabel = (target: string) => {
    const labels: { [key: string]: string } = {
      'semua': 'Semua',
      'guru': 'Guru',
      'santri': 'Santri',
      'ortu': 'Orang Tua',
      'admin': 'Admin',
      'yayasan': 'Yayasan'
    };
    return labels[target] || target;
  };

  const unreadCount = pengumuman.filter(p => !p.isRead).length;

  return (
    <>
      <Card 
        title={
          <Space>
            <Badge count={unreadCount} offset={[10, 0]}>
              <NotificationOutlined />
            </Badge>
            {title}
          </Space>
        }
        extra={
          userRole !== 'admin' && (
            <Button 
              type="link" 
              size="small"
              href={`/${userRole}/pengumuman`}
            >
              Lihat Semua
            </Button>
          )
        }
        style={{ height }}
        styles={{ 
          body: {
            padding: '12px',
            height: height - 60,
            overflowY: 'auto'
          }
        }}
      >
        <Spin spinning={loading}>
          {pengumuman.length === 0 ? (
            <Empty 
              description={
                showUnreadOnly 
                  ? "Tidak ada pengumuman belum dibaca"
                  : "Belum ada pengumuman"
              }
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            <List
              dataSource={pengumuman}
              renderItem={(item) => (
                <List.Item
                  style={{ 
                    cursor: 'pointer',
                    backgroundColor: item.isRead ? '#fafafa' : '#f6ffed',
                    marginBottom: '8px',
                    padding: '12px',
                    borderRadius: '8px',
                    border: item.isRead ? '1px solid #f0f0f0' : '1px solid #b7eb8f',
                    transition: 'all 0.3s ease'
                  }}
                  onClick={() => handleRead(item)}
                  actions={[
                    <Button 
                      key="read" 
                      type="text" 
                      size="small"
                      icon={<EyeOutlined />}
                    />
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar 
                        size="small"
                        style={{ 
                          backgroundColor: item.isRead ? '#d9d9d9' : '#52c41a' 
                        }}
                        icon={<NotificationOutlined />}
                      />
                    }
                    title={
                      <div style={{ 
                        fontWeight: item.isRead ? 'normal' : 'bold',
                        color: item.isRead ? '#666' : '#000',
                        fontSize: '14px'
                      }}>
                        {item.judul}
                      </div>
                    }
                    description={
                      <div>
                        <div style={{ 
                          marginBottom: 4,
                          fontSize: '12px',
                          color: '#666'
                        }}>
                          {item.isi.length > 60 ? `${item.isi.substring(0, 60)}...` : item.isi}
                        </div>
                        <Space size="small">
                          <Tag color={getTargetColor(item.targetAudience)} style={{ fontSize: '12px' }}>
                            {getTargetLabel(item.targetAudience)}
                          </Tag>
                          <span style={{ fontSize: '11px', color: '#999' }}>
                            {dayjs(item.tanggal).format("DD/MM/YYYY")}
                          </span>
                        </Space>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          )}
        </Spin>
      </Card>

      {/* Modal */}
      <Modal
        title={
          <Space>
            <NotificationOutlined />
            Detail Pengumuman
          </Space>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setIsModalOpen(false)}>
            Tutup
          </Button>
        ]}
        width={600}
      >
        {selectedPengumuman && (
          <div>
            <Typography.Title level={4} style={{ marginBottom: 16 }}>
              {selectedPengumuman.judul}
            </Typography.Title>
            
            <div style={{ marginBottom: 16 }}>
              <Space>
                <Tag color={getTargetColor(selectedPengumuman.targetAudience)}>
                  {getTargetLabel(selectedPengumuman.targetAudience)}
                </Tag>
                <span style={{ color: '#666' }}>
                  <CalendarOutlined style={{ marginRight: 4 }} />
                  {dayjs(selectedPengumuman.tanggal).format("DD MMMM YYYY, HH:mm")}
                </span>
                <span style={{ color: '#666' }}>
                  <UserOutlined style={{ marginRight: 4 }} />
                  {selectedPengumuman.creator.namaLengkap}
                </span>
              </Space>
            </div>

            <div style={{ 
              padding: '16px', 
              backgroundColor: '#f6ffed', 
              borderRadius: '6px',
              lineHeight: '1.6',
              border: '1px solid #b7eb8f'
            }}>
              {selectedPengumuman.isi.split('\n').map((line, index) => (
                <div key={index}>{line}</div>
              ))}
            </div>

            {selectedPengumuman.tanggalKadaluarsa && (
              <div style={{ marginTop: 16, color: '#fa8c16' }}>
                <CalendarOutlined style={{ marginRight: 4 }} />
                Berlaku hingga: {dayjs(selectedPengumuman.tanggalKadaluarsa).format("DD MMMM YYYY")}
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}