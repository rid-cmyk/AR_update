"use client";

import { useEffect, useState, useCallback } from "react";
import { Row, Col, Card, Statistic, Typography, List, Avatar, Tag, Empty, Spin, Calendar, Badge } from "antd";
import { UserOutlined, CalendarOutlined, CheckCircleOutlined, ClockCircleOutlined, TrophyOutlined, StarOutlined } from "@ant-design/icons";
import AdminHeaderCard from "@/components/super-admin/layout/AdminHeaderCard";
import dayjs from "dayjs";
import { SantriAbsensiStats } from "./SantriAbsensiStats";
import { SantriAbsensiBadges } from "./SantriAbsensiBadges";
import { SantriAbsensiList } from "./SantriAbsensiList";

const { Title, Text } = Typography;

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

// Mock data variables removed

export default function SantriAbsensiPage() {
  const [absensiData, setAbsensiData] = useState<AbsensiData[]>([]);
  const [stats, setStats] = useState<AbsensiStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(dayjs());

  const fetchData = useCallback(async () => {
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
        setStats(data.data.stats || {
          totalHadir: 0,
          totalIzin: 0,
          totalAlpha: 0,
          attendanceRate: 0,
          currentStreak: 0,
          bestStreak: 0
        });
      } else {
        throw new Error(data.error || 'Failed to fetch data');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      // Fallback to empty data if API fails
      setAbsensiData([]);
      setStats({
        totalHadir: 0,
        totalIzin: 0,
        totalAlpha: 0,
        attendanceRate: 0,
        currentStreak: 0,
        bestStreak: 0
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'hadir': return '#219ebc';
      case 'izin': return '#ffb703';
      case 'alpha': return '#fb8500';
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
          <Text type="secondary">Memuat data absensi Anda...</Text>
        </div>
      </>
    );
  }

  return (
    <>
      <div style={{ padding: "24px 0", maxWidth: "1400px", margin: "0 auto" }}>
        {/* Header */}
        <AdminHeaderCard
          title="Absensi Saya"
          subtitle="Pantau kehadiran halaqah dan tingkatkan disiplin Anda"
          tags={[
            { label: "Absensi", icon: <CalendarOutlined /> },
            { label: "Online", icon: <ClockCircleOutlined /> }
          ]}
          actions={
            <div style={{
              background: 'rgba(255,255,255,0.2)',
              borderRadius: 16,
              padding: 16,
              textAlign: 'center',
              backdropFilter: 'blur(10px)'
            }}>
              <Avatar
                size={64}
                icon={<UserOutlined />}
                style={{
                  background: '#219ebc',
                  marginBottom: 8
                }}
              />
              <div style={{ fontSize: 14, fontWeight: 600 }}>Santri Absensi</div>
              <div style={{ fontSize: 11, opacity: 0.8 }}>Data dari Guru</div>
            </div>
          }
        />

        {/* Statistics Overview */}
        {stats && <SantriAbsensiStats stats={stats} />}

        {/* Achievement Badges */}
        <SantriAbsensiBadges stats={stats} />

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
                    background: '#219ebc',
                    boxShadow: '0 0 15px rgba(33, 158, 188, 0.4)'
                  }} />
                  <span style={{
                    background: '#219ebc',
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
                border: '1px solid rgba(33, 158, 188, 0.08)',
                background: '#ffffff',
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
                background: 'rgba(33, 158, 188, 0.05))',
                zIndex: 1
              }} />
              {!loading && (
                <Calendar
                  cellRender={cellRender}
                  value={selectedDate}
                  onSelect={setSelectedDate}
                  style={{
                    border: 'none',
                    background: 'transparent'
                  }}
                />
              )}

              <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center', gap: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#219ebc' }} />
                  <Text style={{ fontSize: '14px', color: '#666' }}>Hadir</Text>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ffb703' }} />
                  <Text style={{ fontSize: '14px', color: '#666' }}>Izin</Text>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#fb8500' }} />
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
                      background: '#ffb703',
                      boxShadow: '0 0 15px rgba(250, 140, 22, 0.4)'
                    }} />
                    <span style={{
                      background: '#ffb703',
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
                  background: '#ffffff',
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
                  background: 'rgba(250, 140, 22, 0.05))',
                  zIndex: 1
                }} />
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={12}>
                    <div style={{
                      background: '#ffb703',
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
                      background: '#219ebc',
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
            <SantriAbsensiList 
              absensiData={absensiData} 
              getStatusColor={getStatusColor} 
              getStatusIcon={getStatusIcon} 
              getStatusText={getStatusText} 
            />
          </Col>
        </Row>
      </div>
    </>
  );
}