"use client";

import { useEffect, useState, useCallback } from "react";
import { Row, Col, Card, Space, Spin, Progress, Button, Typography, Tag } from "antd";
import {
  UserOutlined,
  TeamOutlined,
  BookOutlined,
  CalendarOutlined,
  TrophyOutlined,
  BarChartOutlined,
  FileTextOutlined,
  UserSwitchOutlined,
  SettingOutlined,
  DatabaseOutlined,
} from "@ant-design/icons";
import LayoutApp from "@/components/layout/LayoutApp";
import PageHeader from "@/components/layout/PageHeader";
import StatCard from "@/components/layout/StatCard";
import PengumumanWidget from "@/components/pengumuman/PengumumanWidget";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface YayasanDashboardData {
  overview: {
    totalSantri: number;
    totalGuru: number;
    totalHalaqah: number;
    totalPengumuman: number;
    overallAttendance: number;
    overallHafalanProgress: number;
  };
  performance: {
    attendanceRate: number;
    hafalanRate: number;
  };
  recentActivities: {
    announcements: Array<{
      id: number;
      title: string;
      date: string;
    }>;
    halaqah: Array<{
      id: number;
      namaHalaqah: string;
      santriCount: number;
    }>;
  };
}

export default function YayasanDashboard() {
  const [dashboardData, setDashboardData] = useState<YayasanDashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const router = useRouter();



  // Fetch yayasan dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/analytics/dashboard");
      if (!res.ok) throw new Error("Failed to fetch dashboard data");
      const data = await res.json();

      // Transform data for yayasan dashboard
      const yayasanData: YayasanDashboardData = {
        overview: {
          totalSantri: data.overview?.totalSantri || 0,
          totalGuru: data.overview?.totalGuru || 0,
          totalHalaqah: data.overview?.totalHalaqah || 0,
          totalPengumuman: data.overview?.totalPengumuman || 0,
          overallAttendance: data.performance?.attendanceRate || 0,
          overallHafalanProgress: data.performance?.hafalanRate || 0,
        },
        performance: {
          attendanceRate: data.performance?.attendanceRate || 0,
          hafalanRate: data.performance?.hafalanRate || 0,
        },
        recentActivities: {
          announcements: [
            { id: 1, title: "Jadwal Ujian Tengah Semester", date: "2024-01-15" },
            { id: 2, title: "Pengumuman Libur Hari Raya", date: "2024-01-14" },
          ],
          halaqah: data.halaqahStats?.slice(0, 3) || [],
        },
      };

      setDashboardData(yayasanData);
      setLastUpdate(new Date());
    } catch (error) {
      console.error("Yayasan dashboard error:", error);
      // Set mock data for demo
      setDashboardData({
        overview: {
          totalSantri: 150,
          totalGuru: 12,
          totalHalaqah: 8,
          totalPengumuman: 25,
          overallAttendance: 88,
          overallHafalanProgress: 82,
        },
        performance: {
          attendanceRate: 88,
          hafalanRate: 82,
        },
        recentActivities: {
          announcements: [
            { id: 1, title: "Jadwal Ujian Tengah Semester", date: "2024-01-15" },
            { id: 2, title: "Pengumuman Libur Hari Raya", date: "2024-01-14" },
          ],
          halaqah: [
            { id: 1, namaHalaqah: "Halaqah Al-Fatihah", santriCount: 18 },
            { id: 2, namaHalaqah: "Halaqah Al-Baqarah", santriCount: 22 },
            { id: 3, namaHalaqah: "Halaqah Al-Imran", santriCount: 15 },
          ],
        },
      });
      setLastUpdate(new Date());
    } finally {
      setLoading(false);
    }
  }, []);

  // Navigation handlers
  const handleNavigate = (path: string) => {
    router.push(path);
  };

  useEffect(() => {
    fetchDashboardData();
    // Auto refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  return (
    <LayoutApp>
      <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
        {/* Header */}
        <PageHeader
          title="Dashboard Yayasan"
          subtitle="Comprehensive overview of all halaqah activities and performance"
          breadcrumbs={[{ title: "Yayasan Dashboard" }]}
          extra={
            <Space>
              <Tag icon={<DatabaseOutlined />} color="purple" style={{ padding: '8px 16px', fontSize: 14 }}>
                Yayasan Panel
              </Tag>
              <Link href="/yayasan/laporan">
                <Button type="primary" icon={<BarChartOutlined />} size="large">
                  Laporan Global
                </Button>
              </Link>
            </Space>
          }
        />

        {loading ? (
          <div style={{
            textAlign: 'center',
            padding: '80px 20px',
            background: '#fafafa',
            borderRadius: '12px',
            margin: '20px 0'
          }}>
            <Spin size="large" />
            <p style={{
              marginTop: 16,
              color: '#6b7280',
              fontSize: '16px'
            }}>Loading dashboard data...</p>
          </div>
        ) : (
          <>
            {/* Statistics Cards */}
            <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
              <Col xs={24} sm={12} lg={6}>
                <StatCard
                  title="Total Santri"
                  value={dashboardData?.overview?.totalSantri || 0}
                  icon={<UserOutlined />}
                  color="#1890ff"
                  trend={{ value: 8, isPositive: true, label: "santri baru" }}
                  onClick={() => handleNavigate("/yayasan/santri")}
                />
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <StatCard
                  title="Total Guru"
                  value={dashboardData?.overview?.totalGuru || 0}
                  icon={<TeamOutlined />}
                  color="#722ed1"
                  trend={{ value: 2, isPositive: true, label: "guru aktif" }}
                  onClick={() => handleNavigate("/yayasan/guru")}
                />
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <StatCard
                  title="Total Halaqah"
                  value={dashboardData?.overview?.totalHalaqah || 0}
                  icon={<BookOutlined />}
                  color="#52c41a"
                  trend={{ value: 1, isPositive: true, label: "halaqah baru" }}
                  onClick={() => handleNavigate("/yayasan/halaqah")}
                />
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <StatCard
                  title="System Health"
                  value="100%"
                  icon={<DatabaseOutlined />}
                  color="#fa8c16"
                  trend={{ value: 0, isPositive: true, label: "uptime" }}
                  onClick={() => handleNavigate("/yayasan/system")}
                />
              </Col>
            </Row>

            {/* Progress Section */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
              <Col xs={24} md={12}>
                <Card title="Overall Attendance Performance" variant="borderless">
                  <div style={{ textAlign: 'center', padding: '20px' }}>
                    <Progress
                      type="circle"
                      percent={dashboardData?.performance?.attendanceRate || 0}
                      format={(percent) => `${percent}%`}
                      strokeColor="#1890ff"
                      size={120}
                    />
                    <p style={{ marginTop: 16, color: '#666' }}>
                      Average attendance across all halaqah
                    </p>
                  </div>
                </Card>
              </Col>
              <Col xs={24} md={12}>
                <Card title="Overall Hafalan Performance" variant="borderless">
                  <div style={{ textAlign: 'center', padding: '20px' }}>
                    <Progress
                      type="circle"
                      percent={dashboardData?.performance?.hafalanRate || 0}
                      format={(percent) => `${percent}%`}
                      strokeColor="#52c41a"
                      size={120}
                    />
                    <p style={{ marginTop: 16, color: '#666' }}>
                      Average hafalan progress across all santri
                    </p>
                  </div>
                </Card>
              </Col>
            </Row>

            {/* Global Reports Section */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
              <Col xs={24}>
                <Card title="📈 Laporan Global" variant="borderless">
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} md={6}>
                      <Card
                        hoverable
                        style={{ textAlign: 'center', cursor: 'pointer' }}
                        onClick={() => router.push('/yayasan/laporan?type=hafalan')}
                      >
                        <BookOutlined style={{ fontSize: '24px', color: '#1890ff', marginBottom: 8 }} />
                        <div style={{ fontWeight: 'bold' }}>Hafalan Santri</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>Progress hafalan keseluruhan</div>
                      </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                      <Card
                        hoverable
                        style={{ textAlign: 'center', cursor: 'pointer' }}
                        onClick={() => router.push('/yayasan/laporan?type=absensi')}
                      >
                        <CalendarOutlined style={{ fontSize: '24px', color: '#52c41a', marginBottom: 8 }} />
                        <div style={{ fontWeight: 'bold' }}>Absensi</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>Kehadiran santri</div>
                      </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                      <Card
                        hoverable
                        style={{ textAlign: 'center', cursor: 'pointer' }}
                        onClick={() => router.push('/yayasan/laporan?type=prestasi')}
                      >
                        <TrophyOutlined style={{ fontSize: '24px', color: '#fa8c16', marginBottom: 8 }} />
                        <div style={{ fontWeight: 'bold' }}>Prestasi</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>Pencapaian santri</div>
                      </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                      <Card
                        hoverable
                        style={{ textAlign: 'center', cursor: 'pointer' }}
                        onClick={() => router.push('/yayasan/laporan?type=halaqah')}
                      >
                        <TeamOutlined style={{ fontSize: '24px', color: '#722ed1', marginBottom: 8 }} />
                        <div style={{ fontWeight: 'bold' }}>Per Halaqah</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>Laporan per halaqah</div>
                      </Card>
                    </Col>
                  </Row>
                </Card>
              </Col>
            </Row>

            {/* Info about System Management */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
              <Col xs={24}>
                <Card title="ℹ️ Informasi Sistem" variant="borderless">
                  <div style={{
                    textAlign: 'center',
                    padding: '40px 20px',
                    background: '#f6ffed',
                    borderRadius: 8,
                    border: '1px solid #b7eb8f'
                  }}>
                    <UserSwitchOutlined style={{ fontSize: 48, color: '#52c41a', marginBottom: 16 }} />
                    <Typography.Title level={4} style={{ color: '#52c41a' }}>
                      Manajemen Sistem
                    </Typography.Title>
                    <Typography.Text style={{ color: '#666' }}>
                      Manajemen User dan Role hanya dapat diakses oleh Super Admin melalui panel Super Admin.
                      <br />
                      Admin dapat mengedit passcode sendiri melalui halaman profil.
                      <br />
                      Dashboard Yayasan fokus pada monitoring dan laporan.
                    </Typography.Text>
                  </div>
                </Card>
              </Col>
            </Row>

            {/* Recent Activities */}
            <Row gutter={[16, 16]}>
              <Col xs={24} md={8}>
                <Card
                  title="📖 Detail Per Santri"
                  variant="borderless"
                  style={{ height: '100%' }}
                >
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <div>
                      <strong>👤 Santri Overview:</strong>
                      <p style={{ margin: '8px 0', color: '#666', fontSize: '14px' }}>
                        Detail progress hafalan, absensi, dan prestasi per santri
                      </p>
                    </div>
                    <div>
                      <strong>📊 Individual Reports:</strong>
                      <p style={{ margin: '8px 0', color: '#666', fontSize: '14px' }}>
                        Laporan lengkap untuk setiap santri
                      </p>
                    </div>
                    <Button
                      type="primary"
                      icon={<UserSwitchOutlined />}
                      onClick={() => router.push('/yayasan/santri')}
                      style={{ width: '100%' }}
                    >
                      Lihat Detail Santri
                    </Button>
                  </Space>
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card
                  title="📑 Raport Tahfidz"
                  variant="borderless"
                  style={{ height: '100%' }}
                >
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    <div>
                      <strong>📋 Semester Reports:</strong>
                      <p style={{ margin: '8px 0', color: '#666', fontSize: '14px' }}>
                        Raport tahfidz per semester
                      </p>
                    </div>
                    <div>
                      <strong>🏆 Achievement Tracking:</strong>
                      <p style={{ margin: '8px 0', color: '#666', fontSize: '14px' }}>
                        Pelacakan pencapaian hafalan
                      </p>
                    </div>
                    <Button
                      type="primary"
                      icon={<FileTextOutlined />}
                      onClick={() => router.push('/yayasan/raport')}
                      style={{ width: '100%' }}
                    >
                      Lihat Raport
                    </Button>
                  </Space>
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <PengumumanWidget
                  userRole="yayasan"
                  maxItems={5}
                  title="📢 Pengumuman untuk Yayasan"
                  height={400}
                />
              </Col>
            </Row>

            {/* Footer Info */}
            <Card
              style={{
                background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
                border: "1px solid #e2e8f0",
                borderRadius: 12
              }}
              styles={{ body: { padding: 24 } }}
            >
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}>
                <div>
                  <Typography.Title level={4} style={{
                    margin: 0,
                    color: "#1e293b",
                    fontWeight: 600
                  }}>Sistem AR-Hafalan v2.0</Typography.Title>
                  <Typography.Text style={{
                    color: "#64748b",
                    fontSize: 14
                  }}>Yayasan Dashboard - Comprehensive Institution Management</Typography.Text>
                </div>
                <div style={{ textAlign: "right" }}>
                  <Typography.Text style={{
                    color: "#64748b",
                    fontSize: 14,
                    display: "block"
                  }}>Auto-refresh: 30s • Last updated</Typography.Text>
                  <Typography.Text style={{
                    color: "#1e293b",
                    fontWeight: 500,
                    fontSize: 14
                  }}>{lastUpdate.toLocaleTimeString()}</Typography.Text>
                </div>
              </div>
            </Card>
          </>
        )}
      </div>
    </LayoutApp>
  );
}