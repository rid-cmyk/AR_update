"use client";

import { useEffect } from "react";
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
import YayasanDashboardInfoCards from "@/components/yayasan/dashboard/YayasanDashboardInfoCards";
import StatCard from "@/components/layout/StatCard";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useVisibilityAwareRefresh } from "@/hooks/useVisibilityAwareRefresh";
import styles from "./YayasanDashboard.module.css";

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
  const router = useRouter();

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  useVisibilityAwareRefresh(120000);

  const rapotStats = data.rapotStats;
  const rapotBarData = rapotStats?.rapotBarData || [];

  const halaqahBarData = (data.halaqahStats || []).map(h => ({
    name: h.namaHalaqah.length > 12 ? h.namaHalaqah.substring(0, 12) + '...' : h.namaHalaqah,
    santri: h.santriCount
  }));

  return (
    <>
      <div className={styles.container}>
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
              <Tag icon={<TeamOutlined />} color="purple" className={styles.tagYayasanPanel}>
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
        <Row gutter={[24, 24]} className={styles.statsRow}>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Total Santri"
              value={data.overview.totalSantri}
              icon={<UserOutlined />}
              color="#0dfbdb"
              onClick={() => handleNavigate("/yayasan/santri")}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Total Guru"
              value={data.overview.totalGuru}
              icon={<TeamOutlined />}
              color="#0dfbdb"
              onClick={() => handleNavigate("/yayasan/guru")}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Total Halaqah"
              value={data.overview.totalHalaqah}
              icon={<BookOutlined />}
              color="#0dfbdb"
              onClick={() => handleNavigate("/yayasan/halaqah")}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Rata-rata Hafalan"
              value={`${data.overview.overallHafalanProgress}%`}
              icon={<BookOutlined />}
              color="#0dfbdb"
              onClick={() => handleNavigate("/yayasan/laporan?type=hafalan")}
            />
          </Col>
        </Row>

        {/* Grafik Rapot & Nilai */}
        <Row gutter={[16, 16]} className={styles.sectionRow}>
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
                  <Row gutter={[16, 16]} className={styles.rapotStatsRow}>
                    <Col xs={24} sm={8}>
                      <div className={styles.statBoxPrimary}>
                        <div className={styles.statBoxValuePrimary}>{rapotStats?.totalUjian || 0}</div>
                        <div className={styles.statBoxLabel}>Total Ujian</div>
                      </div>
                    </Col>
                    <Col xs={24} sm={8}>
                      <div className={styles.statBoxSuccess}>
                        <div className={styles.statBoxValuePrimary}>{rapotStats?.avgNilai || 0}</div>
                        <div className={styles.statBoxLabel}>Rata-rata Nilai</div>
                      </div>
                    </Col>
                    <Col xs={24} sm={8}>
                      <div className={styles.statBoxWarning}>
                        <div className={styles.statBoxValueWarning}>{rapotStats?.selesaiCount || 0}</div>
                        <div className={styles.statBoxLabel}>Selesai</div>
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
                  <div className={styles.tagsContainer}>
                    {rapotBarData.map((item) => (
                      <Tag key={item.grade} color={item.fill} className={styles.tagGrade}>{item.grade}: {item.jumlah}</Tag>
                    ))}
                  </div>
                </>
              ) : (
                <div className={styles.emptyState}>
                  <TrophyOutlined className={styles.emptyIcon} />
                  <div className={styles.emptyText}>Belum ada data ujian</div>
                </div>
              )}
            </Card>
          </Col>
        </Row>

        {/* Tren Bulanan */}
        <Row gutter={[16, 16]} className={styles.sectionRow}>
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
                  <Line type="monotone" dataKey="hafalan" stroke="#219ebc" strokeWidth={3} name="Hafalan" dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="absensi" stroke="#219ebc" strokeWidth={3} name="Absensi" dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>

        {/* Halaqah Bar Chart */}
        {halaqahBarData.length > 0 && (
          <Row gutter={[16, 16]} className={styles.sectionRow}>
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
                    <Bar dataKey="santri" fill="#8ecae6" radius={[4, 4, 0, 0]} name="Jumlah Santri" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>
        )}

        {/* Progress Section */}
        <Row gutter={[16, 16]} className={styles.sectionRow}>
          <Col xs={24} md={12}>
            <Card title="Overall Attendance Performance" variant="borderless">
              <div className={styles.progressBox}>
                <Progress
                  type="circle"
                  percent={data.performance.attendanceRate}
                  format={(percent) => `${percent}%`}
                  strokeColor="#219ebc"
                  size={120}
                />
                <p className={styles.progressLabel}>
                  Average attendance across all halaqah
                </p>
              </div>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card title="Overall Hafalan Performance" variant="borderless">
              <div className={styles.progressBox}>
                <Progress
                  type="circle"
                  percent={data.performance.hafalanRate}
                  format={(percent) => `${percent}%`}
                  strokeColor="#219ebc"
                  size={120}
                />
                <p className={styles.progressLabel}>
                  Average hafalan progress across all santri
                </p>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Global Reports Section */}
        <Row gutter={[16, 16]} className={styles.sectionRow}>
          <Col xs={24}>
            <Card title="📈 Laporan Global" variant="borderless">
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={6}>
                  <Card
                    hoverable
                    className={styles.reportCard}
                    onClick={(e) => {
                      e.preventDefault();
                      router.push('/yayasan/laporan?type=hafalan');
                    }}
                  >
                    <BookOutlined className={styles.reportIconPrimary} />
                    <div className={styles.reportTitle}>Hafalan Santri</div>
                    <div className={styles.reportSubtitle}>Progress hafalan keseluruhan</div>
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card
                    hoverable
                    className={styles.reportCard}
                    onClick={(e) => {
                      e.preventDefault();
                      router.push('/yayasan/laporan?type=absensi');
                    }}
                  >
                    <CalendarOutlined className={styles.reportIconPrimary} />
                    <div className={styles.reportTitle}>Absensi</div>
                    <div className={styles.reportSubtitle}>Kehadiran santri</div>
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card
                    hoverable
                    className={styles.reportCard}
                    onClick={(e) => {
                      e.preventDefault();
                      router.push('/yayasan/laporan?type=prestasi');
                    }}
                  >
                    <TrophyOutlined className={styles.reportIconWarning} />
                    <div className={styles.reportTitle}>Prestasi</div>
                    <div className={styles.reportSubtitle}>Pencapaian santri</div>
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card
                    hoverable
                    className={styles.reportCard}
                    onClick={(e) => {
                      e.preventDefault();
                      router.push('/yayasan/laporan?type=halaqah');
                    }}
                  >
                    <TeamOutlined className={styles.reportIconInfo} />
                    <div className={styles.reportTitle}>Per Halaqah</div>
                    <div className={styles.reportSubtitle}>Laporan per halaqah</div>
                  </Card>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>

        {/* Recent Info Cards */}
        <YayasanDashboardInfoCards />
      </div>
    </>
  );
}