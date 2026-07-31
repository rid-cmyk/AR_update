'use client'

import { Card, Col, Row, Button, Typography, Space, Tag } from 'antd'
import {
  BarChartOutlined,
  UserOutlined,
  BookOutlined,
  FileTextOutlined,
  RiseOutlined,
  PlusOutlined,
  EyeOutlined
} from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useVisibilityAwareRefresh } from '@/hooks/useVisibilityAwareRefresh'

import { StatistikTemplate } from '@/components/admin/dashboard/StatistikTemplate'
import { SystemStatus } from '@/components/admin/dashboard/SystemStatus'
import QuickActions from '@/components/layout/QuickActions'
import AdminHeaderCard from '@/components/admin/layout/AdminHeaderCard'
import { useEffect } from 'react'
import dynamic from 'next/dynamic'

const BarChart = dynamic(() => import("recharts").then(mod => mod.BarChart), { ssr: false });
const Bar = dynamic(() => import("recharts").then(mod => mod.Bar), { ssr: false });
const XAxis = dynamic(() => import("recharts").then(mod => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then(mod => mod.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import("recharts").then(mod => mod.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then(mod => mod.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import("recharts").then(mod => mod.ResponsiveContainer), { ssr: false });
const Legend = dynamic(() => import("recharts").then(mod => mod.Legend as any), { ssr: false });

const { Title, Text } = Typography

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

export default function AdminDashboardClient({ data }: { data: DashboardStats }) {
  const router = useRouter()

  useVisibilityAwareRefresh(120000);

  const formatTime = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  }

  const stats = data.stats
  const tren = data.tren
  const halaqahPerformance = data.halaqahPerformance || []

  return (
    <div style={{ padding: '0 8px 24px' }}>
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
      <div style={{ marginBottom: 28 }}>
        <QuickActions userRole="admin" />
      </div>

      {/* Enhanced Statistics Cards */}
      <Row gutter={[12, 12]} style={{ marginBottom: 28 }}>
        <Col xs={12} sm={12} lg={6}>
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
        
        <Col xs={12} sm={12} lg={6}>
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

        <Col xs={12} sm={12} lg={6}>
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

        <Col xs={12} sm={12} lg={6}>
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
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Title level={3} style={{ margin: 0 }}>Detail Statistik Template</Title>
          <Link href="/admin/template?tab=daftar">
            <Button icon={<EyeOutlined />}>Lihat Semua</Button>
          </Link>
        </div>
        <StatistikTemplate />
      </div>

      {/* System Status */}
      <div style={{ marginBottom: 28 }}>
        <Title level={3} style={{ marginBottom: 16 }}>Status Sistem</Title>
        <SystemStatus />
      </div>

      {/* Recent Activity Summary */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
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
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={[
                { name: 'Ujian', value: tren?.ujianMingguIni?.value ?? 0, trend: tren?.ujianMingguIni?.trend ?? 0 },
                { name: 'Raport', value: tren?.raportBulanIni?.value ?? 0, trend: tren?.raportBulanIni?.trend ?? 0 },
                { name: 'Template', value: tren?.templateBaru?.value ?? 0, trend: tren?.templateBaru?.trend ?? 0 },
                { name: 'Pengguna', value: tren?.penggunaBaru?.value ?? 0, trend: tren?.penggunaBaru?.trend ?? 0 }
              ]} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#666" fontSize={11} />
                <YAxis stroke="#666" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    background: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                  }}
                  formatter={(value: any, name: any) => {
                    const item = [{ name: 'Ujian', value: tren?.ujianMingguIni?.value ?? 0, trend: tren?.ujianMingguIni?.trend ?? 0 },
                      { name: 'Raport', value: tren?.raportBulanIni?.value ?? 0, trend: tren?.raportBulanIni?.trend ?? 0 },
                      { name: 'Template', value: tren?.templateBaru?.value ?? 0, trend: tren?.templateBaru?.trend ?? 0 },
                      { name: 'Pengguna', value: tren?.penggunaBaru?.value ?? 0, trend: tren?.penggunaBaru?.trend ?? 0 }
                    ].find(d => d.name === name);
                    return [`${value} (${(item?.trend ?? 0) >= 0 ? '+' : ''}${item?.trend ?? 0}%)`, name];
                  }}
                />
                <Bar dataKey="value" fill="#1890ff" radius={[4, 4, 0, 0]} name="Jumlah" />
              </BarChart>
            </ResponsiveContainer>
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
            {halaqahPerformance.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={halaqahPerformance.map(h => ({ ...h, nama: h.nama.length > 15 ? h.nama.substring(0, 15) + '...' : h.nama }))} margin={{ top: 10, right: 20, left: 0, bottom: 10 }} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" stroke="#666" fontSize={11} />
                  <YAxis type="category" dataKey="nama" stroke="#666" fontSize={11} width={120} />
                  <Tooltip
                    contentStyle={{
                      background: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                    }}
                    formatter={(value: any, name: any) => {
                      if (name === 'santri') return [value, 'Jumlah Santri'];
                      if (name === 'nilai') return [`${value}%`, 'Hafalan Rate'];
                      return [value, name];
                    }}
                  />
                  <Legend />
                  <Bar dataKey="santri" fill="#1890ff" radius={[0, 4, 4, 0]} name="santri" />
                  <Bar dataKey="nilai" fill="#52c41a" radius={[0, 4, 4, 0]} name="nilai" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <Text type="secondary">Belum ada data halaqah</Text>
              </div>
            )}
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
              {data.lastUpdated ? formatTime(data.lastUpdated) : '-'}
            </Text>
          </div>
        </div>
      </Card>
    </div>
  )
}
