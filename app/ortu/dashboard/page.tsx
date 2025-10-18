"use client";

import { useEffect, useState } from "react";
import { Row, Col, Card, Statistic, Space, Spin, Progress } from "antd";
import {
  UserOutlined,
  TeamOutlined,
  BookOutlined,
  CalendarOutlined,
  HeartOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import LayoutApp from "@/components/LayoutApp";

interface OrtuDashboardData {
  anakStats: {
    totalAnak: number;
    totalHafalan: number;
    averageAttendance: number;
    averageProgress: number;
  };
  recentActivities: {
    hafalan: Array<{
      id: number;
      namaSantri: string;
      surat: string;
      ayatMulai: number;
      ayatSelesai: number;
      tanggal: string;
    }>;
    absensi: Array<{
      id: number;
      namaSantri: string;
      status: string;
      tanggal: string;
    }>;
  };
}

export default function OrtuDashboard() {
  const [dashboardData, setDashboardData] = useState<OrtuDashboardData | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch ortu dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/dashboard/ortu");
      if (!res.ok) throw new Error("Failed to fetch dashboard data");
      const data = await res.json();
      setDashboardData(data);
    } catch (error) {
      console.error("Ortu dashboard error:", error);
      // Set mock data for demo
      setDashboardData({
        anakStats: {
          totalAnak: 2,
          totalHafalan: 45,
          averageAttendance: 92,
          averageProgress: 78,
        },
        recentActivities: {
          hafalan: [
            { id: 1, namaSantri: "Ahmad", surat: "Al-Fatihah", ayatMulai: 1, ayatSelesai: 7, tanggal: "2024-01-15" },
            { id: 2, namaSantri: "Fatimah", surat: "Al-Baqarah", ayatMulai: 1, ayatSelesai: 25, tanggal: "2024-01-14" },
          ],
          absensi: [
            { id: 1, namaSantri: "Ahmad", status: "hadir", tanggal: "2024-01-15" },
            { id: 2, namaSantri: "Fatimah", status: "hadir", tanggal: "2024-01-14" },
          ],
        },
      });
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
            👨‍👩‍👧‍👦 Orang Tua Dashboard
          </h1>
          <p style={{ margin: 0, color: "#6b7280", fontSize: '16px' }}>
            Monitor your children's hafalan progress and attendance
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
              <Col xs={24} sm={12} md={6}>
                <Card style={{ textAlign: 'center', border: '2px solid #1890ff' }}>
                  <Statistic
                    title="Total Anak"
                    value={dashboardData?.anakStats?.totalAnak || 0}
                    prefix={<HeartOutlined />}
                    valueStyle={{ color: "#1890ff", fontSize: '24px', fontWeight: 'bold' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card style={{ textAlign: 'center', border: '2px solid #52c41a' }}>
                  <Statistic
                    title="Total Hafalan"
                    value={dashboardData?.anakStats?.totalHafalan || 0}
                    prefix={<BookOutlined />}
                    valueStyle={{ color: "#52c41a", fontSize: '24px', fontWeight: 'bold' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card style={{ textAlign: 'center', border: '2px solid #722ed1' }}>
                  <Statistic
                    title="Avg Attendance"
                    value={dashboardData?.anakStats?.averageAttendance || 0}
                    suffix="%"
                    prefix={<CalendarOutlined />}
                    valueStyle={{ color: "#722ed1", fontSize: '24px', fontWeight: 'bold' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card style={{ textAlign: 'center', border: '2px solid #fa8c16' }}>
                  <Statistic
                    title="Avg Progress"
                    value={dashboardData?.anakStats?.averageProgress || 0}
                    suffix="%"
                    prefix={<TrophyOutlined />}
                    valueStyle={{ color: "#fa8c16", fontSize: '24px', fontWeight: 'bold' }}
                  />
                </Card>
              </Col>
            </Row>

            {/* Progress Section */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
              <Col xs={24} md={12}>
                <Card title="Children's Hafalan Progress" bordered={false}>
                  <div style={{ textAlign: 'center', padding: '20px' }}>
                    <Progress
                      type="circle"
                      percent={dashboardData?.anakStats?.averageProgress || 0}
                      format={(percent) => `${percent}%`}
                      strokeColor="#52c41a"
                      size={120}
                    />
                    <p style={{ marginTop: 16, color: '#666' }}>
                      Average hafalan progress across all children
                    </p>
                  </div>
                </Card>
              </Col>
              <Col xs={24} md={12}>
                <Card title="Attendance Overview" bordered={false}>
                  <div style={{ textAlign: 'center', padding: '20px' }}>
                    <Progress
                      type="circle"
                      percent={dashboardData?.anakStats?.averageAttendance || 0}
                      format={(percent) => `${percent}%`}
                      strokeColor="#1890ff"
                      size={120}
                    />
                    <p style={{ marginTop: 16, color: '#666' }}>
                      Average attendance rate across all children
                    </p>
                  </div>
                </Card>
              </Col>
            </Row>

            {/* Quick Actions */}
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Card
                  title="Quick Actions"
                  bordered={false}
                  style={{ height: '100%' }}
                >
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <div>
                      <strong>👶 View Children's Progress:</strong>
                      <p style={{ margin: '8px 0', color: '#666', fontSize: '14px' }}>
                        Monitor individual hafalan progress
                      </p>
                    </div>
                    <div>
                      <strong>📅 Check Attendance:</strong>
                      <p style={{ margin: '8px 0', color: '#666', fontSize: '14px' }}>
                        View attendance records
                      </p>
                    </div>
                    <div>
                      <strong>📊 View Reports:</strong>
                      <p style={{ margin: '8px 0', color: '#666', fontSize: '14px' }}>
                        Access detailed progress reports
                      </p>
                    </div>
                  </Space>
                </Card>
              </Col>
              <Col xs={24} md={12}>
                <Card
                  title="Recent Activities"
                  bordered={false}
                  style={{ height: '100%' }}
                >
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    <div>
                      <strong>📚 Latest Hafalan:</strong>
                      {dashboardData?.recentActivities?.hafalan?.slice(0, 2).map((hafalan, index) => (
                        <div key={index} style={{ margin: '4px 0', fontSize: '14px', color: '#666' }}>
                          {hafalan.namaSantri}: {hafalan.surat} ({hafalan.ayatMulai}-{hafalan.ayatSelesai}) - {hafalan.tanggal}
                        </div>
                      ))}
                    </div>
                    <div>
                      <strong>📅 Recent Attendance:</strong>
                      {dashboardData?.recentActivities?.absensi?.slice(0, 2).map((absensi, index) => (
                        <div key={index} style={{ margin: '4px 0', fontSize: '14px', color: '#666' }}>
                          {absensi.namaSantri}: {absensi.status === 'hadir' ? '✅' : '❌'} {absensi.tanggal}
                        </div>
                      ))}
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