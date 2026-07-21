'use client'

import { useState, useEffect } from 'react'
import { Card, Col, Row, Button, Typography, Space, Tag, Spin } from 'antd'
import {
  BarChartOutlined,
  UserOutlined,
  BookOutlined,
  FileTextOutlined,
  RiseOutlined,
  PlusOutlined,
  EyeOutlined
} from '@ant-design/icons'

const { Title, Text } = Typography
import { StatistikTemplate } from '@/components/admin/dashboard/StatistikTemplate'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import QuickActions from '@/components/layout/QuickActions'
import AdminHeaderCard from '@/components/admin/layout/AdminHeaderCard'

interface DashboardStats {
  stats: {
    totalTemplate: { value: number; tag: string; tagColor: string }
    ujianAktif: { value: number; tag: string; tagColor: string }
    dataLaporan: { value: number; tag: string; tagColor: string }
    totalPengguna: { value: number; tag: string; tagColor: string }
  }
  tren: {
    ujianMingguIni: { value: number; trend: number }
    raportBulanIni: { value: number; trend: number }
    templateBaru: { value: number; trend: number }
    penggunaBaru: { value: number; trend: number }
  }
  halaqahPerformance: Array<{
    nama: string
    santri: number
    nilai: number
    trend: string
  }>
  lastUpdated: string
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const [data, setData] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/dashboard-stats')
      if (response.ok) {
        const result = await response.json()
        setData(result)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  }

  if (loading) {
    return (
      <>
        <div style={{ padding: '0 4px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            <Spin size="large" />
          </div>
        </div>
      </>
    )
  }

  const stats = data?.stats
  const tren = data?.tren
  const halaqahPerformance = data?.halaqahPerformance || []

  return (
    <>
      <div style={{ padding: '0 4px' }}>
        <AdminHeaderCard
          title="Dashboard Admin"
          subtitle="Kelola sistem AR-Hafalan dan monitor aktivitas"
          actions={
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
          }
        />

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
              styles={{ body: {} }}
              onClick={() => router.push("/admin/template")}
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
                  <Tag color={stats?.totalTemplate.tagColor || 'blue'} style={{ borderRadius: 12, fontSize: 11 }}>
                    {stats?.totalTemplate.tag || '-'}
                  </Tag>
                </div>
                <div>
                  <Text style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>Total Template</Text>
                  <div style={{ fontSize: 28, fontWeight: 700, color: '#1e293b', lineHeight: 1 }}>
                    {stats?.totalTemplate.value ?? 0}
                  </div>
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
              styles={{ body: {} }}
              onClick={() => router.push("/admin/laporan")}
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
                  <Tag color={stats?.ujianAktif.tagColor || 'green'} style={{ borderRadius: 12, fontSize: 11 }}>
                    {stats?.ujianAktif.tag || '-'}
                  </Tag>
                </div>
                <div>
                  <Text style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>Ujian Aktif</Text>
                  <div style={{ fontSize: 28, fontWeight: 700, color: '#1e293b', lineHeight: 1 }}>
                    {stats?.ujianAktif.value ?? 0}
                  </div>
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
              styles={{ body: {} }}
              onClick={() => router.push("/admin/laporan")}
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
                  <Tag color={stats?.dataLaporan.tagColor || 'purple'} style={{ borderRadius: 12, fontSize: 11 }}>
                    {stats?.dataLaporan.tag || '-'}
                  </Tag>
                </div>
                <div>
                  <Text style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>Data Laporan</Text>
                  <div style={{ fontSize: 28, fontWeight: 700, color: '#1e293b', lineHeight: 1 }}>
                    {stats?.dataLaporan.value ?? 0}
                  </div>
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
              styles={{ body: {} }}
              onClick={() => router.push("/admin/halaqah")}
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
                  <Tag color={stats?.totalPengguna.tagColor || 'orange'} style={{ borderRadius: 12, fontSize: 11 }}>
                    {stats?.totalPengguna.tag || '-'}
                  </Tag>
                </div>
                <div>
                  <Text style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>Total Pengguna</Text>
                  <div style={{ fontSize: 28, fontWeight: 700, color: '#1e293b', lineHeight: 1 }}>
                    {stats?.totalPengguna.value ?? 0}
                  </div>
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
                    <Text strong style={{ fontSize: 16 }}>{tren?.ujianMingguIni?.value ?? 0}</Text>
                    <Tag color={(tren?.ujianMingguIni?.trend ?? 0) >= 0 ? 'green' : 'red'}>
                      {(tren?.ujianMingguIni?.trend ?? 0) >= 0 ? '+' : ''}{tren?.ujianMingguIni?.trend ?? 0}%
                    </Tag>
                  </Space>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text>Raport di-generate</Text>
                  <Space>
                    <Text strong style={{ fontSize: 16 }}>{tren?.raportBulanIni?.value ?? 0}</Text>
                    <Tag color={(tren?.raportBulanIni?.trend ?? 0) >= 0 ? 'blue' : 'red'}>
                      {(tren?.raportBulanIni?.trend ?? 0) >= 0 ? '+' : ''}{tren?.raportBulanIni?.trend ?? 0}%
                    </Tag>
                  </Space>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text>Template baru</Text>
                  <Space>
                    <Text strong style={{ fontSize: 16 }}>{tren?.templateBaru?.value ?? 0}</Text>
                    <Tag color="purple">
                      {(tren?.templateBaru?.value ?? 0) > 0 ? 'Baru' : '-'}
                    </Tag>
                  </Space>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text>Pengguna baru bulan ini</Text>
                  <Space>
                    <Text strong style={{ fontSize: 16 }}>{tren?.penggunaBaru?.value ?? 0}</Text>
                    <Tag color={(tren?.penggunaBaru?.trend ?? 0) >= 0 ? 'orange' : 'red'}>
                      {(tren?.penggunaBaru?.trend ?? 0) >= 0 ? '+' : ''}{tren?.penggunaBaru?.trend ?? 0}%
                    </Tag>
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
                {halaqahPerformance.length > 0 ? (
                  halaqahPerformance.map((halaqah, index) => (
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
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <Text type="secondary">Belum ada data halaqah</Text>
                  </div>
                )}
              </div>
            </Card>
          </Col>
        </Row>

        {/* Footer Info */}
        <Card
          style={{
            background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
            border: "1px solid #e2e8f0",
            borderRadius: 12,
            marginTop: 16
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
                {data?.lastUpdated ? formatTime(data.lastUpdated) : '-'}
              </Text>
            </div>
          </div>
        </Card>
      </div>
    </>
  )
}
