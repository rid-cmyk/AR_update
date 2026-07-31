 
"use client";

import React, { useEffect, useState } from "react";
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
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
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
    { name: 'Hadir', value: absensiHadir, color: '#52c41a' },
    { name: 'Tidak Hadir', value: absensiTidakHadir, color: '#ff4d4f' }
  ];

  const perfBarData = [
    { name: 'Hafalan Rate', value: hafalanRate, fill: '#1890ff' },
    { name: 'Absensi Rate', value: absensiRate, fill: '#52c41a' },
    { name: 'Target Selesai', value: Math.min(100 - Math.round((targetTertunda / Math.max(totalSantriAktif, 1)) * 100), 100), fill: '#722ed1' },
    { name: 'Aktifitas Hari Ini', value: Math.min(Math.round((totalHafalanToday / Math.max(totalSantriAktif, 1)) * 100), 100), fill: '#fa8c16' }
  ];

  return (
      <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
        {/* Header */}
        <PageHeader
          title="Dashboard Guru"
          subtitle="Kelola halaqah dan pantau perkembangan santri Anda"
          breadcrumbs={[{ title: "Guru Dashboard" }]}
          extra={
            <Space>
              <Tag icon={<BookOutlined />} color="green" style={{ padding: '8px 16px', fontSize: 14 }}>
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
            <Row gutter={[12, 12]} style={{ marginBottom: 24 }}>
              <Col xs={12} sm={12} lg={6}>
                <StatCard
                  title="Santri Aktif"
                  value={totalSantriAktif}
                  icon={<UserOutlined />}
                  color="#3f8600"
                  trend={{ value: 5, isPositive: true, label: "santri baru" }}
                  onClick={() => handleNavigate("/guru/santri")}
                />
              </Col>
              <Col xs={12} sm={12} lg={6}>
                <StatCard
                  title="Hafalan Hari Ini"
                  value={totalHafalanToday}
                  icon={<BookOutlined />}
                  color="#1890ff"
                  trend={{ value: 12, isPositive: true, label: "hafalan baru" }}
                  onClick={() => handleNavigate("/guru/hafalan")}
                />
              </Col>
              <Col xs={12} sm={12} lg={6}>
                <StatCard
                  title="Absensi Rate"
                  value={`${absensiRate}%`}
                  icon={<CheckCircleOutlined />}
                  color={absensiRate >= 80 ? "#52c41a" : "#ff4d4f"}
                  trend={{ value: 3, isPositive: absensiRate >= 80, label: "vs minggu lalu" }}
                  onClick={() => handleNavigate("/guru/absensi")}
                />
              </Col>
              <Col xs={12} sm={12} lg={6}>
                <StatCard
                  title="Target Tertunda"
                  value={targetTertunda}
                  icon={<ClockCircleOutlined />}
                  color="#fa8c16"
                  trend={{ value: 2, isPositive: false, label: "perlu perhatian" }}
                  onClick={() => handleNavigate("/guru/target")}
                />
              </Col>
            </Row>

        {/* Charts Row: Hafalan 7 hari + Absensi Today */}
        <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
          <Col xs={24} lg={12}>
            <Card
              title={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <BookOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                  <span>Hafalan 7 Hari Terakhir</span>
                </div>
              }
              style={{ height: '100%' }}
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
                  <Line type="monotone" dataKey="ziyadah" stroke="#1890ff" strokeWidth={3} name="Ziyadah" dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="murajaah" stroke="#52c41a" strokeWidth={3} name="Murajaah" dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card
              title={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <CheckCircleOutlined style={{ marginRight: 8, color: '#52c41a' }} />
                  <span>Absensi Hari Ini</span>
                </div>
              }
              style={{ height: '100%' }}
            >
              {absensiHadir + absensiTidakHadir > 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 260 }}>
                  <ResponsiveContainer width="60%" height={260}>
                    <PieChart>
                      <Pie
                        data={absensiPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={3}
                        dataKey="value"
                        label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {absensiPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: 'white',
                          border: 'none',
                          borderRadius: '12px',
                          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
                  <CheckCircleOutlined style={{ fontSize: 48, opacity: 0.3, marginBottom: 16 }} />
                  <div>Belum ada data absensi hari ini</div>
                </div>
              )}
            </Card>
          </Col>
        </Row>

        {/* Performance Bar Chart */}
        <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
          <Col xs={24}>
            <Card
              title={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <TrophyOutlined style={{ marginRight: 8, color: '#fa8c16' }} />
                  <span>Performance Overview</span>
                </div>
              }
            >
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={perfBarData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" domain={[0, 100]} stroke="#666" fontSize={11} />
                  <YAxis type="category" dataKey="name" stroke="#666" fontSize={11} width={130} />
                  <Tooltip
                    contentStyle={{
                      background: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                    }}
                    formatter={(value: any) => [`${value}%`, 'Persentase']}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} name="Persentase">
                    {perfBarData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>

        {/* Halaqah & Target Information */}
        <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
          <Col xs={24}>
            <Card
              title={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <TeamOutlined style={{ marginRight: 8, color: '#1890ff' }} />
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
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              <BookOutlined style={{ marginRight: 8, color: '#52c41a' }} />
                              <span style={{ fontSize: '14px' }}>{halaqah.namaHalaqah}</span>
                            </div>
                          }
                          variant="outlined"
                        >
                          <div style={{ marginBottom: 12 }}>
                            <Text strong style={{ color: '#1890ff' }}>
                              {halaqah.jumlahSantri} Santri
                            </Text>
                          </div>

                          {halaqah.santri && halaqah.santri.length > 0 && (
                            <div>
                              <Text style={{ fontSize: '12px', color: '#666', marginBottom: 8, display: 'block' }}>
                                Santri yang dididik:
                              </Text>
                              <List
                                size="small"
                                dataSource={halaqah.santri.slice(0, 5)}
                                renderItem={(santri) => (
                                  <List.Item style={{ padding: '4px 0' }}>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                      <Avatar size="small" icon={<UserOutlined />} style={{ marginRight: 8 }} />
                                      <div>
                                        <Text style={{ fontSize: '12px', fontWeight: 'bold' }}>
                                          {santri.namaLengkap}
                                        </Text>
                                        <br />
                                        <Text style={{ fontSize: '11px', color: '#999' }}>
                                          @{santri.username}
                                        </Text>
                                      </div>
                                    </div>
                                  </List.Item>
                                )}
                              />
                              {halaqah.santri.length > 5 && (
                                <Text style={{ fontSize: '11px', color: '#999' }}>
                                  +{halaqah.santri.length - 5} santri lainnya
                                </Text>
                              )}
                            </div>
                          )}

                          {halaqah.jadwal && halaqah.jadwal.length > 0 && (
                            <div style={{ marginTop: 12 }}>
                              <Text style={{ fontSize: '12px', color: '#666', marginBottom: 8, display: 'block' }}>
                                Jadwal Halaqah:
                              </Text>
                              <List
                                size="small"
                                dataSource={halaqah.jadwal.slice(0, 3)}
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
                                        </Text>
                                      </div>
                                    </div>
                                  </List.Item>
                                )}
                              />
                              {halaqah.jadwal.length > 3 && (
                                <Text style={{ fontSize: '11px', color: '#999' }}>
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
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              <AimOutlined style={{ marginRight: 8, color: '#722ed1' }} />
                              <span style={{ fontSize: '14px' }}>Target Hafalan</span>
                            </div>
                          }
                          variant="outlined"
                          style={{ height: '100%' }}
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
                                  <List.Item style={{ padding: '6px 0' }}>
                                    <div style={{ width: '100%' }}>
                                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                                        <Avatar size="small" icon={<UserOutlined />} style={{ marginRight: 8 }} />
                                        <Text style={{ fontSize: '12px', fontWeight: 'bold' }}>
                                          {santri.namaLengkap}
                                        </Text>
                                      </div>
                                      {hasTargets ? (
                                        <div style={{ marginLeft: 32 }}>
                                          {activeTargets.length > 0 && activeTargets.slice(0, 2).map((target) => {
                                            const isOverdue = new Date(target.deadline) < new Date();
                                            const deadlineStr = new Date(target.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
                                            return (
                                              <div key={target.id} style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: 4,
                                                padding: '2px 8px',
                                                borderRadius: 6,
                                                background: isOverdue ? '#fff2f0' : '#e6f7ff',
                                                border: `1px solid ${isOverdue ? '#ffccc7' : '#91d5ff'}`,
                                                marginBottom: 3,
                                                marginRight: 4,
                                              }}>
                                                <AimOutlined style={{ fontSize: 10, color: isOverdue ? '#ff4d4f' : '#1890ff' }} />
                                                <Text style={{ fontSize: 10, color: isOverdue ? '#ff4d4f' : '#1890ff', fontWeight: 500 }}>
                                                  {target.surat} ({target.ayatTarget} ayat)
                                                </Text>
                                                <Text style={{ fontSize: 9, color: '#999' }}>
                                                  • {isOverdue ? 'terlambat' : `s/d ${deadlineStr}`}
                                                </Text>
                                              </div>
                                            );
                                          })}
                                          {activeTargets.length > 2 && (
                                            <Text style={{ fontSize: 10, color: '#999', display: 'block', marginTop: 2 }}>
                                              +{activeTargets.length - 2} target aktif lainnya
                                            </Text>
                                          )}
                                          {completedTargets.length > 0 && (
                                            <Tag color="success" style={{ fontSize: 10, marginTop: 2 }}>
                                              ✓ {completedTargets.length} selesai
                                            </Tag>
                                          )}
                                        </div>
                                      ) : (
                                        <Text style={{ fontSize: 11, color: '#bbb', marginLeft: 32 }}>
                                          Belum ada target
                                        </Text>
                                      )}
                                    </div>
                                  </List.Item>
                                );
                              }}
                            />
                          ) : (
                            <div style={{ textAlign: 'center', padding: '20px 0', color: '#bbb' }}>
                              <AimOutlined style={{ fontSize: 32, marginBottom: 8, opacity: 0.4 }} />
                              <div style={{ fontSize: 12 }}>Belum ada data target</div>
                            </div>
                          )}
                        </Card>
                      </Col>
                    </React.Fragment>
                  ))}
                </Row>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#999' }}>
                  <TeamOutlined style={{ fontSize: '48px', marginBottom: 16, opacity: 0.5 }} />
                  <div>
                    <Text style={{ fontSize: '16px' }}>Belum ada halaqah yang ditugaskan</Text>
                    <br />
                    <Text style={{ fontSize: '14px', color: '#bbb' }}>
                      Admin akan menugaskan halaqah kepada Anda
                    </Text>
                  </div>
                </div>
              )}
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
              <Title level={4} style={{ 
                margin: 0,
                color: "#1e293b",
                fontWeight: 600 
              }}>Sistem AR-Hafalan v2.0</Title>
              <Text style={{ 
                color: "#64748b", 
                fontSize: 14 
              }}>Guru Dashboard - Halaqah Management & Student Progress</Text>
            </div>
            <div style={{ textAlign: "right" }}>
              <Text style={{ 
                color: "#64748b",
                fontSize: 14,
                display: "block" 
              }}>Auto-refresh: 30s • Last updated</Text>
              <Text style={{ 
                color: "#1e293b",
                fontWeight: 500,
                fontSize: 14 
              }}>{lastUpdate.toLocaleTimeString()}</Text>
            </div>
          </div>
        </Card>
      </div>
  );
}