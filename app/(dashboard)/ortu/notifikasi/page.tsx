"use client";

import { useEffect, useState } from "react";
import { Card, List, Spin, Tag, Avatar, Space, Button, message, Badge, Tabs } from "antd";
import {
  BellOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  BookOutlined,
  CalendarOutlined,
  TrophyOutlined,
  UserOutlined
} from "@ant-design/icons";
import LayoutApp from "@/components/layout/LayoutApp";
import dayjs from "dayjs";

interface NotifikasiData {
  id: number;
  jenis: string;
  judul: string;
  pesan: string;
  tanggal: string;
  status: 'unread' | 'read';
  prioritas: 'low' | 'medium' | 'high';
  kategori: string;
  anak?: {
    namaLengkap: string;
  };
}

export default function NotifikasiMingguan() {
  const [notifikasiData, setNotifikasiData] = useState<NotifikasiData[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  // Fetch notifikasi data
  const fetchNotifikasiData = async () => {
    try {
      setLoading(true);
      // In a real app, this would fetch from an API
      // For demo, we'll create mock data
      const mockData: NotifikasiData[] = [
        {
          id: 1,
          jenis: 'hafalan',
          judul: 'Target Hafalan Ahmad Berhasil Dicapai!',
          pesan: 'Selamat! Ahmad telah berhasil menyelesaikan target hafalan Al-Baqarah ayat 1-25 sesuai deadline yang ditentukan.',
          tanggal: dayjs().subtract(1, 'day').format('YYYY-MM-DD HH:mm:ss'),
          status: 'unread',
          prioritas: 'high',
          kategori: 'Pencapaian',
          anak: { namaLengkap: 'Ahmad' }
        },
        {
          id: 2,
          jenis: 'absensi',
          judul: 'Pengingat Absensi Halaqah',
          pesan: 'Halaqah Al-Fatihah akan dimulai besok pukul 08:00 WIB. Pastikan Ahmad hadir tepat waktu.',
          tanggal: dayjs().subtract(2, 'hours').format('YYYY-MM-DD HH:mm:ss'),
          status: 'unread',
          prioritas: 'medium',
          kategori: 'Jadwal',
          anak: { namaLengkap: 'Ahmad' }
        },
        {
          id: 3,
          jenis: 'prestasi',
          judul: 'Sertifikat Prestasi Diterima',
          pesan: 'Sertifikat "Santri Berprestasi" untuk Ahmad telah divalidasi dan dapat diambil di kantor pengelola.',
          tanggal: dayjs().subtract(3, 'days').format('YYYY-MM-DD HH:mm:ss'),
          status: 'read',
          prioritas: 'medium',
          kategori: 'Penghargaan',
          anak: { namaLengkap: 'Ahmad' }
        },
        {
          id: 4,
          jenis: 'pengumuman',
          judul: 'Perubahan Jadwal Ujian',
          pesan: 'Informasi penting: Ujian tengah semester dipindahkan ke tanggal 20 Februari 2024 karena hari libur nasional.',
          tanggal: dayjs().subtract(5, 'days').format('YYYY-MM-DD HH:mm:ss'),
          status: 'read',
          prioritas: 'high',
          kategori: 'Pengumuman',
        },
        {
          id: 5,
          jenis: 'hafalan',
          judul: 'Progress Hafalan Ahmad',
          pesan: 'Ahmad telah menghafal 15 ayat dari target 25 ayat bulan ini. Tinggal 10 ayat lagi untuk mencapai target!',
          tanggal: dayjs().subtract(1, 'week').format('YYYY-MM-DD HH:mm:ss'),
          status: 'read',
          prioritas: 'low',
          kategori: 'Progress',
          anak: { namaLengkap: 'Ahmad' }
        },
      ];

      setNotifikasiData(mockData);
    } catch (error) {
      console.error("Error fetching notifikasi data:", error);
      message.error("Gagal memuat notifikasi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifikasiData();
  }, []);

  // Mark as read function
  const markAsRead = async (notifikasiId: number) => {
    try {
      setNotifikasiData(prev =>
        prev.map(item =>
          item.id === notifikasiId ? { ...item, status: 'read' as const } : item
        )
      );
      message.success("Notifikasi telah ditandai sebagai dibaca");
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      setNotifikasiData(prev =>
        prev.map(item => ({ ...item, status: 'read' as const }))
      );
      message.success("Semua notifikasi telah ditandai sebagai dibaca");
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  // Filter notifications based on active tab
  const filteredNotifications = notifikasiData.filter(item => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return item.status === 'unread';
    if (activeTab === 'hafalan') return item.jenis === 'hafalan';
    if (activeTab === 'absensi') return item.jenis === 'absensi';
    if (activeTab === 'prestasi') return item.jenis === 'prestasi';
    return true;
  });

  // Get notification icon based on type
  const getNotificationIcon = (jenis: string) => {
    switch (jenis) {
      case 'hafalan': return <BookOutlined />;
      case 'absensi': return <CalendarOutlined />;
      case 'prestasi': return <TrophyOutlined />;
      case 'pengumuman': return <ExclamationCircleOutlined />;
      default: return <BellOutlined />;
    }
  };

  // Get priority color
  const getPriorityColor = (prioritas: string) => {
    switch (prioritas) {
      case 'high': return 'red';
      case 'medium': return 'orange';
      case 'low': return 'green';
      default: return 'blue';
    }
  };

  const tabItems = [
    {
      key: 'all',
      label: `Semua (${notifikasiData.length})`,
    },
    {
      key: 'unread',
      label: (
        <Badge count={notifikasiData.filter(n => n.status === 'unread').length} size="small">
          Belum Dibaca
        </Badge>
      ),
    },
    {
      key: 'hafalan',
      label: `Hafalan (${notifikasiData.filter(n => n.jenis === 'hafalan').length})`,
    },
    {
      key: 'absensi',
      label: `Absensi (${notifikasiData.filter(n => n.jenis === 'absensi').length})`,
    },
    {
      key: 'prestasi',
      label: `Prestasi (${notifikasiData.filter(n => n.jenis === 'prestasi').length})`,
    },
  ];

  return (
    <LayoutApp>
      <div style={{ padding: "24px", maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: 32, textAlign: 'center' }}>
          <h1 style={{ marginBottom: 8, color: '#1f2937', fontSize: '28px', fontWeight: 'bold' }}>
            🔔 Notifikasi Mingguan
          </h1>
          <p style={{ margin: 0, color: "#6b7280", fontSize: '16px' }}>
            Update terkini tentang perkembangan anak Anda
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <Spin size="large" />
            <p style={{ marginTop: 16, color: '#6b7280' }}>Memuat notifikasi...</p>
          </div>
        ) : (
          <Card bordered={false}>
            <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                items={tabItems}
                size="small"
              />
              <Button
                type="primary"
                onClick={markAllAsRead}
                disabled={notifikasiData.filter(n => n.status === 'unread').length === 0}
              >
                Tandai Semua Dibaca
              </Button>
            </div>

            <List
              dataSource={filteredNotifications}
              renderItem={(item) => (
                <List.Item
                  style={{
                    padding: '20px',
                    marginBottom: '12px',
                    background: item.status === 'unread' ? '#f6ffed' : '#fafafa',
                    borderRadius: '12px',
                    border: item.status === 'unread' ? '2px solid #b7eb8f' : '1px solid #f0f0f0',
                    position: 'relative'
                  }}
                  actions={[
                    item.status === 'unread' && (
                      <Button
                        key="mark-read"
                        type="text"
                        icon={<CheckCircleOutlined />}
                        onClick={() => markAsRead(item.id)}
                        size="small"
                        style={{ color: '#52c41a' }}
                      >
                        Tandai Dibaca
                      </Button>
                    )
                  ].filter(Boolean)}
                >
                  <List.Item.Meta
                    avatar={
                      <Badge dot={item.status === 'unread'} color="green">
                        <Avatar
                          icon={getNotificationIcon(item.jenis)}
                          style={{
                            backgroundColor: item.status === 'unread' ? '#52c41a' : '#1890ff',
                            border: '2px solid #e6f7ff'
                          }}
                          size={48}
                        />
                      </Badge>
                    }
                    title={
                      <div style={{ marginBottom: '8px' }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginBottom: '4px'
                        }}>
                          <span style={{
                            fontSize: '16px',
                            fontWeight: 'bold',
                            color: '#1f2937'
                          }}>
                            {item.judul}
                          </span>
                          {item.status === 'unread' && (
                            <Tag color="green">Baru</Tag>
                          )}
                        </div>
                        <Space size="small">
                          <Tag color={getPriorityColor(item.prioritas)}>
                            {item.prioritas.toUpperCase()}
                          </Tag>
                          <Tag color="blue">{item.kategori}</Tag>
                          {item.anak && (
                            <Tag color="purple" icon={<UserOutlined />}>
                              {item.anak.namaLengkap}
                            </Tag>
                          )}
                        </Space>
                      </div>
                    }
                    description={
                      <div>
                        <div style={{
                          color: '#595959',
                          lineHeight: '1.6',
                          marginBottom: '8px',
                          fontSize: '14px'
                        }}>
                          {item.pesan}
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: '#8c8c8c',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <ClockCircleOutlined />
                          {dayjs(item.tanggal).format("DD MMMM YYYY, HH:mm")}
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />

            {filteredNotifications.length === 0 && (
              <div style={{
                textAlign: 'center',
                padding: '60px 20px',
                color: '#8c8c8c'
              }}>
                <BellOutlined style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }} />
                <p style={{ fontSize: '16px', margin: 0 }}>
                  {activeTab === 'unread' ? 'Tidak ada notifikasi belum dibaca' : 'Belum ada notifikasi'}
                </p>
              </div>
            )}
          </Card>
        )}
      </div>
    </LayoutApp>
  );
}