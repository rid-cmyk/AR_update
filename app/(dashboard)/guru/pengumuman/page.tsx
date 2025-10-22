"use client";

import { useEffect, useState } from "react";
import {
  Row,
  Col,
  Card,
  Button,
  Modal,
  Space,
  message,
  Table,
  Typography,
  Tag,
  Badge,
  Empty,
} from "antd";
import {
  NotificationOutlined,
  EyeOutlined,
  CalendarOutlined,
  UserOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import LayoutApp from "@/components/layout/LayoutApp";
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

export default function GuruPengumumanPage() {
  const [pengumuman, setPengumuman] = useState<Pengumuman[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPengumuman, setSelectedPengumuman] = useState<Pengumuman | null>(null);

  // Fetch data
  const fetchPengumuman = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/guru/pengumuman");
      if (!res.ok) throw new Error("Failed to fetch pengumuman");
      const data = await res.json();
      const pengumumanData = data.data || data;
      setPengumuman(Array.isArray(pengumumanData) ? pengumumanData : []);
    } catch (error: any) {
      console.error("Error fetching pengumuman:", error);
      message.error("Error fetching pengumuman");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPengumuman();
  }, []);

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
      'admin': 'red'
    };
    return colors[target] || 'default';
  };

  const getTargetLabel = (target: string) => {
    const labels: { [key: string]: string } = {
      'semua': 'Semua',
      'guru': 'Guru',
      'santri': 'Santri',
      'ortu': 'Orang Tua',
      'admin': 'Admin'
    };
    return labels[target] || target;
  };

  const columns = [
    {
      title: "Status",
      key: "status",
      width: 80,
      render: (_: unknown, record: Pengumuman) => (
        <div style={{ textAlign: 'center' }}>
          {record.isRead ? (
            <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '16px' }} />
          ) : (
            <Badge status="processing" />
          )}
        </div>
      ),
    },
    {
      title: "Judul",
      dataIndex: "judul",
      key: "judul",
      render: (text: string, record: Pengumuman) => (
        <div>
          <div style={{ 
            fontWeight: record.isRead ? 'normal' : 'bold',
            color: record.isRead ? '#666' : '#000'
          }}>
            {text}
          </div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
            {record.isi.length > 80 ? `${record.isi.substring(0, 80)}...` : record.isi}
          </div>
        </div>
      ),
    },
    {
      title: "Tanggal",
      dataIndex: "tanggal",
      key: "tanggal",
      width: 120,
      render: (tanggal: string) => (
        <div>
          <div>{dayjs(tanggal).format("DD/MM/YYYY")}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {dayjs(tanggal).format("HH:mm")}
          </div>
        </div>
      ),
    },
    {
      title: "Target",
      dataIndex: "targetAudience",
      key: "targetAudience",
      width: 100,
      render: (target: string) => (
        <Tag color={getTargetColor(target)}>
          {getTargetLabel(target)}
        </Tag>
      ),
    },
    {
      title: "Dari",
      dataIndex: "creator",
      key: "creator",
      width: 120,
      render: (creator: any) => (
        <div>
          <div style={{ fontSize: '12px', fontWeight: 'bold' }}>
            {creator?.namaLengkap || "Unknown"}
          </div>
          <div style={{ fontSize: '10px', color: '#666' }}>
            {creator?.role?.name || ""}
          </div>
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 100,
      render: (_: unknown, record: Pengumuman) => (
        <Button
          type="text"
          icon={<EyeOutlined />}
          onClick={() => handleRead(record)}
          size="small"
        >
          Baca
        </Button>
      ),
    },
  ];

  const unreadCount = pengumuman.filter(p => !p.isRead).length;
  const todayCount = pengumuman.filter(p => dayjs(p.tanggal).isSame(dayjs(), 'day')).length;

  return (
    <LayoutApp>
      <div style={{ padding: "24px 0" }}>
        <div style={{ marginBottom: 24 }}>
          <h1>Pengumuman</h1>
          <p style={{ margin: 0, color: "#666" }}>
            Lihat pengumuman terbaru dari admin
          </p>
        </div>

        {/* Statistics Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <NotificationOutlined style={{ fontSize: '24px', color: '#1890ff', marginRight: 12 }} />
                <div>
                  <div style={{ fontSize: '14px', color: '#666' }}>Total Pengumuman</div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                    {pengumuman.length}
                  </div>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Badge status="processing" style={{ marginRight: 12 }} />
                <div>
                  <div style={{ fontSize: '14px', color: '#666' }}>Belum Dibaca</div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#fa8c16' }}>
                    {unreadCount}
                  </div>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <CalendarOutlined style={{ fontSize: '24px', color: '#52c41a', marginRight: 12 }} />
                <div>
                  <div style={{ fontSize: '14px', color: '#666' }}>Hari Ini</div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
                    {todayCount}
                  </div>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <CheckCircleOutlined style={{ fontSize: '24px', color: '#722ed1', marginRight: 12 }} />
                <div>
                  <div style={{ fontSize: '14px', color: '#666' }}>Sudah Dibaca</div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#722ed1' }}>
                    {pengumuman.length - unreadCount}
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Unread Announcements */}
        {unreadCount > 0 && (
          <Card 
            title={
              <Space>
                <Badge status="processing" />
                Pengumuman Belum Dibaca ({unreadCount})
              </Space>
            } 
            style={{ marginBottom: 24 }}
          >
            <Row gutter={[16, 16]}>
              {pengumuman.filter(p => !p.isRead).slice(0, 3).map((p) => (
                <Col xs={24} md={8} key={p.id}>
                  <Card 
                    size="small" 
                    style={{ backgroundColor: '#fff7e6', border: '1px solid #ffd591', cursor: 'pointer' }}
                    onClick={() => handleRead(p)}
                  >
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: 8 }}>
                        {p.judul}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666', marginBottom: 8 }}>
                        {p.isi.length > 60 ? `${p.isi.substring(0, 60)}...` : p.isi}
                      </div>
                      <div style={{ fontSize: '10px', color: '#666' }}>
                        <CalendarOutlined style={{ marginRight: 4 }} />
                        {dayjs(p.tanggal).format("DD/MM/YYYY HH:mm")}
                      </div>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        )}

        {/* Main Content */}
        <Card title="Semua Pengumuman">
          {pengumuman.length === 0 ? (
            <Empty 
              description="Belum ada pengumuman"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            <Table
              dataSource={pengumuman}
              columns={columns}
              rowKey="id"
              loading={loading}
              size="small"
              scroll={{ x: 800 }}
              pagination={{ pageSize: 10 }}
              rowClassName={(record) => record.isRead ? '' : 'unread-row'}
            />
          )}
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
            <Button key="close" onClick={() => setIsModalOpen(false)}>
              Tutup
            </Button>
          ]}
          width={700}
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
                backgroundColor: '#f9f9f9', 
                borderRadius: '6px',
                lineHeight: '1.6'
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

        <style jsx>{`
          .unread-row {
            background-color: #f6ffed !important;
          }
        `}</style>
      </div>
    </LayoutApp>
  );
}