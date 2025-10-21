"use client";

import { useEffect, useState } from "react";
import { 
  Card, 
  List, 
  Typography, 
  Row, 
  Col, 
  Badge,
  Button,
  Space,
  Tag,
  Avatar,
  Dropdown,
  Menu,
  Modal,
  Statistic,
  Empty,
  Divider
} from "antd";
import {
  BellOutlined,
  CheckOutlined,
  DeleteOutlined,
  MoreOutlined,
  BookOutlined,
  CalendarOutlined,
  TrophyOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
  SettingOutlined,
  ClearOutlined
} from "@ant-design/icons";
import LayoutApp from "@/components/layout/LayoutApp";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import 'dayjs/locale/id';

dayjs.extend(relativeTime);
dayjs.locale('id');

const { Title, Text } = Typography;

interface Notifikasi {
  id: number;
  judul: string;
  pesan: string;
  tipe: 'hafalan' | 'target' | 'pengumuman' | 'jadwal' | 'prestasi' | 'sistem';
  prioritas: 'tinggi' | 'sedang' | 'rendah';
  status: 'unread' | 'read';
  tanggal: string;
  pengirim: string;
  aksi?: {
    label: string;
    url: string;
  };
  metadata?: {
    targetId?: number;
    hafalanId?: number;
    pengumumanId?: number;
  };
}

