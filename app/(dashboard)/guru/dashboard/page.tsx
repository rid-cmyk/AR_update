"use client";

import { useEffect, useState } from "react";
import { Row, Col, Card, Statistic, List, Avatar, Typography, Divider } from "antd";
import {
  UserOutlined,
  BookOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import LayoutApp from "@/components/layout/LayoutApp";

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
  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/analytics/dashboard");
      if (response.ok) {
        const data = await response.json();
        setDashboardStats(data);
      }
    } catch (error) {
      console.error("Error fetching guru dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHalaqahData();
    fetchAnalyticsData();
  }, []);

  // Statistics from API
  const totalSantriAktif = dashboardStats?.overview?.totalSantri || 0;
  const totalHafalanToday = dashboardStats?.overview?.totalHafalanToday || 0;
  const absensiHadir = dashboardStats?.overview?.absensiHadir || 0;
  const absensiTotal = dashboardStats?.overview?.absensiTotal || 0;
  const absensiRate = dashboardStats?.overview?.absensiRate || 0;
  const targetTertunda = dashboardStats?.overview?.targetTertunda || 0;

  return (
    <LayoutApp>
      <div style={{ padding: "24px 0" }}>
        <div style={{ marginBottom: 32 }}>
          <Title level={1} style={{ marginBottom: 8 }}>🕌 Guru Dashboard</Title>
          <Text style={{ fontSize: '16px', color: '#666' }}>
            Kelola halaqah dan pantau perkembangan santri Anda
          </Text>
        </div>

        {/* Statistics Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
          <Col xs={24} sm={12} md={4}>
            <Card>
              <Statistic
                title="Santri Aktif"
                value={totalSantriAktif}
                prefix={<UserOutlined />}
                valueStyle={{ color: "#3f8600" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Card>
              <Statistic
                title="Hafalan Hari Ini"
                value={totalHafalanToday}
                prefix={<BookOutlined />}
                valueStyle={{ color: "#1890ff" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Card>
              <Statistic
                title="Absensi Rate"
                value={absensiRate}
                suffix="%"
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: absensiRate >= 80 ? "#52c41a" : "#ff4d4f" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Card>
              <Statistic
                title="Target Tertunda"
                value={targetTertunda}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: "#fa8c16" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Card>
              <Statistic
                title="Total Absensi"
                value={`${absensiHadir}/${absensiTotal}`}
                prefix={<UserOutlined />}
                valueStyle={{ color: "#722ed1" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Card>
              <Statistic
                title="Hafalan Rate"
                value={dashboardStats?.overview?.hafalanRate || 0}
                suffix="%"
                prefix={<BookOutlined />}
                valueStyle={{ color: "#eb2f96" }}
              />
            </Card>
          </Col>
        </Row>

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
              title="Aksi Cepat"
              variant="outlined"
            >
              <div style={{ marginBottom: 16 }}>
                <BookOutlined style={{ color: '#1890ff', marginRight: 8 }} />
                <Text strong>Input Hafalan:</Text>
                <br />
                <Text style={{ color: '#666', fontSize: '14px' }}>
                  Catat perkembangan hafalan santri setiap hari
                </Text>
              </div>
              <div style={{ marginBottom: 16 }}>
                <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                <Text strong>Input Absensi:</Text>
                <br />
                <Text style={{ color: '#666', fontSize: '14px' }}>
                  Tandai kehadiran santri pada sesi halaqah
                </Text>
              </div>
              <div>
                <ClockCircleOutlined style={{ color: '#fa8c16', marginRight: 8 }} />
                <Text strong>Kelola Target:</Text>
                <br />
                <Text style={{ color: '#666', fontSize: '14px' }}>
                  Tetapkan dan pantau target hafalan santri
                </Text>
              </div>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card
              title="Status Halaqah"
              variant="outlined"
            >
              <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
                <TeamOutlined style={{ color: "#1890ff", marginRight: 8 }} />
                <span>Total Halaqah: <strong>{halaqahData?.totalHalaqah || 0}</strong></span>
              </div>
              <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
                <UserOutlined style={{ color: "#52c41a", marginRight: 8 }} />
                <span>Total Santri: <strong>{halaqahData?.totalSantri || 0}</strong></span>
              </div>
              <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
                <BookOutlined style={{ color: "#1890ff", marginRight: 8 }} />
                <span>Hafalan Hari Ini: <strong>{totalHafalanToday}</strong></span>
              </div>
              <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
                <CheckCircleOutlined style={{ color: absensiRate >= 80 ? "#52c41a" : "#ff4d4f", marginRight: 8 }} />
                <span>Rate Absensi: <strong style={{ color: absensiRate >= 80 ? "#52c41a" : "#ff4d4f" }}>{absensiRate}%</strong></span>
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                <ClockCircleOutlined style={{ color: "#fa8c16", marginRight: 8 }} />
                <span>Target Tertunda: <strong>{targetTertunda}</strong></span>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </LayoutApp>
  );
}