'use client'

import { Card, Col, Row, Button, Typography, Space, Tag, Progress, Avatar } from 'antd'
import {
  BarChartOutlined,
  UserOutlined,
  BookOutlined,
  FileTextOutlined,
  RiseOutlined,
  CalendarOutlined,
  SettingOutlined,
  PlusOutlined,
  EyeOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  TeamOutlined
} from '@ant-design/icons'

const { Title, Text } = Typography
import { StatistikTemplate } from '@/components/admin/dashboard/StatistikTemplate'
// import { SystemStatus } from '@/components/admin/dashboard/SystemStatus'
import Link from 'next/link'

import LayoutApp from '@/components/layout/LayoutApp'
import PageHeader from '@/components/layout/PageHeader'
import StatCard from '@/components/layout/StatCard'
import QuickActions from '@/components/layout/QuickActions'

export default function AdminDashboardPage() {
  return (
    <LayoutApp>
      <div style={{ padding: '0 4px' }}>
        {/* Modern Header */}
        <div style={{ 
          marginBottom: 32,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 20,
          padding: '32px 40px',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '50%',
            filter: 'blur(40px)'
          }} />
          <div style={{
            position: 'absolute',
            bottom: -30,
            left: -30,
            width: 150,
            height: 150,
            background: 'rgba(255, 255, 255, 0.08)',
            borderRadius: '50%',
            filter: 'blur(30px)'
          }} />
          
          <Row align="middle" justify="space-between">
            <Col>
              <Space direction="vertical" size={4}>
                <Title level={2} style={{ 
                  color: 'white', 
                  margin: 0,
                  fontSize: 28,
                  fontWeight: 700
                }}>
                  Dashboard Admin
                </Title>
                <Text style={{ 
                  color: 'rgba(255, 255, 255, 0.9)', 
                  fontSize: 16,
                  fontWeight: 400
                }}>
                  Kelola sistem AR-Hafalan dan monitor aktivitas
                </Text>
                <Space style={{ marginTop: 8 }}>
                  <Tag 
                    icon={<SettingOutlined />} 
                    style={{
                      background: 'rgba(255, 255, 255, 0.2)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      color: 'white',
                      borderRadius: 20,
                      padding: '4px 12px'
                    }}
                  >
                    Admin Panel
                  </Tag>
                  <Tag 
                    icon={<ClockCircleOutlined />} 
                    style={{
                      background: 'rgba(255, 255, 255, 0.15)',
                      border: '1px solid rgba(255, 255, 255, 0.25)',
                      color: 'white',
                      borderRadius: 20,
                      padding: '4px 12px'
                    }}
                  >
                    Online
                  </Tag>
                </Space>
              </Space>
            </Col>
            <Col>
              <Space size="middle">
                <Link href="/admin/template">
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />}
                    size="large"
                    style={{
                      background: 'rgba(255, 255, 255, 0.2)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: 12,
                      backdropFilter: 'blur(10px)',
                      color: 'white',
                      fontWeight: 600
                    }}
                  >
                    Kelola Template
                  </Button>
                </Link>
              </Space>
            </Col>
          </Row>
        </div>

        {/* Enhanced Quick Actions */}
        <div style={{ marginBottom: 32 }}>
          <QuickActions userRole="admin" />
        </div>

        {/* Enhanced Statistics Cards */}
        <Row gutter={[20, 20]} style={{ marginBottom: 32 }}>
          <Col xs={24} sm={12} lg={6}>
            <Card
              hoverable
              style={{
                borderRadius: 16,
                border: '1px solid #e8f4fd',
                background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                boxShadow: '0 2px 12px rgba(59, 130, 246, 0.08)',
                transition: 'all 0.3s ease'
              }}
              bodyStyle={{ padding: '24px' }}
              onClick={() => window.location.href = "/admin/template"}
            >
              <Space direction="vertical" size={12} style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                  }}>
                    <FileTextOutlined style={{ fontSize: 20, color: 'white' }} />
                  </div>
                  <Tag color="blue" style={{ borderRadius: 12, fontSize: 11 }}>+12 bulan ini</Tag>
                </div>
                <div>
                  <Text style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>Total Template</Text>
                  <div style={{ fontSize: 28, fontWeight: 700, color: '#1e293b', lineHeight: 1 }}>24</div>
                </div>
              </Space>
            </Card>
          </Col>
          
          <Col xs={24} sm={12} lg={6}>
            <Card
              hoverable
              style={{
                borderRadius: 16,
                border: '1px solid #f0fdf4',
                background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                boxShadow: '0 2px 12px rgba(34, 197, 94, 0.08)',
                transition: 'all 0.3s ease'
              }}
              bodyStyle={{ padding: '24px' }}
              onClick={() => window.location.href = "/admin/laporan"}
            >
              <Space direction="vertical" size={12} style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)'
                  }}>
                    <BookOutlined style={{ fontSize: 20, color: 'white' }} />
                  </div>
                  <Tag color="green" style={{ borderRadius: 12, fontSize: 11 }}>+25 minggu ini</Tag>
                </div>
                <div>
                  <Text style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>Ujian Aktif</Text>
                  <div style={{ fontSize: 28, fontWeight: 700, color: '#1e293b', lineHeight: 1 }}>8</div>
                </div>
              </Space>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card
              hoverable
              style={{
                borderRadius: 16,
                border: '1px solid #fdf4ff',
                background: 'linear-gradient(135deg, #fdf4ff 0%, #fae8ff 100%)',
                boxShadow: '0 2px 12px rgba(168, 85, 247, 0.08)',
                transition: 'all 0.3s ease'
              }}
              bodyStyle={{ padding: '24px' }}
              onClick={() => window.location.href = "/admin/laporan"}
            >
              <Space direction="vertical" size={12} style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(168, 85, 247, 0.3)'
                  }}>
                    <BarChartOutlined style={{ fontSize: 20, color: 'white' }} />
                  </div>
                  <Tag color="purple" style={{ borderRadius: 12, fontSize: 11 }}>156 tersedia</Tag>
                </div>
                <div>
                  <Text style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>Data Laporan</Text>
                  <div style={{ fontSize: 28, fontWeight: 700, color: '#1e293b', lineHeight: 1 }}>156</div>
                </div>
              </Space>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card
              hoverable
              style={{
                borderRadius: 16,
                border: '1px solid #fff7ed',
                background: 'linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)',
                boxShadow: '0 2px 12px rgba(249, 115, 22, 0.08)',
                transition: 'all 0.3s ease'
              }}
              bodyStyle={{ padding: '24px' }}
              onClick={() => window.location.href = "/admin/halaqah"}
            >
              <Space direction="vertical" size={12} style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)'
                  }}>
                    <UserOutlined style={{ fontSize: 20, color: 'white' }} />
                  </div>
                  <Tag color="orange" style={{ borderRadius: 12, fontSize: 11 }}>+15 baru</Tag>
                </div>
                <div>
                  <Text style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>Total Pengguna</Text>
                  <div style={{ fontSize: 28, fontWeight: 700, color: '#1e293b', lineHeight: 1 }}>342</div>
                </div>
              </Space>
            </Card>
          </Col>
        </Row>

        {/* Main Statistics */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Title level={3}>Detail Statistik Template</Title>
            <Link href="/admin/template?tab=daftar">
              <Button icon={<EyeOutlined />}>Lihat Semua</Button>
            </Link>
          </div>
          <StatistikTemplate />
        </div>

        {/* System Status */}
        <div className="space-y-4">
          <Title level={3}>Status Sistem</Title>
          {/* <SystemStatus /> */}
          <Card>
            <Text type="secondary">Status sistem akan ditampilkan di sini</Text>
          </Card>
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