export default function NotifikasiPage() {
  const [notifikasiList, setNotifikasiList] = useState<Notifikasi[]>([]);
  const [filteredData, setFilteredData] = useState<Notifikasi[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterTipe, setFilterTipe] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Mock data
  const mockNotifikasi: Notifikasi[] = [
    {
      id: 1,
      judul: 'Setoran Hafalan Disetujui',
      pesan: 'Setoran hafalan Al-Baqarah ayat 1-5 telah disetujui dengan nilai 85',
      tipe: 'hafalan',
      prioritas: 'sedang',
      status: 'unread',
      tanggal: '2024-01-07 10:30:00',
      pengirim: 'Ustadz Ahmad',
      aksi: {
        label: 'Lihat Detail',
        url: '/santri/rekap-hafalan'
      },
      metadata: {
        hafalanId: 1
      }
    },
    {
      id: 2,
      judul: 'Target Hafalan Mendekati Deadline',
      pesan: 'Target hafalan Juz 1 akan berakhir dalam 3 hari. Saat ini progress Anda 75%',
      tipe: 'target',
      prioritas: 'tinggi',
      status: 'unread',
      tanggal: '2024-01-07 08:00:00',
      pengirim: 'Sistem',
      aksi: {
        label: 'Lihat Target',
        url: '/santri/target-hafalan'
      },
      metadata: {
        targetId: 1
      }
    },
    {
      id: 3,
      judul: 'Pengumuman: Libur Tahun Baru',
      pesan: 'Kegiatan tahfidz diliburkan pada tanggal 1 Januari 2024 dalam rangka tahun baru Masehi',
      tipe: 'pengumuman',
      prioritas: 'sedang',
      status: 'read',
      tanggal: '2024-01-06 15:00:00',
      pengirim: 'Admin',
      aksi: {
        label: 'Baca Selengkapnya',
        url: '/santri/pengumuman'
      },
      metadata: {
        pengumumanId: 1
      }
    },
    {
      id: 4,
      judul: 'Jadwal Halaqah Berubah',
      pesan: 'Jadwal halaqah hari Rabu dipindah dari jam 08:00 menjadi 09:00',
      tipe: 'jadwal',
      prioritas: 'tinggi',
      status: 'read',
      tanggal: '2024-01-05 20:00:00',
      pengirim: 'Ustadz Ahmad',
      aksi: {
        label: 'Lihat Jadwal',
        url: '/santri/absensi'
      }
    },
    {
      id: 5,
      judul: 'Selamat! Anda Meraih Badge Baru',
      pesan: 'Anda telah meraih badge "Santri Rajin" karena kehadiran 100% bulan ini',
      tipe: 'prestasi',
      prioritas: 'sedang',
      status: 'read',
      tanggal: '2024-01-04 12:00:00',
      pengirim: 'Sistem',
      aksi: {
        label: 'Lihat Badge',
        url: '/santri/prestasi-raport'
      }
    },
    {
      id: 6,
      judul: 'Pembaruan Sistem',
      pesan: 'Sistem telah diperbarui dengan fitur-fitur baru untuk meningkatkan pengalaman belajar',
      tipe: 'sistem',
      prioritas: 'rendah',
      status: 'read',
      tanggal: '2024-01-03 09:00:00',
      pengirim: 'Admin Sistem'
    }
  ];

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setNotifikasiList(mockNotifikasi);
      setFilteredData(mockNotifikasi);
      setLoading(false);
    }, 1000);
  }, []);

  // Filter notifications
  useEffect(() => {
    let filtered = notifikasiList;

    if (filterTipe !== 'all') {
      filtered = filtered.filter(item => item.tipe === filterTipe);
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(item => item.status === filterStatus);
    }

    setFilteredData(filtered);
  }, [filterTipe, filterStatus, notifikasiList]);

  const getTipeIcon = (tipe: string) => {
    switch (tipe) {
      case 'hafalan': return <BookOutlined />;
      case 'target': return <CalendarOutlined />;
      case 'pengumuman': return <BellOutlined />;
      case 'jadwal': return <ClockCircleOutlined />;
      case 'prestasi': return <TrophyOutlined />;
      case 'sistem': return <SettingOutlined />;
      default: return <InfoCircleOutlined />;
    }
  };

  const getTipeColor = (tipe: string) => {
    switch (tipe) {
      case 'hafalan': return '#1890ff';
      case 'target': return '#52c41a';
      case 'pengumuman': return '#fa8c16';
      case 'jadwal': return '#722ed1';
      case 'prestasi': return '#faad14';
      case 'sistem': return '#13c2c2';
      default: return '#666';
    }
  };

  const getPrioritasColor = (prioritas: string) => {
    switch (prioritas) {
      case 'tinggi': return 'red';
      case 'sedang': return 'orange';
      case 'rendah': return 'green';
      default: return 'default';
    }
  };

  const handleMarkAsRead = (id: number) => {
    setNotifikasiList(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, status: 'read' } : notif
      )
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifikasiList(prev => 
      prev.map(notif => ({ ...notif, status: 'read' }))
    );
  };

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: 'Hapus Notifikasi',
      content: 'Apakah Anda yakin ingin menghapus notifikasi ini?',
      okText: 'Ya, Hapus',
      cancelText: 'Batal',
      okType: 'danger',
      onOk: () => {
        setNotifikasiList(prev => prev.filter(notif => notif.id !== id));
      }
    });
  };

  const handleClearAll = () => {
    Modal.confirm({
      title: 'Hapus Semua Notifikasi',
      content: 'Apakah Anda yakin ingin menghapus semua notifikasi?',
      okText: 'Ya, Hapus Semua',
      cancelText: 'Batal',
      okType: 'danger',
      onOk: () => {
        setNotifikasiList([]);
      }
    });
  };

  const getActionMenu = (notifikasi: Notifikasi) => (
    <Menu>
      {notifikasi.status === 'unread' && (
        <Menu.Item 
          key="read" 
          icon={<CheckOutlined />}
          onClick={() => handleMarkAsRead(notifikasi.id)}
        >
          Tandai Dibaca
        </Menu.Item>
      )}
      <Menu.Item 
        key="delete" 
        icon={<DeleteOutlined />}
        onClick={() => handleDelete(notifikasi.id)}
        danger
      >
        Hapus
      </Menu.Item>
    </Menu>
  );

  // Calculate statistics
  const unreadCount = notifikasiList.filter(n => n.status === 'unread').length;
  const todayCount = notifikasiList.filter(n => 
    dayjs(n.tanggal).format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD')
  ).length;
  const highPriorityCount = notifikasiList.filter(n => n.prioritas === 'tinggi').length;

  return (
    <LayoutApp>
      <div style={{ padding: "24px 0" }}>
        {/* Header */}
        <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
          <Col>
            <Title level={2} style={{
              background: 'linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              margin: 0,
              fontSize: '28px',
              fontWeight: '700'
            }}>
              <BellOutlined style={{ marginRight: 12, color: '#4A90E2' }} />
              Notifikasi
            </Title>
            <div style={{
              fontSize: '14px',
              color: '#666',
              marginTop: '4px',
              fontWeight: '500'
            }}>
              Update hafalan, target, dan pengumuman terbaru
            </div>
          </Col>
          <Col>
            <Space>
              <Button
                icon={<CheckOutlined />}
                onClick={handleMarkAllAsRead}
                disabled={unreadCount === 0}
              >
                Tandai Semua Dibaca
              </Button>
              <Button
                icon={<ClearOutlined />}
                onClick={handleClearAll}
                disabled={notifikasiList.length === 0}
                danger
              >
                Hapus Semua
              </Button>
            </Space>
          </Col>
        </Row>

        {/* Statistics Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={8}>
            <Card
              style={{
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)',
                border: 'none',
                boxShadow: '0 8px 32px rgba(74, 144, 226, 0.2)'
              }}
              bodyStyle={{ padding: '20px' }}
            >
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.9)' }}>Belum Dibaca</span>}
                value={unreadCount}
                valueStyle={{ color: 'white', fontSize: '28px', fontWeight: 'bold' }}
                prefix={<BellOutlined style={{ color: 'white' }} />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card
              style={{
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #00B894 0%, #00CEC9 100%)',
                border: 'none',
                boxShadow: '0 8px 32px rgba(0, 184, 148, 0.2)'
              }}
              bodyStyle={{ padding: '20px' }}
            >
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.9)' }}>Hari Ini</span>}
                value={todayCount}
                valueStyle={{ color: 'white', fontSize: '28px', fontWeight: 'bold' }}
                prefix={<CalendarOutlined style={{ color: 'white' }} />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card
              style={{
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #E74C3C 0%, #C0392B 100%)',
                border: 'none',
                boxShadow: '0 8px 32px rgba(231, 76, 60, 0.2)'
              }}
              bodyStyle={{ padding: '20px' }}
            >
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.9)' }}>Prioritas Tinggi</span>}
                value={highPriorityCount}
                valueStyle={{ color: 'white', fontSize: '28px', fontWeight: 'bold' }}
                prefix={<ExclamationCircleOutlined style={{ color: 'white' }} />}
              />
            </Card>
          </Col>
        </Row>

        {/* Filters */}
        <Card style={{ marginBottom: 16, borderRadius: '12px' }}>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={12} md={6}>
              <Space>
                <Text strong>Filter:</Text>
                <Button
                  type={filterStatus === 'all' ? 'primary' : 'default'}
                  size="small"
                  onClick={() => setFilterStatus('all')}
                >
                  Semua
                </Button>
                <Button
                  type={filterStatus === 'unread' ? 'primary' : 'default'}
                  size="small"
                  onClick={() => setFilterStatus('unread')}
                >
                  Belum Dibaca
                </Button>
                <Button
                  type={filterStatus === 'read' ? 'primary' : 'default'}
                  size="small"
                  onClick={() => setFilterStatus('read')}
                >
                  Sudah Dibaca
                </Button>
              </Space>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Space>
                <Text strong>Tipe:</Text>
                <Button
                  type={filterTipe === 'all' ? 'primary' : 'default'}
                  size="small"
                  onClick={() => setFilterTipe('all')}
                >
                  Semua
                </Button>
                <Button
                  type={filterTipe === 'hafalan' ? 'primary' : 'default'}
                  size="small"
                  onClick={() => setFilterTipe('hafalan')}
                >
                  Hafalan
                </Button>
                <Button
                  type={filterTipe === 'target' ? 'primary' : 'default'}
                  size="small"
                  onClick={() => setFilterTipe('target')}
                >
                  Target
                </Button>
                <Button
                  type={filterTipe === 'pengumuman' ? 'primary' : 'default'}
                  size="small"
                  onClick={() => setFilterTipe('pengumuman')}
                >
                  Pengumuman
                </Button>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* Notifications List */}
        <Card
          style={{
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.8)',
            background: 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)'
          }}
          bodyStyle={{
            padding: '24px',
            background: 'transparent'
          }}
        >
          {filteredData.length > 0 ? (
            <List
              dataSource={filteredData}
              renderItem={(item) => (
                <List.Item
                  style={{
                    padding: '16px 0',
                    borderBottom: '1px solid rgba(0,0,0,0.05)',
                    backgroundColor: item.status === 'unread' ? 'rgba(74, 144, 226, 0.02)' : 'transparent',
                    borderRadius: '8px',
                    marginBottom: '8px',
                    paddingLeft: '16px',
                    paddingRight: '16px',
                    transition: 'all 0.2s ease'
                  }}
                  actions={[
                    <Dropdown 
                      key="more" 
                      overlay={getActionMenu(item)} 
                      trigger={['click']}
                      placement="bottomRight"
                    >
                      <Button type="text" icon={<MoreOutlined />} />
                    </Dropdown>
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <Badge dot={item.status === 'unread'} offset={[-5, 5]}>
                        <Avatar
                          style={{
                            backgroundColor: getTipeColor(item.tipe),
                            color: 'white'
                          }}
                          icon={getTipeIcon(item.tipe)}
                          size={48}
                        />
                      </Badge>
                    }
                    title={
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <Text 
                            strong 
                            style={{ 
                              fontSize: '16px',
                              color: item.status === 'unread' ? '#333' : '#666'
                            }}
                          >
                            {item.judul}
                          </Text>
                          <div style={{ marginTop: 4 }}>
                            <Tag color={getPrioritasColor(item.prioritas)}>
                              {item.prioritas.toUpperCase()}
                            </Tag>
                            <Tag color={getTipeColor(item.tipe)}>
                              {item.tipe.charAt(0).toUpperCase() + item.tipe.slice(1)}
                            </Tag>
                          </div>
                        </div>
                        <Text type="secondary" style={{ fontSize: '12px', whiteSpace: 'nowrap' }}>
                          {dayjs(item.tanggal).fromNow()}
                        </Text>
                      </div>
                    }
                    description={
                      <div style={{ marginTop: 8 }}>
                        <Text 
                          style={{ 
                            fontSize: '14px',
                            color: item.status === 'unread' ? '#333' : '#999',
                            lineHeight: '1.5'
                          }}
                        >
                          {item.pesan}
                        </Text>
                        <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            <UserOutlined style={{ marginRight: 4 }} />
                            {item.pengirim}
                          </Text>
                          {item.aksi && (
                            <Button 
                              type="link" 
                              size="small"
                              style={{
                                color: '#4A90E2',
                                padding: 0,
                                height: 'auto'
                              }}
                              onClick={() => {
                                handleMarkAsRead(item.id);
                                // Navigate to action URL
                                window.location.href = item.aksi!.url;
                              }}
                            >
                              {item.aksi.label} →
                            </Button>
                          )}
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              )}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} dari ${total} notifikasi`,
              }}
            />
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <div>
                  <Text type="secondary">Tidak ada notifikasi</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    Notifikasi akan muncul di sini ketika ada update
                  </Text>
                </div>
              }
            />
          )}
        </Card>
      </div>
    </LayoutApp>
  );
}