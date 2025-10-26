'use client'

import { useState, useEffect } from 'react'
import { 
  Card, 
  Tabs, 
  Badge, 
  Button, 
  Row, 
  Col, 
  Statistic, 
  Typography,
  Space,
  Divider,
  Alert
} from 'antd'
import { 
  CalendarOutlined,
  FileTextOutlined,
  BookOutlined,
  SettingOutlined,
  UnorderedListOutlined,
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  BarChartOutlined
} from '@ant-design/icons'

import LayoutApp from '@/components/layout/LayoutApp'

// Import komponen untuk setiap tab
import { FormTemplateTahunAkademik } from '@/components/admin/template/FormTemplateTahunAkademik'
import { FormJenisUjian } from '@/components/admin/template/FormJenisUjian'
import { FormTemplateUjian } from '@/components/admin/template/FormTemplateUjian'
import { FormTemplateRaport } from '@/components/admin/template/FormTemplateRaport'
import { DaftarTemplate } from '@/components/admin/template/DaftarTemplate'

const { Title, Text } = Typography

interface TemplateStats {
  totalTahunAkademik: number
  totalJenisUjian: number
  totalTemplateUjian: number
  totalTemplateRaport: number
  totalKomponenPenilaian: number
}

export default function TemplatePage() {
  const [activeTab, setActiveTab] = useState('1')
  const [stats, setStats] = useState<TemplateStats>({
    totalTahunAkademik: 0,
    totalJenisUjian: 0,
    totalTemplateUjian: 0,
    totalTemplateRaport: 0,
    totalKomponenPenilaian: 0
  })
  const [loading, setLoading] = useState(false)

  // Fetch statistik template
  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/template-stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching template stats:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  return (
    <LayoutApp>
      <div style={{ padding: '24px 0' }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <Title level={2} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  padding: 12,
                  background: 'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)',
                  borderRadius: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <SettingOutlined style={{ fontSize: 24, color: 'white' }} />
                </div>
                Sistem Template
              </Title>
              <Text type="secondary" style={{ fontSize: 16, marginTop: 8, display: 'block' }}>
                Kelola template tahun akademik, jenis ujian, template ujian, dan template raport
              </Text>
            </div>
            <Badge 
              count="Admin Panel" 
              style={{ 
                backgroundColor: '#722ed1',
                fontSize: 12,
                height: 24,
                lineHeight: '24px',
                borderRadius: 12
              }} 
            />
          </div>
        </div>

        {/* Statistik Template */}
        <Card 
          title={
            <Space>
              <BarChartOutlined />
              <span>Statistik Template</span>
            </Space>
          }
          style={{ marginBottom: 24 }}
          loading={loading}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={6}>
              <Card size="small" style={{ textAlign: 'center', background: '#f0f9ff', border: '1px solid #bae6fd' }}>
                <Statistic
                  title="Tahun Akademik"
                  value={stats.totalTahunAkademik}
                  prefix={<CalendarOutlined style={{ color: '#0284c7' }} />}
                  valueStyle={{ color: '#0284c7', fontSize: 20 }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card size="small" style={{ textAlign: 'center', background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                <Statistic
                  title="Jenis Ujian"
                  value={stats.totalJenisUjian}
                  prefix={<BookOutlined style={{ color: '#16a34a' }} />}
                  valueStyle={{ color: '#16a34a', fontSize: 20 }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card size="small" style={{ textAlign: 'center', background: '#fefce8', border: '1px solid #fde047' }}>
                <Statistic
                  title="Template Ujian"
                  value={stats.totalTemplateUjian}
                  prefix={<FileTextOutlined style={{ color: '#ca8a04' }} />}
                  valueStyle={{ color: '#ca8a04', fontSize: 20 }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card size="small" style={{ textAlign: 'center', background: '#fdf2f8', border: '1px solid #f9a8d4' }}>
                <Statistic
                  title="Template Raport"
                  value={stats.totalTemplateRaport}
                  prefix={<UnorderedListOutlined style={{ color: '#be185d' }} />}
                  valueStyle={{ color: '#be185d', fontSize: 20 }}
                />
              </Card>
            </Col>
          </Row>
        </Card>

        {/* Alert Info */}
        <Alert
          message="Informasi Sistem Template"
          description="Sistem template memungkinkan Anda untuk mengelola seluruh aspek penilaian dan pelaporan dalam aplikasi hafalan. Pastikan untuk mengatur tahun akademik terlebih dahulu sebelum membuat template lainnya."
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />

        {/* Main Tabs */}
        <Card>
          <Tabs 
            activeKey={activeTab} 
            onChange={setActiveTab}
            type="card"
            size="large"
            tabBarStyle={{ marginBottom: 24 }}
            items={[
              {
                key: '1',
                label: (
                  <Space>
                    <CalendarOutlined />
                    <span>Atur Tahun Akademik</span>
                  </Space>
                ),
                children: (
                  <Row gutter={[24, 24]}>
                    <Col xs={24} lg={16}>
                      <FormTemplateTahunAkademik onSuccess={fetchStats} />
                    </Col>
                    <Col xs={24} lg={8}>
                      <Card 
                        title="Informasi Tahun Akademik" 
                        size="small"
                        style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}
                      >
                        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                          <div>
                            <Text strong style={{ color: '#1e293b' }}>Fungsi Utama:</Text>
                            <ul style={{ margin: '8px 0', paddingLeft: 20, color: '#64748b' }}>
                              <li>Memudahkan filtering data di seluruh aplikasi</li>
                              <li>Mengatur periode akademik yang aktif</li>
                              <li>Dasar pembuatan template ujian dan raport</li>
                              <li>Organisasi data berdasarkan semester</li>
                            </ul>
                          </div>
                          <Divider style={{ margin: '12px 0' }} />
                          <div>
                            <Text strong style={{ color: '#1e293b' }}>Format Penamaan:</Text>
                            <div style={{ 
                              background: '#e0e7ff', 
                              padding: 8, 
                              borderRadius: 6, 
                              marginTop: 8,
                              fontFamily: 'monospace',
                              fontSize: 12
                            }}>
                              2024/2025 - Semester 1
                            </div>
                          </div>
                        </Space>
                      </Card>
                    </Col>
                  </Row>
                )
              },
              {
                key: '2',
                label: (
                  <Space>
                    <PlusOutlined />
                    <span>Tambah Jenis Ujian</span>
                  </Space>
                ),
                children: (
                  <Row gutter={[24, 24]}>
                    <Col xs={24} lg={16}>
                      <FormJenisUjian onSuccess={fetchStats} />
                    </Col>
                    <Col xs={24} lg={8}>
                      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                        <Card 
                          title="Jenis Ujian Tersedia" 
                          size="small"
                          style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}
                        >
                          <Space direction="vertical" size="small" style={{ width: '100%' }}>
                            <div style={{ padding: 8, background: 'white', borderRadius: 6, border: '1px solid #d1fae5' }}>
                              <Text strong style={{ color: '#166534' }}>Tasmi'</Text>
                              <br />
                              <Text style={{ fontSize: 12, color: '#16a34a' }}>Penilaian hafalan per halaman</Text>
                            </div>
                            <div style={{ padding: 8, background: 'white', borderRadius: 6, border: '1px solid #d1fae5' }}>
                              <Text strong style={{ color: '#166534' }}>MHQ</Text>
                              <br />
                              <Text style={{ fontSize: 12, color: '#16a34a' }}>Musabaqah Hifdzil Qur'an</Text>
                            </div>
                            <div style={{ padding: 8, background: 'white', borderRadius: 6, border: '1px solid #d1fae5' }}>
                              <Text strong style={{ color: '#166534' }}>UAS</Text>
                              <br />
                              <Text style={{ fontSize: 12, color: '#16a34a' }}>Ujian Akhir Semester</Text>
                            </div>
                            <div style={{ padding: 8, background: 'white', borderRadius: 6, border: '1px solid #d1fae5' }}>
                              <Text strong style={{ color: '#166534' }}>Kenaikan Juz</Text>
                              <br />
                              <Text style={{ fontSize: 12, color: '#16a34a' }}>Ujian naik juz hafalan</Text>
                            </div>
                          </Space>
                        </Card>

                        <Card 
                          title="Komponen Penilaian" 
                          size="small"
                          style={{ background: '#fef3c7', border: '1px solid #fcd34d' }}
                        >
                          <Text style={{ fontSize: 12, color: '#92400e' }}>
                            Setiap jenis ujian dapat memiliki komponen penilaian yang berbeda. 
                            Anda dapat menambah, mengurangi, dan mengatur bobot setiap komponen sesuai kebutuhan.
                          </Text>
                          <Divider style={{ margin: '12px 0' }} />
                          <Text strong style={{ color: '#92400e' }}>Contoh Komponen MHQ:</Text>
                          <ul style={{ margin: '8px 0', paddingLeft: 20, color: '#a16207' }}>
                            <li>Tajwid (30%)</li>
                            <li>Sifatul Huruf (25%)</li>
                            <li>Kejelasan Bacaan (25%)</li>
                            <li>Kelancaran (20%)</li>
                          </ul>
                        </Card>
                      </Space>
                    </Col>
                  </Row>
                )
              },
              {
                key: '3',
                label: (
                  <Space>
                    <BookOutlined />
                    <span>Template Ujian</span>
                  </Space>
                ),
                children: (
                  <Row gutter={[24, 24]}>
                    <Col xs={24} lg={16}>
                      <FormTemplateUjian onSuccess={fetchStats} />
                    </Col>
                    <Col xs={24} lg={8}>
                      <Card 
                        title="Pengaturan Template Ujian" 
                        size="small"
                        style={{ background: '#eff6ff', border: '1px solid #bfdbfe' }}
                      >
                        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                          <div>
                            <Text strong style={{ color: '#1e40af' }}>Cara Kerja:</Text>
                            <ol style={{ margin: '8px 0', paddingLeft: 20, color: '#3730a3' }}>
                              <li>Pilih jenis ujian yang sudah dibuat</li>
                              <li>Komponen penilaian akan muncul otomatis</li>
                              <li>Atur bobot setiap komponen (total 100%)</li>
                              <li>Simpan template untuk digunakan guru</li>
                            </ol>
                          </div>
                          <Divider style={{ margin: '12px 0' }} />
                          <div>
                            <Text strong style={{ color: '#1e40af' }}>Contoh Bobot MHQ:</Text>
                            <div style={{ marginTop: 8 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                                <Text style={{ fontSize: 12 }}>Tajwid</Text>
                                <Badge count="30%" style={{ backgroundColor: '#3b82f6' }} />
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                                <Text style={{ fontSize: 12 }}>Sifatul Huruf</Text>
                                <Badge count="25%" style={{ backgroundColor: '#10b981' }} />
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                                <Text style={{ fontSize: 12 }}>Kejelasan</Text>
                                <Badge count="25%" style={{ backgroundColor: '#f59e0b' }} />
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                                <Text style={{ fontSize: 12 }}>Kejelasan</Text>
                                <Badge count="25%" style={{ backgroundColor: '#f59e0b' }} />
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                                <Text style={{ fontSize: 12 }}>Kelancaran</Text>
                                <Badge count="20%" style={{ backgroundColor: '#ef4444' }} />
                              </div>
                        </div>
                      </div>
                    </Space>
                  </Card>
                </Col>
              </Row>
            )
          }
        ]}
      />
        </Card>
      </div>
    </LayoutApp>
  )
}