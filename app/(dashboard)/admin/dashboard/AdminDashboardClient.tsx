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
import styles from './AdminDashboard.module.css'

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

  const stats = data.stats
  const tren = data.tren
  const halaqahPerformance = data.halaqahPerformance || []

  return (
    <div className={styles.container}>
      <AdminHeaderCard
        title="Dashboard Admin"
        subtitle="Kelola sistem AR-Hafalan dan monitor aktivitas"
        actions={
          <Link href="/admin/template">
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              size="large"
              className={styles.headerBtn}
            >
              Kelola Template
            </Button>
          </Link>
        }
      />

      {/* Enhanced Quick Actions */}
      <div className={styles.section}>
        <QuickActions userRole="admin" />
      </div>

      {/* Enhanced Statistics Cards */}
      <Row gutter={[12, 12]} className={styles.section}>
        <Col xs={12} sm={12} lg={6}>
          <Card
            hoverable
            className={styles.cardTotalTemplate}
            styles={{ body: {} }}
            onClick={() => router.push("/admin/template")}
          >
            <Space direction="vertical" size={12} className={styles.cardInnerSpace}>
              <div className={styles.cardHeader}>
                <div className={styles.iconWrapperTotalTemplate}>
                  <FileTextOutlined className={styles.icon} />
                </div>
                <Tag color={stats?.totalTemplate.tagColor || 'blue'} className={styles.tag}>
                  {stats?.totalTemplate.tag || '-'}
                </Tag>
              </div>
              <div>
                <Text className={styles.statLabel}>Total Template</Text>
                <div className={styles.statValue}>
                  {stats?.totalTemplate.value ?? 0}
                </div>
              </div>
            </Space>
          </Card>
        </Col>
        
        <Col xs={12} sm={12} lg={6}>
          <Card
            hoverable
            className={styles.cardUjianAktif}
            styles={{ body: {} }}
            onClick={() => router.push("/admin/laporan")}
          >
            <Space direction="vertical" size={12} className={styles.cardInnerSpace}>
              <div className={styles.cardHeader}>
                <div className={styles.iconWrapperUjianAktif}>
                  <BookOutlined className={styles.icon} />
                </div>
                <Tag color={stats?.ujianAktif.tagColor || 'green'} className={styles.tag}>
                  {stats?.ujianAktif.tag || '-'}
                </Tag>
              </div>
              <div>
                <Text className={styles.statLabel}>Ujian Aktif</Text>
                <div className={styles.statValue}>
                  {stats?.ujianAktif.value ?? 0}
                </div>
              </div>
            </Space>
          </Card>
        </Col>

        <Col xs={12} sm={12} lg={6}>
          <Card
            hoverable
            className={styles.cardDataLaporan}
            styles={{ body: {} }}
            onClick={() => router.push("/admin/laporan")}
          >
            <Space direction="vertical" size={12} className={styles.cardInnerSpace}>
              <div className={styles.cardHeader}>
                <div className={styles.iconWrapperDataLaporan}>
                  <BarChartOutlined className={styles.icon} />
                </div>
                <Tag color={stats?.dataLaporan.tagColor || 'purple'} className={styles.tag}>
                  {stats?.dataLaporan.tag || '-'}
                </Tag>
              </div>
              <div>
                <Text className={styles.statLabel}>Data Laporan</Text>
                <div className={styles.statValue}>
                  {stats?.dataLaporan.value ?? 0}
                </div>
              </div>
            </Space>
          </Card>
        </Col>

        <Col xs={12} sm={12} lg={6}>
          <Card
            hoverable
            className={styles.cardTotalPengguna}
            styles={{ body: {} }}
            onClick={() => router.push("/admin/halaqah")}
          >
            <Space direction="vertical" size={12} className={styles.cardInnerSpace}>
              <div className={styles.cardHeader}>
                <div className={styles.iconWrapperTotalPengguna}>
                  <UserOutlined className={styles.icon} />
                </div>
                <Tag color={stats?.totalPengguna.tagColor || 'orange'} className={styles.tag}>
                  {stats?.totalPengguna.tag || '-'}
                </Tag>
              </div>
              <div>
                <Text className={styles.statLabel}>Total Pengguna</Text>
                <div className={styles.statValue}>
                  {stats?.totalPengguna.value ?? 0}
                </div>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Main Statistics */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <Title level={3} className={styles.sectionTitle}>Detail Statistik Template</Title>
          <Link href="/admin/template?tab=daftar">
            <Button icon={<EyeOutlined />}>Lihat Semua</Button>
          </Link>
        </div>
        <StatistikTemplate />
      </div>

      {/* System Status */}
      <div className={styles.section}>
        <Title level={3} className={styles.sectionTitleSpaced}>Status Sistem</Title>
        <SystemStatus />
      </div>

      {/* Recent Activity Summary */}
      <Row gutter={[16, 16]} className={styles.chartSection}>
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <RiseOutlined />
                <span>Tren Penggunaan</span>
              </Space>
            }
            className={styles.chartCard}
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
                <Bar dataKey="value" fill="#219ebc" radius={[4, 4, 0, 0]} name="Jumlah" />
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
            className={styles.chartCard}
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
                  <Bar dataKey="santri" fill="#219ebc" radius={[0, 4, 4, 0]} name="santri" />
                  <Bar dataKey="nilai" fill="#219ebc" radius={[0, 4, 4, 0]} name="nilai" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className={styles.emptyStateContainer}>
                <Text type="secondary">Belum ada data halaqah</Text>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  )
}
