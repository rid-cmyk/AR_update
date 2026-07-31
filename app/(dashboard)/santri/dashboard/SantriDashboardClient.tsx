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
import AdminHeaderCard from "@/components/admin/layout/AdminHeaderCard";
import StatCard from "@/components/layout/StatCard";
import AbsensiSummary from "@/components/santri/AbsensiSummary";
import dayjs from "dayjs";
import Link from "next/link";
import { useVisibilityAwareRefresh } from "@/hooks/useVisibilityAwareRefresh";
import dynamic from "next/dynamic";

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
      <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
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
        <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Total Setoran"
              value={totalSetoran}
              icon={<BookOutlined />}
              color="#52c41a"
              trend={{ value: 5, isPositive: true, label: "setoran baru" }}
              onClick={() => handleNavigate("/santri/hafalan")}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Target Aktif"
              value={activeTargets}
              icon={<AimOutlined />}
              color="#1890ff"
              trend={{ value: 2, isPositive: true, label: "target baru" }}
              onClick={() => handleNavigate("/santri/target")}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Progress Target"
              value={`${totalTargetProgress}%`}
              icon={<CheckCircleOutlined />}
              color={totalTargetProgress >= 80 ? "#52c41a" : totalTargetProgress >= 50 ? "#fa8c16" : "#ff4d4f"}
              trend={{ value: 8, isPositive: totalTargetProgress >= 50, label: "vs minggu lalu" }}
              onClick={() => handleNavigate("/santri/target")}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Streak Days"
              value={hafalanProgress.filter(day => day.total > 0).length}
              icon={<FireOutlined />}
              color="#722ed1"
              trend={{ value: 3, isPositive: true, label: "hari berturut" }}
              onClick={() => handleNavigate("/santri/hafalan")}
            />
          </Col>
        </Row>

        {/* Halaqah Information */}
        {halaqahInfo ? (
          <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
            <Col xs={24}>
              <Card
                title={
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <TeamOutlined style={{ marginRight: 8, color: '#1890ff' }} />
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
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <BookOutlined style={{ marginRight: 8, color: '#52c41a' }} />
                          <span style={{ fontSize: '14px' }}>{halaqahInfo.namaHalaqah}</span>
                        </div>
                      }
                      variant="outlined"
                    >
                      <div style={{ marginBottom: 12 }}>
                        <Text strong style={{ color: '#1890ff' }}>
                          Guru: {halaqahInfo.guru}
                        </Text>
                      </div>

                      {halaqahInfo.jadwal && halaqahInfo.jadwal.length > 0 && (
                        <div>
                          <Text style={{ fontSize: '12px', color: '#666', marginBottom: 8, display: 'block' }}>
                            Jadwal Halaqah:
                          </Text>
                          <List
                            size="small"
                            dataSource={halaqahInfo.jadwal.slice(0, 3)}
                            renderItem={(jadwal) => (
                              <List.Item style={{ padding: '4px 0' }}>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                  <CalendarOutlined style={{ fontSize: '12px', color: '#1890ff', marginRight: 8 }} />
                                  <div>
                                    <Text style={{ fontSize: '12px', fontWeight: 'bold' }}>
                                      {jadwal.hari}
                                    </Text>
                                    <br />
                                    <Text style={{ fontSize: '11px', color: '#999' }}>
                                      {jadwal.waktuMulai} - {jadwal.waktuSelesai}
                                      {jadwal.materi && ` • ${jadwal.materi}`}
                                    </Text>
                                  </div>
                                </div>
                              </List.Item>
                            )}
                          />
                          {halaqahInfo.jadwal.length > 3 && (
                            <Text style={{ fontSize: '11px', color: '#999' }}>
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
          <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
            <Col xs={24}>
              <Card
                title={
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <TeamOutlined style={{ marginRight: 8, color: '#1890ff' }} />
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
        <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
          <Col xs={24}>
            <Card
              title={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <CalendarOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                  <span>Ringkasan Kehadiran Anda</span>
                </div>
              }
              extra={
                <Button 
                  type="link" 
                  href="/santri/absensi"
                  style={{ color: '#1890ff' }}
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
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <Card
              title="Aksi Cepat"
              variant="outlined"
            >
              <div style={{ marginBottom: 16 }}>
                <BookOutlined style={{ color: '#1890ff', marginRight: 8 }} />
                <Text strong>Lihat Hafalan:</Text>
                <br />
                <Text style={{ color: '#666', fontSize: '14px' }}>
                  Pantau perkembangan hafalan Anda
                </Text>
              </div>
              <div style={{ marginBottom: 16 }}>
                <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                <Text strong>Lihat Absensi:</Text>
                <br />
                <Text style={{ color: '#666', fontSize: '14px' }}>
                  Cek kehadiran Anda di halaqah
                </Text>
              </div>
              <div>
                <ClockCircleOutlined style={{ color: '#fa8c16', marginRight: 8 }} />
                <Text strong>Lihat Target:</Text>
                <br />
                <Text style={{ color: '#666', fontSize: '14px' }}>
                  Pantau progress target hafalan
                </Text>
              </div>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card
              title="Status Hafalan"
              variant="outlined"
            >
              <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
                <BookOutlined style={{ color: "#1890ff", marginRight: 8 }} />
                <span>Total Setoran: <strong>{totalSetoran}</strong></span>
              </div>
              <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
                <AimOutlined style={{ color: "#52c41a", marginRight: 8 }} />
                <span>Target Aktif: <strong>{activeTargets}</strong></span>
              </div>
              <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
                <CheckCircleOutlined style={{ color: "#fa8c16", marginRight: 8 }} />
                <span>Progress Target: <strong>{totalTargetProgress}%</strong></span>
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                <FireOutlined style={{ color: "#eb2f96", marginRight: 8 }} />
                <span>Streak Days: <strong>{hafalanProgress.filter(day => day.total > 0).length}</strong></span>
              </div>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card
              title="📢 Notifikasi & Pengumuman"
              variant="outlined"
              extra={
                <Button 
                  type="link" 
                  href="/santri/notifikasi"
                  style={{ color: '#4A90E2' }}
                >
                  Lihat Semua →
                </Button>
              }
            >
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #4A90E2, #357ABD)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  color: 'white',
                  fontSize: '32px'
                }}>
                  🔔
                </div>
                <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>
                  Notifikasi & Pengumuman
                </div>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '16px' }}>
                  Lihat semua notifikasi hafalan, target, dan pengumuman terbaru
                </div>
                <Button 
                  type="primary" 
                  href="/santri/notifikasi"
                  style={{
                    background: 'linear-gradient(135deg, #4A90E2, #357ABD)',
                    border: 'none',
                    borderRadius: '20px'
                  }}
                >
                  Buka Notifikasi
                </Button>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Main Content */}
        <Row gutter={[32, 32]}>
          {/* Progress Chart */}
          <Col xs={24} xl={14}>
            <Card
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #4A90E2, #357ABD)',
                    boxShadow: '0 0 15px rgba(74, 144, 226, 0.4)'
                  }} />
                  <span style={{
                    background: 'linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    fontSize: '20px',
                    fontWeight: '800',
                    letterSpacing: '-0.3px'
                  }}>
                    📊 Grafik Progress Hafalan
                  </span>
                  <Tag
                    color="blue"
                    style={{
                      marginLeft: 'auto',
                      fontSize: '12px',
                      fontWeight: '600',
                      padding: '4px 12px',
                      borderRadius: '20px'
                    }}
                  >
                    7 Hari Terakhir
                  </Tag>
                </div>
              }
              style={{
                borderRadius: '24px',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(74, 144, 226, 0.08)',
                background: 'linear-gradient(145deg, #ffffff 0%, #f8fbff 100%)',
                height: '100%',
                position: 'relative',
                overflow: 'hidden'
              }}
              styles={{
                body: {
                  padding: '40px',
                  background: 'transparent',
                  position: 'relative',
                  zIndex: 2
                }
              }}
            >
              <div style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(74, 144, 226, 0.05), rgba(53, 122, 189, 0.03))',
                zIndex: 1
              }} />
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

              <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center', gap: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#4A90E2' }} />
                  <Text style={{ fontSize: '14px', color: '#666' }}>Ziyadah</Text>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#50E3C2' }} />
                  <Text style={{ fontSize: '14px', color: '#666' }}>Murajaah</Text>
                </div>
              </div>
            </Card>
          </Col>

          {/* Target Progress & Recent Activity */}
          <Col xs={24} xl={10}>
            {/* Target Progress */}
            <Card
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #00B894, #00CEC9)',
                    boxShadow: '0 0 15px rgba(0, 184, 148, 0.4)'
                  }} />
                  <span style={{
                    background: 'linear-gradient(135deg, #00B894 0%, #00CEC9 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    fontSize: '20px',
                    fontWeight: '800',
                    letterSpacing: '-0.3px'
                  }}>
                    🎯 Target Hafalan Aktif
                  </span>
                </div>
              }
              style={{
                borderRadius: '24px',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(0, 184, 148, 0.08)',
                background: 'linear-gradient(145deg, #ffffff 0%, #f8fffe 100%)',
                marginBottom: '32px',
                position: 'relative',
                overflow: 'hidden'
              }}
              styles={{
                body: {
                  padding: '32px',
                  background: 'transparent',
                  position: 'relative',
                  zIndex: 2
                }
              }}
              extra={
                <Button
                  type="link"
                  onClick={() => router.push('/santri/hafalan/target')}
                  style={{
                    color: '#00B894',
                    fontWeight: '700',
                    padding: '8px 16px',
                    fontSize: '14px',
                    borderRadius: '20px',
                    transition: 'all 0.3s ease'
                  }}
                  className="hover:bg-green-50"
                >
                  Lihat Detail →
                </Button>
              }
            >
              <div style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(0, 184, 148, 0.05), rgba(0, 206, 201, 0.03))',
                zIndex: 1
              }} />
              {targets.length > 0 ? (
                <Space direction="vertical" style={{ width: '100%' }}>
                  {targets.slice(0, 2).map((target) => {
                    const progress = target.progress || Math.round((target.currentAyat / target.targetAyat) * 100);
                    const daysLeft = dayjs(target.deadline).diff(dayjs(), 'day');

                    return (
                      <div key={target.id} style={{
                        background: 'linear-gradient(135deg, #f8fffe 0%, #f0f9f8 100%)',
                        borderRadius: '12px',
                        padding: '16px',
                        border: '1px solid rgba(0, 184, 148, 0.1)'
                      }}>
                        <div style={{ marginBottom: '12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                            <Text strong style={{ fontSize: '14px', color: '#333' }}>
                              {target.judul}
                            </Text>
                            <Tag
                              color={target.status === 'active' ? 'green' : 'orange'}
                              style={{ fontSize: '11px' }}
                            >
                              {target.status === 'active' ? 'Aktif' : 'Selesai'}
                            </Tag>
                          </div>
                          <Text type="secondary" style={{ fontSize: '12px', lineHeight: '1.4' }}>
                            {target.deskripsi}
                          </Text>
                        </div>

                        <div style={{ marginBottom: '12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <Text style={{ fontSize: '12px', color: '#666' }}>
                              {target.currentAyat} / {target.targetAyat} ayat
                            </Text>
                            <Text style={{ fontSize: '12px', color: '#00B894', fontWeight: '600' }}>
                              {progress}%
                            </Text>
                          </div>
                          <Progress
                            percent={progress}
                            strokeColor={{
                              '0%': '#00B894',
                              '100%': '#00CEC9',
                            }}
                            size="small"
                            showInfo={false}
                          />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Text style={{ fontSize: '11px', color: '#999' }}>
                            <CalendarOutlined style={{ marginRight: '4px' }} />
                            Deadline: {dayjs(target.deadline).format('DD/MM/YYYY')}
                          </Text>
                          <Text style={{
                            fontSize: '11px',
                            color: daysLeft < 0 ? '#f5222d' : daysLeft <= 7 ? '#fa8c16' : '#00B894',
                            fontWeight: '600'
                          }}>
                            {daysLeft < 0 ? `${Math.abs(daysLeft)} hari terlambat` :
                             daysLeft === 0 ? 'Hari ini' :
                             `${daysLeft} hari lagi`}
                          </Text>
                        </div>
                      </div>
                    );
                  })}
                </Space>
              ) : (
                <Empty description="Belum ada target hafalan aktif" />
              )}
            </Card>

            {/* Recent Activity */}
            <Card
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #6C5CE7, #A29BFE)',
                    boxShadow: '0 0 15px rgba(108, 92, 231, 0.4)'
                  }} />
                  <span style={{
                    background: 'linear-gradient(135deg, #6C5CE7 0%, #A29BFE 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    fontSize: '20px',
                    fontWeight: '800',
                    letterSpacing: '-0.3px'
                  }}>
                    📝 Aktivitas Terakhir
                  </span>
                </div>
              }
              style={{
                borderRadius: '24px',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(108, 92, 231, 0.08)',
                background: 'linear-gradient(145deg, #ffffff 0%, #f8f7ff 100%)',
                position: 'relative',
                overflow: 'hidden'
              }}
              styles={{
                body: {
                  padding: '32px',
                  background: 'transparent',
                  position: 'relative',
                  zIndex: 2
                }
              }}
              extra={
                <Button
                  type="link"
                  onClick={() => router.push('/santri/hafalan')}
                  style={{
                    color: '#6C5CE7',
                    fontWeight: '700',
                    padding: '8px 16px',
                    fontSize: '14px',
                    borderRadius: '20px',
                    transition: 'all 0.3s ease'
                  }}
                  className="hover:bg-purple-50"
                >
                  Lihat Semua →
                </Button>
              }
            >
              <div style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(108, 92, 231, 0.05), rgba(162, 155, 254, 0.03))',
                zIndex: 1
              }} />
              <List
                dataSource={recentHafalan.slice(0, 3)}
                renderItem={(item) => (
                  <List.Item
                    style={{
                      padding: '16px',
                      background: 'white',
                      borderRadius: '12px',
                      marginBottom: '12px',
                      border: '1px solid rgba(108, 92, 231, 0.1)',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.02)'
                    }}
                  >
                    <List.Item.Meta
                      avatar={
                        <div style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '12px',
                          background: item.jenis === 'ziyadah' 
                            ? 'linear-gradient(135deg, rgba(74, 144, 226, 0.1), rgba(53, 122, 189, 0.05))'
                            : 'linear-gradient(135deg, rgba(80, 227, 194, 0.1), rgba(56, 184, 154, 0.05))',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: item.jenis === 'ziyadah' ? '#4A90E2' : '#50E3C2',
                          fontSize: '20px'
                        }}>
                          {item.jenis === 'ziyadah' ? <FireOutlined /> : <BookOutlined />}
                        </div>
                      }
                      title={
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Text strong style={{ fontSize: '15px', color: '#333' }}>{item.surah}</Text>
                          <Tag
                            color={item.jenis === 'ziyadah' ? 'blue' : 'green'}
                            style={{ borderRadius: '12px', padding: '2px 10px', margin: 0, fontSize: '11px' }}
                          >
                            {item.jenis.charAt(0).toUpperCase() + item.jenis.slice(1)}
                          </Tag>
                        </div>
                      }
                      description={
                        <div style={{ marginTop: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                            <BookOutlined style={{ color: '#999', fontSize: '12px' }} />
                            <Text style={{ fontSize: '13px', color: '#666' }}>Ayat: {item.ayat}</Text>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                            <Text style={{ fontSize: '12px', color: '#999' }}>
                              <UserOutlined style={{ marginRight: '4px' }} />
                              {item.guru}
                            </Text>
                            <Text style={{ fontSize: '11px', color: '#999', background: '#f5f5f5', padding: '2px 8px', borderRadius: '10px' }}>
                              {dayjs(item.tanggal).format('DD/MM/YYYY')}
                            </Text>
                          </div>
                        </div>
                      }
                    />
                  </List.Item>
                )}
                locale={{ emptyText: 'Belum ada aktivitas hafalan' }}
              />
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
}
