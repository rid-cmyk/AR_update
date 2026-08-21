"use client";

import { useEffect, useCallback } from "react";
import { Row, Col, Card, Space, Spin, Button, Typography, Tag, Avatar, Progress } from "antd";
import {
  UserOutlined,
  BookOutlined,
  CalendarOutlined,
  TrophyOutlined,
  BarChartOutlined,
  HomeOutlined,
  ClockCircleOutlined,
  WhatsAppOutlined,
  BellOutlined,
} from "@ant-design/icons";
import StudentAnalyticsTab from "@/components/analytics/StudentAnalyticsTab";
import StatCard from "@/components/layout/StatCard";
import AdminHeaderCard from "@/components/super-admin/layout/AdminHeaderCard";
import { useRouter } from "next/navigation";
import { useVisibilityAwareRefresh } from "@/hooks/useVisibilityAwareRefresh";
import styles from "./OrtuDashboard.module.css";

const { Title, Text } = Typography;

interface Child {
  id: number;
  username: string;
  namaLengkap: string;
  foto?: string | null;
  role: {
    id: number;
    name: string;
  };
  hafalanProgress?: number;
  attendanceRate?: number;
  totalPrestasi?: number;
  lastActivity?: string;
}

interface OrtuDashboardData {
  data?: {
    children: Child[];
    overview: {
      totalChildren: number;
      avgHafalanProgress: number;
      avgAttendanceRate: number;
      totalPrestasi: number;
    };
  };
  // Fallbacks for older shape if needed
  children?: Child[];
  overview?: any;
}

