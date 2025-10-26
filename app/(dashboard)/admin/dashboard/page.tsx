'use client'

import { Card, Col, Row, Button, Typography, Space, Tag } from 'antd'
import { 
  BarChartOutlined, 
  UserOutlined, 
  BookOutlined, 
  FileTextOutlined,
  RiseOutlined,
  CalendarOutlined,
  SettingOutlined,
  PlusOutlined,
  EyeOutlined
} from '@ant-design/icons'

const { Title, Text } = Typography
import { StatistikTemplate } from '@/components/admin/dashboard/StatistikTemplate'
import { SystemStatus } from '@/components/admin/dashboard/SystemStatus'
import Link from 'next/link'

import LayoutApp from '@/components/layout/LayoutApp'
import PageHeader from '@/components/layout/PageHeader'
import StatCard from '@/components/layout/StatCard'
import QuickActions from '@/components/layout/QuickActions'

export default function AdminDashboardPage() {
  return (
    <LayoutApp>
      <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {/* Header */}
      <PageHeader
        title="Dashboard Admin"
        subtitle="Kelola sistem AR-Hafalan dan monitor aktivitas pengguna"
        breadcrumbs={[
          { title: "Admin Dashboard" }
        ]}
        extra={
          <Space>
            <Tag icon={<SettingOutlined />} color="blue" style={{ padding: '8px 16px', fontSize: 14 }}>
              Admin Panel
            </Tag>
            <Link href="/admin/template">
              <Button type="primary" icon={<PlusOutlined />} size="large">
                Kelola Template
              </Button>
            </Link>
          </Space>
        }
      />

      {/* Quick Actions */}
      <QuickActions userRole="admin" />

      {/* Statistics Cards */}
      <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Total Template"
            value="24"
            icon={<FileTextOutlined />}
            color="#1890ff"
            trend={{ value: 12, isPositive: true, label: "bulan ini" }}
            onClick={() => window.location.href = "/admin/template"}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Ujian Aktif"
            value="8"
            icon={<BookOutlined />}
            color="#52c41a"
            trend={{ value: 25, isPositive: true, label: "minggu ini" }}
            onClick={() => window.location.href = "/admin/verifikasi-ujian"}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Raport Generated"
            value="156"
            icon={<BarChartOutlined />}
            color="#722ed1"
            trend={{ value: 8, isPositive: false, label: "vs bulan lalu" }}
            onClick={() => window.location.href = "/admin/raport"}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Total Pengguna"
            value="342"
            icon={<UserOutlined />}
            color="#fa8c16"
            trend={{ value: 15, isPositive: true, label: "pengguna baru" }}
            onClick={() => window.location.href = "/admin/halaqah"}
          />
        </Col>
      </Row>

      {/* Main Statistics */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <Title level={3} style={{ margin: 0, color: '#1f2937' }}>Detail Statistik Template</Title>
          <Link href="/admin/template?tab=daftar">
            <Button icon={<EyeOutlined />}>
              Lihat Semua
            </Button>
          </Link>
        </div>
        <StatistikTemplate />
      </div>

      {/* System Status */}
      <div style={{ marginBottom: 32 }}>
        <Title level={3} style={{ margin: '0 0 24px 0', color: '#1f2937' }}>Status Sistem</Title>
        <SystemStatus />
      </div>

      {/* Recent Activity Summary */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card 
            title={
              <Space>
                <RiseOutlined />
                <span>Tren Penggunaan</span>
              </Space>
            }
            style={{ height: '100%' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text>Ujian dibuat minggu ini</Text>
                <Space>
                  <Text strong style={{ fontSize: 16 }}>23</Text>
                  <Tag color="green">+15%</Tag>
                </Space>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text>Raport di-generate</Text>
                <Space>
                  <Text strong style={{ fontSize: 16 }}>12</Text>
                  <Tag color="blue">+8%</Tag>
                </Space>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text>Template baru</Text>
                <Space>
                  <Text strong style={{ fontSize: 16 }}>3</Text>
                  <Tag color="purple">New</Tag>
                </Space>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text>Pengguna aktif</Text>
                <Space>
                  <Text strong style={{ fontSize: 16 }}>89</Text>
                  <Tag color="orange">+5%</Tag>
                </Space>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card 
            title={
              <Space>
                <UserOutlined />
                <span>Performa Halaqah</span>
              </Space>
            }
            style={{ height: '100%' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { nama: 'Halaqah Al-Fatihah', nilai: 87.5, santri: 25, trend: '+2.3' },
                { nama: 'Halaqah Al-Baqarah', nilai: 84.2, santri: 28, trend: '+1.8' },
                { nama: 'Halaqah Ali Imran', nilai: 89.1, santri: 22, trend: '+3.1' },
                { nama: 'Halaqah An-Nisa', nilai: 82.8, santri: 26, trend: '+0.9' }
              ].map((halaqah, index) => (
                <div 
                  key={index} 
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: 12,
                    backgroundColor: '#f8fafc',
                    borderRadius: 8,
                    border: '1px solid #e2e8f0'
                  }}
                >
                  <div>
                    <Text strong style={{ fontSize: 14 }}>{halaqah.nama}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>{halaqah.santri} santri</Text>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <Text strong style={{ fontSize: 18, color: '#1f2937' }}>{halaqah.nilai}</Text>
                    <br />
                    <Tag color="green" style={{ fontSize: 10 }}>
                      {halaqah.trend}
                    </Tag>
                  </div>
                </div>
              ))}
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
            }}>
              Sistem AR-Hafalan v2.0
            </Title>
            <Text style={{ 
              color: "#64748b", 
              fontSize: 14 
            }}>
              Template & Raport Management System
            </Text>
          </div>
          <div style={{ textAlign: "right" }}>
            <Text style={{ 
              color: "#64748b", 
              fontSize: 14,
              display: "block" 
            }}>
              Last updated
            </Text>
            <Text style={{ 
              color: "#1e293b", 
              fontWeight: 500,
              fontSize: 14 
            }}>
              Today, 14:30
            </Text>
          </div>
        </div>
      </Card>
      </div>
    </LayoutApp>
  )
}