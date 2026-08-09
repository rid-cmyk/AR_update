 
"use client";

import React, { useEffect } from "react";
import { Row, Col, Card, List, Avatar, Typography, Space, Button, Tag } from "antd";
import {
  UserOutlined,
  BookOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  CalendarOutlined,
  PlusOutlined,
  TrophyOutlined,
  AimOutlined,
} from "@ant-design/icons";
import PageHeader from "@/components/layout/PageHeader";
import StatCard from "@/components/layout/StatCard";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useVisibilityAwareRefresh } from "@/hooks/useVisibilityAwareRefresh";
import styles from "./GuruDashboard.module.css";
import GuruAbsensiChart from "@/components/guru/dashboard/GuruAbsensiChart";
import GuruPerformanceChart from "@/components/guru/dashboard/GuruPerformanceChart";

const LineChart = dynamic(() => import("recharts").then(mod => mod.LineChart), { ssr: false });
const Line = dynamic(() => import("recharts").then(mod => mod.Line), { ssr: false });
const BarChart = dynamic(() => import("recharts").then(mod => mod.BarChart), { ssr: false });
const Bar = dynamic(() => import("recharts").then(mod => mod.Bar), { ssr: false });
const PieChart = dynamic(() => import("recharts").then(mod => mod.PieChart), { ssr: false });
const Pie = dynamic(() => import("recharts").then(mod => mod.Pie), { ssr: false });
const Cell = dynamic(() => import("recharts").then(mod => mod.Cell), { ssr: false });
const XAxis = dynamic(() => import("recharts").then(mod => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then(mod => mod.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import("recharts").then(mod => mod.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then(mod => mod.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import("recharts").then(mod => mod.ResponsiveContainer), { ssr: false });
const Legend = dynamic(() => import("recharts").then(mod => mod.Legend as any), { ssr: false });

const { Title, Text } = Typography;

interface HalaqahData {
  id: number;
  namaHalaqah: string;
  deskripsi?: string;
  jumlahSantri: number;
  santri: Array<{
    id: number;
    namaLengkap: string;
    username: string;
    targets: Array<{
      id: number;
      surat: string;
      ayatTarget: number;
      deadline: string;
      status: string;
    }>;
  }>;
  jadwal?: Array<{
    id: number;
    hari: string;
    waktuMulai: string;
    waktuSelesai: string;
    materi?: string;
  }>;
}

interface DashboardData {
  halaqah: HalaqahData[];
  totalHalaqah: number;
  totalSantri: number;
}

interface GuruDashboardClientProps {
  dashboardStats: any;
  halaqahData: DashboardData;
}

export default function GuruDashboardClient({ dashboardStats, halaqahData }: GuruDashboardClientProps) {
  const router = useRouter();

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  useVisibilityAwareRefresh(120000);

  const totalSantriAktif = dashboardStats?.overview?.totalSantri || 0;
  const totalHafalanToday = dashboardStats?.overview?.totalHafalanToday || 0;
  const absensiRate = dashboardStats?.overview?.absensiRate || 0;
  const targetTertunda = dashboardStats?.overview?.targetTertunda || 0;
  const absensiHadir = dashboardStats?.overview?.absensiHadir || 0;
  const absensiTidakHadir = dashboardStats?.overview?.absensiTidakHadir || 0;
  const hafalanProgress = dashboardStats?.hafalanProgress || [];
  const hafalanRate = dashboardStats?.overview?.hafalanRate || 0;

  const absensiPieData = [
    { name: 'Hadir', value: absensiHadir, color: '#219ebc' },
    { name: 'Tidak Hadir', value: absensiTidakHadir, color: '#fb8500' }
  ];

  const perfBarData = [
    { name: 'Hafalan Rate', value: hafalanRate, fill: '#219ebc' },
    { name: 'Absensi Rate', value: absensiRate, fill: '#219ebc' },
    { name: 'Target Selesai', value: Math.min(100 - Math.round((targetTertunda / Math.max(totalSantriAktif, 1)) * 100), 100), fill: '#8ecae6' },
    { name: 'Aktifitas Hari Ini', value: Math.min(Math.round((totalHafalanToday / Math.max(totalSantriAktif, 1)) * 100), 100), fill: '#ffb703' }
  ];

  return (
      <div className={styles.container}>
        {/* Header */}
        <PageHeader
          title="Dashboard Guru"
          subtitle="Kelola halaqah dan pantau perkembangan santri Anda"
          breadcrumbs={[{ title: "Guru Dashboard" }]}
          extra={
            <Space>
              <Tag icon={<BookOutlined />} color="green" className={styles.headerTag}>
                Guru Panel
              </Tag>
              <Link href="/guru/hafalan">
                <Button type="primary" icon={<PlusOutlined />} size="large">
                  Input Hafalan
                </Button>
              </Link>
            </Space>
          }
        />

        {/* Statistics Cards */}
            <Row gutter={[12, 12]} className={styles.statRow}>
              <Col xs={12} sm={12} lg={6}>
                <StatCard
                  title="Santri Aktif"
                  value={totalSantriAktif}
                  icon={<UserOutlined />}
                  color="#023047"
                  trend={{ value: 5, isPositive: true, label: "santri baru" }}
                  onClick={() => handleNavigate("/guru/santri")}
                />
              </Col>
              <Col xs={12} sm={12} lg={6}>
                <StatCard
                  title="Hafalan Hari Ini"
                  value={totalHafalanToday}
                  icon={<BookOutlined />}
                  color="#219ebc"
                  trend={{ value: 12, isPositive: true, label: "hafalan baru" }}
                  onClick={() => handleNavigate("/guru/hafalan")}
                />
              </Col>
              <Col xs={12} sm={12} lg={6}>
                <StatCard
                  title="Absensi Rate"
                  value={`${absensiRate}%`}
                  icon={<CheckCircleOutlined />}
                  color={absensiRate >= 80 ? "#219ebc" : "#fb8500"}
                  trend={{ value: 3, isPositive: absensiRate >= 80, label: "vs minggu lalu" }}
                  onClick={() => handleNavigate("/guru/absensi")}
                />
              </Col>
              <Col xs={12} sm={12} lg={6}>
                <StatCard
                  title="Target Tertunda"
                  value={targetTertunda}
                  icon={<ClockCircleOutlined />}
                  color="#ffb703"
                  trend={{ value: 2, isPositive: false, label: "perlu perhatian" }}
                  onClick={() => handleNavigate("/guru/target")}
                />
              </Col>
            </Row>

        {/* Charts Row: Hafalan 7 hari + Absensi Today */}
        <Row gutter={[16, 16]} className={styles.chartRow}>
          <Col xs={24} lg={12}>
            <Card
              title={
                <div className={styles.cardTitleWrapper}>
                  <BookOutlined className={styles.cardTitleIconPrimary} />
                  <span>Hafalan 7 Hari Terakhir</span>
                </div>
              }
              className={styles.cardFullHeight}
            >
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={hafalanProgress} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="date"
                    stroke="#666"
                    fontSize={11}
                    tickFormatter={(val: string) => {
                      const d = new Date(val);
                      return `${d.getDate()}/${d.getMonth() + 1}`;
                    }}
                  />
                  <YAxis stroke="#666" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      background: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                    }}
                    labelFormatter={(val: string) => {
                      const d = new Date(val);
                      return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' });
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="ziyadah" stroke="#219ebc" strokeWidth={3} name="Ziyadah" dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="murajaah" stroke="#219ebc" strokeWidth={3} name="Murajaah" dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          <GuruAbsensiChart absensiHadir={absensiHadir} absensiTidakHadir={absensiTidakHadir} absensiPieData={absensiPieData} />
          </Col>
        </Row>

        {/* Performance Bar Chart */}
        <GuruPerformanceChart perfBarData={perfBarData} />

        {/* Halaqah & Target Information */}
        <Row gutter={[24, 24]} className={styles.chartRow}>
          <Col xs={24}>
            <Card
              title={
                <div className={styles.cardTitleWrapper}>
                  <TeamOutlined className={styles.cardTitleIconPrimary} />
                  <span>Halaqah yang Anda Ajarkan</span>
                </div>
              }
              variant="outlined"
            >
              {halaqahData && halaqahData.halaqah.length > 0 ? (
                <Row gutter={[16, 16]}>
                  {halaqahData.halaqah.map((halaqah) => (
                    <React.Fragment key={halaqah.id}>
                      {/* Card Halaqah */}
                      <Col xs={24} md={12}>
                        <Card
                          size="small"
                          title={
                            <div className={styles.cardTitleWrapper}>
                              <BookOutlined className={styles.cardTitleIconPrimary} />
                              <span style={{ fontSize: '14px' }}>{halaqah.namaHalaqah}</span>
                            </div>
                          }
                          variant="outlined"
                        >
                          <div className={styles.halaqahSantriCountWrapper}>
                            <Text strong className={styles.halaqahSantriCount}>
                              {halaqah.jumlahSantri} Santri
                            </Text>
                          </div>

                          {halaqah.santri && halaqah.santri.length > 0 && (
                            <div>
                              <Text className={styles.listTitle}>
                                Santri yang dididik:
                              </Text>
                              <List
                                size="small"
                                dataSource={halaqah.santri.slice(0, 5)}
                                renderItem={(santri) => (
                                  <List.Item className={styles.listItem}>
                                    <div className={styles.listItemInner}>
                                      <Avatar size="small" icon={<UserOutlined />} className={styles.avatarSpacing} />
                                      <div>
                                        <Text className={styles.santriName}>
                                          {santri.namaLengkap}
                                        </Text>
                                        <br />
                                        <Text className={styles.santriUsername}>
                                          @{santri.username}
                                        </Text>
                                      </div>
                                    </div>
                                  </List.Item>
                                )}
                              />
                              {halaqah.santri.length > 5 && (
                                <Text className={styles.moreText}>
                                  +{halaqah.santri.length - 5} santri lainnya
                                </Text>
                              )}
                            </div>
                          )}

                          {halaqah.jadwal && halaqah.jadwal.length > 0 && (
                            <div className={styles.jadwalListWrapper}>
                              <Text className={styles.listTitle}>
                                Jadwal Halaqah:
                              </Text>
                              <List
                                size="small"
                                dataSource={halaqah.jadwal.slice(0, 3)}
                                renderItem={(jadwal) => (
                                  <List.Item className={styles.listItem}>
                                    <div className={styles.listItemInner}>
                                      <CalendarOutlined className={styles.jadwalIcon} />
                                      <div>
                                        <Text className={styles.jadwalDay}>
                                          {jadwal.hari}
                                        </Text>
                                        <br />
                                        <Text className={styles.jadwalTime}>
                                          {jadwal.waktuMulai} - {jadwal.waktuSelesai}
                                        </Text>
                                      </div>
                                    </div>
                                  </List.Item>
                                )}
                              />
                              {halaqah.jadwal.length > 3 && (
                                <Text className={styles.moreText}>
                                  +{halaqah.jadwal.length - 3} jadwal lainnya
                                </Text>
                              )}
                            </div>
                          )}
                        </Card>
                      </Col>

                      {/* Card Target Hafalan */}
                      <Col xs={24} md={12}>
                        <Card
                          size="small"
                          title={
                            <div className={styles.cardTitleWrapper}>
                              <AimOutlined className={styles.cardTitleIconInfo} />
                              <span style={{ fontSize: '14px' }}>Target Hafalan</span>
                            </div>
                          }
                          variant="outlined"
                          className={styles.cardFullHeight}
                        >
                          {halaqah.santri && halaqah.santri.length > 0 ? (
                            <List
                              size="small"
                              dataSource={halaqah.santri.slice(0, 5)}
                              renderItem={(santri) => {
                                const activeTargets = (santri.targets || []).filter(t => t.status !== 'selesai');
                                const completedTargets = (santri.targets || []).filter(t => t.status === 'selesai');
                                const hasTargets = (santri.targets || []).length > 0;
                                return (
                                  <List.Item className={styles.targetListItem}>
                                    <div className={styles.targetListWrapper}>
                                      <div className={styles.targetUserHeader}>
                                        <Avatar size="small" icon={<UserOutlined />} className={styles.avatarSpacing} />
                                        <Text className={styles.santriName}>
                                          {santri.namaLengkap}
                                        </Text>
                                      </div>
                                      {hasTargets ? (
                                        <div className={styles.targetContentWrapper}>
                                          {activeTargets.length > 0 && activeTargets.slice(0, 2).map((target) => {
                                            const isOverdue = new Date(target.deadline) < new Date();
                                            const deadlineStr = new Date(target.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
                                            return (
                                              <div key={target.id} className={`${styles.targetItem} ${isOverdue ? styles.targetItemOverdue : styles.targetItemActive}`}>
                                                <AimOutlined className={isOverdue ? styles.targetItemIconOverdue : styles.targetItemIconActive} />
                                                <Text className={isOverdue ? styles.targetItemTextOverdue : styles.targetItemTextActive}>
                                                  {target.surat} ({target.ayatTarget} ayat)
                                                </Text>
                                                <Text className={styles.targetItemSubtext}>
                                                  • {isOverdue ? 'terlambat' : `s/d ${deadlineStr}`}
                                                </Text>
                                              </div>
                                            );
                                          })}
                                          {activeTargets.length > 2 && (
                                            <Text className={styles.targetMoreText}>
                                              +{activeTargets.length - 2} target aktif lainnya
                                            </Text>
                                          )}
                                          {completedTargets.length > 0 && (
                                            <Tag color="success" className={styles.targetCompletedTag}>
                                              ✓ {completedTargets.length} selesai
                                            </Tag>
                                          )}
                                        </div>
                                      ) : (
                                        <Text className={styles.targetEmptyText}>
                                          Belum ada target
                                        </Text>
                                      )}
                                    </div>
                                  </List.Item>
                                );
                              }}
                            />
                          ) : (
                            <div className={styles.emptyTargetContainer}>
                              <AimOutlined className={styles.emptyTargetIcon} />
                              <div className={styles.emptyTargetText}>Belum ada data target</div>
                            </div>
                          )}
                        </Card>
                      </Col>
                    </React.Fragment>
                  ))}
                </Row>
              ) : (
                <div className={styles.emptyHalaqahContainer}>
                  <TeamOutlined className={styles.emptyHalaqahIcon} />
                  <div>
                    <Text className={styles.emptyHalaqahTextMain}>Belum ada halaqah yang ditugaskan</Text>
                    <br />
                    <Text className={styles.emptyHalaqahTextSub}>
                      Admin akan menugaskan halaqah kepada Anda
                    </Text>
                  </div>
                </div>
              )}
            </Card>
          </Col>
        </Row>
      </div>
  );
}