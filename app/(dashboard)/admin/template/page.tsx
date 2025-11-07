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
  Alert,
  Modal
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
import { FormJenisUjian } from '@/components/admin/template/FormJenisUjian'
import { FormTemplateRaport } from '@/components/admin/template/FormTemplateRaport'
import { DaftarTemplate } from '@/components/admin/template/DaftarTemplate'
import { TahunAkademikSelector } from '@/components/admin/tahun-akademik/TahunAkademikSelector'

const { Title, Text } = Typography

interface TemplateStats {
  totalTahunAkademik: number
  totalJenisUjian: number
  totalTemplateUjian: number
  totalTemplateRaport: number
  totalKomponenPenilaian: number
}

export default function TemplatePage() {
  const [activeTab, setActiveTab] = useState('2')
  const [stats, setStats] = useState<TemplateStats>({
    totalTahunAkademik: 0,
    totalJenisUjian: 0,
    totalTemplateUjian: 0,
    totalTemplateRaport: 0,
    totalKomponenPenilaian: 0
  })
  const [loading, setLoading] = useState(false)
  const [showJenisUjianModal, setShowJenisUjianModal] = useState(false)
  const [showTemplateRaportModal, setShowTemplateRaportModal] = useState(false)

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
                Kelola tahun akademik otomatis, jenis ujian, dan template raport
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
              <div style={{
                padding: 8,
                background: 'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <BarChartOutlined style={{ fontSize: 16, color: 'white' }} />
              </div>
              <span style={{ fontSize: 16, fontWeight: 600 }}>Statistik Template</span>
            </Space>
          }
          style={{ 
            marginBottom: 24,
            borderRadius: 12,
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
          }}
          bodyStyle={{ padding: '20px' }}
          loading={loading}
        >
          <Row gutter={[20, 20]}>
            <Col xs={24} sm={12} lg={6}>
              <Card 
                size="small" 
                style={{ 
                  textAlign: 'center', 
                  background: 'linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%)', 
                  border: '1px solid #c7d2fe',
                  borderRadius: 12,
                  boxShadow: '0 2px 8px rgba(59, 130, 246, 0.15)',
                  transition: 'all 0.3s ease'
                }}
                bodyStyle={{ padding: '16px' }}
                hoverable
              >
                <Statistic
                  title={<Text style={{ fontSize: 12, fontWeight: 500, color: '#4338ca' }}>Tahun Akademik</Text>}
                  value={stats.totalTahunAkademik}
                  prefix={
                    <div style={{
                      padding: 8,
                      background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                      borderRadius: 8,
                      display: 'inline-flex',
                      marginBottom: 8
                    }}>
                      <CalendarOutlined style={{ color: 'white', fontSize: 16 }} />
                    </div>
                  }
                  valueStyle={{ color: '#1e40af', fontSize: 24, fontWeight: 700 }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card 
                size="small" 
                style={{ 
                  textAlign: 'center', 
                  background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', 
                  border: '1px solid #bbf7d0',
                  borderRadius: 12,
                  boxShadow: '0 2px 8px rgba(34, 197, 94, 0.15)',
                  transition: 'all 0.3s ease'
                }}
                bodyStyle={{ padding: '16px' }}
                hoverable
              >
                <Statistic
                  title={<Text style={{ fontSize: 12, fontWeight: 500, color: '#15803d' }}>Jenis Ujian</Text>}
                  value={stats.totalJenisUjian}
                  prefix={
                    <div style={{
                      padding: 8,
                      background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                      borderRadius: 8,
                      display: 'inline-flex',
                      marginBottom: 8
                    }}>
                      <BookOutlined style={{ color: 'white', fontSize: 16 }} />
                    </div>
                  }
                  valueStyle={{ color: '#166534', fontSize: 24, fontWeight: 700 }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card 
                size="small" 
                style={{ 
                  textAlign: 'center', 
                  background: 'linear-gradient(135deg, #fefce8 0%, #fef3c7 100%)', 
                  border: '1px solid #fde047',
                  borderRadius: 12,
                  boxShadow: '0 2px 8px rgba(245, 158, 11, 0.15)',
                  transition: 'all 0.3s ease'
                }}
                bodyStyle={{ padding: '16px' }}
                hoverable
              >
                <Statistic
                  title={<Text style={{ fontSize: 12, fontWeight: 500, color: '#a16207' }}>Template Ujian</Text>}
                  value={stats.totalTemplateUjian}
                  prefix={
                    <div style={{
                      padding: 8,
                      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                      borderRadius: 8,
                      display: 'inline-flex',
                      marginBottom: 8
                    }}>
                      <FileTextOutlined style={{ color: 'white', fontSize: 16 }} />
                    </div>
                  }
                  valueStyle={{ color: '#92400e', fontSize: 24, fontWeight: 700 }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card 
                size="small" 
                style={{ 
                  textAlign: 'center', 
                  background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)', 
                  border: '1px solid #f9a8d4',
                  borderRadius: 12,
                  boxShadow: '0 2px 8px rgba(236, 72, 153, 0.15)',
                  transition: 'all 0.3s ease'
                }}
                bodyStyle={{ padding: '16px' }}
                hoverable
              >
                <Statistic
                  title={<Text style={{ fontSize: 12, fontWeight: 500, color: '#9f1239' }}>Template Raport</Text>}
                  value={stats.totalTemplateRaport}
                  prefix={
                    <div style={{
                      padding: 8,
                      background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
                      borderRadius: 8,
                      display: 'inline-flex',
                      marginBottom: 8
                    }}>
                      <UnorderedListOutlined style={{ color: 'white', fontSize: 16 }} />
                    </div>
                  }
                  valueStyle={{ color: '#881337', fontSize: 24, fontWeight: 700 }}
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
          style={{ 
            marginBottom: 24,
            borderRadius: 12,
            border: '1px solid #91d5ff',
            background: 'linear-gradient(135deg, #f6ffed 0%, #f0f9ff 100%)'
          }}
        />

        {/* Main Tabs */}
        <Card
          style={{
            borderRadius: 12,
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            overflow: 'hidden'
          }}
          bodyStyle={{ padding: 0 }}
        >
          <Tabs 
            activeKey={activeTab} 
            onChange={setActiveTab}
            type="card"
            size="large"
            tabBarStyle={{ 
              marginBottom: 0,
              padding: '0 24px',
              background: '#fafafa',
              borderBottom: '1px solid #f0f0f0'
            }}
            items={[
              {
                key: '1',
                label: (
                  <Space>
                    <CalendarOutlined />
                    <span>Tahun Akademik Otomatis</span>
                  </Space>
                ),
                children: (
                  <div style={{ padding: '24px' }}>
                    <Row gutter={[24, 24]}>
                      <Col xs={24} lg={16}>
                        <TahunAkademikSelector 
                          onTahunAkademikChange={() => fetchStats()}
                          showStats={true}
                          allowChange={true}
                        />
                      </Col>
                      <Col xs={24} lg={8}>
                        <Card 
                          title={
                            <Space>
                              <CalendarOutlined style={{ color: '#3730a3' }} />
                              <span>Sistem Tahun Akademik Otomatis</span>
                            </Space>
                          }
                          size="small"
                          style={{ 
                            background: 'linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%)', 
                            border: '1px solid #c7d2fe',
                            borderRadius: 12,
                            boxShadow: '0 2px 8px rgba(99, 102, 241, 0.1)'
                          }}
                          bodyStyle={{ padding: '16px' }}
                        >
                        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                          <div>
                            <Text strong style={{ color: '#3730a3' }}>Sistem Otomatis:</Text>
                            <ul style={{ margin: '8px 0', paddingLeft: 20, color: '#6366f1' }}>
                              <li>🌞 <strong>Semester 1:</strong> Juli - Desember</li>
                              <li>❄️ <strong>Semester 2:</strong> Januari - Juni</li>
                              <li>🔄 Auto-generate berdasarkan kalender</li>
                              <li>📊 Data tersusun rapi per semester</li>
                            </ul>
                          </div>
                          <Divider style={{ margin: '12px 0' }} />
                          <div>
                            <Text strong style={{ color: '#3730a3' }}>Keuntungan:</Text>
                            <ul style={{ margin: '8px 0', paddingLeft: 20, color: '#6366f1' }}>
                              <li>✅ Tidak perlu input manual</li>
                              <li>✅ Konsisten dengan kalender umum</li>
                              <li>✅ Filter data otomatis</li>
                              <li>✅ Historical data terjaga</li>
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
                  </div>
                )
              },
              {
                key: '2',
                label: (
                  <Space>
                    <PlusOutlined />
                    <span>Kelola Jenis Ujian</span>
                  </Space>
                ),
                children: (
                  <div style={{ padding: '24px' }}>
                    <Row gutter={[24, 24]}>
                      <Col xs={24}>
                        <Card 
                          title={
                            <Space>
                              <div style={{
                                padding: 8,
                                background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                                borderRadius: 8,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}>
                                <BookOutlined style={{ fontSize: 16, color: 'white' }} />
                              </div>
                              <span style={{ fontSize: 16, fontWeight: 600 }}>Manajemen Jenis Ujian</span>
                            </Space>
                          }
                          extra={
                            <Button 
                              type="primary" 
                              icon={<PlusOutlined />}
                              onClick={() => setShowJenisUjianModal(true)}
                              size="large"
                              style={{
                                background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                                border: 'none',
                                borderRadius: 8,
                                boxShadow: '0 2px 8px rgba(22, 163, 74, 0.3)',
                                height: 40
                              }}
                            >
                              Tambah Jenis Ujian
                            </Button>
                          }
                          style={{
                            borderRadius: 12,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                          }}
                          bodyStyle={{ padding: '20px' }}
                        >
                        <Row gutter={[16, 16]}>
                          <Col xs={24} lg={16}>
                            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                              <Alert
                                message="Informasi Jenis Ujian"
                                description="Kelola berbagai jenis ujian yang akan digunakan dalam sistem penilaian. Setiap jenis ujian dapat memiliki komponen penilaian yang berbeda."
                                type="info"
                                showIcon
                                style={{
                                  borderRadius: 8,
                                  border: '1px solid #91d5ff',
                                  background: 'linear-gradient(135deg, #f6ffed 0%, #f0f9ff 100%)'
                                }}
                              />
                              <div style={{
                                background: 'white',
                                borderRadius: 12,
                                padding: '20px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                                border: '1px solid #f0f0f0'
                              }}>
                                <DaftarTemplate type="jenis-ujian" onRefresh={fetchStats} />
                              </div>
                            </Space>
                          </Col>
                          <Col xs={24} lg={8}>
                            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                              {/* Jenis Ujian Tersedia Card */}
                              <Card 
                                title={
                                  <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                                      <span className="text-white text-sm font-bold">📝</span>
                                    </div>
                                    <span className="font-bold text-gray-800">Jenis Ujian Tersedia</span>
                                  </div>
                                }
                                className="border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                                style={{ 
                                  background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                                  borderRadius: '16px'
                                }}
                              >
                                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                  {/* Tasmi Card */}
                                  <div className="p-4 bg-white rounded-xl shadow-sm border border-green-100 hover:shadow-md transition-all duration-200">
                                    <div className="flex items-center gap-3 mb-2">
                                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                                        <span className="text-white text-lg">📄</span>
                                      </div>
                                      <div>
                                        <Text strong className="text-lg text-gray-800">Tasmi'</Text>
                                        <div className="text-sm text-gray-500">Penilaian hafalan per halaman</div>
                                      </div>
                                    </div>
                                    <div className="bg-blue-50 rounded-lg p-2 mt-2">
                                      <Text className="text-xs text-blue-700">
                                        ✨ Cocok untuk evaluasi detail setiap halaman mushaf
                                      </Text>
                                    </div>
                                  </div>

                                  {/* MHQ Card */}
                                  <div className="p-4 bg-white rounded-xl shadow-sm border border-green-100 hover:shadow-md transition-all duration-200">
                                    <div className="flex items-center gap-3 mb-2">
                                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                                        <span className="text-white text-lg">🏆</span>
                                      </div>
                                      <div>
                                        <Text strong className="text-lg text-gray-800">MHQ</Text>
                                        <div className="text-sm text-gray-500">Musabaqah Hifdzil Qur'an</div>
                                      </div>
                                    </div>
                                    <div className="bg-purple-50 rounded-lg p-2 mt-2">
                                      <Text className="text-xs text-purple-700">
                                        🎯 Lomba hafalan dengan penilaian komprehensif
                                      </Text>
                                    </div>
                                  </div>

                                  {/* UAS Card */}
                                  <div className="p-4 bg-white rounded-xl shadow-sm border border-green-100 hover:shadow-md transition-all duration-200">
                                    <div className="flex items-center gap-3 mb-2">
                                      <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                                        <span className="text-white text-lg">📚</span>
                                      </div>
                                      <div>
                                        <Text strong className="text-lg text-gray-800">UAS</Text>
                                        <div className="text-sm text-gray-500">Ujian Akhir Semester</div>
                                      </div>
                                    </div>
                                    <div className="bg-orange-50 rounded-lg p-2 mt-2">
                                      <Text className="text-xs text-orange-700">
                                        📅 Evaluasi komprehensif di akhir semester
                                      </Text>
                                    </div>
                                  </div>

                                  {/* Kenaikan Juz Card */}
                                  <div className="p-4 bg-white rounded-xl shadow-sm border border-green-100 hover:shadow-md transition-all duration-200">
                                    <div className="flex items-center gap-3 mb-2">
                                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center">
                                        <span className="text-white text-lg">⬆️</span>
                                      </div>
                                      <div>
                                        <Text strong className="text-lg text-gray-800">Kenaikan Juz</Text>
                                        <div className="text-sm text-gray-500">Ujian naik juz hafalan</div>
                                      </div>
                                    </div>
                                    <div className="bg-green-50 rounded-lg p-2 mt-2">
                                      <Text className="text-xs text-green-700">
                                        🚀 Tes kenaikan level hafalan santri
                                      </Text>
                                    </div>
                                  </div>
                                </Space>
                              </Card>

                              {/* Komponen Penilaian Card */}
                              <Card 
                                title={
                                  <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center">
                                      <span className="text-white text-sm font-bold">⚖️</span>
                                    </div>
                                    <span className="font-bold text-gray-800">Komponen Penilaian</span>
                                  </div>
                                }
                                className="border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                                style={{ 
                                  background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                                  borderRadius: '16px'
                                }}
                              >
                                <div className="space-y-4">
                                  <div className="bg-white rounded-xl p-4 border border-yellow-100">
                                    <Text className="text-sm text-gray-700 leading-relaxed">
                                      Setiap jenis ujian dapat memiliki komponen penilaian yang berbeda. 
                                      Anda dapat menambah, mengurangi, dan mengatur bobot setiap komponen sesuai kebutuhan.
                                    </Text>
                                  </div>
                                  
                                  <div className="bg-white rounded-xl p-4 border border-yellow-100">
                                    <div className="flex items-center gap-2 mb-3">
                                      <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                                        <span className="text-white text-xs">🏆</span>
                                      </div>
                                      <Text strong className="text-gray-800">Contoh Komponen MHQ:</Text>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-2">
                                      <div className="bg-purple-50 rounded-lg p-2 text-center">
                                        <div className="font-semibold text-purple-800 text-sm">Tajwid</div>
                                        <div className="text-xs text-purple-600">30%</div>
                                      </div>
                                      <div className="bg-blue-50 rounded-lg p-2 text-center">
                                        <div className="font-semibold text-blue-800 text-sm">Sifatul Huruf</div>
                                        <div className="text-xs text-blue-600">25%</div>
                                      </div>
                                      <div className="bg-green-50 rounded-lg p-2 text-center">
                                        <div className="font-semibold text-green-800 text-sm">Kejelasan</div>
                                        <div className="text-xs text-green-600">25%</div>
                                      </div>
                                      <div className="bg-orange-50 rounded-lg p-2 text-center">
                                        <div className="font-semibold text-orange-800 text-sm">Kelancaran</div>
                                        <div className="text-xs text-orange-600">20%</div>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                                    <div className="flex items-start gap-2">
                                      <span className="text-yellow-600 text-lg">💡</span>
                                      <div>
                                        <Text strong className="text-yellow-800 text-sm">Tips:</Text>
                                        <ul className="text-xs text-yellow-700 mt-1 space-y-1">
                                          <li>• Total bobot harus 100%</li>
                                          <li>• Sesuaikan dengan kebutuhan evaluasi</li>
                                          <li>• Bisa diubah kapan saja</li>
                                        </ul>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </Card>
                            </Space>
                          </Col>
                        </Row>
                      </Card>
                    </Col>
                  </Row>
                  </div>
                )
              },
              {
                key: '3',
                label: (
                  <Space>
                    <FileTextOutlined />
                    <span>Template Raport</span>
                  </Space>
                ),
                children: (
                  <div style={{ padding: '24px' }}>
                    <Row gutter={[24, 24]}>
                      <Col xs={24}>
                        <Card 
                          title={
                            <Space>
                              <div style={{
                                padding: 8,
                                background: 'linear-gradient(135deg, #be185d 0%, #9f1239 100%)',
                                borderRadius: 8,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}>
                                <FileTextOutlined style={{ fontSize: 16, color: 'white' }} />
                              </div>
                              <span style={{ fontSize: 16, fontWeight: 600 }}>Manajemen Template Raport</span>
                            </Space>
                          }
                          extra={
                            <Button 
                              type="primary" 
                              icon={<PlusOutlined />}
                              onClick={() => setShowTemplateRaportModal(true)}
                              size="large"
                              style={{
                                background: 'linear-gradient(135deg, #be185d 0%, #9f1239 100%)',
                                border: 'none',
                                borderRadius: 8,
                                boxShadow: '0 2px 8px rgba(190, 24, 93, 0.3)',
                                height: 40
                              }}
                            >
                              Buat Template Raport
                            </Button>
                          }
                          style={{
                            borderRadius: 12,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                          }}
                          bodyStyle={{ padding: '20px' }}
                        >
                        <Row gutter={[16, 16]}>
                          <Col xs={24} lg={16}>
                            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                              <Alert
                                message="Informasi Template Raport"
                                description="Kelola template raport yang akan digunakan untuk mencetak laporan hasil belajar santri. Atur header, footer, dan logo sesuai kebutuhan lembaga."
                                type="info"
                                showIcon
                                style={{
                                  borderRadius: 8,
                                  border: '1px solid #91d5ff',
                                  background: 'linear-gradient(135deg, #f6ffed 0%, #f0f9ff 100%)'
                                }}
                              />
                              <div style={{
                                background: 'white',
                                borderRadius: 12,
                                padding: '20px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                                border: '1px solid #f0f0f0'
                              }}>
                                <DaftarTemplate type="template-raport" onRefresh={fetchStats} />
                              </div>
                            </Space>
                          </Col>
                          <Col xs={24} lg={8}>
                            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                              <Card 
                                title="Komponen Template Raport" 
                                size="small"
                                style={{ background: '#fdf2f8', border: '1px solid #f9a8d4' }}
                              >
                                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                  <div style={{ padding: 8, background: 'white', borderRadius: 6, border: '1px solid #f3e8ff' }}>
                                    <Text strong style={{ color: '#7c2d12' }}>📄 Header</Text>
                                    <br />
                                    <Text style={{ fontSize: 12, color: '#be185d' }}>Nama lembaga, alamat, kontak</Text>
                                  </div>
                                  <div style={{ padding: 8, background: 'white', borderRadius: 6, border: '1px solid #f3e8ff' }}>
                                    <Text strong style={{ color: '#7c2d12' }}>🖼️ Logo</Text>
                                    <br />
                                    <Text style={{ fontSize: 12, color: '#be185d' }}>Logo lembaga untuk kop surat</Text>
                                  </div>
                                  <div style={{ padding: 8, background: 'white', borderRadius: 6, border: '1px solid #f3e8ff' }}>
                                    <Text strong style={{ color: '#7c2d12' }}>📝 Footer</Text>
                                    <br />
                                    <Text style={{ fontSize: 12, color: '#be185d' }}>Tanda tangan, cap, keterangan</Text>
                                  </div>
                                </Space>
                              </Card>

                              <Card 
                                title="Preview Template" 
                                size="small"
                                style={{ background: '#f0f9ff', border: '1px solid #bfdbfe' }}
                              >
                                <div style={{ 
                                  border: '2px dashed #cbd5e1', 
                                  borderRadius: 8, 
                                  padding: 16, 
                                  textAlign: 'center',
                                  background: '#f8fafc'
                                }}>
                                  <FileTextOutlined style={{ fontSize: 32, color: '#64748b', marginBottom: 8 }} />
                                  <br />
                                  <Text style={{ fontSize: 12, color: '#64748b' }}>
                                    Preview template raport akan muncul di sini setelah Anda membuat template
                                  </Text>
                                </div>
                              </Card>
                            </Space>
                          </Col>
                        </Row>
                      </Card>
                    </Col>
                  </Row>
                  </div>
                )
              }
            ]}
          />
        </Card>

        {/* Modal Form Jenis Ujian */}
        <Modal
          title={
            <div style={{ 
              padding: '8px 0',
              borderBottom: '1px solid #f0f0f0',
              marginBottom: 16
            }}>
              <Space>
                <div style={{
                  padding: 8,
                  background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <BookOutlined style={{ fontSize: 16, color: 'white' }} />
                </div>
                <span style={{ fontSize: 16, fontWeight: 600 }}>Tambah Jenis Ujian Baru</span>
              </Space>
            </div>
          }
          open={showJenisUjianModal}
          onCancel={() => setShowJenisUjianModal(false)}
          footer={null}
          width={900}
          style={{ top: 20 }}
          destroyOnClose
          styles={{
            content: {
              borderRadius: 12,
              overflow: 'hidden'
            }
          }}
        >
          <FormJenisUjian 
            onSuccess={() => {
              fetchStats()
              setShowJenisUjianModal(false)
            }} 
          />
        </Modal>

        {/* Modal Form Template Raport */}
        <Modal
          title={
            <div style={{ 
              padding: '8px 0',
              borderBottom: '1px solid #f0f0f0',
              marginBottom: 16
            }}>
              <Space>
                <div style={{
                  padding: 8,
                  background: 'linear-gradient(135deg, #be185d 0%, #9f1239 100%)',
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <FileTextOutlined style={{ fontSize: 16, color: 'white' }} />
                </div>
                <span style={{ fontSize: 16, fontWeight: 600 }}>Buat Template Raport Baru</span>
              </Space>
            </div>
          }
          open={showTemplateRaportModal}
          onCancel={() => setShowTemplateRaportModal(false)}
          footer={null}
          width={1000}
          style={{ top: 20 }}
          destroyOnClose
          styles={{
            content: {
              borderRadius: 12,
              overflow: 'hidden'
            }
          }}
        >
          <FormTemplateRaport 
            onSuccess={() => {
              fetchStats()
              setShowTemplateRaportModal(false)
            }} 
          />
        </Modal>
      </div>
    </LayoutApp>
  )
}