"use client";

import { useEffect, useState } from "react";
import { Row, Col, Card, Statistic, Space, Spin, Progress, Button, List, Avatar } from "antd";
import {
  UserOutlined,
  TeamOutlined,
  BookOutlined,
  CalendarOutlined,
  TrophyOutlined,
  BarChartOutlined,
  FileTextOutlined,
  PieChartOutlined,
  UserSwitchOutlined,
  BarChartOutlined as BarChartIcon,
} from "@ant-design/icons";
import LayoutApp from "@/components/layout/LayoutApp";
import PengumumanWidget from "@/components/pengumuman/PengumumanWidget";
import { useRouter } from "next/navigation";

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
  const router = useRouter();

  // Fetch yayasan dashboard data
  const fetchDashboardData = async () => {
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <LayoutApp>
      <div style={{ padding: "24px", maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ marginBottom: 32, textAlign: 'center' }}>
          <h1 style={{ marginBottom: 8, color: '#1f2937', fontSize: '28px', fontWeight: 'bold' }}>
            📊 Dashboard Yayasan
          </h1>
          <p style={{ margin: 0, color: "#6b7280", fontSize: '16px' }}>
            Comprehensive overview of all halaqah activities and performance
          </p>
        </div>

        {/* Navigation Menu */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={6}>
            <Card
              hoverable
              style={{ textAlign: 'center', cursor: 'pointer' }}
              onClick={() => router.push('/yayasan/dashboard')}
            >
              <BarChartOutlined style={{ fontSize: '32px', color: '#1890ff', marginBottom: 8 }} />
              <div style={{ fontWeight: 'bold', color: '#1890ff' }}>Dashboard</div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card
              hoverable
              style={{ textAlign: 'center', cursor: 'pointer' }}
              onClick={() => router.push('/yayasan/laporan')}
            >
              <PieChartOutlined style={{ fontSize: '32px', color: '#722ed1', marginBottom: 8 }} />
              <div style={{ fontWeight: 'bold', color: '#722ed1' }}>📈 Laporan Global</div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card
              hoverable
              style={{ textAlign: 'center', cursor: 'pointer' }}
              onClick={() => router.push('/yayasan/santri')}
            >
              <UserSwitchOutlined style={{ fontSize: '32px', color: '#52c41a', marginBottom: 8 }} />
              <div style={{ fontWeight: 'bold', color: '#52c41a' }}>📖 Detail Per Santri</div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card
              hoverable
              style={{ textAlign: 'center', cursor: 'pointer' }}
              onClick={() => router.push('/yayasan/raport')}
            >
              <FileTextOutlined style={{ fontSize: '32px', color: '#fa8c16', marginBottom: 8 }} />
              <div style={{ fontWeight: 'bold', color: '#fa8c16' }}>📑 Raport Tahfidz</div>
            </Card>
          </Col>
        </Row>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', background: '#fafafa', borderRadius: '12px', margin: '20px 0' }}>
            <Spin size="large" />
            <p style={{ marginTop: 16, color: '#6b7280', fontSize: '16px' }}>Loading dashboard data...</p>
          </div>
        ) : (
          <>
            {/* Statistics Cards */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
              <Col xs={24} sm={12} md={4}>
                <Card style={{ textAlign: 'center', border: '2px solid #1890ff' }}>
                  <Statistic
                    title="Total Santri"
                    value={dashboardData?.overview?.totalSantri || 0}
                    prefix={<UserOutlined />}
                    valueStyle={{ color: "#1890ff", fontSize: '24px', fontWeight: 'bold' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={4}>
                <Card style={{ textAlign: 'center', border: '2px solid #722ed1' }}>
                  <Statistic
                    title="Total Guru"
                    value={dashboardData?.overview?.totalGuru || 0}
                    prefix={<TeamOutlined />}
                    valueStyle={{ color: "#722ed1", fontSize: '24px', fontWeight: 'bold' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={4}>
                <Card style={{ textAlign: 'center', border: '2px solid #52c41a' }}>
                  <Statistic
                    title="Total Halaqah"
                    value={dashboardData?.overview?.totalHalaqah || 0}
                    prefix={<BookOutlined />}
                    valueStyle={{ color: "#52c41a", fontSize: '24px', fontWeight: 'bold' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={4}>
                <Card style={{ textAlign: 'center', border: '2px solid #fa8c16' }}>
                  <Statistic
                    title="Pengumuman"
                    value={dashboardData?.overview?.totalPengumuman || 0}
                    prefix={<CalendarOutlined />}
                    valueStyle={{ color: "#fa8c16", fontSize: '24px', fontWeight: 'bold' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={4}>
                <Card style={{ textAlign: 'center', border: '2px solid #eb2f96' }}>
                  <Statistic
                    title="Attendance Rate"
                    value={dashboardData?.performance?.attendanceRate || 0}
                    suffix="%"
                    prefix={<TrophyOutlined />}
                    valueStyle={{ color: "#eb2f96", fontSize: '24px', fontWeight: 'bold' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={4}>
                <Card style={{ textAlign: 'center', border: '2px solid #13c2c2' }}>
                  <Statistic
                    title="Hafalan Rate"
                    value={dashboardData?.performance?.hafalanRate || 0}
                    suffix="%"
                    prefix={<BarChartOutlined />}
                    valueStyle={{ color: "#13c2c2", fontSize: '24px', fontWeight: 'bold' }}
                  />
                </Card>
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
          </>
        )}
      </div>
    </LayoutApp>
  );
}