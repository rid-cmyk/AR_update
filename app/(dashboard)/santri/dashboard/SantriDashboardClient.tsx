"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Row,
  Col,
  Card,
  Progress,
  Typography,
  List,
  Tag,
  Button,
  Space,
  Select,
  Empty
} from "antd";
import {
  BookOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FireOutlined,
  UserOutlined,
  AimOutlined,
  TeamOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import AdminHeaderCard from "@/components/super-admin/layout/AdminHeaderCard";
import StatCard from "@/components/layout/StatCard";
import AbsensiSummary from "@/components/santri/AbsensiSummary";
import TargetHafalanCard from "@/components/santri/dashboard/TargetHafalanCard";
import RecentActivityCard from "@/components/santri/dashboard/RecentActivityCard";
import AnnouncementList from "@/components/layout/AnnouncementList";
import dayjs from "dayjs";
import Link from "next/link";
import { useVisibilityAwareRefresh } from "@/hooks/useVisibilityAwareRefresh";
import dynamic from "next/dynamic";
import styles from "./SantriDashboard.module.css";
import { SantriTargetCards } from "../hafalan/target/SantriTargetCards";
import SantriQuickActions from "@/components/santri/dashboard/SantriQuickActions";

const LineChart = dynamic(() => import("recharts").then(mod => mod.LineChart), { ssr: false });
const XAxis = dynamic(() => import("recharts").then(mod => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then(mod => mod.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import("recharts").then(mod => mod.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then(mod => mod.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import("recharts").then(mod => mod.ResponsiveContainer), { ssr: false });
const Line = dynamic(() => import("recharts").then(mod => mod.Line), { ssr: false });

const { Text } = Typography;

interface HafalanProgress {
  date: string;
  ziyadah: number;
  murajaah: number;
  total: number;
}

interface RecentHafalan {
  id: number;
  tanggal: string;
  jenis: 'ziyadah' | 'murajaah';
  surah: string;
  ayat: string;
  guru: string;
}

interface TargetHafalan {
  id: number;
  judul: string;
  deskripsi: string;
  targetAyat: number;
  currentAyat: number;
  deadline: string;
  status: 'active' | 'completed' | 'overdue';
  kategori: 'ziyadah' | 'murajaah';
  progress?: number;
}

interface HalaqahInfo {
  namaHalaqah: string;
  guru: string;
  jadwal: Array<{
    id: number;
    hari: string;
    waktuMulai: string;
    waktuSelesai: string;
    materi: string | null;
  }>;
}

interface SantriDashboardClientProps {
  hafalanProgress: HafalanProgress[];
  recentHafalan: RecentHafalan[];
  targets: TargetHafalan[];
  halaqahInfo: HalaqahInfo | null;
  totalSetoran: number;
  activeTargets: number;
  totalTargetProgress: number;
}

export default function SantriDashboardClient({
  hafalanProgress,
  recentHafalan,
  targets,
  halaqahInfo,
  totalSetoran,
  activeTargets,
  totalTargetProgress
}: SantriDashboardClientProps) {
  const router = useRouter();

  // Navigation handlers
  const handleNavigate = (path: string) => {
    router.push(path);
  };

  useVisibilityAwareRefresh(120000);

  return (
    <>
      <div className={styles.dashboardContainer}>
        {/* Header */}
        <AdminHeaderCard
          title="Dashboard Santri"
          subtitle="Pantau progres hafalan dan pencapaian target yang telah diinput oleh guru Anda"
          tags={[
            { label: "Santri Panel", icon: <BookOutlined /> },
            { label: "Online", icon: <ClockCircleOutlined /> }
          ]}
          actions={
            <Space>
              <Tag icon={<BookOutlined />} color="cyan" style={{ padding: '8px 16px', fontSize: 14 }}>
                Santri Panel
              </Tag>
              <Link href="/santri/hafalan">
                <Button type="primary" icon={<EyeOutlined />} size="large">
                  Lihat Hafalan
                </Button>
              </Link>
            </Space>
          }
        />

        {/* Statistics Cards */}
        <Row gutter={[24, 24]} className={styles.sectionRow}>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Total Setoran"
              value={totalSetoran}
              icon={<BookOutlined />}
              color="#219ebc"
              trend={{ value: 5, isPositive: true, label: "setoran baru" }}
              onClick={() => handleNavigate("/santri/hafalan")}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Target Aktif"
              value={activeTargets}
              icon={<AimOutlined />}
              color="#219ebc"
              trend={{ value: 2, isPositive: true, label: "target baru" }}
              onClick={() => handleNavigate("/santri/target")}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Progress Target"
              value={`${totalTargetProgress}%`}
              icon={<CheckCircleOutlined />}
              color={totalTargetProgress >= 80 ? "#219ebc" : totalTargetProgress >= 50 ? "#ffb703" : "#fb8500"}
              trend={{ value: 8, isPositive: totalTargetProgress >= 50, label: "vs minggu lalu" }}
              onClick={() => handleNavigate("/santri/target")}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Streak Days"
              value={hafalanProgress.filter(day => day.total > 0).length}
              icon={<FireOutlined />}
              color="#8ecae6"
              trend={{ value: 3, isPositive: true, label: "hari berturut" }}
              onClick={() => handleNavigate("/santri/hafalan")}
            />
          </Col>
        </Row>

        {/* Halaqah Information */}
        {halaqahInfo ? (
          <Row gutter={[24, 24]} className={styles.sectionRow}>
            <Col xs={24}>
              <Card
                title={
                  <div className={styles.cardTitleWrapper}>
                    <TeamOutlined className={styles.cardTitleIcon} />
                    <span>Informasi Halaqah Anda</span>
                  </div>
                }
                variant="outlined"
              >
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={12} lg={8}>
                    <Card
                      size="small"
                      title={
                        <div className={styles.cardTitleWrapper}>
                          <BookOutlined className={styles.cardTitleIcon} />
                          <span style={{ fontSize: '14px' }}>{halaqahInfo.namaHalaqah}</span>
                        </div>
                      }
                      variant="outlined"
                    >
                      <div className={styles.halaqahGuruWrapper}>
                        <Text className={styles.halaqahGuruText}>
                          Guru: {halaqahInfo.guru}
                        </Text>
                      </div>

                      {halaqahInfo.jadwal && halaqahInfo.jadwal.length > 0 && (
                        <div>
                          <Text className={styles.jadwalTitle}>
                            Jadwal Halaqah:
                          </Text>
                          <List
                            size="small"
                            dataSource={halaqahInfo.jadwal.slice(0, 3)}
                            renderItem={(jadwal) => (
                              <List.Item className={styles.jadwalItem}>
                                <div className={styles.jadwalItemInner}>
                                  <CalendarOutlined className={styles.jadwalIcon} />
                                  <div>
                                    <Text className={styles.jadwalDay}>
                                      {jadwal.hari}
                                    </Text>
                                    <br />
                                    <Text className={styles.jadwalTime}>
                                      {jadwal.waktuMulai} - {jadwal.waktuSelesai}
                                      {jadwal.materi && ` • ${jadwal.materi}`}
                                    </Text>
                                  </div>
                                </div>
                              </List.Item>
                            )}
                          />
                          {halaqahInfo.jadwal.length > 3 && (
                            <Text className={styles.jadwalMore}>
                              +{halaqahInfo.jadwal.length - 3} jadwal lainnya
                            </Text>
                          )}
                        </div>
                      )}
                    </Card>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>
        ) : (
          <Row gutter={[24, 24]} className={styles.sectionRow}>
            <Col xs={24}>
              <Card
                title={
                  <div className={styles.cardTitleWrapper}>
                    <TeamOutlined className={styles.cardTitleIcon} />
                    <span>Informasi Halaqah Anda</span>
                  </div>
                }
                variant="outlined"
              >
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    <div>
                      <Text type="secondary">Belum ada halaqah yang ditugaskan</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        Admin akan menugaskan Anda ke halaqah
                      </Text>
                    </div>
                  }
                />
              </Card>
            </Col>
          </Row>
        )}

        {/* Absensi Summary Section */}
        <Row gutter={[24, 24]} className={styles.sectionRow}>
          <Col xs={24}>
            <Card
              title={
                <div className={styles.cardTitleWrapper}>
                  <CalendarOutlined className={styles.cardTitleIcon} />
                  <span>Ringkasan Kehadiran Anda</span>
                </div>
              }
              extra={
                <Button 
                  type="link" 
                  href="/santri/absensi"
                  style={{ color: '#219ebc' }}
                >
                  Lihat Detail →
                </Button>
              }
              variant="outlined"
            >
              <AbsensiSummary showRecent={true} limit={5} />
            </Card>
          </Col>
        </Row>

        {/* Quick Actions and Pengumuman */}
        <SantriQuickActions 
          totalSetoran={totalSetoran}
          activeTargets={activeTargets}
          totalTargetProgress={totalTargetProgress}
          hafalanProgress={hafalanProgress}
        />

        {/* Main Content */}
        <Row gutter={[32, 32]}>
          {/* Progress Chart */}
          <Col xs={24} xl={14}>
            <Card
              title={
                <div className={styles.chartCardTitleWrapper}>
                  <div className={styles.chartTitleDot} />
                  <span className={styles.chartTitleText}>
                    📊 Grafik Progress Hafalan
                  </span>
                  <Tag
                    color="blue"
                    className={styles.chartTag}
                  >
                    7 Hari Terakhir
                  </Tag>
                </div>
              }
              className={styles.chartCard}
              styles={{
                body: {
                  padding: '40px',
                  background: 'transparent',
                  position: 'relative',
                  zIndex: 2
                }
              }}
            >
              <div className={styles.chartBgCircle} />
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={hafalanProgress} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="date"
                    stroke="#666"
                    fontSize={12}
                    tickFormatter={(value) => dayjs(value).format('DD/MM')}
                  />
                  <YAxis stroke="#666" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      background: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                    }}
                    labelFormatter={(value) => `Tanggal: ${dayjs(value).format('DD/MM/YYYY')}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="ziyadah"
                    stroke="#4A90E2"
                    strokeWidth={4}
                    name="Ziyadah"
                    dot={{ fill: '#4A90E2', strokeWidth: 2, r: 6 }}
                    activeDot={{ r: 8, stroke: '#4A90E2', strokeWidth: 2 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="murajaah"
                    stroke="#50E3C2"
                    strokeWidth={4}
                    name="Murajaah"
                    dot={{ fill: '#50E3C2', strokeWidth: 2, r: 6 }}
                    activeDot={{ r: 8, stroke: '#50E3C2', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>

              <div className={styles.chartLegendWrapper}>
                <div className={styles.chartLegendItem}>
                  <div className={styles.chartLegendDotZiyadah} />
                  <Text className={styles.chartLegendText}>Ziyadah</Text>
                </div>
                <div className={styles.chartLegendItem}>
                  <div className={styles.chartLegendDotMurajaah} />
                  <Text className={styles.chartLegendText}>Murajaah</Text>
                </div>
              </div>
            </Card>
          </Col>

          {/* Target Progress & Recent Activity */}
          <Col xs={24} xl={10}>
            {/* Target Progress */}
            <TargetHafalanCard targets={targets} />
            <RecentActivityCard recentHafalan={recentHafalan} />
          </Col>
        </Row>
      </div>
    </>
  );
}
