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
  message,
} from 'antd'
import { 
  UserOutlined, 
  BookOutlined, 
  EditOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CheckCircleOutlined
} from '@ant-design/icons'
import styles from './FormUjianWizard.module.css'
import { PilihJenisUjianStep } from './PilihJenisUjianStep'
import FormUjianWizardActions from './FormUjianWizardActions'

const { Text } = Typography

interface Santri {
  id: number
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
  onComplete: (data: Record<string, unknown>) => void
  onCancel: () => void
}

export function FormUjianWizard({ onComplete, onCancel }: FormUjianWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
  
  // Data states
  const [santriList, setSantriList] = useState<Santri[]>([])
  const [jenisUjianList, setJenisUjianList] = useState<JenisUjian[]>([])
  
  // Form data states
  const [selectedSantri, setSelectedSantri] = useState<number | ''>('') // Changed to single selection
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          const mappedSantri = limitedSantri.map((santri: Record<string, unknown>) => ({
            id: santri.id as number,
            nama: santri.namaLengkap,
            kelas: (santri.halaqah as { namaHalaqah?: string } | null)?.namaHalaqah || 'Tidak ada halaqah'
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

  const DEFAULT_4_KATEGORI: JenisUjian[] = [
    {
      id: 'kenaikan_juz',
      nama: 'Ujian Kenaikan Juz',
      deskripsi: 'Ujian evaluasi kenaikan juz santri (Penilaian per halaman)',
      tipeUjian: 'per-halaman',
      jenisUjian: 'kenaikan_juz',
      komponenPenilaian: [
        { nama: 'Kelancaran', bobot: 50, nilaiMaksimal: 100 },
        { nama: 'Tajwid & Fashahah', bobot: 50, nilaiMaksimal: 100 }
      ]
    },
    {
      id: 'uas',
      nama: 'Ujian Akhir Semester (UAS)',
      deskripsi: 'Ujian akhir semester hafalan (Penilaian card per juz)',
      tipeUjian: 'per-juz',
      jenisUjian: 'uas',
      komponenPenilaian: [
        { nama: 'Kelancaran Hafalan', bobot: 40, nilaiMaksimal: 100 },
        { nama: 'Tajwid', bobot: 30, nilaiMaksimal: 100 },
        { nama: 'Makhorijul Huruf', bobot: 30, nilaiMaksimal: 100 }
      ]
    },
    {
      id: 'mhq',
      nama: "MHQ (Musabaqah Hifzhil Qur'an)",
      deskripsi: 'Ujian musabaqah dengan 1-3 pertanyaan per juz',
      tipeUjian: 'per-juz',
      jenisUjian: 'mhq',
      komponenPenilaian: [
        { nama: 'Hafalan & Kelancaran', bobot: 40, nilaiMaksimal: 100 },
        { nama: 'Tajwid', bobot: 30, nilaiMaksimal: 100 },
        { nama: 'Fashahah & Adab', bobot: 30, nilaiMaksimal: 100 }
      ]
    },
    {
      id: 'tasmi',
      nama: "Tasmi'",
      deskripsi: 'Ujian hafalan sekali duduk (Penilaian per halaman)',
      tipeUjian: 'per-halaman',
      jenisUjian: 'tasmi',
      komponenPenilaian: [
        { nama: 'Kelancaran', bobot: 40, nilaiMaksimal: 100 },
        { nama: 'Tajwid', bobot: 30, nilaiMaksimal: 100 },
        { nama: 'Makhorijul Huruf', bobot: 30, nilaiMaksimal: 100 }
      ]
    }
  ]

  const fetchJenisUjianList = async () => {
    try {
      const response = await fetch('/api/super-admin/jenis-ujian')
      if (response.ok) {
        const result = await response.json()
        const dataArray = Array.isArray(result) ? result : (result.data || [])
        if (dataArray.length > 0) {
          // Merge with DEFAULT_4_KATEGORI to ensure all 4 are always present
          const merged = [...DEFAULT_4_KATEGORI]
          dataArray.forEach((apiItem: any) => {
            if (!merged.some(m => m.id === apiItem.id || m.nama === apiItem.nama)) {
              merged.push(apiItem)
            }
          })
          setJenisUjianList(merged.slice(0, 20))
          return
        }
      }
    } catch (error) {
      console.error('Error fetching jenis ujian:', error)
    }
    setJenisUjianList(DEFAULT_4_KATEGORI)
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
    const santriObj = santriList.find(s => s.id === selectedSantri)
    const ujianData = {
      santriIds: [selectedSantri], // Convert single selection to array for compatibility
      santriNama: santriObj?.nama || 'Santri Evaluasi',
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
    },
    {
      title: 'Pilih Jenis Ujian',
      icon: <BookOutlined />,
    },
    {
      title: 'Form Ujian',
      icon: <EditOutlined />,
    }
  ]

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Card 
            title={
              <div className="flex items-center gap-3 py-1">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#023047] to-[#219ebc] flex items-center justify-center text-white font-bold text-sm shadow-sm">
                  1
                </div>
                <div>
                  <div className="text-base font-bold text-slate-800">Pilih Santri untuk Ujian</div>
                  <div className="text-xs text-slate-500 font-normal">Tentukan santri dari halaqah Anda yang akan diuji dan dinilai</div>
                </div>
              </div>
            }
            className={styles.stepCard}
          >
            <Alert
              message="Informasi"
              description="Pilih satu santri dari halaqah Anda untuk mengikuti ujian. Sistem akan menampilkan santri yang terdaftar di halaqah yang Anda bimbing."
              type="info"
              showIcon
              className={styles.alertMargin}
              style={{ background: '#eaf6fb', border: '1px solid #b8e3f0', borderRadius: 12, marginBottom: 32 }}
            />

            <Form.Item
              label={<Text strong>Pilih Santri</Text>}
              required
              style={{ marginBottom: 40 }}
            >
              <Select
                placeholder="Pilih santri dari halaqah Anda"
                value={selectedSantri}
                onChange={setSelectedSantri}
                className={styles.santriSelect}
                size="large"
                showSearch
                optionFilterProp="label"
                filterOption={(input, option) =>
                  typeof option?.label === 'string'
                    ? option.label.toLowerCase().includes(input.toLowerCase())
                    : false
                }
                notFoundContent={santriList.length === 0 ? "Tidak ada santri di halaqah Anda" : "Santri tidak ditemukan"}
                loading={loading}
                listHeight={320}
                styles={{ popup: { root: { padding: '6px' } } }}
              >
                {santriList.map(santri => (
                  <Select.Option key={santri.id} value={santri.id} label={santri.nama}>
                    <div style={{ padding: '4px 2px' }}>
                      <Space>
                        <UserOutlined style={{ color: '#219ebc' }} />
                        <span style={{ fontWeight: 500 }}>{santri.nama}</span>
                        <Tag color="blue">{santri.kelas}</Tag>
                      </Space>
                    </div>
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            {selectedSantri && (
              <div className={styles.marginT16} style={{ paddingTop: 8 }}>
                <Text strong>Santri Terpilih:</Text>
                <div className={styles.marginT8}>
                  {(() => {
                    const santri = santriList.find(s => s.id === selectedSantri)
                    return santri ? (
                      <Tag color="processing" className={styles.santriTag}>
                        <UserOutlined className={styles.santriTagIcon} />
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
          <PilihJenisUjianStep
            jenisUjianList={jenisUjianList}
            selectedJenisUjian={selectedJenisUjian}
            setSelectedJenisUjian={setSelectedJenisUjian}
            juzRange={juzRange}
            setJuzRange={setJuzRange}
            jumlahPertanyaanPerJuz={jumlahPertanyaanPerJuz}
            setJumlahPertanyaanPerJuz={setJumlahPertanyaanPerJuz}
          />
        )
      case 2:
        return (
          <Card 
            title={
              <div className="flex items-center gap-3 py-1">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#023047] to-[#219ebc] flex items-center justify-center text-white font-bold text-sm shadow-sm">
                  3
                </div>
                <div>
                  <div className="text-base font-bold text-slate-800">Konfirmasi &amp; Lanjut ke Form Ujian</div>
                  <div className="text-xs text-slate-500 font-normal">Periksa kembali ringkasan konfigurasi sebelum memulai evaluasi</div>
                </div>
              </div>
            }
            style={{ minHeight: 400, borderRadius: '16px', border: '1px solid #e2e8f0' }}
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
                        <div className={styles.santriConfirmBox}>
                          <UserOutlined className={styles.santriConfirmIcon} />
                          <br />
                          <Text strong className={styles.santriConfirmName}>{santri.nama}</Text>
                          <br />
                          <Tag color="blue" className={styles.santriConfirmTag}>{santri.kelas}</Tag>
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
    <div className={styles.container}>
      <Steps
        current={currentStep}
        size="small"
        items={steps}
        style={{ marginBottom: 24 }}
      />

      <div className={styles.marginT16}>
        {renderStepContent()}

        <Divider />

        <FormUjianWizardActions
          currentStep={currentStep}
          stepsLength={steps.length}
          onCancel={onCancel}
          handlePrev={handlePrev}
          handleNext={handleNext}
          handleComplete={handleComplete}
        />
      </div>
    </div>
  )
}
