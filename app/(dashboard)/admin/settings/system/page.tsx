"use client"

import { Row, Col, Card, Typography, Button, Progress, Statistic, Space, Tag } from "antd"
import {
  DashboardOutlined,
  SaveOutlined,
  TeamOutlined,
  BookOutlined,
  FileTextOutlined,
  DatabaseOutlined,
  CloudServerOutlined,
  ReloadOutlined,
} from "@ant-design/icons"
import AdminHeaderCard from "@/components/admin/layout/AdminHeaderCard"
import { useSettings } from "@/hooks/useSettings"

const { Title, Text } = Typography

export default function SystemSettingsPage() {
  const { stats, loading, fetchStats } = useSettings()

  const usageStats = [
    { label: "Pengguna", icon: <TeamOutlined />, value: stats.totalUsers, detail: `${stats.activeUsers} aktif`, color: "#1890ff" },
    { label: "Ujian", icon: <BookOutlined />, value: stats.totalUjian, detail: "Semua jenis ujian", color: "#52c41a" },
    { label: "Raport", icon: <FileTextOutlined />, value: stats.totalRaport, detail: "Raport tersimpan", color: "#faad14" },
  ]

  return (
    <>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 0" }}>
        <AdminHeaderCard
          title="Sistem"
          subtitle="Monitoring sistem dan penggunaan resources"
          actions={
            <Button icon={<ReloadOutlined />} onClick={fetchStats} loading={loading}>
              Refresh
            </Button>
          }
        />
        <Space direction="vertical" size={24} style={{ width: "100%" }}>

          <Row gutter={[16, 16]}>
            {usageStats.map((item) => (
              <Col xs={24} sm={8} key={item.label}>
                <Card>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ fontSize: 24, color: item.color }}>{item.icon}</div>
                    <div>
                      <Text type="secondary" style={{ fontSize: 12 }}>{item.label}</Text>
                      <br />
                      <Text strong style={{ fontSize: 20 }}>{item.value}</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 11 }}>{item.detail}</Text>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>

          <Card title={<Space><DatabaseOutlined />Penggunaan Sistem</Space>}>
            <Row gutter={[24, 16]}>
              <Col xs={24} md={8}>
                <div style={{ textAlign: "center" }}>
                  <Progress type="dashboard" percent={stats.cpuUsage} strokeColor="#1890ff" />
                  <br />
                  <Text>CPU Usage</Text>
                </div>
              </Col>
              <Col xs={24} md={8}>
                <div style={{ textAlign: "center" }}>
                  <Progress type="dashboard" percent={stats.memoryUsage} strokeColor="#52c41a" />
                  <br />
                  <Text>Memory Usage</Text>
                </div>
              </Col>
              <Col xs={24} md={8}>
                <div style={{ textAlign: "center" }}>
                  <Progress type="dashboard" percent={stats.diskUsage} strokeColor="#faad14" />
                  <br />
                  <Text>Disk Usage</Text>
                </div>
              </Col>
            </Row>

            <Row gutter={[24, 16]} style={{ marginTop: 24 }}>
              <Col xs={24} sm={8}>
                <Statistic
                  title={<Space><CloudServerOutlined />Uptime</Space>}
                  value={stats.systemUptime}
                  valueStyle={{ fontSize: 16 }}
                />
              </Col>
              <Col xs={24} sm={8}>
                <Statistic
                  title={<Space><DatabaseOutlined />Database Size</Space>}
                  value={stats.dbSize}
                  valueStyle={{ fontSize: 16 }}
                />
              </Col>
              <Col xs={24} sm={8}>
                <Statistic
                  title="Status Sistem"
                  value="Beroperasi"
                  valueStyle={{ fontSize: 16, color: "#52c41a" }}
                />
              </Col>
            </Row>
          </Card>
        </Space>
      </div>
    </>
  )
}
