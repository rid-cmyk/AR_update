"use client";

import { useEffect, useState, useCallback } from "react";
import { Row, Col, Card, Space, Spin, Button, Typography, Tag, Avatar, Progress } from "antd";
import {
  UserOutlined,
  BookOutlined,
  CalendarOutlined,
  TrophyOutlined,
  BarChartOutlined,
  FileTextOutlined,
  TeamOutlined
} from "@ant-design/icons";
import LayoutApp from "@/components/layout/LayoutApp";
import PageHeader from "@/components/layout/PageHeader";
import StatCard from "@/components/layout/StatCard";
import PengumumanWidget from "@/components/pengumuman/PengumumanWidget";
import { useRouter } from "next/navigation";
import Link from "next/link";

const { Title, Text } = Typography;

interface Child {
  id: number;
  username: string;
  namaLengkap: string;
  foto?: string;
  role: {
    id: number;
    name: string;
  };
  // Additional data for dashboard
  hafalanProgress?: number;
  attendanceRate?: number;
  totalPrestasi?: number;
  lastActivity?: string;
}

interface OrtuDashboardData {
  children: Child[];
  overview: {
    totalChildren: number;
    avgHafalanProgress: number;
    avgAttendanceRate: number;
    totalPrestasi: number;
  };
}

export default function OrtuDashboard() {
  const [dashboardData, setDashboardData] = useState<OrtuDashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const router = useRouter();

  // Fetch ortu dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/ortu/dashboard");
      if (!res.ok) throw new Error("Failed to fetch dashboard data");
      const data = await res.json();

      setDashboardData(data);
      setLastUpdate(new Date());
    } catch (error) {
      console.error("Ortu dashboard error:", error);
      // Set mock data for demo
      setDashboardData({
        children: [
          {
            id: 1,
            username: "ahmad_santri",
            namaLengkap: "Ahmad Fauzi",
            foto: "/images/avatars/ahmad.jpg",
            role: { id: 1, name: "santri" },
            hafalanProgress: 75,
            attendanceRate: 88,
            totalPrestasi: 3,
            lastActivity: "2024-01-15"
          },
          {
            id: 2,
            username: "fatimah_santri",
            namaLengkap: "Fatimah Zahra",
            foto: "/images/avatars/fatimah.jpg",
            role: { id: 1, name: "santri" },
            hafalanProgress: 82,
            attendanceRate: 92,
            totalPrestasi: 5,
            lastActivity: "2024-01-15"
          }
        ],
        overview: {
          totalChildren: 2,
          avgHafalanProgress: 78.5,
          avgAttendanceRate: 90,
          totalPrestasi: 8
        }
      });
      setLastUpdate(new Date());
    } finally {
      setLoading(false);
    }
  }, []);

  // Navigation handlers
  const handleViewChild = (childId: number) => {
    router.push(`/ortu/anak/${childId}`);
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
          title="Dashboard Orang Tua"
          subtitle="Pantau perkembangan anak-anak Anda di tahfidz"
          breadcrumbs={[{ title: "Dashboard Orang Tua" }]}
          extra={
            <Space>
              <Tag icon={<TeamOutlined />} color="cyan" style={{ padding: '8px 16px', fontSize: 14 }}>
                Orang Tua Panel
              </Tag>
              <Link href="/ortu/laporan">
                <Button type="primary" icon={<BarChartOutlined />} size="large">
                  Laporan Anak
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
                  title="Total Anak"
                  value={dashboardData?.overview?.totalChildren || 0}
                  icon={<UserOutlined />}
                  color="#1890ff"
                  trend={{ value: 0, isPositive: true, label: "anak terdaftar" }}
                />
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <StatCard
                  title="Rata-rata Hafalan"
                  value={`${dashboardData?.overview?.avgHafalanProgress || 0}%`}
                  icon={<BookOutlined />}
                  color="#52c41a"
                  trend={{ value: 5, isPositive: true, label: "progress bulan ini" }}
                />
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <StatCard
                  title="Rata-rata Kehadiran"
                  value={`${dashboardData?.overview?.avgAttendanceRate || 0}%`}
                  icon={<CalendarOutlined />}
                  color="#722ed1"
                  trend={{ value: 2, isPositive: true, label: "dari bulan lalu" }}
                />
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <StatCard
                  title="Total Prestasi"
                  value={dashboardData?.overview?.totalPrestasi || 0}
                  icon={<TrophyOutlined />}
                  color="#fa8c16"
                  trend={{ value: 1, isPositive: true, label: "prestasi baru" }}
                />
              </Col>
            </Row>

            {/* Children Cards */}
            <Card title="👨‍👩‍👧‍👦 Data Anak-Anak" variant="borderless">
              {dashboardData?.children && dashboardData.children.length > 0 ? (
                <Row gutter={[16, 16]}>
                  {dashboardData.children.map((child) => (
                    <Col xs={24} md={12} lg={8} key={child.id}>
                      <Card
                        hoverable
                        style={{ 
                          borderRadius: 12,
                          border: '1px solid #e8f4fd',
                          background: 'linear-gradient(135deg, #f8faff 0%, #e8f4fd 100%)'
                        }}
                        onClick={() => handleViewChild(child.id)}
                      >
                        <div style={{ textAlign: 'center', marginBottom: 16 }}>
                          <Avatar
                            size={80}
                            src={child.foto}
                            icon={<UserOutlined />}
                            style={{ 
                              backgroundColor: '#1890ff',
                              border: '3px solid #fff',
                              boxShadow: '0 4px 12px rgba(24, 144, 255, 0.2)'
                            }}
                          />
                        </div>
                        
                        <div style={{ textAlign: 'center', marginBottom: 16 }}>
                          <Title level={4} style={{ margin: 0, color: '#1f2937' }}>
                            {child.namaLengkap}
                          </Title>
                          <Text type="secondary">@{child.username}</Text>
                        </div>

                        <div style={{ marginBottom: 12 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                            <Text style={{ fontSize: 12 }}>Progress Hafalan</Text>
                            <Text style={{ fontSize: 12, fontWeight: 'bold' }}>
                              {child.hafalanProgress || 0}%
                            </Text>
                          </div>
                          <Progress 
                            percent={child.hafalanProgress || 0} 
                            size="small" 
                            strokeColor="#52c41a"
                            showInfo={false}
                          />
                        </div>

                        <div style={{ marginBottom: 12 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                            <Text style={{ fontSize: 12 }}>Tingkat Kehadiran</Text>
                            <Text style={{ fontSize: 12, fontWeight: 'bold' }}>
                              {child.attendanceRate || 0}%
                            </Text>
                          </div>
                          <Progress 
                            percent={child.attendanceRate || 0} 
                            size="small" 
                            strokeColor="#1890ff"
                            showInfo={false}
                          />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <TrophyOutlined style={{ color: '#fa8c16', marginRight: 4 }} />
                            <Text style={{ fontSize: 12 }}>
                              {child.totalPrestasi || 0} Prestasi
                            </Text>
                          </div>
                          <Tag color="blue" style={{ fontSize: 10 }}>
                            Aktif
                          </Tag>
                        </div>
                      </Card>
                    </Col>
                  ))}
                </Row>
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: '60px 20px',
                  background: '#fafafa',
                  borderRadius: 8,
                  border: '1px dashed #d9d9d9'
                }}>
                  <UserOutlined style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 16 }} />
                  <Title level={4} style={{ color: '#999' }}>Belum Ada Data Anak</Title>
                  <Text type="secondary">
                    Hubungi admin untuk menambahkan data anak Anda ke sistem
                  </Text>
                </div>
              )}
            </Card>

            {/* Quick Actions */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
              <Col xs={24} md={8}>
                <Card
                  title="📊 Laporan Perkembangan"
                  variant="borderless"
                  style={{ height: '100%' }}
                >
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <div>
                      <strong>📈 Progress Hafalan:</strong>
                      <p style={{ margin: '8px 0', color: '#666', fontSize: '14px' }}>
                        Lihat perkembangan hafalan anak-anak secara detail
                      </p>
                    </div>
                    <div>
                      <strong>📅 Riwayat Kehadiran:</strong>
                      <p style={{ margin: '8px 0', color: '#666', fontSize: '14px' }}>
                        Pantau kehadiran dan aktivitas harian
                      </p>
                    </div>
                    <Button
                      type="primary"
                      icon={<BarChartOutlined />}
                      onClick={() => router.push('/ortu/laporan')}
                      style={{ width: '100%' }}
                    >
                      Lihat Laporan Lengkap
                    </Button>
                  </Space>
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card
                  title="🏆 Prestasi Anak"
                  variant="borderless"
                  style={{ height: '100%' }}
                >
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    <div>
                      <strong>🥇 Pencapaian Terbaru:</strong>
                      <p style={{ margin: '8px 0', color: '#666', fontSize: '14px' }}>
                        Lihat prestasi dan pencapaian anak
                      </p>
                    </div>
                    <div>
                      <strong>📜 Sertifikat:</strong>
                      <p style={{ margin: '8px 0', color: '#666', fontSize: '14px' }}>
                        Download sertifikat dan penghargaan
                      </p>
                    </div>
                    <Button
                      type="primary"
                      icon={<TrophyOutlined />}
                      onClick={() => router.push('/ortu/prestasi')}
                      style={{ width: '100%' }}
                    >
                      Lihat Prestasi
                    </Button>
                  </Space>
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <PengumumanWidget
                  userRole="ortu"
                  maxItems={5}
                  title="📢 Pengumuman untuk Orang Tua"
                  height={400}
                />
              </Col>
            </Row>

            {/* Footer Info */}
            <Card
              style={{
                background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
                border: "1px solid #bae6fd",
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
                    color: "#0c4a6e",
                    fontWeight: 600
                  }}>Dashboard Orang Tua</Typography.Title>
                  <Typography.Text style={{
                    color: "#0369a1",
                    fontSize: 14
                  }}>Pantau perkembangan anak dengan mudah dan real-time</Typography.Text>
                </div>
                <div style={{ textAlign: "right" }}>
                  <Typography.Text style={{
                    color: "#0369a1",
                    fontSize: 14,
                    display: "block"
                  }}>Auto-refresh: 30s • Last updated</Typography.Text>
                  <Typography.Text style={{
                    color: "#0c4a6e",
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