export default function OrtuDashboardClient({ data }: { data: OrtuDashboardData }) {
  const router = useRouter();

  // Navigation handlers
  const handleViewChild = (childId: number) => {
    router.push(`/ortu/hafalan`);
  };

  const handleChatGuru = async () => {
    try {
      const res = await fetch("/api/ortu/guru-halaqah");
      if (res.ok) {
        const json = await res.json();
        if (json.data && json.data.length > 0) {
          const guru = json.data[0];
          if (guru.noTlp) {
            const cleaned = guru.noTlp.replace(/\D/g, "");
            const waNumber = cleaned.startsWith("62") ? cleaned : "62" + cleaned.replace(/^0/, "");
            const message = encodeURIComponent(`Assalamualaikum Pak/Bu ${guru.namaGuru},\n\nSaya ingin bertanya tentang perkembangan hafalan anak saya *${guru.namaSantri || ''}*.\n\nTerima kasih.`);
            window.open(`https://wa.me/${waNumber}?text=${message}`, "_blank");
            return;
          }
        }
      }
      alert("Nomor WhatsApp guru belum tersedia atau silakan gunakan tombol floating chat di pojok kanan bawah.");
    } catch {
      alert("Gagal membuka obrolan WhatsApp.");
    }
  };

  useVisibilityAwareRefresh(120000);

  return (
    <>
      <div className={styles.container}>
        {/* Header */}
        <AdminHeaderCard
          title="Dashboard Orang Tua"
          subtitle="Pantau perkembangan anak-anak Anda di tahfidz dengan penuh kasih sayang"
          tags={[
            { label: "Dashboard Orang Tua", icon: <HomeOutlined /> },
            { label: "Online", icon: <ClockCircleOutlined /> }
          ]}
          actions={
            (data.data?.overview?.totalChildren || data.overview?.totalChildren || 0) > 0 ? (
              <Tag color="blue" className={styles.tagTotalChildren}>
                {data.data?.overview?.totalChildren || data.overview?.totalChildren || 0} Anak Terdaftar
              </Tag>
            ) : undefined
          }
        />

        {/* Statistics Cards */}
        <Row gutter={[24, 24]} className={styles.statsRow}>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Total Anak"
              value={data.data?.overview?.totalChildren || data.overview?.totalChildren || 0}
              icon={<UserOutlined />}
              color="#219ebc"
              trend={{ value: 0, isPositive: true, label: "anak terdaftar" }}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Rata-rata Hafalan"
              value={`${data.data?.overview?.avgHafalanProgress || data.overview?.avgHafalanProgress || 0}%`}
              icon={<BookOutlined />}
              color="#219ebc"
              trend={{ value: 5, isPositive: true, label: "progress bulan ini" }}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Rata-rata Kehadiran"
              value={`${data.data?.overview?.avgAttendanceRate || data.overview?.avgAttendanceRate || 0}%`}
              icon={<CalendarOutlined />}
              color="#8ecae6"
              trend={{ value: 2, isPositive: true, label: "dari bulan lalu" }}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Total Prestasi"
              value={data.data?.overview?.totalPrestasi || data.overview?.totalPrestasi || 0}
              icon={<TrophyOutlined />}
              color="#ffb703"
              trend={{ value: 1, isPositive: true, label: "prestasi baru" }}
            />
          </Col>
        </Row>

        {/* Children Cards */}
        <Card title="👨‍👩‍👧‍👦 Data Anak-Anak" variant="borderless">
          {(data.data?.children || data.children || []).length > 0 ? (
            <Row gutter={[16, 16]}>
              {(data.data?.children || data.children || []).map((child) => (
                <Col xs={24} md={12} lg={8} key={child.id}>
                  <Card
                    hoverable
                    className={styles.childCard}
                    onClick={() => handleViewChild(child.id)}
                  >
                    <div className={styles.childAvatarContainer}>
                      <Avatar
                        size={80}
                        src={child.foto}
                        icon={<UserOutlined />}
                        className={styles.childAvatar}
                      />
                    </div>
                    
                    <div className={styles.childNameContainer}>
                      <Title level={4} className={styles.childName}>
                        {child.namaLengkap}
                      </Title>
                      <Text type="secondary">@{child.username}</Text>
                    </div>

                    <div className={styles.progressContainer}>
                      <div className={styles.progressLabelRow}>
                        <Text className={styles.progressLabel}>Progress Hafalan</Text>
                        <Text className={styles.progressValue}>
                          {child.hafalanProgress || 0}%
                        </Text>
                      </div>
                      <Progress 
                        percent={child.hafalanProgress || 0} 
                        size="small" 
                        strokeColor="#219ebc"
                        showInfo={false}
                      />
                    </div>

                    <div className={styles.progressContainer}>
                      <div className={styles.progressLabelRow}>
                        <Text className={styles.progressLabel}>Tingkat Kehadiran</Text>
                        <Text className={styles.progressValue}>
                          {child.attendanceRate || 0}%
                        </Text>
                      </div>
                      <Progress 
                        percent={child.attendanceRate || 0} 
                        size="small" 
                        strokeColor="#219ebc"
                        showInfo={false}
                      />
                    </div>

                    <div className={styles.prestasiRow}>
                      <div>
                        <TrophyOutlined className={styles.prestasiIcon} />
                        <Text className={styles.prestasiText}>
                          {child.totalPrestasi || 0} Prestasi
                        </Text>
                      </div>
                      <Tag color="blue" className={styles.tagAktif}>
                        Aktif
                      </Tag>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <div className={styles.emptyChildrenContainer}>
              <UserOutlined className={styles.emptyIcon} />
              <Title level={4} className={styles.emptyTitle}>Belum Ada Data Anak</Title>
              <Text type="secondary">
                Hubungi admin untuk menambahkan data anak Anda ke sistem
              </Text>
            </div>
          )}
        </Card>

        {/* Grafik Visual & Analitik Perkembangan Hafalan Anak */}
        {data.children && data.children.length > 0 && (
          <Card
            title="📈 Grafik Visual & Analitik Perkembangan Hafalan Anak"
            variant="borderless"
            className={styles.analyticsCard}
          >
            <StudentAnalyticsTab
              santriId={data.children[0].id}
              santriName={data.children[0].namaLengkap}
            />
          </Card>
        )}

        {/* Quick Actions */}
        <Row gutter={[16, 16]} className={styles.quickActionsRow}>
          <Col xs={24} md={8}>
            <Card
              title="📊 Laporan Perkembangan"
              variant="borderless"
              className={styles.actionCard}
            >
              <Space direction="vertical" size="middle" className={styles.actionSpace}>
                <div>
                  <strong>📈 Progress Hafalan:</strong>
                  <p className={styles.actionDesc}>
                    Lihat perkembangan hafalan anak-anak secara detail
                  </p>
                </div>
                <div>
                  <strong>📅 Riwayat Kehadiran:</strong>
                  <p className={styles.actionDesc}>
                    Pantau kehadiran dan aktivitas harian
                  </p>
                </div>
                <Button
                  type="primary"
                  icon={<BarChartOutlined />}
                  onClick={() => router.push('/ortu/raport')}
                  className={styles.btnFullWidth}
                >
                  Lihat Laporan Lengkap
                </Button>
              </Space>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card
              title="💬 Konsultasi Guru Halaqah"
              variant="borderless"
              className={styles.actionCard}
            >
              <Space direction="vertical" size="middle" className={styles.actionSpace}>
                <div>
                  <strong>🟢 WhatsApp Langsung:</strong>
                  <p className={styles.actionDesc}>
                    Hubungi ustadz/guru pembimbing hafalan anak Anda
                  </p>
                </div>
                <div>
                  <strong>⚡ Respon Cepat:</strong>
                  <p className={styles.actionDesc}>
                    Disertai pesan pembuka otomatis ke nomor guru
                  </p>
                </div>
                <Button
                  type="primary"
                  icon={<WhatsAppOutlined />}
                  onClick={handleChatGuru}
                  className={styles.btnWhatsApp}
                >
                  Hubungi via WhatsApp
                </Button>
              </Space>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card title="📢 Pengumuman Halaqah" variant="borderless" className={styles.actionCard}>
              <Space direction="vertical" size="middle" className={styles.actionSpace}>
                <div>
                  <strong>🔔 Informasi & Jadwal:</strong>
                  <p className={styles.actionDesc}>
                    Pantau pengumuman terbaru dari halaqah anak
                  </p>
                </div>
                <div>
                  <strong>📋 Kegiatan Tahfizh:</strong>
                  <p className={styles.actionDesc}>
                    Jadwal ujian, tasmi, dan agenda pondok
                  </p>
                </div>
                <Button
                  type="primary"
                  icon={<BellOutlined />}
                  onClick={() => router.push('/ortu/pengumuman')}
                  className={styles.btnFullWidth}
                >
                  Lihat Pengumuman
                </Button>
              </Space>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
}
