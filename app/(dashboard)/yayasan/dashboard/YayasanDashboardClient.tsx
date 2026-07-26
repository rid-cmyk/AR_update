"use client";

import { useEffect, useState } from "react";
import { Row, Col, Card, Space, Progress, Button, Typography, Tag } from "antd";
import {
  UserOutlined,
  TeamOutlined,
  BookOutlined,
  CalendarOutlined,
  TrophyOutlined,
  BarChartOutlined,
  FileTextOutlined,
  UserSwitchOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import AdminHeaderCard from "@/components/admin/layout/AdminHeaderCard";
import StatCard from "@/components/layout/StatCard";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";

const Cell = dynamic(() => import("recharts").then(mod => mod.Cell), { ssr: false });
const LineChart = dynamic(() => import("recharts").then(mod => mod.LineChart), { ssr: false });
const Line = dynamic(() => import("recharts").then(mod => mod.Line), { ssr: false });
const BarChart = dynamic(() => import("recharts").then(mod => mod.BarChart), { ssr: false });
const Bar = dynamic(() => import("recharts").then(mod => mod.Bar), { ssr: false });
const XAxis = dynamic(() => import("recharts").then(mod => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then(mod => mod.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import("recharts").then(mod => mod.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then(mod => mod.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import("recharts").then(mod => mod.ResponsiveContainer), { ssr: false });
const Legend = dynamic(() => import("recharts").then(mod => mod.Legend as any), { ssr: false });

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
  userDistribution?: Record<string, number>;
  rapotStats?: {
    totalUjian: number;
    avgNilai: number;
    selesaiCount: number;
    rapotBarData: Array<{ grade: string; jumlah: number; fill: string }>;
    raportData: Array<{ nama: string; nilaiRataRata: number | null; ranking: number | null }>;
  };
  monthlyTrend: Array<{ month: string; hafalan: number; absensi: number }>;
  halaqahStats: Array<{
    id: number;
    namaHalaqah: string;
    santriCount: number;
  }>;
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

export default function YayasanDashboardClient({ data }: { data: YayasanDashboardData }) {
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const router = useRouter();

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && !document.hidden) {
        router.refresh();
        setLastUpdate(new Date());
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [router]);

  const rapotStats = data.rapotStats;
  const rapotBarData = rapotStats?.rapotBarData || [];

  const halaqahBarData = (data.halaqahStats || []).map(h => ({
    name: h.namaHalaqah.length > 12 ? h.namaHalaqah.substring(0, 12) + '...' : h.namaHalaqah,
    santri: h.santriCount
  }));

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
        {/* Header */}
        <AdminHeaderCard
          title="Dashboard Yayasan"
          subtitle="Comprehensive overview of all halaqah activities and performance"
          tags={[
            { label: "Yayasan Panel", icon: <TeamOutlined /> },
            { label: "Online", icon: <ClockCircleOutlined /> }
          ]}
          actions={
            <Space>
              <Tag icon={<TeamOutlined />} color="purple" style={{ padding: '8px 16px', fontSize: 14 }}>
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

        {/* Statistics Cards */}
        <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Total Santri"
              value={data.overview.totalSantri}
              icon={<UserOutlined />}
              color="#1890ff"
              onClick={() => handleNavigate("/yayasan/santri")}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Total Guru"
              value={data.overview.totalGuru}
              icon={<TeamOutlined />}
              color="#722ed1"
              onClick={() => handleNavigate("/yayasan/guru")}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Total Halaqah"
              value={data.overview.totalHalaqah}
              icon={<BookOutlined />}
              color="#52c41a"
              onClick={() => handleNavigate("/yayasan/halaqah")}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Rata-rata Hafalan"
              value={`${data.overview.overallHafalanProgress}%`}
              icon={<BookOutlined />}
              color="#fa8c16"
              onClick={() => handleNavigate("/yayasan/laporan?type=hafalan")}
            />
          </Col>
        </Row>

        {/* Grafik Rapot & Nilai */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24}>
            <Card
              title={
                <Space>
                  <TrophyOutlined />
                  <span>Grafik Rapot &amp; Nilai</span>
                </Space>
              }
            >
              {rapotBarData.length > 0 ? (
                <>
                  <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
                    <Col xs={24} sm={8}>
                      <div style={{ textAlign: 'center', padding: '16px', background: '#f0f5ff', borderRadius: 12, border: '1px solid #d6e4ff' }}>
                        <div style={{ fontSize: 32, fontWeight: 700, color: '#1890ff' }}>{rapotStats?.totalUjian || 0}</div>
                        <div style={{ fontSize: 13, color: '#666' }}>Total Ujian</div>
                      </div>
                    </Col>
                    <Col xs={24} sm={8}>
                      <div style={{ textAlign: 'center', padding: '16px', background: '#f6ffed', borderRadius: 12, border: '1px solid #b7eb8f' }}>
                        <div style={{ fontSize: 32, fontWeight: 700, color: '#52c41a' }}>{rapotStats?.avgNilai || 0}</div>
                        <div style={{ fontSize: 13, color: '#666' }}>Rata-rata Nilai</div>
                      </div>
                    </Col>
                    <Col xs={24} sm={8}>
                      <div style={{ textAlign: 'center', padding: '16px', background: '#fff7e6', borderRadius: 12, border: '1px solid #ffd591' }}>
                        <div style={{ fontSize: 32, fontWeight: 700, color: '#fa8c16' }}>{rapotStats?.selesaiCount || 0}</div>
                        <div style={{ fontSize: 13, color: '#666' }}>Selesai</div>
                      </div>
                    </Col>
                  </Row>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={rapotBarData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="grade" stroke="#666" fontSize={13} />
                      <YAxis stroke="#666" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          background: 'white',
                          border: 'none',
                          borderRadius: '12px',
                          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                        }}
                        formatter={(value: any) => [`${value} ujian`, 'Jumlah']}
                      />
                      <Legend />
                      <Bar dataKey="jumlah" radius={[6, 6, 0, 0]} name="Jumlah Ujian">
                        {rapotBarData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 12 }}>
                    {rapotBarData.map((item) => (
                      <Tag key={item.grade} color={item.fill} style={{ fontSize: 12, padding: '2px 10px' }}>{item.grade}: {item.jumlah}</Tag>
                    ))}
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '60px 0', color: '#bbb' }}>
                  <TrophyOutlined style={{ fontSize: 48, marginBottom: 16, opacity: 0.4 }} />
                  <div style={{ fontSize: 14 }}>Belum ada data ujian</div>
                </div>
              )}
            </Card>
          </Col>
        </Row>

        {/* Tren Bulanan */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24}>
            <Card
              title={
                <Space>
                  <BarChartOutlined />
                  <span>Tren Bulanan</span>
                </Space>
              }
            >
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.monthlyTrend || []} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" stroke="#666" fontSize={11} />
                  <YAxis stroke="#666" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      background: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="hafalan" stroke="#1890ff" strokeWidth={3} name="Hafalan" dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="absensi" stroke="#52c41a" strokeWidth={3} name="Absensi" dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>

        {/* Halaqah Bar Chart */}
        {halaqahBarData.length > 0 && (
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24}>
              <Card
                title={
                  <Space>
                    <TeamOutlined />
                    <span>Santri per Halaqah</span>
                  </Space>
                }
              >
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={halaqahBarData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" stroke="#666" fontSize={11} />
                    <YAxis stroke="#666" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        background: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Bar dataKey="santri" fill="#722ed1" radius={[4, 4, 0, 0]} name="Jumlah Santri" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>
        )}

        {/* Progress Section */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} md={12}>
            <Card title="Overall Attendance Performance" variant="borderless">
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <Progress
                  type="circle"
                  percent={data.performance.attendanceRate}
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
                  percent={data.performance.hafalanRate}
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
                    style={{ textAlign: 'center', cursor: 'pointer', userSelect: 'none' }}
                    onClick={(e) => {
                      e.preventDefault();
                      router.push('/yayasan/laporan?type=hafalan');
                    }}
                  >
                    <BookOutlined style={{ fontSize: '24px', color: '#1890ff', marginBottom: 8 }} />
                    <div style={{ fontWeight: 'bold' }}>Hafalan Santri</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>Progress hafalan keseluruhan</div>
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card
                    hoverable
                    style={{ textAlign: 'center', cursor: 'pointer', userSelect: 'none' }}
                    onClick={(e) => {
                      e.preventDefault();
                      router.push('/yayasan/laporan?type=absensi');
                    }}
                  >
                    <CalendarOutlined style={{ fontSize: '24px', color: '#52c41a', marginBottom: 8 }} />
                    <div style={{ fontWeight: 'bold' }}>Absensi</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>Kehadiran santri</div>
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card
                    hoverable
                    style={{ textAlign: 'center', cursor: 'pointer', userSelect: 'none' }}
                    onClick={(e) => {
                      e.preventDefault();
                      router.push('/yayasan/laporan?type=prestasi');
                    }}
                  >
                    <TrophyOutlined style={{ fontSize: '24px', color: '#fa8c16', marginBottom: 8 }} />
                    <div style={{ fontWeight: 'bold' }}>Prestasi</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>Pencapaian santri</div>
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card
                    hoverable
                    style={{ textAlign: 'center', cursor: 'pointer', userSelect: 'none' }}
                    onClick={(e) => {
                      e.preventDefault();
                      router.push('/yayasan/laporan?type=halaqah');
                    }}
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

        {/* Recent Info Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} md={12}>
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
          <Col xs={24} md={12}>
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
      </div>
    </>
  );
}