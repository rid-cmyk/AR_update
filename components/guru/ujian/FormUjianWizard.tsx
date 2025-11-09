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
  const [jumlahPertanyaanPerJuz, setJumlahPertanyaanPerJuz] = useState<number>(1) // Jumlah pertanyaan per juz

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
      if (juzRange.dari > juzRange.sampai) {
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
      juzRange: juzRange, // Semua tipe ujian menggunakan juz range
      jumlahPertanyaanPerJuz: selectedJenisUjian?.tipeUjian === 'per-juz' ? jumlahPertanyaanPerJuz : undefined,
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
            styles={{ body: { padding: '24px' } }}
          >
            <Row gutter={[24, 24]}>
              <Col xs={24} lg={14}>
                <div style={{ 
                  background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                  padding: '20px',
                  borderRadius: '12px',
                  border: '2px solid #0ea5e9',
                  marginBottom: 24
                }}>
                  <Form.Item
                    label={
                      <Text strong style={{ fontSize: 16, color: '#0369a1' }}>
                        🎯 Jenis Ujian
                      </Text>
                    }
                    required
                    style={{ marginBottom: 0 }}
                  >
                    <Select
                      placeholder="Pilih jenis ujian"
                      value={selectedJenisUjian?.id}
                      onChange={(value) => {
                        const jenisUjian = jenisUjianList.find(j => j.id === value)
                        setSelectedJenisUjian(jenisUjian || null)
                        // Reset juz range when changing ujian type
                        setJuzRange({ dari: 1, sampai: 1 })
                      }}
                      size="large"
                      style={{ width: '100%' }}
                    >
                      {jenisUjianList.map(jenis => (
                        <Option key={jenis.id} value={jenis.id}>
                          <div style={{ padding: '8px 0' }}>
                            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>
                              {jenis.nama}
                            </div>
                            <div style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>
                              {jenis.deskripsi}
                            </div>
                            <Tag color={jenis.tipeUjian === 'per-juz' ? 'blue' : 'green'}>
                              {jenis.tipeUjian === 'per-juz' ? '📚 Per Juz' : '📄 Per Halaman'}
                            </Tag>
                          </div>
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </div>

                {selectedJenisUjian && (
                  <>
                    {/* Aspek Penilaian */}
                    <div style={{ 
                      background: 'linear-gradient(135deg, #fefce8 0%, #fef3c7 100%)',
                      padding: '20px',
                      borderRadius: '12px',
                      border: '2px solid #eab308',
                      marginBottom: 24
                    }}>
                      <Text strong style={{ display: 'block', marginBottom: 16, fontSize: 16, color: '#854d0e' }}>
                        📋 Aspek Penilaian - {selectedJenisUjian.nama}
                      </Text>
                      
                      {selectedJenisUjian.jenisUjian === 'mhq' && (
                        <Alert
                          message="🏆 MHQ - Musabaqah Hifdzil Quran"
                          description="Ujian dengan Al-Quran Digital dan penilaian komprehensif"
                          type="info"
                          showIcon
                          style={{ marginBottom: 16 }}
                        />
                      )}
                      
                      <Row gutter={[12, 12]}>
                        {selectedJenisUjian.komponenPenilaian.map((komponen, index) => (
                          <Col span={12} key={index}>
                            <div style={{ 
                              background: 'white', 
                              padding: '12px', 
                              borderRadius: '8px',
                              border: '2px solid #fbbf24',
                              textAlign: 'center',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                            }}>
                              <div style={{ fontWeight: 700, fontSize: 14, color: '#92400e', marginBottom: 4 }}>
                                {komponen.nama}
                              </div>
                              <div style={{ fontSize: 12, color: '#78350f' }}>
                                Bobot: <strong>{komponen.bobot}%</strong> • Max: <strong>{komponen.nilaiMaksimal}</strong>
                              </div>
                            </div>
                          </Col>
                        ))}
                      </Row>
                    </div>

                    {/* Rentang Juz - Untuk semua tipe ujian */}
                    <div style={{ 
                      background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                      padding: '20px',
                      borderRadius: '12px',
                      border: '2px solid #22c55e'
                    }}>
                      <Text strong style={{ display: 'block', marginBottom: 16, fontSize: 16, color: '#166534' }}>
                        📚 Rentang Juz
                      </Text>
                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item label={<Text strong style={{ color: '#166534' }}>Dari Juz</Text>}>
                            <InputNumber
                              min={1}
                              max={30}
                              value={juzRange.dari}
                              onChange={(value) => setJuzRange(prev => ({ ...prev, dari: value || 1 }))}
                              style={{ width: '100%' }}
                              size="large"
                              prefix="📖"
                            />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item label={<Text strong style={{ color: '#166534' }}>Sampai Juz</Text>}>
                            <InputNumber
                              min={juzRange.dari}
                              max={30}
                              value={juzRange.sampai}
                              onChange={(value) => setJuzRange(prev => ({ ...prev, sampai: value || 1 }))}
                              style={{ width: '100%' }}
                              size="large"
                              prefix="📖"
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                      {juzRange.sampai > juzRange.dari && (
                        <Alert
                          message={`Rentang: ${juzRange.sampai - juzRange.dari + 1} Juz (Juz ${juzRange.dari} - ${juzRange.sampai})`}
                          type="success"
                          showIcon
                          style={{ marginTop: 12 }}
                        />
                      )}
                      {selectedJenisUjian.tipeUjian === 'per-halaman' && (
                        <Alert
                          message="💡 Mode per-halaman"
                          description="Sistem akan menampilkan mushaf per halaman untuk setiap juz yang dipilih. Setiap juz memiliki sekitar 20 halaman."
                          type="info"
                          showIcon
                          style={{ marginTop: 12 }}
                        />
                      )}
                    </div>

                    {/* Jumlah Pertanyaan Per Juz - Hanya untuk tipe per-juz */}
                    {selectedJenisUjian.tipeUjian === 'per-juz' && (
                      <div style={{ 
                        background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                        padding: '20px',
                        borderRadius: '12px',
                        border: '2px solid #3b82f6',
                        marginTop: 16
                      }}>
                        <Text strong style={{ display: 'block', marginBottom: 16, fontSize: 16, color: '#1e40af' }}>
                          ❓ Jumlah Pertanyaan Per Juz
                        </Text>
                        <Form.Item 
                          label={<Text strong style={{ color: '#1e40af' }}>Berapa pertanyaan yang akan diujikan per juz?</Text>}
                          extra={<Text type="secondary" style={{ fontSize: 12 }}>
                            Setiap juz akan memiliki {jumlahPertanyaanPerJuz} pertanyaan yang harus dijawab santri
                          </Text>}
                        >
                          <InputNumber
                            min={1}
                            max={10}
                            value={jumlahPertanyaanPerJuz}
                            onChange={(value) => setJumlahPertanyaanPerJuz(value || 1)}
                            style={{ width: '100%' }}
                            size="large"
                            prefix="❓"
                            addonAfter="pertanyaan"
                          />
                        </Form.Item>
                        <Alert
                          message={`Total Pertanyaan: ${(juzRange.sampai - juzRange.dari + 1) * jumlahPertanyaanPerJuz} pertanyaan`}
                          description={`Dengan ${juzRange.sampai - juzRange.dari + 1} juz × ${jumlahPertanyaanPerJuz} pertanyaan per juz`}
                          type="info"
                          showIcon
                          icon={<BookOutlined />}
                        />
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
                      
                      <div>
                        <Text strong>Komponen Penilaian:</Text>
                        <div style={{ marginTop: 8 }}>
                          {selectedJenisUjian.komponenPenilaian.map((komponen, index) => (
                            <Tag key={index} color="processing" style={{ margin: '2px' }}>
                              {komponen.nama} ({komponen.bobot}%)
                            </Tag>
                          ))}
                        </div>
                        {selectedJenisUjian.tipeUjian === 'per-halaman' && (
                          <Alert
                            message="Ujian Per Halaman"
                            description="Sistem akan menampilkan mushaf per halaman. Setiap juz memiliki sekitar 20 halaman untuk dinilai."
                            type="info"
                            showIcon
                            style={{ marginTop: 12 }}
                          />
                        )}
                      </div>
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
                    <div>
                      <Text strong>Rentang Juz:</Text>
                      <br />
                      <Text>Juz {juzRange.dari} - {juzRange.sampai}</Text>
                    </div>
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