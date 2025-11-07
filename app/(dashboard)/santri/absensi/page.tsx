"use client";

import { useEffect, useState } from "react";
import { Row, Col, Card, Statistic, Progress, Typography, List, Avatar, Tag, Button, Empty, Spin, Calendar, Badge } from "antd";
import { UserOutlined, BookOutlined, CalendarOutlined, CheckCircleOutlined, ClockCircleOutlined, TrophyOutlined, AimOutlined, LineChartOutlined, FilterOutlined, StarOutlined } from "@ant-design/icons";
import LayoutApp from "@/components/layout/LayoutApp";
import dayjs from "dayjs";

const { Title, Text, Paragraph } = Typography;

interface AbsensiData {
  id: number;
  tanggal: string;
  status: 'hadir' | 'izin' | 'alpha';
  halaqah: string;
  guru: string;
}

interface AbsensiStats {
  totalHadir: number;
  totalIzin: number;
  totalAlpha: number;
  attendanceRate: number;
  currentStreak: number;
  bestStreak: number;
}

export default function SantriAbsensiPage() {
  const [absensiData, setAbsensiData] = useState<AbsensiData[]>([]);
  const [stats, setStats] = useState<AbsensiStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(dayjs());

  // Mock data - data yang diinput oleh guru
  const mockAbsensiData: AbsensiData[] = [
    { id: 1, tanggal: '2024-01-07', status: 'hadir', halaqah: 'Halaqah Al-Fatihah', guru: 'Ustadz Ahmad' },
    { id: 2, tanggal: '2024-01-06', status: 'hadir', halaqah: 'Halaqah Al-Fatihah', guru: 'Ustadz Ahmad' },
    { id: 3, tanggal: '2024-01-05', status: 'hadir', halaqah: 'Halaqah Al-Fatihah', guru: 'Ustadz Ahmad' },
    { id: 4, tanggal: '2024-01-04', status: 'hadir', halaqah: 'Halaqah Al-Fatihah', guru: 'Ustadz Ahmad' },
    { id: 5, tanggal: '2024-01-03', status: 'izin', halaqah: 'Halaqah Al-Fatihah', guru: 'Ustadz Ahmad' },
    { id: 6, tanggal: '2024-01-02', status: 'hadir', halaqah: 'Halaqah Al-Fatihah', guru: 'Ustadz Ahmad' },
    { id: 7, tanggal: '2024-01-01', status: 'hadir', halaqah: 'Halaqah Al-Fatihah', guru: 'Ustadz Ahmad' },
  ];

  const mockStats: AbsensiStats = {
    totalHadir: 25,
    totalIzin: 2,
    totalAlpha: 1,
    attendanceRate: 93,
    currentStreak: 5,
    bestStreak: 12
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch absensi data from new API endpoint
        const response = await fetch('/api/santri/absensi?limit=50');
        if (!response.ok) {
          throw new Error('Failed to fetch absensi data');
        }
        const data = await response.json();

        if (data.success) {
          setAbsensiData(data.data.absensi || []);
          setStats(data.data.stats || mockStats);
        } else {
          throw new Error(data.error || 'Failed to fetch data');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        // Fallback to mock data if API fails
        setAbsensiData(mockAbsensiData);
        setStats(mockStats);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

  // Calendar cell renderer
  const cellRender = (date: dayjs.Dayjs, info: { type: string; originNode: React.ReactElement }) => {
    if (info.type === 'date') {
      const dateStr = date.format('YYYY-MM-DD');
      const absensi = absensiData.find(a => a.tanggal === dateStr);

      if (absensi) {
        return (
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Badge
              color={getStatusColor(absensi.status)}
              text={date.date()}
              style={{ fontSize: '12px' }}
            />
          </div>
        );
      }

      return date.date();
    }
    
    return info.originNode;
  };

  if (loading) {
    return (
      <LayoutApp>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <Spin size="large" />
          <Text type="secondary">Memuat data absensi Anda...</Text>
        </div>
      </LayoutApp>
    );
  }

  return (
    <LayoutApp>
      <div style={{ padding: "24px 0", maxWidth: "1400px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)',
          borderRadius: '20px',
          padding: '32px',
          marginBottom: '32px',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '50%',
            width: '120px',
            height: '120px',
            position: 'absolute',
            top: '-30px',
            right: '-30px'
          }} />
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '50%',
            width: '80px',
            height: '80px',
            position: 'absolute',
            bottom: '-20px',
            left: '20px'
          }} />

          <Row align="middle" gutter={24}>
            <Col xs={24} md={16}>
              <Title level={1} style={{
                color: 'white',
                margin: 0,
                fontSize: '36px',
                fontWeight: '800',
                marginBottom: '8px'
              }}>
                <CalendarOutlined style={{ marginRight: 16 }} />
                Absensi Saya
              </Title>
              <Paragraph style={{
                color: 'rgba(255,255,255,0.9)',
                fontSize: '18px',
                margin: 0,
                fontWeight: '400'
              }}>
                Pantau kehadiran halaqah dan tingkatkan disiplin Anda
              </Paragraph>
            </Col>
            <Col xs={24} md={8} style={{ textAlign: 'center' }}>
              <div style={{
                background: 'rgba(255,255,255,0.2)',
                borderRadius: '16px',
                padding: '24px',
                backdropFilter: 'blur(10px)'
              }}>
                <Avatar
                  size={80}
                  icon={<UserOutlined />}
                  style={{
                    background: 'linear-gradient(135deg, #52c41a, #73d13d)',
                    marginBottom: '12px'
                  }}
                />
                <div style={{ fontSize: '16px', fontWeight: '600' }}>Santri Absensi</div>
                <div style={{ fontSize: '12px', opacity: 0.8 }}>Data dari Guru</div>
              </div>
            </Col>
          </Row>
        </div>

        {/* Statistics Overview */}
        {stats && (
          <Row gutter={[20, 20]} style={{ marginBottom: '40px' }}>
            <Col xs={24} lg={6}>
              <Card
                style={{
                  borderRadius: '20px',
                  background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
                  border: 'none',
                  boxShadow: '0 15px 45px rgba(82, 196, 26, 0.3)',
                  transition: 'all 0.3s ease',
                  cursor: 'default',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                styles={{ body: { padding: '28px', position: 'relative', zIndex: 2 } }}
                hoverable
              >
                <div style={{
                  position: 'absolute',
                  top: '-20px',
                  right: '-20px',
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.1)',
                  zIndex: 1
                }} />
                <Statistic
                  title={<span style={{ color: 'rgba(255,255,255,0.95)', fontSize: '15px', fontWeight: '600' }}>Total Hadir</span>}
                  value={stats.totalHadir}
                  valueStyle={{ color: 'white', fontSize: '36px', fontWeight: '900', letterSpacing: '-0.5px' }}
                  prefix={<CheckCircleOutlined style={{ color: 'white', fontSize: '22px', marginRight: '8px' }} />}
                />
              </Card>
            </Col>

            <Col xs={24} lg={6}>
              <Card
                style={{
                  borderRadius: '20px',
                  background: 'linear-gradient(135deg, #fa8c16 0%, #ffb347 100%)',
                  border: 'none',
                  boxShadow: '0 15px 45px rgba(250, 140, 22, 0.3)',
                  transition: 'all 0.3s ease',
                  cursor: 'default',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                styles={{ body: { padding: '28px', position: 'relative', zIndex: 2 } }}
                hoverable
              >
                <div style={{
                  position: 'absolute',
                  bottom: '-15px',
                  right: '-15px',
                  width: '45px',
                  height: '45px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.1)',
                  zIndex: 1
                }} />
                <Statistic
                  title={<span style={{ color: 'rgba(255,255,255,0.95)', fontSize: '15px', fontWeight: '600' }}>Total Izin</span>}
                  value={stats.totalIzin}
                  valueStyle={{ color: 'white', fontSize: '36px', fontWeight: '900', letterSpacing: '-0.5px' }}
                  prefix={<ClockCircleOutlined style={{ color: 'white', fontSize: '22px', marginRight: '8px' }} />}
                />
              </Card>
            </Col>

            <Col xs={24} lg={6}>
              <Card
                style={{
                  borderRadius: '20px',
                  background: 'linear-gradient(135deg, #f5222d 0%, #ff4d4f 100%)',
                  border: 'none',
                  boxShadow: '0 15px 45px rgba(245, 34, 45, 0.3)',
                  transition: 'all 0.3s ease',
                  cursor: 'default',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                styles={{ body: { padding: '28px', position: 'relative', zIndex: 2 } }}
                hoverable
              >
                <div style={{
                  position: 'absolute',
                  top: '-20px',
                  left: '-20px',
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.1)',
                  zIndex: 1
                }} />
                <Statistic
                  title={<span style={{ color: 'rgba(255,255,255,0.95)', fontSize: '15px', fontWeight: '600' }}>Total Alpha</span>}
                  value={stats.totalAlpha}
                  valueStyle={{ color: 'white', fontSize: '36px', fontWeight: '900', letterSpacing: '-0.5px' }}
                  prefix={<UserOutlined style={{ color: 'white', fontSize: '22px', marginRight: '8px' }} />}
                />
              </Card>
            </Col>

            <Col xs={24} lg={6}>
              <Card
                style={{
                  borderRadius: '20px',
                  background: 'linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)',
                  border: 'none',
                  boxShadow: '0 15px 45px rgba(24, 144, 255, 0.3)',
                  transition: 'all 0.3s ease',
                  cursor: 'default',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                styles={{ body: { padding: '28px', position: 'relative', zIndex: 2 } }}
                hoverable
              >
                <div style={{
                  position: 'absolute',
                  bottom: '-15px',
                  left: '-15px',
                  width: '55px',
                  height: '55px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.1)',
                  zIndex: 1
                }} />
                <Statistic
                  title={<span style={{ color: 'rgba(255,255,255,0.95)', fontSize: '15px', fontWeight: '600' }}>Tingkat Kehadiran</span>}
                  value={stats.attendanceRate}
                  suffix="%"
                  valueStyle={{ color: 'white', fontSize: '36px', fontWeight: '900', letterSpacing: '-0.5px' }}
                  prefix={<TrophyOutlined style={{ color: 'white', fontSize: '22px', marginRight: '8px' }} />}
                />
              </Card>
            </Col>
          </Row>
        )}

        {/* Achievement Badges */}
        <div style={{ marginBottom: '40px' }}>
          <Title level={3} style={{
            textAlign: 'center',
            marginBottom: '24px',
            background: 'linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontSize: '24px',
            fontWeight: '800'
          }}>
            🏆 Pencapaian Kehadiran
          </Title>
          <Row gutter={[16, 16]} justify="center">
            {stats && stats.attendanceRate >= 80 && (
              <Col>
                <div style={{
                  background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
                  borderRadius: '16px',
                  padding: '16px',
                  textAlign: 'center',
                  boxShadow: '0 8px 24px rgba(82, 196, 26, 0.3)',
                  minWidth: '120px'
                }}>
                  <CheckCircleOutlined style={{ fontSize: '32px', color: 'white', marginBottom: '8px' }} />
                  <div style={{ color: 'white', fontSize: '14px', fontWeight: '600' }}>
                    Santri Rajin
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>
                    Kehadiran ≥ 80%
                  </div>
                </div>
              </Col>
            )}
            {stats && stats.attendanceRate >= 90 && (
              <Col>
                <div style={{
                  background: 'linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)',
                  borderRadius: '16px',
                  padding: '16px',
                  textAlign: 'center',
                  boxShadow: '0 8px 24px rgba(24, 144, 255, 0.3)',
                  minWidth: '120px'
                }}>
                  <TrophyOutlined style={{ fontSize: '32px', color: 'white', marginBottom: '8px' }} />
                  <div style={{ color: 'white', fontSize: '14px', fontWeight: '600' }}>
                    Santri Teladan
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>
                    Kehadiran ≥ 90%
                  </div>
                </div>
              </Col>
            )}
            {stats && stats.currentStreak >= 5 && (
              <Col>
                <div style={{
                  background: 'linear-gradient(135deg, #fa8c16 0%, #ffb347 100%)',
                  borderRadius: '16px',
                  padding: '16px',
                  textAlign: 'center',
                  boxShadow: '0 8px 24px rgba(250, 140, 22, 0.3)',
                  minWidth: '120px'
                }}>
                  <StarOutlined style={{ fontSize: '32px', color: 'white', marginBottom: '8px' }} />
                  <div style={{ color: 'white', fontSize: '14px', fontWeight: '600' }}>
                    Streak Master
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>
                    {stats.currentStreak} hari berturut-turut
                  </div>
                </div>
              </Col>
            )}
          </Row>
        </div>

        {/* Main Content */}
        <Row gutter={[32, 32]}>
          {/* Calendar View */}
          <Col xs={24} xl={12}>
            <Card
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #1890ff, #40a9ff)',
                    boxShadow: '0 0 15px rgba(24, 144, 255, 0.4)'
                  }} />
                  <span style={{
                    background: 'linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    fontSize: '20px',
                    fontWeight: '800',
                    letterSpacing: '-0.3px'
                  }}>
                    📅 Kalender Kehadiran
                  </span>
                </div>
              }
              style={{
                borderRadius: '24px',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(24, 144, 255, 0.08)',
                background: 'linear-gradient(145deg, #ffffff 0%, #f8fbff 100%)',
                height: '100%',
                position: 'relative',
                overflow: 'hidden'
              }}
              styles={{ body: {
                padding: '40px',
                background: 'transparent',
                position: 'relative',
                zIndex: 2
              } }}
            >
              <div style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(24, 144, 255, 0.05), rgba(64, 169, 255, 0.03))',
                zIndex: 1
              }} />
              <Calendar
                cellRender={cellRender}
                value={selectedDate}
                onSelect={setSelectedDate}
                style={{
                  border: 'none',
                  background: 'transparent'
                }}
              />

              <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center', gap: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#52c41a' }} />
                  <Text style={{ fontSize: '14px', color: '#666' }}>Hadir</Text>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#fa8c16' }} />
                  <Text style={{ fontSize: '14px', color: '#666' }}>Izin</Text>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f5222d' }} />
                  <Text style={{ fontSize: '14px', color: '#666' }}>Alpha</Text>
                </div>
              </div>
            </Card>
          </Col>

          {/* Recent Activity & Stats */}
          <Col xs={24} xl={12}>
            {/* Streak Information */}
            {stats && (
              <Card
                title={
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #fa8c16, #ffb347)',
                      boxShadow: '0 0 15px rgba(250, 140, 22, 0.4)'
                    }} />
                    <span style={{
                      background: 'linear-gradient(135deg, #fa8c16 0%, #ffb347 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      fontSize: '20px',
                      fontWeight: '800',
                      letterSpacing: '-0.3px'
                    }}>
                      🔥 Streak Kehadiran
                    </span>
                  </div>
                }
                style={{
                  borderRadius: '24px',
                  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
                  border: '1px solid rgba(250, 140, 22, 0.08)',
                  background: 'linear-gradient(145deg, #ffffff 0%, #fff8f0 100%)',
                  marginBottom: '32px',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                styles={{ body: {
                  padding: '32px',
                  background: 'transparent',
                  position: 'relative',
                  zIndex: 2
                } }}
              >
                <div style={{
                  position: 'absolute',
                  top: '15px',
                  right: '15px',
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, rgba(250, 140, 22, 0.05), rgba(255, 179, 71, 0.03))',
                  zIndex: 1
                }} />
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={12}>
                    <div style={{
                      background: 'linear-gradient(135deg, #fa8c16 0%, #ffb347 100%)',
                      borderRadius: '16px',
                      padding: '20px',
                      textAlign: 'center',
                      color: 'white'
                    }}>
                      <div style={{ fontSize: '36px', fontWeight: '900', marginBottom: '8px' }}>
                        {stats.currentStreak}
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: '600' }}>
                        Streak Saat Ini
                      </div>
                      <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '4px' }}>
                        Hari berturut-turut
                      </div>
                    </div>
                  </Col>
                  <Col xs={24} md={12}>
                    <div style={{
                      background: 'linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)',
                      borderRadius: '16px',
                      padding: '20px',
                      textAlign: 'center',
                      color: 'white'
                    }}>
                      <div style={{ fontSize: '36px', fontWeight: '900', marginBottom: '8px' }}>
                        {stats.bestStreak}
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: '600' }}>
                        Rekor Terbaik
                      </div>
                      <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '4px' }}>
                        Hari terpanjang
                      </div>
                    </div>
                  </Col>
                </Row>
              </Card>
            )}

            {/* Recent Absensi */}
            <Card
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #52c41a, #73d13d)',
                    boxShadow: '0 0 15px rgba(82, 196, 26, 0.4)'
                  }} />
                  <span style={{
                    background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    fontSize: '20px',
                    fontWeight: '800',
                    letterSpacing: '-0.3px'
                  }}>
                    📋 Riwayat Kehadiran
                  </span>
                </div>
              }
              style={{
                borderRadius: '24px',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(82, 196, 26, 0.08)',
                background: 'linear-gradient(145deg, #ffffff 0%, #f8fff8 100%)',
                position: 'relative',
                overflow: 'hidden'
              }}
              styles={{ body: {
                padding: '32px',
                background: 'transparent',
                position: 'relative',
                zIndex: 2
              } }}
            >
              <div style={{
                position: 'absolute',
                bottom: '20px',
                left: '20px',
                width: '70px',
                height: '70px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(82, 196, 26, 0.05), rgba(115, 209, 61, 0.03))',
                zIndex: 1
              }} />
              {absensiData.length > 0 ? (
                <List
                  dataSource={absensiData.slice(0, 10)}
                  renderItem={(item) => (
                    <List.Item
                      style={{
                        padding: '16px 0',
                        borderBottom: '1px solid rgba(0,0,0,0.04)',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <List.Item.Meta
                        avatar={
                          <div
                            style={{
                              width: 48,
                              height: 48,
                              borderRadius: '12px',
                              background: `linear-gradient(135deg, ${getStatusColor(item.status)}, ${getStatusColor(item.status)}dd)`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              fontWeight: '600',
                              fontSize: '16px',
                              boxShadow: `0 4px 12px ${getStatusColor(item.status)}40`
                            }}
                          >
                            {getStatusIcon(item.status)}
                          </div>
                        }
                        title={
                          <div>
                            <Text strong style={{ fontSize: '15px', color: '#333' }}>
                              {getStatusText(item.status)}
                            </Text>
                            <div style={{ marginTop: '4px' }}>
                              <Tag
                                color={item.status === 'hadir' ? 'green' : item.status === 'izin' ? 'orange' : 'red'}
                                style={{ fontSize: '11px' }}
                              >
                                {item.halaqah}
                              </Tag>
                            </div>
                          </div>
                        }
                        description={
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                            <Text style={{ color: '#666', fontSize: '13px' }}>
                              <CalendarOutlined style={{ marginRight: '6px' }} />
                              {dayjs(item.tanggal).format('DD/MM/YYYY')}
                            </Text>
                            <Text style={{ color: '#999', fontSize: '12px' }}>
                              <UserOutlined style={{ marginRight: '4px' }} />
                              {item.guru}
                            </Text>
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
          </Col>
        </Row>
      </div>
    </LayoutApp>
  );
}