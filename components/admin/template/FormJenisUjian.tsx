'use client'

import { useState, useEffect } from 'react'
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  InputNumber, 
  Space, 
  Table, 
  message, 
  Typography,
  Divider,
  Tag,
  Popconfirm,
  Row,
  Col,
  Select,
  Alert
} from 'antd'
import { 
  PlusOutlined, 
  DeleteOutlined, 
  EditOutlined, 
  SaveOutlined,
  BookOutlined,
  PercentageOutlined
} from '@ant-design/icons'

const { Title, Text } = Typography
const { TextArea } = Input

interface AspekPenilaian {
  id?: string
  namaAspek: string
  bobotPersen: number
  deskripsi: string
}

interface JenisUjian {
  id?: string
  namaJenis: string
  deskripsi: string
  tipeUjian: 'per-halaman' | 'per-juz'
  aspekPenilaian: AspekPenilaian[]
}

interface FormJenisUjianProps {
  onSuccess?: () => void
}

export function FormJenisUjian({ onSuccess }: FormJenisUjianProps) {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [jenisUjianList, setJenisUjianList] = useState<JenisUjian[]>([])
  const [aspekPenilaian, setAspekPenilaian] = useState<AspekPenilaian[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [tipeUjian, setTipeUjian] = useState<'per-halaman' | 'per-juz'>('per-halaman')

  useEffect(() => {
    fetchJenisUjian()
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

  // Tambah aspek penilaian baru
  const addAspekPenilaian = () => {
    const newAspek: AspekPenilaian = {
      id: Date.now().toString(),
      namaAspek: '',
      bobotPersen: 0,
      deskripsi: ''
    }
    setAspekPenilaian([...aspekPenilaian, newAspek])
  }

  // Hapus aspek penilaian
  const removeAspekPenilaian = (id: string) => {
    setAspekPenilaian(aspekPenilaian.filter(aspek => aspek.id !== id))
  }

  // Update aspek penilaian
  const updateAspekPenilaian = (id: string, field: keyof AspekPenilaian, value: any) => {
    setAspekPenilaian(aspekPenilaian.map(aspek => 
      aspek.id === id ? { ...aspek, [field]: value } : aspek
    ))
  }

  // Validasi total bobot
  const getTotalBobot = () => {
    return aspekPenilaian.reduce((total, aspek) => total + (aspek.bobotPersen || 0), 0)
  }

  const handleSubmit = async (values: any) => {
    // Validasi berbeda berdasarkan tipe ujian
    if (tipeUjian === 'per-juz') {
      // Untuk per-juz, validasi komponen penilaian
      const totalBobot = getTotalBobot()
      if (totalBobot !== 100) {
        message.error(`Total bobot harus 100%. Saat ini: ${totalBobot}%`)
        return
      }

      if (aspekPenilaian.length === 0) {
        message.error('Minimal harus ada 1 komponen penilaian untuk ujian per-juz')
        return
      }
    }

    setLoading(true)
    try {
      const url = editingId ? `/api/admin/jenis-ujian/${editingId}` : '/api/admin/jenis-ujian'
      const method = editingId ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nama: values.namaJenis,
          deskripsi: values.deskripsi,
          tipeUjian: tipeUjian,
          komponenPenilaian: tipeUjian === 'per-juz' ? aspekPenilaian.map(aspek => ({
            nama: aspek.namaAspek,
            bobot: aspek.bobotPersen
          })) : []
        })
      })

      const result = await response.json()

      if (result.success) {
        message.success(editingId ? 'Jenis ujian berhasil diupdate!' : 'Jenis ujian berhasil dibuat!')
        form.resetFields()
        setAspekPenilaian([])
        setEditingId(null)
        fetchJenisUjian()
        onSuccess?.()
      } else {
        message.error(result.error || 'Gagal menyimpan jenis ujian')
      }
    } catch (error) {
      console.error('Error saving jenis ujian:', error)
      message.error('Terjadi kesalahan saat menyimpan')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (jenisUjian: any) => {
    setEditingId(jenisUjian.id || null)
    setTipeUjian(jenisUjian.tipeUjian || 'per-halaman')
    form.setFieldsValue({
      namaJenis: jenisUjian.nama,
      deskripsi: jenisUjian.deskripsi,
      tipeUjian: jenisUjian.tipeUjian || 'per-halaman'
    })
    // Convert komponenPenilaian to aspekPenilaian format
    const aspekList = jenisUjian.komponenPenilaian?.map((komponen: any, index: number) => ({
      id: (Date.now() + index).toString(),
      namaAspek: komponen.nama,
      bobotPersen: komponen.bobot,
      deskripsi: komponen.nama
    })) || []
    setAspekPenilaian(aspekList)
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/jenis-ujian/${id}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (result.success) {
        message.success('Jenis ujian berhasil dihapus!')
        fetchJenisUjian()
        onSuccess?.()
      } else {
        message.error(result.error || 'Gagal menghapus jenis ujian')
      }
    } catch (error) {
      console.error('Error deleting jenis ujian:', error)
      message.error('Terjadi kesalahan saat menghapus')
    }
  }

  const resetForm = () => {
    form.resetFields()
    setAspekPenilaian([])
    setEditingId(null)
    setTipeUjian('per-halaman')
  }

  const columns = [
    {
      title: 'Jenis Ujian',
      dataIndex: 'nama',
      key: 'nama',
      width: '30%',
      render: (text: string, record: any) => (
        <div>
          <Text strong style={{ fontSize: 14, color: '#1890ff' }}>{text}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.deskripsi}
          </Text>
          <br />
          <Tag color={record.tipeUjian === 'per-juz' ? 'blue' : 'green'} style={{ marginTop: 4, borderRadius: 8 }}>
            {record.tipeUjian === 'per-juz' ? '📚 Per Juz' : '📄 Per Halaman'}
          </Tag>
        </div>
      )
    },
    {
      title: 'Komponen Penilaian',
      dataIndex: 'komponenPenilaian',
      key: 'komponenPenilaian',
      width: '40%',
      render: (komponenList: any[], record: any) => (
        <div>
          {record.tipeUjian === 'per-halaman' ? (
            <Tag color="orange" style={{ borderRadius: 8 }}>
              📄 Penilaian Per Halaman (Otomatis)
            </Tag>
          ) : (
            <>
              <Space wrap size={[4, 8]}>
                {komponenList?.map((komponen, index) => (
                  <Tag 
                    key={index} 
                    color="processing"
                    style={{ 
                      borderRadius: 12,
                      padding: '2px 8px',
                      fontSize: 12,
                      fontWeight: 500
                    }}
                  >
                    {komponen.nama} ({komponen.bobot}%)
                  </Tag>
                ))}
              </Space>
              <div style={{ marginTop: 4 }}>
                <Text style={{ fontSize: 11, color: '#999' }}>
                  Total: {komponenList?.reduce((sum, k) => sum + k.bobot, 0)}% • {komponenList?.length || 0} komponen
                </Text>
              </div>
            </>
          )}
        </div>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: '10%',
      render: (status: string) => (
        <Tag color={status === 'aktif' ? 'success' : 'default'} style={{ borderRadius: 12 }}>
          {status === 'aktif' ? 'Aktif' : 'Nonaktif'}
        </Tag>
      )
    },
    {
      title: 'Aksi',
      key: 'action',
      width: '15%',
      render: (record: any) => (
        <Space size="small">
          <Button
            type="primary"
            ghost
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            style={{ borderRadius: 6 }}
          >
            Edit
          </Button>
          <Popconfirm
            title="Hapus jenis ujian ini?"
            description="Data yang sudah dihapus tidak dapat dikembalikan."
            onConfirm={() => handleDelete(record.id!)}
            okText="Ya, Hapus"
            cancelText="Batal"
            okButtonProps={{ danger: true }}
          >
            <Button
              danger
              size="small"
              icon={<DeleteOutlined />}
              style={{ borderRadius: 6 }}
            >
              Hapus
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <div style={{ padding: '0 8px' }}>
      {/* Form Input */}
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
            <span style={{ fontSize: 16, fontWeight: 600 }}>
              {editingId ? 'Edit Jenis Ujian' : 'Tambah Jenis Ujian Baru'}
            </span>
          </Space>
        }
        style={{ 
          marginBottom: 24,
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
        }}
        bodyStyle={{ padding: '24px' }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={[24, 16]}>
            <Col xs={24} lg={12}>
              <Form.Item
                name="namaJenis"
                label={<Text strong style={{ fontSize: 14 }}>Nama Jenis Ujian</Text>}
                rules={[{ required: true, message: 'Nama jenis ujian wajib diisi' }]}
              >
                <Input 
                  placeholder="Contoh: Tasmi', MHQ, UAS, Kenaikan Juz"
                  size="large"
                  style={{ borderRadius: 8 }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} lg={12}>
              <Form.Item
                name="deskripsi"
                label={<Text strong style={{ fontSize: 14 }}>Deskripsi</Text>}
                rules={[{ required: true, message: 'Deskripsi wajib diisi' }]}
              >
                <TextArea 
                  rows={3} 
                  placeholder="Deskripsi singkat tentang jenis ujian ini..."
                  style={{ borderRadius: 8, resize: 'none' }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[24, 16]}>
            <Col xs={24}>
              <Form.Item
                name="tipeUjian"
                label={<Text strong style={{ fontSize: 14 }}>Tipe Ujian</Text>}
                rules={[{ required: true, message: 'Tipe ujian wajib dipilih' }]}
              >
                <Select
                  size="large"
                  placeholder="Pilih tipe ujian"
                  value={tipeUjian}
                  onChange={(value) => {
                    setTipeUjian(value)
                    if (value === 'per-halaman') {
                      setAspekPenilaian([])
                    }
                  }}
                  style={{ borderRadius: 8 }}
                >
                  <Select.Option value="per-halaman">
                    <Space>
                      <span>📄</span>
                      <div>
                        <div style={{ fontWeight: 600 }}>Per Halaman</div>
                        <div style={{ fontSize: 12, color: '#666' }}>Penilaian berdasarkan halaman Al-Quran (1-604)</div>
                      </div>
                    </Space>
                  </Select.Option>
                  <Select.Option value="per-juz">
                    <Space>
                      <span>📚</span>
                      <div>
                        <div style={{ fontWeight: 600 }}>Per Juz</div>
                        <div style={{ fontSize: 12, color: '#666' }}>Penilaian berdasarkan juz dengan komponen penilaian</div>
                      </div>
                    </Space>
                  </Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {tipeUjian === 'per-halaman' && (
            <Alert
              message="Informasi Ujian Per Halaman"
              description="Untuk ujian per halaman, sistem akan otomatis menampilkan 20 input nilai per juz sesuai dengan rentang juz yang dipilih saat membuat ujian. Tidak perlu mengatur komponen penilaian."
              type="info"
              showIcon
              style={{ marginBottom: 24, borderRadius: 8 }}
            />
          )}

          {tipeUjian === 'per-juz' && (
            <>
              <Divider style={{ margin: '24px 0 16px 0' }}>
                <Space>
                  <PercentageOutlined style={{ color: '#1890ff' }} />
                  <Text strong style={{ color: '#1890ff' }}>Komponen Penilaian</Text>
                  <Tag 
                    color={getTotalBobot() === 100 ? 'success' : 'error'}
                    style={{ borderRadius: 12, fontWeight: 600 }}
                  >
                    Total: {getTotalBobot()}%
                  </Tag>
                </Space>
              </Divider>

          <div style={{ marginBottom: 16 }}>
            <Button 
              type="dashed" 
              icon={<PlusOutlined />}
              onClick={addAspekPenilaian}
              block
              size="large"
              style={{ 
                borderRadius: 8,
                height: 48,
                borderColor: '#16a34a',
                color: '#16a34a'
              }}
            >
              Tambah Komponen Penilaian
            </Button>
          </div>

          {aspekPenilaian.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                {aspekPenilaian.map((aspek, index) => (
                  <Card 
                    key={aspek.id} 
                    size="small" 
                    style={{ 
                      borderLeft: '4px solid #16a34a',
                      borderRadius: 8,
                      boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
                    }}
                    bodyStyle={{ padding: '16px' }}
                  >
                    <Row gutter={[16, 12]} align="middle">
                      <Col xs={24} sm={8}>
                        <div>
                          <Text style={{ fontSize: 12, color: '#666', marginBottom: 4, display: 'block' }}>
                            Nama Komponen
                          </Text>
                          <Input
                            placeholder="Contoh: Kelancaran, Tajwid"
                            value={aspek.namaAspek}
                            onChange={(e) => updateAspekPenilaian(aspek.id!, 'namaAspek', e.target.value)}
                            style={{ borderRadius: 6 }}
                          />
                        </div>
                      </Col>
                      <Col xs={24} sm={6}>
                        <div>
                          <Text style={{ fontSize: 12, color: '#666', marginBottom: 4, display: 'block' }}>
                            Bobot Penilaian
                          </Text>
                          <InputNumber
                            placeholder="0"
                            value={aspek.bobotPersen}
                            onChange={(value) => updateAspekPenilaian(aspek.id!, 'bobotPersen', value || 0)}
                            min={0}
                            max={100}
                            style={{ width: '100%', borderRadius: 6 }}
                            addonAfter="%"
                          />
                        </div>
                      </Col>
                      <Col xs={24} sm={8}>
                        <div>
                          <Text style={{ fontSize: 12, color: '#666', marginBottom: 4, display: 'block' }}>
                            Deskripsi (Opsional)
                          </Text>
                          <Input
                            placeholder="Deskripsi komponen"
                            value={aspek.deskripsi}
                            onChange={(e) => updateAspekPenilaian(aspek.id!, 'deskripsi', e.target.value)}
                            style={{ borderRadius: 6 }}
                          />
                        </div>
                      </Col>
                      <Col xs={24} sm={2}>
                        <div style={{ textAlign: 'center', paddingTop: 20 }}>
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => removeAspekPenilaian(aspek.id!)}
                            style={{ borderRadius: 6 }}
                            title="Hapus komponen"
                          />
                        </div>
                      </Col>
                    </Row>
                  </Card>
                ))}
              </Space>
            </div>
          )}
            </>
          )}

          <div style={{ textAlign: 'right', paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
            <Space size="middle">
              <Button 
                onClick={resetForm}
                size="large"
                style={{ borderRadius: 8, minWidth: 100 }}
              >
                Reset Form
              </Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                icon={<SaveOutlined />}
                disabled={tipeUjian === 'per-juz' ? (getTotalBobot() !== 100 || aspekPenilaian.length === 0) : false}
                size="large"
                style={{
                  background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                  border: 'none',
                  borderRadius: 8,
                  minWidth: 140,
                  boxShadow: '0 2px 8px rgba(22, 163, 74, 0.3)'
                }}
              >
                {editingId ? 'Update Jenis Ujian' : 'Simpan Jenis Ujian'}
              </Button>
            </Space>
          </div>
        </Form>
      </Card>
    </div>
  )
}