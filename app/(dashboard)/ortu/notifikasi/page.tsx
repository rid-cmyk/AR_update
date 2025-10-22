"use client";

import { useEffect, useState } from "react";
import { 
  Card, 
  Typography, 
  Row, 
  Col, 
  Button,
  Space,
  Avatar,
  Dropdown,
  Modal,
  Statistic,
  Empty,
  Spin
} from "antd";
import {
  BellOutlined,
  CheckOutlined,
  DeleteOutlined,
  MoreOutlined,
  BookOutlined,
  CalendarOutlined,
  TrophyOutlined,
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

const { Title } = Typography;

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
  fullContent?: string;
  targetAudience?: string;
  tanggalKadaluarsa?: string;
}

export default function NotifikasiPage() {
  const [notifikasiList, setNotifikasiList] = useState<Notifikasi[]>([]);
  const [filteredData, setFilteredData] = useState<Notifikasi[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedNotifikasi, setSelectedNotifikasi] = useState<Notifikasi | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Fetch unified notifications from API
  const fetchNotifikasi = async () => {
    try {
      setLoading(true);
      
      const notifRes = await fetch('/api/notifikasi');
      const notifData = notifRes.ok ? await notifRes.json() : { data: [] };
      
      const transformedNotifications = (notifData.data || []).map((item: any) => ({
        id: item.id,
        judul: item.metadata?.judul || getNotifikasiTitle(item.type, item.pesan),
        pesan: item.metadata?.isi || item.pesan,
        tipe: mapNotifikasiType(item.type),
        prioritas: getPriorityFromType(item.type),
        status: item.isRead ? 'read' : 'unread',
        tanggal: item.tanggal,
        pengirim: item.metadata?.creator || 'Sistem',
        fullContent: item.metadata?.fullContent || item.pesan,
        targetAudience: item.metadata?.targetAudience,
        tanggalKadaluarsa: item.metadata?.tanggalKadaluarsa,
        aksi: getNotifikasiAction(item.type, item.refId),
        metadata: {
          targetId: item.type === 'target' ? item.refId : undefined,
          hafalanId: item.type === 'hafalan' ? item.refId : undefined,
          pengumumanId: item.type === 'pengumuman' ? item.refId : undefined,
        }
      }));
      
      setNotifikasiList(transformedNotifications);
      setFilteredData(transformedNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifikasiList([]);
      setFilteredData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifikasi();
  }, []);

  // Helper functions
  const getNotifikasiTitle = (type: string, pesan: string) => {
    switch (type) {
      case 'pengumuman': return 'Pengumuman Baru';
      case 'hafalan': return 'Update Hafalan';
      case 'target': return 'Target Hafalan';
      case 'absensi': return 'Update Absensi';
      default: return 'Notifikasi';
    }
  };

  const mapNotifikasiType = (apiType: string) => {
    const typeMap: { [key: string]: string } = {
      'pengumuman': 'pengumuman',
      'hafalan': 'hafalan',
      'target': 'target',
      'absensi': 'jadwal',
      'rapot': 'prestasi',
      'user': 'sistem'
    };
    return typeMap[apiType] || 'sistem';
  };

  const getPriorityFromType = (type: string) => {
    switch (type) {
      case 'pengumuman': return 'tinggi';
      case 'target': return 'tinggi';
      case 'hafalan': return 'sedang';
      default: return 'rendah';
    }
  };

  const getNotifikasiAction = (type: string, refId?: number) => {
    switch (type) {
      case 'pengumuman':
        return { label: 'Baca Detail', url: '#' };
      case 'hafalan':
        return { label: 'Lihat Hafalan', url: '/ortu/hafalan' };
      case 'target':
        return { label: 'Lihat Target', url: '/ortu/target' };
      case 'absensi':
        return { label: 'Lihat Absensi', url: '/ortu/absensi' };
      default:
        return undefined;
    }
  };

  const handleNotificationClick = async (notifikasi: Notifikasi) => {
    if (notifikasi.status === 'unread') {
      handleMarkAsRead(notifikasi.id);
    }

    if (notifikasi.tipe === 'pengumuman') {
      setSelectedNotifikasi(notifikasi);
      setIsDetailModalOpen(true);
    } else if (notifikasi.aksi && notifikasi.aksi.url !== '#') {
      window.location.href = notifikasi.aksi.url;
    }
  };

  useEffect(() => {
    let filtered = notifikasiList;
    if (filterStatus !== 'all') {
      filtered = filtered.filter(item => item.status === filterStatus);
    }
    setFilteredData(filtered);
  }, [filterStatus, notifikasiList]);

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

  const handleMarkAsRead = async (id: number | string) => {
    try {
      const res = await fetch(`/api/notifikasi/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark_read' })
      });

      if (res.ok) {
        setNotifikasiList(prev => 
          prev.map(notif => 
            notif.id === id ? { ...notif, status: 'read' } : notif
          )
        );
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      setNotifikasiList(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, status: 'read' } : notif
        )
      );
    }
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

  const unreadCount = notifikasiList.filter(n => n.status === 'unread').length;
  const todayCount = notifikasiList.filter(n => 
    dayjs(n.tanggal).format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD')
  ).length;
  const thisWeekCount = notifikasiList.filter(n => 
    dayjs(n.tanggal).isAfter(dayjs().startOf('week'))
  ).length;

  return (
    <LayoutApp>
      <div style={{ padding: "24px 0" }}>
        {/* Header */}
        <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
          <Col>
            <Title level={2} style={{
              background: 'linear-gradient(135deg, #722ED1 0%, #531DAB 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              margin: 0,
              fontSize: '28px',
              fontWeight: '700'
            }}>
              <BellOutlined style={{ marginRight: 12, color: '#722ED1' }} />
              Notifikasi & Pengumuman
            </Title>
            <div style={{
              fontSize: '14px',
              color: '#666',
              marginTop: '4px',
              fontWeight: '500'
            }}>
              Update hafalan, target, pengumuman, dan informasi terbaru tentang anak
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
                background: 'linear-gradient(135deg, #722ED1 0%, #531DAB 100%)',
                border: 'none',
                boxShadow: '0 8px 32px rgba(114, 46, 209, 0.2)'
              }}
              styles={{ body: { padding: '20px' } }}
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
              styles={{ body: { padding: '20px' } }}
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
                background: 'linear-gradient(135deg, #FA8C16 0%, #D46B08 100%)',
                border: 'none',
                boxShadow: '0 8px 32px rgba(250, 140, 22, 0.2)'
              }}
              styles={{ body: { padding: '20px' } }}
            >
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.9)' }}>Minggu Ini</span>}
                value={thisWeekCount}
                valueStyle={{ color: 'white', fontSize: '28px', fontWeight: 'bold' }}
                prefix={<ClockCircleOutlined style={{ color: 'white' }} />}
              />
            </Card>
          </Col>
        </Row>

        {/* Simple Filter */}
        <Card 
          style={{ 
            marginBottom: 16, 
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #f9f0ff 0%, #efdbff 100%)',
            border: '1px solid #d3adf7'
          }}
        >
          <Row gutter={[16, 16]} align="middle" justify="center">
            <Col xs={24} style={{ textAlign: 'center' }}>
              <Space size="middle">
                <span style={{ fontWeight: 'bold', color: '#722ED1', fontSize: '16px' }}>📋 Filter Status:</span>
                <Button
                  type={filterStatus === 'all' ? 'primary' : 'default'}
                  size="middle"
                  onClick={() => setFilterStatus('all')}
                  style={{ borderRadius: '25px', minWidth: '120px' }}
                >
                  Semua ({notifikasiList.length})
                </Button>
                <Button
                  type={filterStatus === 'unread' ? 'primary' : 'default'}
                  size="middle"
                  onClick={() => setFilterStatus('unread')}
                  style={{ borderRadius: '25px', minWidth: '120px' }}
                >
                  Belum Dibaca ({unreadCount})
                </Button>
                <Button
                  type={filterStatus === 'read' ? 'primary' : 'default'}
                  size="middle"
                  onClick={() => setFilterStatus('read')}
                  style={{ borderRadius: '25px', minWidth: '120px' }}
                >
                  Sudah Dibaca ({notifikasiList.length - unreadCount})
                </Button>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* Notifications List */}
        <Card
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #722ED1, #531DAB)',
                boxShadow: '0 0 15px rgba(114, 46, 209, 0.4)'
              }} />
              <span style={{
                background: 'linear-gradient(135deg, #722ED1 0%, #531DAB 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontSize: '20px',
                fontWeight: '800'
              }}>
                📋 Daftar Notifikasi & Pengumuman
              </span>
            </div>
          }
          style={{
            borderRadius: '20px',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(114, 46, 209, 0.1)',
            background: 'linear-gradient(145deg, #ffffff 0%, #f9f0ff 100%)'
          }}
        >
          <Spin spinning={loading}>
            {filteredData.length > 0 ? (
              <div style={{ padding: '20px' }}>
                {filteredData.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      padding: '20px',
                      marginBottom: '16px',
                      borderRadius: '16px',
                      background: item.status === 'unread' 
                        ? 'linear-gradient(135deg, #f9f0ff 0%, #efdbff 100%)'
                        : 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)',
                      border: item.status === 'unread' 
                        ? '2px solid #d3adf7' 
                        : '1px solid #f0f0f0',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onClick={() => handleNotificationClick(item)}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                      <Avatar
                        style={{
                          backgroundColor: getTipeColor(item.tipe),
                          color: 'white'
                        }}
                        icon={getTipeIcon(item.tipe)}
                        size={56}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ 
                          fontSize: '18px',
                          fontWeight: item.status === 'unread' ? 'bold' : '600',
                          color: item.status === 'unread' ? '#722ED1' : '#333',
                          marginBottom: '8px'
                        }}>
                          {item.judul}
                        </div>
                        <div style={{ 
                          fontSize: '15px',
                          color: '#666',
                          marginBottom: '12px'
                        }}>
                          {item.pesan}
                        </div>
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center'
                        }}>
                          <span style={{ fontSize: '13px', color: '#999' }}>
                            {dayjs(item.tanggal).fromNow()}
                          </span>
                          <Dropdown 
                            menu={{
                              items: [
                                ...(item.status === 'unread' ? [{
                                  key: 'read',
                                  icon: <CheckOutlined />,
                                  label: 'Tandai Dibaca',
                                  onClick: () => handleMarkAsRead(item.id)
                                }] : []),
                                {
                                  key: 'delete',
                                  icon: <DeleteOutlined />,
                                  label: 'Hapus',
                                  onClick: () => handleDelete(item.id),
                                  danger: true
                                }
                              ]
                            }}
                            trigger={['click']}
                          >
                            <Button 
                              type="text" 
                              icon={<MoreOutlined />} 
                              size="small"
                            />
                          </Dropdown>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Empty description="Belum ada notifikasi" />
            )}
          </Spin>
        </Card>

        {/* Detail Modal */}
        <Modal
          title="Detail Pengumuman"
          open={isDetailModalOpen}
          onCancel={() => setIsDetailModalOpen(false)}
          footer={null}
          width={800}
        >
          {selectedNotifikasi && (
            <div>
              <h3>{selectedNotifikasi.judul}</h3>
              <p>{selectedNotifikasi.fullContent || selectedNotifikasi.pesan}</p>
              <div style={{ marginTop: 16, fontSize: '12px', color: '#666' }}>
                Dari: {selectedNotifikasi.pengirim} • {dayjs(selectedNotifikasi.tanggal).format("DD MMMM YYYY, HH:mm")}
              </div>
            </div>
          )}
        </Modal>
      </div>
    </LayoutApp>
  );
}