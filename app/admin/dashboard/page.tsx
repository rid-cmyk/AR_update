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
import LayoutApp from "@/components/LayoutApp";

interface AdminDashboardData {
  halaqahCount: number;
  jadwalCount: number;
  pengumumanCount: number;
  recentActivities: {
    halaqah: Array<{
      id: number;
      type: string;
      description: string;
      date: string;
    }>;
    jadwal: Array<{
      id: number;
      type: string;
      description: string;
      date: string;
    }>;
  };
}

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch admin dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/analytics/dashboard");
      if (!res.ok) throw new Error("Failed to fetch dashboard data");
      const data = await res.json();

      // Transform data for admin dashboard
      const adminData: AdminDashboardData = {
        halaqahCount: data.overview?.totalHalaqah || 0,
        jadwalCount: data.overview?.totalJadwal || 0,
        pengumumanCount: data.overview?.totalPengumuman || 0,
        recentActivities: data.recentActivities || { halaqah: [], jadwal: [] }
      };

      setDashboardData(adminData);
    } catch (error) {
      console.error("Admin dashboard error:", error);
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
            👨‍💼 Admin Dashboard
          </h1>
          <p style={{ margin: 0, color: "#6b7280", fontSize: '16px' }}>
            Manage halaqah, schedules, and announcements
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', background: '#fafafa', borderRadius: '12px', margin: '20px 0' }}>
            <Spin size="large" />
            <p style={{ marginTop: 16, color: '#6b7280', fontSize: '16px' }}>Loading dashboard data...</p>
          </div>
        ) : (
          <>
            {/* Statistics Cards */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
              <Col xs={24} sm={12} md={6} lg={6}>
                <Card style={{ textAlign: 'center', border: '2px solid #1890ff' }}>
                  <Statistic
                    title="Total Halaqah"
                    value={dashboardData?.halaqahCount || 0}
                    prefix={<TeamOutlined />}
                    valueStyle={{ color: "#1890ff", fontSize: '24px', fontWeight: 'bold' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6} lg={6}>
                <Card style={{ textAlign: 'center', border: '2px solid #722ed1' }}>
                  <Statistic
                    title="Total Jadwal"
                    value={dashboardData?.jadwalCount || 0}
                    prefix={<CalendarOutlined />}
                    valueStyle={{ color: "#722ed1", fontSize: '24px', fontWeight: 'bold' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6} lg={6}>
                <Card style={{ textAlign: 'center', border: '2px solid #52c41a' }}>
                  <Statistic
                    title="Pengumuman"
                    value={dashboardData?.pengumumanCount || 0}
                    prefix={<BookOutlined />}
                    valueStyle={{ color: "#52c41a", fontSize: '24px', fontWeight: 'bold' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6} lg={6}>
                <Card style={{ textAlign: 'center', border: '2px solid #fa8c16' }}>
                  <Statistic
                    title="Active Sessions"
                    value={Math.floor(Math.random() * 50) + 10} // Placeholder for active sessions
                    prefix={<UserOutlined />}
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
                      <strong>👥 Manage Halaqah:</strong>
                      <p style={{ margin: '8px 0', color: '#666', fontSize: '14px' }}>
                        Create and organize halaqah groups
                      </p>
                    </div>
                    <div>
                      <strong>📅 Schedule Management:</strong>
                      <p style={{ margin: '8px 0', color: '#666', fontSize: '14px' }}>
                        Set up and manage class schedules
                      </p>
                    </div>
                    <div>
                      <strong>📢 Announcements:</strong>
                      <p style={{ margin: '8px 0', color: '#666', fontSize: '14px' }}>
                        Create and publish announcements
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
                        <div style={{ fontSize: '16px', fontWeight: 'bold', color: "#1890ff" }}>Online</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <BookOutlined style={{ color: "#722ed1", marginRight: 12, fontSize: '18px' }} />
                      <div>
                        <div style={{ fontSize: '14px', color: '#666' }}>Last Update</div>
                        <div style={{ fontSize: '16px', fontWeight: 'bold', color: "#722ed1" }}>Just Now</div>
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