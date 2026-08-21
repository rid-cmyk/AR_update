"use client";

import { useEffect } from "react";
import { Row, Col, Card, Space, Spin, Button, Tag, Typography } from "antd";
import {
  UserOutlined,
  TeamOutlined,
  BookOutlined,
  DatabaseOutlined
} from '@ant-design/icons';
import AdminHeaderCard from "@/components/super-admin/layout/AdminHeaderCard";
import StatCard from "@/components/layout/StatCard";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useVisibilityAwareRefresh } from "@/hooks/useVisibilityAwareRefresh";
import dynamic from "next/dynamic";

const PieChart = dynamic(() => import("recharts").then(mod => mod.PieChart), { ssr: false });
const Pie = dynamic(() => import("recharts").then(mod => mod.Pie), { ssr: false });
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

const { Title, Text } = Typography;

interface DashboardData {
  overview: {
    totalSantri: number;
    totalGuru: number;
    totalAdmin: number;
    totalSuperAdmin: number;
    totalOrtu: number;
    totalYayasan: number;
    totalHalaqah: number;
    totalJadwal: number;
    totalPengumuman: number;
    totalUsers: number;
    totalRoles: number;
  };
  performance: {
    attendanceRate: number;
    hafalanRate: number;
  };
  userDistribution: Record<string, number>;
  monthlyTrend: Array<{ month: string; hafalan: number; absensi: number }>;
  halaqahStats: Array<{
    id: number;
    namaHalaqah: string;
    santriCount: number;
    hafalanCount: number;
    attendanceRate: number;
    hafalanRate: number;
  }>;
  recentActivities: {
    hafalan: Array<{
      id: number;
      type: string;
      description: string;
      date: string;
    }>;
    absensi: Array<{
      id: number;
      type: string;
      description: string;
      date: string;
    }>;
  };
}

import AdminDashboardClient from "./AdminDashboardClient";

const PIE_COLORS = ['#219ebc', '#219ebc', '#8ecae6', '#ffb703', '#eb2f96', '#13c2c2'];

