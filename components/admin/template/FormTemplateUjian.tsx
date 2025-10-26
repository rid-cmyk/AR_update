'use client'

import { useState, useEffect } from 'react'
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  Select, 
  InputNumber, 
  Space, 
  Table, 
  message, 
  Typography,
  Divider,
  Tag,
  Row,
  Col
} from 'antd'
import { 
  SaveOutlined, 
  BookOutlined, 
  PlusOutlined, 
  DeleteOutlined,
  SettingOutlined
} from '@ant-design/icons'

const { Title, Text } = Typography
const { TextArea } = Input
interface TahunAkademik {
  id: string
  nama: string
  tahunMulai: number
  tahunSelesai: number
  semester: string
  isActive: boolean
}

interface JenisUjian {
  id: string
  nama: string
  kode: string
  deskripsi: string
  komponenPenilaian: KomponenPenilaian[]
}

interface KomponenPenilaian {
  id?: string
  nama: string
  bobot: number
  deskripsi: string
  urutan: number
}

interface TemplateUjianData {
  nama: string
  jenisUjianId: string
  tahunAkademikId: string
  deskripsi: string
  komponenPenilaian: KomponenPenilaian[]
}

interface FormTemplateUjianProps {
  onSuccess?: () => void
}

export function FormTemplateUjian({ onSuccess }: FormTemplateUjianProps) {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [tahunAkademikList, setTahunAkademikList] = useState<TahunAkademik[]>([])
  const [jenisUjianList, setJenisUjianList] = useState<JenisUjian[]>([])
  const [komponenPenilaian, setKomponenPenilaian] = useState<KomponenPenilaian[]>([])
  const [selectedJenisUjian, setSelectedJenisUjian] = useState<JenisUjian | null>(null)

  useEffect(() => {
    fetchTahunAkademik()
    fetchJenisUjian()
  }, [])

  const fetchTahunAkademik = async () => {
    try {
      const response = await fetch('/api/admin/tahun-akademik')
      if (response.ok) {
        const data = await response.json()
        setTahunAkademikList(data)
      }
    } catch (error) {
      console.error('Error fetching tahun akademik:', error)
    }
  }

  const fetchJenisUjian = async () => {
    try {
      const response = await fetch('/api/admin/jenis-ujian')
      if (response.ok) {
        const data = await response.json()
        setJenisUjianList(data)
      }
    } catch (error) {
      console.error('Error fetching jenis ujian:', error)
    }
  }

  // Handle perubahan jenis ujian
  const handleJenisUjianChange = (jenisUjianId: string) => {
    const jenisUjian = jenisUjianList.find(j => j.id === jenisUjianId)
    if (jenisUjian) {
      setSelectedJenisUjian(jenisUjian)
      // Load komponen penilaian dari jenis ujian yang dipilih
      setKomponenPenilaian(jenisUjian.komponenPenilaian.map(k => ({
        ...k,
        id: undefined // Reset ID untuk template baru
      })))
    }
  }

  // Update bobot komponen penilaian
  const updateKomponenBobot = (index: number, bobot: number) => {
    const updated = [...komponenPenilaian]
    updated[index] = { ...updated[index], bobot }
    setKomponenPenilaian(updated)
  }

  // Validasi total bobot
  const getTotalBobot = () => {
    return komponenPenilaian.reduce((total, k) => total + (k.bobot || 0), 0)
  }

  // Submit form
  const handleSubmit = async (values: any) => {
    const totalBobot = getTotalBobot()
    if (totalBobot !== 100) {
      message.error('Total bobot komponen penilaian harus 100%')
      return
    }

    if (komponenPenilaian.length === 0) {
      message.error('Pilih jenis ujian terlebih dahulu')
      return
    }

    setLoading(true)
    try {
      const payload = {
        ...values,
        komponenPenilaian
      }

      const response = await fetch('/api/admin/template-ujian', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        message.success('Template ujian berhasil disimpan!')
        form.resetFields()
        setKomponenPenilaian([])
        setSelectedJenisUjian(null)
        onSuccess?.()
      } else {
        const error = await response.json()
        message.error(error.message || 'Gagal menyimpan template ujian')
      }
    } catch (error) {
      message.error('Terjadi kesalahan saat menyimpan')
    } finally {
      setLoading(false)
    }
  }

  // Columns untuk tabel komponen penilaian
  const komponenColumns = [
    {
      title: 'No',
      key: 'urutan',
      width: 60,
      render: (_, __, index: number) => index + 1
    },
    {
      title: 'Nama Komponen',
      dataIndex: 'nama',
      key: 'nama',
      render: (text: string) => <Text strong>{text}</Text>
    },
    {
      title: 'Bobot Asli (%)',
      dataIndex: 'bobot',
      key: 'bobotAsli',
      width: 120,
      render: (bobot: number) => (
        <Tag color="blue">{bobot}%</Tag>
      )
    },
    {
      title: 'Bobot Template (%)',
      key: 'bobotTemplate',
      width: 150,
      render: (_, __, index: number) => (
        <InputNumber
          value={komponenPenilaian[index]?.bobot}
          onChange={(value) => updateKomponenBobot(index, value || 0)}
          min={0}
          max={100}
          size="small"
          style={{ width: '100%' }}
          formatter={value => `${value}%`}
          parser={value => value!.replace('%', '')}
        />
      )
    },
    {
      title: 'Deskripsi',
      dataIndex: 'deskripsi',
      key: 'deskripsi',
      ellipsis: true
    }
  ]

  return (
    <Card 
      title={
        <Space>
          <BookOutlined />
          <span>Buat Template Ujian</span>
        </Space>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Form.Item
              name="nama"
              label="Nama Template"
              rules={[{ required: true, message: 'Nama template wajib diisi' }]}
            >
              <Input placeholder="Contoh: Template Ujian Tasmi' Semester 1" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="jenisUjianId"
              label="Jenis Ujian"
              rules={[{ required: true, message: 'Jenis ujian wajib dipilih' }]}
            >
              <Select
                placeholder="Pilih Jenis Ujian"
                onChange={handleJenisUjianChange}
                showSearch
                optionFilterProp="children"
              >
                {jenisUjianList.map((jenis) => (
                  <Select.Option key={jenis.id} value={jenis.id}>
                    {jenis.nama}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="tahunAkademikId"
          label="Tahun Akademik"
          rules={[{ required: true, message: 'Tahun akademik wajib dipilih' }]}
        >
          <Select
            placeholder="Pilih Tahun Akademik"
            showSearch
            optionFilterProp="children"
          >
            {tahunAkademikList.map((tahun) => (
              <Select.Option key={tahun.id} value={tahun.id}>
                {tahun.nama} - {tahun.semester}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="deskripsi"
          label="Deskripsi Template"
        >
          <TextArea 
            rows={3} 
            placeholder="Deskripsi singkat tentang template ujian ini..."
          />
        </Form.Item>

        {selectedJenisUjian && (
          <>
            <Divider orientation="left">
              <Space>
                <SettingOutlined />
                <span>Komponen Penilaian - {selectedJenisUjian.nama}</span>
                <Tag color={getTotalBobot() === 100 ? 'green' : 'red'}>
                  Total: {getTotalBobot()}%
                </Tag>
              </Space>
            </Divider>

            <div style={{ marginBottom: 16 }}>
              <Text type="secondary">
                Atur bobot penilaian untuk setiap komponen. Total bobot harus 100%.
              </Text>
            </div>

            <Table
              dataSource={komponenPenilaian}
              columns={komponenColumns}
              pagination={false}
              size="small"
              style={{ marginBottom: 24 }}
            />
          </>
        )}

        <Form.Item>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading}
            icon={<SaveOutlined />}
            size="large"
            disabled={getTotalBobot() !== 100 || komponenPenilaian.length === 0}
            block
          >
            Simpan Template Ujian
          </Button>
        </Form.Item>
      </Form>
    </Card>
  )
}