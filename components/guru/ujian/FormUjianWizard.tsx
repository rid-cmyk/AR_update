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
      const response = await fetch('/api/admin/jenis-ujian')
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
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#046c4e] to-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                  1
                </div>
                <div>
                  <div className="text-base font-bold text-slate-800">Pilih Santri untuk Ujian</div>
                  <div className="text-xs text-slate-500 font-normal">Tentukan santri dari halaqah Anda yang akan diuji dan dinilai</div>
                </div>
              </div>
            }
            style={{ minHeight: 400, borderRadius: '16px', border: '1px solid #e2e8f0' }}
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
                loading={loading}
              >
                {santriList.map(santri => (
                  <Select.Option key={santri.id} value={santri.id}>
                    <Space>
                      <UserOutlined />
                      <span>{santri.nama}</span>
                      <Tag color="blue">{santri.kelas}</Tag>
                    </Space>
                  </Select.Option>
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
              <div className="flex items-center gap-3 py-1">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#046c4e] to-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                  2
                </div>
                <div>
                  <div className="text-base font-bold text-slate-800">Pilih Jenis Ujian &amp; Rentang Juz</div>
                  <div className="text-xs text-slate-500 font-normal">Tentukan skema penilaian dan bab hafalan yang akan diujikan</div>
                </div>
              </div>
            }
            style={{ minHeight: 400, borderRadius: '16px', border: '1px solid #e2e8f0' }}
            styles={{ body: { padding: '24px' } }}
          >
            <Row gutter={[28, 28]}>
              {/* Left Column - Minimalist Input Form (13/24) */}
              <Col xs={24} lg={13}>
                {/* 1. Pilih Jenis Ujian */}
                <div style={{ 
                  background: '#ffffff',
                  padding: '20px',
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                  marginBottom: '20px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                }}>
                  <Form.Item
                    label={
                      <Text strong style={{ fontSize: 15, color: '#1e293b' }}>
                        🎯 1. Jenis Ujian &amp; Skema Evaluasi
                      </Text>
                    }
                    required
                    style={{ marginBottom: 0 }}
                  >
                    <Select
                      placeholder="Pilih jenis ujian"
                      value={selectedJenisUjian?.id}
                      optionLabelProp="label"
                      styles={{ popup: { root: { minWidth: 440, padding: '8px 10px', borderRadius: '14px' } } }}
                      listHeight={380}
                      onChange={(value) => {
                        const jenisUjian = jenisUjianList.find(j => j.id === value)
                        setSelectedJenisUjian(jenisUjian || null)
                        setJuzRange({ dari: 1, sampai: 1 })
                      }}
                      size="large"
                      style={{ width: '100%' }}
                    >
                      {jenisUjianList.map(jenis => (
                        <Select.Option 
                          key={jenis.id} 
                          value={jenis.id}
                          label={`${jenis.nama} - ${jenis.tipeUjian === 'per-juz' ? 'Mode Per Juz' : 'Mode Per Halaman'}`}
                        >
                          <div style={{ 
                            padding: '10px 12px', 
                            whiteSpace: 'normal',
                            lineHeight: 1.5,
                            borderBottom: '1px solid #f1f5f9'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6, flexWrap: 'wrap', gap: 8 }}>
                              <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>
                                {jenis.nama}
                              </div>
                              <span style={{ 
                                fontSize: 11, 
                                fontWeight: 700, 
                                padding: '2px 8px', 
                                borderRadius: '6px',
                                background: jenis.tipeUjian === 'per-juz' ? '#eff6ff' : '#f0fdf4',
                                color: jenis.tipeUjian === 'per-juz' ? '#1d4ed8' : '#15803d',
                                border: `1px solid ${jenis.tipeUjian === 'per-juz' ? '#bfdbfe' : '#bbf7d0'}`,
                                flexShrink: 0
                              }}>
                                {jenis.tipeUjian === 'per-juz' ? '📚 Mode Per Juz' : '📄 Mode Per Halaman'}
                              </span>
                            </div>
                            <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.45, wordBreak: 'break-word' }}>
                              {jenis.deskripsi}
                            </div>
                          </div>
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </div>

                {selectedJenisUjian && (
                  <>
                    {/* 2. Rentang Juz - Clean Minimalist Card */}
                    <div style={{ 
                      background: '#ffffff',
                      padding: '20px',
                      borderRadius: '16px',
                      border: '1px solid #e2e8f0',
                      marginBottom: '20px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                    }}>
                      <div style={{ marginBottom: 16 }}>
                        <Text strong style={{ fontSize: 15, color: '#1e293b', display: 'block' }}>
                          📚 2. Rentang Juz yang Diujikan
                        </Text>
                        <Text style={{ fontSize: 12, color: '#64748b' }}>
                          Tentukan batas awal dan akhir juz hafalan santri
                        </Text>
                      </div>

                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item label={<Text strong style={{ color: '#475569', fontSize: 13 }}>Dari Juz</Text>} style={{ marginBottom: 0 }}>
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
                          <Form.Item label={<Text strong style={{ color: '#475569', fontSize: 13 }}>Sampai Juz</Text>} style={{ marginBottom: 0 }}>
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

                      <div style={{ 
                        marginTop: 16, 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: 8, 
                        padding: '8px 14px', 
                        borderRadius: 10, 
                        background: '#f0fdf4', 
                        border: '1px solid #bbf7d0',
                        color: '#15803d',
                        fontSize: 12,
                        fontWeight: 600
                      }}>
                        <span>✨ Total Rentang: {Math.max(1, juzRange.sampai - juzRange.dari + 1)} Juz</span>
                        <span style={{ color: '#166534', fontWeight: 400 }}>
                          (Juz {juzRange.dari} {juzRange.sampai > juzRange.dari ? `- ${juzRange.sampai}` : ''})
                        </span>
                      </div>
                    </div>

                    {/* 3. Jumlah Pertanyaan Per Juz (Khusus MHQ) - Clean Minimalist Card */}
                    {(selectedJenisUjian.tipeUjian === 'per-juz' || selectedJenisUjian.nama?.toLowerCase().includes('mhq') || selectedJenisUjian.id === 'mhq') && (
                      <div style={{ 
                        background: '#ffffff',
                        padding: '20px',
                        borderRadius: '16px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                      }}>
                        <div style={{ marginBottom: 16 }}>
                          <Text strong style={{ fontSize: 15, color: '#1e293b', display: 'block' }}>
                            ❓ 3. Jumlah Pertanyaan Per Juz (MHQ)
                          </Text>
                          <Text style={{ fontSize: 12, color: '#64748b' }}>
                            Tentukan banyaknya pertanyaan yang diujikan di setiap juz
                          </Text>
                        </div>

                        <Form.Item style={{ marginBottom: 0 }}>
                          <InputNumber
                            min={1}
                            max={3}
                            value={jumlahPertanyaanPerJuz}
                            onChange={(value) => setJumlahPertanyaanPerJuz(Math.min(3, Math.max(1, value || 1)))}
                            style={{ width: '100%' }}
                            size="large"
                            prefix="❓"
                            addonAfter="pertanyaan / juz"
                          />
                        </Form.Item>

                        <div style={{ 
                          marginTop: 16, 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          gap: 8, 
                          padding: '8px 14px', 
                          borderRadius: 10, 
                          background: '#eff6ff', 
                          border: '1px solid #bfdbfe',
                          color: '#1d4ed8',
                          fontSize: 12,
                          fontWeight: 600
                        }}>
                          <span>📖 Total Pertanyaan: {Math.max(1, (juzRange.sampai - juzRange.dari + 1) * jumlahPertanyaanPerJuz)} soal</span>
                          <span style={{ color: '#3b82f6', fontWeight: 400 }}>
                            ({juzRange.sampai - juzRange.dari + 1} juz × {jumlahPertanyaanPerJuz} soal per juz)
                          </span>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </Col>

              {/* Right Column - Minimalist Unified Aspek & Bobot Penilaian Panel (11/24) */}
              <Col xs={24} lg={11}>
                {selectedJenisUjian ? (
                  <div style={{ 
                    background: '#ffffff',
                    padding: '24px',
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
                    height: '100%'
                  }}>
                    {/* Top Header Strip */}
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between', 
                      paddingBottom: 16, 
                      marginBottom: 16, 
                      borderBottom: '1px solid #f1f5f9' 
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ 
                          width: 36, 
                          height: 36, 
                          borderRadius: 10, 
                          background: '#f0fdf4', 
                          border: '1px solid #bbf7d0',
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          fontSize: 16
                        }}>
                          📋
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>
                            Aspek &amp; Bobot Penilaian
                          </div>
                          <div style={{ fontSize: 11, color: '#64748b' }}>
                            Skema evaluasi untuk jenis ujian ini
                          </div>
                        </div>
                      </div>

                      <span style={{ 
                        padding: '4px 10px', 
                        borderRadius: 20, 
                        fontSize: 11, 
                        fontWeight: 700,
                        background: '#f0fdf4',
                        color: '#15803d',
                        border: '1px solid #bbf7d0'
                      }}>
                        {selectedJenisUjian.tipeUjian === 'per-juz' ? '📚 Per Juz' : '📄 Per Halaman'}
                      </span>
                    </div>

                    {/* Selected Exam Title & Desc */}
                    <div style={{ marginBottom: 20 }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>
                        {selectedJenisUjian.nama}
                      </div>
                      <div style={{ fontSize: 13, color: '#64748b', lineHeight: '1.5' }}>
                        {selectedJenisUjian.deskripsi}
                      </div>
                    </div>

                    {/* Minimalist Komponen Penilaian Rows */}
                    <div style={{ marginBottom: 8 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: '#94a3b8', marginBottom: 10 }}>
                        Komponen Penilaian ({selectedJenisUjian.komponenPenilaian.length} Aspek)
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {selectedJenisUjian.komponenPenilaian.map((komponen, index) => (
                          <div 
                            key={index}
                            style={{ 
                              background: '#f8fafc',
                              border: '1px solid #e2e8f0',
                              borderRadius: 12,
                              padding: '12px 14px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              transition: 'all 0.2s'
                            }}
                          >
                            <div>
                              <div style={{ fontWeight: 600, fontSize: 14, color: '#1e293b', marginBottom: 2 }}>
                                {komponen.nama}
                              </div>
                              <div style={{ fontSize: 11, color: '#64748b' }}>
                                Nilai Maksimal: <strong>{komponen.nilaiMaksimal}</strong>
                              </div>
                            </div>

                            <div style={{ 
                              padding: '4px 10px',
                              borderRadius: 8,
                              background: '#046c4e',
                              color: '#ffffff',
                              fontSize: 12,
                              fontWeight: 700,
                              boxShadow: '0 1px 2px rgba(4, 108, 78, 0.2)'
                            }}>
                              Bobot: {komponen.bobot}%
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Info Note below aspect list */}
                    <div style={{ 
                      marginTop: 20,
                      padding: '12px 14px',
                      borderRadius: 12,
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 10
                    }}>
                      <span style={{ fontSize: 16 }}>💡</span>
                      <div style={{ fontSize: 12, color: '#475569', lineHeight: '1.5' }}>
                        {selectedJenisUjian.tipeUjian === 'per-juz' ? (
                          <span>Sistem akan otomatis menghitung nilai akhir santri berdasarkan bobot persentase dari setiap komponen penilaian di atas.</span>
                        ) : (
                          <span>Sistem akan membagi evaluasi per halaman untuk setiap juz yang dipilih dan menghitung rata-rata nilai akhir secara akurat.</span>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ 
                    background: '#f8fafc',
                    border: '1px dashed #cbd5e1',
                    borderRadius: '16px',
                    padding: '40px 24px',
                    textAlign: 'center',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <div style={{ fontSize: 32, marginBottom: 12 }}>📋</div>
                    <div style={{ fontWeight: 600, fontSize: 15, color: '#475569', marginBottom: 4 }}>
                      Belum Ada Jenis Ujian Dipilih
                    </div>
                    <div style={{ fontSize: 12, color: '#94a3b8', maxWidth: 260 }}>
                      Silakan pilih jenis ujian di samping untuk melihat skema evaluasi dan aspek penilaiannya.
                    </div>
                  </div>
                )}
              </Col>
            </Row>
          </Card>
        )

      case 2:
        return (
          <Card 
            title={
              <div className="flex items-center gap-3 py-1">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#046c4e] to-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
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

      <div style={{ marginTop: 16 }}>
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
      </div>
    </div>
  )
}