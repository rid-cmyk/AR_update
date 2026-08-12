"use client";

import React from "react";
import { Row, Col, Space, Button, Tag, Typography } from "antd";
import {
  UserOutlined,
  BookOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import PageHeader from "@/components/layout/PageHeader";
import StatCard from "@/components/layout/StatCard";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useVisibilityAwareRefresh } from "@/hooks/useVisibilityAwareRefresh";
import styles from "./GuruDashboard.module.css";
import GuruAbsensiChart from "@/components/guru/dashboard/GuruAbsensiChart";
import GuruPerformanceChart from "@/components/guru/dashboard/GuruPerformanceChart";
import GuruHafalanChart from "@/components/guru/dashboard/GuruHafalanChart";
import HalaqahSection from "@/components/guru/dashboard/HalaqahSection";
import { DashboardData, OverviewStats } from "@/components/guru/dashboard/guruDashboardTypes";
import { computeAbsensiPieData, computePerfBarData } from "@/lib/utils/guruDashboardUtils";

interface GuruDashboardClientProps {
  dashboardStats: any;
  halaqahData: DashboardData;
}

export default function GuruDashboardClient({ dashboardStats, halaqahData }: GuruDashboardClientProps) {
  const router = useRouter();

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  useVisibilityAwareRefresh(120000);

  const overview: OverviewStats = {
    totalSantri: dashboardStats?.overview?.totalSantri || 0,
    totalHafalanToday: dashboardStats?.overview?.totalHafalanToday || 0,
    absensiRate: dashboardStats?.overview?.absensiRate || 0,
    targetTertunda: dashboardStats?.overview?.targetTertunda || 0,
    absensiHadir: dashboardStats?.overview?.absensiHadir || 0,
    absensiTidakHadir: dashboardStats?.overview?.absensiTidakHadir || 0,
    hafalanRate: dashboardStats?.overview?.hafalanRate || 0,
  };

  const hafalanProgress = dashboardStats?.hafalanProgress || [];
  const absensiPieData = computeAbsensiPieData(overview.absensiHadir, overview.absensiTidakHadir);
  const perfBarData = computePerfBarData(overview);

  return (
    <div className={styles.container}>
      <PageHeader
        title="Dashboard Guru"
        subtitle="Kelola halaqah dan pantau perkembangan santri Anda"
        breadcrumbs={[{ title: "Guru Dashboard" }]}
        extra={
          <Space>
            <Tag icon={<BookOutlined />} color="green" className={styles.headerTag}>
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

      <Row gutter={[12, 12]} className={styles.statRow}>
        <Col xs={12} sm={12} lg={6}>
          <StatCard
            title="Santri Aktif"
            value={overview.totalSantri}
            icon={<UserOutlined />}
            color="#023047"
            trend={{ value: 5, isPositive: true, label: "santri baru" }}
            onClick={() => handleNavigate("/guru/santri")}
          />
        </Col>
        <Col xs={12} sm={12} lg={6}>
          <StatCard
            title="Hafalan Hari Ini"
            value={overview.totalHafalanToday}
            icon={<BookOutlined />}
            color="#219ebc"
            trend={{ value: 12, isPositive: true, label: "hafalan baru" }}
            onClick={() => handleNavigate("/guru/hafalan")}
          />
        </Col>
        <Col xs={12} sm={12} lg={6}>
          <StatCard
            title="Absensi Rate"
            value={`${overview.absensiRate}%`}
            icon={<CheckCircleOutlined />}
            color={overview.absensiRate >= 80 ? "#219ebc" : "#fb8500"}
            trend={{ value: 3, isPositive: overview.absensiRate >= 80, label: "vs minggu lalu" }}
            onClick={() => handleNavigate("/guru/absensi")}
          />
        </Col>
        <Col xs={12} sm={12} lg={6}>
          <StatCard
            title="Target Tertunda"
            value={overview.targetTertunda}
            icon={<ClockCircleOutlined />}
            color="#ffb703"
            trend={{ value: 2, isPositive: false, label: "perlu perhatian" }}
            onClick={() => handleNavigate("/guru/target")}
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]} className={styles.chartRow}>
        <Col xs={24} lg={12}>
          <GuruHafalanChart hafalanProgress={hafalanProgress} />
        </Col>
        <GuruAbsensiChart
          absensiHadir={overview.absensiHadir}
          absensiTidakHadir={overview.absensiTidakHadir}
          absensiPieData={absensiPieData}
        />
      </Row>

      <GuruPerformanceChart perfBarData={perfBarData} />

      <Row gutter={[24, 24]} className={styles.chartRow}>
        <Col xs={24}>
          <HalaqahSection halaqah={halaqahData?.halaqah || []} />
        </Col>
      </Row>
    </div>
  );
}
