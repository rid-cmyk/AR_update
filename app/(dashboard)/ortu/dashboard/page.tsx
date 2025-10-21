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
import LayoutApp from "@/components/layout/LayoutApp";

interface OrtuDashboardData {
  anakStats: {
    totalAnak: number;
    totalHafalan: number;
    averageAttendance: number;
    averageProgress: number;
  };
  anakList: Array<{
    id: number;
    namaLengkap: string;
    username: string;
    Hafalan: Array<{
      id: number;
      tanggal: string;
      surat: string;
      ayatMulai: number;
      ayatSelesai: number;
      status: string;
    }>;
    TargetHafalan: Array<{
      id: number;
      surat: string;
      ayatTarget: number;
      deadline: string;
      status: string;
    }>;
    Absensi: Array<{
      id: number;
      status: string;
      tanggal: string;
      jadwal: {
        halaqah: {
          namaHalaqah: string;
        };
      };
    }>;
    Prestasi: Array<{
      id: number;
      namaPrestasi: string;
      keterangan: string;
      tahun: number;
      validated: boolean;
    }>;
    Ujian: Array<{
      id: number;
      jenis: string;
      nilai: number;
      tanggal: string;
    }>;
  }>;
  pengumuman: Array<{
    id: number;
    judul: string;
    isi: string;
    tanggal: string;
    targetAudience: string;
    dibacaOleh: any[];
  }>;
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

      // Calculate stats from real data
      const totalAnak = data.anakList?.length || 0;
      const totalHafalan = data.anakList?.reduce((sum: number, anak: any) =>
        sum + (anak.Hafalan?.length || 0), 0) || 0;

      const totalAbsensi = data.anakList?.reduce((sum: number, anak: any) =>
        sum + (anak.Absensi?.length || 0), 0) || 0;

      const hadirCount = data.anakList?.reduce((sum: number, anak: any) =>
        sum + (anak.Absensi?.filter((a: any) => a.status === 'hadir').length || 0), 0) || 0;

      const averageAttendance = totalAbsensi > 0 ? Math.round((hadirCount / totalAbsensi) * 100) : 0;

      // Calculate average progress based on target completion
      const totalTargets = data.anakList?.reduce((sum: number, anak: any) =>
        sum + (anak.TargetHafalan?.length || 0), 0) || 0;

      const completedTargets = data.anakList?.reduce((sum: number, anak: any) =>
        sum + (anak.TargetHafalan?.filter((t: any) => t.status === 'selesai').length || 0), 0) || 0;

      const averageProgress = totalTargets > 0 ? Math.round((completedTargets / totalTargets) * 100) : 0;

      setDashboardData({
        anakStats: {
          totalAnak,
          totalHafalan,
          averageAttendance,
          averageProgress,
        },
        anakList: data.anakList || [],
        pengumuman: data.pengumuman || [],
      });
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
        anakList: [
          {
            id: 1,
            namaLengkap: "Ahmad",
            username: "ahmad123",
            Hafalan: [
              { id: 1, tanggal: "2024-01-15", surat: "Al-Fatihah", ayatMulai: 1, ayatSelesai: 7, status: "selesai" }
            ],
            TargetHafalan: [
              { id: 1, surat: "Al-Baqarah", ayatTarget: 25, deadline: "2024-02-01", status: "selesai" }
            ],
            Absensi: [
              { id: 1, status: "hadir", tanggal: "2024-01-15", jadwal: { halaqah: { namaHalaqah: "Halaqah Al-Fatihah" } } }
            ],
            Prestasi: [],
            Ujian: []
          }
        ],
        pengumuman: []
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
            📊 Dashboard Anak
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

            {/* Children's Details */}
            <Row gutter={[16, 16]}>
              {dashboardData?.anakList?.map((anak) => (
                <Col xs={24} md={12} lg={8} key={anak.id}>
                  <Card
                    title={`👶 ${anak.namaLengkap}`}
                    bordered={false}
                    style={{ height: '100%' }}
                  >
                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                      <div>
                        <strong>📚 Hafalan Progress:</strong>
                        <p style={{ margin: '4px 0', fontSize: '14px', color: '#666' }}>
                          {anak.Hafalan?.length || 0} sessions completed
                        </p>
                      </div>
                      <div>
                        <strong>🎯 Active Targets:</strong>
                        <p style={{ margin: '4px 0', fontSize: '14px', color: '#666' }}>
                          {anak.TargetHafalan?.filter(t => t.status === 'aktif').length || 0} targets
                        </p>
                      </div>
                      <div>
                        <strong>📅 Attendance:</strong>
                        <p style={{ margin: '4px 0', fontSize: '14px', color: '#666' }}>
                          {anak.Absensi?.filter(a => a.status === 'hadir').length || 0} of {anak.Absensi?.length || 0} sessions
                        </p>
                      </div>
                      {anak.Prestasi && anak.Prestasi.length > 0 && (
                        <div>
                          <strong>🏆 Achievements:</strong>
                          <p style={{ margin: '4px 0', fontSize: '14px', color: '#666' }}>
                            {anak.Prestasi.length} validated achievements
                          </p>
                        </div>
                      )}
                    </Space>
                  </Card>
                </Col>
              ))}
            </Row>

            {/* Announcements */}
            {dashboardData?.pengumuman && dashboardData.pengumuman.length > 0 && (
              <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                <Col xs={24}>
                  <Card title="📢 Recent Announcements" bordered={false}>
                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                      {dashboardData.pengumuman.slice(0, 3).map((pengumuman) => (
                        <div key={pengumuman.id} style={{ padding: '12px', background: '#f9f9f9', borderRadius: '8px' }}>
                          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                            {pengumuman.judul}
                          </div>
                          <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>
                            {pengumuman.isi.length > 100 ? `${pengumuman.isi.substring(0, 100)}...` : pengumuman.isi}
                          </div>
                          <div style={{ fontSize: '12px', color: '#999' }}>
                            {pengumuman.tanggal} • Target: {pengumuman.targetAudience}
                          </div>
                        </div>
                      ))}
                    </Space>
                  </Card>
                </Col>
              </Row>
            )}
          </>
        )}
      </div>
    </LayoutApp>
  );
}