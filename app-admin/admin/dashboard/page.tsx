"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Row, Col, Card, Statistic, List, Button, Avatar, Typography } from "antd";
import {
  UserOutlined,
  TeamOutlined,
  BookOutlined,
  CalendarOutlined,
  NotificationOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import LayoutApp from "@/components/LayoutApp";

const { Title } = Typography;

interface User {
  id: number;
  namaLengkap: string;
  role: { name: string };
}

interface Halaqah {
  id: number;
  namaHalaqah: string;
}

interface Jadwal {
  id: number;
  hari: string;
  jamMulai: string;
  jamSelesai: string;
  halaqah: { namaHalaqah: string; guru: { namaLengkap: string } };
}

interface Pengumuman {
  id: number;
  judul: string;
  isi: string;
  tanggal: string;
}

interface ActiveUser {
  id: number;
  namaLengkap: string;
  username: string;
  role: string;
  lastActivity: string;
  avatar: string | null;
}

interface LoginActivityData {
  activeUsers: ActiveUser[];
  totalActive: number;
  totalUsers: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [halaqah, setHalaqah] = useState<Halaqah[]>([]);
  const [jadwal, setJadwal] = useState<Jadwal[]>([]);
  const [pengumuman, setPengumuman] = useState<Pengumuman[]>([]);
  const [loginActivity, setLoginActivity] = useState<LoginActivityData | null>(null);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Fetch data
  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch comprehensive dashboard data
      const [dashboardRes, usersRes, halaqahRes, jadwalRes, pengumumanRes, loginActivityRes] = await Promise.all([
        fetch("/api/analytics/dashboard"),
        fetch("/api/users"),
        fetch("/api/halaqah"),
        fetch("/api/jadwal"),
        fetch("/api/pengumuman"),
        fetch("/api/analytics/login-activity"),
      ]);

      if (dashboardRes.ok) {
        const dashboardData = await dashboardRes.json();
        setDashboardStats(dashboardData);
      }
      if (usersRes.ok) setUsers(await usersRes.json());
      if (halaqahRes.ok) setHalaqah(await halaqahRes.json());
      if (jadwalRes.ok) setJadwal(await jadwalRes.json());
      if (pengumumanRes.ok) setPengumuman(await pengumumanRes.json());
      if (loginActivityRes.ok) setLoginActivity(await loginActivityRes.json());
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Statistics from dashboard API
  const totalSantri = dashboardStats?.overview?.totalSantri || 0;
  const totalGuru = dashboardStats?.overview?.totalGuru || 0;
  const totalHalaqah = dashboardStats?.overview?.totalHalaqah || 0;
  const totalJadwal = dashboardStats?.overview?.totalJadwal || 0;
  const totalPengumuman = dashboardStats?.overview?.totalPengumuman || 0;
  const hafalanRate = dashboardStats?.performance?.hafalanRate || 0;
  const attendanceRate = dashboardStats?.performance?.attendanceRate || 0;

  // Today's schedule
  const today = new Date().toLocaleDateString("id-ID", { weekday: "long" });
  const todaySchedule = jadwal.filter(j => j.hari === today);

  // Recent announcements
  const recentPengumuman = Array.isArray(pengumuman) ? pengumuman.slice(0, 3) : [];

  return (
    <LayoutApp>
      <div style={{ padding: "24px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <Title level={2}>Dashboard Admin</Title>
          <Avatar size="large" icon={<UserOutlined />} />
        </div>

        {/* Statistics Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={4}>
            <Card>
              <Statistic
                title="Total Santri"
                value={totalSantri}
                prefix={<BookOutlined />}
                valueStyle={{ color: "#3f8600" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Card>
              <Statistic
                title="Total Guru"
                value={totalGuru}
                prefix={<TeamOutlined />}
                valueStyle={{ color: "#1890ff" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Card>
              <Statistic
                title="Total Halaqah"
                value={totalHalaqah}
                prefix={<CalendarOutlined />}
                valueStyle={{ color: "#722ed1" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Card>
              <Statistic
                title="Total Jadwal"
                value={totalJadwal}
                prefix={<CalendarOutlined />}
                valueStyle={{ color: "#fa8c16" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Card>
              <Statistic
                title="Hafalan Rate"
                value={hafalanRate}
                suffix="%"
                prefix={<BookOutlined />}
                valueStyle={{ color: "#52c41a" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Card>
              <Statistic
                title="Attendance"
                value={attendanceRate}
                suffix="%"
                prefix={<UserOutlined />}
                valueStyle={{ color: "#eb2f96" }}
              />
            </Card>
          </Col>
        </Row>

        {/* Active Users */}
        <Card
          title={
            <span>
              <UserOutlined style={{ marginRight: 8, color: '#fff' }} />
              👥 Pengguna Aktif Saat Ini
            </span>
          }
          style={{
            marginTop: 24,
            borderRadius: 16,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            background: 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s ease'
          }}
          styles={{
            header: {
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
              color: 'white',
              borderRadius: '16px 16px 0 0',
              padding: '20px 24px',
              fontSize: '16px',
              fontWeight: '600',
              boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)'
            }
          }}
          bodyStyle={{
            padding: '24px',
            background: 'transparent'
          }}
          extra={
            <div style={{ color: 'white', fontSize: '14px', fontWeight: '500' }}>
              {loginActivity ? `${loginActivity.totalActive} dari ${loginActivity.totalUsers} pengguna` : 'Memuat...'}
            </div>
          }
        >
          {loginActivity && loginActivity.activeUsers.length > 0 ? (
            <List
              dataSource={loginActivity.activeUsers.slice(0, 8)} // Show max 8 users
              renderItem={(user) => (
                <List.Item
                  style={{
                    padding: '12px 0',
                    borderBottom: '1px solid rgba(0,0,0,0.05)',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(102, 126, 234, 0.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <List.Item.Meta
                    avatar={
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #667eea, #764ba2)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: '600',
                          fontSize: '16px',
                          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                        }}
                      >
                        {user.namaLengkap.charAt(0).toUpperCase()}
                      </div>
                    }
                    title={
                      <div style={{ fontWeight: '600', color: '#333', marginBottom: 4 }}>
                        {user.namaLengkap}
                      </div>
                    }
                    description={
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#666', fontSize: '12px' }}>
                          @{user.username} • {user.role}
                        </span>
                        <span style={{
                          color: '#52c41a',
                          fontSize: '11px',
                          background: 'rgba(82, 196, 26, 0.1)',
                          padding: '2px 8px',
                          borderRadius: '10px',
                          fontWeight: '500'
                        }}>
                          ● Online
                        </span>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: '#999',
              fontSize: '14px'
            }}>
              <UserOutlined style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }} />
              <div>Tidak ada pengguna aktif saat ini</div>
            </div>
          )}
        </Card>

        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Card
              title="Jadwal Hari Ini"
              variant="borderless"
              extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => router.push('/admin/jadwal')}>Tambah Jadwal</Button>}
            >
              <List
                dataSource={todaySchedule}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      title={`${item.halaqah.namaHalaqah} - ${item.halaqah.guru.namaLengkap}`}
                      description={`${item.jamMulai} - ${item.jamSelesai}`}
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card
              title="Pengumuman Terbaru"
              variant="borderless"
              extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => router.push('/admin/pengumuman')}>Tambah Pengumuman</Button>}
            >
              <List
                dataSource={recentPengumuman}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      title={item.judul}
                      description={item.isi.substring(0, 100) + "..."}
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>

        {/* Notifications Panel */}
        <Card title="Notifikasi" style={{ marginTop: 24 }}>
          <List
            dataSource={[]} // Placeholder for notifications
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  avatar={<NotificationOutlined />}
                  title="Notifikasi Title"
                  description="Notifikasi description"
                />
              </List.Item>
            )}
          />
        </Card>
      </div>
    </LayoutApp>
  );
}