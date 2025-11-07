'use client'

import { useState, useEffect } from 'react'
import { 
  Card, 
  Form, 
  InputNumber, 
  Button, 
  Space, 
  Typography, 
  Row, 
  Col,
  Divider,
  Tag,
  Alert,
  Tabs,
  message,
  Progress
} from 'antd'
import { 
  SaveOutlined, 
  BookOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
  QuranIcon
} from '@ant-design/icons'

const { Title, Text } = Typography

interface UjianData {
  santriIds: string[]
  jenisUjian: {
    id: string
    nama: string
    tipeUjian: 'per-halaman' | 'per-juz'
    komponenPenilaian: Array<{
      nama: string
      bobot: number
    }>
  }
  juzRange?: {
    dari: number
    sampai: number
  }
}

interface FormPenilaianUjianProps {
  ujianData: UjianData
  onBack: () => void
  onComplete: () => void
}

// Data Al-Quran (simulasi - dalam implementasi nyata bisa dari API)
const quranData = {
  juz: Array.from({ length: 30 }, (_, i) => ({
    nomor: i + 1,
    nama: `Juz ${i + 1}`,
    halaman: {
      dari: i * 20 + 1,
      sampai: (i + 1) * 20
    },
    surat: `Surat dalam Juz ${i + 1}` // Simplified
  }))
}

