'use client'

import { useState, useEffect } from 'react'
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  Select, 
  DatePicker, 
  Space, 
  Table, 
  message, 
  Typography,
  Row,
  Col,
  Tag,
  Popconfirm
} from 'antd'
import { 
  SaveOutlined, 
  CalendarOutlined, 
  PlusOutlined, 
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'

const { Title, Text } = Typography
interface TahunAkademik {
  id: string
  tahunMulai: number
  tahunSelesai: number
  semester: string
  namaLengkap: string
  tanggalMulai: string
  tanggalSelesai: string
  isActive: boolean
}

interface FormTemplateTahunAkademikProps {
  onSuccess?: () => void
}

export function FormTemplateTahunAkademik({ onSuccess }: FormTemplateTahunAkademikProps) {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [tahunAkademikList, setTahunAkademikList] = useState<TahunAkademik[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    fetchTahunAkademik()
  }, [])

  const fetchTahunAkademik = async () => {
    try {
      const response = await fetch('/api/admin/tahun-akademik', {
        credentials: 'include' // Include cookies for authentication
      })
      if (response.ok) {
        const data = await response.json()
        setTahunAkademikList(data)
      }
    } catch (error) {
      console.error('Error fetching tahun akademik:', error)
    }
  }

  const handleSubmit = async (values: any) => {
    setLoading(true)
    try {
      const url = editingId ? `/api/admin/tahun-akademik/${editingId}` : '/api/admin/tahun-akademik'
      const method = editingId ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify({
          ...values,
          tanggalMulai: values.tanggalMulai.toISOString(),
          tanggalSelesai: values.tanggalSelesai.toISOString()
        })
      })

      if (response.ok) {
        message.success(`Tahun akademik berhasil ${editingId ? 'diupdate' : 'ditambahkan'}!`)
        form.resetFields()
        setEditingId(null)
        fetchTahunAkademik()
        onSuccess?.()
      } else {
        const error = await response.json()
        message.error(error.error || 'Gagal menyimpan tahun akademik')
      }
    } catch (error) {
      message.error('Terjadi kesalahan saat menyimpan')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (tahunAkademik: TahunAkademik) => {
    setEditingId(tahunAkademik.id)
    form.setFieldsValue({
      tahunMulai: tahunAkademik.tahunMulai,
      tahunSelesai: tahunAkademik.tahunSelesai,
      semester: tahunAkademik.semester,
      tanggalMulai: dayjs(tahunAkademik.tanggalMulai),
      tanggalSelesai: dayjs(tahunAkademik.tanggalSelesai)
    })
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/tahun-akademik/${id}`, {
        method: 'DELETE',
        credentials: 'include' // Include cookies for authentication
      })

      if (response.ok) {
        message.success('Tahun akademik berhasil dihapus!')
        fetchTahunAkademik()
        onSuccess?.()
      } else {
        const error = await response.json()
        message.error(error.error || 'Gagal menghapus tahun akademik')
      }
    } catch (error) {
      message.error('Terjadi kesalahan saat menghapus')
    }
  }

  // Columns untuk tabel tahun akademik
  const columns = [
    {
      title: 'Tahun Akademik',
      dataIndex: 'namaLengkap',
      key: 'namaLengkap',
      render: (text: string, record: TahunAkademik) => (
        <Space direction="vertical" size="small">
          <Text strong>{text}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {dayjs(record.tanggalMulai).format('DD MMM YYYY')} - {dayjs(record.tanggalSelesai).format('DD MMM YYYY')}
          </Text>
        </Space>
      )
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'default'}>
          {isActive ? 'Aktif' : 'Tidak Aktif'}
        </Tag>
      )
    },
    {
      title: 'Aksi',
      key: 'action',
      render: (_, record: TahunAkademik) => (
        <Space>
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)}
            size="small"
          />
          <Popconfirm
            title="Hapus tahun akademik?"
            description="Apakah Anda yakin ingin menghapus tahun akademik ini?"
            onConfirm={() => handleDelete(record.id)}
            okText="Ya"
            cancelText="Tidak"
          >
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />}
              size="small"
            />
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <div>
      {/* Form Tahun Akademik */}
      <Card 
        title={
          <Space>
            <CalendarOutlined />
            <span>{editingId ? 'Edit Tahun Akademik' : 'Tambah Tahun Akademik'}</span>
          </Space>
        }
        style={{ marginBottom: 24 }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Form.Item
                name="tahunMulai"
                label="Tahun Mulai"
                rules={[{ required: true, message: 'Tahun mulai wajib diisi' }]}
              >
                <Input 
                  type="number" 
                  min={2020} 
                  max={2050}
                  placeholder="2024"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="tahunSelesai"
                label="Tahun Selesai"
                rules={[{ required: true, message: 'Tahun selesai wajib diisi' }]}
              >
                <Input 
                  type="number" 
                  min={2020} 
                  max={2050}
                  placeholder="2025"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="semester"
                label="Semester"
                rules={[{ required: true, message: 'Semester wajib dipilih' }]}
              >
                <Select placeholder="Pilih Semester">
                  <Select.Option value="S1">Semester 1</Select.Option>
                  <Select.Option value="S2">Semester 2</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Form.Item
                name="tanggalMulai"
                label="Tanggal Mulai"
                rules={[{ required: true, message: 'Tanggal mulai wajib diisi' }]}
              >
                <DatePicker 
                  style={{ width: '100%' }}
                  format="DD/MM/YYYY"
                  placeholder="Pilih tanggal mulai"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="tanggalSelesai"
                label="Tanggal Selesai"
                rules={[{ required: true, message: 'Tanggal selesai wajib diisi' }]}
              >
                <DatePicker 
                  style={{ width: '100%' }}
                  format="DD/MM/YYYY"
                  placeholder="Pilih tanggal selesai"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                icon={<SaveOutlined />}
              >
                {editingId ? 'Update' : 'Simpan'}
              </Button>
              {editingId && (
                <Button 
                  onClick={() => {
                    setEditingId(null)
                    form.resetFields()
                  }}
                >
                  Batal
                </Button>
              )}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      {/* Daftar Tahun Akademik */}
      <Card 
        title={
          <Space>
            <CalendarOutlined />
            <span>Daftar Tahun Akademik</span>
          </Space>
        }
      >
        <Table
          dataSource={tahunAkademikList}
          columns={columns}
          rowKey="id"
          size="small"
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  )
}