export default function SuperAdminDashboardClient({ data, adminData }: { data: DashboardData; adminData?: any }) {
  const router = useRouter();

  useVisibilityAwareRefresh(120000);

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  const totalUsers = data.overview.totalUsers;
  const totalSantri = data.overview.totalSantri;
  const totalGuru = data.overview.totalGuru;
  const totalAdmin = data.overview.totalAdmin;
  const totalSuperAdmin = data.overview.totalSuperAdmin;
  const totalOrtu = data.overview.totalOrtu;
  const totalYayasan = data.overview.totalYayasan;

  const userPieData = Object.entries(data.userDistribution || {}).map(([key, value]) => ({
    name: key === 'superAdmin' ? 'Super Admin' : key.charAt(0).toUpperCase() + key.slice(1),
    value,
    label: key === 'superAdmin' ? 'Super Admin' : key.charAt(0).toUpperCase() + key.slice(1)
  }));

  const halaqahBarData = (data.halaqahStats || []).map(h => ({
    name: h.namaHalaqah.length > 12 ? h.namaHalaqah.substring(0, 12) + '...' : h.namaHalaqah,
    santri: h.santriCount
  }));

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
        <AdminHeaderCard
          title="Super Admin Dashboard"
          subtitle="Overview of system statistics and user management"
          actions={
            <Link href="/super-admin/users">
              <Button type="primary" icon={<UserOutlined />} size="large">
                Kelola Users
              </Button>
            </Link>
          }
        />

        {/* Statistics Cards */}
        <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Total Users"
              value={totalUsers}
              icon={<UserOutlined />}
              color="#0dfbdb"
              trend={{ value: 15, isPositive: true, label: "users baru" }}
              onClick={() => handleNavigate("/super-admin/users")}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Total Santri"
              value={totalSantri}
              icon={<TeamOutlined />}
              color="#0dfbdb"
              trend={{ value: 12, isPositive: true, label: "santri aktif" }}
              onClick={() => handleNavigate("/super-admin/users?role=santri")}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Total Guru"
              value={totalGuru}
              icon={<TeamOutlined />}
              color="#0dfbdb"
              trend={{ value: 2, isPositive: true, label: "guru baru" }}
              onClick={() => handleNavigate("/super-admin/users?role=guru")}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="System Health"
              value="100%"
              icon={<DatabaseOutlined />}
              color="#0dfbdb"
              trend={{ value: 0, isPositive: true, label: "uptime" }}
              onClick={() => handleNavigate("/super-admin/settings/system")}
            />
          </Col>
        </Row>

        {/* Chart Section: User Distribution + Monthly Trend */}
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card
              title={
                <Space>
                  <UserOutlined />
                  <span>Distribusi Pengguna</span>
                </Space>
              }
              style={{ height: '100%' }}
            >
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={userPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {userPieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
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
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 8 }}>
                {userPieData.map((item, index) => (
                  <Tag key={item.name} color={PIE_COLORS[index]}>{item.name}: {item.value}</Tag>
                ))}
              </div>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card
              title={
                <Space>
                  <DatabaseOutlined />
                  <span>Tren Bulanan</span>
                </Space>
              }
              style={{ height: '100%' }}
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

        {/* Halaqah Performance Bar Chart */}
        {halaqahBarData.length > 0 && (
          <Row gutter={[16, 16]}>
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

        {/* Quick Actions */}
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Card
              title="Quick Actions"
              variant="outlined"
              style={{ height: '100%' }}
            >
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <div>
                  <strong>Manage Users:</strong>
                  <p style={{ 
                    margin: '8px 0',
                    color: '#666',
                    fontSize: '14px' 
                  }}>Add, edit, and organize user accounts by role</p>
                </div>
                <div>
                  <strong>System Settings:</strong>
                  <p style={{ 
                    margin: '8px 0',
                    color: '#666',
                    fontSize: '14px' 
                  }}>Configure raport templates, academic years and backups</p>
                </div>
                <div>
                  <strong>Database:</strong>
                  <p style={{ 
                    margin: '8px 0',
                    color: '#666',
                    fontSize: '14px' 
                  }}>Monitor system performance and data integrity</p>
                </div>
              </Space>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card
              title="System Status"
              variant="outlined"
              style={{ height: '100%' }}
            >
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <DatabaseOutlined style={{ 
                    color: "#219ebc",
                    marginRight: 12,
                    fontSize: '18px' 
                  }} />
                  <div>
                    <div style={{ fontSize: '14px', color: '#666' }}>Database Status</div>
                    <div style={{ 
                      fontSize: '16px',
                      fontWeight: 'bold',
                      color: "#219ebc" 
                    }}>Healthy</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <UserOutlined style={{ 
                    color: "#219ebc",
                    marginRight: 12,
                    fontSize: '18px' 
                  }} />
                  <div>
                    <div style={{ fontSize: '14px', color: '#666' }}>Active Users</div>
                    <div style={{ 
                      fontSize: '16px',
                      fontWeight: 'bold',
                      color: "#219ebc" 
                    }}>{totalUsers}</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <BookOutlined style={{ 
                    color: "#8ecae6",
                    marginRight: 12,
                    fontSize: '18px' 
                  }} />
                  <div>
                    <div style={{ fontSize: '14px', color: '#666' }}>Last Backup</div>
                    <div style={{ 
                      fontSize: '16px',
                      fontWeight: 'bold',
                      color: "#8ecae6" 
                    }}>{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</div>
                  </div>
                </div>
              </Space>
            </Card>
          </Col>
        </Row>
        {/* Render Admin Dashboard Data below */}
        {adminData && (
          <div style={{ marginTop: 16 }}>
            <AdminDashboardClient data={adminData} />
          </div>
        )}
      </div>
    </>
  );
}