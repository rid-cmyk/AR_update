'use client'

import { useState, useEffect } from 'react'
import { 
  Steps, 
  Card, 
  Button, 
  Select, 
  Form, 
  Space, 
  Typography, 
  Row, 
  Col,
  Alert,
  Divider,
  Tag,
  InputNumber,
  message
} from 'antd'
import { 
  UserOutlined, 
  BookOutlined, 
  EditOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CheckCircleOutlined
} from '@ant-design/icons'

const { Title, Text } = Typography
const { Option } = Select

interface Santri {
  id: string
  nama: string
  kelas: string
}

interface JenisUjian {
  id: string
  nama: string
  deskripsi: string
  tipeUjian: 'per-halaman' | 'per-juz'
  jenisUjian: string
  komponenPenilaian: Array<{
    nama: string
    bobot: number
    nilaiMaksimal?: number
  }>
}

interface FormUjianWizardProps {
  onComplete: (data: any) => void
  onCancel: () => void
}

export function FormUjianWizard({ onComplete, onCancel }: FormUjianWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  
  // Data states
  const [santriList, setSantriList] = useState<Santri[]>([])
  const [jenisUjianList, setJenisUjianList] = useState<JenisUjian[]>([])
  
  // Form data states
  const [selectedSantri, setSelectedSantri] = useState<string>('') // Changed to single selection
  const [selectedJenisUjian, setSelectedJenisUjian] = useState<JenisUjian | null>(null)
  const [juzRange, setJuzRange] = useState<{ dari: number; sampai: number }>({ dari: 1, sampai: 1 })

  useEffect(() => {
    let isMounted = true
    
    const fetchData = async () => {
      if (isMounted) {
        await fetchSantriList()
        await fetchJenisUjianList()
      }
    }
    
    fetchData()
    
    return () => {
      isMounted = false
    }
  }, [])

  const fetchSantriList = async () => {
    try {
      setLoading(true)
      // Fetch santri dari halaqah guru yang sedang login
      const response = await fetch('/api/guru/santri')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          // API returns data.data.santriList, map to expected format
          const santriData = data.data?.santriList || []
          // Limit to prevent memory issues
          const limitedSantri = santriData.slice(0, 50)
          const mappedSantri = limitedSantri.map((santri: any) => ({
            id: santri.id.toString(),
            nama: santri.namaLengkap,
            kelas: santri.halaqah?.namaHalaqah || 'Tidak ada halaqah'
          }))
          setSantriList(mappedSantri)
        } else {
          message.error('Gagal memuat data santri dari halaqah Anda')
        }
      } else {
        message.error('Tidak dapat mengakses data santri')
      }
    } catch (error) {
      console.error('Error fetching santri:', error)
      message.error('Terjadi kesalahan saat memuat data santri')
    } finally {
      setLoading(false)
    }
  }

  const fetchJenisUjianList = async () => {
    try {
      const response = await fetch('/api/admin/jenis-ujian')
      if (response.ok) {
        const result = await response.json()
        // Limit jenis ujian to prevent memory issues
        const limitedJenis = (result.data || []).slice(0, 20)
        setJenisUjianList(limitedJenis)
      }
    } catch (error) {
      console.error('Error fetching jenis ujian:', error)
      // Set default jenis ujian if API fails
      setJenisUjianList([
        {
          id: 'tasmi',
          nama: "Tasmi'",
          deskripsi: 'Ujian hafalan dengan mendengarkan',
          tipeUjian: 'per-juz',
          komponenPenilaian: [
            { nama: 'Kelancaran', bobot: 40, nilaiMaksimal: 100 },
            { nama: 'Tajwid', bobot: 30, nilaiMaksimal: 100 },
            { nama: 'Makhorijul Huruf', bobot: 30, nilaiMaksimal: 100 }
          ]
        }
      ])
    }
  }

  const handleNext = () => {
    if (currentStep === 0) {
      if (!selectedSantri) {
        message.error('Pilih santri untuk ujian')
        return
      }
    } else if (currentStep === 1) {
      if (!selectedJenisUjian) {
        message.error('Pilih jenis ujian terlebih dahulu')
        return
      }
      if (selectedJenisUjian.tipeUjian === 'per-juz' && juzRange.dari > juzRange.sampai) {
        message.error('Juz awal tidak boleh lebih besar dari juz akhir')
        return
      }
    }
    setCurrentStep(currentStep + 1)
  }

  const handlePrev = () => {
    setCurrentStep(currentStep - 1)
  }

  const handleComplete = () => {
    const ujianData = {
      santriIds: [selectedSantri], // Convert single selection to array for compatibility
      jenisUjian: selectedJenisUjian,
      juzRange: selectedJenisUjian?.tipeUjian === 'per-juz' ? juzRange : null,
      timestamp: new Date().toISOString()
    }
    onComplete(ujianData)
  }

  const steps = [
    {
      title: 'Pilih Santri',
      icon: <UserOutlined />,
      description: 'Pilih santri yang akan mengikuti ujian'
    },
    {
      title: 'Pilih Jenis Ujian',
      icon: <BookOutlined />,
      description: 'Tentukan jenis ujian dan rentang juz'
    },
    {
      title: 'Form Ujian',
      icon: <EditOutlined />,
      description: 'Isi nilai ujian santri'
    }
  ]

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Card 
            title={
              <Space>
                <UserOutlined style={{ color: '#1890ff' }} />
                <span>Pilih Santri untuk Ujian</span>
              </Space>
            }
            style={{ minHeight: 400 }}
          >
            <Alert
              message="Informasi"
              description="Pilih satu santri dari halaqah Anda untuk mengikuti ujian. Sistem akan menampilkan santri yang terdaftar di halaqah yang Anda bimbing."
              type="info"
              showIcon
              style={{ marginBottom: 24 }}
            />
            
            <Form.Item
              label={<Text strong>Pilih Santri</Text>}
              required
            >
              <Select
                placeholder="Pilih santri dari halaqah Anda"
                value={selectedSantri}
                onChange={setSelectedSantri}
                style={{ width: '100%' }}
                size="large"
                showSearch
                filterOption={(input, option) =>
                  (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                }
                notFoundContent={santriList.length === 0 ? "Tidak ada santri di halaqah Anda" : "Santri tidak ditemukan"}
              >
                {santriList.map(santri => (
                  <Option key={santri.id} value={santri.id}>
                    <Space>
                      <UserOutlined />
                      <span>{santri.nama}</span>
                      <Tag color="blue">{santri.kelas}</Tag>
                    </Space>
                  </Option>
                ))}
              </Select>
            </Form.Item>

            {selectedSantri && (
              <div style={{ marginTop: 16 }}>
                <Text strong>Santri Terpilih:</Text>
                <div style={{ marginTop: 8 }}>
                  {(() => {
                    const santri = santriList.find(s => s.id === selectedSantri)
                    return santri ? (
                      <Tag color="processing" style={{ padding: '8px 12px', fontSize: '14px' }}>
                        <UserOutlined style={{ marginRight: 8 }} />
                        {santri.nama} - {santri.kelas}
                      </Tag>
                    ) : null
                  })()}
                </div>
              </div>
            )}
          </Card>
        )

      case 1:
        return (
          <Card 
            title={
              <Space>
                <BookOutlined style={{ color: '#52c41a' }} />
                <span>Pilih Jenis Ujian & Rentang</span>
              </Space>
            }
            style={{ minHeight: 400 }}
          >
            <Row gutter={[24, 24]}>
              <Col xs={24} lg={12}>
                <Form.Item
                  label={<Text strong>Jenis Ujian</Text>}
                  required
                >
                  <Select
                    placeholder="Pilih jenis ujian"
                    value={selectedJenisUjian?.id}
                    onChange={(value) => {
                      const jenisUjian = jenisUjianList.find(j => j.id === value)
                      setSelectedJenisUjian(jenisUjian || null)
                    }}
                    size="large"
                    style={{ width: '100%' }}
                  >
                    {jenisUjianList.map(jenis => (
                      <Option key={jenis.id} value={jenis.id}>
                        <div>
                          <div style={{ fontWeight: 600 }}>{jenis.nama}</div>
                          <div style={{ fontSize: 12, color: '#666' }}>{jenis.deskripsi}</div>
                          <Tag color={jenis.tipeUjian === 'per-juz' ? 'blue' : 'green'} style={{ marginTop: 4 }}>
                            {jenis.tipeUjian === 'per-juz' ? '📚 Per Juz' : '📄 Per Halaman'}
                          </Tag>
                        </div>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                {selectedJenisUjian && (
                  <>
                    <Divider />
                    
                    {/* Aspek Penilaian */}
                    <div style={{ marginBottom: 24 }}>
                      <Text strong style={{ display: 'block', marginBottom: 12 }}>
                        📋 Aspek Penilaian - {selectedJenisUjian.nama}
                      </Text>
                      <div style={{ 
                        background: selectedJenisUjian.jenisUjian === 'mhq' ? '#f0f9ff' : '#f8fafc', 
                        padding: 16, 
                        borderRadius: 8,
                        border: selectedJenisUjian.jenisUjian === 'mhq' ? '1px solid #0ea5e9' : '1px solid #e2e8f0'
                      }}>
                        {selectedJenisUjian.jenisUjian === 'mhq' && (
                          <div style={{ marginBottom: 12 }}>
                            <Tag color="blue" style={{ marginBottom: 8 }}>
                              🏆 MHQ - Musabaqah Hifdzil Quran
                            </Tag>
                            <div style={{ fontSize: 12, color: '#0369a1' }}>
                              Ujian dengan Al-Quran Digital dan penilaian komprehensif
                            </div>
                          </div>
                        )}
                        
                        <Row gutter={[8, 8]}>
                          {selectedJenisUjian.komponenPenilaian.map((komponen, index) => (
                            <Col span={12} key={index}>
                              <div style={{ 
                                background: 'white', 
                                padding: 8, 
                                borderRadius: 6,
                                border: '1px solid #e5e7eb',
                                textAlign: 'center'
                              }}>
                                <div style={{ fontWeight: 600, fontSize: 13 }}>
                                  {komponen.nama}
                                </div>
                                <div style={{ fontSize: 11, color: '#666' }}>
                                  Bobot: {komponen.bobot}% • Max: {komponen.nilaiMaksimal}
                                </div>
                              </div>
                            </Col>
                          ))}
                        </Row>
                      </div>
                    </div>

                    {/* Rentang Juz */}
                    {selectedJenisUjian.tipeUjian === 'per-juz' && (
                      <div>
                        <Text strong style={{ display: 'block', marginBottom: 16 }}>📚 Rentang Juz</Text>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item label="Dari Juz">
                          <InputNumber
                            min={1}
                            max={30}
                            value={juzRange.dari}
                            onChange={(value) => setJuzRange(prev => ({ ...prev, dari: value || 1 }))}
                            style={{ width: '100%' }}
                            size="large"
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item label="Sampai Juz">
                          <InputNumber
                            min={juzRange.dari}
                            max={30}
                            value={juzRange.sampai}
                            onChange={(value) => setJuzRange(prev => ({ ...prev, sampai: value || 1 }))}
                            style={{ width: '100%' }}
                            size="large"
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                      </div>
                    )}

                    {/* Rentang Halaman untuk per-halaman */}
                    {selectedJenisUjian.tipeUjian === 'per-halaman' && (
                      <div>
                        <Text strong style={{ display: 'block', marginBottom: 16 }}>📄 Rentang Halaman</Text>
                        <Row gutter={16}>
                          <Col span={12}>
                            <Form.Item label="Dari Juz">
                              <InputNumber
                                min={1}
                                max={30}
                                value={juzRange.dari}
                                onChange={(value) => setJuzRange(prev => ({ ...prev, dari: value || 1 }))}
                                style={{ width: '100%' }}
                                size="large"
                              />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item label="Sampai Juz">
                              <InputNumber
                                min={juzRange.dari}
                                max={30}
                                value={juzRange.sampai}
                                onChange={(value) => setJuzRange(prev => ({ ...prev, sampai: value || 1 }))}
                                style={{ width: '100%' }}
                                size="large"
                              />
                            </Form.Item>
                          </Col>
                        </Row>
                        <div style={{ 
                          background: '#fef3c7', 
                          padding: 12, 
                          borderRadius: 6, 
                          fontSize: 12,
                          color: '#92400e',
                          marginTop: 8
                        }}>
                          💡 Mode per-halaman akan menampilkan setiap halaman dalam rentang juz untuk penilaian detail
                        </div>
                      </div>
                    )}
                  </>
                )}
              </Col>

              <Col xs={24} lg={12}>
                {selectedJenisUjian && (
                  <Card 
                    title="Detail Jenis Ujian" 
                    size="small"
                    style={{ background: '#f8f9fa' }}
                  >
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <div>
                        <Text strong>{selectedJenisUjian.nama}</Text>
                        <br />
                        <Text type="secondary">{selectedJenisUjian.deskripsi}</Text>
                      </div>
                      
                      <Divider style={{ margin: '12px 0' }} />
                      
                      {selectedJenisUjian.tipeUjian === 'per-halaman' ? (
                        <Alert
                          message="Ujian Per Halaman"
                          description="Sistem akan menampilkan 20 input nilai per juz sesuai dengan Al-Quran digital."
                          type="info"
                          showIcon
                        />
                      ) : (
                        <div>
                          <Text strong>Komponen Penilaian:</Text>
                          <div style={{ marginTop: 8 }}>
                            {selectedJenisUjian.komponenPenilaian.map((komponen, index) => (
                              <Tag key={index} color="processing" style={{ margin: '2px' }}>
                                {komponen.nama} ({komponen.bobot}%)
                              </Tag>
                            ))}
                          </div>
                        </div>
                      )}
                    </Space>
                  </Card>
                )}
              </Col>
            </Row>
          </Card>
        )

      case 2:
        return (
          <Card 
            title={
              <Space>
                <CheckCircleOutlined style={{ color: '#52c41a' }} />
                <span>Konfirmasi & Lanjut ke Form Ujian</span>
              </Space>
            }
            style={{ minHeight: 400 }}
          >
            <Alert
              message="Siap Membuat Ujian"
              description="Data ujian sudah lengkap. Klik 'Buat Ujian' untuk melanjutkan ke form pengisian nilai."
              type="success"
              showIcon
              style={{ marginBottom: 24 }}
            />

            <Row gutter={[24, 16]}>
              <Col xs={24} md={12}>
                <Card title="Santri Terpilih" size="small">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    {(() => {
                      const santri = santriList.find(s => s.id === selectedSantri)
                      return santri ? (
                        <div style={{ padding: '12px 0', textAlign: 'center' }}>
                          <UserOutlined style={{ fontSize: '24px', color: '#1890ff', marginBottom: '8px' }} />
                          <br />
                          <Text strong style={{ fontSize: '16px' }}>{santri.nama}</Text>
                          <br />
                          <Tag color="blue" style={{ marginTop: '4px' }}>{santri.kelas}</Tag>
                        </div>
                      ) : (
                        <Text type="secondary">Tidak ada santri terpilih</Text>
                      )
                    })()}
                  </Space>
                </Card>
              </Col>

              <Col xs={24} md={12}>
                <Card title="Detail Ujian" size="small">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div>
                      <Text strong>Jenis Ujian:</Text>
                      <br />
                      <Text>{selectedJenisUjian?.nama}</Text>
                    </div>
                    <div>
                      <Text strong>Tipe:</Text>
                      <br />
                      <Tag color={selectedJenisUjian?.tipeUjian === 'per-juz' ? 'blue' : 'green'}>
                        {selectedJenisUjian?.tipeUjian === 'per-juz' ? '📚 Per Juz' : '📄 Per Halaman'}
                      </Tag>
                    </div>
                    {selectedJenisUjian?.tipeUjian === 'per-juz' && (
                      <div>
                        <Text strong>Rentang Juz:</Text>
                        <br />
                        <Text>Juz {juzRange.dari} - {juzRange.sampai}</Text>
                      </div>
                    )}
                  </Space>
                </Card>
              </Col>
            </Row>
          </Card>
        )

      default:
        return null
    }
  }

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Steps
          current={currentStep}
          items={steps}
          style={{ marginBottom: 32 }}
        />

        {renderStepContent()}

        <Divider />

        <div style={{ textAlign: 'right' }}>
          <Space>
            <Button onClick={onCancel}>
              Batal
            </Button>
            
            {currentStep > 0 && (
              <Button 
                onClick={handlePrev}
                icon={<ArrowLeftOutlined />}
              >
                Sebelumnya
              </Button>
            )}
            
            {currentStep < steps.length - 1 ? (
              <Button 
                type="primary" 
                onClick={handleNext}
                icon={<ArrowRightOutlined />}
              >
                Selanjutnya
              </Button>
            ) : (
              <Button 
                type="primary" 
                onClick={handleComplete}
                icon={<CheckCircleOutlined />}
                style={{
                  background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
                  border: 'none'
                }}
              >
                Buat Ujian
              </Button>
            )}
          </Space>
        </div>
      </Card>
    </div>
  )
}