export function FormPenilaianUjian({ ujianData, onBack, onComplete }: FormPenilaianUjianProps) {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('0')
  const [nilaiData, setNilaiData] = useState<Record<string, any>>({})
  const [santriList, setSantriList] = useState<any[]>([])

  useEffect(() => {
    fetchSantriDetails()
  }, [])

  const fetchSantriDetails = async () => {
    try {
      // Fetch detail santri berdasarkan ID
      const promises = ujianData.santriIds.map(id => 
        fetch(`/api/guru/santri/${id}`).then(res => res.json())
      )
      const results = await Promise.all(promises)
      setSantriList(results.map(r => r.data).filter(Boolean))
    } catch (error) {
      console.error('Error fetching santri details:', error)
    }
  }

  const handleNilaiChange = (santriId: string, field: string, value: number) => {
    setNilaiData(prev => ({
      ...prev,
      [santriId]: {
        ...prev[santriId],
        [field]: value
      }
    }))
  }

  const calculateFinalScore = (santriId: string) => {
    const santriNilai = nilaiData[santriId] || {}
    
    if (ujianData.jenisUjian.tipeUjian === 'per-halaman') {
      // Untuk per-halaman, hitung rata-rata dari semua halaman
      const halamanNilai = Object.keys(santriNilai)
        .filter(key => key.startsWith('halaman_'))
        .map(key => santriNilai[key] || 0)
      
      if (halamanNilai.length === 0) return 0
      return halamanNilai.reduce((sum, nilai) => sum + nilai, 0) / halamanNilai.length
    } else {
      // Untuk per-juz, hitung berdasarkan bobot komponen
      let totalNilai = 0
      ujianData.jenisUjian.komponenPenilaian.forEach(komponen => {
        const nilai = santriNilai[komponen.nama] || 0
        totalNilai += (nilai * komponen.bobot) / 100
      })
      return totalNilai
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      // Validasi semua santri sudah dinilai
      const allComplete = ujianData.santriIds.every(santriId => {
        const finalScore = calculateFinalScore(santriId)
        return finalScore > 0
      })

      if (!allComplete) {
        message.error('Pastikan semua santri sudah dinilai')
        setLoading(false)
        return
      }

      // Prepare data untuk disimpan
      const ujianResults = ujianData.santriIds.map(santriId => ({
        santriId,
        jenisUjianId: ujianData.jenisUjian.id,
        nilaiDetail: nilaiData[santriId] || {},
        nilaiAkhir: calculateFinalScore(santriId),
        juzRange: ujianData.juzRange,
        tanggalUjian: new Date().toISOString()
      }))

      // Simpan ke API
      const response = await fetch('/api/guru/ujian', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ujianResults,
          jenisUjian: ujianData.jenisUjian
        })
      })

      if (response.ok) {
        message.success('Ujian berhasil disimpan!')
        onComplete()
      } else {
        throw new Error('Gagal menyimpan ujian')
      }
    } catch (error) {
      console.error('Error saving ujian:', error)
      message.error('Gagal menyimpan ujian')
    } finally {
      setLoading(false)
    }
  }

  const renderPerHalamanForm = (santri: any) => {
    if (!ujianData.juzRange) return null

    const juzList = quranData.juz.slice(ujianData.juzRange.dari - 1, ujianData.juzRange.sampai)
    
    return (
      <div>
        <Alert
          message="Penilaian Per Halaman"
          description={`Berikan nilai untuk setiap halaman dalam rentang Juz ${ujianData.juzRange.dari} - ${ujianData.juzRange.sampai}. Setiap juz memiliki 20 halaman.`}
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />

        {juzList.map(juz => (
          <Card 
            key={juz.nomor}
            title={
              <Space>
                <BookOutlined style={{ color: '#1890ff' }} />
                <span>{juz.nama}</span>
                <Tag color="blue">Halaman {juz.halaman.dari} - {juz.halaman.sampai}</Tag>
              </Space>
            }
            size="small"
            style={{ marginBottom: 16 }}
          >
            <Row gutter={[16, 16]}>
              {Array.from({ length: 20 }, (_, i) => {
                const halamanNo = juz.halaman.dari + i
                const fieldName = `halaman_${halamanNo}`
                
                return (
                  <Col xs={12} sm={8} md={6} lg={4} key={halamanNo}>
                    <div style={{ textAlign: 'center' }}>
                      <Text style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
                        Hal. {halamanNo}
                      </Text>
                      <InputNumber
                        min={0}
                        max={100}
                        value={nilaiData[santri.id]?.[fieldName]}
                        onChange={(value) => handleNilaiChange(santri.id, fieldName, value || 0)}
                        style={{ width: '100%' }}
                        placeholder="0-100"
                      />
                    </div>
                  </Col>
                )
              })}
            </Row>
          </Card>
        ))}
      </div>
    )
  }

  const renderPerJuzForm = (santri: any) => {
    return (
      <div>
        <Alert
          message="Penilaian Per Juz"
          description="Berikan nilai untuk setiap komponen penilaian. Nilai akhir akan dihitung berdasarkan bobot masing-masing komponen."
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />

        <Card title="Komponen Penilaian" size="small">
          <Row gutter={[24, 16]}>
            {ujianData.jenisUjian.komponenPenilaian.map((komponen, index) => (
              <Col xs={24} sm={12} md={8} key={index}>
                <div>
                  <Text strong style={{ display: 'block', marginBottom: 8 }}>
                    {komponen.nama}
                  </Text>
                  <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>
                    Bobot: {komponen.bobot}%
                  </Text>
                  <InputNumber
                    min={0}
                    max={100}
                    value={nilaiData[santri.id]?.[komponen.nama]}
                    onChange={(value) => handleNilaiChange(santri.id, komponen.nama, value || 0)}
                    style={{ width: '100%' }}
                    placeholder="0-100"
                    size="large"
                  />
                </div>
              </Col>
            ))}
          </Row>

          <Divider />

          <div style={{ textAlign: 'center' }}>
            <Text strong style={{ fontSize: 16 }}>Nilai Akhir: </Text>
            <Tag 
              color={calculateFinalScore(santri.id) >= 75 ? 'success' : calculateFinalScore(santri.id) >= 60 ? 'warning' : 'error'}
              style={{ fontSize: 16, padding: '4px 12px' }}
            >
              {calculateFinalScore(santri.id).toFixed(1)}
            </Tag>
          </div>
        </Card>
      </div>
    )
  }

  const renderQuranDigital = () => {
    if (!ujianData.juzRange) return null

    return (
      <Card 
        title={
          <Space>
            <BookOutlined style={{ color: '#52c41a' }} />
            <span>Al-Quran Digital</span>
          </Space>
        }
        size="small"
        style={{ 
          position: 'sticky', 
          top: 20,
          maxHeight: '70vh',
          overflow: 'auto'
        }}
      >
        <Alert
          message="Referensi Al-Quran"
          description={`Juz ${ujianData.juzRange.dari} - ${ujianData.juzRange.sampai} untuk membantu penilaian`}
          type="success"
          showIcon
          style={{ marginBottom: 16 }}
        />
        
        {quranData.juz.slice(ujianData.juzRange.dari - 1, ujianData.juzRange.sampai).map(juz => (
          <div key={juz.nomor} style={{ marginBottom: 16, padding: 12, background: '#f8f9fa', borderRadius: 8 }}>
            <Text strong>{juz.nama}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              Halaman {juz.halaman.dari} - {juz.halaman.sampai}
            </Text>
            <br />
            <Text style={{ fontSize: 12 }}>{juz.surat}</Text>
          </div>
        ))}
      </Card>
    )
  }

  const getProgress = () => {
    const totalSantri = ujianData.santriIds.length
    const completedSantri = ujianData.santriIds.filter(santriId => 
      calculateFinalScore(santriId) > 0
    ).length
    return (completedSantri / totalSantri) * 100
  }

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ marginBottom: 24 }}>
          <Title level={3} style={{ margin: 0 }}>
            Form Penilaian Ujian - {ujianData.jenisUjian.nama}
          </Title>
          <Text type="secondary">
            Tipe: {ujianData.jenisUjian.tipeUjian === 'per-juz' ? 'Per Juz' : 'Per Halaman'}
            {ujianData.juzRange && ` • Juz ${ujianData.juzRange.dari} - ${ujianData.juzRange.sampai}`}
          </Text>
          
          <div style={{ marginTop: 16 }}>
            <Text>Progress Penilaian:</Text>
            <Progress 
              percent={getProgress()} 
              status={getProgress() === 100 ? 'success' : 'active'}
              style={{ marginTop: 8 }}
            />
          </div>
        </div>

        <Row gutter={24}>
          <Col xs={24} lg={ujianData.jenisUjian.tipeUjian === 'per-halaman' ? 18 : 24}>
            <Tabs 
              activeKey={activeTab} 
              onChange={setActiveTab}
              type="card"
              items={santriList.map((santri, index) => ({
                key: index.toString(),
                label: (
                  <Space>
                    <span>{santri.nama}</span>
                    {calculateFinalScore(santri.id) > 0 && (
                      <CheckCircleOutlined style={{ color: '#52c41a' }} />
                    )}
                  </Space>
                ),
                children: ujianData.jenisUjian.tipeUjian === 'per-halaman' 
                  ? renderPerHalamanForm(santri)
                  : renderPerJuzForm(santri)
              }))}
            />
          </Col>

          {ujianData.jenisUjian.tipeUjian === 'per-halaman' && (
            <Col xs={24} lg={6}>
              {renderQuranDigital()}
            </Col>
          )}
        </Row>

        <Divider />

        <div style={{ textAlign: 'right' }}>
          <Space>
            <Button 
              onClick={onBack}
              icon={<ArrowLeftOutlined />}
            >
              Kembali
            </Button>
            
            <Button 
              type="primary" 
              onClick={handleSubmit}
              loading={loading}
              icon={<SaveOutlined />}
              disabled={getProgress() < 100}
              style={{
                background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
                border: 'none'
              }}
            >
              Simpan Ujian
            </Button>
          </Space>
        </div>
      </Card>
    </div>
  )
}