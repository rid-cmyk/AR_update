"use client";

import { useEffect, useState, useCallback } from "react";
import { Row, Col, Card, List, Avatar, Typography, Space, Button, Tag, Spin } from "antd";
import {
  UserOutlined,
  BookOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  CalendarOutlined,
  SettingOutlined,
  PlusOutlined,
  EyeOutlined,
  TrophyOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import LayoutApp from "@/components/layout/LayoutApp";
import PageHeader from "@/components/layout/PageHeader";
import StatCard from "@/components/layout/StatCard";
import PengumumanWidget from "@/components/pengumuman/PengumumanWidget";
import Link from "next/link";
import { useRouter } from "next/navigation";

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

export default function GuruDashboard() {
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [halaqahData, setHalaqahData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const router = useRouter();

  // Fetch halaqah data for this guru
  const fetchHalaqahData = async () => {
    try {
      const response = await fetch("/api/guru/dashboard");
      if (response.ok) {
        const data = await response.json();
        console.log("Dashboard data:", data);

        // Fetch jadwal for each halaqah
        const halaqahWithJadwal = await Promise.all(
          data.halaqah.map(async (halaqah: any) => {
            try {
              console.log(`Fetching jadwal for halaqah ${halaqah.id}`);
              const jadwalResponse = await fetch(`/api/jadwal/halaqah/${halaqah.id}`);
              console.log(`Jadwal response for halaqah ${halaqah.id}:`, jadwalResponse.status);

              if (jadwalResponse.ok) {
                const jadwalData = await jadwalResponse.json();
                console.log(`Jadwal data for halaqah ${halaqah.id}:`, jadwalData);

                return {
                  ...halaqah,
                  jadwal: jadwalData.map((j: any) => ({
                    id: j.id,
                    hari: j.hari,
                    waktuMulai: j.jamMulai ? new Date(j.jamMulai).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '',
                    waktuSelesai: j.jamSelesai ? new Date(j.jamSelesai).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '',
                    materi: j.materi
                  }))
                };
              } else {
                console.log(`No jadwal found for halaqah ${halaqah.id}`);
              }
            } catch (jadwalError) {
              console.error(`Error fetching jadwal for halaqah ${halaqah.id}:`, jadwalError);
            }
            return halaqah;
          })
        );

        console.log("Final halaqah data with jadwal:", halaqahWithJadwal);
        setHalaqahData({
          ...data,
          halaqah: halaqahWithJadwal
        });
      }
    } catch (error) {
      console.error("Error fetching halaqah data:", error);
    }
  };

  // Fetch analytics data
  const fetchAnalyticsData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/analytics/guru-dashboard");
      if (response.ok) {
        const data = await response.json();
        setDashboardStats(data);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error("Error fetching guru dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Navigation handlers
  const handleNavigate = (path: string) => {
    router.push(path);
  };

  useEffect(() => {
    fetchHalaqahData();
    fetchAnalyticsData();
    // Auto refresh every 30 seconds
    const interval = setInterval(() => {
      fetchAnalyticsData();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchAnalyticsData]);

  // Statistics from API
  const totalSantriAktif = dashboardStats?.overview?.totalSantri || 0;
  const totalHafalanToday = dashboardStats?.overview?.totalHafalanToday || 0;
  const absensiHadir = dashboardStats?.overview?.absensiHadir || 0;
  const absensiTotal = dashboardStats?.overview?.absensiTotal || 0;
  const absensiRate = dashboardStats?.overview?.absensiRate || 0;
  const targetTertunda = dashboardStats?.overview?.targetTertunda || 0;

  return (
    <LayoutApp>
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
                  title="Santri Aktif"
                  value={totalSantriAktif}
                  icon={<UserOutlined />}
                  color="#3f8600"
                  trend={{ value: 5, isPositive: true, label: "santri baru" }}
                  onClick={() => handleNavigate("/guru/santri")}
                />
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <StatCard
                  title="Hafalan Hari Ini"
                  value={totalHafalanToday}
                  icon={<BookOutlined />}
                  color="#1890ff"
                  trend={{ value: 12, isPositive: true, label: "hafalan baru" }}
                  onClick={() => handleNavigate("/guru/hafalan")}
                />
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <StatCard
                  title="Absensi Rate"
                  value={`${absensiRate}%`}
                  icon={<CheckCircleOutlined />}
                  color={absensiRate >= 80 ? "#52c41a" : "#ff4d4f"}
                  trend={{ value: 3, isPositive: absensiRate >= 80, label: "vs minggu lalu" }}
                  onClick={() => handleNavigate("/guru/absensi")}
                />
              </Col>
              <Col xs={24} sm={12} lg={6}>
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
          </>
        )}

        {/* Halaqah Information */}
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
                    <Col xs={24} md={12} lg={8} key={halaqah.id}>
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
                              dataSource={halaqah.santri.slice(0, 3)} // Show first 3 santri
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
                            {halaqah.santri.length > 3 && (
                              <Text style={{ fontSize: '11px', color: '#999' }}>
                                +{halaqah.santri.length - 3} santri lainnya
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
                              dataSource={halaqah.jadwal.slice(0, 3)} // Show first 3 jadwal
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
                            {halaqah.jadwal.length > 3 && (
                              <Text style={{ fontSize: '11px', color: '#999' }}>
                                +{halaqah.jadwal.length - 3} jadwal lainnya
                              </Text>
                            )}
                          </div>
                        )}
                      </Card>
                    </Col>
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
                  <strong>📖 Input Hafalan:</strong>
                  <p style={{ 
                    margin: '8px 0',
                    color: '#666',
                    fontSize: '14px' 
                  }}>Catat perkembangan hafalan santri setiap hari</p>
                </div>
                <div>
                  <strong>✅ Input Absensi:</strong>
                  <p style={{ 
                    margin: '8px 0',
                    color: '#666',
                    fontSize: '14px' 
                  }}>Tandai kehadiran santri pada sesi halaqah</p>
                </div>
                <div>
                  <strong>🎯 Kelola Target:</strong>
                  <p style={{ 
                    margin: '8px 0',
                    color: '#666',
                    fontSize: '14px' 
                  }}>Tetapkan dan pantau target hafalan santri</p>
                </div>
              </Space>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card
              title="Status Halaqah"
              variant="outlined"
              style={{ height: '100%' }}
            >
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <TeamOutlined style={{ 
                    color: "#1890ff",
                    marginRight: 12,
                    fontSize: '18px' 
                  }} />
                  <div>
                    <div style={{ fontSize: '14px', color: '#666' }}>Total Halaqah</div>
                    <div style={{ 
                      fontSize: '16px',
                      fontWeight: 'bold',
                      color: "#1890ff" 
                    }}>{halaqahData?.totalHalaqah || 0}</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <UserOutlined style={{ 
                    color: "#52c41a",
                    marginRight: 12,
                    fontSize: '18px' 
                  }} />
                  <div>
                    <div style={{ fontSize: '14px', color: '#666' }}>Total Santri</div>
                    <div style={{ 
                      fontSize: '16px',
                      fontWeight: 'bold',
                      color: "#52c41a" 
                    }}>{halaqahData?.totalSantri || 0}</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <TrophyOutlined style={{ 
                    color: "#fa8c16",
                    marginRight: 12,
                    fontSize: '18px' 
                  }} />
                  <div>
                    <div style={{ fontSize: '14px', color: '#666' }}>Performance</div>
                    <div style={{ 
                      fontSize: '16px',
                      fontWeight: 'bold',
                      color: "#fa8c16" 
                    }}>Excellent</div>
                  </div>
                </div>
              </Space>
            </Card>
          </Col>
        </Row>

        {/* Halaqah Performance */}
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card 
              title={
                <Space>
                  <TeamOutlined />
                  <span>Halaqah Performance</span>
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
                  <Text>Hafalan Rate</Text>
                  <Space>
                    <Text strong style={{ fontSize: 16 }}>{dashboardStats?.overview?.hafalanRate || 0}%</Text>
                    <Tag color="green">Baik</Tag>
                  </Space>
                </div>
                <div style={{ 
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center' 
                }}>
                  <Text>Absensi Rate</Text>
                  <Space>
                    <Text strong style={{ fontSize: 16 }}>{absensiRate}%</Text>
                    <Tag color={absensiRate >= 80 ? "green" : "orange"}>
                      {absensiRate >= 80 ? "Excellent" : "Perlu Perhatian"}
                    </Tag>
                  </Space>
                </div>
                <div style={{ 
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center' 
                }}>
                  <Text>Target Completion</Text>
                  <Space>
                    <Text strong style={{ fontSize: 16 }}>85%</Text>
                    <Tag color="blue">On Track</Tag>
                  </Space>
                </div>
                <div style={{ 
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center' 
                }}>
                  <Text>Santri Progress</Text>
                  <Space>
                    <Text strong style={{ fontSize: 16 }}>92%</Text>
                    <Tag color="purple">Excellent</Tag>
                  </Space>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <PengumumanWidget 
              userRole="guru"
              maxItems={4}
              title="Pengumuman Terbaru"
              height={300}
            />
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
    </LayoutApp>
  );
}