'use client'

import { useState, useEffect } from 'react'
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  Select, 
  Space, 
  Table, 
  message, 
  Typography,
  Divider,
  Tag,
  Popconfirm,
  Row,
  Col,
  InputNumber,
  Alert
} from 'antd'
import { 
  PlusOutlined, 
  DeleteOutlined, 
  EditOutlined, 
  SaveOutlined,
  FileTextOutlined,
  PercentageOutlined,
  BookOutlined
} from '@ant-design/icons'

const { Title, Text } = Typography
const { TextArea } = Input
const { Option } = Select

interface KomponenPenilaian {
  id?: string
  nama: string
  bobot: number
  deskripsi: string
}

interface JenisUjian {
  id: string
  nama: string
  kode: string
  deskripsi: string
  komponenPenilaian: KomponenPenilaian[]
}

interface TahunAkademik {
  id: number
  tahunAkademik: string
  semester: string
  isActive: boolean
}

interface TemplateUjian {
  id?: string
  namaTemplate: string
  jenisUjianId: string
  tahunAkademikId: number
  deskripsi: string
  komponenPenilaian: KomponenPenilaian[]
}

interface FormTemplateUjianProps {
  onSuccess?: () => void
}

export function FormTemplateUjian({ onSuccess }: FormTemplateUjianProps) {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [jenisUjianList, setJenisUjianList] = useState<JenisUjian[]>([])
  const [tahunAkademikList, setTahunAkademikList] = useState<TahunAkademik[]>([])
  const [templateUjianList, setTemplateUjianList] = useState<TemplateUjian[]>([])
  const [komponenPenilaian, setKomponenPenilaian] = useState<KomponenPenilaian[]>([])
  const [selectedJenisUjian, setSelectedJenisUjian] = useState<string>('')
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    fetchJenisUjian()
    fetchTahunAkademik()
    fetchTemplateUjian()
  }, [])

  const fetchJenisUjian = async () => {
    try {
      const response = await fetch('/api/admin/jenis-ujian')
      if (response.ok) {
        const result = await response.json()
        const data = result.success ? result.data : result
        setJenisUjianList(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error('Error fetching jenis ujian:', error)
      setJenisUjianList([])
    }
  }

  const fetchTahunAkademik = async () => {
    try {
      const response = await fetch('/api/admin/tahun-akademik')
      if (response.ok) {
        const result = await response.json()
        const data = result.success ? result.data : result
        setTahunAkademikList(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error('Error fetching tahun akademik:', error)
      setTahunAkademikList([])
    }
  }

  const fetchTemplateUjian = async () => {
    try {
      const response = await fetch('/api/admin/template-ujian')
      if (response.ok) {
        const result = await response.json()
        const data = result.success ? result.data : result
        setTemplateUjianList(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error('Error fetching template ujian:', error)
      setTemplateUjianList([])
    }
  }

  const handleJenisUjianChange = (jenisUjianId: string) => {
    setSelectedJenisUjian(jenisUjianId)
    const jenisUjian = jenisUjianList.find(j => j.id === jenisUjianId)
    if (jenisUjian && jenisUjian.komponenPenilaian) {
      // Set komponen penilaian dari jenis ujian yang dipilih
      const komponenFromJenis = jenisUjian.komponenPenilaian.map(k => ({
        id: Date.now().toString() + Math.random(),
        nama: k.nama,
        bobot: k.bobot,
        deskripsi: k.deskripsi
      }))
      setKomponenPenilaian(komponenFromJenis)
    } else {
      setKomponenPenilaian([])
    }
  }

  // Update komponen penilaian
  const updateKomponenPenilaian = (id: string, field: keyof KomponenPenilaian, value: any) => {
    setKomponenPenilaian(komponenPenilaian.map(komponen => 
      komponen.id === id ? { ...komponen, [field]: value } : komponen
    ))
  }

  // Validasi total bobot
  const getTotalBobot = () => {
    return komponenPenilaian.reduce((total, komponen) => total + (komponen.bobot || 0), 0)
  }

  const handleSubmit = async (values: any) => {
    // Validasi total bobot harus 100%
    const totalBobot = getTotalBobot()
    if (totalBobot !== 100) {
      message.error(`Total bobot harus 100%. Saat ini: ${totalBobot}%`)
      return
    }

    if (komponenPenilaian.length === 0) {
      message.error('Minimal harus ada 1 komponen penilaian')
      return
    }

    setLoading(true)
    try {
      const url = editingId ? `/api/admin/template-ujian/${editingId}` : '/api/admin/template-ujian'
      const method = editingId ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nama: values.namaTemplate,
          jenisUjianId: values.jenisUjianId,
          tahunAkademikId: values.tahunAkademikId,
          deskripsi: values.deskripsi,
          komponenPenilaian: komponenPenilaian.map(komponen => ({
            nama: komponen.nama,
            bobot: komponen.bobot,
            deskripsi: komponen.deskripsi
          }))
        })
      })

      const result = await response.json()

      if (response.ok) {
        message.success(editingId ? 'Template ujian berhasil diupdate!' : 'Template ujian berhasil dibuat!')
        form.resetFields()
        setKomponenPenilaian([])
        setSelectedJenisUjian('')
        setEditingId(null)
        fetchTemplateUjian()
        onSuccess?.()
      } else {
        message.error(result.message || result.error || 'Gagal menyimpan template ujian')
      }
    } catch (error) {
      console.error('Error saving template ujian:', error)
      message.error('Terjadi kesalahan saat menyimpan')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (template: TemplateUjian) => {
    setEditingId(template.id || null)
    form.setFieldsValue({
      namaTemplate: template.namaTemplate,
      jenisUjianId: template.jenisUjianId,
      tahunAkademikId: template.tahunAkademikId,
      deskripsi: template.deskripsi
    })
    setSelectedJenisUjian(template.jenisUjianId)
    setKomponenPenilaian(template.komponenPenilaian || [])
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/template-ujian/${id}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (response.ok) {
        message.success('Template ujian berhasil dihapus!')
        fetchTemplateUjian()
        onSuccess?.()
      } else {
        message.error(result.message || result.error || 'Gagal menghapus template ujian')
      }
    } catch (error) {
      console.error('Error deleting template ujian:', error)
      message.error('Terjadi kesalahan saat menghapus')
    }
  }

  const resetForm = () => {
    form.resetFields()
    setKomponenPenilaian([])
    setSelectedJenisUjian('')
    setEditingId(null)
  }

  const columns = [
    {
      title: 'Nama Template',
      dataIndex: 'namaTemplate',
      key: 'namaTemplate',
      render: (text: string) => <Text strong>{text}</Text>
    },
    {
      title: 'Jenis Ujian',
      dataIndex: 'jenisUjianId',
      key: 'jenisUjianId',
      render: (jenisUjianId: string) => {
        const jenisUjian = jenisUjianList.find(j => j.id === jenisUjianId)
        return <Tag color="blue">{jenisUjian?.nama || jenisUjianId}</Tag>
      }
    },
    {
      title: 'Tahun Akademik',
      dataIndex: 'tahunAkademikId',
      key: 'tahunAkademikId',
      render: (tahunAkademikId: number) => {
        const tahunAkademik = tahunAkademikList.find(t => t.id === tahunAkademikId)
        return <Tag color="green">{tahunAkademik?.tahunAkademik || tahunAkademikId}</Tag>
      }
    },
    {
      title: 'Komponen Penilaian',
      dataIndex: 'komponenPenilaian',
      key: 'komponenPenilaian',
      render: (komponenList: KomponenPenilaian[]) => (
        <Space wrap>
          {komponenList?.map((komponen, index) => (
            <Tag key={index} color="purple">
              {komponen.nama} ({komponen.bobot}%)
            </Tag>
          ))}
        </Space>
      )
    },
    {
      title: 'Aksi',
      key: 'action',
      render: (record: TemplateUjian) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Yakin ingin menghapus template ujian ini?"
            onConfirm={() => handleDelete(record.id!)}
            okText="Ya"
            cancelText="Tidak"
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
            >
              Hapus
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <div className="space-y-6">
      {/* Form Input */}
      <Card 
        title={
          <Space>
            <FileTextOutlined />
            <span>{editingId ? 'Edit Template Ujian' : 'Tambah Template Ujian Baru'}</span>
          </Space>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="namaTemplate"
                label="Nama Template"
                rules={[{ required: true, message: 'Nama template wajib diisi' }]}
              >
                <Input 
                  placeholder="Contoh: Template MHQ Semester 1"
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="jenisUjianId"
                label="Jenis Ujian"
                rules={[{ required: true, message: 'Jenis ujian wajib dipilih' }]}
              >
                <Select 
                  placeholder="Pilih jenis ujian"
                  size="large"
                  onChange={handleJenisUjianChange}
                >
                  {jenisUjianList.map(jenis => (
                    <Option key={jenis.id} value={jenis.id}>
                      {jenis.nama} ({jenis.kode})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="tahunAkademikId"
                label="Tahun Akademik"
                rules={[{ required: true, message: 'Tahun akademik wajib dipilih' }]}
              >
                <Select 
                  placeholder="Pilih tahun akademik"
                  size="large"
                >
                  {tahunAkademikList.map(tahun => (
                    <Option key={tahun.id} value={tahun.id}>
                      {tahun.tahunAkademik} - {tahun.semester}
                      {tahun.isActive && <Tag color="green" style={{ marginLeft: 8 }}>Aktif</Tag>}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="deskripsi"
                label="Deskripsi"
              >
                <TextArea 
                  rows={3} 
                  placeholder="Deskripsi template ujian..."
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>

          {selectedJenisUjian && (
            <>
              <Divider orientation="left">
                <Space>
                  <PercentageOutlined />
                  <span>Komponen Penilaian</span>
                  <Tag color={getTotalBobot() === 100 ? 'green' : 'red'}>
                    Total: {getTotalBobot()}%
                  </Tag>
                </Space>
              </Divider>

              {komponenPenilaian.length > 0 ? (
                <div className="space-y-4 mb-6">
                  {komponenPenilaian.map((komponen) => (
                    <Card key={komponen.id} size="small" className="border-l-4 border-l-purple-500">
                      <Row gutter={16} align="middle">
                        <Col xs={24} sm={8}>
                          <Input
                            placeholder="Nama komponen"
                            value={komponen.nama}
                            onChange={(e) => updateKomponenPenilaian(komponen.id!, 'nama', e.target.value)}
                          />
                        </Col>
                        <Col xs={24} sm={4}>
                          <InputNumber
                            placeholder="Bobot %"
                            value={komponen.bobot}
                            onChange={(value) => updateKomponenPenilaian(komponen.id!, 'bobot', value || 0)}
                            min={0}
                            max={100}
                            style={{ width: '100%' }}
                            addonAfter="%"
                          />
                        </Col>
                        <Col xs={24} sm={12}>
                          <Input
                            placeholder="Deskripsi komponen"
                            value={komponen.deskripsi}
                            onChange={(e) => updateKomponenPenilaian(komponen.id!, 'deskripsi', e.target.value)}
                          />
                        </Col>
                      </Row>
                    </Card>
                  ))}
                </div>
              ) : (
                <Alert
                  message="Pilih jenis ujian terlebih dahulu"
                  description="Komponen penilaian akan muncul otomatis setelah Anda memilih jenis ujian"
                  type="info"
                  showIcon
                  style={{ marginBottom: 16 }}
                />
              )}
            </>
          )}

          <div className="flex justify-end space-x-2">
            <Button onClick={resetForm}>
              Reset
            </Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              icon={<SaveOutlined />}
              disabled={!selectedJenisUjian || getTotalBobot() !== 100 || komponenPenilaian.length === 0}
              size="large"
            >
              {editingId ? 'Update Template' : 'Simpan Template'}
            </Button>
          </div>
        </Form>
      </Card>

      {/* Daftar Template Ujian */}
      <Card 
        title={
          <Space>
            <BookOutlined />
            <span>Daftar Template Ujian</span>
          </Space>
        }
      >
        <Table
          dataSource={templateUjianList}
          columns={columns}
          rowKey="id"
          size="small"
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  )
}