"use client";

import { useEffect, useState } from "react";
import { Row, Col, Card, Statistic, Space, Spin } from "antd";
import {
  UserOutlined,
  TeamOutlined,
  BookOutlined,
  CalendarOutlined,
  DatabaseOutlined,
} from "@ant-design/icons";
import LayoutApp from "@/components/layout/LayoutApp";

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

export default function SuperAdminDashboard() {
   const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
   const [loading, setLoading] = useState(false);
   const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

   // Fetch dashboard data
   const fetchDashboardData = async () => {
     try {
       setLoading(true);
       const res = await fetch("/api/analytics/dashboard");
       if (!res.ok) throw new Error("Failed to fetch dashboard data");
       const data = await res.json();
       console.log("Dashboard data received:", data); // Debug log
       setDashboardData(data);
       setLastUpdate(new Date());
     } catch (error) {
       console.error("Dashboard error:", error);
       // Handle error silently for dashboard
     } finally {
       setLoading(false);
     }
   };

   useEffect(() => {
     fetchDashboardData();
     // Auto refresh every 30 seconds to keep data synchronized
     const interval = setInterval(fetchDashboardData, 30000);
     return () => clearInterval(interval);
   }, []);

   // Statistics from API data
   const totalUsers = dashboardData?.overview?.totalUsers ?? 0;
   const totalSantri = dashboardData?.overview?.totalSantri ?? 0;
   const totalGuru = dashboardData?.overview?.totalGuru ?? 0;
   const totalAdmin = dashboardData?.overview?.totalAdmin ?? 0;
   const totalSuperAdmin = dashboardData?.overview?.totalSuperAdmin ?? 0;
   const totalOrtu = dashboardData?.overview?.totalOrtu ?? 0;
   const totalYayasan = dashboardData?.overview?.totalYayasan ?? 0;
   const hafalanRate = dashboardData?.performance?.hafalanRate ?? 0;
   const attendanceRate = dashboardData?.performance?.attendanceRate ?? 0;

  return (
    <LayoutApp>
      <div style={{ padding: "24px", maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ marginBottom: 32, textAlign: 'center' }}>
          <h1 style={{ marginBottom: 8, color: '#1f2937', fontSize: '28px', fontWeight: 'bold' }}>
            🌙 Super Admin Dashboard
          </h1>
          <p style={{ margin: 0, color: "#6b7280", fontSize: '16px' }}>
            Overview of system statistics and user management
          </p>
          <div style={{ marginTop: 8, fontSize: '12px', color: '#9ca3af' }}>
            Data auto-refreshes every 30 seconds • Last updated: {lastUpdate.toLocaleTimeString()}
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', background: '#fafafa', borderRadius: '12px', margin: '20px 0' }}>
            <Spin size="large" />
            <p style={{ marginTop: 16, color: '#6b7280', fontSize: '16px' }}>Loading dashboard data...</p>
          </div>
        ) : (
          <>
            {/* Statistics Cards - First Row (4 cards) */}
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
              <Col xs={24} sm={12} md={6}>
                <Card style={{ textAlign: 'center', border: '2px solid #3f8600' }}>
                  <Statistic
                    title="Total Users"
                    value={totalUsers}
                    prefix={<UserOutlined />}
                    valueStyle={{ color: "#3f8600", fontSize: '24px', fontWeight: 'bold' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card style={{ textAlign: 'center', border: '2px solid #1890ff' }}>
                  <Statistic
                    title="Santri"
                    value={totalSantri}
                    prefix={<TeamOutlined />}
                    valueStyle={{ color: "#1890ff", fontSize: '24px', fontWeight: 'bold' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card style={{ textAlign: 'center', border: '2px solid #722ed1' }}>
                  <Statistic
                    title="Guru"
                    value={totalGuru}
                    prefix={<TeamOutlined />}
                    valueStyle={{ color: "#722ed1", fontSize: '24px', fontWeight: 'bold' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card style={{ textAlign: 'center', border: '2px solid #eb2f96' }}>
                  <Statistic
                    title="Admin"
                    value={totalAdmin}
                    prefix={<TeamOutlined />}
                    valueStyle={{ color: "#eb2f96", fontSize: '24px', fontWeight: 'bold' }}
                  />
                </Card>
              </Col>
            </Row>

            {/* Statistics Cards - Second Row (4 cards) */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
              <Col xs={24} sm={12} md={6}>
                <Card style={{ textAlign: 'center', border: '2px solid #13c2c2' }}>
                  <Statistic
                    title="Orang Tua"
                    value={totalOrtu}
                    prefix={<TeamOutlined />}
                    valueStyle={{ color: "#13c2c2", fontSize: '24px', fontWeight: 'bold' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card style={{ textAlign: 'center', border: '2px solid #722ed1' }}>
                  <Statistic
                    title="Yayasan"
                    value={totalYayasan}
                    prefix={<TeamOutlined />}
                    valueStyle={{ color: "#722ed1", fontSize: '24px', fontWeight: 'bold' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card style={{ textAlign: 'center', border: '2px solid #52c41a' }}>
                  <Statistic
                    title="Hafalan Rate"
                    value={hafalanRate}
                    suffix="%"
                    prefix={<BookOutlined />}
                    valueStyle={{ color: "#52c41a", fontSize: '24px', fontWeight: 'bold' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card style={{ textAlign: 'center', border: '2px solid #fa8c16' }}>
                  <Statistic
                    title="Attendance"
                    value={attendanceRate}
                    suffix="%"
                    prefix={<CalendarOutlined />}
                    valueStyle={{ color: "#fa8c16", fontSize: '24px', fontWeight: 'bold' }}
                  />
                </Card>
              </Col>
            </Row>

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
                      <strong>👥 Manage Users:</strong>
                      <p style={{ margin: '8px 0', color: '#666', fontSize: '14px' }}>
                        Add, edit, and organize user accounts by role
                      </p>
                    </div>
                    <div>
                      <strong>⚙️ System Settings:</strong>
                      <p style={{ margin: '8px 0', color: '#666', fontSize: '14px' }}>
                        Configure raport templates, academic years, and backups
                      </p>
                    </div>
                    <div>
                      <strong>💾 Database:</strong>
                      <p style={{ margin: '8px 0', color: '#666', fontSize: '14px' }}>
                        Monitor system performance and data integrity
                      </p>
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
                      <DatabaseOutlined style={{ color: "#52c41a", marginRight: 12, fontSize: '18px' }} />
                      <div>
                        <div style={{ fontSize: '14px', color: '#666' }}>Database Status</div>
                        <div style={{ fontSize: '16px', fontWeight: 'bold', color: "#52c41a" }}>Healthy</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <UserOutlined style={{ color: "#1890ff", marginRight: 12, fontSize: '18px' }} />
                      <div>
                        <div style={{ fontSize: '14px', color: '#666' }}>Active Users</div>
                        <div style={{ fontSize: '16px', fontWeight: 'bold', color: "#1890ff" }}>{totalUsers}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <BookOutlined style={{ color: "#722ed1", marginRight: 12, fontSize: '18px' }} />
                      <div>
                        <div style={{ fontSize: '14px', color: '#666' }}>Last Backup</div>
                        <div style={{ fontSize: '16px', fontWeight: 'bold', color: "#722ed1" }}>Today</div>
                      </div>
                    </div>
                  </Space>
                </Card>
              </Col>
            </Row>
          </>
        )}
      </div>
    </LayoutApp>
  );
}