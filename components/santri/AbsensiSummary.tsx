"use client";

import { useEffect, useState } from "react";
import { Card, Statistic, Row, Col, Tag, List, Avatar, Typography, Empty, Spin } from "antd";
import { 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  UserOutlined, 
  CalendarOutlined,
  TrophyOutlined 
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Text } = Typography;

interface AbsensiData {
  id: number;
  tanggal: string;
  status: 'hadir' | 'izin' | 'alpha';
  halaqah: string;
  guru: string;
  hari: string;
  jamMulai: string;
  jamSelesai: string;
}

interface AbsensiStats {
  totalHadir: number;
  totalIzin: number;
  totalAlpha: number;
  attendanceRate: number;
  currentStreak: number;
  bestStreak: number;
  totalAbsensi: number;
}

interface AbsensiSummaryProps {
  showRecent?: boolean;
  limit?: number;
}

export default function AbsensiSummary({ showRecent = true, limit = 5 }: AbsensiSummaryProps) {
  const [absensiData, setAbsensiData] = useState<AbsensiData[]>([]);
  const [stats, setStats] = useState<AbsensiStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAbsensiData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/santri/absensi?limit=${limit}`);
        if (!response.ok) {
          throw new Error('Failed to fetch absensi data');
        }
        const data = await response.json();

        if (data.success) {
          setAbsensiData(data.data.absensi || []);
          setStats(data.data.stats || null);
        }
      } catch (error) {
        console.error('Error fetching absensi data:', error);
        setAbsensiData([]);
        setStats(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAbsensiData();
  }, [limit]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'hadir': return '#52c41a';
      case 'izin': return '#fa8c16';
      case 'alpha': return '#f5222d';
      default: return '#d9d9d9';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'hadir': return <CheckCircleOutlined />;
      case 'izin': return <ClockCircleOutlined />;
      case 'alpha': return <UserOutlined />;
      default: return <UserOutlined />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'hadir': return 'Hadir';
      case 'izin': return 'Izin';
      case 'alpha': return 'Alpha';
      default: return 'Unknown';
    }
  };

  if (loading) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Spin size="large" />
          <div style={{ marginTop: '16px' }}>
            <Text type="secondary">Memuat data absensi...</Text>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <>
      {/* Statistics Cards */}
      {stats && (
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={12} sm={6}>
            <Card>
              <Statistic
                title="Total Hadir"
                value={stats.totalHadir}
                prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card>
              <Statistic
                title="Total Izin"
                value={stats.totalIzin}
                prefix={<ClockCircleOutlined style={{ color: '#fa8c16' }} />}
                valueStyle={{ color: '#fa8c16' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card>
              <Statistic
                title="Total Alpha"
                value={stats.totalAlpha}
                prefix={<UserOutlined style={{ color: '#f5222d' }} />}
                valueStyle={{ color: '#f5222d' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card>
              <Statistic
                title="Tingkat Kehadiran"
                value={stats.attendanceRate}
                suffix="%"
                prefix={<TrophyOutlined style={{ color: '#1890ff' }} />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Recent Absensi */}
      {showRecent && (
        <Card
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CalendarOutlined style={{ color: '#1890ff' }} />
              <span>Kehadiran Terbaru</span>
              {stats && (
                <Tag color="blue" style={{ marginLeft: 'auto' }}>
                  {stats.totalAbsensi} total
                </Tag>
              )}
            </div>
          }
          extra={
            stats && stats.currentStreak > 0 && (
              <Tag color="orange">
                🔥 Streak: {stats.currentStreak} hari
              </Tag>
            )
          }
        >
          {absensiData.length > 0 ? (
            <List
              dataSource={absensiData}
              renderItem={(item) => (
                <List.Item
                  style={{
                    padding: '12px 0',
                    borderBottom: '1px solid #f0f0f0'
                  }}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        style={{
                          backgroundColor: getStatusColor(item.status),
                          color: 'white'
                        }}
                        icon={getStatusIcon(item.status)}
                      />
                    }
                    title={
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Text strong>{getStatusText(item.status)}</Text>
                        <Tag 
                          color={item.status === 'hadir' ? 'green' : item.status === 'izin' ? 'orange' : 'red'}
                          size="small"
                        >
                          {item.halaqah}
                        </Tag>
                      </div>
                    }
                    description={
                      <div>
                        <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                          <CalendarOutlined style={{ marginRight: '4px' }} />
                          {dayjs(item.tanggal).format('dddd, DD MMMM YYYY')}
                        </div>
                        <div style={{ fontSize: '12px', color: '#999' }}>
                          <UserOutlined style={{ marginRight: '4px' }} />
                          {item.guru} • {item.jamMulai} - {item.jamSelesai}
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <div>
                  <Text type="secondary">Belum ada data absensi</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    Data absensi akan diinput oleh guru Anda
                  </Text>
                </div>
              }
            />
          )}
        </Card>
      )}
    </>
  );
}