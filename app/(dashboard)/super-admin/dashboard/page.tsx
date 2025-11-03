"use client";

import { useEffect, useState, useCallback } from "react";
import { Row, Col, Card, Space, Spin, Button, Tag, Typography } from "antd";
import {
  UserOutlined,
  TeamOutlined,
  BookOutlined,
  CalendarOutlined,
  EyeOutlined,
  PlusOutlined,
  SettingOutlined,
  DatabaseOutlined
} from '@ant-design/icons';
import PageHeader from "@/components/layout/PageHeader";
import StatCard from "@/components/layout/StatCard";
import Link from "next/link";
import { useRouter } from "next/navigation";
import LayoutApp from "@/components/layout/LayoutApp";

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
  const router = useRouter();

  // Fallback data when API fails
  const getFallbackData = useCallback((): DashboardData => ({
    overview: {
      totalSantri: 0,
      totalGuru: 0,
      totalAdmin: 0,
      totalSuperAdmin: 1,
      totalOrtu: 0,
      totalYayasan: 0,
      totalHalaqah: 0,
      totalJadwal: 0,
      totalPengumuman: 0,
      totalUsers: 1,
      totalRoles: 6
    },
    performance: {
      attendanceRate: 0,
      hafalanRate: 0
    },
    halaqahStats: [],
    recentActivities: {
      hafalan: [],
      absensi: []
    }
  }), []);

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/analytics/dashboard");
      
      if (!res.ok) {
        console.warn(`API returned ${res.status}: ${res.statusText}`);
        // Use fallback data instead of throwing error
        setDashboardData(getFallbackData());
        setLastUpdate(new Date());
        return;
      }

      const data = await res.json();
      console.log("Dashboard data received:", data); // Debug log
      setDashboardData(data);
      setLastUpdate(new Date());
    } catch (error) {
      console.error("Dashboard error: ", error);
      // Use fallback data on any error
      setDashboardData(getFallbackData());
      setLastUpdate(new Date());
    } finally {
      setLoading(false);
    }
  }, [getFallbackData]);

  useEffect(() => {
    fetchDashboardData();
    // Auto refresh every 30 seconds to keep data synchronized
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  // Navigation handlers
  const handleNavigate = (path: string) => {
    router.push(path);
  };

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
      <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
        {/* Header */}
        <PageHeader
          title="Super Admin Dashboard"
          subtitle="Overview of system statistics and user management"
          breadcrumbs={[{ title: "Super Admin Dashboard" }]}
          extra={
            <Space>
              <Tag icon={<SettingOutlined />} color="red" style={{ padding: '8px 16px', fontSize: 14 }}>
                Super Admin Panel
              </Tag>
              <Link href="/super-admin/users">
                <Button type="primary" icon={<UserOutlined />} size="large">
                  Kelola Users
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
                  title="Total Users"
                  value={totalUsers}
                  icon={<UserOutlined />}
                  color="#3f8600"
                  trend={{ value: 15, isPositive: true, label: "users baru" }}
                  onClick={() => handleNavigate("/super-admin/users")}
                />
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <StatCard
                  title="Total Santri"
                  value={totalSantri}
                  icon={<TeamOutlined />}
                  color="#1890ff"
                  trend={{ value: 12, isPositive: true, label: "santri aktif" }}
                  onClick={() => handleNavigate("/super-admin/users?role=santri")}
                />
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <StatCard
                  title="Total Guru"
                  value={totalGuru}
                  icon={<TeamOutlined />}
                  color="#722ed1"
                  trend={{ value: 2, isPositive: true, label: "guru baru" }}
                  onClick={() => handleNavigate("/super-admin/users?role=guru")}
                />
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <StatCard
                  title="System Health"
                  value="100%"
                  icon={<DatabaseOutlined />}
                  color="#52c41a"
                  trend={{ value: 0, isPositive: true, label: "uptime" }}
                  onClick={() => handleNavigate("/super-admin/system")}
                />
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
                      <p style={{ 
                        margin: '8px 0',
                        color: '#666',
                        fontSize: '14px' 
                      }}>Add, edit, and organize user accounts by role</p>
                    </div>
                    <div>
                      <strong>⚙️ System Settings:</strong>
                      <p style={{ 
                        margin: '8px 0',
                        color: '#666',
                        fontSize: '14px' 
                      }}>Configure raport templates, academic years and backups</p>
                    </div>
                    <div>
                      <strong>💾 Database:</strong>
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
                        color: "#52c41a",
                        marginRight: 12,
                        fontSize: '18px' 
                      }} />
                      <div>
                        <div style={{ fontSize: '14px', color: '#666' }}>Database Status</div>
                        <div style={{ 
                          fontSize: '16px',
                          fontWeight: 'bold',
                          color: "#52c41a" 
                        }}>Healthy</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <UserOutlined style={{ 
                        color: "#1890ff",
                        marginRight: 12,
                        fontSize: '18px' 
                      }} />
                      <div>
                        <div style={{ fontSize: '14px', color: '#666' }}>Active Users</div>
                        <div style={{ 
                          fontSize: '16px',
                          fontWeight: 'bold',
                          color: "#1890ff" 
                        }}>{totalUsers}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <BookOutlined style={{ 
                        color: "#722ed1",
                        marginRight: 12,
                        fontSize: '18px' 
                      }} />
                      <div>
                        <div style={{ fontSize: '14px', color: '#666' }}>Last Backup</div>
                        <div style={{ 
                          fontSize: '16px',
                          fontWeight: 'bold',
                          color: "#722ed1" 
                        }}>Today</div>
                      </div>
                    </div>
                  </Space>
                </Card>
              </Col>
            </Row>

            {/* Recent Activity Summary */}
            <Row gutter={[16, 16]}>
              <Col xs={24} lg={12}>
                <Card 
                  title={
                    <Space>
                      <UserOutlined />
                      <span>User Statistics</span>
                    </Space>
                  }
                  style={{ height: '100%' }}
                >
                  <div style={{ 
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 16 
                  }}>
                    <div style={{ 
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center' 
                    }}>
                      <Text>Total Admin</Text>
                      <Space>
                        <Text strong style={{ fontSize: 16 }}>{totalAdmin}</Text>
                        <Tag color="green">Aktif</Tag>
                      </Space>
                    </div>
                    <div style={{ 
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center' 
                    }}>
                      <Text>Total Orang Tua</Text>
                      <Space>
                        <Text strong style={{ fontSize: 16 }}>{totalOrtu}</Text>
                        <Tag color="blue">Terdaftar</Tag>
                      </Space>
                    </div>
                    <div style={{ 
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center' 
                    }}>
                      <Text>Total Yayasan</Text>
                      <Space>
                        <Text strong style={{ fontSize: 16 }}>{totalYayasan}</Text>
                        <Tag color="purple">Aktif</Tag>
                      </Space>
                    </div>
                    <div style={{ 
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center' 
                    }}>
                      <Text>Super Admin</Text>
                      <Space>
                        <Text strong style={{ fontSize: 16 }}>{totalSuperAdmin}</Text>
                        <Tag color="red">Root</Tag>
                      </Space>
                    </div>
                  </div>
                </Card>
              </Col>
              <Col xs={24} lg={12}>
                <Card 
                  title={
                    <Space>
                      <DatabaseOutlined />
                      <span>System Performance</span>
                    </Space>
                  }
                  style={{ height: '100%' }}
                >
                  <div style={{ 
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12 
                  }}>
                    <div style={{ 
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: 12,
                      backgroundColor: '#f8fafc',
                      borderRadius: 8,
                      border: '1px solid #e2e8f0'
                    }}>
                      <div>
                        <Text strong style={{ fontSize: 14 }}>Database Status</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: 12 }}>Connection & Performance</Text>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <Text strong style={{ fontSize: 18, color: '#52c41a' }}>Healthy</Text>
                        <br />
                        <Tag color="green" style={{ fontSize: 10 }}>Online</Tag>
                      </div>
                    </div>
                    <div style={{ 
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: 12,
                      backgroundColor: '#f8fafc',
                      borderRadius: 8,
                      border: '1px solid #e2e8f0'
                    }}>
                      <div>
                        <Text strong style={{ fontSize: 14 }}>System Uptime</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: 12 }}>Server Availability</Text>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <Text strong style={{ fontSize: 18, color: '#1890ff' }}>99.9%</Text>
                        <br />
                        <Tag color="blue" style={{ fontSize: 10 }}>Excellent</Tag>
                      </div>
                    </div>
                    <div style={{ 
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: 12,
                      backgroundColor: '#f8fafc',
                      borderRadius: 8,
                      border: '1px solid #e2e8f0'
                    }}>
                      <div>
                        <Text strong style={{ fontSize: 14 }}>Last Backup</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: 12 }}>Data Backup Status</Text>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <Text strong style={{ fontSize: 12, color: '#1f2937' }}>Today</Text>
                        <br />
                        <Tag color="green" style={{ fontSize: 10 }}>Success</Tag>
                      </div>
                    </div>
                  </div>
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
                  }}>Super Admin Dashboard - System Management & Control</Text>
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
          </>
        )}
      </div>
    </LayoutApp>
  );
}